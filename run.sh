#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  trap - EXIT INT TERM
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
  if [[ -n "${UI_PID:-}" ]]; then
    kill "${UI_PID}" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd "${ROOT_DIR}"
npm run dev &
BACKEND_PID=$!

cd "${ROOT_DIR}/ui"
npm run dev &
UI_PID=$!

wait "${BACKEND_PID}" "${UI_PID}"
