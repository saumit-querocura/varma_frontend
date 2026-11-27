# Varma molecular discovery workspace

Varma is a static, browser-based research preview by QueroCura. The landing page introduces the platform and links to the molecular explorer at `workspace.html#explorer`. Existing workspace hash links also work from the root. Open `index.html` or serve the repository root with `python -m http.server`. The app uses local assets and requires no build step.

The explorer includes six reference compounds with 3D conformers, molecular formulas, molecular weights, XLogP estimates and hydrogen bond counts from PubChem. Each compound profile links to its source record. Drag the model or focus it and use the arrow keys to rotate. The library supports search by name, class, formula and CID. Skeletal diagrams were drawn from the reference SMILES using RDKit. The 3D viewer shows connectivity, with custom element colours identified in its legend.

The notebook calculates statistics from three example observations in browser memory. The evidence studio and research lifecycle are illustrative workspaces. The preview has no accounts, backend connection or predictive model execution.

## Hosting

Publish from the repository root on GitHub Pages. Keep the configured custom domain and relative asset paths. The page sets a local-only content security policy and intentionally requests no indexing.
