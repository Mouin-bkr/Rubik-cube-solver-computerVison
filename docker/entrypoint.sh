#!/usr/bin/env bash
set -euo pipefail

# Default ports
FLASK_PORT=${FLASK_PORT:-5000}
NODE_PORT=${NODE_PORT:-3001}
PORT=${PORT:-8080}

# Generate nginx config from template (substitute ${PORT})
envsubst '${PORT} FLASK_PORT NODE_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start Flask in background
echo "Starting Flask on port ${FLASK_PORT}..."
python3 /app/Server/src/flask_server.py &
FLASK_PID=$!

# Start Node (Express) in background
echo "Starting Node (Express) on port ${NODE_PORT}..."
node /app/Server/dist/index.js &
NODE_PID=$!

# Start nginx in foreground (Render expects main process to run)
echo "Starting nginx (foreground) listening on port ${PORT}..."
nginx -g 'daemon off;'

# If nginx exits, kill children
trap "kill $FLASK_PID $NODE_PID 2>/dev/null || true" EXIT

wait
