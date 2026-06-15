#!/usr/bin/env node
// build-composition.mjs — the reusable "feature-explainer walkthrough" composition template.
//
// Data-driven: reads a spec JSON and emits a Hyperframes composition (index.html).
//   node build-composition.mjs <spec.json> [outDir]
//
// This is the EVOLVED template: each shot is no longer a bare screenshot with a one-line
// caption. Each shot now carries SUPPORTING TEXT (a title + one benefit line) AND a
// CONTENT-AWARE EFFECT keyed to a region of the screenshot, so the walkthrough explains
// the feature instead of just panning over it.
//
// Spec shape:
//   {
//     "title":    "TreAxe",
//     "subtitle": "Construction operations, one connected workflow",
//     "outro":    "treaxe-demo.vercel.app",         // optional; shown on the outro card
//     "shots": [
//       {
//         "image": "assets/dashboard.png",
//         "fit": "cover",                            // "cover" (app shot) | "contain" (tall PDF)
//         "title": "Your whole business on one screen",
//         "supportText": "AI flags the jobs going cold before they cost you.",
//         "caption": "...",                          // optional fallback / a11y line
//         "effect": {
//           "type": "spotlight",                     // spotlight | sweep | reveal-sequence | document-assemble
//           "region": { "x": 0.18, "y": 0.05, "w": 0.80, "h": 0.55 },   // normalized 0..1 over the shot stage
//           "regions": [ { ... }, { ... } ],         // for reveal-sequence / document-assemble (ordered)
//           "scale": 1.10,                           // optional spotlight zoom toward region (default 1.08)
//           "label": "AI risk panel"                 // optional pin label on the highlight
//         },
//         "textPos": "tl"                            // optional overlay anchor: tl|tr|bl|br (default tl)
//       }
//     ],
//     "theme":      { "ink": "#0c0b09", "amber": "#e8a13c", ... },  // optional overrides
//     "width": 1920, "height": 1080, "fps": 30,                     // optional
//     "shotDuration": 5.4, "transition": 0.8,                        // optional (seconds)
//     "titleDuration": 3.0, "outroDuration": 3.4                     // optional (seconds)
//   }
//
// Output is a single self-contained composition that the Hyperframes CLI renders to MP4.
// Animation contract honored (hyperframes-core): ONE paused GSAP timeline registered on
// window.__timelines["root"], built synchronously; only opacity/transform props animated
// (no width/height/top/left, no display/visibility); transformed elements are block-level
// + explicitly sized; effect coordinates are pre-computed here (never measured at tween time).

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

const specPath = process.argv[2];
if (!specPath) {
  console.error("usage: node build-composition.mjs <spec.json> [outDir]");
  process.exit(1);
}
const outDir = process.argv[3] || dirname(specPath);
const spec = JSON.parse(readFileSync(specPath, "utf8"));

// ---- theme (site palette + fonts, with web-safe fallbacks for the renderer) ----
const t = {
  ink: "#0c0b09",
  ink2: "#14120e",
  line: "#3b362a",
  amber: "#e8a13c",
  amberDeep: "#c97f1c",
  paper: "#f4efe4",
  paperDim: "#b8b09c",
  paperMute: "#847c6a",
  // Fonts: try the site faces, fall back to web-safe families the headless Chrome always has.
  fontDisplay: '"Fraunces", Georgia, "Times New Roman", serif',
  fontBody: '"Space Grotesk", system-ui, "Segoe UI", Helvetica, Arial, sans-serif',
  fontMono: '"JetBrains Mono", "SFMono-Regular", Consolas, "Courier New", monospace',
  ...(spec.theme || {}),
};

const W = spec.width || 1920;
const H = spec.height || 1080;
const FPS = spec.fps || 30;

// Feature-explainer shots earn a little more time than a slideshow pan: the support text
// types/slides in, the effect plays, then it holds long enough to read. ~5.4s is the floor
// that keeps a title + benefit line + a content-aware effect all legible.
const SHOT_DUR = spec.shotDuration ?? 5.4; // seconds each screenshot is on screen
const XF = spec.transition ?? 0.8; // cross-fade overlap (seconds)
const TITLE_DUR = spec.titleDuration ?? 3.0;
const OUTRO_DUR = spec.outroDuration ?? 3.4;

