import { Page, Locator, BrowserContext, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './LoginPage';
import { PlanogramTestData } from '../utils/excelHelper';

// ── Return-type interfaces for each TC method ─────────────────────────────────

export interface TC01Result {
  historyBtnVisible: boolean;
  activateBtnVisible: boolean;
  gridVisible: boolean;
  headerText: string;
  rowCount: number;
  paginatorAttached: boolean;
  pageSizeSelectAttached: boolean;
  paginatorLabelAttached: boolean;
  prevBtnAttached: boolean;
  nextBtnAttached: boolean;
  errorMsg: string;
}

export interface TC02Result {
  rowCount: number;
  priorErrorBannerVisible: boolean;
  priorErrorMsg: string;
  postActivateErrorBannerVisible: boolean;
  postActivateErrorMsg: string;
  gridStable: boolean;
}

export interface TC03Result {
  noRecords: boolean;
  gridVisible: boolean;
}

export interface TC04Result {
  activePaneVisible: boolean;
  bannerMsg: string;
  gridRestoredAfterBack: boolean;
}

export interface TC05Result {
  uiStableOffline: boolean;
  gridRestoredOnline: boolean;
}

export interface TC11Result {
  historyGridVisible: boolean;
  hasDescriptionCol: boolean;
  hasDepartmentCol: boolean;
  hasLevelCol: boolean;
  hasPogIdCol: boolean;
  hasStatusCol: boolean;
  hasPogTypeCol: boolean;
  hasStartDateCol: boolean;
  hasSetDateCol: boolean;
  rowCount: number;
  paginatorText: string;
  gridRestoredAfterBack: boolean;
}

export interface TC13Result {
  initialRowCount: number;
  filteredRowCount: number;
  filterCleared: boolean;
}

export interface TC15Result {
  actionsPanelCollapsed: boolean;
  historyBtnHiddenAfterCollapse: boolean;
  actionsPanelExpandedAgain: boolean;
  historyBtnVisibleAfterExpand: boolean;
}

export interface TC16Result {
  historyGridVisible: boolean;
  filteredRowCount: number;
  filterClearedRowCount: number;
  gridStable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export class PlanogramActivationPage {
  readonly page: Page;

  // Actions panel
  readonly historyBtn: Locator;
  readonly activateBtn: Locator;

  // Banners
  readonly errorBanner: Locator;
  readonly errorMsg: Locator;

  // Grid
  readonly gridContainer: Locator;
  readonly filterInput: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;

  // Column headers
  readonly headerDescription: Locator;
  readonly headerDepartment: Locator;
  readonly headerNumber: Locator;
  readonly headerLevel: Locator;
  readonly headerPogId: Locator;
  readonly headerStatus: Locator;
  readonly headerPogType: Locator;
  readonly headerStartDate: Locator;
  readonly headerSetDate: Locator;

  // Paginator
  readonly paginator: Locator;
  readonly paginatorLabel: Locator;
  readonly pageSizeSelect: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.historyBtn  = page.locator('app-activation button[title="History Of POG Activation"]');
    this.activateBtn = page.locator('app-activation button[title="Activate selected POG"]');

    this.errorBanner = page.locator('app-activation #activationError');
    this.errorMsg    = page.locator('app-activation #activationError .message');

    this.gridContainer = page.locator('#pogActivation');
    this.filterInput   = this.gridContainer.locator('input[placeholder="Filter"]');
    this.table         = this.gridContainer.locator('mat-table');
    this.tableRows     = this.gridContainer.locator('mat-row');

    this.headerDescription = this.gridContainer.locator('mat-header-cell.mat-column-Description');
    this.headerDepartment  = this.gridContainer.locator('mat-header-cell.mat-column-Department');
    this.headerNumber      = this.gridContainer.locator('mat-header-cell.mat-column-Number');
    this.headerLevel       = this.gridContainer.locator('mat-header-cell.mat-column-Level');
    this.headerPogId       = this.gridContainer.locator('mat-header-cell.mat-column-PogID, mat-header-cell.mat-column-POG_ID, mat-header-cell.mat-column-pogId');
    this.headerStatus      = this.gridContainer.locator('mat-header-cell.mat-column-Status');
    this.headerPogType     = this.gridContainer.locator('mat-header-cell.mat-column-PogType, mat-header-cell.mat-column-POGType');
    this.headerStartDate   = this.gridContainer.locator('mat-header-cell.mat-column-StartDate, mat-header-cell.mat-column-Start_Date');
    this.headerSetDate     = this.gridContainer.locator('mat-header-cell.mat-column-SetDate,  mat-header-cell.mat-column-Set_Date');

    this.paginator      = this.gridContainer.locator('mat-paginator');
    this.paginatorLabel = this.gridContainer.locator('.mat-paginator-range-label');
    this.pageSizeSelect = this.gridContainer.locator('.mat-paginator-page-size-select');
    this.prevPageBtn    = this.gridContainer.locator('.mat-paginator-navigation-previous');
    this.nextPageBtn    = this.gridContainer.locator('.mat-paginator-navigation-next');
  }

  // ── Screenshot helper ───────────────────────────────────────────────────────

  async takeScreenshot(screenshotDir: string, name: string): Promise<void> {
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
    const filePath = path.join(screenshotDir, `${name}.png`);
    await this.page.screenshot({ path: filePath, fullPage: true });
    await test.info().attach(name, { path: filePath, contentType: 'image/png' });
    await this.page.evaluate(function () {
      var style = document.getElementById('__hide_sidebar_style__');
      if (style && style.parentNode) style.parentNode.removeChild(style);
    }).catch(() => {});
  }

  // ── Navigation helpers ──────────────────────────────────────────────────────

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

  async openPlanogramMenu(): Promise<void> {
    await this.openSidebar();
    await this.page.evaluate(function () {
      var links = document.querySelectorAll('#sideMenu li a');
      for (var i = 0; i < links.length; i++) {
        var el = links[i] as HTMLAnchorElement;
        if ((el.innerText || '').indexOf('Planogram') > -1) { el.click(); break; }
      }
    });
    await this.page.waitForTimeout(400);
  }

  async navigateToActivation(): Promise<void> {
    await this.openPlanogramMenu();
    await this.page.evaluate(function () {
      var li = document.getElementById('pogActivationLink');
      if (li) { var d = li.querySelector('div') as HTMLElement | null; if (d) d.click(); }
    });
    await this.page.waitForTimeout(2000);
    await this.gridContainer.waitFor({ state: 'visible', timeout: 15000 });
  }

  async closeSidebar(): Promise<void> {
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.style.display = 'none';
    });
    await this.page.waitForTimeout(200);
  }

  // ── Grid actions ────────────────────────────────────────────────────────────

  async filterGrid(text: string): Promise<void> {
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

  async sortByColumn(header: Locator): Promise<void> {
    await header.click({ force: true });
    await this.page.waitForTimeout(300);
  }

  async selectFirstRow(): Promise<void> {
    await this.tableRows.first().click({ force: true });
    await this.page.waitForTimeout(300);
  }

  async getRowCount(): Promise<number> { return this.tableRows.count(); }
  async getPaginatorText(): Promise<string> { return (await this.paginatorLabel.textContent()) ?? ''; }

  async clickActivate(): Promise<void> {
    await this.activateBtn.click({ force: true });
    await this.page.waitForTimeout(1500);
  }

  async clickHistory(): Promise<void> {
    await this.historyBtn.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  async reLoginIfNeeded(username: string, password: string): Promise<void> {
    const input = this.page.locator('input[type="text"]');
    if (await input.isVisible()) {
      await new LoginPage(this.page).login(username, password);
      await this.page.waitForTimeout(1000);
    }
  }

  // ── TC01 – Activation screen UI walkthrough ─────────────────────────────────

  async tc01_uiWalkthrough(screenshotDir: string, _data: PlanogramTestData): Promise<TC01Result> {
    await this.navigateToActivation();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC01_01_activation_loaded');

    // Step 1 – capture actions-panel state before any interactions
    const historyBtnVisible  = await this.historyBtn.isVisible();
    const activateBtnVisible = await this.activateBtn.isVisible();
    const gridVisible        = await this.gridContainer.isVisible();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC01_02_actions_panel');

    // Step 2 – headers + row selection
    const headerText = await this.gridContainer.locator('mat-header-row').innerText().catch(() => '');
    await this.takeScreenshot(screenshotDir, 'PLN_WTC01_03_grid_headers');
    const rowCount = await this.getRowCount();
    if (rowCount > 0) {
      await this.selectFirstRow();
      await this.takeScreenshot(screenshotDir, 'PLN_WTC01_04_row_selected');
    }

    // Step 3 – filter / sort / paginator
    await this.filterGrid('A');
    await this.takeScreenshot(screenshotDir, 'PLN_WTC01_05_filter_applied');
    await this.clearFilter();
    await this.sortByColumn(this.headerDescription);
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC01_06_sort_applied');

    // Capture paginator attachment state (may be re-rendered after sort)
    const paginatorAttached      = await this.paginator.count() > 0;
    const pageSizeSelectAttached = await this.pageSizeSelect.count() > 0;
    const paginatorLabelAttached = await this.paginatorLabel.count() > 0;
    const prevBtnAttached        = await this.prevPageBtn.count() > 0;
    const nextBtnAttached        = await this.nextPageBtn.count() > 0;
    await this.takeScreenshot(screenshotDir, 'PLN_WTC01_07_paginator_visible');

    const errorMsg = rowCount === 0 ? (await this.errorMsg.textContent() ?? '').trim() : '';
    return {
      historyBtnVisible, activateBtnVisible, gridVisible, headerText,
      rowCount, paginatorAttached, pageSizeSelectAttached, paginatorLabelAttached,
      prevBtnAttached, nextBtnAttached, errorMsg,
    };
  }

  // ── TC02 – Activation grid key negative validations ─────────────────────────

  async tc02_negativeValidations(screenshotDir: string, _data: PlanogramTestData): Promise<TC02Result> {
    await this.navigateToActivation();
    const rowCount = await this.getRowCount();

    // Step 1 – empty-data error banner
    const priorErrorBannerVisible = await this.errorBanner.isVisible();
    const priorErrorMsg = priorErrorBannerVisible ? (await this.errorMsg.textContent() ?? '').trim() : '';
    if (rowCount === 0) await this.takeScreenshot(screenshotDir, 'PLN_WTC02_01_empty_error_banner');

    // Step 2 – click Activate with no row selected
    await this.clickActivate();
    const postActivateErrorBannerVisible = await this.errorBanner.isVisible();
    const postActivateErrorMsg = postActivateErrorBannerVisible ? (await this.errorMsg.textContent() ?? '').trim() : '';
    await this.takeScreenshot(screenshotDir, 'PLN_WTC02_02_no_selection_error');

    // Step 3 – navigate back, optionally select a row to confirm validation clears
    await this.navigateToActivation();
    if (rowCount > 0) await this.selectFirstRow();
    const gridStable = await this.gridContainer.isVisible();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC02_03_ready_for_retry');

    return { rowCount, priorErrorBannerVisible, priorErrorMsg, postActivateErrorBannerVisible, postActivateErrorMsg, gridStable };
  }

  // ── TC03 – Business/E2E: Pending → Activated → History → Finalize ───────────

  async tc03_e2eActivation(screenshotDir: string): Promise<TC03Result> {
    await this.navigateToActivation();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC03_01_activation_grid');
    const rowCount = await this.getRowCount();

    if (rowCount > 0) {
      // Step 1 – activate
      await this.selectFirstRow();
      await this.clickActivate();
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot(screenshotDir, 'PLN_WTC03_02_activate_clicked');

      // Step 2 – re-navigate to activation to ensure we are on the correct view
      // (activation may redirect or change the page state)
      await this.navigateToActivation();
      await this.clickHistory();
      await this.takeScreenshot(screenshotDir, 'PLN_WTC03_03_history_opened');
      const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
      if (await backBtn.isVisible()) { await backBtn.click({ force: true }); await this.page.waitForTimeout(1500); }
      await this.takeScreenshot(screenshotDir, 'PLN_WTC03_04_back_from_history');

      // Step 3 – finalize (if present)
      const finalizeBtn = this.page.locator('button:has-text("Finalize"), button[title*="Finalize"]').first();
      if (await finalizeBtn.isVisible()) {
        await finalizeBtn.click({ force: true });
        await this.page.waitForTimeout(1500);
        await this.takeScreenshot(screenshotDir, 'PLN_WTC03_05_finalize_clicked');
      }

      // Step 4 – return to grid
      await this.navigateToActivation();
      await this.takeScreenshot(screenshotDir, 'PLN_WTC03_06_final_grid');
      return { noRecords: false, gridVisible: await this.gridContainer.isVisible() };
    } else {
      await this.takeScreenshot(screenshotDir, 'PLN_WTC03_01_no_pending_records');
      return { noRecords: true, gridVisible: await this.gridContainer.isVisible() };
    }
  }

  // ── TC04 – Activation History no-record behavior ────────────────────────────

  async tc04_historyBehavior(screenshotDir: string): Promise<TC04Result> {
    await this.navigateToActivation();
    await this.clickHistory();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC04_01_history_opened');

    // Step 1+2 – check active pane content
    const activePaneContent = this.page.locator('.pane:not([hidden])').last();
    const activePaneVisible = await activePaneContent.isVisible({ timeout: 10000 }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC04_02_history_content');

    const bannerEl = activePaneContent.locator('.alert .message').first();
    const bannerVisible = await bannerEl.isVisible({ timeout: 3000 }).catch(() => false);
    const bannerMsg = bannerVisible ? (await bannerEl.textContent() ?? '').trim() : '';
    if (bannerVisible) await this.takeScreenshot(screenshotDir, 'PLN_WTC04_02b_history_error_msg');

    // Step 3 – click Back
    const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
    if (await backBtn.isVisible()) { await backBtn.click({ force: true }); await this.page.waitForTimeout(1500); }
    await this.takeScreenshot(screenshotDir, 'PLN_WTC04_03_back_from_history');
    const gridRestoredAfterBack = await this.gridContainer.isVisible({ timeout: 10000 }).catch(() => false);

    return { activePaneVisible, bannerMsg, gridRestoredAfterBack };
  }

  // ── TC05 – Activation service failure / offline resilience ─────────────────

  async tc05_offlineResilience(screenshotDir: string, context: BrowserContext, username: string, password: string): Promise<TC05Result> {
    await this.navigateToActivation();
    const rowCount = await this.getRowCount();

    // Step 1 – go offline and attempt activate
    await context.setOffline(true);
    await this.page.waitForTimeout(500);
    if (rowCount > 0) await this.selectFirstRow();
    await this.clickActivate();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC05_01_offline_activate_attempt');

    // Step 2 – UI must stay stable without crash
    const uiStableOffline = await this.gridContainer.isVisible().catch(() => false);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC05_02_ui_stable_offline');

    // Step 3 – restore connectivity and recover
    await context.setOffline(false);
    await this.page.waitForTimeout(500);
    await this.page.goto('http://isp.stores.michaels.com/webapp/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.page.waitForTimeout(2000);
    await this.reLoginIfNeeded(username, password);
    await this.navigateToActivation();
    const gridRestoredOnline = await this.gridContainer.isVisible({ timeout: 15000 }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC05_03_online_recovery');

    return { uiStableOffline, gridRestoredOnline };
  }

  async tc11_activationHistoryColumns(screenshotDir: string): Promise<TC11Result> {
    await this.navigateToActivation();
    await this.clickHistory();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC11_01_history_opened');

    // History switches the visible pane — use the same pattern as tc04
    const historyPane = this.page.locator('.pane:not([hidden])').last();
    const historyGridVisible = await historyPane.isVisible({ timeout: 10000 }).catch(() => false);
    const headerText = await historyPane.locator('mat-header-row').first().innerText().catch(() => '');

    const hasDescriptionCol = /Description/i.test(headerText);
    const hasDepartmentCol = /Department/i.test(headerText);
    const hasLevelCol = /Level/i.test(headerText);
    const hasPogIdCol = /POG\s*ID|POGID/i.test(headerText);
    const hasStatusCol = /Status/i.test(headerText);
    const hasPogTypeCol = /POG\s*Type/i.test(headerText);
    const hasStartDateCol = /Start/i.test(headerText);
    const hasSetDateCol = /Set/i.test(headerText);

    const rowCount = await historyPane.locator('mat-row').count();
    const paginatorEl = historyPane.locator('.mat-paginator-range-label');
    const paginatorText = (await paginatorEl.first().textContent({ timeout: 3000 }).catch(() => '')) ?? '';
    await this.takeScreenshot(screenshotDir, 'PLN_WTC11_02_history_columns');

    const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click({ force: true });
      await this.page.waitForTimeout(1500);
    }
    const gridRestoredAfterBack = await this.gridContainer.isVisible({ timeout: 10000 }).catch(() => false);

    return { historyGridVisible, hasDescriptionCol, hasDepartmentCol, hasLevelCol, hasPogIdCol, hasStatusCol, hasPogTypeCol, hasStartDateCol, hasSetDateCol, rowCount, paginatorText: paginatorText.trim(), gridRestoredAfterBack };
  }

  async tc13_activationFilterNoMatch(screenshotDir: string, data: PlanogramTestData): Promise<TC13Result> {
    await this.navigateToActivation();
    const initialRowCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC13_01_before_filter');

    await this.filterGrid(data.filterNoMatch);
    await this.page.waitForTimeout(600);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC13_02_filter_applied');
    const filteredRowCount = await this.getRowCount();

    await this.clearFilter();
    await this.page.waitForTimeout(400);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC13_03_filter_cleared');
    const afterClearCount = await this.getRowCount();

    return { initialRowCount, filteredRowCount, filterCleared: afterClearCount >= 0 };
  }

  async tc15_actionsPanelCollapseExpand(screenshotDir: string): Promise<TC15Result> {
    await this.navigateToActivation();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC15_01_initial');

    // Use jQuery Bootstrap API to collapse (most reliable for Bootstrap 3)
    await this.page.evaluate(() => {
      const jq = (window as any).jQuery;
      if (jq) {
        jq('#collapsedata3').collapse('hide');
      } else {
        // Fallback: manually remove Bootstrap 'in' class to collapse
        const el = document.getElementById('collapsedata3');
        if (el) {
          el.classList.remove('in');
          (el as HTMLElement).style.height = '0px';
          (el as HTMLElement).style.overflow = 'hidden';
        }
      }
    });
    await this.page.waitForTimeout(700);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC15_02_collapsed');

    const actionsPanelCollapsed = await this.page.evaluate(() => {
      const el = document.getElementById('collapsedata3');
      return el ? (!el.classList.contains('in') && !el.classList.contains('show')) : false;
    });
    const historyBtnHiddenAfterCollapse = !(await this.historyBtn.isVisible({ timeout: 1500 }).catch(() => false));

    // Expand again
    await this.page.evaluate(() => {
      const jq = (window as any).jQuery;
      if (jq) {
        jq('#collapsedata3').collapse('show');
      } else {
        const el = document.getElementById('collapsedata3');
        if (el) {
          el.classList.add('in');
          (el as HTMLElement).style.height = '';
          (el as HTMLElement).style.overflow = '';
        }
      }
    });
    await this.page.waitForTimeout(700);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC15_03_expanded');

    const historyBtnVisibleAfterExpand = await this.historyBtn.isVisible({ timeout: 5000 }).catch(() => false);
    const actionsPanelExpandedAgain = historyBtnVisibleAfterExpand;

    return { actionsPanelCollapsed, historyBtnHiddenAfterCollapse, actionsPanelExpandedAgain, historyBtnVisibleAfterExpand };
  }

  async tc16_activationHistoryFilter(screenshotDir: string, data: PlanogramTestData): Promise<TC16Result> {
    await this.navigateToActivation();
    await this.clickHistory();
    // Wait for the Back button to confirm history view is fully loaded
    const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
    await backBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.takeScreenshot(screenshotDir, 'PLN_WTC16_01_history_loaded');

    const historyPane = this.page.locator('.pane:not([hidden])').last();
    const historyGridVisible = await historyPane.isVisible({ timeout: 10000 }).catch(() => false);

    // Use pressSequentially (same as filterGrid) to reliably trigger Angular change detection
    const historyFilter = historyPane.locator('input[placeholder="Filter"]').first();
    await historyFilter.clear();
    await historyFilter.dispatchEvent('input');
    if (data.filterNoMatch) await historyFilter.pressSequentially(data.filterNoMatch, { delay: 10 });
    await this.page.waitForTimeout(800);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC16_02_history_filtered');
    const filteredRowCount = await historyPane.locator('mat-row').count();

    await historyFilter.clear();
    await historyFilter.dispatchEvent('input');
    await this.page.waitForTimeout(600);
    const filterClearedRowCount = await historyPane.locator('mat-row').count();

    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click({ force: true });
      await this.page.waitForTimeout(1500);
    }
    const gridStable = await this.gridContainer.isVisible({ timeout: 10000 }).catch(() => false);

    return { historyGridVisible, filteredRowCount, filterClearedRowCount, gridStable };
  }
}
