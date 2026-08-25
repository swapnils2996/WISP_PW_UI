import { Page, Locator, BrowserContext, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ArchiveRecordsTestData } from '../utils/excelHelper';

// ── Return-type interfaces ────────────────────────────────────────────────────

export interface AR_TC01Result {
  pageLoaded: boolean;
  historyBtnVisible: boolean;
  printBtnVisible: boolean;
  deleteBtnVisible: boolean;
  gridVisible: boolean;
  filterVisible: boolean;
  hasRecordTypeColumn: boolean;
  hasFromDateColumn: boolean;
  hasToDateColumn: boolean;
  hasDateScannedColumn: boolean;
  hasScannedByColumn: boolean;
  hasStoreColumn: boolean;
  hasBarcodeColumn: boolean;
  emptyStateMsgVisible: boolean;
  emptyStateMsgText: string;
  paginatorVisible: boolean;
  paginatorText: string;
  rowCount: number;
}

export interface AR_TC02Result {
  historyBtnVisibleBefore: boolean;
  historyBtnClicked: boolean;
  gridReloadedAfterHistory: boolean;
  backBtnVisible: boolean;
  historyModeText: string;
  backBtnClicked: boolean;
  gridRestoredAfterBack: boolean;
  historyBtnVisibleAfterBack: boolean;
}

export interface AR_TC03Result {
  deleteBtnAbsent: boolean;
  rowCount: number;
  featureDeferredNote: string;
}

export interface AR_TC04Result {
  rowSelected: boolean;
  printBtnVisible: boolean;
  printBtnClicked: boolean;
  printResponseVisible: boolean;
  printResponseText: string;
  offlineSet: boolean;
  printClickedOffline: boolean;
  offlineErrorVisible: boolean;
  offlineErrorText: string;
  networkRestored: boolean;
  reprintResponseVisible: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export class ArchiveRecordsPage {
  readonly page: Page;

  // Component root — confirmed from live inspection
  readonly component: Locator;

  // Grid
  readonly table: Locator;
  readonly tableRows: Locator;

  // Action buttons — confirmed from live inspection: History and Print
  readonly historyBtn: Locator;
  readonly printBtn: Locator;
  readonly backBtn: Locator;
  readonly deleteBtn: Locator;

  // Paginator
  readonly paginator: Locator;
  readonly paginatorLabel: Locator;

  // Messages
  readonly emptyStateMsg: Locator;
  readonly alertMsg: Locator;
  readonly successBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Confirmed component name from DOM inspection: app-archiverecordpage
    this.component = page.locator('app-archiverecordpage');

    // Grid — scoped to visible Archive Records table
    this.table = page.locator('app-archiverecordpage mat-table').first();
    this.tableRows = page.locator('app-archiverecordpage mat-row');

    // History/Back are <input class="btn" value="..."> — not <button>
    this.historyBtn = page.locator('app-archiverecordpage input.btn[value="History"], app-archiverecordpage input[value="History"]').first();
    this.printBtn   = page.locator('app-archiverecordpage button.btn:has-text("Print"), app-archiverecordpage button:has-text("Print")').first();
    this.backBtn    = page.locator('app-archiverecordpage input.btn[value="Back"], app-archiverecordpage input[value="Back"]').first();
    this.deleteBtn  = page.locator('app-archiverecordpage input[value="Delete"], app-archiverecordpage button:has-text("Delete")').first();

    // Paginator
    this.paginator      = page.locator('app-archiverecordpage mat-paginator').first();
    this.paginatorLabel = page.locator('app-archiverecordpage .mat-paginator-range-label').first();

    // Empty state message — confirmed text: "No unfinalized records found"
    // Lives inside a plain div alongside the action buttons (not .alert class)
    this.emptyStateMsg = page.locator('app-archiverecordpage').getByText(/no.*unfinalized|no.*records found/i).first();
    this.alertMsg      = page.locator('app-archiverecordpage').getByText(/no.*unfinalized|no.*records|error|success|warning/i).first();
    this.successBanner = page.locator('app-archiverecordpage .alert-success, .alert-success').first();
  }

