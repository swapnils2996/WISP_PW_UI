import { Page, Locator, BrowserContext, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './LoginPage';
import { AlertsTestData } from '../utils/excelHelper';

// ── Return-type interfaces ────────────────────────────────────────────────────

export interface AL_TC01Result {
  tableVisible: boolean;
  typeHeaderText: string;
  descHeaderText: string;
  statusHeaderText: string;
  paginatorVisible: boolean;
  pageSizeSelectVisible: boolean;
  paginatorRangeLabelVisible: boolean;
  prevBtnVisible: boolean;
  nextBtnVisible: boolean;
  rowCount: number;
}

export interface AL_TC02Result {
  filteredCount: number;
  noMatchCount: number;
  restoredCount: number;
}

export interface AL_TC03Result {
  appAlertVisibleOffline: boolean;
  tableRestoredOnline: boolean;
}

export interface AL_TC04Result {
  tableStableAfterBoundary: boolean;
}

export interface AL_TC05Result {
  noAlertsBtnFound: boolean;
  noAlertsBtnClass: string;
  noAlertsBtnText: string;
  alertsBtnFound: boolean;
  alertsBtnText: string;
  rowCountAfterClick: number;
}

export interface AL_TC06Result {
  typeSortAscAriaSort: string;
  typeSortDescAriaSort: string;
  tableSortStable: boolean;
}

export interface AL_TC07Result {
  defaultPageSize: string;
  optionCount: number;
  pageSizeChangedTo5: boolean;
  pageSizeChangedTo10: boolean;
  tableStableAfterPageSizeChange: boolean;
}

export interface AL_TC08Result {
  initialPaginatorLabel: string;
  filteredPaginatorLabel: string;
  noMatchPaginatorLabel: string;
  noMatchRowCount: number;
  clearedPaginatorLabel: string;
  filteredRowCount: number;
}

export interface AL_TC09Result {
  tabCloseButtonFound: boolean;
  appAlertClosedSuccessfully: boolean;
  appAlertReopenedSuccessfully: boolean;
}

export interface AL_TC10Result {
  multipleTabsVisible: boolean;
  alertsTabStillAccessible: boolean;
  rowCountAfterTabSwitch: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export class ApplicationAlertsPage {
  readonly page: Page;
  readonly hamburger: Locator;
  readonly sideMenu: Locator;
  readonly alertsBtn: Locator;
  readonly noAlertsBtn: Locator;
  readonly filterInput: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly typeHeader: Locator;
  readonly descHeader: Locator;
  readonly statusHeader: Locator;
  readonly paginator: Locator;
  readonly paginatorRangeLabel: Locator;
  readonly pageSizeSelect: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;
  readonly appAlert: Locator;
  readonly tabCloseBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hamburger        = page.locator('.sidebar-launcher');
    this.sideMenu         = page.locator('#sideMenu');
    this.alertsBtn        = page.locator('#sideMenu .btn-danger');
    this.noAlertsBtn      = page.locator('#sideMenu .Appalertbtn');
    this.appAlert         = page.locator('app-alert');
    this.tabCloseBtn      = page.locator('li:has(span[title="Close Tab"])').filter({ hasText: 'Application Alerts' }).locator('span[title="Close Tab"]');
    this.filterInput      = this.appAlert.locator('input[placeholder="Filter"]');
    this.table            = this.appAlert.locator('mat-table');
    this.tableRows        = this.appAlert.locator('mat-row');
    this.typeHeader       = this.appAlert.locator('mat-header-cell.mat-column-Type');
    this.descHeader       = this.appAlert.locator('mat-header-cell.mat-column-Description');
    this.statusHeader     = this.appAlert.locator('mat-header-cell.mat-column-Status');
    this.paginator        = this.appAlert.locator('mat-paginator');
    this.paginatorRangeLabel = this.appAlert.locator('.mat-paginator-range-label');
    this.pageSizeSelect   = this.appAlert.locator('.mat-paginator-page-size-select');
    this.prevPageBtn      = this.appAlert.locator('.mat-paginator-navigation-previous');
    this.nextPageBtn      = this.appAlert.locator('.mat-paginator-navigation-next');
  }

  // ── Screenshot helper ───────────────────────────────────────────────────────

  async takeScreenshot(screenshotDir: string, name: string): Promise<void> {
    fs.mkdirSync(screenshotDir, { recursive: true });
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

  // ── Navigation helpers ──────────────────────────────────────────────────────

  async isSidebarOpen(): Promise<boolean> { return this.sideMenu.isVisible(); }

  async openSidebar(): Promise<void> {
    if (await this.sideMenu.isVisible()) return;
    await this.hamburger.click({ force: true });
    try {
      await this.sideMenu.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      await this.page.evaluate(function () {
        var el = document.getElementById('sideMenu');
        if (el) el.style.display = 'block';
      });
      await this.page.waitForTimeout(300);
    }
  }

  async closeSidebar(): Promise<void> {
    if (await this.isSidebarOpen()) {
      await this.page.mouse.click(700, 300);
      await this.page.waitForTimeout(300);
    }
  }

  async navigateToAlerts(): Promise<void> {
    await this.openSidebar();
    await this.page.evaluate(function () {
      var btn = (document.querySelector('#sideMenu .btn-danger') ||
                 document.querySelector('#sideMenu .Appalertbtn')) as HTMLElement | null;
      if (btn) btn.click();
    });
    await this.appAlert.waitFor({ state: 'visible' });
    await this.table.waitFor({ state: 'visible', timeout: 20000 });
    await this.closeSidebar();
  }

  async goToHome(): Promise<void> {
    await this.page.goto('/webapp/');
    await this.page.waitForTimeout(500);
  }

  async navigateHome(): Promise<void> {
    await this.page.goto('/webapp/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.page.waitForTimeout(2000);
  }

  // ── Grid actions ────────────────────────────────────────────────────────────

  async filterAlerts(text: string): Promise<void> {
    await this.filterInput.clear();
    await this.filterInput.dispatchEvent('input');
    if (text) await this.filterInput.pressSequentially(text, { delay: 10 });
    await this.page.waitForTimeout(600);
  }

  async clearFilter(): Promise<void> {
    await this.filterInput.clear();
    await this.filterInput.dispatchEvent('input');
    await this.page.waitForTimeout(600);
  }

  async getRowCount(): Promise<number> { return this.tableRows.count(); }
  async getPaginatorText(): Promise<string> { return (await this.paginatorRangeLabel.textContent()) ?? ''; }

  async openAlertsOffline(): Promise<void> {
    await this.openSidebar();
    await this.page.evaluate(function () {
      var sideMenu = document.getElementById('sideMenu');
      if (sideMenu) sideMenu.style.display = 'block';
      var btn = (document.querySelector('#sideMenu .btn-danger') ||
                 document.querySelector('#sideMenu .Appalertbtn')) as HTMLElement | null;
      if (btn) btn.click();
    });
    await this.page.waitForTimeout(2000);
    await this.closeSidebar();
  }

  async reLoginIfNeeded(username: string, password: string): Promise<void> {
    const input = this.page.locator('input[type="text"]');
    if (await input.isVisible()) {
      await new LoginPage(this.page).login(username, password);
      await this.page.waitForTimeout(1000);
    }
  }

  async cycleSortHeaders(): Promise<void> {
    await this.typeHeader.click({ force: true }); await this.page.waitForTimeout(200);
    await this.typeHeader.click({ force: true }); await this.page.waitForTimeout(200);
    await this.descHeader.click({ force: true }); await this.page.waitForTimeout(200);
    await this.statusHeader.click({ force: true }); await this.page.waitForTimeout(200);
  }

  async isNoAlertsBtnVisible(): Promise<boolean> { return this.noAlertsBtn.isVisible(); }
  async isAlertsBtnVisible(): Promise<boolean>  { return this.alertsBtn.isVisible(); }

  async clickNoAlertsButton(): Promise<void> {
    await this.noAlertsBtn.click({ force: true });
    await this.closeSidebar();
    await this.page.waitForTimeout(500);
  }

  // ── AL_WTC01 – Load alerts grid and validate columns ─────────────────────────

  async tc01_loadAlertsGrid(screenshotDir: string, _data: AlertsTestData): Promise<AL_TC01Result> {
    await this.navigateToAlerts();
    await this.takeScreenshot(screenshotDir, 'AL_WTC01_01_alerts_grid_loaded');

    // Capture all state before any interactions
    const tableVisible              = await this.table.isVisible();
    const typeHeaderText            = (await this.typeHeader.textContent() ?? '').trim();
    const descHeaderText            = (await this.descHeader.textContent() ?? '').trim();
    const statusHeaderText          = (await this.statusHeader.textContent() ?? '').trim();
    const paginatorVisible          = await this.paginator.isVisible();
    const pageSizeSelectVisible     = await this.pageSizeSelect.isVisible();
    const paginatorRangeLabelVisible = await this.paginatorRangeLabel.isVisible();
    const prevBtnVisible            = await this.prevPageBtn.isVisible();
    const nextBtnVisible            = await this.nextPageBtn.isVisible();
    await this.takeScreenshot(screenshotDir, 'AL_WTC01_02_columns_visible');

    const rowCount = await this.getRowCount();
    if (rowCount > 0) await this.takeScreenshot(screenshotDir, 'AL_WTC01_03_first_row_visible');
    await this.takeScreenshot(screenshotDir, 'AL_WTC01_04_paginator_visible');

    return { tableVisible, typeHeaderText, descHeaderText, statusHeaderText, paginatorVisible, pageSizeSelectVisible, paginatorRangeLabelVisible, prevBtnVisible, nextBtnVisible, rowCount };
  }

  // ── AL_WTC02 – Filter alerts and verify empty result behavior ────────────────

  async tc02_filterAlerts(screenshotDir: string, data: AlertsTestData): Promise<AL_TC02Result> {
    // Navigate home first to destroy the existing component, then reload alerts fresh
    await this.goToHome();
    await this.navigateToAlerts();
    // Wait for rows to be present after fresh load
    await this.page.waitForFunction(
      () => document.querySelectorAll('app-alert mat-row').length > 0,
      { timeout: 20000 }
    ).catch(() => {});

    await this.filterAlerts(data.filterValue);
    const filteredCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'AL_WTC02_01_filter_applied');

    await this.filterAlerts(data.filterNoMatch);
    const noMatchCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'AL_WTC02_02_no_match_filter');

    await this.clearFilter();
    const restoredCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'AL_WTC02_03_filter_cleared');

    return { filteredCount, noMatchCount, restoredCount };
  }

  // ── AL_WTC03 – Offline behavior on alerts load ──────────────────────────────

  async tc03_offlineBehavior(screenshotDir: string, context: BrowserContext, username: string, password: string): Promise<AL_TC03Result> {
    await context.setOffline(true);
    await this.openAlertsOffline();
    const appAlertVisibleOffline = await this.appAlert.isVisible().catch(() => false);
    await this.takeScreenshot(screenshotDir, 'AL_WTC03_01_offline_alerts');

    await context.setOffline(false);
    await this.navigateHome();
    await this.reLoginIfNeeded(username, password);
    await this.navigateToAlerts();
    const tableRestoredOnline = await this.table.isVisible({ timeout: 15000 }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'AL_WTC03_02_online_recovery');

    return { appAlertVisibleOffline, tableRestoredOnline };
  }

  // ── AL_WTC04 – Boundary and stress behavior ──────────────────────────────────

  async tc04_boundaryStress(screenshotDir: string, data: AlertsTestData): Promise<AL_TC04Result> {
    await this.navigateToAlerts();

    await this.filterAlerts(data.filterValue);
    await this.takeScreenshot(screenshotDir, 'AL_WTC04_01_short_filter');

    await this.filterAlerts(data.longBoundary);
    await this.takeScreenshot(screenshotDir, 'AL_WTC04_02_long_boundary');

    await this.clearFilter();
    await this.filterAlerts(data.emptyBoundary);
    await this.takeScreenshot(screenshotDir, 'AL_WTC04_03_empty_boundary');

    await this.clearFilter();
    await this.cycleSortHeaders();
    await this.takeScreenshot(screenshotDir, 'AL_WTC04_04_sort_cycle');

    await this.filterAlerts(data.filterValue);
    await this.clearFilter();
    await this.takeScreenshot(screenshotDir, 'AL_WTC04_05_final_state');

    const tableStableAfterBoundary = await this.table.isVisible().catch(() => false);
    return { tableStableAfterBoundary };
  }

  // ── AL_WTC05 – No Application Alerts ────────────────────────────────────────

  async tc05_noApplicationAlerts(screenshotDir: string): Promise<AL_TC05Result> {
    await this.page.goto('/webapp/');
    await this.page.waitForTimeout(500);
    await this.openSidebar();
    await this.takeScreenshot(screenshotDir, 'AL_WTC05_01_sidebar_open');

    const noAlertsBtnFound  = await this.isNoAlertsBtnVisible();
    const alertsBtnFound    = await this.isAlertsBtnVisible();

    let noAlertsBtnClass = '';
    let noAlertsBtnText  = '';
    let alertsBtnText    = '';
    let rowCountAfterClick = 0;

    if (noAlertsBtnFound) {
      noAlertsBtnClass   = (await this.noAlertsBtn.getAttribute('class') ?? '');
      noAlertsBtnText    = (await this.noAlertsBtn.textContent() ?? '').trim();
      await this.takeScreenshot(screenshotDir, 'AL_WTC05_02_no_alerts_btn');
      await this.clickNoAlertsButton();
      await this.appAlert.waitFor({ state: 'visible', timeout: 10000 });
      rowCountAfterClick = await this.getRowCount();
      await this.takeScreenshot(screenshotDir, 'AL_WTC05_03_after_no_alerts_click');
    } else {
      alertsBtnText = (await this.alertsBtn.textContent() ?? '').trim();
      await this.takeScreenshot(screenshotDir, 'AL_WTC05_02_alerts_btn_visible');
      await this.closeSidebar();
    }

    return { noAlertsBtnFound, noAlertsBtnClass, noAlertsBtnText, alertsBtnFound, alertsBtnText, rowCountAfterClick };
  }

  // ── AL_WTC06 – Sort column header interaction and verify sort state ───────────

  async tc06_sortColumnBehavior(screenshotDir: string): Promise<AL_TC06Result> {
    await this.navigateToAlerts();
    await this.takeScreenshot(screenshotDir, 'AL_WTC06_01_before_sort');

    await this.typeHeader.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'AL_WTC06_02_type_sort_asc');
    const typeSortAscAriaSort = (await this.typeHeader.getAttribute('aria-sort') ?? '').trim();

    await this.typeHeader.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'AL_WTC06_03_type_sort_desc');
    const typeSortDescAriaSort = (await this.typeHeader.getAttribute('aria-sort') ?? '').trim();

    await this.descHeader.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'AL_WTC06_04_desc_sort');

    await this.statusHeader.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'AL_WTC06_05_status_sort');

    const tableSortStable = await this.table.isVisible().catch(() => false);
    return { typeSortAscAriaSort, typeSortDescAriaSort, tableSortStable };
  }

  // ── AL_WTC07 – Page size dropdown options validation ─────────────────────────

  async tc07_pageSizeDropdown(screenshotDir: string): Promise<AL_TC07Result> {
    await this.navigateToAlerts();
    const defaultPageSize = (await this.pageSizeSelect.locator('.mat-select-value-text').textContent() ?? '').trim();
    await this.takeScreenshot(screenshotDir, 'AL_WTC07_01_default_size');

    await this.pageSizeSelect.click({ force: true });
    await this.page.waitForTimeout(400);
    const options = this.page.locator('mat-option');
    const optionCount = await options.count();
    await this.takeScreenshot(screenshotDir, 'AL_WTC07_02_options_open');

    await options.filter({ hasText: /^5$/ }).click({ force: true });
    await this.page.waitForTimeout(400);
    const sizeAfter5 = (await this.pageSizeSelect.locator('.mat-select-value-text').textContent() ?? '').trim();
    const pageSizeChangedTo5 = sizeAfter5 === '5';
    await this.takeScreenshot(screenshotDir, 'AL_WTC07_03_size_5');

    await this.pageSizeSelect.click({ force: true });
    await this.page.waitForTimeout(400);
    await options.filter({ hasText: /^10$/ }).click({ force: true });
    await this.page.waitForTimeout(400);
    const sizeAfter10 = (await this.pageSizeSelect.locator('.mat-select-value-text').textContent() ?? '').trim();
    const pageSizeChangedTo10 = sizeAfter10 === '10';
    await this.takeScreenshot(screenshotDir, 'AL_WTC07_04_size_reset');

    const tableStableAfterPageSizeChange = await this.table.isVisible().catch(() => false);
    return { defaultPageSize, optionCount, pageSizeChangedTo5, pageSizeChangedTo10, tableStableAfterPageSizeChange };
  }

  // ── AL_WTC08 – Filter result synchronized with paginator label ───────────────

  async tc08_filterPaginatorSync(screenshotDir: string): Promise<AL_TC08Result> {
    await this.goToHome();
    await this.navigateToAlerts();
    const initialPaginatorLabel = (await this.getPaginatorText()).trim();
    await this.takeScreenshot(screenshotDir, 'AL_WTC08_01_initial');

    await this.filterAlerts('PO Receiving');
    const filteredPaginatorLabel = (await this.getPaginatorText()).trim();
    const filteredRowCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'AL_WTC08_02_filtered_match');

    await this.filterAlerts('XYZNOTEXIST_99999');
    const noMatchPaginatorLabel = (await this.getPaginatorText()).trim();
    const noMatchRowCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'AL_WTC08_03_no_match');

    await this.clearFilter();
    const clearedPaginatorLabel = (await this.getPaginatorText()).trim();
    await this.takeScreenshot(screenshotDir, 'AL_WTC08_04_cleared');

    return { initialPaginatorLabel, filteredPaginatorLabel, noMatchPaginatorLabel, noMatchRowCount, clearedPaginatorLabel, filteredRowCount };
  }

  // ── AL_WTC09 – Close and reopen Application Alerts tab ───────────────────────

  async tc09_closeReopenTab(screenshotDir: string): Promise<AL_TC09Result> {
    await this.navigateToAlerts();
    await this.takeScreenshot(screenshotDir, 'AL_WTC09_01_tab_open');

    const tabCloseButtonFound = await this.tabCloseBtn.isVisible().catch(() => false);

    if (tabCloseButtonFound) {
      // Dispatch click without bubbling so the event does not reach the parent <a>
      // navigation handler, which would immediately re-open the tab.
      await this.page.evaluate(function () {
        var spans = Array.from(document.querySelectorAll('span[title="Close Tab"]'));
        var target = spans.find(function (s) {
          var li = s.closest('li');
          return !!li && (li.textContent || '').trim().includes('Application Alerts');
        }) as HTMLElement | undefined;
        if (target) {
          target.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true, view: window }));
        }
      });
      await this.page.waitForTimeout(1500);
    }

    const appAlertClosedSuccessfully = !(await this.appAlert.isVisible().catch(() => false));
    await this.takeScreenshot(screenshotDir, 'AL_WTC09_02_tab_closed');

    await this.navigateToAlerts();
    const appAlertReopenedSuccessfully = await this.appAlert.isVisible({ timeout: 15000 }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'AL_WTC09_03_tab_reopened');

    return { tabCloseButtonFound, appAlertClosedSuccessfully, appAlertReopenedSuccessfully };
  }

  // ── AL_WTC10 – Multi-tab coexistence with Application Alerts ─────────────────

  async tc10_multiTabNavigation(screenshotDir: string): Promise<AL_TC10Result> {
    await this.goToHome();
    await this.navigateToAlerts();
    await this.takeScreenshot(screenshotDir, 'AL_WTC10_01_alerts_open');

    await this.openSidebar();
    await this.page.evaluate(function () {
      var items = Array.from(document.querySelectorAll('#sideMenu *'));
      var archiveBtn = items.find(function (el) {
        return el.textContent.trim() === 'Archive Records' && (el as HTMLElement).children.length === 0;
      }) as HTMLElement | null;
      if (archiveBtn) archiveBtn.click();
    });
    await this.page.waitForTimeout(1500);
    await this.closeSidebar();
    await this.takeScreenshot(screenshotDir, 'AL_WTC10_02_multi_tab');

    const tabCount = await this.page.locator('li:has(span[title="Close Tab"])').count();
    const multipleTabsVisible = tabCount >= 2;

    await this.page.evaluate(function () {
      var anchors = Array.from(document.querySelectorAll('li a'));
      var alertTab = anchors.find(function (el) {
        return el.textContent.trim().startsWith('Application Alerts');
      }) as HTMLElement | null;
      if (alertTab) alertTab.click();
    });
    await this.page.waitForTimeout(800);
    await this.takeScreenshot(screenshotDir, 'AL_WTC10_03_switched_back');

    const alertsTabStillAccessible = await this.appAlert.isVisible({ timeout: 10000 }).catch(() => false);
    const rowCountAfterTabSwitch = alertsTabStillAccessible ? await this.getRowCount() : 0;
    await this.takeScreenshot(screenshotDir, 'AL_WTC10_04_alerts_verified');

    return { multipleTabsVisible, alertsTabStillAccessible, rowCountAfterTabSwitch };
  }
}
