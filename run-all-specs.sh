#!/bin/bash
set -o pipefail

ROOT="/home/pau_swapnils/WISP_AUTOMATION/WISP_PW_UI/WISP_PW_UI"
PW="$ROOT/node_modules/.bin/playwright"
cd "$ROOT"

declare -A SPEC_MAP=(
  ["directReplenishment.spec.ts"]="direct-replenishment"
  ["electronicBusinessForms.spec.ts"]="electronic-business-forms"
  ["genericSKUListBuilder.spec.ts"]="generic-sku-list-builder"
  ["inventoryAdjustments.spec.ts"]="inventory-adjustments"
  ["itemInquiry.spec.ts"]="item-inquiry"
  ["labelRequest.spec.ts"]="label-request"
  ["login.spec.ts"]="login"
  ["orderReceiving.spec.ts"]="order-receiving"
  ["planogram.spec.ts"]="planogram"
  ["priceChangeActivation.spec.ts"]="price-change-activation"
  ["reports.spec.ts"]="reports"
  ["storeAddressInquiry.spec.ts"]="store-address-inquiry"
  ["userManagement.spec.ts"]="user-management"
)

ORDERED=(
  "directReplenishment.spec.ts"
  "electronicBusinessForms.spec.ts"
  "genericSKUListBuilder.spec.ts"
  "inventoryAdjustments.spec.ts"
  "itemInquiry.spec.ts"
  "labelRequest.spec.ts"
  "login.spec.ts"
  "orderReceiving.spec.ts"
  "planogram.spec.ts"
  "priceChangeActivation.spec.ts"
  "reports.spec.ts"
  "storeAddressInquiry.spec.ts"
  "userManagement.spec.ts"
)

echo "========================================"
echo "  WISP Automation - Full Suite Run"
echo "========================================"
echo ""

for SPEC in "${ORDERED[@]}"; do
  LABEL="${SPEC_MAP[$SPEC]}"
  echo "----------------------------------------"
  echo "Running: $SPEC  (label: $LABEL)"
  echo "----------------------------------------"

  rm -rf "$ROOT/allure-results" && mkdir "$ROOT/allure-results"

  # Run playwright, capture output; continue regardless of exit code
  PW_OUTPUT=$("$PW" test "tests/$SPEC" 2>&1)
  PW_EXIT=$?

  echo "$PW_OUTPUT"

  # Parse counts from last few lines
  PASSED=$(echo "$PW_OUTPUT" | grep -oP '\d+(?= passed)' | tail -1)
  FAILED=$(echo "$PW_OUTPUT" | grep -oP '\d+(?= failed)' | tail -1)
  SKIPPED=$(echo "$PW_OUTPUT" | grep -oP '\d+(?= did not run)' | tail -1)
  PASSED=${PASSED:-0}
  FAILED=${FAILED:-0}
  SKIPPED=${SKIPPED:-0}
  TOTAL=$(( PASSED + FAILED + SKIPPED ))

  echo ""
  echo ">>> SUMMARY [$SPEC]: Total=$TOTAL  Passed=$PASSED  Failed=$FAILED  DidNotRun=$SKIPPED"
  echo ""

  # Generate allure report
  node "$ROOT/post-run.js" "$LABEL" 2>&1
  echo ""
done

echo "========================================"
echo "  All specs completed."
echo "========================================"