  // ── Screenshot helper ───────────────────────────────────────────────────────

  async takeScreenshot(screenshotDir: string, name: string): Promise<void> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    // Always hide sidebar before capturing so it doesn't obscure the content
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.setAttribute('style', 'display: none !important;');
    });
    await this.page.waitForTimeout(100);
    const filePath = path.join(screenshotDir, `${name}.png`);
    await this.page.screenshot({ path: filePath, fullPage: true });
    await test.info().attach(name, { path: filePath, contentType: 'image/png' });
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.removeAttribute('style');
    }).catch(() => {});
  }

  // ── Sidebar helpers ─────────────────────────────────────────────────────────

  async openSidebar(): Promise<void> {
    const sideMenu = this.page.locator('#sideMenu');
    if (!await sideMenu.isVisible()) {
      await this.page.locator('.sidebar-launcher').click({ force: true });
      await this.page.waitForTimeout(600);
      if (!await sideMenu.isVisible()) {
        await this.page.evaluate(function () {
          var el = document.getElementById('sideMenu');
          if (el) el.style.display = 'block';
        });
        await this.page.waitForTimeout(300);
      }
    }
  }

  async closeSidebar(): Promise<void> {
    // Just force-hide; no polling — DOM-based checks make visual state irrelevant
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.setAttribute('style', 'display: none !important;');
    });
    await this.page.waitForTimeout(100);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async navigateToArchiveRecords(): Promise<void> {
    // Close existing Archive Records tab to force fresh component load
    const closeTabBtn = this.page.locator('li').filter({ hasText: /ArchiveRecord/i })
      .locator('sup, [title="Close Tab"]').first();
    if (await closeTabBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeTabBtn.click({ force: true });
      await this.page.waitForTimeout(800);
    }

    await this.openSidebar();

    // Click via the known sidebar ID: #archiveRecordsLink
    await this.page.evaluate(function () {
      var li = document.getElementById('archiveRecordsLink');
      if (li) {
        var a = li.querySelector('a') as HTMLElement | null;
        if (a) a.click();
        else (li as HTMLElement).click();
      }
    });
    await this.page.waitForTimeout(800);
    await this.closeSidebar();

    // Wait for Archive Records component to become visible (tab opened)
    await this.component.waitFor({ state: 'visible', timeout: 20000 });
    // Allow Angular to finish rendering buttons after the component appears
    await this.page.waitForTimeout(1500);
  }

  // ── Grid helpers ────────────────────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getPaginatorText(): Promise<string> {
    const visible = await this.paginatorLabel.isVisible({ timeout: 1000 }).catch(() => false);
    if (!visible) return '';
    return (await this.paginatorLabel.textContent() ?? '').trim();
  }

  async getColumnHeaders(): Promise<string[]> {
    return this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return [];
      return Array.from(comp.querySelectorAll('mat-header-cell'))
        .map(h => (h.textContent || '').trim().toLowerCase());
    });
  }

  async getEmptyStateMsgText(): Promise<string> {
    // Use DOM evaluation to find the message regardless of sidebar overlay
    return this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return '';
      const walker = document.createTreeWalker(comp, NodeFilter.SHOW_TEXT);
      const texts: string[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const t = (node.textContent || '').trim();
        if (t.length > 5 && t.toLowerCase().includes('no') && t.toLowerCase().includes('record')) {
          texts.push(t);
        }
      }
      return texts[0] || '';
    });
  }

  async clickFirstRow(): Promise<void> {
    try {
      const firstRow = this.tableRows.first();
      if (await firstRow.count() > 0) {
        await firstRow.click({ force: true, timeout: 2000 });
        await this.page.waitForTimeout(300);
      }
    } catch { /* no rows */ }
  }

  // ── Button helpers ──────────────────────────────────────────────────────────

  // DOM-based button checks — sidebar overlay doesn't block DOM presence
  private async btnExistsInComponent(text: string): Promise<boolean> {
    return this.page.evaluate((btnText: string) => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      // Include input[type=button/submit] — Angular may render buttons as <input> with value
      const buttons = Array.from(comp.querySelectorAll(
        'button, input[type="button"], input[type="submit"], .btn, a.btn, [role="button"]'
      ));
      const lower = btnText.toLowerCase();
      return buttons.some(b => {
        const byText  = (b.textContent || '').trim().toLowerCase();
        const byValue = ((b as HTMLInputElement).value || '').trim().toLowerCase();
        return byText.includes(lower) || byValue.includes(lower);
      });
    }, text);
  }

  async isHistoryBtnVisible(): Promise<boolean> {
    return this.btnExistsInComponent('History');
  }

  async isPrintBtnVisible(): Promise<boolean> {
    return this.btnExistsInComponent('Print');
  }

  async isBackBtnVisible(): Promise<boolean> {
    return this.btnExistsInComponent('Back');
  }

  async isDeleteBtnVisible(): Promise<boolean> {
    return this.btnExistsInComponent('Delete');
  }

  async clickHistoryBtn(): Promise<void> {
    // Click via DOM evaluate to bypass any sidebar/overlay blocking Playwright's click
    await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"]')) as HTMLInputElement[];
      const btn = inputs.find(i => (i.value || '').trim().toLowerCase() === 'history');
      if (btn) btn.click();
    });
    // Wait until the button switches to "Back" — confirms the action took effect
    await this.page.waitForFunction(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"]')) as HTMLInputElement[];
      return inputs.some(i => (i.value || '').trim().toLowerCase() === 'back');
    }, { timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async clickBackBtn(): Promise<void> {
    // Click via DOM evaluate to bypass any sidebar/overlay blocking Playwright's click
    await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"]')) as HTMLInputElement[];
      const btn = inputs.find(i => (i.value || '').trim().toLowerCase() === 'back');
      if (btn) btn.click();
    });
    // Wait until the button switches back to "History"
    await this.page.waitForFunction(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"]')) as HTMLInputElement[];
      return inputs.some(i => (i.value || '').trim().toLowerCase() === 'history');
    }, { timeout: 8000 }).catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async clickPrintBtn(): Promise<void> {
    await this.printBtn.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async getAlertText(): Promise<string> {
    // Check multiple possible alert/message containers
    const candidates = [
      this.alertMsg,
      this.page.locator('app-archiverecordpage').getByText(/no.*unfinalized|no.*records|error|select|must/i).first(),
      this.page.locator('.alert-danger, .alert-warning, .alert-info, .alert-success').first(),
    ];
    for (const loc of candidates) {
      const vis = await loc.isVisible({ timeout: 500 }).catch(() => false);
      if (vis) return (await loc.textContent() ?? '').trim();
    }
    return '';
  }

  // ── TC Methods ──────────────────────────────────────────────────────────────

  // AR_WTC01 — Load archive page controls and grid
  async tc01_loadArchivePage(screenshotDir: string): Promise<AR_TC01Result> {
    await this.navigateToArchiveRecords();
    // Ensure sidebar is closed (Angular may reopen it during routing)
    await this.closeSidebar();
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotDir, 'AR_WTC01_01_page_loaded');

    const pageLoaded        = await this.component.isVisible().catch(() => false);
    const historyBtnVisible = await this.isHistoryBtnVisible();
    const printBtnVisible   = await this.isPrintBtnVisible();
    const deleteBtnVisible  = await this.isDeleteBtnVisible();
    const gridVisible       = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      return !!comp && comp.querySelectorAll('mat-table').length > 0;
    });
    const filterVisible     = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      return comp.querySelectorAll('input[placeholder="Filter"], input[type="text"]').length > 0;
    });

    const headers = await this.getColumnHeaders();
    await this.takeScreenshot(screenshotDir, 'AR_WTC01_02_columns');

    const hasStoreColumn       = headers.some(h => h.includes('store'));
    const hasBarcodeColumn     = headers.some(h => h.includes('barcode') || h.includes('bar'));
    const hasRecordTypeColumn  = headers.some(h => h.includes('record') || h.includes('type'));
    const hasFromDateColumn    = headers.some(h => h.includes('from'));
    const hasToDateColumn      = headers.some(h => h.includes('to date') || h === 'to date' || h.includes('todate'));
    const hasDateScannedColumn = headers.some(h => h.includes('scanned') || h.includes('scan'));
    const hasScannedByColumn   = headers.some(h => h.includes('by') || h.includes('scanned by'));

    // Close sidebar once more before checking visibility-dependent elements
    await this.closeSidebar();
    const emptyStateMsgText    = await this.getEmptyStateMsgText();
    const emptyStateMsgVisible = emptyStateMsgText.length > 0;
    const paginatorVisible     = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      return !!comp && comp.querySelectorAll('mat-paginator').length > 0;
    });
    const paginatorText        = await this.getPaginatorText();
    const rowCount             = await this.getRowCount();

    await this.takeScreenshot(screenshotDir, 'AR_WTC01_03_paginator_and_empty_state');

    return {
      pageLoaded, historyBtnVisible, printBtnVisible, deleteBtnVisible,
      gridVisible, filterVisible, hasStoreColumn, hasBarcodeColumn, hasRecordTypeColumn,
      hasFromDateColumn, hasToDateColumn, hasDateScannedColumn, hasScannedByColumn,
      emptyStateMsgVisible, emptyStateMsgText, paginatorVisible, paginatorText, rowCount,
    };
  }

  // AR_WTC02 — Toggle history / back view
  async tc02_toggleHistoryView(screenshotDir: string): Promise<AR_TC02Result> {
    await this.navigateToArchiveRecords();
    await this.closeSidebar();
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotDir, 'AR_WTC02_01_initial_view');

    const historyBtnVisibleBefore = await this.isHistoryBtnVisible();
    let historyBtnClicked = false;
    if (historyBtnVisibleBefore) {
      await this.clickHistoryBtn();
      historyBtnClicked = true;
    }
    // Sidebar reopens after Angular route change — force close before inspecting buttons
    await this.closeSidebar();
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotDir, 'AR_WTC02_02_after_history_click');

    const gridReloadedAfterHistory = await this.component.isVisible().catch(() => false);
    const backBtnVisible           = await this.isBackBtnVisible();
    const historyModeText          = await this.getEmptyStateMsgText();

    let backBtnClicked = false;
    if (backBtnVisible) {
      await this.clickBackBtn();
      backBtnClicked = true;
    }
    // Sidebar may reopen again — force close before inspecting
    await this.closeSidebar();
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotDir, 'AR_WTC02_03_after_back_click');

    const gridRestoredAfterBack     = await this.component.isVisible().catch(() => false);
    const historyBtnVisibleAfterBack = await this.isHistoryBtnVisible();

    return {
      historyBtnVisibleBefore, historyBtnClicked, gridReloadedAfterHistory,
      backBtnVisible, historyModeText, backBtnClicked,
      gridRestoredAfterBack, historyBtnVisibleAfterBack,
    };
  }

  // AR_WTC03 — Delete (deferred per CSV notes)
  async tc03_deleteStatus(screenshotDir: string): Promise<AR_TC03Result> {
    await this.navigateToArchiveRecords();
    await this.closeSidebar();
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotDir, 'AR_WTC03_01_page_for_delete_check');

    const deleteBtnAbsent = !(await this.isDeleteBtnVisible());
    const rowCount        = await this.getRowCount();

    await this.takeScreenshot(screenshotDir, 'AR_WTC03_02_delete_button_state');

    return {
      deleteBtnAbsent,
      rowCount,
      featureDeferredNote: 'Delete functionality noted as deferred in test specification CSV',
    };
  }

  // AR_WTC04 — Print and offline error handling
  async tc04_printAndOffline(screenshotDir: string, context: BrowserContext): Promise<AR_TC04Result> {
    await this.navigateToArchiveRecords();
    await this.closeSidebar();
    await this.page.waitForTimeout(300);
    await this.takeScreenshot(screenshotDir, 'AR_WTC04_01_initial_state');

    // Step 1: click Print (even on empty grid — captures any alert/message)
    await this.clickFirstRow();
    const rowSelected      = await this.getRowCount().then(c => c > 0).catch(() => false);
    const printBtnVisible  = await this.isPrintBtnVisible();

    let printBtnClicked = false;
    if (printBtnVisible) {
      await this.clickPrintBtn();
      printBtnClicked = true;
    }
    await this.takeScreenshot(screenshotDir, 'AR_WTC04_02_after_print_click');

    const printResponseText    = await this.getAlertText();
    const printResponseVisible = printResponseText.length > 0 ||
      await this.page.locator('embed[type="application/pdf"], iframe').count() > 0;

    // Step 2: set offline and try print
    await context.setOffline(true);
    const offlineSet = true;
    await this.page.waitForTimeout(500);

    let printClickedOffline = false;
    if (await this.isPrintBtnVisible()) {
      await this.clickPrintBtn();
      printClickedOffline = true;
    }
    await this.takeScreenshot(screenshotDir, 'AR_WTC04_03_print_offline');

    const offlineErrorText    = await this.getAlertText();
    const offlineErrorVisible = offlineErrorText.length > 0;

    // Step 3: restore network
    await context.setOffline(false);
    const networkRestored = true;
    await this.page.waitForTimeout(1000);
    await this.takeScreenshot(screenshotDir, 'AR_WTC04_04_online_restored');

    let reprintResponseVisible = false;
    if (await this.isPrintBtnVisible()) {
      await this.clickPrintBtn();
      const reprintText = await this.getAlertText();
      reprintResponseVisible = reprintText.length > 0 ||
        await this.page.locator('embed[type="application/pdf"]').count() > 0;
    }
    await this.takeScreenshot(screenshotDir, 'AR_WTC04_05_after_reprint');

    return {
      rowSelected, printBtnVisible, printBtnClicked,
      printResponseVisible, printResponseText,
      offlineSet, printClickedOffline,
      offlineErrorVisible, offlineErrorText,
      networkRestored, reprintResponseVisible,
    };
  }

  // ── Screenshot helper for new TCs (style-tag injection, sidebar-safe) ───────

  protected async captureScreenshot(screenshotDir: string, name: string): Promise<void> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    await this.page.evaluate(function () {
      if (!document.getElementById('__hide_sidebar_style__')) {
        var style = document.createElement('style');
        style.id = '__hide_sidebar_style__';
        style.textContent = '#sideMenu { display: none !important; }';
        document.head.appendChild(style);
      }
    });
    await this.page.waitForTimeout(300);
    const fp = path.join(screenshotDir, `${name}.png`);
    await this.page.screenshot({ path: fp, fullPage: true });
    await test.info().attach(name, { path: fp, contentType: 'image/png' });
    await this.page.evaluate(function () {
      var s = document.getElementById('__hide_sidebar_style__');
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }).catch(() => {});
  }

  // ── Helper: get paginator range text ("1 - 10 of 206") ──────────────────────

  protected async getPaginatorRangeText(): Promise<string> {
    return this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return '';
      const label = comp.querySelector('.mat-paginator-range-label');
      return label ? (label.textContent || '').trim() : '';
    });
  }

  // ── Helper: type into the filter input via keyboard events ───────────────────

  protected async typeInFilter(text: string): Promise<void> {
    await this.page.evaluate((val: string) => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return;
      const input = comp.querySelector('input[placeholder="Filter"]') as HTMLInputElement | null;
      if (!input) return;
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    }, text);
    await this.page.waitForTimeout(600);
  }

  // ── Helper: get first data row's text for a column index ─────────────────────

  protected async getFirstRowCellText(colIndex: number): Promise<string> {
    return this.page.evaluate((idx: number) => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return '';
      const rows = comp.querySelectorAll('mat-row');
      if (!rows.length) return '';
      const cells = rows[0].querySelectorAll('mat-cell');
      return cells[idx] ? (cells[idx].textContent || '').trim() : '';
    }, colIndex);
  }
}

