#target illustrator

(function () {
    var SCRIPT_NAME        = "Paths to Layers";
    var SCRIPT_VERSION     = "1.1";
    var SCRIPT_DESCRIPTION = "Moves each selected path to its own new layer.";

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
    prefixGroup.add("statictext", undefined, "Layer name prefix:");
    var prefixInput = prefixGroup.add("edittext", undefined, "Path");
    prefixInput.preferredSize.width = 150;

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
        dlg.close();

        try {
            // Iterate in reverse so layer "1" ends up at the top of the stack.
            // doc.layers.add() always inserts at the top, so the last-created layer
            // (index 0) will be topmost — reversing the loop corrects for this.
            for (var i = paths.length - 1; i >= 0; i--) {
                var newLayer = doc.layers.add();
                newLayer.name = prefix + " " + (i + 1);
                paths[i].move(newLayer, ElementPlacement.PLACEATBEGINNING);
            }
            alert("Done. Created " + paths.length + " layer" + (paths.length === 1 ? "." : "s."));
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    dlg.show();

})();
