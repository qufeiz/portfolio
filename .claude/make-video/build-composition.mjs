#!/usr/bin/env node
// build-composition.mjs — the reusable "screenshot-walkthrough" composition template.
//
// Data-driven: reads a spec JSON and emits a Hyperframes composition (index.html).
//   node build-composition.mjs <spec.json> [outDir]
//
// Spec shape:
//   {
//     "title":    "TreAxe",
//     "subtitle": "Construction operations, one connected workflow",
//     "outro":    "www.treaxe.io",            // optional; shown on the outro card
//     "shots": [
//       { "image": "assets/dashboard.png", "caption": "...", "fit": "cover" },
//       ...
//     ],
//     "theme":      { "ink": "#0c0b09", "amber": "#e8a13c", ... },  // optional overrides
//     "width": 1920, "height": 1080, "fps": 30,                     // optional
//     "shotDuration": 4.2, "transition": 0.8,                        // optional (seconds)
//     "titleDuration": 3.0, "outroDuration": 3.2                     // optional (seconds)
//   }
//
// Output is a single self-contained composition that the Hyperframes CLI renders to MP4.
// Animation: title card -> each shot with a subtle Ken-Burns zoom/pan + cross-fades -> outro.
// GSAP is loaded from a vendored local ./gsap.min.js (no network needed at render time).
// Only GSAP-supported props are animated (opacity, scale, x, y) per the renderer's constraints.

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

const SHOT_DUR = spec.shotDuration ?? 4.2; // seconds each screenshot is on screen
const XF = spec.transition ?? 0.8; // cross-fade overlap (seconds)
const TITLE_DUR = spec.titleDuration ?? 3.0;
const OUTRO_DUR = spec.outroDuration ?? 3.2;

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

// ---- timeline math ----
// Cards overlap by XF so they cross-fade. Each card "owns" SHOT_DUR of fully-visible time;
// the next card starts XF before the current one ends.
// title: [0 .. TITLE_DUR]
// shot i: starts at TITLE_DUR - XF + i*(SHOT_DUR - XF)  ... wait: keep it simple & sequential.
const slots = [];
let cursor = 0;
// title
slots.push({ kind: "title", start: cursor, dur: TITLE_DUR });
cursor += TITLE_DUR - XF;
// shots
shots.forEach((s, i) => {
  slots.push({ kind: "shot", index: i, start: cursor, dur: SHOT_DUR });
  cursor += SHOT_DUR - XF;
});
// outro
slots.push({ kind: "outro", start: cursor, dur: OUTRO_DUR });
cursor += OUTRO_DUR;
const TOTAL = +cursor.toFixed(3);

// ---- HTML for each card ----
function titleCard(slot) {
  return `
    <section class="card title-card clip" id="card-title"
             data-start="${slot.start}" data-duration="${slot.dur}" data-track-index="0">
      <!-- background layer: oversized ghost wordmark + breathing glow + blueprint frame -->
      <div class="tc-ghost" id="tc-ghost" aria-hidden="true">${esc(spec.title)}</div>
      <div class="tc-glow" id="tc-glow" aria-hidden="true"></div>
      <!-- edge-anchored registration metadata (foreground detail) -->
      <div class="reg reg-tl" id="tc-reg-tl">
        <span class="reg-mark">+</span>
        <span class="reg-lbl">${esc((spec.regLabel || "PRODUCT WALKTHROUGH").toUpperCase())}</span>
      </div>
      <div class="reg reg-br" id="tc-reg-br">
        <span class="reg-lbl">${String(shots.length).padStart(2, "0")} SCREENS &middot; ${Math.round(TOTAL)}S</span>
        <span class="reg-mark">+</span>
      </div>
      <!-- midground: left-anchored title block -->
      <div class="tc-inner">
        <p class="kicker" id="tc-kicker">/ ${esc(spec.regLabel || "Product walkthrough")}</p>
        <h1 class="tc-title" id="tc-title">${esc(spec.title)}</h1>
        <div class="tc-rule" id="tc-rule"></div>
        ${spec.subtitle ? `<p class="tc-sub" id="tc-sub">${esc(spec.subtitle)}</p>` : ""}
      </div>
    </section>`;
}