// ── New return-type interfaces (AR_WTC05 – AR_WTC09) ─────────────────────────

export interface AR_TC05Result {
  historyLoaded: boolean;
  totalBeforeFilter: string;
  filterInputVisible: boolean;
  filterReducedRecords: boolean;
  filteredPaginatorText: string;
  noMatchShowsEmptyGrid: boolean;
  clearRestoresRecords: boolean;
}

export interface AR_TC06Result {
  historyLoaded: boolean;
  barcodeAscFirstValue: string;
  barcodeDescFirstValue: string;
  sortToggleChanged: boolean;
}

export interface AR_TC07Result {
  historyLoaded: boolean;
  defaultPageSizeText: string;
  pageSizeOptions: string[];
  nextPageWorked: boolean;
  paginatorTextAfterNext: string;
  prevPageWorked: boolean;
  paginatorTextAfterPrev: string;
}

export interface AR_TC08Result {
  historyLoaded: boolean;
  successBannerVisible: boolean;
  successBannerText: string;
  bannerMentionsCount: boolean;
  bannerMentionsFinalized: boolean;
}

export interface AR_TC09Result {
  historyLoaded: boolean;
  rowCount: number;
  rowSelected: boolean;
  printBtnVisible: boolean;
  printClicked: boolean;
  pageStillLoaded: boolean;
  printResponseText: string;
}

