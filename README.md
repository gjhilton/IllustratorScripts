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

Moves each selected path or compound path to its own sublayer within a new named layer.

**Usage:** Select one or more paths or compound paths, then run the script.

| Dialog option | Description |
|---|---|
| Layer name | Name of the new top-level layer (e.g. `roads`) |
| Start index | Starting number for sublayer names (e.g. `5` → `roads 5`, `roads 6`, …) |

Click **Make Layers**. A top-level layer is created at the top of the stack containing one sublayer per selected item. On SVG export (Object IDs: Layer Names) these become nested `<g>` elements with matching `id` attributes.

---

### Label Paths `scripts/label-paths.jsx`

Creates a centred Helvetica text label for each selected path. The label text is taken from the name of the sublayer the path currently lives on — designed to be used after **Paths to Sublayers**.

**Usage:** Select one or more paths, then run the script.

| Dialog option | Description |
|---|---|
| Layer name | Name of the new top-level layer that holds all labels |
| Sublayer prefix | Prefix for each label's sublayer (e.g. `Label 1`, `Label 2`, …) |
| Font size | Point size of the label text |
| Bold | Use Helvetica Bold |
| Colour | RGB fill colour of the text (0–255 per channel) |
| Background rectangle | Optionally draw a filled rectangle behind each label |
| BG colour | RGB fill colour of the background rectangle |
| Margin | Padding in points between the text bounds and the rectangle edge |

Click **Make Labels**. A new layer is created at the top of the stack containing one sublayer per label, each holding a text frame centred on the bounding-box centroid of its source path. On SVG export (Object IDs: Layer Names) these become nested `<g>` elements.

---

### Calculate Area `scripts/calculate-area.jsx`

Calculates the real-world area and perimeter of selected paths using a scale marker line on a named layer. Handles both simple paths and compound paths (with holes).

**Usage:** Draw a straight line on a dedicated layer (e.g. `Scale`) representing a known real-world distance. Select the paths to measure, then run the script.

| Dialog option | Description |
|---|---|
| Scale layer name | Name of the layer containing the scale marker line |
| Scale length | The real-world distance the scale line represents |
| Unit | Unit of the scale length: chains (default), metres, km, feet, yards, miles |
| Output | **Dialog** — show results in a copyable window; **Text frame** — place results on the canvas |

Click **Calculate**. Results are shown per path (using each path's sublayer name as the label) with a grand total:

```
                  Area          Perimeter
road 1       1,234.56 m²         456.78 m
road 2         890.12 m²         321.45 m
─────────────────────────────────────────
Total        2,124.68 m²         778.23 m
             (0.21 ha)
```

> **Note:** Perimeter is calculated as the sum of chord lengths between anchor points. This is exact for straight-segment paths and an approximation for curved paths.
