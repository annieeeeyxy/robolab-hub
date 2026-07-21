"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ASCIIText from "@/components/ASCIIText";
import SplitText from "@/components/SplitText";

/**
 * Hero: a left-aligned game-style menu, with an orange robotic arm that reaches
 * across the screen and follows the cursor. Touch a menu entry with the gripper
 * and it closes on it — click to open.
 *
 * Layout deliberately avoids flexbox and avoids computing any height budget. The
 * hero is a fixed, clipped box (see page.tsx), the menu is absolutely positioned,
 * and the SVG is `absolute inset-0` with NO viewBox — so one SVG user unit is one
 * CSS pixel and the arm shares a coordinate system with the DOM for free. Nothing
 * the arm draws can affect layout, so there is no feedback loop and nothing to
 * clip: the previous approach guessed the leftover height and got it wrong.
 */

// Joints and the gripper are drawn at these design sizes and scaled; segment LENGTH
// and THICKNESS are computed separately. Scaling the whole arm uniformly to reach a
// far-away menu also inflates its thickness into a tree trunk, so thickness is tied
// to length only weakly and hard-capped.
const DESIGN_JOINT = 19;
const DESIGN_ELBOW = 14;
const DESIGN_GRIP_T = 19;
// Share of total arm length in the upper segment. Deliberately under half so the
// first bone is the shorter one, which keeps the elbow well inside the frame
// instead of pushing it out past the far edge.
const SPLIT_UPPER = 0.46;

// Fraction of the shoulder→farthest-corner distance the arm actually spans. At 1
// it runs the full diagonal; below that it stays shorter and simply stops short
// of the far corners.
const REACH_SCALE = 0.82;

// Where the shoulder sits: off the bottom-right corner of the hero box, so the arm
// emerges from off-canvas with no visible mount.
const BASE_DROP = 40; // px past each edge, off-canvas
const CONTACT_PAD = 12; // px of grace around a menu entry

// Elbow orientation is a fixed constant. Deriving it from the side the hand is on
// flips the IK solution at the centreline and mirrors the forearm — the "elbow
// flip". With no branch, the solution is continuous and the flip cannot happen.
const ELBOW_BEND = 1;

