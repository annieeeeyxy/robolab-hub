# RoboLab Hub — Design Reference

The visual and interaction language established on the hero page (`/`), written
so another agent can build the remaining pages to match.

Treat everything under **Rules** as binding. Everything under **Rationale** is
there so you can tell when a rule stops applying, rather than cargo-culting it.

---

## 1. Theme: dark only

There is **no light mode**. There is no `ThemeContext`, no theme toggle, no
`dark:` variant, and no `prefers-color-scheme` branch. `@custom-variant dark` has
been removed from `globals.css`.

**Rules**

- Never introduce a `dark:` utility. A single palette means the variant can only
  ever restate the base class.
- Never read a colour as a hex literal in a component. Read a token.
- `colorScheme: "dark"` is declared once on `<html>` in `layout.tsx`, which is
  what makes native controls and scrollbars render dark from first paint.

### Tokens (`src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--page` | `#0b0c10` | page background behind everything |
| `--surface` | `#12151c` | cards, the nav bar |
| `--surface-2` | `#171b24` | inset surfaces inside a card |
| `--foreground` | `#f5f5f5` | primary text |
| `--muted` | `#97a2ad` | secondary text, descriptions |
| `--line` | `rgba(255,255,255,.1)` | hairline borders |
| `--brand-prompt` | `#f472b6` | **RoboPrompt — pink** |
| `--brand-ftc` | `#22d3ee` | **RoboLab FTC — cyan** |

Exposed as Tailwind utilities through `@theme inline`: `bg-page`, `bg-surface`,
`text-foreground`, `text-muted`, `border-line`, `text-prompt`, `border-prompt`,
`text-ftc`, `border-ftc`.

### Brand colour is per product, not decorative

Pink means RoboPrompt. Cyan means RoboLab FTC. Anything neutral (About, Team,
generic nav) uses `foreground`/`muted`.

**Rule:** never use pink on an FTC surface or cyan on a RoboPrompt surface, and
never introduce a third accent to mean "active". The hero encodes this as a
lookup rather than a conditional:

```ts
const ACCENT: Record<TargetId, { border: string; text: string }> = {
  prompt: { border: "border-prompt", text: "text-prompt" },
  ftc:    { border: "border-ftc",    text: "text-ftc" },
  about:  { border: "border-foreground/70", text: "text-foreground" },
};
```

Copy that shape for any new surface that highlights per product.

---

## 2. Type

**One family: Iosevka Custom**, a custom build (see
`src/app/fonts/iosevka-build-plan.toml`), wired as *both* `--font-sans` and
`--font-mono`. The whole site is monospace; that is the point, not an oversight.

Weights available: **100 / 400 / 700**, upright and italic. Nothing else exists —
`font-semibold` (600) will be synthesised and look wrong.

**Rules**

- Headings and brand names: `font-bold`.
- Body and descriptions: default weight, `text-muted`.
- Small labels / eyebrows / CTAs: `font-mono text-[10px] uppercase
  tracking-[.18em]` in the relevant accent colour.
- No display face. Linkara was removed (personal-use licence, public repo).

---

## 3. The ASCII treatment

Big type is not rendered as text. It is rendered by `src/components/ASCIIText.jsx`
as a WebGL plane, sampled to a character grid, and printed into a `<pre>`.

**Rules**

- Use it for **page titles and project names only.** Never for body copy — it is
  a WebGL context per instance and unreadable below ~13 character rows.
- Always `align="left"`.
- Give it a **fixed, explicitly sized parent** (`relative h-20 w-[22rem]`). It
  positions itself `absolute; width:100%; height:100%`.
- Break long titles with `\n` into roughly even lines. A single long line forces
  a very wide plane and the text ends up only a few rows tall and illegible.
- Budget **~13+ character rows** for the text. Row count is
  `containerHeight / asciiFontSize`. This is why the nav wordmark is *not*
  ASCII: a 64px bar leaves ~8 rows and turns to mush.

**Calibrated settings**

| Use | container | `asciiFontSize` | `planeBaseHeight` |
| --- | --- | --- | --- |
| Page title (2 lines) | `h-[26%] w-[62%]` | `6` | `18` |
| Project name (1 line) | `h-20 w-[22rem]` | `5` | `20` |

**Colour.** The type is **white**. Pink and cyan appear only as a coloured
**outline on the character edges**, sweeping along the pink↔cyan spectrum across
the block and drifting over time.

The fragment shader builds this from **edge masks**, not offset copies: a pixel
is on an edge where it is covered but its neighbour one `FRINGE_PX` away is not
(`clamp(core - neighbour, 0, 1)`). Output alpha is the glyph's own coverage, so
nothing is drawn outside the character and the shape stays crisp. `FRINGE_PX` is
deliberately small (2.5 texture px) — this is an outline, not a displacement.

