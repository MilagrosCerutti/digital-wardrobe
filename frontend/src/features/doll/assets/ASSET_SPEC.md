# My Doll — Illustrated Asset Specification

This document specifies the real, painted/illustrated character and clothing
assets needed to bring My Doll up to the visual fidelity of the Vestire-style
reference (soft realistic shading, rendered hair with highlights, fabric
texture and folds) — a register that hand-authored flat SVG cannot reach.
It exists so those assets can be produced externally (an illustrator, an
asset pack, or an image-generation tool) and dropped into the layering
architecture that is already built and working.

**Do not start illustrating until the pose, canvas, and layer breakdown below
are confirmed** — every asset must share the same canvas and anchor points or
they will not align on the doll.

---

## 1. What already exists and works today

The full interaction layer is built and does not need to change to receive
these assets:

- `MyDoll` / `DollCanvas` / `DollLayer` / `ClothingSelector` /
  `ClothingCategorySelector` / `ClothingItem` / `ColorSelector` /
  `DollControls` — the whole browsing, equipping, and color-swap UI.
- The dress-vs-top/bottom exclusivity rule, backend equip logic, and doll
  item catalog (`doll_items` table, admin management UI).
- The coordinate system every layer renders into (`assets/geometry.ts`).

Only the **visual content** of `assets/MasterBody.tsx`, `assets/Face.tsx`,
`assets/hair/*.tsx`, and `assets/garments/*.tsx` needs to be replaced —
their component signatures (`{ color }` prop in, SVG/JSX out) can stay the
same if the new assets are also SVG, or change to an `<img>`-based renderer
if the new assets are raster (see §6).

## 2. Canvas and pose

- **Canvas**: 300 × 600 (or any multiple of that 1:2 aspect ratio — e.g.
  600 × 1200 for higher-resolution source art, then exported/scaled to a
  300 × 600-equivalent coordinate space).
- **Pose**: front-facing, standing, arms relaxed at the sides with a small
  gap between the arm and torso (so sleeves/jackets have room to render
  without clipping into the body). No walking stride, no 3/4 turn — a
  straight-on paper-doll pose is what makes independently-authored garments
  align without per-item repositioning.
- **Framing**: full body, head to feet, centered horizontally at x = 150,
  with a small margin above the head and below the feet (roughly the top
  32px and bottom 20px of the 600-tall canvas are empty margin today).

## 3. Anchor points (must match across every asset)

These are the y-coordinates the current system already designs against
(`assets/geometry.ts`). New assets should keep the same anchors so the
existing garment-slot logic (waist for bottoms, shoulder for tops, etc.)
still lines up:

| Anchor | y |
|---|---|
| Shoulder line | 132 |
| Waist | 230 |
| Hip | 262 |
| Mini hem (skirts/dresses) | ~380 |
| Midi hem | ~460 |
| Ankle | 548 |

Horizontal center: x = 150.

## 4. Layer breakdown

Each of the following is one independent asset (or asset set, where a
appearance/color axis multiplies it — see §5):

1. **Base body** — nude/base silhouette, no clothing, tasteful (no explicit
   anatomical detail, consistent with a fashion-doll rather than an
   anatomical figure). This is the layer every garment sits on top of.
2. **Face** — eyes, brows, lips, blush, rendered on the base body's head.
3. **Hair** — one asset per hairstyle (see §5 for the color axis):
   `LONG`, `SHORT`, `PONYTAIL`, `BUN`.
4. **Garments** — one asset per silhouette below (color variants per §5):

   | Asset key | Category | Description |
   |---|---|---|
   | `top-tank` | Top | Fitted sleeveless tank |
   | `top-baby-tee` | Top | Cropped short-sleeve tee |
   | `top-cardigan` | Top | Cropped open-front cardigan, long sleeves |
   | `top-blouse` | Top | Blouse, gathered short sleeves, round collar |
   | `bottom-jeans` | Bottom | Straight-leg jeans, waist to ankle |
   | `bottom-skirt` | Bottom | A-line mini skirt |
   | `bottom-wide-leg` | Bottom | Wide-leg trousers |
   | `dress-slip` | Dress | Sleeveless slip dress, mid-thigh |
   | `dress-mini` | Dress | Fitted mini dress, gathered short sleeves |
   | `shoes-sneakers` | Shoes | Sneakers |
   | `shoes-flats` | Shoes | Ballet flats |
   | `shoes-boots` | Shoes | Platform boots |
   | `accessory-sunglasses` | Accessory | Worn on the face |
   | `accessory-bag` | Accessory | Shoulder/baguette bag, worn at hip |
   | `accessory-bow` | Accessory | Hair bow, worn at the crown |
   | `accessory-necklace` | Accessory | Worn at the collarbone |

   These 16 are the validated starter set. The requested expanded wardrobe
   (crop top, hoodie, sweater, mini/pleated/denim skirt, shorts, cargo
   pants, low-rise pants, casual/Y2K/party dress, platform sneakers,
   sandals, headband, earrings, belt, etc.) follows the same pattern —
   hold off producing those until the pose/canvas/layering approach above
   is confirmed with one full outfit, per the vertical-slice approach you
   specified.

