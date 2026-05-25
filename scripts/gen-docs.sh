#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# gen-docs.sh — Generates API documentation from source code comments.
#
# Server  (Rust)  : cargo doc --no-deps --document-private-items
# GUI     (C++)   : doxygen gui/Doxyfile
#
# Usage:
#   bun run docs:api          # generate only
#   bun run build:full        # generate + docusaurus build
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$COMMON_DIR/server"
GUI_DIR="$COMMON_DIR/gui"
STATIC_API="$COMMON_DIR/static/api"

# ── Colour helpers ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'
ok()    { echo -e "  ${GREEN}✓${NC} $*"; }
warn()  { echo -e "  ${YELLOW}⚠${NC}  $*"; }
err()   { echo -e "  ${RED}✗${NC} $*"; }
title() { echo -e "\n${BOLD}$*${NC}"; }

mkdir -p "$STATIC_API"

# ── Server — Rust / cargo doc ─────────────────────────────────────────────────
title "Server (Rust)"

if [ ! -f "$SERVER_DIR/Cargo.toml" ]; then
    warn "server/Cargo.toml not found — source code not yet in place, skipping."
elif ! command -v cargo >/dev/null 2>&1; then
    err "cargo not found. Install the Rust toolchain: https://rustup.rs"
else
    echo "  Running cargo doc..."
    (
        cd "$SERVER_DIR"
        cargo doc --no-deps --document-private-items --quiet 2>&1 | sed 's/^/    /'
    )

    DOC_SRC="$SERVER_DIR/target/doc"
    if [ -d "$DOC_SRC" ]; then
        mkdir -p "$STATIC_API/server"
        cp -r "$DOC_SRC"/. "$STATIC_API/server/"
        ok "Rust docs  →  static/api/server/"

        # cargo doc does not always generate a root index.html.
        # If missing, detect the crate directory and create a redirect.
        if [ ! -f "$STATIC_API/server/index.html" ]; then
            CRATE_DIR=$(find "$STATIC_API/server" -maxdepth 2 -name "index.html" \
                | xargs -I{} dirname {} \
                | xargs -I{} basename {} \
                | grep -v '^\.' | head -1 || true)
            if [ -n "$CRATE_DIR" ]; then
                cat > "$STATIC_API/server/index.html" << EOF
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;URL=$CRATE_DIR/index.html">
    <title>$CRATE_DIR — API Reference</title>
  </head>
  <body>
    <p>Redirecting to <a href="$CRATE_DIR/index.html">$CRATE_DIR documentation</a>…</p>
  </body>
</html>
EOF
                ok "Created index.html redirect  →  $CRATE_DIR/"
            else
                warn "Could not detect crate directory — /api/server/ may return 404."
            fi
        fi
    else
        err "cargo doc succeeded but target/doc/ was not found."
    fi
fi

# ── GUI — C++ / Doxygen ───────────────────────────────────────────────────────
title "GUI (C++)"

if [ ! -f "$GUI_DIR/Doxyfile" ]; then
    warn "gui/Doxyfile not found — skipping."
elif ! command -v doxygen >/dev/null 2>&1; then
    err "doxygen not found."
    err "  Ubuntu/Debian : sudo apt install doxygen"
    err "  macOS         : brew install doxygen"
else
    # Check that there is actually source to document
    if [ ! -d "$GUI_DIR/src" ] && [ ! -d "$GUI_DIR/include" ]; then
        warn "gui/src and gui/include not found — source code not yet in place."
        warn "Doxygen will run but produce an empty reference."
    fi

    echo "  Running doxygen..."
    (
        cd "$GUI_DIR"
        doxygen Doxyfile 2>&1 | grep -v "^$" | sed 's/^/    /'
    )
    ok "Doxygen docs  →  static/api/gui/"
fi

# ── AI — language-dependent ───────────────────────────────────────────────────
title "AI (free language)"
warn "No doc generator configured yet."
warn "Add the appropriate tool to this script once the AI language is chosen."

title "Done"
echo "  API docs are available in static/api/ and will be served at /api/"
echo "  Next step: bun run build  (or bun run build:full to regenerate + build)"
echo ""
