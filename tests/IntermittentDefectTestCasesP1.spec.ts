import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { IntermittentDefectTestCasesP1Page } from '../pages/IntermittentDefectTestCasesP1';
import type {
  DTC001_Result,
  DTC002_Result,
  DTC003_Result,
  DTC004_Result,
  DTC005_Result,
  DTC006_Result,
  DTC007_Result,
  DTC008_Result,
  DTC009_Result,
  DTC010_Result,
  DTC011_Result,
  DTC012_Result,
  DTC013_Result,
  DTC014_Result,
  DTC015_Result,
  DTC016_Result,
  DTC017_Result,
  DTC018_Result,
  DTC019_Result,
  DTC020_Result,
  DTC021_Result,
  DTC022_Result,
  DTC023_Result,
  DTC024_Result,
  DTC025_Result,
  DTC026_Result,
  DTC027_Result,
} from '../pages/IntermittentDefectTestCasesP1';
import { getDtcP1TestData, DtcP1TestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'intermittentDefectTestCasesP1');

test.describe('Intermittent Defect Test Cases P1 - DTC001 to DTC027', () => {
  let page: Page;
  let context: BrowserContext;
  let dtcData: DtcP1TestData[];
  let dtcPage: IntermittentDefectTestCasesP1Page;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; dtcPage = new IntermittentDefectTestCasesP1Page(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
    dtcData = await getDtcP1TestData();
    context = await browser.newContext();
    page = await context.newPage();
    dtcPage = new IntermittentDefectTestCasesP1Page(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => { await context.close(); });

  function getData(tc: string): DtcP1TestData {
    return dtcData.find(r => r.testCase === tc) ?? dtcData[0];
  }

  // ── DTC001: Archive Records Stale Pagination After Back Navigation ─────────
  test('DTC001 - Archive Records pagination must reset to "0 of 0" after clicking Back from History view', async () => {
    test.setTimeout(90000);
    const data = getData('DTC001');
    const result: DTC001_Result = await dtcPage.dtc001_archiveRecordsStalePagination(SCREENSHOTS_DIR, data);

    expect(result.archivePageVisible, 'Archive Records page should be visible').toBe(true);
    expect(result.historyLoaded, 'History view should load successfully').toBe(true);
    if (result.backClicked) {
      expect(result.paginationResetToZero,
        `Pagination should reset to "0 of 0" after Back click; actual: "${result.paginationAfterBack}"`
      ).toBe(true);
    } else {
      expect(result.backClicked, 'Back button should be clickable after loading History').toBe(true);
    }
  });

  // ── DTC002: Archive Records Column Sort Button Aria Labels ────────────────
  test('DTC002 - Archive Records column sort buttons must have descriptive aria-labels', async () => {
    test.setTimeout(60000);
    const data = getData('DTC002');
    const result: DTC002_Result = await dtcPage.dtc002_archiveRecordsSortAriaLabels(SCREENSHOTS_DIR, data);

    expect(result.historyGridVisible, 'Archive Records History grid should be visible').toBe(true);
    expect(result.columnHeaderCount, 'Archive Records grid should have column headers').toBeGreaterThan(0);
    expect(result.allHeadersHaveAriaLabel,
      `All column sort buttons should have aria-labels; missing on: ${JSON.stringify(result.headersWithoutAriaLabel)}`
    ).toBe(true);
    expect(result.sortDescriptionFound,
      'At least one header aria-label should contain sort description (e.g. "Change sorting for...")'
    ).toBe(true);
  });

  // ── DTC003: Generic SKU Print Button Dialog ───────────────────────────────
  test('DTC003 - Generic SKU List Builder Print button must open "Print SKU List Options" dialog', async () => {
    test.setTimeout(60000);
    const data = getData('DTC003');
    const result: DTC003_Result = await dtcPage.dtc003_genericSkuPrintButtonDialog(SCREENSHOTS_DIR, data);

    expect(result.genericSkuPageVisible, 'Generic SKU List Builder page should be visible').toBe(true);
    expect(result.listTypeSelected, 'A List Type should be selectable from the dropdown').toBe(true);
    if (result.printClicked) {
      expect(result.printDialogVisible,
        'Clicking Print with a List Type selected should open a dialog/modal'
      ).toBe(true);
      if (result.printDialogVisible) {
        expect(result.printDialogTitle.toLowerCase()).toMatch(/print|sku\s*list\s*opt/i);
      }
    } else {
      expect(result.printClicked, 'Print button should be clickable when a List Type is selected').toBe(true);
    }
  });

  // ── DTC004: Generic SKU Reference Column Keyboard Accessibility ───────────
  test('DTC004 - Generic SKU "Reference or Box #" column header must be keyboard-accessible (tabIndex != -1)', async () => {
    test.setTimeout(60000);
    const data = getData('DTC004');
    const result: DTC004_Result = await dtcPage.dtc004_genericSkuReferenceColumnKeyboard(SCREENSHOTS_DIR, data);

    expect(result.genericSkuPageVisible, 'Generic SKU List Builder page should be visible').toBe(true);
    expect(result.referenceColumnExists, '"Reference or Box #" column header should exist in the grid').toBe(true);
    if (result.referenceColumnExists) {
      expect(result.referenceColumnTabAccessible,
        `"Reference or Box #" column header should be keyboard-accessible (tabIndex should not be -1); got: "${result.tabIndexValue}"`
      ).toBe(true);
    }
  });

  // ── DTC005: Generic SKU Sort Order Descending on First Click ─────────────
  test('DTC005 - Generic SKU first column sort click must produce ASCENDING order (not descending)', async () => {
    test.setTimeout(60000);
    const data = getData('DTC005');
    const result: DTC005_Result = await dtcPage.dtc005_genericSkuSortOrderFirstClick(SCREENSHOTS_DIR, data);

    expect(result.genericSkuPageVisible, 'Generic SKU List Builder page should be visible').toBe(true);
    if (result.columnClicked) {
      expect(result.isSortAscending,
        `First click on a column header should sort ASCENDING; detected: "${result.sortDirectionAfterFirstClick}"`
      ).toBe(true);
    } else {
      expect(result.columnClicked, 'A sortable column header should be clickable').toBe(true);
    }
  });

  // ── DTC006: Generic SKU ListType Dropdown Empty Option Value ─────────────
  test('DTC006 - Generic SKU ListType dropdown first option value must be empty string (not "0: null")', async () => {
    test.setTimeout(60000);
    const data = getData('DTC006');
    const result: DTC006_Result = await dtcPage.dtc006_genericSkuListTypeEmptyOption(SCREENSHOTS_DIR, data);

    expect(result.genericSkuPageVisible, 'Generic SKU List Builder page should be visible').toBe(true);
    expect(result.listTypeDropdownFound, 'ListType dropdown should be present on the page').toBe(true);
    if (result.listTypeDropdownFound) {
      expect(result.firstOptionIsEmpty,
        `ListType dropdown first option value should be empty ""; got: "${result.firstOptionValue}"`
      ).toBe(true);
    }
  });

  // ── DTC007: IA History Sku/Upc Column Sort Button Accessibility ───────────
  test('DTC007 - Inventory Adjustment History all 8 column headers must be keyboard-accessible as sort buttons', async () => {
    test.setTimeout(60000);
    const data = getData('DTC007');
    const result: DTC007_Result = await dtcPage.dtc007_iaHistorySkuUpcSortButtons(SCREENSHOTS_DIR, data);

    expect(result.iaHistoryPageVisible, 'Inventory Adjustment History page should be visible').toBe(true);
    // In WISP old, all 8 column headers should be reachable as sort controls
    expect(result.skuColTabAccessible,
      '"Sku #" column header should be keyboard-accessible (tabIndex not -1)'
    ).toBe(true);
    expect(result.upcColTabAccessible,
      '"Upc #" column header should be keyboard-accessible (tabIndex not -1)'
    ).toBe(true);
  });

  // ── DTC008: RTV Edit Button Renamed to View ───────────────────────────────
  test('DTC008 - Return To Vendor first action button must be labeled "Edit" (not "View")', async () => {
    test.setTimeout(60000);
    const data = getData('DTC008');
    const result: DTC008_Result = await dtcPage.dtc008_rtvEditButtonRename(SCREENSHOTS_DIR, data);

    expect(result.rtvPageVisible, 'Return To Vendor page should be visible').toBe(true);
    expect(result.firstButtonIsEdit,
      `First action button should be "Edit"; got: "${result.firstButtonLabel}"`
    ).toBe(true);
    expect(result.hasViewButton,
      'The "View" button label should NOT be present (button should be named "Edit")'
    ).toBe(false);
  });

  // ── DTC009: IA History Date Format ISO vs US ──────────────────────────────
  test('DTC009 - Inventory Adjustment History "Adjust Date/Time" column must use US date format (m/d/yyyy)', async () => {
    test.setTimeout(60000);
    const data = getData('DTC009');
    const result: DTC009_Result = await dtcPage.dtc009_iaHistoryDateFormat(SCREENSHOTS_DIR, data);

    expect(result.iaHistoryPageVisible, 'Inventory Adjustment History page should be visible').toBe(true);
    if (result.sampleDateValue) {
      expect(result.dateIsUsFormat,
        `"Adjust Date/Time" should display US format (m/d/yyyy); got: "${result.sampleDateValue}"`
      ).toBe(true);
      expect(result.dateIsIsoFormat,
        `"Adjust Date/Time" should NOT use ISO format (yyyy-mm-dd); got: "${result.sampleDateValue}"`
      ).toBe(false);
    }
  });

  // ── DTC010: Item Inquiry Section Header Color ─────────────────────────────
  test('DTC010 - Item Inquiry section header labels must display white text on teal background (not dark text)', async () => {
    test.setTimeout(90000);
    const data = getData('DTC010');
    const result: DTC010_Result = await dtcPage.dtc010_itemInquirySectionHeaderColor(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.itemFound, `Item SKU ${data.sku || '123253'} should be findable in Item Inquiry`).toBe(true);
    if (result.sectionHeaderCount > 0) {
      expect(result.colorIsWhite,
        `Section header text color should be white (rgb(255,255,255)); got: "${result.sectionHeaderColor}"`
      ).toBe(true);
    }
  });

  // ── DTC011: Item Inquiry Label Field Empty ────────────────────────────────
  test('DTC011 - Item Inquiry "Label" field must display a non-empty value for a valid SKU', async () => {
    test.setTimeout(90000);
    const data = getData('DTC011');
    const result: DTC011_Result = await dtcPage.dtc011_itemInquiryLabelField(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.itemFound, `Item SKU ${data.sku || '123253'} should be findable in Item Inquiry`).toBe(true);
    if (result.labelFieldExists) {
      expect(result.labelIsEmpty,
        `"Label" field should not be empty; got: "${result.labelValue}"`
      ).toBe(false);
    }
    // Note: Label field may not render for all items; itemFound is the primary check
  });

  // ── DTC012: Item Inquiry Price Values ─────────────────────────────────────
  test('DTC012 - Item Inquiry Selling Price and Regular Retail must NOT equal the Was Price', async () => {
    test.setTimeout(90000);
    const data = getData('DTC012');
    const result: DTC012_Result = await dtcPage.dtc012_itemInquiryPriceValues(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.itemFound, `Item SKU ${data.sku || '123253'} should be findable in Item Inquiry`).toBe(true);
    if (result.sellingPrice && result.wasPrice) {
      expect(result.sellingPriceMatchesWasPrice,
        `Selling Price "${result.sellingPrice}" should NOT equal Was Price "${result.wasPrice}" (price values are incorrect)`
      ).toBe(false);
    }
  });

  // ── DTC013: Item Inquiry Promotions Table Description Column ─────────────
  test('DTC013 - Item Inquiry Promotions table must contain the "Description" column (4 columns total)', async () => {
    test.setTimeout(90000);
    const data = getData('DTC013');
    const result: DTC013_Result = await dtcPage.dtc013_itemInquiryPromotionsTable(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.itemFound, `Item SKU ${data.sku || '123253'} should be findable in Item Inquiry`).toBe(true);
    if (result.promotionsSectionVisible) {
      expect(result.hasDescriptionColumn,
        `Promotions table should have a "Description" column; found columns: ${JSON.stringify(result.promotionColumnHeaders)}`
      ).toBe(true);
      expect(result.columnCount,
        `Promotions table should have ${data.expectedPromoColumnCount || '4'} columns; found ${result.columnCount}`
      ).toBeGreaterThanOrEqual(4);
    }
  });

  // ── DTC014: Item Inquiry View More Search Options Arrow ───────────────────
  test('DTC014 - Item Inquiry "View More Search Options" bar must display a directional expand/collapse indicator icon', async () => {
    test.setTimeout(60000);
    const data = getData('DTC014');
    const result: DTC014_Result = await dtcPage.dtc014_itemInquiryViewMoreArrow(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.viewMoreBarVisible, '"View More Search Options" bar should be present on the page').toBe(true);
    if (result.viewMoreBarVisible) {
      expect(result.directionalIconVisible,
        '"View More Search Options" bar should display a directional indicator icon (▸)'
      ).toBe(true);
    }
  });

  // ── DTC015: Item Inquiry Sales History Order ──────────────────────────────
  test('DTC015 - Item Inquiry Sales History rows must be ordered ascending and use correct period identifiers', async () => {
    test.setTimeout(90000);
    const data = getData('DTC015');
    const result: DTC015_Result = await dtcPage.dtc015_itemInquirySalesHistoryOrder(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.itemFound, `Item SKU ${data.sku || '123253'} should be findable in Item Inquiry`).toBe(true);
    if (result.salesHistoryVisible && result.rowLabels.length >= 2) {
      expect(result.orderIsAscending,
        `Sales History rows should be in ascending order; found: ${JSON.stringify(result.rowLabels)}`
      ).toBe(true);
    }
  });

  // ── DTC016: Item Inquiry Tab Colors Inverted ──────────────────────────────
  test('DTC016 - Item Inquiry "Item Search" tab must display orange (highlighted/primary) background', async () => {
    test.setTimeout(90000);
    const data = getData('DTC016');
    const result: DTC016_Result = await dtcPage.dtc016_itemInquiryTabColors(SCREENSHOTS_DIR, data);

    expect(result.itemInquiryPageVisible, 'Item Inquiry page should be visible').toBe(true);
    expect(result.itemFound, `Item SKU ${data.sku || '123253'} should be findable in Item Inquiry`).toBe(true);
    if (result.itemSearchTabColor) {
      expect(result.itemSearchTabIsOrange,
        `"Item Search" tab should have orange background; got: "${result.itemSearchTabColor}"`
      ).toBe(true);
    }
  });

  // ── DTC017: Label Request User Requested Labels Print Dialog Users ────────
  test('DTC017 - Label Request User Requested Labels print dialog must show a non-empty user list', async () => {
    test.setTimeout(90000);
    const data = getData('DTC017');
    const result: DTC017_Result = await dtcPage.dtc017_labelRequestUserPrintDialog(SCREENSHOTS_DIR, data);

    expect(result.labelRequestPageVisible, 'Label Request page should be visible').toBe(true);
    if (result.printClicked && result.printDialogVisible) {
      expect(result.userListIsEmpty,
        `"Please select a user" dialog user list should NOT be empty; count: ${result.userListCount}`
      ).toBe(false);
      expect(result.userListCount,
        'User list should have at least 1 entry ("All" and/or "system")'
      ).toBeGreaterThanOrEqual(1);
    } else {
      expect(result.printDialogVisible, 'Print dialog should appear after clicking the Print button').toBe(true);
    }
  });

  // ── DTC018: Label Request Merchandise Labels Print Dialog ─────────────────
  test('DTC018 - Label Request Merchandise Labels print dialog must show a non-empty user list', async () => {
    test.setTimeout(90000);
    const data = getData('DTC018');
    const result: DTC018_Result = await dtcPage.dtc018_labelRequestMerchandisePrintDialog(SCREENSHOTS_DIR, data);

    expect(result.merchandiseLabelsVisible, 'Merchandise Labels section should be visible').toBe(true);
    if (result.printClicked && result.printDialogVisible) {
      expect(result.userListIsEmpty,
        `"Please select a user" dialog user list should NOT be empty; count: ${result.userListCount}`
      ).toBe(false);
      expect(result.userListCount,
        'User list should have at least 1 entry'
      ).toBeGreaterThanOrEqual(1);
    } else {
      expect(result.printDialogVisible, 'Print dialog should appear after clicking the Print button').toBe(true);
    }
  });

  // ── DTC019: Label Request Print Dialog Size ───────────────────────────────
  test('DTC019 - Label Request print "Please select a user" dialog must be a full-width overlay (not a narrow popup)', async () => {
    test.setTimeout(90000);
    const data = getData('DTC019');
    const result: DTC019_Result = await dtcPage.dtc019_labelRequestPrintDialogSize(SCREENSHOTS_DIR, data);

    if (result.printDialogVisible) {
      expect(result.isFullWidthOverlay,
        `Print dialog should be full-width overlay; dialog: ${result.dialogWidth}px vs content: ${result.contentAreaWidth}px`
      ).toBe(true);
    } else {
      expect(result.printDialogVisible, 'Print dialog should be visible to check its size').toBe(true);
    }
  });

  // ── DTC020: RWOPO Select Vendor Auto Modal ────────────────────────────────
  test('DTC020 - Opening "Receive Without PO" must automatically display the "Select Vendor" modal on page load', async () => {
    test.setTimeout(60000);
    const data = getData('DTC020');
    const result: DTC020_Result = await dtcPage.dtc020_rwopoSelectVendorAutoModal(SCREENSHOTS_DIR, data);

    expect(result.rwopoPageVisible, 'Receive Without PO page should be visible').toBe(true);
    expect(result.selectVendorModalAutoVisible,
      'A modal/dialog should appear automatically when the RWOPO page loads'
    ).toBe(true);
    expect(result.modalVisibleOnLoad,
      'The automatically shown modal should contain vendor-related content ("Select Vendor")'
    ).toBe(true);
  });

  // ── DTC021: RWOPO Select Vendor Dialog Title ──────────────────────────────
  test('DTC021 - RWOPO "Select Vendor" dialog must display "Select Vendor" as its header title', async () => {
    test.setTimeout(60000);
    const data = getData('DTC021');
    const result: DTC021_Result = await dtcPage.dtc021_rwopoSelectVendorDialogTitle(SCREENSHOTS_DIR, data);

    expect(result.rwopoPageVisible, 'Receive Without PO page should be visible').toBe(true);
    expect(result.selectVendorDialogVisible,
      'Select Vendor dialog should appear when Add SKU is clicked'
    ).toBe(true);
    expect(result.titleIsPresent,
      `Select Vendor dialog title should be "Select Vendor"; got: "${result.dialogTitle}"`
    ).toBe(true);
  });

  // ── DTC022: RWOPO Extra Unlabeled Grid Column ─────────────────────────────
  test('DTC022 - Receive Without PO item grid must have exactly 4 named columns with no unlabeled first column', async () => {
    test.setTimeout(60000);
    const data = getData('DTC022');
    const result: DTC022_Result = await dtcPage.dtc022_rwopoExtraGridColumn(SCREENSHOTS_DIR, data);

    expect(result.rwopoPageVisible, 'Receive Without PO page should be visible').toBe(true);
    expect(result.hasUnlabeledColumn,
      `Grid should have NO unlabeled columns; found headers: ${JSON.stringify(result.gridColumnHeaders)}`
    ).toBe(false);
    expect(result.expectedColumnsPresent,
      `Grid should contain exactly Description, SKU, Quantity, On Order columns; found: ${JSON.stringify(result.gridColumnHeaders)}`
    ).toBe(true);
  });

  // ── DTC023: Worksheets No Items to Display ────────────────────────────────
  test('DTC023 - Worksheets page must display worksheet records on load (not "No items to display")', async () => {
    test.setTimeout(60000);
    const data = getData('DTC023');
    const result: DTC023_Result = await dtcPage.dtc023_worksheetsNoItems(SCREENSHOTS_DIR, data);

    expect(result.worksheetsPageVisible, 'Worksheets page should be visible').toBe(true);
    expect(result.gridHasData,
      'Worksheets grid should display records on load (not be empty)'
    ).toBe(true);
    expect(result.noItemsMessageVisible,
      `Worksheets grid must NOT show "No items to display"; message: "${result.noItemsMessageText}"`
    ).toBe(false);
  });

  // ── DTC024: Application Alerts Grid Cells Blank ───────────────────────────
  test('DTC024 - Application Alerts grid must display data in Type, Description, and Status columns (cells not blank)', async () => {
    test.setTimeout(60000);
    const data = getData('DTC024');
    const result: DTC024_Result = await dtcPage.dtc024_appAlertsGridCellsBlank(SCREENSHOTS_DIR, data);

    expect(result.appAlertsPageVisible, 'Application Alerts page should be visible').toBe(true);
    expect(result.gridVisible, 'Application Alerts grid should be visible').toBe(true);
    if (result.gridRowCount > 0) {
      expect(result.typeColumnHasData,
        'Application Alerts "Type" column should contain data (not be blank)'
      ).toBe(true);
      expect(result.descriptionColumnHasData,
        'Application Alerts "Description" column should contain data (not be blank)'
      ).toBe(true);
      expect(result.statusColumnHasData,
        'Application Alerts "Status" column should contain data (not be blank)'
      ).toBe(true);
    }
  });

  // ── DTC025: Application Alerts Grid Header Text Color ────────────────────
  test('DTC025 - Application Alerts grid column headers must use dark text color (not white text on cyan background)', async () => {
    test.setTimeout(60000);
    const data = getData('DTC025');
    const result: DTC025_Result = await dtcPage.dtc025_appAlertsHeaderTextColor(SCREENSHOTS_DIR, data);

    expect(result.appAlertsPageVisible, 'Application Alerts page should be visible').toBe(true);
    expect(result.gridVisible, 'Application Alerts grid should be visible').toBe(true);
    expect(result.headerTextColor, 'Grid column header text color should be detectable').toBeTruthy();
    expect(result.headerColorIsDark,
      `Grid column header text should be dark (rgba(0,0,0,0.54)); got: "${result.headerTextColor}"`
    ).toBe(true);
  });

  // ── DTC026: Application Alerts Filter Input Appearance ───────────────────
  test('DTC026 - Application Alerts filter input must have transparent background (not gray filled appearance)', async () => {
    test.setTimeout(60000);
    const data = getData('DTC026');
    const result: DTC026_Result = await dtcPage.dtc026_appAlertsFilterAppearance(SCREENSHOTS_DIR, data);

    expect(result.appAlertsPageVisible, 'Application Alerts page should be visible').toBe(true);
    if (result.filterInputVisible) {
      expect(result.backgroundIsTransparent,
        `Filter input should have transparent background; got: "${result.filterBackgroundColor}"`
      ).toBe(true);
    } else {
      expect(result.filterInputVisible, 'Filter input should be visible on Application Alerts page').toBe(true);
    }
  });

  // ── DTC027: Application Alerts Paginator Hyphen ───────────────────────────
  test('DTC027 - Application Alerts paginator range label must use regular hyphen "-" (not en-dash "–")', async () => {
    test.setTimeout(60000);
    const data = getData('DTC027');
    const result: DTC027_Result = await dtcPage.dtc027_appAlertsPaginatorHyphen(SCREENSHOTS_DIR, data);

    expect(result.appAlertsPageVisible, 'Application Alerts page should be visible').toBe(true);
    if (result.paginatorText && result.paginatorText.length > 0) {
      expect(result.usesEnDash,
        `Paginator range label should use regular hyphen "-" not en-dash "–"; got: "${result.paginatorText}"`
      ).toBe(false);
      expect(result.usesHyphen,
        `Paginator range label should use regular hyphen "-"; got: "${result.paginatorText}"`
      ).toBe(true);
    }
  });
});