## 5. Appearance and color axes

Two independent multipliers apply on top of the layer list in §4:

- **Body/appearance** (drives the base body + face + hair, not clothing):
  `bodyType` (SLIM/AVERAGE/CURVY) × `skinTone` (PORCELAIN/LIGHT/MEDIUM/TAN/
  DEEP) × `hairColor` (BLONDE/BROWN/BLACK/RED/PASTEL_PINK/PASTEL_LILAC) ×
  `eyeColor` (BROWN/BLUE/GREEN/HAZEL). See §6 for whether this needs full
  combinatorial rendering or can be done with tinting.
- **Garment color**: each garment in §4 should support a subset of this
  curated palette (not every garment needs every color — pick what's
  realistic for that silhouette):

  | Name | Hex |
  |---|---|
  | Pastel Pink | `#F2A7C3` |
  | Lilac | `#C9B6E8` |
  | Butter Yellow | `#F5E3B3` |
  | Baby Blue | `#A9C6E0` |
  | Cream | `#FCEEE3` |
  | White | `#F5F3EE` |
  | Soft Gray | `#D8D2C4` |
  | Denim | `#8FB4D9` |
  | Tan | `#D9B7A3` |
  | Black | `#2B2118` |

## 6. Format: the important fork

**This decision changes how much art needs to be produced, and it should be
made before any painting starts.**

