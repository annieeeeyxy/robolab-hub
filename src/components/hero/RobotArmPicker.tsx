"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ASCIIText from "@/components/ASCIIText";
import SplitText from "@/components/SplitText";

/**
 * Hero: a left-aligned game-style menu of ASCII project names, with a pixelated
 * robot arm that follows the cursor. Touch an entry with the gripper and it
 * closes on it, revealing that project's description; click to open.
 *
 * Two invariants hold the whole thing together:
 *
 * 1. The SVG is `absolute inset-0` with NO viewBox, so one SVG user unit is one
 *    CSS pixel and the arm shares a coordinate system with the DOM for free —
 *    no aspect lock, no unit conversion, and nothing the arm draws can affect
 *    layout.
 * 2. Nothing revealed by a hover may resize an entry. The contact test reads
 *    each entry's own box, so an entry that grew would move out from under the
 *    gripper, close itself, and oscillate.
 *
 * Layout is absolutely positioned rather than flexed, and no height budget is
 * computed anywhere; the hero is a fixed, clipped box (see page.tsx).
 */

// Joints and the gripper are drawn at these design sizes and scaled; segment LENGTH
// and THICKNESS are computed separately. Scaling the whole arm uniformly to reach a
// far-away menu also inflates its thickness into a tree trunk, so thickness is tied
// to length only weakly and hard-capped.
const DESIGN_JOINT = 19;
const DESIGN_ELBOW = 14;
const DESIGN_GRIP_T = 19;

// Four bones, i.e. two more joints than the original shoulder+elbow pair, so the
// arm can curl through a shape rather than bending exactly once. Shares of the
// total length, root first; they must sum to 1.
const SEGMENT_SHARE = [0.3, 0.27, 0.23, 0.2];

// Fraction of the shoulder→farthest-corner distance the arm spans. Kept well
// under 1: slack is spent sagging (see ARC_DEPTH), so a full-diagonal arm folds
// away off the bottom edge instead of reading as an arm.
const REACH_SCALE = 0.55;
// The arm must always out-reach the menu even when REACH_SCALE would leave it
// short, so entries are measured separately with their own headroom.
const ITEM_REACH_HEADROOM = 1.14;

// The shoulder is parked off the bottom-right corner, so the arm rises out of
// frame with no visible mount or pedestal.
const BASE_DROP = 40; // px past each edge, off-canvas
const CONTACT_PAD = 12; // px of grace around a menu entry

// Thickness tracks length only weakly and is hard-capped, so a long reach stays
// slender: scaling the arm uniformly to reach a far target would otherwise turn
// it into a tree trunk. Tapers from root to tip.
const ROOT_THICK = { ratio: 0.046, min: 14, max: 30 };
const TIP_THICK = { ratio: 0.049, min: 11, max: 23 };

// Anti-flip. A four-bone chain has no single analytic solution to pin, so the
// solve is seeded from the base→target line with the free joints pushed straight
// *down* by this share of the slack; the chain therefore always arcs downward.
// The push is world-space +y, so there is no branch on which side the hand is
// and no perpendicular whose sign could invert — the seed is a continuous
// function of base and target, which makes the mirror-flip structurally
// impossible rather than merely unlikely.
//
// Raising it deepens the curve, but the belly of the arc drops below the bottom
// edge: the base sits in the corner, so there is little room underneath.
const ARC_DEPTH = 0.36;
const FABRIK_ITERATIONS = 10;

type Point = { x: number; y: number };

/**
 * FABRIK: drag the chain's tip onto the target and its root back onto the base,
 * alternately, until both hold. Two-bone IK had a closed form; four bones do
 * not, and this converges in a handful of passes without any trigonometry.
 *
 * Re-seeded every frame rather than carried across them: a persistent bias
 * saturates, spending all the slack on sag and folding the arm off-screen.
 */