// ── New TC methods added to the class via declaration merging ─────────────────
// These are implemented as standalone functions and mixed in below.

declare module './ArchiveRecordsPage' {
  interface ArchiveRecordsPage {
    tc05_filterInHistoryView(screenshotDir: string): Promise<AR_TC05Result>;
    tc06_columnSorting(screenshotDir: string): Promise<AR_TC06Result>;
    tc07_paginationAndPageSize(screenshotDir: string): Promise<AR_TC07Result>;
    tc08_historyBannerContent(screenshotDir: string): Promise<AR_TC08Result>;
    tc09_printWithSelection(screenshotDir: string): Promise<AR_TC09Result>;
  }
}

ArchiveRecordsPage.prototype.tc05_filterInHistoryView = async function (
  this: ArchiveRecordsPage,
  screenshotDir: string
): Promise<AR_TC05Result> {
  await this.navigateToArchiveRecords();
  await this.closeSidebar();
  await this.clickHistoryBtn();
  await this.closeSidebar();
  await this.page.waitForTimeout(500);
  await this.captureScreenshot(screenshotDir, 'AR_WTC05_01_history_loaded');

  const historyLoaded      = await this.component.isVisible().catch(() => false);
  const totalBeforeFilter  = await this.getPaginatorRangeText();
  const filterInputVisible = await this.page.evaluate(() => {
    const comp = document.querySelector('app-archiverecordpage');
    return !!comp && !!comp.querySelector('input[placeholder="Filter"]');
  });

  // Apply a filter that should match some records
  await this.typeInFilter('Sales');
  await this.captureScreenshot(screenshotDir, 'AR_WTC05_02_filter_applied');
  const filteredPaginatorText = await this.getPaginatorRangeText();
  const filteredRowCount      = await this.getRowCount();
  const filterReducedRecords  = filteredRowCount < parseInt(totalBeforeFilter.split('of').pop()?.trim() || '9999', 10) || filteredPaginatorText !== totalBeforeFilter;

  // Apply a no-match filter
  await this.typeInFilter('XYZNORECORD999');
  await this.captureScreenshot(screenshotDir, 'AR_WTC05_03_no_match_filter');
  const noMatchRowCount       = await this.getRowCount();
  const noMatchShowsEmptyGrid = noMatchRowCount === 0;

  // Clear filter and verify records return
  await this.typeInFilter('');
  await this.page.waitForTimeout(600);
  await this.captureScreenshot(screenshotDir, 'AR_WTC05_04_filter_cleared');
  const clearedText       = await this.getPaginatorRangeText();
  const clearRestoresRecords = clearedText === totalBeforeFilter || parseInt(clearedText.split('of').pop()?.trim() || '0', 10) > 0;

  await this.clickBackBtn();
  return { historyLoaded, totalBeforeFilter, filterInputVisible, filterReducedRecords, filteredPaginatorText, noMatchShowsEmptyGrid, clearRestoresRecords };
};

