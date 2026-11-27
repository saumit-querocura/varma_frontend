# Varma molecular discovery workspace

Varma is a static, browser-based research preview by QueroCura. The landing page introduces the platform and links to the molecular explorer at `workspace.html#explorer`. Existing workspace hash links also work from the root. Open `index.html` or serve the repository root with `python -m http.server`. The app uses local assets and requires no build step.

The landing page features three studio renders made from the reference conformers. Visitors can rotate each model, reveal the structural features in Pip’s field notes, or compare any two library compounds side by side.

The explorer includes six reference compounds with 3D conformers, molecular formulas, molecular weights, XLogP estimates and hydrogen bond counts from PubChem. Each compound profile links to its source record. Drag the model or focus it and use the arrow keys to rotate. The library supports search by name, class, formula and CID. Skeletal diagrams were drawn from the reference SMILES using RDKit. The 3D viewer shows connectivity, with custom element colours identified in its legend.

The notebook calculates statistics from three example observations in browser memory. The evidence studio and research lifecycle are illustrative workspaces. The preview has no accounts, backend connection or predictive model execution.

## Hosting

Publish from the repository root on GitHub Pages. Keep the configured custom domain and relative asset paths. The page sets a local-only content security policy and intentionally requests no indexing.

## Enterprise landing page

The landing page includes proposed company-level subscription prices (INR 1 crore annually or INR 10 lakh monthly), subject to agreement, with a no-royalty commercial proposition. Enterprise links open email drafts addressed to QueroCura's published contact address. No lead data is collected, sent or stored by the static site; no checkout, registration or paid features are represented as available. The preview remains intentionally noindex pending a launch decision.

The research walkthrough on the landing page compares three pairs of existing reference compounds using the same local descriptor records as the explorer. Signed differences are A minus B. The walkthrough is descriptive and does not predict efficacy, safety or binding.
