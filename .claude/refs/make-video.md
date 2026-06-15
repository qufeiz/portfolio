# Ref — make a screenshot-walkthrough video (Hyperframes → MP4)

> The how-to for the **`make-video`** worker subagent (`.claude/agents/make-video.md`).
> The LEAD spawns this named subagent with a high-level goal + a video spec ("render the
> walkthrough described in `<spec>` to `<output>` and embed it"); its def points it here, and
> you follow this ref exactly: build from the reusable template, render OFFLINE (FFmpeg +
> headless Chrome), verify with `ffprobe`, embed it base-aware, prove `npm run build` passes,
> report. You do **NOT** deploy.

# Make Video — one walkthrough MP4 from a data-driven spec

You are a **focused single-video worker** spawned by the portfolio lead. Your ENTIRE job is:
take a video spec (a title + an ordered list of screenshots-with-captions + an output path),
build the composition from the **reusable screenshot-walkthrough template**, render it to an MP4
**offline** with the local FFmpeg + a headless Chrome, downscale/transcode it to a web-reasonable
size, generate a poster frame, **verify it with `ffprobe`**, embed it on the target page
base-aware, confirm `npm run build` passes, and report. One video, then report. You do **NOT**
deploy.

> **The official Hyperframes skill is AUTHORITATIVE (required, not optional).** This repo renders
> with HeyGen's open-source **Hyperframes** via the official skill bundle. Install it once
> (`npx skills add heygen-com/hyperframes`) and FOLLOW it as the guide for the composition format,
> the seekable-animation wiring, registry blocks, and the exact CLI loop. **Do NOT reverse-engineer
> or improvise the Hyperframes format.** The skills install to `.agents/skills/hyperframes-*` and
> `.agents/skills/{website-to-video,general-video,...}` — read these, in this order, before
> authoring:
> 1. **`hyperframes-read-first`** — the router. A site's product screenshots → a multi-scene
>    showcase video routes to **`/general-video`** (the input/length-agnostic HTML-composition
>    authoring flow; `/website-to-video` is the sibling when you still need to *capture* a live URL —
>    here the shots already exist, so capture is done).
> 2. **`hyperframes-core`** — the HTML composition CONTRACT (standalone root sized; every timed
>    element `class="clip"` + `data-start`/`data-duration`/`data-track-index`; ONE paused GSAP
>    timeline registered on `window.__timelines["<root-id>"]`, built synchronously; no
>    `Date.now()`/`Math.random()`/network; no animating `display`/`visibility` — only
>    opacity/transforms; tracks are TEMPORAL — crossfade overlaps go on DIFFERENT track indices).
> 3. **`general-video`** + **`hyperframes-creative/references/{house-style,video-composition}.md`**
>    — the build flow (design system → plan → layout-before-animation → build → validate) and the
>    **"produced, not generated" density rules** (edge-anchored registration metadata, oversized
>    ghost type, structural rules, ambient motion on decoratives, 8-10 elements/scene — NOT a
>    centered stack on flat color). The template below already encodes these; honor them on edits.
> 4. **`hyperframes-cli`** — the dev loop: `lint` → `validate` → `inspect` → `snapshot` → `render`.
>    Run ALL of lint + validate + inspect (each catches what the others miss — `inspect` is the one
>    that caught a real off-canvas caption transient here).
>
> The reusable `build-composition.mjs` template in `.claude/make-video/` was authored THROUGH this
> skill and conforms to its contract. Use it as the generator; when you change it, re-read the
> relevant skill section rather than improvising.

> **The OFFLINE constraint (HARD — read this twice).** Rendering is **heavy** and must run only
> here, in a worker, OUT OF BAND. It is **NEVER** part of the Astro / GitHub-Pages build. The MP4
> + poster are committed **static assets** under `public/`; `npm run build` only copies them. Do
> NOT add any render step, postinstall hook, or `npm run` script that invokes Hyperframes — that
> would make Pages try to render a video on every deploy (it can't, and shouldn't). The build
> stays a pure static copy.

> **You propose, never overclaim.** The captions must be true to the real product. Use the real
> captions from the source (e.g. `src/data/treaxeShots.ts`); trim for legibility but don't invent
> features. The honesty + confidentiality gates in `AGENTS.md` apply to video captions exactly as
> they do to article copy (TreAxe co-built with a collaborator; FredGPT confidentiality held; no
> invented metrics).

**Before starting, create a TodoWrite list with these steps:**
```
Step 0 — SKILL + ENV: ensure the official skill is installed (npx skills add heygen-com/hyperframes);
         read hyperframes-read-first → -core → general-video + creative refs → -cli. PATH includes
         ffmpeg; set HYPERFRAMES_BROWSER_PATH to a headless Chrome.
Step 1 — SPEC: get/confirm the spec (title, subtitle, ordered shots[{image,caption,fit}], outro, output path).
Step 2 — STAGE: copy the chosen screenshots into a scratch project's assets/; copy the template + gsap + fonts.
Step 3 — BUILD the composition: node build-composition.mjs <spec.json> <projDir>  (emits index.html).
Step 4 — VALIDATE (the documented loop, ALL of them): hyperframes lint (0 errors) → validate (WCAG/console)
         → inspect (layout overflow; 0 issues or every overflow intentionally marked) → snapshot --at ...
         to eyeball the contact sheet. Fix until clean.
Step 5 — RENDER offline: hyperframes render -o <proj>/walkthrough.raw.mp4 --quality standard.
Step 6 — TRANSCODE to web size (<20MB target) + faststart + yuv420p; generate the poster JPG.
Step 7 — VERIFY with ffprobe (duration + h264/yuv420p + dimensions); deliver MP4 + poster to public/<dir>/.
Step 8 — EMBED base-aware (<video ... poster={asset(...)}> + <source src={asset(...)}>) on the target page.
Step 9 — npm run build must pass (NOT a render step — the MP4 is a committed static asset).
Step 10 — UPDATE the ledger + report (do NOT deploy).
```

---

## Step 0 — Skill + environment (this box; verified working)

**Install / confirm the official skill FIRST** (it is authoritative — see the box above):

```bash
npx skills add heygen-com/hyperframes      # installs .agents/skills/hyperframes-* + workflows
```

Then read, in order: `hyperframes-read-first` (route → `/general-video` for a screenshots-→-showcase),
`hyperframes-core` (the composition contract), `general-video` +
`hyperframes-creative/references/{house-style,video-composition}.md` (build flow + density rules),
`hyperframes-cli` (the lint/validate/inspect/render loop). If `npx skills add` ever fails here,
report exactly why and fetch the skill docs (`hyperframes.heygen.com/llms.txt` / `npx hyperframes
docs <topic>`) to follow them instead — do NOT silently improvise the format.

This repo renders with **Hyperframes** (HeyGen's open-source HTML/CSS/JS → MP4 renderer, run via
`npx hyperframes@<ver>`). It needs FFmpeg + a headless Chrome; both are present on this box but not
where Hyperframes auto-finds them, so set them explicitly:

```bash
# FFmpeg / FFprobe live in ~/.local/bin
export PATH=/home/codex/.local/bin:$PATH

# Hyperframes wants chrome-headless-shell. Its own downloader is OFFLINE-blocked on this box,
# so point it at the Playwright Chromium that's already installed:
export HYPERFRAMES_BROWSER_PATH=/home/codex/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell
# (fallback, full chrome — slower screenshot path, also works:
#  /home/codex/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome )
```

Sanity-check once: `npx --yes hyperframes doctor` should show ✓ FFmpeg, ✓ FFprobe. Chrome shows ✗
only because Hyperframes can't *download* its own — `HYPERFRAMES_BROWSER_PATH` overrides that
(it takes top priority in Hyperframes' browser resolution and only needs the file to exist; the
version mismatch — Playwright is newer than the 131 Hyperframes asks for — does not block render).

> **GSAP + fonts are vendored** in the template home so the render needs **no network**. Do not
> reintroduce a CDN `<script src="https://...gsap...">` — keep `./gsap.min.js` local.

## Step 1 — The spec (what you build from)

The video is fully data-driven by a JSON spec. Shape:

```json
{
  "title": "TreAxe",
  "subtitle": "Construction operations — one connected workflow, lead to final payment",
  "outro": "www.treaxe.io",
  "outroNote": "A production construction-operations platform. Co-built with a collaborator.",
  "width": 1920, "height": 1080, "fps": 30,
  "shotDuration": 4.2, "transition": 0.8, "titleDuration": 3.0, "outroDuration": 3.4,
  "shots": [
    { "image": "assets/dashboard.png", "fit": "cover",   "caption": "Role-aware dashboard ..." },
    { "image": "assets/proposal.png",  "fit": "contain", "caption": "One click turns ..." }
  ],
  "theme": { "amber": "#e8a13c" }
}
```

- **`shots[].fit`** — `"cover"` fills the 16:9 frame (landscape app screenshots); `"contain"`
  fits the whole image letterboxed (tall documents like the proposal PDF). Pick per-image: a
  2880×1800 app shot is `cover`; a 1536×4174 PDF is `contain`.
- **`caption`** — TRUE to the product. Pull from the real source (`src/data/treaxeShots.ts`),
  trim long ones so they fit one or two lines on screen.
- **Timing** — ~3–5s per shot (default 4.2s) keeps it legible. A 6-shot deck lands ~26s.
- **`theme`** — overrides the site palette defaults (ink `#0c0b09`, amber `#e8a13c`). Fonts are
  Fraunces / Space Grotesk / JetBrains Mono (vendored), with web-safe fallbacks baked in.

The proven TreAxe spec is committed at `.claude/make-video/treaxe.spec.example.json` — copy it as
a starting point.

## Step 2 — Stage a scratch project

Work in `.scratch/` (gitignored), NEVER in `~/Projects` or a sibling dir.

```bash
PROJ=/home/codex/Projects/portfolio/.scratch/video-<name>
TPL=/home/codex/Projects/portfolio/.claude/make-video
mkdir -p "$PROJ/assets/fonts"
cp "$TPL/build-composition.mjs" "$PROJ/"            # the template generator
cp "$TPL/gsap.min.js" "$PROJ/"                       # vendored GSAP (offline)
cp "$TPL/assets/fonts/"*.woff2 "$PROJ/assets/fonts/" # vendored site fonts
printf '{ "id": "%s", "name": "%s" }\n' "video-<name>" "<name>" > "$PROJ/meta.json"
# copy the chosen screenshots into the project (path-stable for the render):
cp public/<dir>/<shot>.png "$PROJ/assets/"           # one per shot
# write the spec:
cp "$TPL/treaxe.spec.example.json" "$PROJ/<name>.spec.json"   # then edit it
```

## Step 3 — Build the composition

```bash
cd "$PROJ"
node build-composition.mjs <name>.spec.json .       # writes index.html in $PROJ
```

The template emits a Hyperframes composition: a **title card**, each **screenshot with its caption
+ a subtle Ken-Burns zoom/pan**, **cross-fade** transitions between cards, then a short **outro**
(the URL). It only animates GSAP-supported props (opacity/scale/x/y) — the renderer rejects others.
Every card is a `.clip` with `data-start`/`data-duration`/`data-track-index`; the GSAP timeline is
paused and registered on `window.__timelines["root"]` (Hyperframes' required contract).

## Step 4 — Validate (the FULL documented loop — lint + validate + inspect + snapshot)

Run all of these; each catches what the others miss (the `hyperframes-cli` skill is explicit about
this — `inspect` is what caught a real off-canvas caption transient here that lint/validate passed):

```bash
npx --yes hyperframes lint                 # 0 errors (the two warnings below are benign)
npx --yes hyperframes validate             # headless-Chrome: 0 console errors + WCAG AA contrast
npx --yes hyperframes inspect --samples 15 # 0 layout issues (text overflow / off-canvas / clipping)
npx --yes hyperframes snapshot --at 1.6,7.2,15.0,21.0,23.6,25.8 --describe false
```

`snapshot` writes `snapshots/contact-sheet.jpg` — open it and confirm the title, each shot+caption,
the `contain` document, and the outro look right.

- **Benign lint warnings** (do NOT chase): `gsap_studio_edit_blocked` (we intentionally own the
  timeline) and `font_family_without_font_face` for `sfmono-regular` (a fallback name in the mono
  stack — the real JetBrains Mono is declared).
- **`inspect` overflow:** the Ken-Burns image scale deliberately overruns the shot stage, so the
  template marks `.shot-stage`/`.shot-img` with `data-layout-allow-overflow`. Caption entrances
  animate from a NEGATIVE `y` (above their resting spot, in-frame) so the bar never leaves the
  canvas during entry — that is why `inspect` reports **0 issues**. If you change the caption
  animation, keep it in-frame or mark it; don't let a real off-canvas error through.

## Step 5 — Render OFFLINE

```bash
npx --yes hyperframes render -o "$PROJ/walkthrough.raw.mp4" --quality standard
```

This launches the headless Chrome (per `HYPERFRAMES_BROWSER_PATH`), captures every frame, embeds
the vendored fonts as data URIs (you'll see `Embedded local font file: …`), and encodes with the
local FFmpeg. Output is H.264 / yuv420p already. A 26s 1080p deck renders in ~45s here.
(`--quality high` is available; `standard` is plenty for screenshots and smaller.) The raw output
is ~25MB; Step 6 transcodes it down.

## Step 6 — Transcode to a web-reasonable size + poster

Hyperframes' raw output can exceed the **<20MB** target. Re-encode with a CRF that keeps fine
screenshot **text legible** while shrinking the file (CRF 20 ≈ 9MB for a 26s 1080p deck — the
right balance; CRF 22 ≈ 7MB; CRF 26 ≈ 4MB but softer text). Always force `+faststart` (moov atom
up front for instant web playback) and `yuv420p` (universal browser support):

```bash
ffmpeg -y -i walkthrough.raw.mp4 \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
  -movflags +faststart -an \
  walkthrough.final.mp4

# poster: a clean frame. The title card (~1.7s) makes a strong, on-brand still;
# the first shot (~4.2s) works too if you'd rather lead with a product screen.
ffmpeg -y -ss 1.7 -i walkthrough.final.mp4 -frames:v 1 -q:v 3 walkthrough.poster.jpg
```

If a deck is still over 20MB after CRF tuning, **downscale** (`-vf scale=1600:-2`) before bumping
CRF further — keep text readable over raw shrinkage.

## Step 7 — Verify with ffprobe, then deliver

```bash
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height,pix_fmt,avg_frame_rate \
  -of default=noprint_wrappers=1 walkthrough.final.mp4
# expect: h264 · <W>x<H> · yuv420p · 30/1 · the duration you composed · size < 20MB
# faststart check: ffprobe -v trace ... 2>&1 | grep -m2 "type:'moov'\|type:'mdat'"  (moov BEFORE mdat)
```

Deliver into `public/<dir>/` (committed static assets):

```bash
cp walkthrough.final.mp4  /home/codex/Projects/portfolio/public/<dir>/walkthrough.mp4
cp walkthrough.poster.jpg /home/codex/Projects/portfolio/public/<dir>/walkthrough.poster.jpg
```

## Step 8 — Embed it on the page (base-aware)

The site is served under `/portfolio/` on GitHub Pages, so EVERY asset src MUST go through
`asset()` (`src/lib/url.ts`) — never a hardcoded leading `/`. Add a "Walkthrough" `<section>` near
the top of the target page (mirror the FredGPT embed in `src/pages/work/fredgpt.astro`):

```astro
---
import { asset } from '../../lib/url';
---
<section id="walkthrough" class="demo-video reveal" aria-label="Product walkthrough">
  <p class="kicker">/ Walkthrough</p>
  <div class="dv-frame">
    <video controls muted playsinline preload="none"
           poster={asset('<dir>/walkthrough.poster.jpg')} class="dv-el">
      <source src={asset('<dir>/walkthrough.mp4')} type="video/mp4" />
      <a href={asset('<dir>/walkthrough.mp4')}>Download the walkthrough (MP4)</a>.
    </video>
  </div>
  <p class="dv-cap font-mono">▶ A short tour of the real product screens.</p>
</section>
```

Keep any existing gallery — the video complements it, it doesn't replace it.

## Step 9 — `npm run build` must pass (NOT a render step)

```bash
cd /home/codex/Projects/portfolio && npm run build
```

This must exit 0. It copies the committed MP4/poster from `public/` into `dist/` — it does NOT
render. **If you ever feel tempted to wire the render into the build: don't.** (See the OFFLINE
constraint at the top.) Fix or revert until the tree is green.

## Step 10 — Update the ledger + report (do NOT deploy)

1. **`state/coverage.md`** — if the video closes a real aspect (e.g. "TreAxe / product walkthrough
   video"), flip it Covered (tag `(site: work/<page> walkthrough)`); otherwise note it.
2. **`state/log.md`** — append ONE dated, grep-parseable entry:
   `## YYYY-MM-DD loop-run | rendered <name> walkthrough: public/<dir>/walkthrough.mp4 (<MB>, <dur>s), embedded on work/<page>` + 1-3 bullets (the shots used, the render path, build PASS/FAIL).

Then report — concise and honest:
- **video**: output path + size (MB) + duration + the page it's embedded on.
- **render**: did it render? what Chrome/ffmpeg path. ffprobe summary (codec/dims/pix_fmt).
- **if it could NOT render**: the EXACT reason (missing dep, Chrome version, path) — and still
  hand back the template + spec so it can run elsewhere. Never fake a pass.
- **honesty gate**: captions true to the product; collaborations credited; nothing confidential.
- **build**: PASS / FAIL.
- **ledger**: confirm coverage + log updated.
- **self_check**: did you follow this ref? Anything ambiguous/worked-around — name it for the ratchet.

## References
| Path | Use |
|---|---|
| `.agents/skills/hyperframes-read-first/SKILL.md` | **AUTHORITATIVE — start here.** The Hyperframes router; sends a screenshots-→-showcase to `/general-video`. |
| `.agents/skills/hyperframes-core/SKILL.md` (+ `references/`) | **The composition CONTRACT** — root sizing, `.clip`/`data-*`, the paused-GSAP-timeline rule, tracks-are-temporal, determinism. |
| `.agents/skills/general-video/SKILL.md` | The build flow used here (design → plan → layout-before-animation → build → validate). |
| `.agents/skills/hyperframes-creative/references/{house-style,video-composition}.md` | The "produced, not generated" density rules the title/outro cards encode. |
| `.agents/skills/hyperframes-cli/SKILL.md` | The dev loop: lint → validate → inspect → snapshot → preview → render, and the flag table. |
| `.claude/make-video/build-composition.mjs` | **The reusable template generator** — spec JSON → composition HTML (title card, Ken-Burns shots, cross-fades, outro), authored THROUGH the skill. |
| `.claude/make-video/gsap.min.js` · `.claude/make-video/assets/fonts/*.woff2` | Vendored GSAP + site fonts (Fraunces / Space Grotesk / JetBrains Mono) — so the render is OFFLINE + on-brand. |
| `.claude/make-video/treaxe.spec.example.json` | The proven TreAxe spec — copy as a starting point. |
| `src/lib/url.ts` | `asset()` / `link()` — base-aware URLs (the site lives under `/portfolio/`). |
| `src/pages/work/fredgpt.astro` | The existing `<video>` embed to mirror (`.demo-video` / `.dv-frame` / `.dv-el`). |
| `src/data/treaxeShots.ts` | The real TreAxe captions to draw from (trim, don't invent). |
| `public/treaxe/walkthrough.mp4` · `walkthrough.poster.jpg` | The proof artifact this ref produced. |
| `.claude/AGENTS.md` | Lead runbook + the honesty/confidentiality Gates that apply to captions. |