function solveFabrik(points: Point[], lengths: number[], base: Point, target: Point) {
  const n = lengths.length;
  const span = lengths.reduce((sum, length) => sum + length, 0);

  const dx = target.x - base.x;
  const dy = target.y - base.y;
  const distance = Math.hypot(dx, dy);

  // Out of reach: there is nothing to solve, so lay the chain straight at it.
  if (distance > span) {
    const ux = dx / (distance || 1);
    const uy = dy / (distance || 1);
    points[0] = { ...base };
    for (let i = 0; i < n; i++) {
      points[i + 1] = {
        x: points[i].x + ux * lengths[i],
        y: points[i].y + uy * lengths[i],
      };
    }
    return;
  }

  // Seed: the straight base→target line with the free joints pushed straight
  // down by a share of the slack, so the passes below always converge onto the
  // downward-arced solution.
  const bulge = (span - distance) * ARC_DEPTH;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const sag = 4 * t * (1 - t); // 0 at both ends, 1 at the middle
    points[i] = {
      x: base.x + dx * t,
      y: base.y + dy * t + bulge * sag,
    };
  }

  for (let iteration = 0; iteration < FABRIK_ITERATIONS; iteration++) {
    points[n] = { ...target };
    for (let i = n - 1; i >= 0; i--) {
      const d = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y) || 1e-6;
      const r = lengths[i] / d;
      points[i] = {
        x: points[i + 1].x + (points[i].x - points[i + 1].x) * r,
        y: points[i + 1].y + (points[i].y - points[i + 1].y) * r,
      };
    }

    points[0] = { ...base };
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y) || 1e-6;
      const r = lengths[i] / d;
      points[i + 1] = {
        x: points[i].x + (points[i + 1].x - points[i].x) * r,
        y: points[i].y + (points[i + 1].y - points[i].y) * r,
      };
    }
  }
}

// Each entry highlights in its own brand colour rather than a shared accent, so
// the arm picking one reads as picking that product.
const ACCENT: Record<TargetId, { border: string; text: string }> = {
  prompt: { border: "border-prompt", text: "text-prompt" },
  ftc: { border: "border-ftc", text: "text-ftc" },
  about: { border: "border-foreground/70", text: "text-foreground" },
};

type TargetId = "prompt" | "ftc" | "about";

type Target = {
  id: TargetId;
  name: string;
  tagline: string;
  href: string;
  external: boolean;
};

type Props = {
  targets: Target[];
  lockedLabel: string;
  title: { pre: string; highlight: string; post: string };
};

