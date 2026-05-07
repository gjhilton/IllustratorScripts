# IllustratorScripts

JavaScript (ExtendScript) automation scripts for Adobe Illustrator 2026, focused on map drawing and editing workflows.

## Deploying Scripts

Copy all scripts to Illustrator's Scripts folder:

```bash
./deploy.sh
```

Scripts then appear under **File > Scripts** in Illustrator. Alternatively, run any script on demand via **File > Scripts > Other Script…**.

---

## Scripts

### Paths to Layers `scripts/paths-to-layers.jsx`

Moves each selected path onto its own new layer.

**Usage:** Select one or more paths, then run the script. A dialog shows the number of selected paths and lets you set a layer name prefix (e.g. `Road` → layers named `Road 1`, `Road 2`, …). Click **Make Layers** to create the layers at the top of the layer stack.
