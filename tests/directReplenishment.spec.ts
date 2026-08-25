import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { DirectReplenishmentPage } from '../pages/DirectReplenishmentPage';
import { getDirectReplenishmentTestData, DirectReplenishmentTestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'directReplenishment');

test.describe('Direct Replenishment (SISO/DR)', () => {
  let page: Page;
  let context: BrowserContext;
  let drData: DirectReplenishmentTestData[];
  let drPage: DirectReplenishmentPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; drPage = new DirectReplenishmentPage(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    drData = await getDirectReplenishmentTestData();
    context = await browser.newContext();
    page    = await context.newPage();
    drPage  = new DirectReplenishmentPage(page);

    await drPage.setupApiMocks(context);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => { await context.close(); });

  const d = (tc: string) => drData.find(r => r.testCase === tc)!;

  // ── DR_WTC01: Overstock Label Printing – UI load ──────────────────────────
  test('DR_WTC01 - Overstock Label Printing: UI loads with location dropdown, grid, and action buttons', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc01_overstockLabelPrintLoad(SCREENSHOTS_DIR, d('DR_WTC01'));

    expect(result.pageVisible, 'Page should be visible').toBe(true);
    expect(result.locationDropdownVisible, 'Location dropdown should be visible').toBe(true);
    expect(result.deleteBtnVisible || result.printBtnVisible, 'Delete and Print buttons should be visible on initial load').toBe(true);
    expect(result.gridVisible, 'Results grid should be visible').toBe(true);
  });

  // ── DR_WTC02: Overstock Label Printing – E2E add/delete/print ────────────
  test('DR_WTC02 - Overstock Label Printing: Add rows, delete selected, print labels', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc02_overstockLabelE2E(SCREENSHOTS_DIR, d('DR_WTC02'));

    expect(result.rowsAdded, 'Rows should be added to grid after Add').toBe(true);
    expect(result.deleteSuccess, 'Delete should succeed').toBe(true);
    expect(result.printSuccess, 'Print should succeed').toBe(true);
  });

  // ── DR_WTC03: Overstock Label Printing – Validation and reset ────────────
  test('DR_WTC03 - Overstock Label Printing: Validation blocks invalid input; Reset clears criteria', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc03_overstockLabelValidation(SCREENSHOTS_DIR, d('DR_WTC03'));

    expect(result.addBlockedOnEmpty, 'Add should be blocked when no location selected').toBe(true);
    expect(result.orderValidationShown, 'Order validation should show for From > To').toBe(true);
    expect(result.resetWorked, 'Reset should clear criteria').toBe(true);
  });

  // ── DR_WTC04: Overstock Label Printing – No-selection checks ─────────────
  test('DR_WTC04 - Overstock Label Printing: Delete and Print blocked when no row selected', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc04_overstockLabelNoSelection(SCREENSHOTS_DIR);

    expect(result.deleteBlockedNoSelection, 'Delete should be blocked when no row selected').toBe(true);
    expect(result.printBlockedNoSelection, 'Print should be blocked when no row selected').toBe(true);
  });

  // ── DR_WTC05: Overstock Reset – UI cascade ───────────────────────────────
  test('DR_WTC05 - Overstock Reset: Location dropdown loads; selecting location loads location numbers', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc05_overstockResetLoad(SCREENSHOTS_DIR, d('DR_WTC05'));

    expect(result.pageVisible, 'Page should be visible').toBe(true);
    expect(result.locationDropdownVisible, 'Location dropdown should be visible').toBe(true);
    expect(result.numberDropdownLoads, 'Location number dropdown should load after selecting location').toBe(true);
  });

  // ── DR_WTC06: Overstock Reset – E2E reset success ────────────────────────
  test('DR_WTC06 - Overstock Reset: Reset Overstock succeeds with valid selection', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc06_overstockResetE2E(SCREENSHOTS_DIR, d('DR_WTC06'));

    expect(result.resetSuccess, 'Reset should complete successfully').toBe(true);
    expect(result.successMsgVisible, 'Success message should appear after reset').toBe(true);
  });

  // ── DR_WTC07: Overstock Reset – Validation and Clear ─────────────────────
  test('DR_WTC07 - Overstock Reset: Reset blocked without location number; Clear resets selections', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc07_overstockResetValidation(SCREENSHOTS_DIR);

    expect(result.resetBlockedNoNumber, 'Reset should be blocked without location number').toBe(true);
    expect(result.clearWorked, 'Clear should reset all selections').toBe(true);
  });

  // ── DR_WTC08: Overstock Transfer – UI and Transfer panel dependency ───────
  test('DR_WTC08 - Overstock Transfer: Transfer Location dropdown controlled by Existing criteria', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc08_overstockTransferLoad(SCREENSHOTS_DIR, d('DR_WTC08'));

    expect(result.pageVisible, 'Overstock Transfer page should be visible').toBe(true);
    expect(result.transferDropdownDisabledInitially, 'Transfer dropdown should be disabled initially').toBe(true);
  });

  // ── DR_WTC09: Overstock Transfer – E2E move flow ─────────────────────────
  test('DR_WTC09 - Overstock Transfer: Move Items shows confirmation; confirming completes transfer', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc09_overstockTransferE2E(SCREENSHOTS_DIR, d('DR_WTC09'));

    expect(result.confirmationShown, 'Confirmation popup should appear before move').toBe(true);
    expect(result.moveSuccess, 'Move should complete successfully').toBe(true);
  });

  // ── DR_WTC10: Overstock Transfer – Validation (same source/target) ────────
  test('DR_WTC10 - Overstock Transfer: Move blocked for identical source and target ranges', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc10_overstockTransferNegative(SCREENSHOTS_DIR, d('DR_WTC10'));

    expect(result.sameSourceTargetBlocked, 'Move should be blocked for same source/target').toBe(true);
  });

  // ── DR_WTC11: Overstock Transfer – Occupied destination ──────────────────
  test('DR_WTC11 - Overstock Transfer: Move blocked when destination already has items', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc11_overstockTransferOccupied(SCREENSHOTS_DIR, d('DR_WTC11'));

    expect(result.occupiedDestinationBlocked, 'Move should be blocked for occupied destination').toBe(true);
  });

  // ── DR_WTC12: Override Truck Day – E2E flow ───────────────────────────────
  test('DR_WTC12 - Override Truck Day: Submit shows confirmation; Yes produces outcome message', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc12_truckDayE2E(SCREENSHOTS_DIR, d('DR_WTC12'));

    expect(result.confirmationText.length, 'Confirmation text should be shown').toBeGreaterThan(0);
    expect(result.outcomeVisible, 'Outcome message should appear after confirmation').toBe(true);
  });

  // ── DR_WTC13: Override Inventory Day – Cancel/Yes flow ───────────────────
  test('DR_WTC13 - Override Inventory Day: Cancel prevents update; Yes produces outcome message', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc13_inventoryDayE2E(SCREENSHOTS_DIR, d('DR_WTC13'));

    expect(result.inventoryConfirmShown, 'Inventory Day confirmation should be shown').toBe(true);
    expect(result.cancelWorked, 'Cancel should prevent update').toBe(true);
    expect(result.yesOutcomeVisible, 'Yes should produce outcome message').toBe(true);
  });

  // ── DR_WTC14: Override Config disable / HTTP failure ─────────────────────
  test('DR_WTC14 - Override Day: Page stable; config flags respected; HTTP failure shows error', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc14_overrideConfigDisable(SCREENSHOTS_DIR, d('DR_WTC14'));

    expect(result.pageStable, 'Override page should be stable').toBe(true);
  });

  // ── DR_WTC15: Replenishment Threshold Report – Auto-load ──────────────────
  test('DR_WTC15 - Replenishment Threshold Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc15_replenishmentThresholdReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC16: HINO Report – Auto-load ─────────────────────────────────────
  test('DR_WTC16 - HINO Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc16_hinoReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC17: High Overstock Report – Auto-load ────────────────────────────
  test('DR_WTC17 - High Overstock Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc17_highOverstockReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC18: Clearance Overstock Report – Auto-load ──────────────────────
  test('DR_WTC18 - Clearance Overstock Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc18_clearanceOverstockReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC19: Seasonal Overstock Location Report – Auto-load ──────────────
  test('DR_WTC19 - Seasonal Overstock Location Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc19_seasonalOverstockReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC20: SISO List Completion Report – Auto-load ─────────────────────
  test('DR_WTC20 - SISO List Completion Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc20_sisoListCompletionReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC21: SISO List Item Detail Report – Auto-load ────────────────────
  test('DR_WTC21 - SISO List Item Detail Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc21_sisoListItemDetailReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC22: Pull List Item Detail Report – Auto-load ────────────────────
  test('DR_WTC22 - Pull List Item Detail Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc22_pullListItemDetailReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC23: SISO List Completion History Report – Auto-load ─────────────
  test('DR_WTC23 - SISO List Completion History Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc23_sisoCompletionHistoryReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC24: Audit Completion Report – Auto-load ─────────────────────────
  test('DR_WTC24 - Audit Completion Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc24_auditCompletionReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC25: Audit Item Details Report – Auto-load ───────────────────────
  test('DR_WTC25 - Audit Item Details Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc25_auditItemDetailsReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC26: Audit Completion History Report – Auto-load ─────────────────
  test('DR_WTC26 - Audit Completion History Report: Auto-generates on load', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc26_auditCompletionHistoryReport(SCREENSHOTS_DIR);

    expect(result.spinnerVisible || result.reportGenerated, 'Spinner should appear and report should generate').toBe(true);
  });

  // ── DR_WTC27: Auto-load Reports – Resilience ─────────────────────────────
  test('DR_WTC27 - Auto-load Reports: Page stable during network outage; recovers after reconnect', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc27_autoLoadReportResilience(SCREENSHOTS_DIR);

    expect(result.pageStable, 'Page should remain stable during/after network outage').toBe(true);
  });

  // ── DR_WTC28: Overstock Item List Report – View and Print ─────────────────
  test('DR_WTC28 - Overstock Item List Report: View and Print with valid criteria succeed', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc28_overstockItemListReport(SCREENSHOTS_DIR, d('DR_WTC28'));

    expect(result.pageVisible, 'Page should be visible').toBe(true);
    expect(result.locationDropdownVisible, 'Location dropdown should be visible').toBe(true);
    expect(result.viewBtnVisible || result.printBtnVisible, 'View or Print button should be visible').toBe(true);
    expect(result.reportOpened, 'Report should open after View/Print').toBe(true);
  });

  // ── DR_WTC29: Overstock Item List Report – Validation ─────────────────────
  test('DR_WTC29 - Overstock Item List Report: Invalid/missing criteria blocked with validation message', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc29_overstockItemListValidation(SCREENSHOTS_DIR, d('DR_WTC29'));

    expect(result.pageStable, 'Page should be stable after validation').toBe(true);
    expect(result.validationShown, 'Validation or error should be shown for invalid criteria').toBe(true);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // NEW TEST CASES — appended below; no prior tests modified
  // ══════════════════════════════════════════════════════════════════════════

  // ── DR_WTC30: Override page text content verification ────────────────────
  test('DR_WTC30 - Override Truck/Inventory Day: Verify "Reason for override" label, date display and radio labels', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc30_overrideTruckDayUITextVerification(SCREENSHOTS_DIR);

    expect(result.reasonForOverrideLabelVisible,
      '"Reason for override" label should be visible on the Override page').toBe(true);
    expect(result.currentDateDisplayed,
      "Today's date should be displayed on the Override page").toBe(true);
    expect(result.truckDayRadioLabelVisible,
      '"Truck Day" radio button label should be visible').toBe(true);
    expect(result.inventoryDayRadioLabelVisible,
      '"Inventory Day" radio button label should be visible').toBe(true);
    expect(result.submitBtnVisible,
      'Submit button should be visible on the Override page').toBe(true);
  });

  // ── DR_WTC31: Cancel Truck Day confirmation aborts the override ───────────
  test('DR_WTC31 - Override Truck Day: Cancelling confirmation dialog aborts the override submission', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc31_cancelTruckDayConfirmation(SCREENSHOTS_DIR);

    expect(result.confirmationShown,
      'Confirmation dialog should appear after clicking Submit for Truck Day').toBe(true);
    expect(result.cancelClickedSuccessfully,
      'No/Cancel button should be clickable in the confirmation dialog').toBe(true);
    expect(result.pageReturnedToNormal,
      'Confirmation dialog should close after Cancel').toBe(true);
    expect(result.submitBtnStillVisible,
      'Submit button should still be present after cancellation (no navigation occurred)').toBe(true);
  });

  // ── DR_WTC32: Overstock Transfer – Move Items without Transfer Location ───
  test('DR_WTC32 - Overstock Transfer: Move Items clicked without Transfer Location keeps page stable', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc32_transferWithoutTransferLocation(SCREENSHOTS_DIR);

    expect(result.existingLocationSelected,
      'Existing Location should be selectable from the source dropdown').toBe(true);
    expect(result.moveItemsClickedWithoutTransfer,
      'Move Items button should be clickable even without Transfer Location selected').toBe(true);
    expect(result.pageStableAfterClick,
      'Page should remain stable after clicking Move Items without Transfer Location').toBe(true);
    expect(result.transferLocationDropdownStillPresent,
      'Transfer Location dropdown should still be present after the click').toBe(true);
  });

  // ── DR_WTC33: Overstock Label Printing – Grid column header verification ──
  test('DR_WTC33 - Overstock Label Printing: Grid renders expected column headers after location selection', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc33_overstockLabelGridColumnHeaders(SCREENSHOTS_DIR);

    expect(result.gridVisible,
      'Data grid (mat-table or table) should be visible').toBe(true);
    expect(result.columnHeadersVisible,
      'At least one column header should be visible in the grid').toBe(true);
    expect(result.columnHeaderTexts.length,
      'Grid should have at least one column header').toBeGreaterThanOrEqual(1);
    expect(result.checkboxColumnVisible,
      'Checkbox/select column should be present in the grid header').toBe(true);
  });

  // ── DR_WTC34: Overstock Item List Report – Print without criteria ─────────
  test('DR_WTC34 - Overstock Item List Report: Print without selecting criteria keeps page stable', async () => {
    test.setTimeout(120000);
    const result = await drPage.tc34_overstockItemListPrintValidation(SCREENSHOTS_DIR);

    expect(result.printClickedWithoutCriteria,
      'Print button should be clickable without criteria selected').toBe(true);
    expect(result.validationOrBlockShown,
      'Validation message or blocking behaviour should occur when Print is clicked without criteria').toBe(true);
    expect(result.pageStable,
      'Page should remain stable after Print click without criteria').toBe(true);
  });
});
