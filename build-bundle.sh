#!/bin/bash
# Build production bundle by concatenating JS modules in dependency order.
# Each file is already an IIFE — no import/export stripping needed.

set -euo pipefail

OUTPUT="js/bundle.js"

FILES=(
  js/navigation.js
  js/utils.js
  js/dialogs.js
  js/tips-data.js
  js/data-manager.js
  js/csv-handler.js
  js/ofx-handler.js
  js/index.js
  js/goals-categories.js
  js/track-transactions.js
  js/analytics.js
  js/calculator.js
  js/money-tips.js
  js/settings.js
)

echo '"use strict";' > "$OUTPUT"
echo "" >> "$OUTPUT"

for file in "${FILES[@]}"; do
  name=$(basename "$file")
  echo "" >> "$OUTPUT"
  echo "// ============================================================" >> "$OUTPUT"
  echo "// $name" >> "$OUTPUT"
  echo "// ============================================================" >> "$OUTPUT"
  echo "" >> "$OUTPUT"

  cat "$file" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

echo "Bundle written to $OUTPUT ($(wc -c < "$OUTPUT" | tr -d ' ') bytes, $(wc -l < "$OUTPUT" | tr -d ' ') lines)"