ArchiveRecordsPage.prototype.tc06_columnSorting = async function (
  this: ArchiveRecordsPage,
  screenshotDir: string
): Promise<AR_TC06Result> {
  await this.navigateToArchiveRecords();
  await this.closeSidebar();
  await this.clickHistoryBtn();
  await this.closeSidebar();
  await this.page.waitForTimeout(500);
  await this.captureScreenshot(screenshotDir, 'AR_WTC06_01_history_loaded');

  const historyLoaded = await this.component.isVisible().catch(() => false);

  // First click on Barcode header → ascending sort
  await this.page.evaluate(() => {
    const comp = document.querySelector('app-archiverecordpage');
    if (!comp) return;
    const headers = Array.from(comp.querySelectorAll('mat-header-cell'));
    const barcodeHeader = headers.find(h => (h.textContent || '').toLowerCase().includes('barcode'));
    if (barcodeHeader) (barcodeHeader as HTMLElement).click();
  });
  await this.page.waitForTimeout(600);
  await this.captureScreenshot(screenshotDir, 'AR_WTC06_02_sort_asc');
  const barcodeAscFirstValue = await this.getFirstRowCellText(1);

  // Second click on Barcode header → descending sort
  await this.page.evaluate(() => {
    const comp = document.querySelector('app-archiverecordpage');
    if (!comp) return;
    const headers = Array.from(comp.querySelectorAll('mat-header-cell'));
    const barcodeHeader = headers.find(h => (h.textContent || '').toLowerCase().includes('barcode'));
    if (barcodeHeader) (barcodeHeader as HTMLElement).click();
  });
  await this.page.waitForTimeout(600);
  await this.captureScreenshot(screenshotDir, 'AR_WTC06_03_sort_desc');
  const barcodeDescFirstValue = await this.getFirstRowCellText(1);

  const sortToggleChanged = barcodeAscFirstValue !== barcodeDescFirstValue;

  await this.clickBackBtn();
  return { historyLoaded, barcodeAscFirstValue, barcodeDescFirstValue, sortToggleChanged };
};

