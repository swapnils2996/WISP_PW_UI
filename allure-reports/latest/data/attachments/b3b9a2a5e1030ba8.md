# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: IntermittentTestCases.spec.ts >> Intermittent Test Cases - Defect Verification >> ITC-DEF-023 - RWOPO Add SKU Select Items modal must open visibly and be properly positioned
- Location: tests/IntermittentTestCases.spec.ts:361:7

# Error details

```
Error: Select Items modal should be visible after clicking Add SKU

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
    - generic [ref=e42]:
      - list [ref=e43]:
        - listitem
        - listitem [ref=e44]:
          - generic [ref=e45] [cursor=pointer]:
            - text: Receive Without PO
            - generic "Close Tab" [ref=e46]:
              - superscript [ref=e47]: x
      - generic: 
      - generic [ref=e51]:
        - generic [ref=e55]:
          - heading "Actions" [level=4] [ref=e57]:
            - link "Actions" [ref=e58] [cursor=pointer]:
              - /url: "#collapse5"
          - generic [ref=e60]:
            - generic [ref=e61]:
              - button "Add SKU" [disabled] [ref=e63]
              - button "Delete" [disabled] [ref=e65]
              - button "Finalize" [disabled] [ref=e67]
              - button "Print" [ref=e69] [cursor=pointer]
            - generic [ref=e73]: "Purchase Order # - Vendor has not been selected"
        - generic [ref=e76]:
          - generic [ref=e81]:
            - textbox "Filter" [ref=e82]
            - generic:
              - generic: Filter
          - grid [ref=e84]:
            - row "Change sorting for Selected Change sorting for Description Change sorting for Sku Change sorting for Quantity Change sorting for OnOrder" [ref=e85]:
              - columnheader "Change sorting for Selected":
                - generic:
                  - button "Change sorting for Selected"
              - columnheader "Change sorting for Description" [ref=e86]:
                - button "Change sorting for Description" [ref=e88] [cursor=pointer]: Description
              - columnheader "Change sorting for Sku" [ref=e89]:
                - button "Change sorting for Sku" [ref=e91] [cursor=pointer]: SKU
              - columnheader "Change sorting for Quantity" [ref=e92]:
                - button "Change sorting for Quantity" [ref=e94] [cursor=pointer]: Quantity
              - columnheader "Change sorting for OnOrder" [ref=e95]:
                - button "Change sorting for OnOrder" [ref=e97] [cursor=pointer]: On Order
          - generic [ref=e99]:
            - generic [ref=e100]:
              - generic [ref=e101]: "Items per page:"
              - listbox "Items per page:" [ref=e106] [cursor=pointer]:
                - generic [ref=e109]: "10"
            - generic [ref=e113]:
              - generic [ref=e114]: 0 of 0
              - button "Previous page" [disabled] [ref=e115]
              - button "Next page" [disabled] [ref=e118]
```

# Test source

