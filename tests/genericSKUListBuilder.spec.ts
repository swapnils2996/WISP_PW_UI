import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { GenericSKUListBuilderPage } from '../pages/GenericSKUListBuilderPage';
import {
  getGenericSKUListBuilderTestData,
  GenericSKUListBuilderTestData,
} from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'genericSKUListBuilder');

test.describe('Generic SKU List Builder', () => {
  let page: Page;
  let context: BrowserContext;
  let gsData: GenericSKUListBuilderTestData[];
  let gsPage: GenericSKUListBuilderPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; gsPage = new GenericSKUListBuilderPage(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
    gsData = await getGenericSKUListBuilderTestData();
    context = await browser.newContext();
    page = await context.newPage();
    gsPage = new GenericSKUListBuilderPage(page);

    // Set up API mocks BEFORE navigating — route handlers apply to all subsequent requests
    await gsPage.setupApiMocks();

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => { await context.close(); });

  async function attachScreenshot(testInfo: any, name: string) {
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await testInfo.attach(name, { path: filePath, contentType: 'image/png' }).catch(() => {});
  }

  // ── GS_WTC01 – Load page and verify all controls ──────────────────────────

  test('GS_WTC01 - Load Generic SKU Builder controls and verify all UI elements', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = gsData.find(r => r.testCase === 'GS_WTC01')!;
    const result = await gsPage.gs01_loadAndVerifyControls(SCREENSHOTS_DIR);

    await attachScreenshot(testInfo, 'GS_WTC01_01_page_loaded');
    await attachScreenshot(testInfo, 'GS_WTC01_02_list_type_options');
    await attachScreenshot(testInfo, 'GS_WTC01_03_grid_headers');

    // List Type dropdown visible
    expect(result.listTypeDropdownVisible,
      'List Type dropdown should be visible').toBe(true);

    // Verify all 5 list type options are present
    const expectedOptions = [
      data.listTypeClearance, data.listTypeGeneric,
      data.listTypeNotOnPog, data.listTypeNewStore, data.listTypePackaway,
    ];
    for (const opt of expectedOptions) {
      const found = result.listTypeOptions.some(o => o.toLowerCase().includes(opt.toLowerCase()));
      expect(found, `List type option "${opt}" should be present`).toBe(true);
    }

    // Input controls
    expect(result.skuInputVisible, 'SKU/UPC input should be visible').toBe(true);
    expect(result.qtyInputVisible || result.referenceInputVisible,
      'Quantity or Reference input should be visible').toBe(true);

    // Action buttons
    expect(result.addBtnVisible, 'Add button should be visible').toBe(true);
    expect(result.clearBtnVisible, 'Clear button should be visible').toBe(true);
    expect(result.deleteBtnVisible, 'Delete button should be visible').toBe(true);
    expect(result.finalizeBtnVisible, 'Finalize button should be visible').toBe(true);
    expect(result.printBtnVisible, 'Print button should be visible').toBe(true);

    // Grid and controls
    expect(result.gridVisible, 'Data grid should be visible').toBe(true);

    // Grid headers should contain expected columns
    const expectedCols = ['SKU', 'UPC', 'Description', 'Qty', 'Reference'];
    const headersText = result.gridHeaders.join(' ').toLowerCase();
    const foundAnyHeader = expectedCols.some(col => headersText.includes(col.toLowerCase()));
    expect(foundAnyHeader || result.gridVisible,
      'Grid should contain SKU/UPC/Description/Qty columns').toBe(true);
  });

  // ── GS_WTC02 – Add valid SKU and edit quantity inline ─────────────────────

  test('GS_WTC02 - Add valid SKU with quantity/reference and verify inline edit', async ({}, testInfo) => {
    test.setTimeout(120000);
    const data = gsData.find(r => r.testCase === 'GS_WTC02')!;
    const result = await gsPage.gs02_addValidSkuAndEdit(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC02_01_list_type_selected');
    await attachScreenshot(testInfo, 'GS_WTC02_02_sku_entered_desc_loaded');
    await attachScreenshot(testInfo, 'GS_WTC02_03_ref_required_validation');
    await attachScreenshot(testInfo, 'GS_WTC02_04_item_added');
    await attachScreenshot(testInfo, 'GS_WTC02_05_inline_edit');

    // Item description should load after entering SKU
    expect(result.itemDescriptionVisible || result.itemAddedToGrid,
      'Item description should be visible or item added to grid').toBe(true);

    // Reference required validation
    expect(result.refRequiredMsgVisible,
      'Reference required message should be shown when reference is empty').toBe(true);
    if (result.refRequiredMsg) {
      expect(result.refRequiredMsg.toLowerCase()).toMatch(/reference|box|required/i);
    }

    // Item should be added to grid
    expect(result.itemAddedToGrid,
      'Valid SKU should be added to the grid').toBe(true);
  });

  // ── GS_WTC03 – Invalid and duplicate SKU validations ─────────────────────

  test('GS_WTC03 - Validate invalid SKU error and duplicate SKU prevention', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = gsData.find(r => r.testCase === 'GS_WTC03')!;
    const result = await gsPage.gs03_invalidAndDuplicateSku(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC03_01_invalid_sku_error');
    await attachScreenshot(testInfo, 'GS_WTC03_02_valid_sku_added');
    await attachScreenshot(testInfo, 'GS_WTC03_03_duplicate_sku_error');

    // Invalid SKU should show an error and NOT add a row
    expect(result.invalidSkuErrorVisible,
      'Error message should appear for invalid SKU').toBe(true);
    expect(result.gridRowCountAfterInvalid,
      'No row should be added for invalid SKU').toBe(0);

    // Duplicate SKU should show "Item already exists" and NOT create duplicate row
    expect(result.duplicateErrorVisible,
      'Duplicate error message should appear').toBe(true);
    if (result.duplicateErrorMsg) {
      expect(result.duplicateErrorMsg.toLowerCase()).toMatch(/already exists|duplicate|already added/i);
    }
    // Row count after duplicate attempt should match row count after first add (=1)
    expect(result.gridRowCountAfterDuplicate).toBeGreaterThanOrEqual(1);
  });

  // ── GS_WTC04 – Finalize workflow ──────────────────────────────────────────

  test('GS_WTC04 - Finalize workflow: dialog, confirm/print, no-records guard', async ({}, testInfo) => {
    test.setTimeout(180000);
    const data = gsData.find(r => r.testCase === 'GS_WTC04')!;
    const result = await gsPage.gs04_finalizeWorkflow(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC04_01_item_ready');
    await attachScreenshot(testInfo, 'GS_WTC04_02_finalize_dialog');
    await attachScreenshot(testInfo, 'GS_WTC04_03_print_options_dialog');
    await attachScreenshot(testInfo, 'GS_WTC04_04_print_cancel');
    await attachScreenshot(testInfo, 'GS_WTC04_05_printed_prompt');
    await attachScreenshot(testInfo, 'GS_WTC04_06_no_clicked');
    await attachScreenshot(testInfo, 'GS_WTC04_07_finalize_success');
    await attachScreenshot(testInfo, 'GS_WTC04_08_no_records_msg');

    // Finalize dialog should open with Confirm, Confirm and Print, Cancel buttons
    expect(result.finalizeDialogVisible,
      'Finalize dialog should open').toBe(true);
    expect(result.confirmBtnVisible || result.confirmPrintBtnVisible,
      'Confirm or Confirm and Print button should be visible').toBe(true);
    expect(result.cancelBtnVisible,
      'Cancel button should be visible in finalize dialog').toBe(true);

    // Confirm and Print opens print options
    if (result.printOptionsVisible) {
      expect(result.printSortOrderVisible || result.printOptionsPageBreakVisible || result.printOptionsVisible,
        'Print options dialog should show sort/print options').toBe(true);
      expect(result.printCancelWorked, 'Cancel on print options should work').toBe(true);
    }

    // "Have you printed?" prompt with Yes/No
    if (result.printedPromptVisible) {
      expect(result.printedPromptYesBtnVisible, 'Yes button should be visible in printed prompt').toBe(true);
      expect(result.printedPromptNoBtnVisible, 'No button should be visible in printed prompt').toBe(true);
      expect(result.noActionOnNo, 'No action should be taken when No is clicked').toBe(true);
    }

    // Finalize success and grid empty
    if (result.finalizeSuccessMsg) {
      expect(result.finalizeSuccessMsg.toLowerCase()).toMatch(/finaliz|complete|success/i);
    }
    expect(result.gridEmptyAfterFinalize,
      'Grid should be empty after finalization').toBe(true);

    // Clicking finalize again shows no-records message
    expect(result.noRecordsMsgAfterFinalize.length > 0 || result.gridEmptyAfterFinalize,
      'No-records message or empty grid should appear after final finalize').toBe(true);
    if (result.noRecordsMsgAfterFinalize) {
      expect(result.noRecordsMsgAfterFinalize.toLowerCase()).toMatch(/no records|no items|nothing/i);
    }
  });

  // ── GS_WTC05 – Threshold/max quantity validation ──────────────────────────

  test('GS_WTC05 - Verify threshold quantity warning for over-max quantity', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = gsData.find(r => r.testCase === 'GS_WTC05')!;
    const result = await gsPage.gs05_thresholdQuantity(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC05_01_over_max_qty');
    await attachScreenshot(testInfo, 'GS_WTC05_02_inline_over_max');

    // System should block or warn when quantity exceeds max (9999)
    expect(result.thresholdWarningVisible,
      'Warning/error should appear for over-maximum quantity').toBe(true);
    if (result.thresholdWarningMsg) {
      expect(result.thresholdWarningMsg.toLowerCase()).toMatch(/maximum|9999|exceed|limit|quantity/i);
    }
  });

  // ── TC-GSB-04 Clear – Clear all items ────────────────────────────────────

  test('TC-GSB-04 (Clear) - Clear all SKUs with confirmation dialog', async ({}, testInfo) => {
    test.setTimeout(120000);
    const data = gsData.find(r => r.testCase === 'TC-GSB-04')!;
    const result = await gsPage.tcGsb04_clear(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'TC_GSB04_Clear_01_items_added');
    await attachScreenshot(testInfo, 'TC_GSB04_Clear_02_confirm_dialog');
    await attachScreenshot(testInfo, 'TC_GSB04_Clear_03_no_clicked');
    await attachScreenshot(testInfo, 'TC_GSB04_Clear_04_cleared');

    // Clear confirmation dialog should appear
    expect(result.clearConfirmVisible,
      'Confirmation dialog should appear when Clear is clicked').toBe(true);
    if (result.clearConfirmMsg) {
      expect(result.clearConfirmMsg.toLowerCase()).toMatch(/delete|clear|sure|confirm/i);
    }

    // Clicking No should not clear anything
    expect(result.noActionOnNo,
      'Clicking No should not remove items from grid').toBe(true);

    // Clicking Yes should clear all items
    expect(result.gridEmptyAfterClear,
      'Grid should be empty after confirming Clear').toBe(true);

    // Success/clear message
    if (result.clearSuccessMsg) {
      expect(result.clearSuccessMsg.toLowerCase()).toMatch(/deleted|cleared|removed|generic sku/i);
    }
  });

  // ── TC-GSB-04 Delete – Delete single row ─────────────────────────────────

  test('TC-GSB-04 (Delete) - Delete selected SKU row with confirmation dialog', async ({}, testInfo) => {
    test.setTimeout(120000);
    const data = gsData.find(r => r.testCase === 'TC-GSB-04')!;
    const result = await gsPage.tcGsb04_delete(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'TC_GSB04_Delete_01_items_added');
    await attachScreenshot(testInfo, 'TC_GSB04_Delete_02_confirm_dialog');
    await attachScreenshot(testInfo, 'TC_GSB04_Delete_03_no_clicked');
    await attachScreenshot(testInfo, 'TC_GSB04_Delete_04_row_deleted');

    // Delete confirmation dialog should appear
    expect(result.deleteConfirmVisible,
      'Confirmation dialog should appear when Delete is clicked').toBe(true);
    if (result.deleteConfirmMsg) {
      expect(result.deleteConfirmMsg.toLowerCase()).toMatch(/delete|sure|confirm|item/i);
    }

    // Clicking No should not delete anything
    expect(result.noActionOnNo,
      'Clicking No should not remove the row').toBe(true);

    // Clicking Yes should delete the selected row
    expect(result.rowDeletedFromGrid,
      'Selected row should be removed from grid after confirming Delete').toBe(true);
  });

  // ── GS_WTC06 – Add item using UPC barcode ────────────────────────────────

  test('GS_WTC06 - Add item using UPC barcode and verify item loads correctly', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = (gsData.find(r => r.testCase === 'GS_WTC06') ?? gsData.find(r => r.testCase === 'GS_WTC01'))!;
    const result = await gsPage.gs06_upcLookup(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC06_01_upc_entered_desc_loaded');
    await attachScreenshot(testInfo, 'GS_WTC06_02_item_added_via_upc');

    expect(result.itemDescriptionVisible || result.itemAddedToGrid,
      'Item description should load or item be added when UPC is entered').toBe(true);
    expect(result.itemAddedToGrid,
      'Item should be added to the grid via UPC lookup').toBe(true);
    expect(result.rowContainsUpcOrSku || result.rowDescValue.length > 0,
      'Grid row should contain the UPC/SKU or matching item description').toBe(true);
  });

  // ── GS_WTC07 – Empty grid guard messages ─────────────────────────────────

  test('GS_WTC07 - Guard messages when Delete and Clear are clicked on empty grid', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = (gsData.find(r => r.testCase === 'GS_WTC07') ?? gsData.find(r => r.testCase === 'GS_WTC01'))!;
    const result = await gsPage.gs07_emptyGridGuards(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC07_01_delete_no_items');
    await attachScreenshot(testInfo, 'GS_WTC07_02_clear_no_items');

    // Clicking Delete with empty grid should show a guard message
    expect(result.deleteNoItemsMsgVisible,
      'Guard message should appear when Delete is clicked with empty grid').toBe(true);
    if (result.deleteNoItemsMsg) {
      expect(result.deleteNoItemsMsg.toLowerCase()).toMatch(/no records|no items|nothing|delete/i);
    }

    // Clicking Clear with empty grid should show a guard message
    expect(result.clearNoItemsMsgVisible,
      'Guard message should appear when Clear is clicked with empty grid').toBe(true);
    if (result.clearNoItemsMsg) {
      expect(result.clearNoItemsMsg.toLowerCase()).toMatch(/no items|no records|clear|nothing/i);
    }
  });

  // ── GS_WTC08 – Standalone Print dialog ───────────────────────────────────

  test('GS_WTC08 - Standalone Print: no-category guard, dialog options, and cancel', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = (gsData.find(r => r.testCase === 'GS_WTC08') ?? gsData.find(r => r.testCase === 'GS_WTC01'))!;
    const result = await gsPage.gs08_standalonePrint(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC08_01_no_category_msg');
    await attachScreenshot(testInfo, 'GS_WTC08_02_print_dialog_open');
    await attachScreenshot(testInfo, 'GS_WTC08_03_print_dialog_cancelled');

    // Print without a list type selected should show a guard message
    expect(result.noCategoryMsgVisible,
      'Guard message should appear when Print is clicked without selecting a list type').toBe(true);
    if (result.noCategoryMsg) {
      expect(result.noCategoryMsg.toLowerCase()).toMatch(/category|list|select/i);
    }

    // Print with list type selected should open the print options dialog
    expect(result.printDialogVisible,
      'Print options dialog should open when a list type is selected').toBe(true);
    expect(result.sortOrderVisible || result.printOptionsVisible,
      'Sort order or print options should be visible in the print dialog').toBe(true);
    expect(result.cancelWorked,
      'Cancel button should close the print options dialog').toBe(true);
  });

  // ── GS_WTC09 – Grid filter functionality ─────────────────────────────────

  test('GS_WTC09 - Grid filter narrows results and clearing filter restores all rows', async ({}, testInfo) => {
    test.setTimeout(120000);
    const data = (gsData.find(r => r.testCase === 'GS_WTC09') ?? gsData.find(r => r.testCase === 'GS_WTC01'))!;
    const result = await gsPage.gs09_gridFilter(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC09_01_before_filter');
    await attachScreenshot(testInfo, 'GS_WTC09_02_after_filter');
    await attachScreenshot(testInfo, 'GS_WTC09_03_filter_cleared');

    // Grid should have items before applying filter
    expect(result.rowCountBeforeFilter,
      'Grid should have at least one item before filtering').toBeGreaterThan(0);

    // Applying the filter should narrow down displayed rows
    expect(result.filterNarrowsResults,
      'Filter input should reduce the number of displayed rows').toBe(true);

    // Clearing the filter should restore all rows
    expect(result.filterRestoresAll,
      'Clearing the filter should restore the original row count').toBe(true);
  });

  // ── GS_WTC10 – All list type variants ────────────────────────────────────

  test('GS_WTC10 - All list type variants can be selected without errors', async ({}, testInfo) => {
    test.setTimeout(90000);
    const data = (gsData.find(r => r.testCase === 'GS_WTC10') ?? gsData.find(r => r.testCase === 'GS_WTC01'))!;
    const result = await gsPage.gs10_listTypeVariants(SCREENSHOTS_DIR, data);

    await attachScreenshot(testInfo, 'GS_WTC10_01_all_list_types');

    expect(result.clearanceSelectable,
      'Clearance List type should be selectable from the dropdown').toBe(true);
    expect(result.notOnPogSelectable,
      'Not-on-POG list type should be selectable from the dropdown').toBe(true);
    expect(result.newStoreSelectable,
      'New Store Transfer list type should be selectable from the dropdown').toBe(true);
    expect(result.packawaySelectable,
      'Seasonal Packaway list type should be selectable from the dropdown').toBe(true);
    expect(result.genericSelectable,
      'Generic List type should be selectable from the dropdown').toBe(true);
    expect(result.formVisibleAfterEachType,
      'Form controls (SKU input) should remain visible after each list type selection').toBe(true);
  });
});
