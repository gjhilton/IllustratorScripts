#target illustrator

(function () {
    var SCRIPT_NAME        = "Paths to Layers";
    var SCRIPT_VERSION     = "1.0";
    var SCRIPT_DESCRIPTION = "Moves each selected path to its own new layer.";

    if (app.documents.length === 0) {
        alert("No document is open.");
        return;
    }

    var doc = app.activeDocument;

    // Collect selected PathItems only
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
    dlg.orientation  = "column";
    dlg.alignChildren = "fill";
    dlg.spacing  = 10;
    dlg.margins  = 18;

    // Title + version
    var titleGroup = dlg.add("group");
    titleGroup.orientation  = "column";
    titleGroup.alignChildren = "center";
    titleGroup.spacing = 4;

    var titleText = titleGroup.add("statictext", undefined, SCRIPT_NAME + "  v" + SCRIPT_VERSION);
    try {
        titleText.graphics.font = ScriptUI.newFont("dialog", ScriptUI.FontStyle.BOLD, 13);
    } catch (e) {}

    titleGroup.add("statictext", undefined, SCRIPT_DESCRIPTION);

    // Separator
    var sep = dlg.add("panel", undefined, "");
    sep.preferredSize.height = 2;

    // Prefix input
    var prefixGroup = dlg.add("group");
    prefixGroup.orientation  = "row";
    prefixGroup.alignChildren = "center";
    prefixGroup.add("statictext", undefined, "Layer name prefix:");
    var prefixInput = prefixGroup.add("edittext", undefined, "Path");
    prefixInput.preferredSize.width = 150;

    // Selected path count (read-only)
    var countGroup = dlg.add("group");
    countGroup.orientation  = "row";
    countGroup.alignChildren = "center";
    countGroup.add("statictext", undefined, "Selected paths:");
    var countText = countGroup.add("statictext", undefined, String(paths.length));
    try {
        countText.graphics.font = ScriptUI.newFont("dialog", ScriptUI.FontStyle.BOLD, 12);
    } catch (e) {}

    // Buttons
    var btnGroup = dlg.add("group");
    btnGroup.orientation = "row";
    btnGroup.alignment   = "right";
    var cancelBtn = btnGroup.add("button", undefined, "Cancel");
    var makeBtn   = btnGroup.add("button", undefined, "Make Layers");
    makeBtn.active = true;

    cancelBtn.onClick = function () {
        dlg.close();
    };

    makeBtn.onClick = function () {
        var prefix = prefixInput.text.length > 0 ? prefixInput.text : "Path";
        dlg.close();

        for (var i = 0; i < paths.length; i++) {
            var newLayer = doc.layers.add();
            newLayer.name = prefix + " " + (i + 1);
            paths[i].move(newLayer, ElementPlacement.PLACEATBEGINNING);
        }

        alert("Done. Created " + paths.length + " layer" + (paths.length === 1 ? "." : "s."));
    };

    dlg.show();

})();
