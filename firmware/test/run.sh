#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cc -std=c11 -Wall -Wextra -Werror -I"$ROOT/include" -o /tmp/codedeck-debounce "$ROOT/test/test_debounce.c"
/tmp/codedeck-debounce
