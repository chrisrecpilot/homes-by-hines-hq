# Plan: Update project locations to real Kent / East Sussex sites

The carousel and work page currently use fictional locations (Bath, Oxfordshire, Wiltshire, Suffolk, Cumbria). Replace them with the real locations you provided: **Orpington, Maidstone, Allington, Eastbourne**.

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

2. **`src/routes/work.tsx` (case studies)**
   - Apply the same four locations to the five project case studies.

3. **Optional consistency tweak**
   - Update the homepage stats band from `South & East — Counties covered` to `Kent & East Sussex — Counties covered`, since the real locations sit in that region.

4. **Verification**
   - Run the build check and a quick browser screenshot pass to confirm the new locations render correctly in the carousel and case-study list.

## Not in scope

- Project names remain placeholder-style until you provide real ones.
- No new images or components; this is a content-only update.
