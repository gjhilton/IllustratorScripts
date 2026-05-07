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

### Paths to Sublayers `scripts/paths-to-sublayers.jsx`

Moves each selected path to a sublayer within a new named layer.

**Usage:** Select one or more paths, then run the script. A dialog shows the number of selected paths and lets you enter a layer name (e.g. `roads`) and a start index. Click **Make Layers** to create a top-level layer named `roads` containing a sublayer per path (`roads 1`, `roads 2`, …). On SVG export these become nested `<g>` elements with matching `id` attributes.

---

### Label Paths `scripts/label-paths.jsx`

Creates a centred text label for each selected path, using the path's source sublayer name as the label text.

**Usage:** Select one or more paths (typically after running Paths to Sublayers), then run the script. The dialog lets you set the labels layer name, sublayer prefix, font size, and RGB colour. Click **Make Labels** to create a new layer containing one sublayer per label, each holding a Helvetica text frame centred on the path's bounding-box centroid.