Four things here are load-bearing — if you touch the component, do not undo them:

1. **Edge masks, not tinted offset copies.** Offsetting whole coloured copies of
   the glyph produces a blurred double image that smears over the text; masking
   the edge keeps the colour on the outline.
2. **`FRINGE_PX` is in texture pixels, not UV.** A UV offset scales with texture
   width, so a wide two-line title fringed roughly twice as hard as a short
   project name.
3. **`mix-blend-mode: normal`, not `difference`.** Difference against a white
   glyph inverts the palette: pink comes back green, cyan comes back red.
4. **The `<pre>` shadow must lean the same way as the shader's edges** (cyan
   left, pink right). Opposed directions fight and muddy the outline.

The grid font resolves from `--font-iosevka`. It **must** be fixed-pitch — every
row is a plain string, so a proportional fallback makes rows drift and the whole
block visibly shears.

---

## 4. Motion

Two vocabularies, used for different jobs.

**`SplitText` (GSAP) — text arriving.** Character stagger, `delay={12}`,
`duration={0.5}`, `ease="power3.out"`, `from={{opacity:0,y:14}}`.

> **Gotcha:** SplitText reveals via ScrollTrigger, but these pages don't scroll.
> At the stock threshold anything low on the page never crosses the start line
> and stays at `opacity: 0` **forever**. Always pass
> `threshold={0.01} rootMargin="0px"`. Mount it conditionally so the animation
> replays each time.

**CSS transitions — state changes.** `transition-colors duration-200` for accent
changes; `duration-300 ease-out` for the nav panel. Nothing longer than 300ms.

Reduced motion: the hero's rAF loop honours `prefers-reduced-motion` by snapping
instead of easing. Match that for anything continuous.

---

## 5. Layout

**Rules**

- **The left rail is `7%` + 23px.** Every left-aligned element on a full-bleed
  page starts on that line: the hero title, the project names, and the nav
  (`pl-[calc(7%+23px)]`). The 23px is the entries' 3px border plus `pl-5`.
- **Absolute positioning over flexbox** for full-bleed compositions. Siblings
  can't push each other around, which matters when one of them is hit-tested.
- **Never compute a height budget.** No `calc(100dvh - Nrem)`, no measured
  fitting. Two attempts at that clipped the arm, because any guessed budget
  desynchronises as soon as a title wraps differently in another locale.
- **The hero does not scroll**, by rule rather than by fitting: `sm:fixed
  sm:inset-0 sm:overflow-hidden`. Out of flow, it cannot extend the page.
  Content pages (`/about`) scroll normally.
- Mobile (`< sm`) drops the arm and the ASCII entirely and renders a plain
  stacked list. There is no cursor to follow and WebGL is expensive.

### Stacking

The arm draws above everything, the nav panel included. It is **portaled to
`<body>`** at `z-[70]` to get there: `<main>` is `position: fixed`, which makes
it a stacking context, and a child can never escape its parent's — no z-index on
the SVG in place would have worked. Raising `<main>` instead would have lifted
the whole menu over the nav and swallowed it.

Order: nav panel `z-50` → nav tab `z-[60]` → arm `z-[70]`. The arm is
`pointer-events-none`, so being on top costs nothing in interaction.

### Nav bar

Hidden by default, `fixed`, translated off-screen; a centred tab at the top edge
drops it down on click. It is `fixed` rather than in flow specifically so opening
it doesn't shove the page down. Escape closes it. Brand links carry their own
colour; generic links are `text-muted`.

---

## 6. The invariant most likely to bite you

**Anything revealed on hover must not resize the thing being hovered.** The
contact test reads each entry's own box; an entry that grew would move out from
under the gripper, close, regrow, and oscillate. This is why project descriptions
render in one reserved slot *below* the stack with `min-h` holding the space,
rather than inside the entry.

---

## 7. Content

Copy lives in `src/lib/hubTranslations.ts` — a typed dictionary in **en / es / fr
/ zh**. `HubDictionary` is `Record<keyof typeof en, string>`, so a key missing
from any language **fails the build**.

**Rule:** never hardcode a user-facing string in a component. Add the key to all
four blocks, and keep the meaning identical across them.

---

## 8. Checklist for a new page

- [ ] Tokens only, no hex literals, no `dark:`.
- [ ] Correct brand colour for the product the surface belongs to.
- [ ] Title in `ASCIIText`, left-aligned, fixed-size parent, ≥13 rows.
- [ ] Left rail at `7%` + 23px.
- [ ] Copy in all four languages.
- [ ] `SplitText` given `threshold={0.01} rootMargin="0px"`.
- [ ] Nothing hover-revealed changes the layout of its own trigger.
- [ ] `npx tsc --noEmit` and `npm run build` both clean.
- [ ] Checked at 1440×900 **and** below `sm`.