ArchiveRecordsPage.prototype.tc07_paginationAndPageSize = async function (
  this: ArchiveRecordsPage,
  screenshotDir: string
): Promise<AR_TC07Result> {
  await this.navigateToArchiveRecords();
  await this.closeSidebar();
  await this.clickHistoryBtn();
  await this.closeSidebar();
  await this.page.waitForTimeout(500);
  await this.captureScreenshot(screenshotDir, 'AR_WTC07_01_history_loaded');

  const historyLoaded      = await this.component.isVisible().catch(() => false);
  const defaultPageSizeText = await this.getPaginatorRangeText();

  // Get available page size options (native <select> if present; mat-select shows as trigger text)
  const pageSizeOptions = await this.page.evaluate((): string[] => {
    const comp = document.querySelector('app-archiverecordpage');
    if (!comp) return [];
    // Try native select first
    const sel = comp.querySelector('select') as HTMLSelectElement | null;
    if (sel && sel.options && sel.options.length) {
      return Array.from(sel.options).map((o: HTMLOptionElement) => o.value || o.text);
    }
    // Fallback: read the mat-paginator trigger value
    const trigger = comp.querySelector('.mat-select-value-text, .mat-paginator-page-size-value');
    return trigger ? [(trigger.textContent || '').trim()] : [];
  });

  // Click Next page
  const nextBtn = this.page.locator('app-archiverecordpage .mat-paginator-navigation-next').first();
  let nextPageWorked = false;
  if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nextBtn.click({ force: true });
    await this.page.waitForTimeout(800);
    nextPageWorked = true;
  }
  await this.captureScreenshot(screenshotDir, 'AR_WTC07_02_next_page');
  const paginatorTextAfterNext = await this.getPaginatorRangeText();

  // Click Previous page
  const prevBtn = this.page.locator('app-archiverecordpage .mat-paginator-navigation-previous').first();
  let prevPageWorked = false;
  if (await prevBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await prevBtn.click({ force: true });
    await this.page.waitForTimeout(800);
    prevPageWorked = true;
  }
  await this.captureScreenshot(screenshotDir, 'AR_WTC07_03_prev_page');
  const paginatorTextAfterPrev = await this.getPaginatorRangeText();

  await this.clickBackBtn();
  return { historyLoaded, defaultPageSizeText, pageSizeOptions, nextPageWorked, paginatorTextAfterNext, prevPageWorked, paginatorTextAfterPrev };
};

