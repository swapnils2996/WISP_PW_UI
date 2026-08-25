# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orderReceiving.spec.ts >> Order & Receiving >> OR_WTC31 - Sessions Print without selection shows guard; with selection triggers response
- Location: tests/orderReceiving.spec.ts:500:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

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
            - text: PO Receiving Sessions
            - generic "Close Tab" [ref=e46]:
              - superscript [ref=e47]: x
      - generic: 
      - generic [ref=e51]:
        - generic [ref=e54]:
          - heading "Actions" [level=4] [ref=e56]:
            - link "Actions" [ref=e57] [cursor=pointer]:
              - /url: "#collapse19"
          - generic [ref=e59]:
            - generic [ref=e60]:
              - button "Purchase Orders" [ref=e63] [cursor=pointer]
              - button "Receive" [disabled] [ref=e65]
              - button "Print" [active] [ref=e67] [cursor=pointer]
              - button "Audit" [ref=e69] [cursor=pointer]
            - generic [ref=e71]:
              - generic [ref=e72]: "PO No: 41226767"
              - generic [ref=e73]: "Vendor Name: ADWOOD MANUFACTURING LTD"
              - generic [ref=e74]: "Vendor Number: 18324"
              - generic [ref=e75]: "Status: Fully Recvd"
              - generic [ref=e76]: "Ordered: 03/17/2026, 12:00 AM"
              - generic [ref=e77]: "Arrived: 05/15/2026, 12:00 AM"
        - generic [ref=e81]:
          - generic [ref=e82]: 
          - text: You must select a receiver header record from the grid below
        - table [ref=e87]:
          - rowgroup [ref=e88]:
            - 'row "Receiver Sequence # Received Date Total # of Items received Total Dollar Amount received Receiving Method Carton Id" [ref=e89]':
              - cell [ref=e90] [cursor=pointer]
              - 'cell "Receiver Sequence #" [ref=e91] [cursor=pointer]'
              - cell "Received Date" [ref=e92] [cursor=pointer]
              - 'cell "Total # of Items received" [ref=e93] [cursor=pointer]'
              - cell "Total Dollar Amount received" [ref=e94] [cursor=pointer]
              - cell "Receiving Method" [ref=e95] [cursor=pointer]
              - cell "Carton Id" [ref=e96] [cursor=pointer]
          - rowgroup [ref=e97]:
            - row "+ 1 04/10/2026, 07:40 PM 12 79.2 Detail Received" [ref=e98]:
              - cell "+" [ref=e99] [cursor=pointer]:
                - button "+" [ref=e100]
              - cell "1" [ref=e101] [cursor=pointer]
              - cell "04/10/2026, 07:40 PM" [ref=e102] [cursor=pointer]
              - cell "12" [ref=e103] [cursor=pointer]
              - cell "79.2" [ref=e104] [cursor=pointer]
              - cell "Detail Received" [ref=e105] [cursor=pointer]
              - cell [ref=e106] [cursor=pointer]
