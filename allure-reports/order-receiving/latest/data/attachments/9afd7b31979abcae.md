# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orderReceiving.spec.ts >> Order & Receiving >> OR_WTC19 - Receive Without PO: Vendor modal filter input and pagination navigation
- Location: tests/orderReceiving.spec.ts:346:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('app-receive-without-po')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('app-receive-without-po')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e9] [cursor=pointer]: print
  - generic [ref=e11]:
    - generic:
      - generic [ref=e14]: 
      - list [ref=e16]:
        - listitem [ref=e17]:
          - generic [ref=e18] [cursor=pointer]: No Application Alerts
        - listitem [ref=e19]:
          - generic [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: arrow_drop_down
            - text: Inquiry
        - listitem [ref=e22]:
          - generic [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: arrow_drop_down
            - text: Ordering and Receiving
        - listitem [ref=e25]:
          - generic [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: arrow_drop_down
            - text: Inventory Adjustments
        - listitem [ref=e28]:
          - generic [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: arrow_drop_down
            - text: Label Request
        - listitem [ref=e31]:
          - generic [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: arrow_drop_down
            - text: Planogram
        - listitem:
          - generic: Price Change Activation
        - listitem:
          - generic: Generic Sku List Builder
        - listitem:
          - generic: Archive Records
        - listitem:
          - generic: User Management
        - listitem [ref=e34]:
          - generic [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: arrow_drop_down
            - text: SISO / DR
        - listitem [ref=e37]:
          - generic [ref=e38] [cursor=pointer]:
            - generic [ref=e39]: arrow_drop_down
            - text: Reports
    - generic [ref=e40]:
      - generic:
        - generic:
          - list [ref=e41]:
            - listitem
            - listitem [ref=e42]:
              - generic [ref=e43] [cursor=pointer]:
                - text: Purchase Order
                - generic "Close Tab" [ref=e44]:
                  - superscript [ref=e45]: x
          - generic: 
          - generic: 
```

# Test source

```ts
  261 |     }
  262 |     if (result.finalizeNoItemsMsg) {
  263 |       expect(result.finalizeNoItemsMsg.length).toBeGreaterThan(0);
  264 |     }
  265 | 
  266 |     await expect(orPage.rwopoRoot).toBeVisible();
  267 |   });
  268 | 
  269 |   // ── OR_WTC15 – Worksheets: Load, search, no-match, reset (OR_UI_044-045) ─────
  270 |   test('OR_WTC15 - Worksheets: load all controls, search variants, no-match error, and reset', async () => {
  271 |     test.setTimeout(90000);
  272 |     const data = orData.find(r => r.testCase === 'OR_WTC15')!;
  273 |     const result = await orPage.tc15_worksheetsLoad(SCREENSHOTS_DIR, data);
  274 | 
  275 |     expect(result.newBtnVisible).toBe(true);
  276 |     expect(result.addItemsBtnVisible).toBe(true);
  277 |     expect(result.deleteBtnVisible).toBe(true);
  278 |     expect(result.approveBtnVisible).toBe(true);
  279 |     expect(result.finalizeBtnVisible).toBe(true);
  280 |     expect(result.printWorksheetBtnVisible).toBe(true);
  281 |     expect(result.vendorNoInputVisible).toBe(true);
  282 |     expect(result.skuInputVisible).toBe(true);
  283 |     expect(result.resetClearsFields).toBe(true);
  284 | 
  285 |     // Grid should have expected columns
  286 |     const expectedCols = ['Vendor Name', 'Vendor#', 'Type', 'Cost'];
  287 |     for (const col of expectedCols) {
  288 |       const found = result.gridHeaders.some(h => h.includes(col));
  289 |       expect(found, `Expected column '${col}' in worksheet grid`).toBe(true);
  290 |     }
  291 | 
  292 |     await expect(orPage.wsRoot).toBeVisible();
  293 |   });
  294 | 
  295 |   // ── OR_WTC16 – Worksheets: New, add items, approve, delete, finalize (OR_UI_046-053) ──
  296 |   test('OR_WTC16 - Worksheets: create new, add items, approve, delete confirmations, finalize guards', async () => {
  297 |     test.setTimeout(120000);
  298 |     const data = orData.find(r => r.testCase === 'OR_WTC16')!;
  299 |     const result = await orPage.tc16_worksheetsActions(SCREENSHOTS_DIR, data);
  300 | 
  301 |     // New always opens vendor modal
  302 |     expect(result.newVendorModalVisible || result.finalizeNoSelMsg.length > 0).toBe(true);
  303 | 
  304 |     if (result.finalizeNoSelMsg) {
  305 |       expect(result.finalizeNoSelMsg).toContain(data.wsNoSelFinalizeMsg.substring(0, 10));
  306 |     }
  307 |     if (result.deleteItemConfirmVisible) {
  308 |       expect(result.deleteItemConfirmVisible).toBe(true);
  309 |     }
  310 | 
  311 |     await expect(orPage.wsRoot).toBeVisible();
  312 |   });
  313 | 
  314 |   // ── OR_WTC17 – Filter PO list by additional criteria: SKU, Vendor#, Description ──
  315 |   test('OR_WTC17 - Filter Purchase Orders by SKU, Vendor Number, and Description criteria', async () => {
  316 |     test.setTimeout(90000);
  317 |     const data = orData.find(r => r.testCase === 'OR_WTC03')!;
  318 |     const result = await orPage.tc17_poAdditionalFilterCriteria(SCREENSHOTS_DIR, data);
  319 | 
  320 |     expect(result.skuFilterApplied).toBe(true);
  321 |     expect(result.vendorNoFilterApplied).toBe(true);
  322 |     expect(result.descFilterApplied).toBe(true);
  323 |     expect(result.skuFilterRowCount).toBeGreaterThanOrEqual(0);
  324 |     expect(result.vendorNoFilterRowCount).toBeGreaterThanOrEqual(0);
  325 |     expect(result.descFilterRowCount).toBeGreaterThanOrEqual(0);
  326 |     expect(result.resetAfterSkuRestored).toBe(true);
  327 | 
  328 |     await expect(orPage.poRoot).toBeVisible();
  329 |     await expect(orPage.poGrid).toBeVisible();
  330 |   });
  331 | 
  332 |   // ── OR_WTC18 – RWOPO: Actions panel collapse/expand behavior ─────────────────
  333 |   test('OR_WTC18 - Receive Without PO: Actions panel collapse and expand behavior', async () => {
  334 |     test.setTimeout(60000);
  335 |     const result = await orPage.tc18_rwopoActionsCollapseExpand(SCREENSHOTS_DIR);
  336 | 
  337 |     expect(result.panelCollapsed).toBe(true);
  338 |     expect(result.panelExpandedAgain).toBe(true);
  339 |     expect(result.buttonsRestoredAfterExpand).toBe(true);
  340 | 
  341 |     await expect(orPage.rwopoRoot).toBeVisible();
  342 |     await expect(orPage.rwopoAddSkuBtn).toBeVisible();
  343 |   });
  344 | 
  345 |   // ── OR_WTC19 – RWOPO: Vendor selection modal filter and pagination ─────────────
  346 |   test('OR_WTC19 - Receive Without PO: Vendor modal filter input and pagination navigation', async () => {
  347 |     test.setTimeout(90000);
  348 |     const data = orData.find(r => r.testCase === 'OR_WTC13')!;
  349 |     const result = await orPage.tc19_rwopoVendorModalFilterPagination(SCREENSHOTS_DIR, data);
  350 | 
  351 |     if (result.vendorModalOpened) {
  352 |       expect(result.filterInputVisible).toBe(true);
  353 |       expect(result.paginationVisible).toBe(true);
  354 |       expect(result.filteredRowCount).toBeGreaterThanOrEqual(0);
  355 |       if (result.nextPageNavigated) {
  356 |         expect(result.rowCountAfterPageNav).toBeGreaterThanOrEqual(0);
  357 |       }
  358 |       expect(result.cancelClosesModal).toBe(true);
  359 |     }
  360 | 
> 361 |     await expect(orPage.rwopoRoot).toBeVisible();
      |                                    ^ Error: expect(locator).toBeVisible() failed
  362 |   });
  363 | 
  364 |   // ── OR_WTC20 – Worksheets: Search by Vendor Name, SKU/UPC, Item Description ────
  365 |   test('OR_WTC20 - Worksheets: search by Vendor Name, SKU/UPC Number, and Item Description', async () => {
  366 |     test.setTimeout(90000);
  367 |     const data = orData.find(r => r.testCase === 'OR_WTC15')!;
  368 |     const result = await orPage.tc20_worksheetsAdditionalSearch(SCREENSHOTS_DIR, data);
  369 | 
  370 |     expect(result.vendorNameSearchRowCount).toBeGreaterThanOrEqual(0);
  371 |     expect(result.skuSearchRowCount).toBeGreaterThanOrEqual(0);
  372 |     expect(result.descSearchRowCount).toBeGreaterThanOrEqual(0);
  373 |     expect(result.resetClearsAllFields).toBe(true);
  374 | 
  375 |     await expect(orPage.wsRoot).toBeVisible();
  376 |   });
  377 | 
  378 |   // ── OR_WTC21 – Worksheets: Actions panel collapse/expand and row expansion ──────
  379 |   test('OR_WTC21 - Worksheets: Actions panel collapse/expand and worksheet row expand/collapse', async () => {
  380 |     test.setTimeout(90000);
  381 |     const result = await orPage.tc21_worksheetsActionsAndRowExpand(SCREENSHOTS_DIR);
  382 | 
  383 |     expect(result.panelCollapsed).toBe(true);
  384 |     expect(result.panelExpandedAgain).toBe(true);
  385 |     expect(result.buttonsRestoredAfterExpand).toBe(true);
  386 | 
  387 |     // nestedContentVisible depends on whether the worksheet has items; the grid must stay stable
  388 |     await expect(orPage.wsRoot).toBeVisible();
  389 |     await expect(orPage.wsNewBtn).toBeVisible();
  390 |   });
  391 | 
  392 |   // ── OR_WTC22 – Double-click PO row to start receiving session (OR_UI_012) ──────
  393 |   test('OR_WTC22 - Double-click PO row shows receiving session confirmation dialog; No keeps on page, Yes navigates', async () => {
  394 |     test.setTimeout(90000);
  395 |     const result = await orPage.tc22_poDoubleClickReceiving(SCREENSHOTS_DIR);
  396 | 
  397 |     // Confirmation dialog must have appeared on double-click
  398 |     expect(result.dblClickDialogVisible).toBe(true);
  399 |     // Clicking No must keep user on the Purchase Orders page
  400 |     expect(result.staysOnPOAfterNo).toBe(true);
  401 | 
  402 |     await expect(orPage.poRoot).toBeVisible();
  403 |   });
  404 | 
  405 |   // ── OR_WTC23 – Reopen PO validation flows: fully received message + closed/cancelled lines (OR_UI_021) ──
  406 |   test('OR_WTC23 - PO Receive: fully-received PO shows guard message; closed/cancelled lines prompt reopen confirmation', async () => {
  407 |     test.setTimeout(90000);
  408 |     const data = orData.find(r => r.testCase === 'OR_WTC09')!;
  409 |     const result = await orPage.tc23_poReopenFlows(SCREENSHOTS_DIR, data);
  410 | 
  411 |     // If a guard message fired, verify its text; the PO page must remain accessible.
  412 |     // Note: a fully-received PO may have Receive disabled at the grid level (OR_UI_018 step 2),
  413 |     // which is also a valid guard condition — the test is informational in that case.
  414 |     if (result.fullyReceivedMsgVisible) {
  415 |       expect(result.fullyReceivedMsgText.length).toBeGreaterThan(0);
  416 |     }
  417 |     if (result.closedCancelledPromptVisible) {
  418 |       expect(result.closedCancelledPromptText.length).toBeGreaterThan(0);
  419 |     }
  420 | 
  421 |     await expect(orPage.poRoot).toBeVisible();
  422 |   });
  423 | 
  424 |   // ── OR_WTC24 – RWOPO inline quantity edit validations (OR_UI_038) ──────────────
  425 |   test('OR_WTC24 - Receive Without PO: inline quantity exceeding max shows block message; threshold triggers warning prompt', async () => {
  426 |     test.setTimeout(120000);
  427 |     const data = orData.find(r => r.testCase === 'OR_WTC14')!;
  428 |     const result = await orPage.tc24_rwopoQtyValidations(SCREENSHOTS_DIR, data);
  429 | 
  430 |     // Grid must be stable regardless of whether vendor/item was available
  431 |     await expect(orPage.rwopoRoot).toBeVisible();
  432 | 
  433 |     if (result.itemAddedToGrid) {
  434 |       // If an item was added, quantity validations must have fired
  435 |       expect(result.maxQtyBlockMsgVisible || result.warningThresholdPromptVisible).toBe(true);
  436 |     }
  437 |   });
  438 | 
  439 |   // ── OR_WTC25 – Worksheets: item qty validations, print guard, finalize exception/unviewed guards, below-min-order ──
  440 |   // Covers OR_UI_048 steps 2-3, OR_UI_051 step 3, OR_UI_052, OR_UI_053 step 2
  441 |   test('OR_WTC25 - Worksheets: item quantity validations, print without selection guard, finalize exception/unviewed guards, below-min-order prompt', async () => {
  442 |     test.setTimeout(180000);
  443 |     const data = orData.find(r => r.testCase === 'OR_WTC15')!;
  444 |     const result = await orPage.tc25_worksheetsItemOpsAndGuards(SCREENSHOTS_DIR, data);
  445 | 
  446 |     // Print Worksheet without selection must return a validation message
  447 |     if (result.printNoSelectionMsg) {
  448 |       expect(result.printNoSelectionMsg.length).toBeGreaterThan(0);
  449 |     }
  450 | 
  451 |     // At least one finalize guard must fire (unviewed items OR unapproved exceptions OR no-items)
  452 |     const anyFinalizeGuard = result.finalizeUnviewedMsg.length > 0 || result.finalizeUnapprovedMsg.length > 0;
  453 |     expect(anyFinalizeGuard || result.belowMinOrderPromptVisible).toBe(true);
  454 | 
  455 |     // If below-min-order fired, the PO Detail modal or a date validation should be accessible
  456 |     if (result.belowMinOrderPromptVisible) {
  457 |       expect(result.belowMinOrderPromptText.length).toBeGreaterThan(0);
  458 |     }
  459 | 
  460 |     await expect(orPage.wsRoot).toBeVisible();
  461 |   });
```