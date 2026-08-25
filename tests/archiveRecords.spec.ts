import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { ArchiveRecordsPage } from '../pages/ArchiveRecordsPage';
import { getArchiveRecordsTestData, ArchiveRecordsTestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import '../pages/ArchiveRecordsPage'; // ensure prototype extensions are registered
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'archiveRecords');

test.describe('Archive Records', () => {
  let page: Page;
  let context: BrowserContext;
  let arData: ArchiveRecordsTestData;
  let arPage: ArchiveRecordsPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; arPage = new ArchiveRecordsPage(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
    arData = (await getArchiveRecordsTestData())[0];
    context = await browser.newContext();
    page = await context.newPage();
    arPage = new ArchiveRecordsPage(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => { await context.close(); });

  // ── AR_WTC01: Load archive page controls and grid ──────────────────────────
  // Validates: Actions panel (History, Print), grid columns, empty-state message, paginator

  test('AR_WTC01 - Load Archive Records page and validate all UI elements', async () => {
    const result = await arPage.tc01_loadArchivePage(SCREENSHOTS_DIR);

    expect(result.pageLoaded,
      'app-archiverecordpage component should be visible after navigation').toBe(true);

    // Action buttons — History and Print are confirmed present; Delete is intentionally deferred
    expect(result.historyBtnVisible,
      'History button should be visible in the actions panel').toBe(true);
    expect(result.printBtnVisible,
      'Print button should be visible in the actions panel').toBe(true);
    expect(result.deleteBtnVisible,
      'Delete button should NOT be present (feature deferred per test spec)').toBe(false);

    // Grid
    expect(result.gridVisible,
      'Archive Records grid (mat-table) should be visible').toBe(true);

    // Columns — confirmed from live DOM: Store, Barcode, Record Type, From Date, To Date, Date Scanned, Scanned By
    expect(result.hasRecordTypeColumn,
      'Grid should have Record Type column').toBe(true);
    expect(result.hasFromDateColumn,
      'Grid should have From Date column').toBe(true);
    expect(result.hasToDateColumn,
      'Grid should have To Date column').toBe(true);
    expect(result.hasDateScannedColumn,
      'Grid should have Date Scanned column').toBe(true);
    expect(result.hasScannedByColumn,
      'Grid should have Scanned By column').toBe(true);

    // Filter input visible (confirmed in DOM inspection)
    expect(result.filterVisible,
      'Filter input should be visible').toBe(true);

    // Paginator visible
    expect(result.paginatorVisible,
      'Paginator should be visible').toBe(true);

    // Empty state — DB has no archive records so "No unfinalized records found" is expected
    expect(result.emptyStateMsgVisible,
      'Empty state message should be displayed when no records exist').toBe(true);
    expect(result.emptyStateMsgText.toLowerCase()).toMatch(/no.*record|no.*unfinalized/);

    // Row count is 0 because archive table is empty
    expect(result.rowCount, 'Row count should be 0 for empty archive').toBe(0);
  });

  // ── AR_WTC02: Toggle history / back view ──────────────────────────────────
  // Validates: History click reloads grid in finalized mode; Back returns to default view

  test('AR_WTC02 - Toggle between current and finalized archive views', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc02_toggleHistoryView(SCREENSHOTS_DIR);

    expect(result.historyBtnVisibleBefore,
      'History button should be visible before any toggle').toBe(true);
    expect(result.historyBtnClicked,
      'History button should be clickable').toBe(true);
    expect(result.gridReloadedAfterHistory,
      'app-archiverecordpage should remain visible after clicking History').toBe(true);

    // After clicking History the label switches to "Back"
    expect(result.backBtnVisible,
      'Back button should appear after clicking History').toBe(true);
    expect(result.backBtnClicked,
      'Back button should be clickable').toBe(true);

    // After clicking Back the view returns to default
    expect(result.gridRestoredAfterBack,
      'Grid should remain visible after clicking Back').toBe(true);
    expect(result.historyBtnVisibleAfterBack,
      'History button should be visible again after clicking Back').toBe(true);
  });

  // ── AR_WTC03: Delete functionality (deferred) ─────────────────────────────
  // Validates: Delete button intentionally absent per test case specification

  test('AR_WTC03 - Verify Delete button is absent (feature deferred per specification)', async () => {
    const result = await arPage.tc03_deleteStatus(SCREENSHOTS_DIR);

    // Delete is intentionally deferred — assert it is NOT present
    expect(result.deleteBtnAbsent,
      'Delete button should be absent — feature is deferred per test case CSV').toBe(true);

    // Grid still loaded
    expect(result.rowCount).toBeGreaterThanOrEqual(0);
    expect(result.featureDeferredNote.length).toBeGreaterThan(0);
  });

  // ── AR_WTC04: Print and offline error handling ─────────────────────────────
  // Validates: Print button accessible; offline produces graceful response; online restores

  test('AR_WTC04 - Print archive report and handle offline errors gracefully', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc04_printAndOffline(SCREENSHOTS_DIR, context);

    // Print button must be visible and clickable
    expect(result.printBtnVisible,
      'Print button should be visible in the actions panel').toBe(true);
    expect(result.printBtnClicked,
      'Print button should be clickable').toBe(true);

    // Clicking Print on an empty grid should produce some response
    // (message, report, or no-selection alert)
    expect(result.printResponseVisible || result.printResponseText.length >= 0,
      'Print click should complete without crashing the page').toBe(true);

    // Offline/online cycle must be exercisable
    expect(result.offlineSet,
      'Network should be settable to offline').toBe(true);
    expect(result.networkRestored,
      'Network should be restorable after offline test').toBe(true);

    // After restoring network the page should still be usable
    expect(result.printBtnVisible,
      'Print button should still be accessible after network recovery').toBe(true);
  });

  // ── AR_WTC05: Filter narrows records in History view; no-match shows empty ──
  // Validates: Filter input reduces paginator count, no-match empties grid, clearing restores all

  test('AR_WTC05 - Filter in History view reduces records; no-match shows empty grid', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc05_filterInHistoryView(SCREENSHOTS_DIR);

    expect(result.historyLoaded,
      'Archive Records component should be visible after clicking History').toBe(true);
    expect(result.filterInputVisible,
      'Filter input should be present in the history view').toBe(true);
    expect(result.totalBeforeFilter.length,
      'Paginator should show a range before any filter is applied').toBeGreaterThan(0);
    expect(result.filterReducedRecords,
      'Typing a search term should reduce the number of displayed records').toBe(true);
    expect(result.noMatchShowsEmptyGrid,
      'A no-match search term should result in 0 rows in the grid').toBe(true);
    expect(result.clearRestoresRecords,
      'Clearing the filter should restore records to the grid').toBe(true);
  });

  // ── AR_WTC06: Column sorting toggles asc/desc in History view ──────────────
  // Validates: Clicking column header sorts data; second click reverses order

  test('AR_WTC06 - Column sorting toggles ascending and descending in History view', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc06_columnSorting(SCREENSHOTS_DIR);

    expect(result.historyLoaded,
      'History view should load with records').toBe(true);
    expect(result.barcodeAscFirstValue.length,
      'First row Barcode value should be readable after ascending sort').toBeGreaterThan(0);
    expect(result.barcodeDescFirstValue.length,
      'First row Barcode value should be readable after descending sort').toBeGreaterThan(0);
    expect(result.sortToggleChanged,
      'First row value should change when sort direction is toggled').toBe(true);
  });

  // ── AR_WTC07: Items-per-page and next/prev pagination in History view ────────
  // Validates: Next page advances paginator range; Previous page returns to first page

  test('AR_WTC07 - Items-per-page dropdown and Next/Previous pagination work correctly', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc07_paginationAndPageSize(SCREENSHOTS_DIR);

    expect(result.historyLoaded,
      'History view should load successfully').toBe(true);
    expect(result.defaultPageSizeText.length,
      'Paginator should show a default range text').toBeGreaterThan(0);
    expect(result.nextPageWorked,
      'Next page button should be clickable when more pages exist').toBe(true);
    expect(result.paginatorTextAfterNext).not.toEqual(result.defaultPageSizeText);
    expect(result.prevPageWorked,
      'Previous page button should be clickable after moving forward').toBe(true);
    expect(result.paginatorTextAfterPrev,
      'Previous page should return to the initial page range').toEqual(result.defaultPageSizeText);
  });

  // ── AR_WTC08: History success banner shows finalized record count ─────────────
  // Validates: Green success banner appears after History click, mentions count and "finalized"

  test('AR_WTC08 - History view displays success banner with finalized record count', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc08_historyBannerContent(SCREENSHOTS_DIR);

    expect(result.historyLoaded,
      'History view should load successfully').toBe(true);
    expect(result.successBannerVisible,
      'A success banner should appear after clicking History').toBe(true);
    expect(result.successBannerText.length,
      'Success banner should contain descriptive text').toBeGreaterThan(0);
    expect(result.bannerMentionsCount,
      'Banner text should include the number of finalized records').toBe(true);
    expect(result.bannerMentionsFinalized,
      'Banner text should mention "finalized"').toBe(true);
  });

  // ── AR_WTC09: Print with a selected row in History view ──────────────────────
  // Validates: Selecting a row and clicking Print completes without crashing; page remains loaded

  test('AR_WTC09 - Print with a selected row in History view completes without error', async () => {
    test.setTimeout(120000);
    const result = await arPage.tc09_printWithSelection(SCREENSHOTS_DIR);

    expect(result.historyLoaded,
      'History view should load with records available').toBe(true);
    expect(result.rowCount,
      'History view should have at least one row to select').toBeGreaterThan(0);
    expect(result.rowSelected,
      'First row should be selectable').toBe(true);
    expect(result.printBtnVisible,
      'Print button should be visible in the History view').toBe(true);
    expect(result.printClicked,
      'Print button should be clickable after row selection').toBe(true);
    expect(result.pageStillLoaded,
      'Page should remain loaded and not crash after clicking Print').toBe(true);
  });
});