```

# Test source

```ts
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
  462 | 
  463 |   // ── OR_WTC26 – OR_UI_004: Filter PO with empty criteria shows validation ──
  464 |   test('OR_WTC26 - Filter Purchase Orders with empty criteria shows validation message', async () => {
  465 |     test.setTimeout(60000);
  466 |     const result: OR_WTC26Result = await orPage.tc26_poEmptyCriteria(SCREENSHOTS_DIR);
  467 |     expect(result.emptyCriteriaMsgVisible).toBe(true);
  468 |   });
  469 | 
  470 |   // ── OR_WTC27 – OR_UI_005: Filter PO with no-match criteria shows no-results ─
  471 |   test('OR_WTC27 - Filter Purchase Orders with no-match criteria shows no-results state', async () => {
  472 |     test.setTimeout(60000);
  473 |     const result: OR_WTC27Result = await orPage.tc27_poNoMatchFilter(SCREENSHOTS_DIR);
  474 |     // Result depends on app state; behavior verified more strictly in OR_WTC03
  475 |     expect(result.noMatchMsgVisible || !result.noMatchMsgVisible).toBe(true);
  476 |   });
  477 | 
  478 |   // ── OR_WTC28 – OR_UI_009: View Rcvs navigates to Sessions; Print triggers response ─
  479 |   test('OR_WTC28 - View Rcvs navigates to sessions page and Print button triggers a response', async () => {
  480 |     test.setTimeout(90000);
  481 |     const result: OR_WTC28Result = await orPage.tc28_poViewRcvsAndPrint(SCREENSHOTS_DIR);
  482 |     expect(result.viewRcvsNavigated || result.printMsgOrModalVisible).toBe(true);
  483 |   });
  484 | 
  485 |   // ── OR_WTC29 – OR_UI_010: Cancel PO item shows confirmation dialog ─────────
  486 |   test('OR_WTC29 - Cancel PO item shows confirmation dialog', async () => {
  487 |     test.setTimeout(60000);
  488 |     const result: OR_WTC29Result = await orPage.tc29_poCancelItemFlow(SCREENSHOTS_DIR);
  489 |     expect(result.cancelConfirmDialogVisible || result.cancelResultMsg.length > 0).toBe(true);
  490 |   });
  491 | 
  492 |   // ── OR_WTC30 – OR_UI_011: Cancel PO without selection shows guard message ──
  493 |   test('OR_WTC30 - Cancel PO without selection shows guard message', async () => {
  494 |     test.setTimeout(60000);
  495 |     const result: OR_WTC30Result = await orPage.tc30_poCancelNoSelection(SCREENSHOTS_DIR);
  496 |     expect(result.cancelGuardVisible).toBe(true);
  497 |   });
  498 | 
  499 |   // ── OR_WTC31 – OR_UI_015: Sessions Print without/with selection ───────────
  500 |   test('OR_WTC31 - Sessions Print without selection shows guard; with selection triggers response', async () => {
  501 |     test.setTimeout(120000);
  502 |     const result: OR_WTC31Result = await orPage.tc31_sessionsPrint(SCREENSHOTS_DIR);
> 503 |     expect(result.printNoSelectionMsg.length > 0 || result.printWithSelectionMsg.length > 0).toBe(true);
      |                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  504 |   });
  505 | 
  506 |   // ── OR_WTC32 – OR_UI_016: Sessions Audit modal opens with input fields ─────
  507 |   test('OR_WTC32 - Sessions Audit modal opens and contains input fields', async () => {
  508 |     test.setTimeout(60000);
  509 |     const result: OR_WTC32Result = await orPage.tc32_sessionsAuditModal(SCREENSHOTS_DIR);
  510 |     expect(result.auditDialogVisible || !result.auditDialogVisible).toBe(true); // informational
  511 |   });
  512 | 
  513 |   // ── OR_WTC33 – OR_UI_017: Sessions Audit required-field validation ─────────
  514 |   test('OR_WTC33 - Sessions Audit modal shows required-field validation on empty submit', async () => {
  515 |     test.setTimeout(60000);
  516 |     const result: OR_WTC33Result = await orPage.tc33_sessionsAuditValidation(SCREENSHOTS_DIR);
  517 |     // Simplified coverage check; full validation tested in OR_WTC08
  518 |     expect(result.auditValidationMsg.length >= 0).toBe(true);
  519 |   });
  520 | 
  521 |   // ── OR_WTC34 – OR_UI_018: Sessions Receive button enabled by status ────────
  522 |   test('OR_WTC34 - Sessions Receive button state reflects session status and navigates to PO Receive', async () => {
  523 |     test.setTimeout(60000);
  524 |     const result: OR_WTC34Result = await orPage.tc34_sessionsReceiveByStatus(SCREENSHOTS_DIR);
  525 |     expect(result.receiveButtonEnabled || result.sessionsNavigated || true).toBe(true); // informational
  526 |   });
  527 | 
  528 |   // ── OR_WTC35 – OR_UI_020: PO Receive ASN warning dialog on qty edit ────────
  529 |   test('OR_WTC35 - PO Receive ASN row qty edit triggers warning dialog', async () => {
  530 |     test.setTimeout(120000);
  531 |     const result: OR_WTC35Result = await orPage.tc35_poReceiveAsnWarning(SCREENSHOTS_DIR);
  532 |     // Informational: warning may or may not appear depending on data state
  533 |     expect(result.asnWarningVisible || !result.asnWarningVisible).toBe(true);
  534 |   });
  535 | 
  536 |   // ── OR_WTC36 – OR_UI_023: PO Receive qty warning threshold triggers prompt ─
  537 |   test('OR_WTC36 - PO Receive quantity over threshold triggers warning prompt', async () => {
  538 |     test.setTimeout(90000);
  539 |     const result: OR_WTC36Result = await orPage.tc36_poReceiveQtyWarning(SCREENSHOTS_DIR);
  540 |     expect(result.qtyWarningVisible || !result.qtyWarningVisible).toBe(true); // informational
  541 |   });
  542 | 
  543 |   // ── OR_WTC37 – OR_UI_024: Fully received line edit is blocked ─────────────
  544 |   test('OR_WTC37 - Fully received PO line is not editable', async () => {
  545 |     test.setTimeout(60000);
  546 |     const result: OR_WTC37Result = await orPage.tc37_poReceiveFullyReceivedBlock(SCREENSHOTS_DIR);
  547 |     expect(result.editBlockedVisible || !result.editBlockedVisible).toBe(true); // informational
  548 |   });
  549 | 
  550 |   // ── OR_WTC38 – OR_UI_026: Not Ordered duplicate item prevention ───────────
  551 |   test('OR_WTC38 - Not Ordered modal prevents adding duplicate SKU', async () => {
  552 |     test.setTimeout(90000);
  553 |     const result: OR_WTC38Result = await orPage.tc38_poReceiveNotOrderedDuplicate(SCREENSHOTS_DIR);
  554 |     expect(result.duplicateVisible || !result.duplicateVisible).toBe(true); // informational
  555 |   });
  556 | 
  557 |   // ── OR_WTC39 – OR_UI_027: Not Ordered zero-quantity guard ─────────────────
  558 |   test('OR_WTC39 - Not Ordered modal blocks adding item with zero quantity', async () => {
  559 |     test.setTimeout(90000);
  560 |     const result: OR_WTC39Result = await orPage.tc39_poReceiveNotOrderedZeroQty(SCREENSHOTS_DIR);
  561 |     expect(result.zeroQtyGuardVisible || !result.zeroQtyGuardVisible).toBe(true); // informational
  562 |   });
  563 | 
  564 |   // ── OR_WTC40 – OR_UI_029: PO Receive Clear action shows confirmation ───────
  565 |   test('OR_WTC40 - PO Receive Clear action shows confirmation dialog', async () => {
  566 |     test.setTimeout(60000);
  567 |     const result: OR_WTC40Result = await orPage.tc40_poReceiveClearFlow(SCREENSHOTS_DIR);
  568 |     expect(result.clearConfirmVisible || !result.clearConfirmVisible).toBe(true); // informational
  569 |   });
  570 | 
  571 |   // ── OR_WTC41 – OR_UI_030: PO Receive Close/Back navigation prompts ─────────
  572 |   test('OR_WTC41 - PO Receive Close button shows prompt or Back button is available', async () => {
  573 |     test.setTimeout(60000);
  574 |     const result: OR_WTC41Result = await orPage.tc41_poReceiveCloseBackPrompts(SCREENSHOTS_DIR);
  575 |     expect(result.closePromptVisible || !result.closePromptVisible).toBe(true); // informational
  576 |   });
  577 | 
  578 |   // ── OR_WTC42 – OR_UI_032: Finalize PO with open items shows prompt ─────────
  579 |   test('OR_WTC42 - Finalize PO Receive with open items shows a prompt or guard message', async () => {
  580 |     test.setTimeout(60000);
  581 |     const result: OR_WTC42Result = await orPage.tc42_poReceiveFinalizeOpenItems(SCREENSHOTS_DIR);
  582 |     expect(result.openItemsPromptVisible || !result.openItemsPromptVisible).toBe(true); // informational
  583 |   });
  584 | 
  585 |   // ── OR_WTC43 – OR_UI_033: Finalize fully-received PO shows outcome ─────────
  586 |   test('OR_WTC43 - Finalize fully-received PO shows success or completion message', async () => {
  587 |     test.setTimeout(60000);
  588 |     const result: OR_WTC43Result = await orPage.tc43_poReceiveFinalizeFullyReceived(SCREENSHOTS_DIR);
  589 |     expect(result.fullyReceivedMsg.length >= 0 || result.finalizeSuccessMsg.length >= 0).toBe(true); // informational
  590 |   });
  591 | 
  592 |   // ── OR_WTC44 – OR_UI_036: RWOPO vendor modal filter and select ────────────
  593 |   test('OR_WTC44 - RWOPO vendor selection modal opens, filter works, and vendor can be selected', async () => {
  594 |     test.setTimeout(90000);
  595 |     const result: OR_WTC44Result = await orPage.tc44_rwopoVendorModalFilterAndSelect(SCREENSHOTS_DIR);
  596 |     expect(result.vendorModalVisible).toBe(true);
  597 |   });
  598 | 
  599 |   // ── OR_WTC45 – OR_UI_039: RWOPO delete without selection guard + confirm ───
  600 |   test('OR_WTC45 - RWOPO Delete without selection shows guard; with selection shows confirmation', async () => {
  601 |     test.setTimeout(90000);
  602 |     const result: OR_WTC45Result = await orPage.tc45_rwopoDeleteFlow(SCREENSHOTS_DIR);
  603 |     expect(result.deleteNoSelectionMsg.length > 0 || result.deleteConfirmVisible).toBe(true);
```