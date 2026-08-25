import { Page, Locator, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './LoginPage';
import { PlanogramTestData } from '../utils/excelHelper';

// ── Return-type interfaces ────────────────────────────────────────────────────

export interface TC06Result {
  historyBtnVisible: boolean;
  deactivateBtnVisible: boolean;
  gridVisible: boolean;
  headerText: string;
  rowCount: number;
  checkboxHeaderVisible: boolean;
  paginatorAttached: boolean;
  pageSizeSelectAttached: boolean;
  paginatorLabelAttached: boolean;
  errorMsg: string;
}

export interface TC07Result {
  rowCount: number;
  priorErrorBannerVisible: boolean;
  priorErrorMsg: string;
  postDeactivateErrorBannerVisible: boolean;
  postDeactivateErrorMsg: string;
  gridStable: boolean;
}

export interface TC08Result {
  noRecords: boolean;
  successMsg: string;
  historyTableVisible: boolean;
  gridRestoredAfterBack: boolean;
}

export interface TC09Result {
  activePaneVisible: boolean;
  bannerMsg: string;
  gridRestoredAfterBack: boolean;
}

export interface TC12Result {
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

export interface TC14Result {
  initialRowCount: number;
  filteredRowCount: number;
  filterCleared: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export class PlanogramDeactivationPage {
  readonly page: Page;

  // Actions panel
  readonly historyBtn: Locator;
  readonly deactivateBtn: Locator;

  // Banners
  readonly errorBanner: Locator;
  readonly errorMsg: Locator;
  readonly successBanner: Locator;
  readonly successMsg: Locator;

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
  readonly headerStartDate: Locator;
  readonly headerSetDate: Locator;
  readonly headerSelectToDeactivate: Locator;

  // Paginator
  readonly paginator: Locator;
  readonly paginatorLabel: Locator;
  readonly pageSizeSelect: Locator;
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.historyBtn    = page.locator('app-pog-deactivation button[title="History Of POG De-Activation"]');
    this.deactivateBtn = page.locator('app-pog-deactivation button[title="Deactivate POG"]');

    this.errorBanner   = page.locator('app-pog-deactivation #deactivateError');
    this.errorMsg      = page.locator('app-pog-deactivation #deactivateError .message');
    this.successBanner = page.locator('app-pog-deactivation #deactivatesuccess');
    this.successMsg    = page.locator('app-pog-deactivation #deactivatesuccess .message');

    this.gridContainer = page.locator('#DeactivationGrid');
    this.filterInput   = this.gridContainer.locator('input[placeholder="Filter"]');
    this.table         = this.gridContainer.locator('mat-table');
    this.tableRows     = this.gridContainer.locator('mat-row');

    this.headerDescription      = this.gridContainer.locator('mat-header-cell.mat-column-Description');
    this.headerDepartment       = this.gridContainer.locator('mat-header-cell.mat-column-Department');
    this.headerNumber           = this.gridContainer.locator('mat-header-cell.mat-column-Number');
    this.headerLevel            = this.gridContainer.locator('mat-header-cell.mat-column-Level');
    this.headerPogId            = this.gridContainer.locator('mat-header-cell.mat-column-PogID, mat-header-cell.mat-column-POG_ID, mat-header-cell.mat-column-pogId');
    this.headerStatus           = this.gridContainer.locator('mat-header-cell.mat-column-Status');
    this.headerStartDate        = this.gridContainer.locator('mat-header-cell.mat-column-StartDate, mat-header-cell.mat-column-Start_Date');
    this.headerSetDate          = this.gridContainer.locator('mat-header-cell.mat-column-SetDate,  mat-header-cell.mat-column-Set_Date');
    this.headerSelectToDeactivate = this.gridContainer.locator('mat-header-cell').filter({ hasText: /select.*deactivat/i });

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

  async navigateToDeactivation(): Promise<void> {
    await this.openPlanogramMenu();
    await this.page.evaluate(function () {
      var li = document.getElementById('pogDeactivationLink');
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

  async selectFirstRowCheckbox(): Promise<void> {
    const checkbox = this.tableRows.first().locator('mat-checkbox, input[type="checkbox"]');
    await checkbox.click({ force: true });
    await this.page.waitForTimeout(300);
  }

  async getRowCount(): Promise<number> { return this.tableRows.count(); }
  async getPaginatorText(): Promise<string> { return (await this.paginatorLabel.textContent()) ?? ''; }

  async clickDeactivate(): Promise<void> {
    await this.deactivateBtn.click({ force: true });
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

  // ── TC06 – De-Activation screen UI walkthrough ──────────────────────────────

  async tc06_uiWalkthrough(screenshotDir: string, _data: PlanogramTestData): Promise<TC06Result> {
    await this.navigateToDeactivation();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC06_01_deactivation_loaded');

    // Step 1 – capture actions-panel state before interactions
    const historyBtnVisible    = await this.historyBtn.isVisible();
    const deactivateBtnVisible = await this.deactivateBtn.isVisible();
    const gridVisible          = await this.gridContainer.isVisible();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC06_02_actions_panel');

    // Step 2 – headers + checkbox column
    const headerText = await this.gridContainer.locator('mat-header-row').innerText().catch(() => '');
    const checkboxHeaderVisible = await this.headerSelectToDeactivate.isVisible().catch(() => false);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC06_03_grid_headers');

    // Step 3 – filter / sort / paginator
    await this.filterGrid('A');
    await this.takeScreenshot(screenshotDir, 'PLN_WTC06_04_filter_applied');
    await this.clearFilter();
    await this.sortByColumn(this.headerDescription);
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC06_05_sort_applied');

    const paginatorAttached      = await this.paginator.count() > 0;
    const pageSizeSelectAttached = await this.pageSizeSelect.count() > 0;
    const paginatorLabelAttached = await this.paginatorLabel.count() > 0;
    await this.takeScreenshot(screenshotDir, 'PLN_WTC06_06_paginator_visible');

    const rowCount = await this.getRowCount();
    const errorMsg = rowCount === 0 ? (await this.errorMsg.textContent() ?? '').trim() : '';
    return { historyBtnVisible, deactivateBtnVisible, gridVisible, headerText, rowCount, checkboxHeaderVisible, paginatorAttached, pageSizeSelectAttached, paginatorLabelAttached, errorMsg };
  }

  // ── TC07 – De-Activation negative validations ───────────────────────────────

  async tc07_negativeValidations(screenshotDir: string, _data: PlanogramTestData): Promise<TC07Result> {
    await this.navigateToDeactivation();
    const rowCount = await this.getRowCount();

    const priorErrorBannerVisible = await this.errorBanner.isVisible();
    const priorErrorMsg = priorErrorBannerVisible ? (await this.errorMsg.textContent() ?? '').trim() : '';
    if (rowCount === 0) await this.takeScreenshot(screenshotDir, 'PLN_WTC07_01_empty_error_banner');

    // Step 2 – click Deactivate with no checkbox selected
    await this.clickDeactivate();
    const postDeactivateErrorBannerVisible = await this.errorBanner.isVisible();
    const postDeactivateErrorMsg = postDeactivateErrorBannerVisible ? (await this.errorMsg.textContent() ?? '').trim() : '';
    await this.takeScreenshot(screenshotDir, 'PLN_WTC07_02_no_selection_error');

    // Step 3 – post-deactivate state
    await this.takeScreenshot(screenshotDir, 'PLN_WTC07_03_post_deactivate_state');
    const gridStable = await this.gridContainer.isVisible();

    return { rowCount, priorErrorBannerVisible, priorErrorMsg, postDeactivateErrorBannerVisible, postDeactivateErrorMsg, gridStable };
  }

  // ── TC08 – Business/E2E: Deactivate + History ───────────────────────────────

  async tc08_e2eDeactivation(screenshotDir: string, data: PlanogramTestData): Promise<TC08Result> {
    await this.navigateToDeactivation();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC08_01_deactivation_grid');
    const rowCount = await this.getRowCount();

    if (rowCount > 0) {
      // Step 1 – select and deactivate
      await this.selectFirstRowCheckbox();
      await this.clickDeactivate();
      await this.takeScreenshot(screenshotDir, 'PLN_WTC08_02_deactivate_clicked');

      const successVisible = await this.successBanner.isVisible({ timeout: 5000 }).catch(() => false);
      const successMsg = successVisible ? (await this.successMsg.textContent() ?? '').trim() : '';
      if (successVisible) await this.takeScreenshot(screenshotDir, 'PLN_WTC08_03_success_banner');

      // Step 2 – history
      await this.clickHistory();
      await this.takeScreenshot(screenshotDir, 'PLN_WTC08_04_history_opened');
      const historyTableVisible = await this.page.locator('mat-table').first().isVisible({ timeout: 10000 }).catch(() => false);
      await this.takeScreenshot(screenshotDir, 'PLN_WTC08_05_history_records');

      // Step 3 – back
      const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
      if (await backBtn.isVisible()) { await backBtn.click({ force: true }); await this.page.waitForTimeout(1500); }
      await this.takeScreenshot(screenshotDir, 'PLN_WTC08_06_back_from_history');
      const gridRestoredAfterBack = await this.gridContainer.isVisible({ timeout: 10000 }).catch(() => false);

      return { noRecords: false, successMsg, historyTableVisible, gridRestoredAfterBack };
    } else {
      await this.takeScreenshot(screenshotDir, 'PLN_WTC08_01_no_records_to_deactivate');
      return { noRecords: true, successMsg: '', historyTableVisible: false, gridRestoredAfterBack: false };
    }
  }

  // ── TC09 – Deactivation History no-record behavior ──────────────────────────

  async tc09_historyBehavior(screenshotDir: string): Promise<TC09Result> {
    await this.navigateToDeactivation();
    await this.clickHistory();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC09_01_history_opened');

    const activePaneContent = this.page.locator('.pane:not([hidden])').last();
    const activePaneVisible = await activePaneContent.isVisible({ timeout: 10000 }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC09_02_history_content');

    const bannerEl = activePaneContent.locator('.alert .message').first();
    const bannerVisible = await bannerEl.isVisible({ timeout: 3000 }).catch(() => false);
    const bannerMsg = bannerVisible ? (await bannerEl.textContent() ?? '').trim() : '';
    if (bannerVisible) await this.takeScreenshot(screenshotDir, 'PLN_WTC09_02b_error_msg');

    const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
    if (await backBtn.isVisible()) { await backBtn.click({ force: true }); await this.page.waitForTimeout(1500); }
    await this.takeScreenshot(screenshotDir, 'PLN_WTC09_03_back_from_history');
    const gridRestoredAfterBack = await this.gridContainer.isVisible({ timeout: 10000 }).catch(() => false);

    return { activePaneVisible, bannerMsg, gridRestoredAfterBack };
  }

  async tc12_deactivationHistoryColumns(screenshotDir: string): Promise<TC12Result> {
    await this.navigateToDeactivation();
    await this.clickHistory();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC12_01_history_opened');

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
    await this.takeScreenshot(screenshotDir, 'PLN_WTC12_02_history_columns');

    const backBtn = this.page.locator('button:has-text("Back"), a:has-text("Back")').first();
    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click({ force: true });
      await this.page.waitForTimeout(1500);
    }
    const gridRestoredAfterBack = await this.gridContainer.isVisible({ timeout: 10000 }).catch(() => false);

    return { historyGridVisible, hasDescriptionCol, hasDepartmentCol, hasLevelCol, hasPogIdCol, hasStatusCol, hasPogTypeCol, hasStartDateCol, hasSetDateCol, rowCount, paginatorText: paginatorText.trim(), gridRestoredAfterBack };
  }

  async tc14_deactivationFilterNoMatch(screenshotDir: string, data: PlanogramTestData): Promise<TC14Result> {
    await this.navigateToDeactivation();
    const initialRowCount = await this.getRowCount();
    await this.takeScreenshot(screenshotDir, 'PLN_WTC14_01_before_filter');

    await this.filterGrid(data.filterNoMatch);
    await this.page.waitForTimeout(600);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC14_02_filter_applied');
    const filteredRowCount = await this.getRowCount();

    await this.clearFilter();
    await this.page.waitForTimeout(400);
    await this.takeScreenshot(screenshotDir, 'PLN_WTC14_03_filter_cleared');
    const afterClearCount = await this.getRowCount();

    return { initialRowCount, filteredRowCount, filterCleared: afterClearCount >= 0 };
  }
}