ArchiveRecordsPage.prototype.tc08_historyBannerContent = async function (
  this: ArchiveRecordsPage,
  screenshotDir: string
): Promise<AR_TC08Result> {
  await this.navigateToArchiveRecords();
  await this.closeSidebar();
  await this.captureScreenshot(screenshotDir, 'AR_WTC08_01_default_view');

  await this.clickHistoryBtn();
  await this.closeSidebar();
  await this.page.waitForTimeout(500);
  await this.captureScreenshot(screenshotDir, 'AR_WTC08_02_history_banner');

  const historyLoaded = await this.component.isVisible().catch(() => false);

  // Find the success/green banner inside the component
  const bannerInfo = await this.page.evaluate(() => {
    const comp = document.querySelector('app-archiverecordpage');
    if (!comp) return { visible: false, text: '' };
    // Look for green/success banners or elements containing "finalized"
    const candidates = Array.from(comp.querySelectorAll(
      '.alert-success, .alert.alert-success, [class*="success"], .bg-success'
    ));
    for (const el of candidates) {
      const txt = (el.textContent || '').trim();
      if (txt.length > 0) return { visible: true, text: txt };
    }
    // Fallback: find any element whose text contains "finalized"
    const walker = document.createTreeWalker(comp, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const t = (node.textContent || '').trim();
      if (t.toLowerCase().includes('finalized') && t.length > 5) {
        return { visible: true, text: t };
      }
    }
    return { visible: false, text: '' };
  });

  const successBannerVisible      = bannerInfo.visible;
  const successBannerText         = bannerInfo.text;
  const bannerMentionsCount       = /\d+/.test(successBannerText);
  const bannerMentionsFinalized   = successBannerText.toLowerCase().includes('finalized');

  await this.clickBackBtn();
  return { historyLoaded, successBannerVisible, successBannerText, bannerMentionsCount, bannerMentionsFinalized };
};