const shots = spec.shots || [];
if (shots.length === 0) {
  console.error("spec has no shots — nothing to render");
  process.exit(1);
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const pct = (n) => (n * 100).toFixed(3) + "%";
const n3 = (n) => Number(n).toFixed(3);

// ---- timeline math (sequential, cross-faded) ----
const slots = [];
let cursor = 0;
slots.push({ kind: "title", start: cursor, dur: TITLE_DUR });
cursor += TITLE_DUR - XF;
shots.forEach((s, i) => {
  // per-shot duration override (a hook or a long scrolling doc earns more time);
  // falls back to the global SHOT_DUR.
  const d = typeof s.duration === "number" && s.duration > 0 ? s.duration : SHOT_DUR;
  slots.push({ kind: "shot", index: i, start: cursor, dur: d });
  cursor += d - XF;
});
slots.push({ kind: "outro", start: cursor, dur: OUTRO_DUR });
cursor += OUTRO_DUR;
const TOTAL = +cursor.toFixed(3);

// ---- HTML: title card ----
function titleCard(slot) {
  return `
    <section class="card title-card clip" id="card-title"
             data-start="${slot.start}" data-duration="${slot.dur}" data-track-index="0">
      <div class="tc-ghost" id="tc-ghost" aria-hidden="true">${esc(spec.title)}</div>
      <div class="tc-glow" id="tc-glow" aria-hidden="true"></div>
      <div class="reg reg-tl" id="tc-reg-tl">
        <span class="reg-mark">+</span>
        <span class="reg-lbl">${esc((spec.regLabel || "PRODUCT WALKTHROUGH").toUpperCase())}</span>
      </div>
      <div class="reg reg-br" id="tc-reg-br">
        <span class="reg-lbl">${String(shots.length).padStart(2, "0")} SCREENS &middot; ${Math.round(TOTAL)}S</span>
        <span class="reg-mark">+</span>
      </div>
      <div class="tc-inner">
        <p class="kicker" id="tc-kicker">/ ${esc(spec.regLabel || "Product walkthrough")}</p>
        <h1 class="tc-title" id="tc-title">${esc(spec.title)}</h1>
        <div class="tc-rule" id="tc-rule"></div>
        ${spec.subtitle ? `<p class="tc-sub" id="tc-sub">${esc(spec.subtitle)}</p>` : ""}
      </div>
    </section>`;
}

// ---- HTML: the content-aware effect layer for a shot ----
// All effect geometry is emitted as inline left/top/width/height (STATIC layout — never
// animated); only opacity/transform on these elements is animated by the timeline.
function effectLayer(i, eff) {
  if (!eff || !eff.type) return "";
  const type = eff.type;

  // A reusable highlight rect (rounded border + soft amber glow + faint amber wash).
  const rect = (id, r, extraClass = "", label = "") => `
        <div class="fx-rect ${extraClass}" id="${id}"
             style="left:${pct(r.x)};top:${pct(r.y)};width:${pct(r.w)};height:${pct(r.h)};">
          ${label ? `<span class="fx-pin">${esc(label)}</span>` : ""}
        </div>`;

  if (type === "spotlight") {
    const r = eff.region || { x: 0.1, y: 0.1, w: 0.8, h: 0.6 };
    // A vignette dim that darkens the whole frame a touch, plus the bright highlight rect.
    return `
      <div class="fx-layer" id="fx-${i}">
        <div class="fx-dim" id="fx-dim-${i}"></div>
        ${rect(`fx-spot-${i}`, r, "fx-spot", eff.label || "")}
      </div>`;
  }

  if (type === "sweep") {
    const r = eff.region || { x: 0.05, y: 0.45, w: 0.9, h: 0.45 };
    // A bright vertical band that sweeps left->right across the region (translateX),
    // plus a steady frame around the swept region so the eye knows the zone.
    return `
      <div class="fx-layer" id="fx-${i}">
        <div class="fx-zone" id="fx-zone-${i}"
             style="left:${pct(r.x)};top:${pct(r.y)};width:${pct(r.w)};height:${pct(r.h)};">
          ${eff.label ? `<span class="fx-pin">${esc(eff.label)}</span>` : ""}
        </div>
        <div class="fx-sweep-clip" id="fx-sweepclip-${i}"
             style="left:${pct(r.x)};top:${pct(r.y)};width:${pct(r.w)};height:${pct(r.h)};">
          <div class="fx-sweep-band" id="fx-band-${i}"></div>
        </div>
      </div>`;
  }

  if (type === "reveal-sequence") {
    const regions = eff.regions || [];
    return `
      <div class="fx-layer" id="fx-${i}">
        ${regions
          .map((r, k) => rect(`fx-rev-${i}-${k}`, r, "fx-rev", r.label || ""))
          .join("\n")}
      </div>`;
  }

  if (type === "document-assemble") {
    // For a tall, letterboxed document (contain): horizontal bands that reveal in order
    // (scope -> totals -> signature), each a rect over the document region, plus a moving
    // "read line" that travels down as the bands light up.
    const regions = eff.regions || [];
    const firstY = regions.length ? regions[0].y : 0.1;
    return `
      <div class="fx-layer" id="fx-${i}">
        <div class="fx-readline" id="fx-read-${i}" style="top:${pct(firstY)};"></div>
        ${regions
          .map((r, k) => rect(`fx-doc-${i}-${k}`, r, "fx-doc", r.label || ""))
          .join("\n")}
      </div>`;
  }

  return "";
}

// ---- HTML: shot card (screenshot + support-text overlay + effect) ----
function shotCard(slot) {
  const s = shots[slot.index];
  const fit = s.fit === "contain" ? "contain" : s.fit === "width" ? "width" : "cover";
  const i = slot.index;
  const dir = i % 2 === 0 ? 1 : -1;
  const pos = ["tl", "tr", "bl", "br"].includes(s.textPos) ? s.textPos : "tl";
  const eff = s.effect || null;
  const a11y = s.caption || `${s.title || ""} ${s.supportText || ""}`.trim();

  // Support-text overlay: title + one benefit line, in a left/right-anchored card placed
  // away from the bottom caption bar AND (by author's textPos) away from the effect region.
  const supportOverlay =
    s.title || s.supportText
      ? `
      <div class="sup sup-${pos}" id="sup-${i}">
        <span class="sup-num" id="sup-num-${i}">${String(i + 1).padStart(2, "0")} / ${String(shots.length).padStart(2, "0")}</span>
        ${s.title ? `<h2 class="sup-title" id="sup-title-${i}">${esc(s.title)}</h2>` : ""}
        ${s.supportText ? `<p class="sup-text" id="sup-text-${i}">${esc(s.supportText)}</p>` : ""}
      </div>`
      : "";

  return `
    <section class="card shot-card clip" id="card-shot-${i}"
             data-start="${slot.start}" data-duration="${slot.dur}" data-track-index="${i + 1}"
             data-kb-dir="${dir}">
      <div class="shot-stage shot-stage-${fit}" data-layout-allow-overflow>
        <div class="shot-frame" id="shot-frame-${i}" data-layout-allow-overflow>
          <img class="shot-img" id="shot-img-${i}" src="${esc(s.image)}" alt="${esc(a11y)}" data-layout-allow-overflow />
          ${effectLayer(i, eff)}
        </div>
      </div>
      ${supportOverlay}
    </section>`;
}

// ---- HTML: outro card ----
function outroCard(slot) {
  return `
    <section class="card outro-card clip" id="card-outro"
             data-start="${slot.start}" data-duration="${slot.dur}" data-track-index="${shots.length + 1}">
      <div class="oc-ghost" id="oc-ghost" aria-hidden="true">${esc(spec.title)}</div>
      <div class="oc-glow" id="oc-glow" aria-hidden="true"></div>
      <div class="reg reg-tl" id="oc-reg-tl">
        <span class="reg-mark">+</span>
        <span class="reg-lbl">${esc(spec.title.toUpperCase())}</span>
      </div>
      <div class="reg reg-br" id="oc-reg-br">
        <span class="reg-lbl">END OF WALKTHROUGH</span>
        <span class="reg-mark">+</span>
      </div>
      <div class="oc-inner">
        <p class="oc-kicker" id="oc-kicker">/ See it live</p>
        <div class="oc-rule" id="oc-rule"></div>
        ${spec.outro ? `<p class="oc-url" id="oc-url">${esc(spec.outro)}</p>` : ""}
        ${spec.outroNote ? `<p class="oc-note" id="oc-note">${esc(spec.outroNote)}</p>` : ""}
      </div>
    </section>`;
}

const cardsHtml = slots
  .map((slot) =>
    slot.kind === "title" ? titleCard(slot) : slot.kind === "outro" ? outroCard(slot) : shotCard(slot)
  )
  .join("\n");

// ---- GSAP timeline ----
// Only opacity / scale / x / y / scaleX / scaleY. Effect geometry is static CSS; we only
// animate its opacity/transform. The image gets a content-aware move: for spotlight it
// scales gently toward the region's centre; otherwise a subtle alternating Ken-Burns.
function timelineJs() {
  const lines = [];
  lines.push(`const tl = gsap.timeline({ paused: true });`);

  // --- title ---
  const titleSlot = slots.find((s) => s.kind === "title");
  const ts = titleSlot.start;
  lines.push(`tl.set("#card-title", { opacity: 0 }, 0);`);
  lines.push(`tl.to("#card-title", { opacity: 1, duration: ${XF} }, ${ts});`);
  lines.push(`tl.from("#tc-ghost", { opacity: 0, scale: 1.08, duration: 1.2, ease: "power2.out" }, ${ts});`);
  lines.push(`tl.to("#tc-ghost", { x: -36, duration: ${n3(titleSlot.dur)}, ease: "none" }, ${ts});`);
  lines.push(`tl.fromTo("#tc-glow", { scale: 0.92 }, { scale: 1.06, duration: ${n3(titleSlot.dur)}, ease: "sine.inOut" }, ${ts});`);
  lines.push(`tl.from("#tc-reg-tl", { opacity: 0, x: -18, duration: 0.7, ease: "power2.out" }, ${n3(ts + 0.15)});`);
  lines.push(`tl.from("#tc-reg-br", { opacity: 0, x: 18, duration: 0.7, ease: "power2.out" }, ${n3(ts + 0.3)});`);
  lines.push(`tl.from("#tc-kicker", { opacity: 0, y: 12, duration: 0.7, ease: "power3.out" }, ${n3(ts + 0.1)});`);
  lines.push(`tl.from("#tc-title", { opacity: 0, y: 40, duration: 1.0, ease: "expo.out" }, ${ts});`);
  lines.push(`tl.from("#tc-rule", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, ${n3(ts + 0.35)});`);
  lines.push(`tl.from("#tc-sub", { opacity: 0, y: 18, duration: 0.8, ease: "power2.out" }, ${n3(ts + 0.45)});`);
  lines.push(`tl.to("#card-title", { opacity: 0, duration: ${XF} }, ${n3(ts + titleSlot.dur - XF)});`);

  // --- shots ---
  slots
    .filter((s) => s.kind === "shot")
    .forEach((slot) => {
      const i = slot.index;
      const s = shots[i];
      const eff = s.effect || null;
      const dir = i % 2 === 0 ? 1 : -1;
      const start = slot.start;
      const dur = slot.dur;
      const fadeOutAt = n3(start + dur - XF);
      const settle = start + XF; // moment the card is fully visible

      lines.push(`tl.set("#card-shot-${i}", { opacity: 0 }, 0);`);
      lines.push(`tl.to("#card-shot-${i}", { opacity: 1, duration: ${XF} }, ${start});`);

      // --- image motion (content-aware) ---
      if (eff && eff.type === "spotlight" && eff.region) {
        // Push the image toward the region centre and scale up gently = a camera move
        // INTO the highlighted panel. (x/y in px; converted from normalized offset.)
        const r = eff.region;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const sc = eff.scale || 1.08;
        // shift so the region centre drifts toward frame centre as we zoom
        const dx = ((0.5 - cx) * W * (sc - 1)).toFixed(1);
        const dy = ((0.5 - cy) * H * (sc - 1)).toFixed(1);
        lines.push(
          `tl.fromTo("#shot-img-${i}", { scale: 1.0, x: 0, y: 0 }, { scale: ${sc}, x: ${dx}, y: ${dy}, duration: ${n3(dur)}, ease: "power1.inOut" }, ${start});`
        );
      } else if (eff && eff.type === "scroll-pan") {
        // Tall document filling the frame WIDTH: scroll the whole page from its top edge
        // down to its bottom over the shot. The image is `width:100%; height:auto`
        // top-anchored, so scaledHeight = W * (imgH/imgW); we translate y from a small
        // settle offset to -(scaledHeight - H) so the bottom lands in frame at the end.
        const ar = eff.imageAspect || 2.7; // intrinsic height/width (proposal ≈ 4174/1536)
        const scaledH = W * ar; // px height when the image fills frame width
        const travel = Math.max(0, scaledH - H); // how far we can scroll before the bottom shows
        const startY = 0; // begin at the very top of the document
        // hold briefly at the top, then a smooth continuous downward read, holding the
        // bottom at the end so the signature block is legible.
        lines.push(
          `tl.set("#shot-img-${i}", { y: ${startY}, scale: 1 }, 0);`
        );
        lines.push(
          `tl.to("#shot-img-${i}", { y: ${(-travel).toFixed(0)}, duration: ${n3(Math.max(1, dur - 1.4))}, ease: "power1.inOut" }, ${n3(start + 0.7)});`
        );
      } else if (eff && eff.type === "document-assemble") {
        // Tall doc: a slow downward pan so the eye travels scope -> totals -> signature.
        lines.push(
          `tl.fromTo("#shot-img-${i}", { scale: 1.02, y: 0 }, { scale: 1.04, y: -28, duration: ${n3(dur)}, ease: "none" }, ${start});`
        );
      } else {
        // default subtle Ken-Burns, alternating direction
        lines.push(
          `tl.fromTo("#shot-img-${i}", { scale: 1.04, x: ${(6 * dir).toFixed(1)}, y: -4 }, { scale: 1.10, x: ${(-6 * dir).toFixed(1)}, y: 4, duration: ${n3(dur)}, ease: "none" }, ${start});`
        );
      }

      // --- support-text overlay (type-on feel: number, then title slide, then text fade) ---
      if (s.title || s.supportText) {
        lines.push(`tl.from("#sup-${i}", { opacity: 0, duration: 0.45, ease: "power2.out" }, ${n3(settle - 0.15)});`);
        lines.push(`tl.from("#sup-num-${i}", { opacity: 0, x: -14, duration: 0.5, ease: "power3.out" }, ${n3(settle)});`);
        if (s.title)
          lines.push(`tl.from("#sup-title-${i}", { opacity: 0, y: 22, duration: 0.7, ease: "expo.out" }, ${n3(settle + 0.1)});`);
        if (s.supportText)
          lines.push(`tl.from("#sup-text-${i}", { opacity: 0, y: 14, duration: 0.6, ease: "power2.out" }, ${n3(settle + 0.35)});`);
      }

      // --- the content-aware effect itself ---
      const efxStart = settle + 0.5; // let the screen land + text begin first
      if (eff && eff.type === "spotlight") {
        lines.push(`tl.set("#fx-${i}", { opacity: 1 }, 0);`);
        lines.push(`tl.from("#fx-dim-${i}", { opacity: 0, duration: 0.6, ease: "power2.out" }, ${n3(efxStart)});`);
        lines.push(`tl.fromTo("#fx-spot-${i}", { opacity: 0, scale: 1.10 }, { opacity: 1, scale: 1.0, duration: 0.7, ease: "back.out(1.6)", transformOrigin: "center center" }, ${n3(efxStart + 0.1)});`);
        // gentle breathing pulse on the highlight so it draws the eye
        lines.push(`tl.to("#fx-spot-${i}", { opacity: 0.72, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1 }, ${n3(efxStart + 1.0)});`);
      } else if (eff && eff.type === "sweep") {
        lines.push(`tl.set("#fx-${i}", { opacity: 1 }, 0);`);
        lines.push(`tl.from("#fx-zone-${i}", { opacity: 0, duration: 0.5, ease: "power2.out" }, ${n3(efxStart)});`);
        // band travels left -> right across its own clip (xPercent so it's width-relative)
        // band only translates (opacity stays steady via CSS) -> no opacity tween overlap.
        lines.push(`tl.fromTo("#fx-band-${i}", { xPercent: -120 }, { xPercent: 520, duration: 2.1, ease: "power1.inOut" }, ${n3(efxStart + 0.15)});`);
      } else if (eff && eff.type === "reveal-sequence") {
        const regions = eff.regions || [];
        lines.push(`tl.set("#fx-${i}", { opacity: 1 }, 0);`);
        regions.forEach((r, k) => {
          const at = efxStart + k * 0.55;
          lines.push(`tl.fromTo("#fx-rev-${i}-${k}", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1.0, duration: 0.5, ease: "back.out(1.5)", transformOrigin: "center center" }, ${n3(at)});`);
          // fade earlier ones back to a quiet steady state so the latest one leads
          if (k > 0)
            lines.push(`tl.to("#fx-rev-${i}-${k - 1}", { opacity: 0.4, duration: 0.4, ease: "power1.out" }, ${n3(at)});`);
        });
      } else if (eff && eff.type === "document-assemble") {
        const regions = eff.regions || [];
        lines.push(`tl.set("#fx-${i}", { opacity: 1 }, 0);`);
        // a read-line that travels down (px transform) as bands light up. It is positioned
        // statically at the first region's top via inline `top`; only `y` (transform) moves.
        if (regions.length) {
          const firstY = regions[0].y;
          const lastY = regions[regions.length - 1].y + regions[regions.length - 1].h;
          const travelPx = ((lastY - firstY) * H).toFixed(0);
          lines.push(`tl.fromTo("#fx-read-${i}", { opacity: 0, y: 0 }, { opacity: 1, duration: 0.4 }, ${n3(efxStart)});`);
          lines.push(`tl.to("#fx-read-${i}", { y: ${travelPx}, duration: ${n3(Math.max(1.4, regions.length * 0.6))}, ease: "power1.inOut" }, ${n3(efxStart)});`);
          lines.push(`tl.to("#fx-read-${i}", { opacity: 0, duration: 0.4 }, ${n3(efxStart + Math.max(1.4, regions.length * 0.6))});`);
        }
        regions.forEach((r, k) => {
          const at = efxStart + 0.2 + k * 0.6;
          lines.push(`tl.fromTo("#fx-doc-${i}-${k}", { opacity: 0, scaleX: 0.9 }, { opacity: 1, scaleX: 1.0, duration: 0.55, ease: "power2.out", transformOrigin: "left center" }, ${n3(at)});`);
        });
        // settle: dim the bands a touch so the final document reads clean
        lines.push(`tl.to("#fx-${i}", { opacity: 0.55, duration: 0.5, ease: "power1.out" }, ${n3(efxStart + 0.2 + regions.length * 0.6 + 0.4)});`);
      }

      lines.push(`tl.to("#card-shot-${i}", { opacity: 0, duration: ${XF} }, ${fadeOutAt});`);
    });

  // --- outro ---
  const outroSlot = slots.find((s) => s.kind === "outro");
  const os = outroSlot.start;
  lines.push(`tl.set("#card-outro", { opacity: 0 }, 0);`);
  lines.push(`tl.to("#card-outro", { opacity: 1, duration: ${XF} }, ${os});`);
  lines.push(`tl.from("#oc-ghost", { opacity: 0, scale: 1.06, duration: 1.1, ease: "power2.out" }, ${os});`);
  lines.push(`tl.to("#oc-ghost", { x: 30, duration: ${n3(outroSlot.dur)}, ease: "none" }, ${os});`);
  lines.push(`tl.fromTo("#oc-glow", { scale: 0.9 }, { scale: 1.08, duration: ${n3(outroSlot.dur)}, ease: "sine.inOut" }, ${os});`);
  lines.push(`tl.from("#oc-reg-tl", { opacity: 0, x: -18, duration: 0.7, ease: "power2.out" }, ${n3(os + 0.15)});`);
  lines.push(`tl.from("#oc-reg-br", { opacity: 0, x: 18, duration: 0.7, ease: "power2.out" }, ${n3(os + 0.3)});`);
  lines.push(`tl.from("#oc-kicker", { opacity: 0, y: 12, duration: 0.6, ease: "power3.out" }, ${n3(os + 0.1)});`);
  lines.push(`tl.from("#oc-rule", { scaleX: 0, duration: 0.8, ease: "power2.inOut" }, ${n3(os + 0.2)});`);
  if (spec.outro)
    lines.push(`tl.from("#oc-url", { opacity: 0, y: 20, duration: 0.8, ease: "expo.out" }, ${n3(os + 0.35)});`);
  if (spec.outroNote)
    lines.push(`tl.from("#oc-note", { opacity: 0, y: 12, duration: 0.7, ease: "power2.out" }, ${n3(os + 0.55)});`);

  lines.push(`window.__timelines = window.__timelines || {};`);
  lines.push(`window.__timelines["root"] = tl;`);
  return lines.join("\n      ");
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="./gsap.min.js"><\/script>
    <style>
      @font-face { font-family: "Fraunces"; font-style: normal; font-weight: 300 900;
        font-display: block; src: url("assets/fonts/fraunces.woff2") format("woff2"); }
      @font-face { font-family: "Space Grotesk"; font-style: normal; font-weight: 300 700;
        font-display: block; src: url("assets/fonts/space-grotesk.woff2") format("woff2"); }
      @font-face { font-family: "JetBrains Mono"; font-style: normal; font-weight: 400 700;
        font-display: block; src: url("assets/fonts/jetbrains-mono.woff2") format("woff2"); }

      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: ${W}px; height: ${H}px; overflow: hidden;
        background: ${t.ink};
        font-family: ${t.fontBody};
        color: ${t.paper};
      }
      #root {
        position: relative; width: ${W}px; height: ${H}px; background: ${t.ink};
        background-image:
          radial-gradient(120% 80% at 78% -8%, rgba(232,161,60,0.10), transparent 55%),
          radial-gradient(90% 60% at 8% 102%, rgba(90,209,196,0.05), transparent 50%),
          linear-gradient(transparent 0 calc(100% - 1px), rgba(255,255,255,0.022) calc(100% - 1px)),
          linear-gradient(90deg, transparent 0 calc(100% - 1px), rgba(255,255,255,0.022) calc(100% - 1px));
        background-size: 100% 100%, 100% 100%, 100% 64px, 64px 100%;
      }
      .card { position: absolute; inset: 0; width: ${W}px; height: ${H}px; }

      /* ---- shared foreground detailing ---- */
      .reg {
        position: absolute; display: flex; align-items: center; gap: 16px;
        font-family: ${t.fontMono}; font-size: 20px; font-weight: 500;
        letter-spacing: 0.22em; color: ${t.paperMute};
      }
      .reg-mark { color: ${t.amber}; font-size: 28px; line-height: 1; opacity: 0.9; }
      .reg-tl { top: 64px; left: 80px; }
      .reg-br { bottom: 64px; right: 80px; }
      .tc-ghost, .oc-ghost {
        position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
        font-family: ${t.fontDisplay}; font-weight: 600;
        font-size: 640px; line-height: 0.8; letter-spacing: -0.04em;
        color: ${t.amber}; opacity: 0.05; white-space: nowrap; user-select: none;
      }
      .tc-glow, .oc-glow {
        position: absolute; width: 1100px; height: 1100px; border-radius: 50%;
        left: 60%; top: 38%; transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(232,161,60,0.16), transparent 62%);
        filter: blur(8px);
      }

      /* ---- title card ---- */
      .title-card { display: flex; align-items: center; }
      .tc-inner { position: relative; z-index: 2; padding-left: 160px; max-width: 1300px; }
      .kicker {
        font-family: ${t.fontMono}; font-size: 24px; font-weight: 500;
        letter-spacing: 0.28em; text-transform: uppercase; color: ${t.amber};
        margin-bottom: 24px;
      }
      .tc-title {
        font-family: ${t.fontDisplay}; font-weight: 600; font-size: 188px;
        line-height: 0.92; letter-spacing: -0.025em; color: ${t.paper};
      }
      .tc-sub {
        font-family: ${t.fontBody}; font-size: 36px; color: ${t.paperDim};
        margin-top: 28px; line-height: 1.32; max-width: 30ch;
      }
      .tc-rule {
        width: 280px; height: 3px; background: ${t.amber}; margin: 36px 0 0;
        transform-origin: left center; opacity: 0.9;
      }

      /* ---- shot card ---- */
      .shot-card { display: flex; flex-direction: column; }
      .shot-stage {
        position: absolute; inset: 0; overflow: hidden;
        display: flex; align-items: center; justify-content: center;
      }
      /* the frame is the positioning context for both the image and the effect overlay,
         so normalized effect coordinates map to the SAME box the screenshot fills. */
      .shot-frame { position: relative; width: 100%; height: 100%; overflow: hidden;
        display: flex; align-items: center; justify-content: center; }
      .shot-img { display: block; will-change: transform; }
      .shot-stage-cover .shot-img { width: 100%; height: 100%; object-fit: cover; }
      .shot-stage-contain { padding: 40px 56px 56px; }
      .shot-stage-contain .shot-frame { width: auto; height: 100%; }
      .shot-stage-contain .shot-img {
        max-width: 100%; max-height: 100%; width: auto; height: 100%;
        object-fit: contain;
        border: 1px solid ${t.line}; border-radius: 4px;
        box-shadow: 0 24px 70px rgba(0,0,0,0.55);
        background: #fff;
      }
      /* "width" fit: a tall document fills the frame WIDTH (vertical overflow clipped),
         top-anchored, so a scroll-pan can travel from its top edge down to its bottom.
         The stage clips; the frame is the full canvas; the image is 100% width / auto height. */
      .shot-stage-width { display: block; overflow: hidden; }
      .shot-stage-width .shot-frame {
        width: 100%; height: 100%; display: block; align-items: initial; justify-content: initial;
      }
      .shot-stage-width .shot-img {
        display: block; width: 100%; height: auto;
        object-fit: contain; object-position: top center;
      }

      /* ---- content-aware effect layer ---- */
      .fx-layer { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
      /* a soft full-frame dim so the spotlight reads as a spotlight (kept gentle so the
         rest of the UI is still visible — this is emphasis, not a blackout). */
      .fx-dim {
        position: absolute; inset: 0;
        background: radial-gradient(120% 120% at 50% 50%, rgba(12,11,9,0) 30%, rgba(12,11,9,0.34) 100%);
      }
      .fx-rect {
        position: absolute; display: block;
        border: 3px solid ${t.amber}; border-radius: 14px;
        box-shadow: 0 0 0 2px rgba(12,11,9,0.45), 0 0 48px 6px rgba(232,161,60,0.45),
                    inset 0 0 60px rgba(232,161,60,0.10);
        background: rgba(232,161,60,0.06);
        will-change: transform, opacity;
      }
      .fx-spot {}
      .fx-rev { border-width: 3px; }
      .fx-doc { border-radius: 8px; border-width: 2px; }
      .fx-pin {
        position: absolute; top: -14px; left: 18px; transform: translateY(-100%);
        font-family: ${t.fontMono}; font-size: 22px; font-weight: 600;
        letter-spacing: 0.08em; color: ${t.ink};
        background: ${t.amber}; padding: 6px 14px; border-radius: 6px;
        white-space: nowrap; box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      }
      /* sweep: a steady zone frame + a moving bright band clipped to the zone */
      .fx-zone {
        position: absolute; display: block;
        border: 3px solid ${t.amber}; border-radius: 14px;
        background: rgba(232,161,60,0.05);
        box-shadow: 0 0 40px 4px rgba(232,161,60,0.32);
      }
      .fx-sweep-clip { position: absolute; overflow: hidden; border-radius: 14px; }
      .fx-sweep-band {
        position: absolute; top: 0; left: 0; height: 100%; width: 22%;
        background: linear-gradient(90deg, rgba(232,161,60,0) 0%, rgba(232,161,60,0.55) 50%, rgba(232,161,60,0) 100%);
        will-change: transform, opacity;
      }
      /* document-assemble read-line */
      .fx-readline {
        position: absolute; left: 0; right: 0; height: 4px;
        background: linear-gradient(90deg, transparent, ${t.amber}, transparent);
        box-shadow: 0 0 24px 4px rgba(232,161,60,0.55);
        will-change: transform, opacity;
      }

      /* ---- support-text overlay (title + benefit line) ---- */
      .sup {
        position: absolute; z-index: 5; max-width: 760px;
        padding: 26px 34px 30px; border-radius: 16px;
        background: linear-gradient(180deg, rgba(12,11,9,0.93), rgba(12,11,9,0.86));
        border: 1px solid rgba(232,161,60,0.32);
        box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        backdrop-filter: blur(2px);
      }
      .sup-tl { top: 72px; left: 80px; }
      .sup-tr { top: 72px; right: 80px; text-align: right; }
      .sup-bl { bottom: 80px; left: 80px; }
      .sup-br { bottom: 80px; right: 80px; text-align: right; }
      .sup-num {
        display: inline-block; font-family: ${t.fontMono}; font-size: 20px; font-weight: 600;
        letter-spacing: 0.16em; color: ${t.amber}; margin-bottom: 14px;
      }
      .sup-title {
        font-family: ${t.fontDisplay}; font-weight: 600; font-size: 52px;
        line-height: 1.04; letter-spacing: -0.02em; color: ${t.paper};
      }
      .sup-text {
        font-family: ${t.fontBody}; font-size: 30px; line-height: 1.32;
        color: ${t.paperDim}; margin-top: 16px; max-width: 40ch;
      }
      .sup-tr .sup-text, .sup-br .sup-text { margin-left: auto; }

      /* ---- outro card ---- */
      .outro-card { display: flex; align-items: center; justify-content: center; }
      .oc-inner { position: relative; z-index: 2; text-align: center; }
      .oc-kicker {
        font-family: ${t.fontMono}; font-size: 22px; font-weight: 500;
        letter-spacing: 0.28em; text-transform: uppercase; color: ${t.paperMute};
        margin-bottom: 24px;
      }
      .oc-rule { width: 180px; height: 3px; background: ${t.amber}; margin: 0 auto 36px; transform-origin: center; }
      .oc-url {
        font-family: ${t.fontMono}; font-size: 76px; font-weight: 600;
        letter-spacing: 0.02em; color: ${t.amber};
      }
      .oc-note { font-family: ${t.fontBody}; font-size: 30px; color: ${t.paperDim}; margin-top: 24px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="root" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
${cardsHtml}
    </div>
    <script>
      ${timelineJs()}
    <\/script>
  </body>
</html>
`;

const outFile = join(outDir, "index.html");
writeFileSync(outFile, html, "utf8");
console.log(`composition written: ${outFile}`);
console.log(`  ${W}x${H} @ ${FPS}fps · ${shots.length} shots · total ${TOTAL}s`);
