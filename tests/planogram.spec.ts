import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { PlanogramActivationPage } from '../pages/PlanogramActivationPage';
import { PlanogramDeactivationPage } from '../pages/PlanogramDeactivationPage';
import { getPlanogramTestData, PlanogramTestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'planogram');

test.describe('Planogram', () => {
  let page: Page;
  let context: BrowserContext;
  let planogramData: PlanogramTestData[];
  let actPage: PlanogramActivationPage;
  let deactPage: PlanogramDeactivationPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => {
      context = ctx; page = pg;
      actPage   = new PlanogramActivationPage(pg);
      deactPage = new PlanogramDeactivationPage(pg);
    }
  );

  test.beforeAll(async ({ browser }) => {
    planogramData = await getPlanogramTestData();
    context = await browser.newContext();
    page = await context.newPage();
    actPage  = new PlanogramActivationPage(page);
    deactPage = new PlanogramDeactivationPage(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(1000);
  });

  test.afterAll(async () => { await context.close(); });

  // ── PLN_WTC01 ──────────────────────────────────────────────────────────────
  test('PLN_WTC01 - Activation screen UI walkthrough (consolidated)', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC01')!;
    const result = await actPage.tc01_uiWalkthrough(SCREENSHOTS_DIR, data);

    expect(result.historyBtnVisible).toBe(true);
    expect(result.activateBtnVisible).toBe(true);
    expect(result.gridVisible).toBe(true);
    expect(result.headerText).toMatch(/Description|Department|Level|POG|Status|Type|Date/i);
    expect(result.paginatorAttached).toBe(true);
    expect(result.pageSizeSelectAttached).toBe(true);
    expect(result.paginatorLabelAttached).toBe(true);
    expect(result.prevBtnAttached).toBe(true);
    expect(result.nextBtnAttached).toBe(true);
    if (result.rowCount === 0) expect(result.errorMsg).toContain(data.expectedErrorMsg);
  });

  // ── PLN_WTC02 ──────────────────────────────────────────────────────────────
  test('PLN_WTC02 - Activation grid key negative validations (consolidated)', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC02')!;
    const result = await actPage.tc02_negativeValidations(SCREENSHOTS_DIR, data);

    if (result.rowCount === 0) {
      expect(result.priorErrorBannerVisible).toBe(true);
      expect(result.priorErrorMsg).toContain(data.expectedErrorMsg);
    }
    if (result.postActivateErrorBannerVisible) {
      expect(
        result.postActivateErrorMsg.includes(data.expectedErrorMsg) ||
        result.postActivateErrorMsg.includes(data.expectedNoSelectionMsg)
      ).toBe(true);
    }
    expect(result.gridStable).toBe(true);
  });

  // ── PLN_WTC03 ──────────────────────────────────────────────────────────────
  test('PLN_WTC03 - Business/E2E: Pending activation to History verification and Finalize', async () => {
    test.setTimeout(120000);
    const result = await actPage.tc03_e2eActivation(SCREENSHOTS_DIR);

    expect(result.gridVisible).toBe(true);
    if (result.noRecords) {
      await expect(actPage.errorBanner).toBeVisible();
    }
  });

  // ── PLN_WTC04 ──────────────────────────────────────────────────────────────
  test('PLN_WTC04 - Activation History no-record behavior', async () => {
    const result = await actPage.tc04_historyBehavior(SCREENSHOTS_DIR);

    expect(result.activePaneVisible).toBe(true);
    expect(result.gridRestoredAfterBack).toBe(true);
    if (result.bannerMsg) expect(result.bannerMsg.length).toBeGreaterThan(0);
  });

  // ── PLN_WTC05 ──────────────────────────────────────────────────────────────
  test('PLN_WTC05 - Activation service failure/offline resilience', async () => {
    test.setTimeout(90000);
    const result = await actPage.tc05_offlineResilience(SCREENSHOTS_DIR, context, cfg.username, cfg.password);

    expect(result.uiStableOffline).toBe(true);
    expect(result.gridRestoredOnline).toBe(true);
  });

  // ── PLN_WTC06 ──────────────────────────────────────────────────────────────
  test('PLN_WTC06 - De-Activation screen UI walkthrough (consolidated)', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC06')!;
    const result = await deactPage.tc06_uiWalkthrough(SCREENSHOTS_DIR, data);

    expect(result.historyBtnVisible).toBe(true);
    expect(result.deactivateBtnVisible).toBe(true);
    expect(result.gridVisible).toBe(true);
    expect(result.headerText).toMatch(/Description|Department|Level|POG|Status|Date|Deactivat/i);
    expect(result.checkboxHeaderVisible).toBe(true);
    expect(result.paginatorAttached).toBe(true);
    expect(result.pageSizeSelectAttached).toBe(true);
    expect(result.paginatorLabelAttached).toBe(true);
    if (result.rowCount === 0) expect(result.errorMsg).toContain(data.expectedErrorMsg);
  });

  // ── PLN_WTC07 ──────────────────────────────────────────────────────────────
  test('PLN_WTC07 - De-Activation negative validations (consolidated)', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC07')!;
    const result = await deactPage.tc07_negativeValidations(SCREENSHOTS_DIR, data);

    if (result.rowCount === 0) {
      expect(result.priorErrorBannerVisible).toBe(true);
      expect(result.priorErrorMsg).toContain(data.expectedErrorMsg);
    }
    if (result.postDeactivateErrorBannerVisible) {
      expect(
        result.postDeactivateErrorMsg.includes(data.expectedErrorMsg) ||
        result.postDeactivateErrorMsg.includes(data.expectedNoSelectionMsg)
      ).toBe(true);
    }
    expect(result.gridStable).toBe(true);
  });

  // ── PLN_WTC08 ──────────────────────────────────────────────────────────────
  test('PLN_WTC08 - Business/E2E: Deactivate records and verify in Deactivation History', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC08')!;
    const result = await deactPage.tc08_e2eDeactivation(SCREENSHOTS_DIR, data);

    if (result.noRecords) {
      await expect(deactPage.errorBanner).toBeVisible();
    } else {
      if (result.successMsg) expect(result.successMsg).toContain(data.expectedSuccessMsg);
      expect(result.gridRestoredAfterBack).toBe(true);
    }
  });

  // ── PLN_WTC09 ──────────────────────────────────────────────────────────────
  test('PLN_WTC09 - Deactivation History no-record behavior', async () => {
    const result = await deactPage.tc09_historyBehavior(SCREENSHOTS_DIR);

    expect(result.activePaneVisible).toBe(true);
    expect(result.gridRestoredAfterBack).toBe(true);
    if (result.bannerMsg) expect(result.bannerMsg.length).toBeGreaterThan(0);
  });

  // ── PLN_WTC10 ──────────────────────────────────────────────────────────────
  test('PLN_WTC10 - Validate Activation and Deactivation stay as separate flows', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC10')!;

    // Step 1 – Activation flow
    await actPage.navigateToActivation();
    expect(page.url()).toContain(data.activationRoute);
    await expect(actPage.activateBtn).toBeVisible();
    await expect(actPage.gridContainer).toBeVisible();
    await actPage.takeScreenshot(SCREENSHOTS_DIR, 'PLN_WTC10_01_activation_flow');

    // Step 2 – Deactivation flow
    await deactPage.navigateToDeactivation();
    expect(page.url()).toContain(data.deactivationRoute);
    await expect(deactPage.deactivateBtn).toBeVisible();
    await expect(deactPage.gridContainer).toBeVisible();
    await deactPage.takeScreenshot(SCREENSHOTS_DIR, 'PLN_WTC10_02_deactivation_flow');

    // Step 3 – Switch + one action each; confirm route fragments are distinct
    await actPage.navigateToActivation();
    expect(page.url()).toContain(data.activationRoute);
    await actPage.clickActivate();
    await actPage.takeScreenshot(SCREENSHOTS_DIR, 'PLN_WTC10_03_activation_action');

    await actPage.navigateToActivation();
    await deactPage.navigateToDeactivation();
    expect(page.url()).toContain(data.deactivationRoute);
    await deactPage.clickDeactivate();
    await deactPage.takeScreenshot(SCREENSHOTS_DIR, 'PLN_WTC10_04_deactivation_action');

    expect(data.activationRoute).not.toEqual(data.deactivationRoute);
    await deactPage.takeScreenshot(SCREENSHOTS_DIR, 'PLN_WTC10_05_separate_routes_confirmed');
  });

  // ── PLN_WTC11 ──────────────────────────────────────────────────────────────
  test('PLN_WTC11 - Activation History grid columns and records', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC11')!;
    const result = await actPage.tc11_activationHistoryColumns(SCREENSHOTS_DIR);

    expect(result.historyGridVisible).toBe(true);
    expect(result.hasDescriptionCol).toBe(true);
    expect(result.hasDepartmentCol).toBe(true);
    expect(result.hasLevelCol).toBe(true);
    expect(result.hasPogIdCol).toBe(true);
    expect(result.hasStatusCol).toBe(true);
    expect(result.hasPogTypeCol).toBe(true);
    expect(result.hasStartDateCol).toBe(true);
    expect(result.hasSetDateCol).toBe(true);
    expect(result.rowCount).toBeGreaterThanOrEqual(0);
    expect(result.gridRestoredAfterBack).toBe(true);
  });

  // ── PLN_WTC12 ──────────────────────────────────────────────────────────────
  test('PLN_WTC12 - Deactivation History grid columns (no POG Type)', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC12')!;
    const result = await deactPage.tc12_deactivationHistoryColumns(SCREENSHOTS_DIR);

    expect(result.historyGridVisible).toBe(true);
    expect(result.hasDescriptionCol).toBe(true);
    expect(result.hasDepartmentCol).toBe(true);
    expect(result.hasLevelCol).toBe(true);
    expect(result.hasPogIdCol).toBe(true);
    expect(result.hasStatusCol).toBe(true);
    expect(result.hasPogTypeCol).toBe(false);
    expect(result.hasStartDateCol).toBe(true);
    expect(result.hasSetDateCol).toBe(true);
    expect(result.rowCount).toBeGreaterThanOrEqual(0);
    expect(result.gridRestoredAfterBack).toBe(true);
  });

  // ── PLN_WTC13 ──────────────────────────────────────────────────────────────
  test('PLN_WTC13 - Activation grid filter with no-match text shows zero rows', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC13')!;
    const result = await actPage.tc13_activationFilterNoMatch(SCREENSHOTS_DIR, data);

    expect(result.initialRowCount).toBeGreaterThanOrEqual(0);
    expect(result.filteredRowCount).toBe(0);
    expect(result.filterCleared).toBe(true);
  });

  // ── PLN_WTC14 ──────────────────────────────────────────────────────────────
  test('PLN_WTC14 - Deactivation grid filter with no-match text shows zero rows', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC14')!;
    const result = await deactPage.tc14_deactivationFilterNoMatch(SCREENSHOTS_DIR, data);

    expect(result.initialRowCount).toBeGreaterThanOrEqual(0);
    expect(result.filteredRowCount).toBe(0);
    expect(result.filterCleared).toBe(true);
  });

  // ── PLN_WTC15 ──────────────────────────────────────────────────────────────
  test('PLN_WTC15 - Activation Actions panel collapse and expand', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC15')!;
    const result = await actPage.tc15_actionsPanelCollapseExpand(SCREENSHOTS_DIR);

    expect(result.actionsPanelCollapsed).toBe(true);
    expect(result.historyBtnHiddenAfterCollapse).toBe(true);
    expect(result.actionsPanelExpandedAgain).toBe(true);
    expect(result.historyBtnVisibleAfterExpand).toBe(true);
  });

  // ── PLN_WTC16 ──────────────────────────────────────────────────────────────
  test('PLN_WTC16 - Activation History grid filter functionality', async () => {
    const data = planogramData.find(r => r.testCase === 'PLN_WTC16')!;
    const result = await actPage.tc16_activationHistoryFilter(SCREENSHOTS_DIR, data);

    expect(result.historyGridVisible).toBe(true);
    expect(result.filteredRowCount).toBe(0);
    expect(result.filterClearedRowCount).toBeGreaterThanOrEqual(0);
    expect(result.gridStable).toBe(true);
  });
});
