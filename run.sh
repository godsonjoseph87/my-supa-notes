#!/usr/bin/env bash
# NoteNest run script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null || echo "v0.0.0")
MAJOR_VERSION=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')

if [ "$MAJOR_VERSION" -lt 18 ]; then
  # Look for modern node in cache or local paths
  MODERN_NODE=$(find /home/godson/.cache/aws/toolkits/language-servers -name "node" -type f 2>/dev/null | head -n 1)
  if [ -n "$MODERN_NODE" ]; then
    mkdir -p /tmp/node-bin
    ln -sf "$MODERN_NODE" /tmp/node-bin/node
    printf '#!/bin/sh\nexport NODE_PATH=/usr/share/nodejs\nexec /tmp/node-bin/node /usr/bin/npm "$@"\n' > /tmp/node-bin/npm
    chmod +x /tmp/node-bin/npm
    export PATH=/tmp/node-bin:$PATH
  fi
fi

if [ -n "$1" ]; then
  exec npm run "$@"
else
  echo "Starting NoteNest with Node $(node -v)..."
  exec npm run dev
fi