function shotCard(slot) {
  const s = shots[slot.index];
  const fit = s.fit === "contain" ? "contain" : "cover";
  const i = slot.index;
  // alternate the Ken-Burns direction so consecutive shots don't move identically
  const dir = i % 2 === 0 ? 1 : -1;
  return `
    <section class="card shot-card clip" id="card-shot-${i}"
             data-start="${slot.start}" data-duration="${slot.dur}" data-track-index="${i + 1}"
             data-kb-dir="${dir}">
      <div class="shot-stage shot-stage-${fit}" data-layout-allow-overflow>
        <img class="shot-img" id="shot-img-${i}" src="${esc(s.image)}" alt="${esc(s.caption || "")}" data-layout-allow-overflow />
      </div>
      <div class="cap-bar" id="cap-bar-${i}" data-layout-allow-overflow>
        <span class="cap-num">${String(i + 1).padStart(2, "0")} / ${String(shots.length).padStart(2, "0")}</span>
        <span class="cap-text">${esc(s.caption || "")}</span>
      </div>
    </section>`;
}

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

// ---- GSAP timeline (only opacity / scale / x / y — the renderer-supported props) ----
// Each card fades in over XF, holds, fades out over XF. The shot image gets a slow
// Ken-Burns scale+pan across its whole on-screen life. Caption slides up under the image.
function timelineJs() {
  const lines = [];
  lines.push(`const tl = gsap.timeline({ paused: true });`);

  // title — varied eases/directions for choreography; ambient drift on the decoratives
  const titleSlot = slots.find((s) => s.kind === "title");
  const ts = titleSlot.start;
  lines.push(`tl.set("#card-title", { opacity: 0 }, 0);`);
  lines.push(`tl.to("#card-title", { opacity: 1, duration: ${XF} }, ${ts});`);
  // background layer
  lines.push(`tl.from("#tc-ghost", { opacity: 0, scale: 1.08, duration: 1.2, ease: "power2.out" }, ${ts});`);
  lines.push(`tl.to("#tc-ghost", { x: -36, duration: ${titleSlot.dur.toFixed(3)}, ease: "none" }, ${ts});`);
  lines.push(`tl.fromTo("#tc-glow", { scale: 0.92 }, { scale: 1.06, duration: ${titleSlot.dur.toFixed(3)}, ease: "sine.inOut" }, ${ts});`);
  // foreground registration metadata
  lines.push(`tl.from("#tc-reg-tl", { opacity: 0, x: -18, duration: 0.7, ease: "power2.out" }, ${(ts + 0.15).toFixed(3)});`);
  lines.push(`tl.from("#tc-reg-br", { opacity: 0, x: 18, duration: 0.7, ease: "power2.out" }, ${(ts + 0.3).toFixed(3)});`);
  // midground title block
  lines.push(`tl.from("#tc-kicker", { opacity: 0, y: 12, duration: 0.7, ease: "power3.out" }, ${(ts + 0.1).toFixed(3)});`);
  lines.push(`tl.from("#tc-title", { opacity: 0, y: 40, duration: 1.0, ease: "expo.out" }, ${ts});`);
  lines.push(`tl.from("#tc-rule", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, ${(ts + 0.35).toFixed(3)});`);
  lines.push(`tl.from("#tc-sub", { opacity: 0, y: 18, duration: 0.8, ease: "power2.out" }, ${(ts + 0.45).toFixed(3)});`);
  lines.push(`tl.to("#card-title", { opacity: 0, duration: ${XF} }, ${(ts + titleSlot.dur - XF).toFixed(3)});`);

  // shots
  slots
    .filter((s) => s.kind === "shot")
    .forEach((slot) => {
      const i = slot.index;
      const dir = i % 2 === 0 ? 1 : -1;
      const fadeOutAt = (slot.start + slot.dur - XF).toFixed(3);
      lines.push(`tl.set("#card-shot-${i}", { opacity: 0 }, 0);`);
      lines.push(`tl.to("#card-shot-${i}", { opacity: 1, duration: ${XF} }, ${slot.start});`);
      // Ken-Burns: slow zoom + a small horizontal drift, alternating direction.
      lines.push(
        `tl.fromTo("#shot-img-${i}", { scale: 1.06, x: ${(8 * dir).toFixed(1)}, y: -6 }, { scale: 1.14, x: ${(-8 * dir).toFixed(1)}, y: 6, duration: ${slot.dur.toFixed(3)}, ease: "none" }, ${slot.start});`
      );
      // caption fades + settles in just after the image lands. Animate from a NEGATIVE y
      // (above its resting spot, fully in-frame) so the bottom edge never leaves the canvas
      // during the entrance — keeps the layout audit clean (no off-canvas transient).
      lines.push(`tl.from("#cap-bar-${i}", { opacity: 0, y: -16, duration: 0.6, ease: "power2.out" }, ${(slot.start + XF).toFixed(3)});`);
      lines.push(`tl.to("#card-shot-${i}", { opacity: 0, duration: ${XF} }, ${fadeOutAt});`);
    });

  // outro — mirror the title's decorative layer + ambient motion
  const outroSlot = slots.find((s) => s.kind === "outro");
  const os = outroSlot.start;
  lines.push(`tl.set("#card-outro", { opacity: 0 }, 0);`);
  lines.push(`tl.to("#card-outro", { opacity: 1, duration: ${XF} }, ${os});`);
  lines.push(`tl.from("#oc-ghost", { opacity: 0, scale: 1.06, duration: 1.1, ease: "power2.out" }, ${os});`);
  lines.push(`tl.to("#oc-ghost", { x: 30, duration: ${outroSlot.dur.toFixed(3)}, ease: "none" }, ${os});`);
  lines.push(`tl.fromTo("#oc-glow", { scale: 0.9 }, { scale: 1.08, duration: ${outroSlot.dur.toFixed(3)}, ease: "sine.inOut" }, ${os});`);
  lines.push(`tl.from("#oc-reg-tl", { opacity: 0, x: -18, duration: 0.7, ease: "power2.out" }, ${(os + 0.15).toFixed(3)});`);
  lines.push(`tl.from("#oc-reg-br", { opacity: 0, x: 18, duration: 0.7, ease: "power2.out" }, ${(os + 0.3).toFixed(3)});`);
  lines.push(`tl.from("#oc-kicker", { opacity: 0, y: 12, duration: 0.6, ease: "power3.out" }, ${(os + 0.1).toFixed(3)});`);
  lines.push(`tl.from("#oc-rule", { scaleX: 0, duration: 0.8, ease: "power2.inOut" }, ${(os + 0.2).toFixed(3)});`);
  if (spec.outro)
    lines.push(`tl.from("#oc-url", { opacity: 0, y: 20, duration: 0.8, ease: "expo.out" }, ${(os + 0.35).toFixed(3)});`);
  if (spec.outroNote)
    lines.push(`tl.from("#oc-note", { opacity: 0, y: 12, duration: 0.7, ease: "power2.out" }, ${(os + 0.55).toFixed(3)});`);

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
      /* Site fonts vendored locally (variable woff2) so the render is offline + on-brand.
         If a face is missing, the family lists web-safe fallbacks. */
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
      /* warm radial atmosphere + faint blueprint grid, echoing the site canvas */
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

      /* ---- shared foreground detailing (registration marks, ghost type, glow) ---- */
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

      /* ---- title card (left-anchored, zone layout) ---- */
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
      .shot-img { display: block; will-change: transform; }
      /* cover: fill the frame (landscape app shots) */
      .shot-stage-cover .shot-img { width: 100%; height: 100%; object-fit: cover; }
      /* contain: fit the whole document, letterboxed (tall PDF/proposal) */
      .shot-stage-contain { padding: 56px 56px 150px; }
      .shot-stage-contain .shot-img {
        max-width: 100%; max-height: 100%; width: auto; height: auto;
        object-fit: contain;
        border: 1px solid ${t.line}; border-radius: 4px;
        box-shadow: 0 24px 70px rgba(0,0,0,0.55);
        background: #fff;
      }
      /* caption bar pinned to the bottom, legible over any screenshot.
         Constrained so even a long, wrapping caption never overruns the frame. */
      .cap-bar {
        position: absolute; left: 0; right: 0; bottom: 0;
        display: flex; align-items: baseline; gap: 22px;
        padding: 30px 80px 34px;
        background: linear-gradient(0deg, rgba(12,11,9,0.97) 0%, rgba(12,11,9,0.84) 58%, rgba(12,11,9,0) 100%);
      }
      .cap-num {
        font-family: ${t.fontMono}; font-size: 22px; font-weight: 600;
        letter-spacing: 0.14em; color: ${t.amber}; flex: 0 0 auto;
        padding-top: 3px;
      }
      .cap-text {
        font-family: ${t.fontBody}; font-size: 29px; line-height: 1.28;
        color: ${t.paper}; flex: 1 1 auto; max-width: 1560px;
      }

      /* ---- outro card (centered — deliberate for a closing) ---- */
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
