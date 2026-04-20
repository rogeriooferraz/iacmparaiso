#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${HOST:-localhost}"
PORT="${PORT:-3000}"
REUSE_EXISTING="${REUSE_EXISTING:-0}"

cd "$ROOT_DIR"

echo "Starting local server for manual testing"
echo "Root: $ROOT_DIR"
echo "URL: http://$HOST:$PORT"

port_is_open() {
  python3 - "$HOST" "$PORT" <<'PY'
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.settimeout(0.2)
    sys.exit(0 if sock.connect_ex((host, port)) == 0 else 1)
PY
}

if [ "$REUSE_EXISTING" = "1" ]; then
  if curl -fsS "http://$HOST:$PORT" 2>/dev/null | grep -q "IACM Paraíso"; then
    echo "Reusing existing server at http://$HOST:$PORT"
    echo "Serving HTTP on $HOST port $PORT (http://$HOST:$PORT/) ..."
    trap 'exit 0' INT TERM
    while :; do
      sleep 3600
    done
  fi
fi

if port_is_open; then
  echo "Port $PORT on $HOST is already in use." >&2
  exit 1
fi

python3 -u -m http.server "$PORT" --bind "$HOST" &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

for _ in $(seq 1 50); do
  if curl -fsS "http://$HOST:$PORT" >/dev/null 2>&1; then
    echo "Serving HTTP on $HOST port $PORT (http://$HOST:$PORT/) ..."
    wait "$SERVER_PID"
    exit $?
  fi

  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    wait "$SERVER_PID"
    exit $?
  fi

  sleep 0.1
done

echo "Failed to confirm local server readiness at http://$HOST:$PORT" >&2
exit 1