```ts
  270 | 
  271 |   // ── ITC-DEF-038: Pagination Mismatch (Items Per Page Not Applied) ─────────
  272 |   test('ITC-DEF-038 - User Management pagination must correctly split items when page size is changed to 5', async () => {
  273 |     test.setTimeout(90000);
  274 |     const data = getData('ITC-DEF-038');
  275 |     const result = await itcPage.itc_def038_paginationMismatch(SCREENSHOTS_DIR, data);
  276 | 
  277 |     expect(result.pageSizeChangedTo5, 'Page size should be changeable to 5').toBe(true);
  278 |     if (result.pageSizeChangedTo5 && result.initialRowCount > 5) {
  279 |       expect(result.showsMultiplePages,
  280 |         `With ${result.initialRowCount} users and page size 5, pagination should show multiple pages; got: "${result.paginatorText}"`
  281 |       ).toBe(true);
  282 |     }
  283 |   });
  284 | 
  285 |   // ── ITC-DEF-017: PO Receive Loads 0 Items for Open PO ────────────────────
  286 |   test('ITC-DEF-017 - PO Receive must load item lines (not 0 items) for an open Purchase Order', async () => {
  287 |     test.setTimeout(180000);
  288 |     const data = getData('ITC-DEF-017');
  289 |     const result: ITC_DEF017_Result = await itcPage.itc_def017_poReceiveZeroItems(SCREENSHOTS_DIR, data);
  290 | 
  291 |     expect(result.poReceivePageVisible, 'PO Receive page should open successfully').toBe(true);
  292 |     expect(result.itemGridVisible, 'Item grid should be visible on PO Receive page').toBe(true);
  293 |     expect(result.gridHasItems,
  294 |       `PO Receive should show at least 1 item line; found ${result.itemRowCount}`
  295 |     ).toBe(true);
  296 |   });
  297 | 
  298 |   // ── ITC-DEF-018: Purchase Order Detail Omits Cost Cell Value ─────────────
  299 |   test('ITC-DEF-018 - Expanded Purchase Order detail row must display a non-blank Cost cell value', async () => {
  300 |     test.setTimeout(90000);
  301 |     const data = getData('ITC-DEF-018');
  302 |     const result: ITC_DEF018_Result = await itcPage.itc_def018_poCostCellBlank(SCREENSHOTS_DIR, data);
  303 | 
  304 |     expect(result.poGridVisible, 'Purchase Orders grid should be visible').toBe(true);
  305 |     if (result.rowExpanded) {
  306 |       expect(result.costCellIsBlank,
  307 |         `Cost cell should not be blank in expanded PO detail; got: "${result.costCellValue}"`
  308 |       ).toBe(false);
  309 |     } else {
  310 |       expect(result.rowExpanded, 'A PO row should be expandable to show detail columns').toBe(true);
  311 |     }
  312 |   });
  313 | 
  314 |   // ── ITC-DEF-003: Vendor Information Not Displayed in Item Inquiry ─────────
  315 |   test('ITC-DEF-003 - Item Inquiry must display vendor information table with rows for a valid SKU', async () => {
  316 |     test.setTimeout(300000);
  317 |     const data = getData('ITC-DEF-003');
  318 |     const result: ITC_DEF003_Result = await itcPage.itc_def003_vendorInfoNotDisplayed(SCREENSHOTS_DIR, data);
  319 | 
  320 |     expect(result.itemSearchPerformed, 'Item search should complete successfully').toBe(true);
  321 |     expect(result.vendorTableVisible, 'Vendor information table should be visible after item search').toBe(true);
  322 |     expect(result.vendorTableHasRows,
  323 |       `Vendor table should have at least 1 row; found ${result.vendorRowCount}`
  324 |     ).toBe(true);
  325 |   });
  326 | 
  327 |   // ── ITC-DEF-004: Java Webapp Shows $0.00 for Regular/Selling Prices ───────
  328 |   test('ITC-DEF-004 - Item Inquiry must display non-zero Regular and Selling prices for a valid SKU', async () => {
  329 |     test.setTimeout(90000);
  330 |     const data = getData('ITC-DEF-004');
  331 |     const result: ITC_DEF004_Result = await itcPage.itc_def004_zeroPricesDisplayed(SCREENSHOTS_DIR, data);
  332 | 
  333 |     expect(result.itemSearchPerformed, 'Item search should complete successfully').toBe(true);
  334 |     if (result.regularPriceValue) {
  335 |       expect(result.regularPriceIsZero,
  336 |         `Regular Price should not be $0.00; got: "${result.regularPriceValue}"`
  337 |       ).toBe(false);
  338 |     }
  339 |     if (result.sellingPriceValue) {
  340 |       expect(result.sellingPriceIsZero,
  341 |         `Selling Price should not be $0.00; got: "${result.sellingPriceValue}"`
  342 |       ).toBe(false);
  343 |     }
  344 |   });
  345 | 
  346 |   // ── ITC-DEF-022: Receiver Print Uses Truncated PO Number ─────────────────
  347 |   test('ITC-DEF-022 - RWOPO print request must use the full 8-digit PO number (not truncated)', async () => {
  348 |     test.setTimeout(180000);
  349 |     const data = getData('ITC-DEF-022');
  350 |     const result: ITC_DEF022_Result = await itcPage.itc_def022_printTruncatedPoNumber(SCREENSHOTS_DIR, data);
  351 | 
  352 |     expect(result.finalizeAttempted, 'Finalize should have been attempted').toBe(true);
  353 |     if (result.requestCaptured && result.printRequestPoNumber) {
  354 |       expect(result.poNumberIs8Digits,
  355 |         `Print request poNumber must be 8+ digits; got: "${result.printRequestPoNumber}"`
  356 |       ).toBe(true);
  357 |     }
  358 |   });
  359 | 
  360 |   // ── ITC-DEF-023: Add SKU Select Items Window Rendered Behind ─────────────
  361 |   test('ITC-DEF-023 - RWOPO Add SKU Select Items modal must open visibly and be properly positioned', async () => {
  362 |     test.setTimeout(90000);
  363 |     const data = getData('ITC-DEF-023');
  364 |     const result: ITC_DEF023_Result = await itcPage.itc_def023_selectItemsWindowBehind(SCREENSHOTS_DIR, data);
  365 | 
  366 |     expect(result.rwopoPageVisible, 'Receive Without PO page should be visible').toBe(true);
  367 |     if (result.addSkuClicked) {
  368 |       expect(result.selectItemsModalVisible,
  369 |         'Select Items modal should be visible after clicking Add SKU'
> 370 |       ).toBe(true);
      |         ^ Error: Select Items modal should be visible after clicking Add SKU
  371 |       expect(result.modalProperlyPositioned,
  372 |         'Select Items modal should be positioned in the upper viewport area (not hidden behind content)'
  373 |       ).toBe(true);
  374 |     } else {
  375 |       expect(result.addSkuClicked, 'Add SKU button should be clickable').toBe(true);
  376 |     }
  377 |   });
  378 | 
  379 |   // ── ITC-DEF-024: Zero-Quantity Warning Not Showing on Finalize ────────────
  380 |   test('ITC-DEF-024 - RWOPO Finalize with zero-quantity row must show a zero-quantity warning dialog', async () => {
  381 |     test.setTimeout(180000);
  382 |     const data = getData('ITC-DEF-024');
  383 |     const result: ITC_DEF024_Result = await itcPage.itc_def024_zeroQtyWarningMissing(SCREENSHOTS_DIR, data);
  384 | 
  385 |     expect(result.rwopoPageVisible, 'Receive Without PO page should be visible').toBe(true);
  386 |     // Finalize must be clickable; if a zero-qty row exists, a warning dialog should appear
  387 |     expect(result.finalizeClicked, 'Finalize button should be clickable on RWOPO page').toBe(true);
  388 |     if (result.zeroQtyRowExists && result.finalizeClicked) {
  389 |       expect(result.zeroQtyWarningVisible,
  390 |         'A zero-quantity warning dialog should appear when finalizing with qty=0 row'
  391 |       ).toBe(true);
  392 |     }
  393 |   });
  394 | 
  395 |   // ── ITC-DEF-025: Finalized PO From RWOPO Not Searchable ──────────────────
  396 |   test('ITC-DEF-025 - PO finalized via Receive Without PO must be searchable in Purchase Orders', async () => {
  397 |     test.setTimeout(180000);
  398 |     const data = getData('ITC-DEF-025');
  399 |     const result: ITC_DEF025_Result = await itcPage.itc_def025_finalizedPoNotSearchable(SCREENSHOTS_DIR, data);
  400 | 
  401 |     expect(result.finalizeAttempted, 'Finalize should have been attempted in Receive Without PO').toBe(true);
  402 |     if (result.finalizedPoNumber) {
  403 |       expect(result.poFoundInSearch,
  404 |         `Finalized PO "${result.finalizedPoNumber}" should be searchable in Purchase Orders; rows found: ${result.searchRowCount}`
  405 |       ).toBe(true);
  406 |     }
  407 |   });
  408 | 
  409 |   // ── ITC-DEF-026: Grid Header Styling Mismatch in Worksheets ──────────────
  410 |   test('ITC-DEF-026 - Worksheets grid header must have consistent background color styling', async () => {
  411 |     test.setTimeout(60000);
  412 |     const data = getData('ITC-DEF-026');
  413 |     const result: ITC_DEF026_Result = await itcPage.itc_def026_gridHeaderStyling(SCREENSHOTS_DIR, data);
  414 | 
  415 |     expect(result.worksheetsGridVisible, 'Worksheets grid should be visible').toBe(true);
  416 |     expect(result.headerCellCount, 'Worksheets grid should have header cells').toBeGreaterThan(0);
  417 |     expect(result.headerHasBackgroundColor,
  418 |       `Grid header should have a non-white/non-transparent background color; got: "${result.headerBackgroundColor}"`
  419 |     ).toBe(true);
  420 |   });
  421 | 
  422 | 
  423 |   // ── ITC-DEF-039: User Creation Page Not Enabled ───────────────────────────
  424 |   test('ITC-DEF-039 - Clicking the create user icon must open the Create User form/modal', async () => {
  425 |     test.setTimeout(90000);
  426 |     const data = getData('ITC-DEF-039');
  427 |     const result: ITC_DEF039_Result = await itcPage.itc_def039_userCreationNotEnabled(SCREENSHOTS_DIR, data);
  428 | 
  429 |     expect(result.createIconVisible, 'Create user (person_add) icon should be visible on User Management page').toBe(true);
  430 |     if (result.createIconClicked) {
  431 |       expect(result.createModalVisible,
  432 |         'Clicking the create icon must open the Create User form/modal'
  433 |       ).toBe(true);
  434 |       if (result.createModalVisible) {
  435 |         expect(result.createModalTitle.toLowerCase()).toMatch(/create|new user/i);
  436 |       }
  437 |     }
  438 |   });
  439 | });
  440 | 
```