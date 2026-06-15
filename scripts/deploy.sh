#!/usr/bin/env bash
# Deploy the Astro portfolio to GitHub Pages (qufeiz/portfolio → https://qufeiz.github.io/portfolio/)
set -euo pipefail
SITE=/home/codex/Projects/portfolio
DIST="$SITE/dist"
REPO=qufeiz/portfolio

[ -d "$DIST" ] || { echo "ERROR: $DIST missing — build the site first"; exit 1; }

git config --global user.email "qufeizzz@gmail.com" 2>/dev/null || true
git config --global user.name  "qufeiz" 2>/dev/null || true

# 1) create the repo if needed (public)
gh repo view "$REPO" >/dev/null 2>&1 || \
  gh repo create "$REPO" --public -d "Qufeiii — portfolio: TreAxe (construction SaaS) + FredGPT (agentic FRED GenAI)"

# 2) push the SOURCE to main (so the repo has the real source, not just build output)
cd "$SITE"
git init -q
git add -A
git -c user.email=qufeizzz@gmail.com -c user.name=qufeiz commit -q -m "Portfolio site (Astro): TreAxe + FredGPT" || true
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$REPO.git"
git push -u -f origin main

# 3) deploy the BUILD to gh-pages from a clean temp dir (avoids nested .git)
TMP="$(mktemp -d)"
cp -r "$DIST"/. "$TMP"/
touch "$TMP/.nojekyll"          # so GH Pages serves Astro's _astro/ dir
cd "$TMP"
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.email=qufeizzz@gmail.com -c user.name=qufeiz commit -q -m "Deploy portfolio build"
git push -f "https://github.com/$REPO.git" gh-pages
cd /; rm -rf "$TMP"

# 4) enable Pages from gh-pages branch root
gh api -X POST "repos/$REPO/pages" -f source.branch=gh-pages -f source.path=/ >/dev/null 2>&1 \
  || gh api -X PUT "repos/$REPO/pages" -f source.branch=gh-pages -f source.path=/ >/dev/null 2>&1 \
  || true

echo "DEPLOYED → https://qufeiz.github.io/portfolio/"