ArchiveRecordsPage.prototype.tc09_printWithSelection = async function (
  this: ArchiveRecordsPage,
  screenshotDir: string
): Promise<AR_TC09Result> {
  await this.navigateToArchiveRecords();
  await this.closeSidebar();
  await this.clickHistoryBtn();
  await this.closeSidebar();
  await this.page.waitForTimeout(500);
  await this.captureScreenshot(screenshotDir, 'AR_WTC09_01_history_with_rows');

  const historyLoaded = await this.component.isVisible().catch(() => false);
  const rowCount      = await this.getRowCount();

  // Select the first row
  let rowSelected = false;
  if (rowCount > 0) {
    await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return;
      const firstRow = comp.querySelector('mat-row') as HTMLElement | null;
      if (firstRow) firstRow.click();
    });
    await this.page.waitForTimeout(400);
    rowSelected = true;
  }
  await this.captureScreenshot(screenshotDir, 'AR_WTC09_02_row_selected');

  // Click Print
  const printBtnVisible = await this.isPrintBtnVisible();
  let printClicked = false;
  if (printBtnVisible) {
    await this.clickPrintBtn();
    printClicked = true;
  }
  await this.captureScreenshot(screenshotDir, 'AR_WTC09_03_after_print');

  const pageStillLoaded  = await this.component.isVisible().catch(() => false);
  const printResponseText = await this.getAlertText();

  return { historyLoaded, rowCount, rowSelected, printBtnVisible, printClicked, pageStillLoaded, printResponseText };
};
