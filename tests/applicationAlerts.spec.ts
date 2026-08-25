import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { ApplicationAlertsPage } from '../pages/ApplicationAlertsPage';
import { getAlertsTestData, AlertsTestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'applicationAlerts');

test.describe('Application Alerts', () => {
  let page: Page;
  let context: BrowserContext;
  let alertsData: AlertsTestData[];
  let alertsPage: ApplicationAlertsPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; alertsPage = new ApplicationAlertsPage(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    alertsData = await getAlertsTestData();
    context = await browser.newContext();
    page = await context.newPage();
    alertsPage = new ApplicationAlertsPage(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => { await context.close(); });

  // ── AL_WTC01 – Load alerts grid and validate columns ─────────────────────────
  test('AL_WTC01 - Load alerts grid and validate columns', async () => {
    const data = alertsData.find(r => r.testCase === 'AL_WTC01')!;
    const result = await alertsPage.tc01_loadAlertsGrid(SCREENSHOTS_DIR, data);

    expect(result.tableVisible).toBe(true);
    expect(result.typeHeaderText).toContain('Type');
    expect(result.descHeaderText).toContain('Description');
    expect(result.statusHeaderText).toContain('Status');
    expect(result.paginatorVisible).toBe(true);
    expect(result.pageSizeSelectVisible).toBe(true);
    expect(result.paginatorRangeLabelVisible).toBe(true);
    expect(result.prevBtnVisible).toBe(true);
    expect(result.nextBtnVisible).toBe(true);
    expect(result.rowCount).toBeGreaterThanOrEqual(0);
  });

  // ── AL_WTC02 – Filter alerts and verify empty result behavior ────────────────
  test('AL_WTC02 - Filter alerts and verify empty result behavior', async () => {
    const data = alertsData.find(r => r.testCase === 'AL_WTC02')!;
    const result = await alertsPage.tc02_filterAlerts(SCREENSHOTS_DIR, data);

    expect(result.filteredCount).toBeGreaterThan(0);
    expect(result.noMatchCount).toBe(0);
    await expect(alertsPage.typeHeader).toBeVisible();
    await expect(alertsPage.descHeader).toBeVisible();
    await expect(alertsPage.statusHeader).toBeVisible();
    await expect(alertsPage.paginator).toBeVisible();
    expect(result.restoredCount).toBeGreaterThan(0);
  });

  // ── AL_WTC03 – Offline behavior on alerts load ──────────────────────────────
  test('AL_WTC03 - Offline behavior on alerts load', async () => {
    test.setTimeout(90000);
    const data = alertsData.find(r => r.testCase === 'AL_WTC03')!;
    const result = await alertsPage.tc03_offlineBehavior(SCREENSHOTS_DIR, context, cfg.username, cfg.password);

    expect(result.appAlertVisibleOffline).toBe(true);
    await expect(alertsPage.table).toBeVisible({ timeout: 15000 });
    const rowCount = await alertsPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
    expect(result.tableRestoredOnline).toBe(true);
  });

  // ── AL_WTC04 – Boundary and stress behavior ──────────────────────────────────
  test('AL_WTC04 - Application Alerts boundary and stress behavior', async () => {
    test.setTimeout(60000);
    const data = alertsData.find(r => r.testCase === 'AL_WTC04')!;
    const result = await alertsPage.tc04_boundaryStress(SCREENSHOTS_DIR, data);

    expect(result.tableStableAfterBoundary).toBe(true);
    await expect(alertsPage.table).toBeVisible();
    await expect(alertsPage.appAlert).toBeVisible();
  });

  // ── AL_WTC05 – No Application Alerts ────────────────────────────────────────
  test('AL_WTC05 - No Application Alerts', async () => {
    const result = await alertsPage.tc05_noApplicationAlerts(SCREENSHOTS_DIR);

    if (result.noAlertsBtnFound) {
      expect(result.noAlertsBtnClass).toMatch(/btn-success/);
      expect(result.noAlertsBtnText).toContain('No Application Alerts');
      await expect(alertsPage.appAlert).toBeVisible();
      await expect(alertsPage.table).toBeAttached();
      expect(result.rowCountAfterClick).toBeGreaterThanOrEqual(0);
    } else {
      expect(result.alertsBtnFound).toBe(true);
      expect(result.alertsBtnText).toContain('Application Alerts');
    }
  });

  // ── AL_WTC06 – Sort column header interaction ─────────────────────────────────
  test('AL_WTC06 - Sort column headers and verify sort behavior', async () => {
    const result = await alertsPage.tc06_sortColumnBehavior(SCREENSHOTS_DIR);

    expect(result.tableSortStable).toBe(true);
    await expect(alertsPage.table).toBeVisible();
    await expect(alertsPage.appAlert).toBeVisible();
    if (result.typeSortAscAriaSort) {
      expect(['ascending', 'descending']).toContain(result.typeSortAscAriaSort);
    }
    if (result.typeSortDescAriaSort) {
      expect(['ascending', 'descending']).toContain(result.typeSortDescAriaSort);
    }
  });

  // ── AL_WTC07 – Page size dropdown options validation ──────────────────────────
  test('AL_WTC07 - Page size dropdown options and selection', async () => {
    const result = await alertsPage.tc07_pageSizeDropdown(SCREENSHOTS_DIR);

    expect(result.defaultPageSize).toBe('10');
    expect(result.optionCount).toBeGreaterThanOrEqual(5);
    expect(result.pageSizeChangedTo5).toBe(true);
    expect(result.pageSizeChangedTo10).toBe(true);
    expect(result.tableStableAfterPageSizeChange).toBe(true);
    await expect(alertsPage.table).toBeVisible();
    await expect(alertsPage.paginator).toBeVisible();
  });

  // ── AL_WTC08 – Filter synchronized with paginator label ──────────────────────
  test('AL_WTC08 - Filter result synchronized with paginator label', async () => {
    const result = await alertsPage.tc08_filterPaginatorSync(SCREENSHOTS_DIR);

    expect(result.initialPaginatorLabel).not.toBe('');
    expect(result.filteredRowCount).toBeGreaterThanOrEqual(0);
    expect(result.noMatchRowCount).toBe(0);
    expect(result.clearedPaginatorLabel).not.toBe('');
    await expect(alertsPage.appAlert).toBeVisible();
    await expect(alertsPage.table).toBeVisible();
  });

  // ── AL_WTC09 – Close and reopen Application Alerts tab ───────────────────────
  test('AL_WTC09 - Close and reopen Application Alerts tab', async () => {
    const result = await alertsPage.tc09_closeReopenTab(SCREENSHOTS_DIR);

    expect(result.tabCloseButtonFound).toBe(true);
    expect(result.appAlertClosedSuccessfully).toBe(true);
    expect(result.appAlertReopenedSuccessfully).toBe(true);
    await expect(alertsPage.appAlert).toBeVisible();
    await expect(alertsPage.table).toBeVisible();
  });

  // ── AL_WTC10 – Multi-tab coexistence with Application Alerts ─────────────────
  test('AL_WTC10 - Application Alerts coexists with other open tabs', async () => {
    const result = await alertsPage.tc10_multiTabNavigation(SCREENSHOTS_DIR);

    expect(result.multipleTabsVisible).toBe(true);
    expect(result.alertsTabStillAccessible).toBe(true);
    expect(result.rowCountAfterTabSwitch).toBeGreaterThanOrEqual(0);
    await expect(alertsPage.appAlert).toBeVisible();
    //test
  });
});