### Option A — Layered vector (SVG), recolorable
If the new art is produced as SVG with clean, separate fill regions (not a
flattened raster export), the existing pattern keeps working exactly as
today: **one file per garment silhouette**, and color variants are applied
at render time via a `color` prop (a fill override), the same way
`assets/garments/TopTank.tsx` etc. work now. Body-type width scaling
(`MasterBody`'s non-uniform scale transform) also keeps working cleanly on
vector paths.
→ Lower total asset count. Requires the illustrator/tool to deliver
  clean, editable vector art (not "looks like a vector but is actually a
  flattened raster export"), and shading has to be done with gradients/
  vector techniques rather than freehand painting.

### Option B — Raster (PNG/WebP), pre-rendered
If true painted shading (the Reference-B look) requires a raster/painting
workflow, then **color can't be swapped at render time** — each curated
color variant needs its own exported file (e.g. `top-tank-pink.png`,
`top-tank-lilac.png`, `top-tank-white.png`), and body-type width scaling
either needs a separate render per body type or gets dropped/simplified.
→ Higher asset count (garments × colors, and potentially × body types),
  but achieves real painted fidelity per asset.
  All raster assets must be transparent PNG or WebP, exported at the same
  300×600-equivalent canvas and anchor points as §2–3, at 2x–3x resolution
  (e.g. 900×1800) for crisp rendering on high-DPI screens.

If the answer is Option B, tell me and I'll swap `DollLayer`/`ClothingItem`/
`MasterBody` from SVG-component rendering to `<img>`-based rendering — that
change is isolated to those few files and doesn't touch the selector UI,
equip logic, or data model.

## 7. File naming and delivery

Whichever format is chosen, name files after the existing `assetUrl` keys
so they drop in with minimal wiring:

```
assets/
└── doll/
    ├── base/           body-{skinTone}-{bodyType}.svg|png
    ├── face/            face-{eyeColor}.svg|png   (or baked into base)
    ├── hair/            hair-{style}-{hairColor}.svg|png
    └── garments/
        ├── top-tank-{color}.svg|png
        ├── bottom-jeans-{color}.svg|png
        └── ... (one per asset key in §4, per supported color)
```

## 8. What I can do in the meantime

Independent of this asset question, I can proceed now — without touching
any visual style — on the parts of your last request that are pure
architecture/interaction and don't depend on which option above you pick:

- Multiple simultaneous accessory slots (hair/face/neck/ear/bag) instead of
  today's one-accessory-total limit.
- Any data-model or catalog groundwork for the expanded wardrobe list.

Say the word and I'll scope that separately from this asset question.

---

## 9. DECIDED: Option B (painted raster) — Master Doll generation specification

Confirmed 2026-08-27: visual quality over runtime recoloring. Every doll
asset is a pre-rendered, painted, transparent PNG. Nothing in this section
is code — it is the brief to hand to an image-generation tool (whatever
produced `src/assets/homepage/doll.png` — Lovable's built-in generator,
ChatGPT/DALL-E, Midjourney, Firefly, etc.), plus the file contract the
generated PNGs must satisfy before they get wired into `DollLayer` /
`ClothingItem` / `MasterBody`.

### 9.1 Identity source — what to preserve from `doll.png`, and what not to

Attach `frontend/src/assets/homepage/doll.png` (704×1104, RGBA) as an
**image reference** to the generation tool alongside the text prompt below
— identity carries far better through image reference than through prose
alone. If the tool is text-only, use this description (read directly off
the file):

> Long, straight, center-parted hair in a warm balayage — light brown at
> the crown softening to a lighter caramel-blonde through the lengths, no
> visible bangs. Soft almond-shaped brown eyes, straight brows, softly
> blushed cheeks, glossy nude-pink lips, a calm neutral-friendly
> expression. Warm light-medium skin tone rendered with soft, painterly
> shading (not flat cel-fill). Elongated fashion-illustration proportions:
> long slender legs, narrow waist, long neck, small delicate hands and
> feet — Y2K pastel fashion-doll style, not anatomically literal.

**Carry over:** face shape and features, hair color/texture/style, skin
tone and rendering technique, body proportions, the soft-glam/pastel mood,
overall illustration technique (soft shading, clean linework, painterly
but not photoreal).

**Do NOT carry over:** the specific outfit (cream slip dress, pearl trim),
or the jewelry (hoop earrings, pink choker, hair clips) visible in
`doll.png`. Those are set-dressing from one hero shot, not part of the
character's base identity — the Master Doll must be generated with **no
permanent garment or accessory**, per §9.2, so every clothing/accessory
slot in §4 stays genuinely interchangeable. Necklace/earring-style
accessories get generated later as their own layers (§9.6), in the same
palette, for continuity — not baked into the base.

### 9.2 Master Doll base — requirements

- **Full body**, head to feet, nothing cropped.
- **Front-facing**, straight-on camera, no 3/4 turn, no tilt — orthographic
  flat view, no perspective distortion or foreshortening.
- **Neutral standing pose**: weight even on both legs, feet together or a
  few degrees apart, arms relaxed straight down at the sides with a small
  gap between arm and torso (room for sleeves/jackets to render without
  clipping), head level, gaze forward. No walking stride, no hand-on-hip,
  no props.
- **Transparent background.** No ground shadow, no floor, no vignette.
- **Base covering, not clothing**: a smooth, seamless, nude-toned fitted
  base layer (fashion-doll convention — like a paper doll's underlayer),
  tasteful, no explicit anatomical detail, no visible seams or pattern. It
  must read as "bare" for dress-up purposes, not as an outfit.
- **No jewelry, no hair accessories, no makeup beyond what's described in
  §9.1** — keep the silhouette clean for every later accessory slot.
- Polished 2D cartoon/fashion-illustration style: clean confident linework,
  soft intentional shading (form shadow + a soft highlight, not flat fill
  and not photoreal rendering), detailed hair with visible strand flow and
  soft highlights, coherent anatomy at fashion-illustration proportions.
- **Explicitly avoid**: geometric/primitive shapes, circle-and-stick
  construction, generic default-AI-avatar look, plastic/3D-render look,
  photorealism, chibi/super-deformed proportions.

**Draft prompt** (pair with the `doll.png` image reference):

```
A single full-body 2D fashion illustration of an original female
character, front-facing, centered, neutral standing pose, arms relaxed
at her sides, feet together, straight-on camera angle with no
perspective distortion. Transparent background, no shadow, no floor.

Character identity — matching the attached reference image exactly:
long straight center-parted balayage hair (light brown to caramel-blonde),
soft brown almond eyes, straight brows, softly blushed cheeks, glossy
nude-pink lips, warm light-medium skin tone, calm friendly expression,
slender elongated fashion-illustration proportions (long legs, narrow
waist, long neck).

She wears only a smooth seamless nude-toned fitted base layer — no
dress, no jewelry, no shoes, no hair accessories, no makeup beyond the
above — designed as the bare base figure of a dress-up paper-doll system.

Style: polished 2D cartoon fashion illustration, clean confident
linework, soft intentional cel-and-form shading, painterly rendered hair
with visible strand flow and soft highlights, Y2K pastel fashion-doll
aesthetic, soft diffused studio lighting from slightly above and in
front of the subject, minimal directional shadow. Not geometric, not a
primitive vector shape, not a generic AI-avatar, not photorealistic, not
chibi.

Canvas 900×1800px, PNG, transparent background, character vertically
centered with roughly 6% empty margin above the head and 8% below the
feet, full body filling the remaining height.
```

### 9.3 What must stay identical across every asset (base, hair, clothing, shoes, accessories)

This is what makes independently-generated layers stack correctly. Every
single generation — base and every later item — must share:

| Property | Value |
|---|---|
| Canvas size | 900×1800px (3× the existing 300×600 coordinate space `DollCanvas`/`geometry.ts` already use — keeps the current anchor math valid) |
| Character placement | Centered horizontally at x = 450 (canvas center) |
| Scale | Character height fills the same vertical span every time — head top ≈ 6% from canvas top, feet ≈ 92% from canvas top |
| Pose | The exact neutral standing pose in §9.2 — never regenerate the pose per item |
| Perspective/camera | Flat front-on, no rotation, no lens distortion |
| Body proportions | Identical skeleton/proportions to the Master Doll base |
| Anchor points (scaled ×3 from `geometry.ts`) | Shoulder line y=396, waist y=690, hip y=786, mini hem ~y=1140, midi hem ~y=1380, ankle y=1644 |
| Lighting direction | Soft diffused light from slightly above/front, same soft highlight side on hair and fabric every time — inconsistent lighting between layers reads as a compositing error even when alignment is perfect |
| Illustration style | Same linework weight, same shading technique (soft cel/form shading), same rendering "hand" as the Master Doll |

**Known limitation — be honest about this before generating anything:**
prompting alone does not guarantee pixel-perfect alignment between
separately-generated images, even with identical prompts. The practical
mitigation: whenever the generation tool supports **image-to-image /
"edit this image"** (using the Master Doll PNG itself as the input image
and asking only for the garment to be added/changed, rather than a fresh
text-to-image generation per item), use that — it's the closest thing to
a guarantee of matching pose/scale/proportions. Where only text-to-image
is available, generate, then visually check each new layer against the
Master Doll at 50% opacity before treating it as final; misaligned items
get regenerated or manually nudged, not shipped.

### 9.4 How clothing/accessory layers must be generated for compositing

Each garment/accessory is its **own separate PNG**, same 900×1800 canvas,
transparent everywhere except the garment itself — **not** a full render
of the doll wearing it. Concretely:

- Generate (or image-to-image edit) the **Master Doll wearing the item**,
  then the garment region is isolated onto a transparent canvas at the
  same 900×1800 dimensions with the doll's body erased back to
  transparent — the garment PNG, alone, sitting at the exact pixel
  position it occupied on the doll.
- The garment must include only its own shading (cast on itself, and a
  soft contact shadow where it meets the body, e.g. under a collar or
  waistband) — it should not carry a duplicate of the doll's arm/leg
  underneath it.
- Layer order on screen (bottom to top): Master Doll base → hair-back
  (if the hairstyle has strands behind the shoulders) → top/dress →
  bottom (skip if dress) → shoes → hair-front → accessories. This matches
  today's `layer` field on `DollItem` — keep using it.

### 9.5 Vertical-slice test outfit (this round only)

Generate exactly these 5 items to validate the whole pipeline — alignment,
lighting match, style match — before producing anything else:

| Asset key | Category | Description | Color (this round) |
|---|---|---|---|
| `top-tank` | Top | Fitted sleeveless tank | Cream `#FCEEE3` |
| `bottom-skirt` | Bottom | A-line mini skirt | Pastel Pink `#F2A7C3` |
| `shoes-flats` | Shoes | Ballet flats | Cream `#FCEEE3` |
| `accessory-bag` | Accessory | Shoulder/baguette bag | Pastel Pink `#F2A7C3` |
| `accessory-sunglasses` | Accessory | Worn on the face | Soft Gray `#D8D2C4` (tinted lens) |

One color each, matching the existing curated palette in §5. **Stop here
— do not generate the rest of the 16-item starter set or any color
variant beyond this, until these 5 are confirmed aligned and on-style.**

### 9.6 Base vs. hair vs. clothing vs. shoes vs. accessories vs. color variants — the taxonomy

These are genuinely different asset classes with different regeneration
rules:

- **Master Doll base** — one painted body+face render per
  `skinTone × bodyType` combination (§9.7). This is the only layer that
  includes the face.
- **Hair** — its own transparent layer, never baked into the base, so it
  can be swapped independently. One render per `hairStyle × hairColor`
  combination (§9.7) — hair silhouette and hair color are both painted,
  not tinted.
- **Clothing (tops/bottoms/dresses)** — one render per garment silhouette
  × supported color, per §9.4/§9.5.
- **Shoes** — same rule as clothing; note shoes sit low enough that they
  don't interact with body-type width scaling the way tops/bottoms do.
- **Accessories** (bag, sunglasses, bow, necklace, and later
  earrings/belt/etc.) — same rule as clothing; these render on top of
  everything else per the layer order in §9.4.
- **Color variants** — never a runtime tint under Option B. Each curated
  color in §5 that a given garment supports is its own fully-painted PNG,
  generated (or image-to-image edited) from the same base render so the
  silhouette and shading technique stay identical and only the fabric
  color changes.

### 9.7 Skin tone / hair color / eye color under the raster approach

Painted shading means these can't be a CSS/SVG color swap — each is a
real regeneration, and the combinatorics are a genuine cost of Option B
that's worth being upfront about:

- **Skin tone** (`PORCELAIN/LIGHT/MEDIUM/TAN/DEEP`) changes the base body
  render itself — skin shading, undertone, and how light falls on it all
  shift with tone, not just a flat hue. This is baked into the
  **Master Doll base**, so it's `skinTone × bodyType` = up to 15 base
  renders (5 tones × 3 body types) if you want every combination on day
  one. **Recommendation: generate `AVERAGE` body type across all 5 skin
  tones first (5 renders)**, confirm those look right, then fill in
  `SLIM`/`CURVY` afterward — don't generate all 15 in the first pass.
- **Hair color** (`BLONDE/BROWN/BLACK/RED/PASTEL_PINK/PASTEL_LILAC`) is
  also a real repaint, not a tint — hair has its own rendered highlights
  and shadow structure that read differently per color (e.g. black hair's
  highlight is a sharp specular streak; blonde's is a broad soft glow).
  This is `hairStyle × hairColor` = up to 24 renders (4 styles × 6
  colors) for full coverage. **Recommendation: generate `LONG` (the
  identity style from `doll.png`) across all 6 colors first**, validate,
  then do the other 3 styles.
- **Eye color** (`BROWN/BLUE/GREEN/HAZEL`) is the one axis that's cheap
  even under Option B: rather than a full base re-render per eye color,
  generate a **small iris-only overlay** — just the colored iris shape at
  the exact pixel position it sits at on the Master Doll base, transparent
  everywhere else, composited on top of the base at render time. 4 small
  overlays instead of 4 full-body re-renders. This needs the iris center
  coordinates measured once off the confirmed Master Doll base (I can
  help pin those down once the base PNG exists).

Per your point 12: this file-count cost is accepted and expected — the
brief prioritizes visual consistency and painted quality over minimizing
asset count. Don't let regeneration cost pressure a shortcut into flat
tinting; that's the SVG approach we already ruled out.

### 9.8 File contract — dimensions, transparency, naming, folders

```
frontend/src/features/doll/assets/doll/
├── base/
│   └── body-{skinTone}-{bodyType}.png        e.g. body-medium-average.png
├── hair/
│   └── hair-{hairStyle}-{hairColor}.png      e.g. hair-long-brown.png
├── eyes/
│   └── eye-{eyeColor}.png                    small iris-only overlay
└── garments/
    ├── top-tank-{color}.png                  e.g. top-tank-cream.png
    ├── bottom-skirt-{color}.png
    ├── shoes-flats-{color}.png
    ├── accessory-bag-{color}.png
    └── accessory-sunglasses-{color}.png
```

- **Format**: PNG-24 with alpha channel (RGBA) — no JPEG anywhere in this
  pipeline, no flattened/matte background.
- **Dimensions**: every file exactly 900×1800px, no exceptions — this is
  what lets the renderer stack layers with plain absolute positioning and
  no per-item offset math.
- **Naming**: lowercase-kebab, `{assetKey}-{color}.png` for garments,
  matching the `assetUrl` keys already defined in §4/§7 so they drop into
  the existing `doll_items` catalog rows with minimal wiring — this
  doesn't change from the original Option A plan.
- **Alignment QA before a file is considered "done"**: overlay it on the
  Master Doll base at 50% opacity in any image viewer; shoulder/waist/hip
  landmarks should visually match the anchor table in §9.3 within a few
  pixels. Anything off gets regenerated (ideally via image-to-image
  against the base) rather than shipped and fudged with CSS offsets.

When PNGs matching this contract exist, tell me and I'll do the actual
code change: swap `MasterBody`/`DollLayer`/`ClothingItem` from
SVG-component rendering to `<img>`/CSS-background rendering, positioned
via this same anchor table. That part is still untouched — no code has
changed as part of this specification.
