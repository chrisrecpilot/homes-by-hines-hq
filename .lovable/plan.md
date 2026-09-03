# Plan: Update project locations and add before/after photography

The carousel and work page currently use fictional locations (Bath, Oxfordshire, Wiltshire, Suffolk, Cumbria). Replace them with the real locations you provided: **Orpington, Maidstone, Allington, Eastbourne, Benfleet**. Each project case study also needs a before image paired with its existing after image.

## What will change

1. **`src/routes/index.tsx` (homepage carousel)**
   - Map the six slides to the real locations, reusing locations where needed until more are provided:
     - Albany Terrace → Orpington
     - No. 12 Sydney Place → Maidstone
     - Chapel Lane → Allington
     - Millstream House → Eastbourne
     - Weaver's Row → Benfleet
     - Fell Cottage → Orpington
   - Update `meta` strings and any captions that reference location.
   - Keep project names as placeholders unless you want to supply real names.

2. **Generate before-shot assets**
   - For each of the five case-study projects, create a matching `before` image that pairs with the existing `after` image:
     - Albany Terrace (Orpington): tired Georgian townhouse interior, subdivided bedsits, peeling plaster, stripped joinery.
     - Chapel Lane (Allington): dark galley kitchen and unstable lean-to, overgrown garden.
     - Weaver's Row (Benfleet): overgrown infill plot between two cottages, rubble and weeds.
     - Fell Cottage (Orpington): damp stone cottage, failing roof, cement pointing, neglected garden.
     - Millstream House (Eastbourne): partitioned back room, small window, dated kitchen units.
   - Save as `src/assets/project-X-before.jpg` to sit alongside the existing assets.

3. **`src/routes/work.tsx` (case studies)**
   - Apply the real locations to the five project case studies.
   - Rework each case study to show a before/after image pair side by side (or stacked on mobile) with labels, so the transformation is visible.
   - Keep the existing before/after text blocks alongside the new imagery.

4. **Optional consistency tweak**
   - Update the homepage stats band from `South & East — Counties covered` to `Kent & East Sussex — Counties covered`, since the real locations sit in that region.

5. **Verification**
   - Run the build check and a quick browser screenshot pass to confirm the new locations and before/after image pairs render correctly.

## Not in scope

- Project names remain placeholder-style until you provide real ones.
- The homepage carousel will continue to show the existing after images only; before shots are added to the case-study detail page.