type Target = {
  id: "prompt" | "ftc";
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
  const upperRef = useRef<SVGGElement>(null);
  const foreRef = useRef<SVGGElement>(null);
  const elbowRef = useRef<SVGGElement>(null);
  const shoulderRef = useRef<SVGGElement>(null);
  const handRef = useRef<SVGGElement>(null);
  const upperBodyRef = useRef<SVGRectElement>(null);
  const upperHiRef = useRef<SVGRectElement>(null);
  const foreBodyRef = useRef<SVGRectElement>(null);
  const foreHiRef = useRef<SVGRectElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Kept in a ref so the animation effect never has to tear down and restart when
  // the parent re-renders with a fresh array.
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  // Everything the animation loop needs, measured from real DOM boxes on resize
  // rather than recomputed per frame (no layout thrash, no guessed constants).
  const geom = useRef({
    left: 0,
    top: 0,
    base: { x: 0, y: 0 },
    upper: 0,
    fore: 0,
    shoulderScale: 1,
    elbowScale: 1,
    handScale: 1,
    items: [] as ItemBox[],
  });

  const desired = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const grip = useRef(0); // 0 = open, 1 = closed
  const [touched, setTouched] = useState<Target["id"] | null>(null);
  const touchedRef = useRef<Target["id"] | null>(null);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const base = { x: rect.width + BASE_DROP, y: rect.height + BASE_DROP };
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

    // Span to the farthest corner, then scale down by REACH_SCALE. The arm still
    // covers most of the box but no longer runs the full diagonal; the IK clamps
    // the hand to the arm's span, so beyond that it simply points at the cursor
    // instead of touching it.
    const corners = [
      { x: 0, y: 0 },
      { x: rect.width, y: 0 },
      { x: 0, y: rect.height },
      { x: rect.width, y: rect.height },
    ];
    const total =
      corners.reduce(
        (max, point) => Math.max(max, Math.hypot(point.x - base.x, point.y - base.y)),
        0,
      ) * REACH_SCALE;
    const upper = total * SPLIT_UPPER;
    const fore = total * (1 - SPLIT_UPPER);

    // Thickness barely tracks length and is capped, so a long reach stays slender.
    const upperT = clamp(upper * 0.1, 14, 30);
    const foreT = clamp(fore * 0.09, 11, 23);
    sizeSegment(upperBodyRef.current, upperHiRef.current, upper, upperT);
    sizeSegment(foreBodyRef.current, foreHiRef.current, fore, foreT);

    geom.current = {
      left: rect.left,
      top: rect.top,
      base,
      upper,
      fore,
      shoulderScale: (upperT * 0.78) / DESIGN_JOINT,
      elbowScale: (foreT * 0.92) / DESIGN_ELBOW,
      handScale: foreT / DESIGN_GRIP_T,
      items,
    };

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
      if (!g.upper || !containerRef.current?.offsetParent) return;

      const ease = reduceMotion.matches ? 1 : 0.16;
      current.current.x += (desired.current.x - current.current.x) * ease;
      current.current.y += (desired.current.y - current.current.y) * ease;

      // Two-bone inverse kinematics (law of cosines), all in CSS pixels.
      const dx = current.current.x - g.base.x;
      const dy = current.current.y - g.base.y;
      const span = g.upper + g.fore;
      const reach = clamp(Math.hypot(dx, dy), Math.abs(g.upper - g.fore) + 1, span - 1);
      const toTarget = Math.atan2(dy, dx);
      const shoulderOffset = Math.acos(
        clamp((reach * reach + g.upper * g.upper - g.fore * g.fore) / (2 * reach * g.upper), -1, 1),
      );
      const shoulder = toTarget - ELBOW_BEND * shoulderOffset;

      const elbowX = g.base.x + Math.cos(shoulder) * g.upper;
      const elbowY = g.base.y + Math.sin(shoulder) * g.upper;
      const handX = g.base.x + Math.cos(toTarget) * reach;
      const handY = g.base.y + Math.sin(toTarget) * reach;
      const wrist = Math.atan2(handY - elbowY, handX - elbowX);

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

      // Segments are already sized in pixels, so they only need placing and rotating.
      shoulderRef.current?.setAttribute(
        "transform",
        `translate(${g.base.x} ${g.base.y}) scale(${g.shoulderScale})`,
      );
      upperRef.current?.setAttribute(
        "transform",
        `translate(${g.base.x} ${g.base.y}) rotate(${deg(shoulder)})`,
      );
      foreRef.current?.setAttribute("transform", `translate(${elbowX} ${elbowY}) rotate(${deg(wrist)})`);
      elbowRef.current?.setAttribute("transform", `translate(${elbowX} ${elbowY}) scale(${g.elbowScale})`);
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
              <span className="mt-2 block font-mono text-[10px] uppercase tracking-[.16em] text-orange-600 dark:text-orange-400">
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
              enableWaves={false}
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
                  className={`relative block border-l-[3px] py-2 pl-5 transition-colors duration-200 ${index > 0 ? "mt-24" : ""} ${
                    isTouched ? "border-orange-500" : "border-line/70 hover:border-orange-400/60"
                  }`}
                >
                  {/* Project names get the same ASCII treatment as the title.
                      Fixed box: this is the arm's contact target, so its size
                      must not depend on anything that reveals or animates. */}
                  <div className="relative h-20 w-[22rem]">
                    <ASCIIText
                      text={target.name}
                      enableWaves={false}
                      align="left"
                      asciiFontSize={5}
                      textFontSize={200}
                      planeBaseHeight={20}
                    />
                  </div>

                  {/* Mounted only once the gripper has pinched this entry, so the
                      split-text animation replays on every pinch. Absolutely
                      positioned directly below: the contact test reads the
                      anchor's box, and letting this grow it would shove the entry
                      out from under the gripper, close it, and oscillate. */}
                  {isTouched && (
                    <div className="absolute left-5 right-0 top-full pt-1">
                      {/* threshold/rootMargin are pushed to "effectively always
                          on": SplitText reveals via ScrollTrigger, but this hero
                          never scrolls, and at the stock `top 90%-=100px` the
                          lower entry sits past the start line and its text would
                          stay stuck at opacity 0 forever. */}
                      <SplitText
                        key={target.id}
                        text={target.tagline}
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
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[.18em] text-orange-600 dark:text-orange-400">
                        {lockedLabel} →
                      </p>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* No viewBox: SVG user units are CSS pixels, shared with the DOM above.
            Renders over the menu and passes clicks straight through to it. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
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
          {/* Segment rects are sized in pixels by sizeSegment() on measure. */}
          <g ref={upperRef}>
            <rect ref={upperBodyRef} fill="url(#arm-steel)" stroke="#7c2d12" strokeWidth="1.5" />
            <rect ref={upperHiRef} fill="#fed7aa" opacity="0.55" />
          </g>
          <g ref={foreRef}>
            <rect ref={foreBodyRef} fill="url(#arm-steel)" stroke="#7c2d12" strokeWidth="1.5" />
            <rect ref={foreHiRef} fill="#fed7aa" opacity="0.55" />
          </g>

          <g ref={shoulderRef}>
            <Joint radius={DESIGN_JOINT} />
          </g>
          <g ref={elbowRef}>
            <Joint radius={DESIGN_ELBOW} />
          </g>

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
        </svg>
      </div>
    </>
  );
}
