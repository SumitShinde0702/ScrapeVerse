#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "${1:-}" == "--live" ]]; then
  node scripts/setup.mjs --live
else
  node scripts/setup.mjs
fi
