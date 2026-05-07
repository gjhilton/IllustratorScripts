#target illustrator

(function () {
    var SCRIPT_NAME        = "Label Paths";
    var SCRIPT_VERSION     = "1.2";
    var SCRIPT_DESCRIPTION = "Creates a centred text label for each selected path.";

    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var doc = app.activeDocument;

    var paths = [];
    var sel = doc.selection;
    for (var i = 0; i < sel.length; i++) {
        if (sel[i].typename === "PathItem") {
            paths.push(sel[i]);
        }
    }

    if (paths.length === 0) {
        alert("No paths are selected.\nPlease select one or more paths and try again.");
        return;
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

    // Separator
    dlg.add("panel", undefined, undefined).preferredSize.height = 2;

    // Layer name
    var layerGroup = dlg.add("group");
    layerGroup.orientation   = "row";
    layerGroup.alignChildren = "center";
    layerGroup.add("statictext", undefined, "Layer name:");
    var layerInput = layerGroup.add("edittext", undefined, "Labels");
    layerInput.preferredSize.width = 150;

    // Sublayer prefix
    var prefixGroup = dlg.add("group");
    prefixGroup.orientation   = "row";
    prefixGroup.alignChildren = "center";
    prefixGroup.add("statictext", undefined, "Sublayer prefix:");
    var prefixInput = prefixGroup.add("edittext", undefined, "Label");
    prefixInput.preferredSize.width = 150;

    // Font size + bold
    var sizeGroup = dlg.add("group");
    sizeGroup.orientation   = "row";
    sizeGroup.alignChildren = "center";
    sizeGroup.add("statictext", undefined, "Font size:");
    var sizeInput = sizeGroup.add("edittext", undefined, "12");
    sizeInput.preferredSize.width = 60;
    var boldCheck = sizeGroup.add("checkbox", undefined, "Bold");
    boldCheck.value = false;

    // Colour (R G B)
    var colourGroup = dlg.add("group");
    colourGroup.orientation   = "row";
    colourGroup.alignChildren = "center";
    colourGroup.add("statictext", undefined, "Colour:");
    colourGroup.add("statictext", undefined, "R");
    var rInput = colourGroup.add("edittext", undefined, "0");
    rInput.preferredSize.width = 45;
    colourGroup.add("statictext", undefined, "G");
    var gInput = colourGroup.add("edittext", undefined, "0");
    gInput.preferredSize.width = 45;
    colourGroup.add("statictext", undefined, "B");
    var bInput = colourGroup.add("edittext", undefined, "0");
    bInput.preferredSize.width = 45;

    // Selected path count (read-only)
    var countGroup = dlg.add("group");
    countGroup.orientation   = "row";
    countGroup.alignChildren = "center";
    countGroup.add("statictext", undefined, "Selected paths:");
    var countDisplay = countGroup.add("statictext", undefined, String(paths.length));
    try {
        countDisplay.graphics.font = ScriptUI.newFont("dialog", ScriptUI.FontStyle.BOLD, 12);
    } catch (e) {}

    // Buttons
    var btnGroup = dlg.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignment   = "right";
    btnGroup.add("button", undefined, "Cancel").onClick = function () { dlg.close(); };
    var makeBtn = btnGroup.add("button", undefined, "Make Labels");
    dlg.defaultElement = makeBtn;

    function clamp255(v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

    makeBtn.onClick = function () {
        var layerName = layerInput.text.replace(/^\s+|\s+$/g, "");
        if (layerName.length === 0) { layerName = "Labels"; }

        var prefix = prefixInput.text.replace(/^\s+|\s+$/g, "");
        if (prefix.length === 0) { prefix = "Label"; }

        var fontSize = parseFloat(sizeInput.text);
        if (isNaN(fontSize) || fontSize <= 0) { fontSize = 12; }

        var rVal = parseInt(rInput.text, 10);
        var gVal = parseInt(gInput.text, 10);
        var bVal = parseInt(bInput.text, 10);
        var r = clamp255(isNaN(rVal) ? 0 : rVal);
        var g = clamp255(isNaN(gVal) ? 0 : gVal);
        var b = clamp255(isNaN(bVal) ? 0 : bVal);

        dlg.close();

        try {
            var colour = new RGBColor();
            colour.red   = r;
            colour.green = g;
            colour.blue  = b;

            var parentLayer = doc.layers.add();
            parentLayer.name = layerName;

            // Iterate in reverse so sublayer "1" ends up at the top of the stack.
            // layers.add() always inserts at the top, so the last-created sublayer
            // (index 0) will be topmost — reversing the loop corrects for this.
            for (var i = paths.length - 1; i >= 0; i--) {
                var subLayer = parentLayer.layers.add();
                subLayer.name = prefix + " " + (i + 1);

                var bounds = paths[i].geometricBounds; // [left, top, right, bottom]
                var cx = (bounds[0] + bounds[2]) / 2;
                var cy = (bounds[1] + bounds[3]) / 2;

                var tf = doc.textFrames.add();
                tf.contents = paths[i].layer.name;

                var attrs = tf.textRange.characterAttributes;
                try {
                    attrs.textFont = app.textFonts.getByName(boldCheck.value ? "Helvetica-Bold" : "Helvetica");
                } catch (e) {}
                attrs.size      = fontSize;
                attrs.fillColor = colour;

                tf.paragraphs[0].paragraphAttributes.justification = Justification.CENTER;

                // Centre the text frame on the path's bounding-box centroid.
                // geometricBounds gives the current text frame extents; translate
                // by the delta between its centre and the target centroid.
                var tb = tf.geometricBounds; // [left, top, right, bottom]
                tf.translate(cx - (tb[0] + tb[2]) / 2, cy - (tb[1] + tb[3]) / 2);

                tf.move(subLayer, ElementPlacement.PLACEATBEGINNING);
            }

            alert("Done. Created layer \"" + layerName + "\" with " + paths.length + " label" + (paths.length === 1 ? "." : "s."));
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    dlg.show();

})();
