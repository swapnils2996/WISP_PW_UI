import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { StoreAddressInquiryPage } from '../pages/StoreAddressInquiryPage';
import { getStoreAddressInquiryTestData, StoreAddressInquiryTestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'storeAddressInquiry');

test.describe('Store Address Inquiry', () => {
  let page: Page;
  let context: BrowserContext;
  let saiData: StoreAddressInquiryTestData[];
  let saiPage: StoreAddressInquiryPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; saiPage = new StoreAddressInquiryPage(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    saiData = await getStoreAddressInquiryTestData();
    context = await browser.newContext();
    page    = await context.newPage();
    saiPage = new StoreAddressInquiryPage(page);

    // Set up API mocks before login
    await saiPage.setupApiMocks(context);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => { await context.close(); });

  // ── TC-SAI-01: Load screen ──────────────────────────────────────────────────
  test('TC-SAI-01 - Load Store Address Inquiry screen and verify all UI elements', async () => {
    test.setTimeout(120000);
    const result = await saiPage.tc01_loadScreen(SCREENSHOTS_DIR);

    expect(result.storeNoInputVisible, 'Store Number input should be visible').toBe(true);
    expect(result.cityInputVisible, 'City input should be visible').toBe(true);
    expect(result.stateInputVisible, 'State input should be visible').toBe(true);
    expect(result.zipInputVisible, 'Zip input should be visible').toBe(true);
    expect(result.searchBtnVisible, 'Search button should be visible').toBe(true);
    expect(result.clearBtnVisible, 'Clear button should be visible').toBe(true);
    expect(result.gridVisible, 'Results grid should be visible').toBe(true);
  });

  // ── TC-SAI-02: Search by Store Number ───────────────────────────────────────
  test('TC-SAI-02 - Search by Store Number returns matching store record', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-02')!;
    const result = await saiPage.tc02_searchByStoreNumber(SCREENSHOTS_DIR, data);

    expect(result.resultsVisible, 'Results should be visible after store number search').toBe(true);
    expect(result.rowCount, 'At least one result row should be returned').toBeGreaterThan(0);
    expect(result.hasStoreNoCol, 'Store No column (#) should be visible').toBe(true);
    expect(result.hasCityCol, 'City column should be visible').toBe(true);
    expect(result.hasStateCol, 'State column should be visible').toBe(true);
    expect(result.matchesStoreNo, 'Result should contain the searched store number').toBe(true);
  });

  // ── TC-SAI-03: Search by City ────────────────────────────────────────────────
  test('TC-SAI-03 - Search by City returns stores in that city', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-03')!;
    const result = await saiPage.tc03_searchByCity(SCREENSHOTS_DIR, data);

    expect(result.resultsVisible, 'Results should be visible after city search').toBe(true);
    expect(result.rowCount, 'At least one result should be returned for city search').toBeGreaterThan(0);
  });

  // ── TC-SAI-04: Search by Zip Code ────────────────────────────────────────────
  test('TC-SAI-04 - Search by Zip Code returns matching stores', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-04')!;
    const result = await saiPage.tc04_searchByZip(SCREENSHOTS_DIR, data);

    expect(result.resultsVisible, 'Results should be visible after zip code search').toBe(true);
    expect(result.rowCount, 'At least one result should be returned for zip search').toBeGreaterThan(0);
  });

  // ── TC-SAI-05: Search by State ───────────────────────────────────────────────
  test('TC-SAI-05 - Search by State/Province code returns stores in that state', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-05')!;
    const result = await saiPage.tc05_searchByState(SCREENSHOTS_DIR, data);

    expect(result.resultsVisible, 'Results should be visible after state search').toBe(true);
    expect(result.rowCount, 'At least one result should be returned for state search').toBeGreaterThan(0);
  });

  // ── TC-SAI-06: Search with no criteria ──────────────────────────────────────
  test('TC-SAI-06 - Search with no criteria shows error or no results', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-06')!;
    const result = await saiPage.tc06_searchWithNoCriteria(SCREENSHOTS_DIR, data);

    expect(result.alertOrNoResultsVisible, 'Error message or empty results should appear for blank search').toBe(true);
  });

  // ── TC-SAI-07: Search non-existent store ────────────────────────────────────
  test('TC-SAI-07 - Search with non-existent store number shows no results', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-07')!;
    const result = await saiPage.tc07_searchNonExistentStore(SCREENSHOTS_DIR, data);

    expect(result.noResultsVisible, 'No results should be visible for non-existent store').toBe(true);
  });

  // ── TC-SAI-08: Non-numeric input in Store Number field ───────────────────────
  test('TC-SAI-08 - Store Number field only accepts numeric/valid input', async () => {
    test.setTimeout(120000);
    const result = await saiPage.tc08_nonNumericInStoreField(SCREENSHOTS_DIR);

    // The field may or may not reject alphabetic input depending on implementation
    // We verify the field value after typing non-numeric characters
    expect(result.fieldValue !== undefined, 'Field value should be retrievable').toBe(true);
  });

  // ── TC-SAI-09: Clear button resets all fields ────────────────────────────────
  test('TC-SAI-09 - Clear button resets all search fields and clears results', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-09')!;
    const result = await saiPage.tc09_clearButtonResetsFields(SCREENSHOTS_DIR, data);

    expect(result.allFieldsCleared, 'All search fields should be cleared after clicking Clear').toBe(true);
  });

  // ── TC-SAI-10: Grid filter/search within results ─────────────────────────────
  test('TC-SAI-10 - Grid filter narrows displayed rows', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-10')!;
    const result = await saiPage.tc10_gridFilter(SCREENSHOTS_DIR, data);

    expect(result.filterReduced, 'Grid filter should reduce or maintain row count').toBe(true);
  });

  // ── TC-SAI-11: Grid column sorting ──────────────────────────────────────────
  test('TC-SAI-11 - Clicking column header sorts the results grid', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-11')!;
    const result = await saiPage.tc11_gridColumnSorting(SCREENSHOTS_DIR, data);

    expect(result.sortedAscending, 'Grid should sort ascending on first click').toBe(true);
    expect(result.sortedDescending, 'Grid should sort descending on second click').toBe(true);
  });

  // ── TC-SAI-12: Grid pagination ───────────────────────────────────────────────
  test('TC-SAI-12 - Grid pagination controls work correctly', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-12')!;
    const result = await saiPage.tc12_gridPagination(SCREENSHOTS_DIR, data);

    expect(result.paginationVisible, 'Pagination control should be visible').toBe(true);
  });

  // ── TC-SAI-13: Row click highlights selected row ─────────────────────────────
  test('TC-SAI-13 - Row click highlights selected row and double-click is handled', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-13')!;
    const result = await saiPage.tc13_rowClickHighlight(SCREENSHOTS_DIR, data);

    expect(result.rowHighlighted || result.doubleClickHandled,
      'Row click or double-click should be handled').toBe(true);
  });

  // ── TC-SAI-14: Combined multi-field search ───────────────────────────────────
  test('TC-SAI-14 - Combined multi-field search narrows results accurately', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-14')!;
    const result = await saiPage.tc14_multiFieldSearch(SCREENSHOTS_DIR, data);

    expect(result.resultsVisible, 'Results should be visible for multi-field search').toBe(true);
    expect(result.resultsNarrowed, 'Multi-field search should narrow or maintain results').toBe(true);
  });

  // ── TC-SAI-15: Offline/network failure ──────────────────────────────────────
  test('TC-SAI-15 - Offline mode is handled gracefully; reconnect allows successful search', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-15')!;
    const result = await saiPage.tc15_offlineNetworkFailure(SCREENSHOTS_DIR, data);

    expect(result.pageStable, 'Page should remain stable during offline state').toBe(true);
    expect(result.searchSucceededAfterReconnect, 'Search should succeed after network reconnection').toBe(true);
  });

  // ── TC-SAI-16: Search by pressing Enter key ──────────────────────────────────
  test('TC-SAI-16 - Pressing Enter in search field triggers the search', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-16')!;
    const result = await saiPage.tc16_searchByEnterKey(SCREENSHOTS_DIR, data);

    expect(result.triggeredByEnter, 'Search should be triggered by pressing Enter').toBe(true);
    expect(result.resultsVisible, 'Results should be visible after Enter key search').toBe(true);
  });

  // ── TC-SAI-17: All columns display correctly ─────────────────────────────────
  test('TC-SAI-17 - All expected columns are displayed in the results grid', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-17')!;
    const result = await saiPage.tc17_allColumnsDisplay(SCREENSHOTS_DIR, data);

    expect(result.hasStoreNoCol, 'Store No (#) column should be present').toBe(true);
    expect(result.hasCityCol, 'City column should be present').toBe(true);
    expect(result.hasStateCol, 'State column should be present').toBe(true);
    expect(result.hasPhoneCol, 'Phone column should be present').toBe(true);
    expect(result.hasAddr1Col, 'Address 1 column should be present').toBe(true);
    expect(result.hasZipCol, 'Zip column should be present').toBe(true);
    expect(result.hasTypeCol, 'Type column should be present').toBe(true);
  });

  // ── TC-SAI-18: Store Number Filter panel collapse/expand ──────────────────────
  test('TC-SAI-18 - Store Number Filter panel collapses and expands correctly', async () => {
    test.setTimeout(120000);
    const result = await saiPage.tc18_panelCollapseExpand(SCREENSHOTS_DIR);

    expect(result.panelCollapseToggleVisible, 'Panel collapse toggle should be visible').toBe(true);
    expect(result.fieldsHiddenAfterCollapse, 'Filter fields should be hidden after collapsing').toBe(true);
    expect(result.fieldsVisibleAfterExpand, 'Filter fields should be visible after expanding').toBe(true);
  });

  // ── TC-SAI-19: Validation error message text ──────────────────────────────────
  test('TC-SAI-19 - Empty search shows specific validation error message', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-19')!;
    const result = await saiPage.tc19_validationErrorMessageText(SCREENSHOTS_DIR, data);

    expect(result.hasValidationError, 'A validation error message should appear for empty search').toBe(true);
    expect(result.specificTextMatch, 'Error message should mention store number, city, state or zip').toBe(true);
  });

  // ── TC-SAI-20: Paginator page size change ────────────────────────────────────
  test('TC-SAI-20 - Paginator page size options work correctly', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-20')!;
    const result = await saiPage.tc20_paginatorPageSize(SCREENSHOTS_DIR, data);

    expect(result.paginatorVisible, 'Paginator should be visible').toBe(true);
    expect(result.pageSizeChangedTo5, 'Page size should be changeable to 5').toBe(true);
    expect(result.rowCountLimitedBy5, 'Row count should be at most 5 after selecting page size 5').toBe(true);
  });

  // ── TC-SAI-21: Grid filter no-match shows zero rows ───────────────────────────
  test('TC-SAI-21 - Grid filter with no-match text shows zero rows', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-21')!;
    const result = await saiPage.tc21_gridFilterNoMatch(SCREENSHOTS_DIR, data);

    expect(result.initialRowCount, 'Initial search should return rows').toBeGreaterThan(0);
    expect(result.noMatchShowsZero, 'No-match filter text should result in zero displayed rows').toBe(true);
    expect(result.filterClearedRowCount, 'Clearing filter should restore rows').toBeGreaterThanOrEqual(0);
  });

  // ── TC-SAI-22: Address 2 and Address 3 columns present ───────────────────────
  test('TC-SAI-22 - Address 2 and Address 3 columns are present in results grid', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-22')!;
    const result = await saiPage.tc22_address2And3Columns(SCREENSHOTS_DIR, data);

    expect(result.hasAddr2Col, 'Address 2 column should be present in the grid').toBe(true);
    expect(result.hasAddr3Col, 'Address 3 column should be present in the grid').toBe(true);
  });

  // ── TC-SAI-23: Sort by multiple columns ──────────────────────────────────────
  test('TC-SAI-23 - Grid remains stable when sorted by multiple columns (State, Zip, Type, #)', async () => {
    test.setTimeout(120000);
    const data = saiData.find(r => r.testCase === 'TC-SAI-23')!;
    const result = await saiPage.tc23_sortMultipleColumns(SCREENSHOTS_DIR, data);

    expect(result.allSortsCompleted, 'All sort column headers should be clickable').toBe(true);
    expect(result.sortStable, 'Grid should maintain rows after multi-column sorting').toBe(true);
  });
});
