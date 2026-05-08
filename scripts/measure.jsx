#target illustrator

(function () {
    var SCRIPT_NAME        = "Measure";
    var SCRIPT_VERSION     = "1.1";
    var SCRIPT_DESCRIPTION = "Calculates real-world area and perimeter of selected paths using a scale marker.";

    var UNITS = [
        { label: "chains",  factor: 20.1168  },
        { label: "metres",  factor: 1        },
        { label: "km",      factor: 1000     },
        { label: "feet",    factor: 0.3048   },
        { label: "yards",   factor: 0.9144   },
        { label: "miles",   factor: 1609.344 }
    ];

    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var doc = app.activeDocument;
    var items = [];
    var sel = doc.selection;
    for (var i = 0; i < sel.length; i++) {
        if (sel[i].typename === "PathItem" || sel[i].typename === "CompoundPathItem") {
            items.push(sel[i]);
        }
    }

    if (items.length === 0) {
        alert("No paths are selected.\nPlease select one or more closed paths and try again.");
        return;
    }

    // --- Helpers ---

    function findLayerByName(layers, name) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].name === name) { return layers[i]; }
            var found = findLayerByName(layers[i].layers, name);
            if (found) { return found; }
        }
        return null;
    }

    function getAreaSqPts(item) {
        if (item.typename === "PathItem") {
            return Math.abs(item.area);
        }
        var sum = 0;
        for (var j = 0; j < item.pathItems.length; j++) {
            sum += item.pathItems[j].area; // signed — inner paths (holes) are negative
        }
        return Math.abs(sum);
    }

    // Exact for straight-segment paths; approximation for curves (ignores control handles).
    function getPerimeterPts(item) {
        var total = 0;
        var pathList = (item.typename === "CompoundPathItem") ? item.pathItems : [item];
        for (var p = 0; p < pathList.length; p++) {
            var pts      = pathList[p].pathPoints;
            var segments = pathList[p].closed ? pts.length : pts.length - 1;
            for (var k = 0; k < segments; k++) {
                var a = pts[k].anchor;
                var b = pts[(k + 1) % pts.length].anchor;
                total += Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
            }
        }
        return total;
    }

    function formatNumber(n) {
        var fixed    = n.toFixed(2).split(".");
        var intPart  = fixed[0];
        var neg      = intPart.charAt(0) === "-";
        if (neg) { intPart = intPart.slice(1); }
        var out = "";
        for (var i = 0; i < intPart.length; i++) {
            if (i > 0 && (intPart.length - i) % 3 === 0) { out += ","; }
            out += intPart[i];
        }
        return (neg ? "-" : "") + out + "." + fixed[1];
    }

    function padRight(str, width) {
        str = String(str);
        while (str.length < width) { str = str + " "; }
        return str;
    }

    function padLeft(str, width) {
        str = String(str);
        while (str.length < width) { str = " " + str; }
        return str;
    }

    // --- Dialog ---
    var dlg = new Window("dialog", SCRIPT_NAME);
    dlg.orientation   = "column";
    dlg.alignChildren = "fill";
    dlg.spacing       = 10;
    dlg.margins       = 18;

    // Header
    var headerGroup = dlg.add("group");
    headerGroup.orientation   = "column";
    headerGroup.alignChildren = "center";
    headerGroup.spacing       = 4;

    var titleText = headerGroup.add("statictext", undefined, SCRIPT_NAME + " v" + SCRIPT_VERSION);
    try {
        titleText.graphics.font = ScriptUI.newFont("dialog", ScriptUI.FontStyle.BOLD, 13);
    } catch (e) {}

    headerGroup.add("statictext", undefined, SCRIPT_DESCRIPTION);

    dlg.add("panel", undefined, undefined).preferredSize.height = 2;

    // Scale layer name
    var scaleLayerGroup = dlg.add("group");
    scaleLayerGroup.orientation   = "row";
    scaleLayerGroup.alignChildren = "center";
    scaleLayerGroup.add("statictext", undefined, "Scale layer name:");
    var scaleLayerInput = scaleLayerGroup.add("edittext", undefined, "Scale");
    scaleLayerInput.preferredSize.width = 120;

    // Scale length + unit
    var scaleLenGroup = dlg.add("group");
    scaleLenGroup.orientation   = "row";
    scaleLenGroup.alignChildren = "center";
    scaleLenGroup.add("statictext", undefined, "Scale length:");
    var scaleLenInput = scaleLenGroup.add("edittext", undefined, "10");
    scaleLenInput.preferredSize.width = 70;

    var unitLabels = [];
    for (var u = 0; u < UNITS.length; u++) { unitLabels.push(UNITS[u].label); }
    var unitDropdown = scaleLenGroup.add("dropdownlist", undefined, unitLabels);
    unitDropdown.selection = 0; // chains

    // Output option
    var outputGroup = dlg.add("group");
    outputGroup.orientation   = "row";
    outputGroup.alignChildren = "center";
    outputGroup.add("statictext", undefined, "Output:");
    var radioDialog = outputGroup.add("radiobutton", undefined, "Dialog");
    var radioFrame  = outputGroup.add("radiobutton", undefined, "Text frame");
    radioFrame.value = true;

    // Selected item count (read-only)
    var countGroup = dlg.add("group");
    countGroup.orientation   = "row";
    countGroup.alignChildren = "center";
    countGroup.add("statictext", undefined, "Selected paths:");
    var countDisplay = countGroup.add("statictext", undefined, String(items.length));
    try {
        countDisplay.graphics.font = ScriptUI.newFont("dialog", ScriptUI.FontStyle.BOLD, 12);
    } catch (e) {}

    // Buttons
    var btnGroup = dlg.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignment   = "right";
    btnGroup.add("button", undefined, "Cancel").onClick = function () { dlg.close(); };
    var calcBtn = btnGroup.add("button", undefined, "Calculate");
    dlg.defaultElement = calcBtn;

    calcBtn.onClick = function () {
        var scaleLayerName = scaleLayerInput.text.replace(/^\s+|\s+$/g, "");
        if (scaleLayerName.length === 0) { scaleLayerName = "Scale"; }

        var scaleValue = parseFloat(scaleLenInput.text);
        if (isNaN(scaleValue) || scaleValue <= 0) { scaleValue = 10; }

        var unitFactor = UNITS[unitDropdown.selection.index].factor;
        var useDialog  = radioDialog.value;

        dlg.close();

        try {
            // Locate scale line
            var scaleLayer = findLayerByName(doc.layers, scaleLayerName);
            if (!scaleLayer) {
                alert("Scale layer \"" + scaleLayerName + "\" not found.");
                return;
            }
            if (scaleLayer.pathItems.length === 0) {
                alert("No paths found on layer \"" + scaleLayerName + "\".");
                return;
            }
            var scalePath   = scaleLayer.pathItems[0];
            var pp          = scalePath.pathPoints;
            var p0          = pp[0].anchor;
            var p1          = pp[pp.length - 1].anchor;
            var scaleLenPts = Math.sqrt(Math.pow(p1[0] - p0[0], 2) + Math.pow(p1[1] - p0[1], 2));
            if (scaleLenPts === 0) {
                alert("The scale path has zero length.");
                return;
            }

            // Scale factors
            var realLenM   = scaleValue * unitFactor;
            var mPerPt     = realLenM / scaleLenPts;
            var m2PerSqPt  = mPerPt * mPerPt;

            // Per-item calculations
            var labels     = [];
            var areas      = [];
            var perims     = [];
            var totalArea  = 0;
            var totalPerim = 0;

            for (var i = 0; i < items.length; i++) {
                labels.push(items[i].layer.name);
                var a = getAreaSqPts(items[i])   * m2PerSqPt;
                var p = getPerimeterPts(items[i]) * mPerPt;
                areas.push(a);
                perims.push(p);
                totalArea  += a;
                totalPerim += p;
            }

            // Build output text
            var COL_L = 16;
            var COL_N = 15;
            var sepLen = COL_L + (COL_N + 3) + (COL_N + 2);
            var SEP = "";
            for (var s = 0; s < sepLen; s++) { SEP += "─"; }

            var lines = [];
            lines.push(padRight("", COL_L) + padLeft("Area", COL_N + 3) + padLeft("Perimeter", COL_N + 2));
            for (var i = 0; i < items.length; i++) {
                lines.push(
                    padRight(labels[i], COL_L) +
                    padLeft(formatNumber(areas[i])  + " m²", COL_N + 3) +
                    padLeft(formatNumber(perims[i]) + " m",       COL_N + 2)
                );
            }
            lines.push(SEP);
            lines.push(
                padRight("Total", COL_L) +
                padLeft(formatNumber(totalArea)  + " m²", COL_N + 3) +
                padLeft(formatNumber(totalPerim) + " m",       COL_N + 2)
            );
            lines.push(padRight("", COL_L) + "(" + formatNumber(totalArea / 10000) + " ha)");
            var outputText = lines.join("\n");

            if (useDialog) {
                var resDlg = new Window("dialog", "Results — " + SCRIPT_NAME);
                resDlg.orientation   = "column";
                resDlg.alignChildren = "fill";
                resDlg.margins       = 18;
                resDlg.spacing       = 10;

                var resText = resDlg.add("edittext", undefined, outputText);
                resText.multiline     = true;
                var dlgHeight = Math.min(500, Math.max(150, (items.length + 6) * 16));
                resText.preferredSize = [540, dlgHeight];
                try {
                    resText.graphics.font = ScriptUI.newFont("SF Mono", ScriptUI.FontStyle.REGULAR, 12);
                } catch (e) {}

                resDlg.add("button", undefined, "Close").onClick = function () { resDlg.close(); };
                resDlg.show();

            } else {
                // Centre text frame on the combined bounding box of all selected items
                var bx = items[0].geometricBounds.slice(); // [left, top, right, bottom]
                for (var i = 1; i < items.length; i++) {
                    var b = items[i].geometricBounds;
                    if (b[0] < bx[0]) { bx[0] = b[0]; }
                    if (b[1] > bx[1]) { bx[1] = b[1]; }
                    if (b[2] > bx[2]) { bx[2] = b[2]; }
                    if (b[3] < bx[3]) { bx[3] = b[3]; }
                }
                var cx = (bx[0] + bx[2]) / 2;
                var cy = (bx[1] + bx[3]) / 2;

                // Add a new unlocked layer so the text frame always has a writable target.
                var outputLayer = doc.layers.add();
                outputLayer.name = "Measure";

                var tf = outputLayer.textFrames.add();
                tf.contents = outputText;
                try {
                    tf.textRange.characterAttributes.textFont = app.textFonts.getByName("SFMono-Regular");
                } catch (e) {}
                tf.textRange.characterAttributes.size = 10;

                var tb = tf.geometricBounds;
                tf.translate(cx - (tb[0] + tb[2]) / 2, cy - (tb[1] + tb[3]) / 2);
            }

        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    dlg.show();

})();
