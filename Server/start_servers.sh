#!/bin/bash

echo "Starting Rubik's Cube servers..."

python3 src/flask_server.py &
FLASK_PID=$!

npm run dev &
EXPRESS_PID=$!

echo "Flask server (PID: $FLASK_PID) running on port 5000"
echo "Express server (PID: $EXPRESS_PID) running on port 3001"

trap "kill $FLASK_PID $EXPRESS_PID 2>/dev/null" EXIT

wait
