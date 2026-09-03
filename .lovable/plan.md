# Real photos, taller frames, before/after crossfades

## 1. New project: Maidstone kitchen

Add a real case study using the four uploaded photos (two before, two after):

- Name: Kitchen redesign, Maidstone
- Meta: `Full kitchen redesign · Maidstone · 2 months`
- Before: cramped cream cabinets, laminate worktops, tiled splashbacks and a dark
  cooker recess, with the room split by the original partition.
- After: shaker units in soft grey, marble-effect worktops and a full-height
  bank of cabinetry, herringbone floor, brass tap and belfast sink, with a
  seating peninsula opening onto the garden doors.

The homepage carousel gains this project's strongest after photo as a slide.

## 2. Garden project duration

`Garden landscaping · East London · 3 weeks` becomes `1 week`, on the Work page
and anywhere else that duration appears.

## 3. Less cropping — taller frames

Before/after frames on the Work page go from the near-square 4:3 to full
portrait 3:4, so much more of each photo is visible. Landscape source photos
(the kitchen shots, and the existing generated project images) keep a landscape
frame so they aren't cut down the sides — the shape follows each photo, with the
same taller, less-cropped intent.

## 4. Crossfade instead of hover zoom

Each before slot and each after slot accepts multiple photos and slowly
crossfades between them (roughly 4 seconds per image, ~1.2s fade), replacing the
hover scale effect. Slots with a single photo stay static. Fades pause for
users who prefer reduced motion.

## Technical notes

- New `src/components/photo-fade.tsx`: takes an array of image URLs plus alt
  text and aspect class, stacks them absolutely, cycles the active index on an
  interval, and animates opacity. Respects `prefers-reduced-motion`.
- The four uploads become CDN asset pointers in `src/assets` via
  `lovable-assets create`; no binaries land in the repo.
- `src/routes/work.tsx`: project entries change `image`/`beforeImage` to
  `after: string[]` / `before: string[]` plus an `orientation` field; the
  before/after grid renders `PhotoFade` for each side.
- `src/routes/index.tsx`: add the Maidstone kitchen slide, and update the "seven
  projects" copy count.
- Verify with a typecheck, a build, and a browser pass on `/` and `/work`.