type ItemBox = { id: string; cx: number; cy: number; halfW: number; halfH: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const deg = (radians: number) => (radians * 180) / Math.PI;

/** Resize a segment capsule (body + lit top edge) in place, in CSS pixels. */
function sizeSegment(
  body: SVGRectElement | null,
  highlight: SVGRectElement | null,
  length: number,
  thickness: number,
) {
  if (body) {
    body.setAttribute("x", `${-thickness * 0.4}`);
    body.setAttribute("y", `${-thickness / 2}`);
    body.setAttribute("width", `${length + thickness * 0.8}`);
    body.setAttribute("height", `${thickness}`);
    body.setAttribute("rx", `${thickness / 2}`);
  }
  if (highlight) {
    highlight.setAttribute("x", `${thickness * 0.1}`);
    highlight.setAttribute("y", `${-thickness / 2 + thickness * 0.16}`);
    highlight.setAttribute("width", `${length}`);
    highlight.setAttribute("height", `${thickness * 0.16}`);
    highlight.setAttribute("rx", `${thickness * 0.08}`);
  }
}

/** A joint housing: shaded barrel, dark hub, and bolts — reads as an actual pivot. */
function Joint({ radius }: { radius: number }) {
  const bolt = radius * 0.62;
  return (
    <>
      <circle r={radius} fill="url(#joint-steel)" stroke="#7c2d12" strokeWidth="2" />
      <circle r={radius * 0.46} fill="#9a3412" />
      <circle r={radius * 0.2} fill="#7c2d12" />
      {[0, 90, 180, 270].map((angle) => (
        <circle
          key={angle}
          cx={Math.cos((angle * Math.PI) / 180) * bolt}
          cy={Math.sin((angle * Math.PI) / 180) * bolt}
          r={radius * 0.11}
          fill="#c2410c"
        />
      ))}
    </>
  );
}

export function RobotArmPicker({ targets, lockedLabel, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<SVGGElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  // One entry per bone / joint now that the chain is four links long.
  const segRefs = useRef<(SVGGElement | null)[]>([]);
  const segBodyRefs = useRef<(SVGRectElement | null)[]>([]);
  const segHiRefs = useRef<(SVGRectElement | null)[]>([]);
  const jointRefs = useRef<(SVGGElement | null)[]>([]);
  // The solved chain: SEGMENT_SHARE.length + 1 points, base first, hand last.
  const chain = useRef<Point[]>([]);

  // Kept in a ref so the animation effect never has to tear down and restart when
  // the parent re-renders with a fresh array. Synced in an effect rather than
  // assigned during render: a render can be thrown away or replayed, and a ref
  // written there would keep a value the committed tree never had.
  const targetsRef = useRef(targets);
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  // Everything the animation loop needs, measured from real DOM boxes on resize
  // rather than recomputed per frame (no layout thrash, no guessed constants).
  const geom = useRef({
    left: 0,
    top: 0,
    base: { x: 0, y: 0 } as Point,
    lengths: [] as number[],
    jointScales: [] as number[],
    handScale: 1,
    items: [] as ItemBox[],
  });

  const desired = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const grip = useRef(0); // 0 = open, 1 = closed
  const [touched, setTouched] = useState<Target["id"] | null>(null);
  const touchedRef = useRef<Target["id"] | null>(null);
  // The arm portals into <body>, which does not exist while server-rendering.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const items: ItemBox[] = [];
    for (const target of targetsRef.current) {
      const node = itemRefs.current[target.id];
      if (!node) continue;
      const box = node.getBoundingClientRect();
      items.push({
        id: target.id,
        cx: box.left - rect.left + box.width / 2,
        cy: box.top - rect.top + box.height / 2,
        halfW: box.width / 2,
        halfH: box.height / 2,
      });
    }

    // Off the bottom-right corner: out of frame, so the arm rises out of the
    // corner with no mount or floor line to draw.
    const base: Point = { x: rect.width + BASE_DROP, y: rect.height + BASE_DROP };

    // Span to the farthest corner, then scale down by REACH_SCALE. The arm still
    // covers most of the box but no longer runs the full diagonal; beyond its
    // span the chain simply lays out straight at the cursor instead of touching
    // it. The menu is measured separately and always wins, so a REACH_SCALE that
    // leaves the arm short of an entry can never break pinching.
    const corners = [
      { x: 0, y: 0 },
      { x: rect.width, y: 0 },
      { x: 0, y: rect.height },
      { x: rect.width, y: rect.height },
    ];
    const cornerReach =
      corners.reduce(
        (max, point) => Math.max(max, Math.hypot(point.x - base.x, point.y - base.y)),
        0,
      ) * REACH_SCALE;
    const itemReach =
      items.reduce(
        (max, item) => Math.max(max, Math.hypot(item.cx - base.x, item.cy - base.y)),
        0,
      ) * ITEM_REACH_HEADROOM;
    const total = Math.max(cornerReach, itemReach);

    const rootT = clamp(total * ROOT_THICK.ratio, ROOT_THICK.min, ROOT_THICK.max);
    const tipT = clamp(total * TIP_THICK.ratio, TIP_THICK.min, TIP_THICK.max);

    const lengths = SEGMENT_SHARE.map((share) => total * share);
    const jointScales: number[] = [];
    lengths.forEach((length, i) => {
      // Taper root → tip across the chain so it reads as an arm, not a worm.
      const t = lengths.length > 1 ? i / (lengths.length - 1) : 0;
      const thickness = rootT + (tipT - rootT) * t;
      sizeSegment(segBodyRefs.current[i], segHiRefs.current[i], length, thickness);
      jointScales.push((thickness * (i === 0 ? 0.78 : 0.92)) / (i === 0 ? DESIGN_JOINT : DESIGN_ELBOW));
    });

    geom.current = {
      left: rect.left,
      top: rect.top,
      base,
      lengths,
      jointScales,
      handScale: tipT / DESIGN_GRIP_T,
      items,
    };

    // Seed the chain the first time so it starts already arced downward rather
    // than snapping into shape on the first frame.
    if (chain.current.length !== lengths.length + 1) {
      chain.current = Array.from({ length: lengths.length + 1 }, (_, i) => ({
        x: base.x + (total / lengths.length) * i,
        y: base.y - (total / lengths.length) * i * 0.2,
      }));
    }

    if (current.current.x === 0 && current.current.y === 0) {
      const rest = { x: rect.width * 0.5, y: rect.height * 0.35 };
      desired.current = { ...rest };
      current.current = { ...rest };
    }
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    for (const node of Object.values(itemRefs.current)) {
      if (node) observer.observe(node);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, targets, lockedLabel]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onPointerMove = (event: PointerEvent) => {
      desired.current = {
        x: event.clientX - geom.current.left,
        y: event.clientY - geom.current.top,
      };
    };
    if (!reduceMotion.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);

      const g = geom.current;
      // Hidden below `sm`, or not measured yet — nothing to solve for.
      if (!g.lengths.length || !containerRef.current?.offsetParent) return;

      const ease = reduceMotion.matches ? 1 : 0.16;
      current.current.x += (desired.current.x - current.current.x) * ease;
      current.current.y += (desired.current.y - current.current.y) * ease;

      // Four-bone inverse kinematics, all in CSS pixels. Solved in place from
      // last frame's pose, so the chain moves continuously.
      const points = chain.current;
      solveFabrik(points, g.lengths, g.base, current.current);

      const hand = points[points.length - 1];
      const beforeHand = points[points.length - 2];
      const handX = hand.x;
      const handY = hand.y;
      const wrist = Math.atan2(handY - beforeHand.y, handX - beforeHand.x);

      // Contact test against the menu entries' real boxes.
      const pad = CONTACT_PAD;
      let hit: ItemBox | null = null;
      for (const item of g.items) {
        if (
          handX > item.cx - item.halfW - pad &&
          handX < item.cx + item.halfW + pad &&
          handY > item.cy - item.halfH - pad &&
          handY < item.cy + item.halfH + pad
        ) {
          hit = item;
          break;
        }
      }
      const hitId = (hit?.id ?? null) as Target["id"] | null;
      if (hitId !== touchedRef.current) {
        touchedRef.current = hitId;
        setTouched(hitId);
      }

      grip.current += ((hit ? 1 : 0) - grip.current) * 0.25;

      // Segments are already sized in pixels, so they only need placing and
      // rotating along whatever the solver produced.
      for (let i = 0; i < g.lengths.length; i++) {
        const from = points[i];
        const to = points[i + 1];
        const angle = deg(Math.atan2(to.y - from.y, to.x - from.x));
        segRefs.current[i]?.setAttribute("transform", `translate(${from.x} ${from.y}) rotate(${angle})`);
        jointRefs.current[i]?.setAttribute(
          "transform",
          `translate(${from.x} ${from.y}) scale(${g.jointScales[i] ?? 1})`,
        );
      }
      handRef.current?.setAttribute(
        "transform",
        `translate(${handX} ${handY}) rotate(${deg(wrist)}) scale(${g.handScale})`,
      );

      // Claw fingers pivot shut on contact.
      const spread = 24 - grip.current * 19;
      handRef.current?.querySelectorAll<SVGGElement>("[data-claw]").forEach((claw) => {
        const side = claw.dataset.claw === "top" ? -1 : 1;
        claw.setAttribute("transform", `rotate(${side * spread})`);
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The highlighted word is no longer styled separately — the ASCII treatment is
  // the whole effect, so the title is just one string.
  const titleParts = [title.pre, title.highlight, title.post].map((part) => part.trim());
  const titleFlat = titleParts.filter(Boolean).join(" ");
  const activeTarget = targets.find((target) => target.id === touched) ?? null;
  // Broken after the highlighted word: two roughly even lines keep the plane near
  // the container's aspect, so the glyphs stay large enough to read once asciified.
  const titleBlock = [
    [titleParts[0], titleParts[1]].filter(Boolean).join(" "),
    titleParts[2],
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      {/* Mobile: no cursor to follow, so the menu is just a plain stacked list.
          The ASCII title is desktop-only — it is a WebGL mesh, and there is no
          arm here to clip it, so mobile gets plain type. Descriptions stay
          visible for the same reason: nothing can pinch them open. */}
      <div className="sm:hidden">
        <h1 className="max-w-xl text-left text-4xl font-bold leading-[1.06] tracking-[-.02em]">
          {titleFlat}
        </h1>
        <div className="mt-8">
          {targets.map((target, index) => (
            <a
              key={target.id}
              href={target.href}
              target={target.external ? "_blank" : undefined}
              rel={target.external ? "noreferrer" : undefined}
              className={`block border-l-[3px] border-line py-3 pl-5 ${index > 0 ? "mt-5" : ""}`}
            >
              <span className="block text-2xl font-thin tracking-[-.01em]">{target.name}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{target.tagline}</span>
              <span className="mt-2 block font-mono text-[10px] uppercase tracking-[.16em] text-orange-600">
                {lockedLabel} →
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Desktop: absolutely positioned menu on the left, arm drawn over the top.
          The pointer is hidden — the arm *is* the cursor, so a second arrow on
          top of it just reads as a bug. Links need it explicitly, since the UA
          stylesheet's `cursor: pointer` would otherwise win over inheritance. */}
      <div
        ref={containerRef}
        className="absolute inset-0 hidden cursor-none sm:block [&_a]:cursor-none"
      >
        {/* Positioned absolutely like the menu so neither can push the other
            around. Shares the menu's left edge, and the inner margin matches the
            entries' 3px border + pl-5, so the title's glyphs start on the same
            vertical line as the project names'. */}
        <div className="absolute left-[7%] top-[8%] h-[26%] w-[62%]">
          <div className="relative ml-[23px] h-full">
            <ASCIIText
              text={titleBlock}
              align="left"
              asciiFontSize={6}
              textFontSize={200}
              planeBaseHeight={18}
            />
          </div>
        </div>

        <div className="absolute left-[7%] top-[44%] w-[52%]">
          <div>
            {targets.map((target, index) => {
              const isTouched = touched === target.id;
              return (
                <a
                  key={target.id}
                  ref={(node) => {
                    itemRefs.current[target.id] = node;
                  }}
                  href={target.href}
                  target={target.external ? "_blank" : undefined}
                  rel={target.external ? "noreferrer" : undefined}
                  onFocus={() => {
                    const item = geom.current.items.find((entry) => entry.id === target.id);
                    if (item) desired.current = { x: item.cx, y: item.cy };
                  }}
                  className={`relative block border-l-[3px] py-1 pl-5 transition-colors duration-200 ${index > 0 ? "mt-2" : ""} ${
                    isTouched ? ACCENT[target.id].border : "border-line/70 hover:border-line"
                  }`}
                >
                  {/* Project names get the same ASCII treatment as the title.
                      Fixed box: this is the arm's contact target, so its size
                      must not depend on anything that reveals or animates. */}
                  <div className="relative h-20 w-[22rem]">
                    <ASCIIText
                      text={target.name}
                              align="left"
                      asciiFontSize={5}
                      textFontSize={200}
                      planeBaseHeight={20}
                    />
                  </div>

                </a>
              );
            })}
          </div>

          {/* One description slot under the whole stack rather than one per
              entry. With the entries packed tight there is no room beneath any
              single one, and a per-entry block would sit on top of the next
              name. Height is reserved so revealing it never shifts the stack —
              the entries above are the arm's contact targets. */}
          <div className="mt-7 min-h-[5.5rem] pl-5">
            {activeTarget && (
              <>
                {/* threshold/rootMargin are pushed to "effectively always on":
                    SplitText reveals via ScrollTrigger, but this hero never
                    scrolls, and at the stock `top 90%-=100px` anything low on
                    the page stays stuck at opacity 0 forever. */}
                <SplitText
                  key={activeTarget.id}
                  text={activeTarget.tagline}
                  tag="p"
                  splitType="chars"
                  textAlign="left"
                  delay={12}
                  duration={0.5}
                  ease="power3.out"
                  threshold={0.01}
                  rootMargin="0px"
                  from={{ opacity: 0, y: 14 }}
                  to={{ opacity: 1, y: 0 }}
                  className="max-w-md text-sm leading-6 text-muted"
                />
                <p
                  className={`mt-1 font-mono text-[10px] uppercase tracking-[.18em] ${ACCENT[activeTarget.id].text}`}
                >
                  {lockedLabel} →
                </p>
              </>
            )}
          </div>
        </div>

        {/* Portaled to <body> so the arm draws over everything, the nav panel
            included. It cannot simply take a high z-index in place: <main> is
            `fixed`, which makes it a stacking context, and a child can never
            escape its parent's. Raising <main> instead would lift the whole menu
            over the nav and swallow it.

            `fixed inset-0` keeps the coordinate system it had — the hero is also
            fixed to the viewport, so the arm's pixels still line up with the
            entries it hit-tests. No viewBox, so one SVG user unit is one CSS
            pixel. `pointer-events-none` lets clicks through to the nav beneath. */}
        {mounted &&
          createPortal(
            <svg
              className="pointer-events-none fixed inset-0 z-[70] hidden h-full w-full sm:block"
              aria-hidden="true"
            >
          <defs>
            <linearGradient id="arm-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="42%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#b8420b" />
            </linearGradient>
            <radialGradient id="joint-steel" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="55%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>
            {/* Mosaic filter, to sit with the ASCII type: sample one dot per
                BLOCK×BLOCK cell, tile that grid, then dilate each sample back
                out into a full block. filterUnits is userSpaceOnUse with a fixed
                origin on purpose — with the default bounding-box region the grid
                would be anchored to the arm's own box and crawl as it moved. */}
            <filter
              id="arm-pixelate"
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="4000"
              height="3000"
            >
              <feFlood x="2" y="2" width="2" height="2" />
              <feComposite width="6" height="6" />
              <feTile result="grid" />
              <feComposite in="SourceGraphic" in2="grid" operator="in" />
              <feMorphology operator="dilate" radius="3" />
            </filter>
          </defs>

          {/* One filter over the whole arm rather than per segment, so every
              piece lands on the same pixel grid. */}
          <g filter="url(#arm-pixelate)">
          {/* Segment rects are sized in pixels by sizeSegment() on measure.
              Bones first, then joints, so every pivot sits on top of the two
              bones it connects. */}
          {SEGMENT_SHARE.map((_, i) => (
            <g
              key={`bone-${i}`}
              ref={(node) => {
                segRefs.current[i] = node;
              }}
            >
              <rect
                ref={(node) => {
                  segBodyRefs.current[i] = node;
                }}
                fill="url(#arm-steel)"
                stroke="#7c2d12"
                strokeWidth="1.5"
              />
              <rect
                ref={(node) => {
                  segHiRefs.current[i] = node;
                }}
                fill="#fed7aa"
                opacity="0.55"
              />
            </g>
          ))}

          {SEGMENT_SHARE.map((_, i) => (
            <g
              key={`joint-${i}`}
              ref={(node) => {
                jointRefs.current[i] = node;
              }}
            >
              <Joint radius={i === 0 ? DESIGN_JOINT : DESIGN_ELBOW} />
            </g>
          ))}

          {/* Gripper — claws pivot about the wrist origin so they stay attached. */}
          <g ref={handRef}>
            <rect x="-16" y="-11" width="20" height="22" rx="6" fill="url(#arm-steel)" stroke="#7c2d12" strokeWidth="1.5" />
            <g data-claw="top">
              <path
                d="M 0 -5 L 22 -5 L 29 -1 L 22 1 L 0 1 Z"
                fill="url(#arm-steel)"
                stroke="#7c2d12"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
            <g data-claw="bottom">
              <path
                d="M 0 5 L 22 5 L 29 1 L 22 -1 L 0 -1 Z"
                fill="url(#arm-steel)"
                stroke="#7c2d12"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
            <circle r="6" fill="url(#joint-steel)" stroke="#7c2d12" strokeWidth="1.5" />
          </g>
          </g>
            </svg>,
            document.body,
          )}
      </div>
    </>
  );
}
