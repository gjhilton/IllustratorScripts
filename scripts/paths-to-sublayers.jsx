#target illustrator

(function () {
    var SCRIPT_NAME        = "Paths to Sublayers";
    var SCRIPT_VERSION     = "1.3";
    var SCRIPT_DESCRIPTION = "Moves each selected path to a sublayer within a new named layer.";

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
    var sep = dlg.add("panel", undefined, undefined);
    sep.preferredSize.height = 2;

    // Prefix input
    var prefixGroup = dlg.add("group");
    prefixGroup.orientation   = "row";
    prefixGroup.alignChildren = "center";
    prefixGroup.add("statictext", undefined, "Layer name:");
    var prefixInput = prefixGroup.add("edittext", undefined, "Path");
    prefixInput.preferredSize.width = 150;

    // Start index input
    var indexGroup = dlg.add("group");
    indexGroup.orientation   = "row";
    indexGroup.alignChildren = "center";
    indexGroup.add("statictext", undefined, "Start index:");
    var indexInput = indexGroup.add("edittext", undefined, "0");
    indexInput.preferredSize.width = 60;

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
    var makeBtn = btnGroup.add("button", undefined, "Make Layers");
    dlg.defaultElement = makeBtn;

    makeBtn.onClick = function () {
        var prefix = prefixInput.text.replace(/^\s+|\s+$/g, "");
        if (prefix.length === 0) { prefix = "Path"; }
        var startIndex = parseInt(indexInput.text, 10);
        if (isNaN(startIndex) || startIndex < 0) { startIndex = 0; }
        dlg.close();

        try {
            var parentLayer = doc.layers.add();
            parentLayer.name = prefix;

            // Iterate in reverse so sublayer at startIndex ends up at the top of the stack.
            // layers.add() always inserts at the top, so the last-created sublayer
            // (index 0) will be topmost — reversing the loop corrects for this.
            for (var i = paths.length - 1; i >= 0; i--) {
                var subLayer = parentLayer.layers.add();
                subLayer.name = prefix + " " + (startIndex + i);
                paths[i].move(subLayer, ElementPlacement.PLACEATBEGINNING);
            }
            alert("Done. Created layer \"" + prefix + "\" with " + paths.length + " sublayer" + (paths.length === 1 ? "." : "s."));
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    dlg.show();

})();
