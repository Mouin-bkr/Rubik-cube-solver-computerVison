#!/usr/bin/env bash
set -euo pipefail

# Start Flask (Python) and Express (Node) for production
# Expects PORT for Express; Flask will read PORT for itself if run separately

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="${SCRIPT_DIR}"

# Activate venv if present
if [ -f "$SERVER_ROOT/.venv/bin/activate" ]; then
  . "$SERVER_ROOT/.venv/bin/activate"
fi

# Start Flask
FLASK_PORT=${FLASK_PORT:-5000}
export PORT=${FLASK_PORT}
python "$SERVER_ROOT/src/flask_server.py" &
FLASK_PID=$!

# Build and start Express
if [ -f "$SERVER_ROOT/tsconfig.json" ]; then
  (cd "$SERVER_ROOT" && npm run build)
fi

NODE_PORT=${NODE_PORT:-3001}
PORT=${NODE_PORT} node "$SERVER_ROOT/dist/index.js" &
NODE_PID=$!

echo "Flask PID: $FLASK_PID on $FLASK_PORT"
echo "Express PID: $NODE_PID on $NODE_PORT"

trap 'kill $FLASK_PID $NODE_PID 2>/dev/null || true' EXIT
wait
