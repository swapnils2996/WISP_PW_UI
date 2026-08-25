/**
 * Deployment Utilities — Playwright TypeScript test suite
 *
 * Covers test cases from WISP_WebApp_Automatable_TestCases.xlsx:
 *   DU_DRL_WTC01, WTC03, WTC04  : Disable RF Load
 *   DU_ERL_WTC01, WTC03, WTC04  : Enable RF Load
 *   DU_TC_WTC01, WTC03-05       : Time Clock
 *
 * Navigation: DU pages are commented out in the main nav.
 * Tests open them via Angular component method injection:
 *   ng.probe(app-main).componentInstance.openXxxPage()
 *
 * Lock numbers (sourced from component HTML and testData.xlsx Reports sheet):
 *   Disable RF Load : 70606
 *   Enable RF Load  : 6803
 *   Time Clock      : 61810
 */
import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { DeploymentUtilitiesPage } from '../pages/DeploymentUtilitiesPage';
import { getDeploymentUtilitiesTestData, DeploymentUtilitiesTestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { addPageRecovery } from '../utils/pageRecovery';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'deploymentUtilities');

test.describe('Deployment Utilities', () => {
  let page: Page;
  let context: BrowserContext;
  let duData: DeploymentUtilitiesTestData;
  let duPage: DeploymentUtilitiesPage;
  const cfg = getConfig();

  addPageRecovery(
    () => ({ context, page }),
    (ctx, pg) => { context = ctx; page = pg; duPage = new DeploymentUtilitiesPage(pg); }
  );

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
    const rows = await getDeploymentUtilitiesTestData();
    duData = rows[0];
    context = await browser.newContext();
    page = await context.newPage();
    duPage = new DeploymentUtilitiesPage(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await page.waitForTimeout(2000);

    // Open all three DU pages via Angular injection (sidebar click enters zone)
    try {
      await page.evaluate(() => {
        const launcher = document.querySelector('.sidebar-launcher') as HTMLElement | null;
        if (launcher) launcher.click();
        const appMain = document.querySelector('app-main');
        if (!appMain) return;
        const comp = (window as any).ng.probe(appMain)?.componentInstance;
        if (!comp) return;
        if (comp.openDisableRFLoadPage) comp.openDisableRFLoadPage();
        if (comp.openEnableRFLoadPage)  comp.openEnableRFLoadPage();
        if (comp.openTimeClockPage)     comp.openTimeClockPage();
      });
    } catch (e) {
      console.warn('[beforeAll] Angular injection failed, tests will attempt to run independently:', (e as Error).message);
    }
    await page.waitForTimeout(2500);
    // Close sidebar if open
    const sidebar = page.locator('#sideMenu');
    if (await sidebar.isVisible()) await page.mouse.click(700, 300);
  });

  test.afterAll(async () => { await context.close(); });

  // ══════════════════════════════════════════════════════════════════════════
  // DISABLE RF LOAD
  // ══════════════════════════════════════════════════════════════════════════

  // ── DU_DRL_WTC01 ──────────────────────────────────────────────────────────
  // Load Disable RF Load page and verify lock number 70606 with input + Enter button
  test('DU_DRL_WTC01 - Load Disable RF Load page and verify lock number 70606', async () => {
    const result = await duPage.tc_drl01_loadPage(SCREENSHOTS_DIR, duData);

    expect(result.tabOpened,
      'app-disable-rfload component should be visible after navigation').toBe(true);
    expect(result.lockNumberVisible,
      'Lock number 70606 should be visible on Disable RF Load page').toBe(true);
    expect(result.lockNumberText,
      'Lock number text should be "70606"').toBe(duData.disableRFLockNo || '70606');
    expect(result.lockKeyInputVisible,
      'Lock Key input field should be visible').toBe(true);
    expect(result.enterBtnVisible,
      'Enter button should be visible').toBe(true);
    expect(result.enterBtnEnabled,
      'Enter button should be enabled (not disabled by default)').toBe(true);
  });

  // ── DU_DRL_WTC03 ──────────────────────────────────────────────────────────
  // Negative: Clicking Enter with empty lock key field should not submit
  test('DU_DRL_WTC03 - Clicking Enter with empty lock key on Disable RF Load - no submission', async () => {
    const result = await duPage.tc_drl03_emptyLockKey(SCREENSHOTS_DIR);

    expect(result.inputIsEmpty,
      'Lock Key input should be empty before clicking Enter').toBe(true);
    expect(result.enterBtnClicked,
      'Enter button should be clickable even when input is empty').toBe(true);
    expect(result.pageStableAfterClick,
      'Page should remain stable after Enter with empty input').toBe(true);
    expect(result.lockNumberStillVisible,
      'Lock number 70606 should still be visible after failed Enter click').toBe(true);
    expect(result.inputStillVisible,
      'Lock Key input should still be visible after failed Enter click').toBe(true);
  });

  // ── DU_DRL_WTC04 ──────────────────────────────────────────────────────────
  // Offline behavior: page should remain stable; lock number visible after network restore
  test('DU_DRL_WTC04 - Offline mode: Disable RF Load page remains stable', async () => {
    const result = await duPage.tc_drl04_offline(SCREENSHOTS_DIR, context);

    expect(result.offlineSet,
      'Context should have been set to offline successfully').toBe(true);
    expect(result.enterClickedOffline,
      'Enter button should be clickable while offline').toBe(true);
    expect(result.pageStableOffline,
      'app-disable-rfload should remain visible while offline').toBe(true);
    expect(result.networkRestored,
      'Network should have been restored after offline test').toBe(true);
    expect(result.panelVisibleAfterRestore,
      'Panel should be visible after network restore').toBe(true);
    expect(result.lockNumberAfterRestore,
      'Lock number 70606 should be visible after network restore').toBe(duData.disableRFLockNo || '70606');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ENABLE RF LOAD
  // ══════════════════════════════════════════════════════════════════════════

  // ── DU_ERL_WTC01 ──────────────────────────────────────────────────────────
  // Load Enable RF Load page and verify lock number 6803
  test('DU_ERL_WTC01 - Load Enable RF Load page and verify lock number 6803', async () => {
    const result = await duPage.tc_erl01_loadPage(SCREENSHOTS_DIR, duData);

    expect(result.tabOpened,
      'app-enable-rfload component should be visible after navigation').toBe(true);
    expect(result.lockNumberVisible,
      'Lock number 6803 should be visible on Enable RF Load page').toBe(true);
    expect(result.lockNumberText,
      'Lock number text should be "6803"').toBe(duData.enableRFLockNo || '6803');
    expect(result.lockKeyInputVisible,
      'Lock Key input field should be visible').toBe(true);
    expect(result.enterBtnVisible,
      'Enter button should be visible').toBe(true);
    expect(result.enterBtnEnabled,
      'Enter button should be enabled by default').toBe(true);
  });

  // ── DU_ERL_WTC03 ──────────────────────────────────────────────────────────
  // Negative: Empty lock key click on Enable RF Load
  test('DU_ERL_WTC03 - Clicking Enter with empty lock key on Enable RF Load - no submission', async () => {
    const result = await duPage.tc_erl03_emptyLockKey(SCREENSHOTS_DIR);

    expect(result.inputIsEmpty,
      'Lock Key input should be empty before clicking Enter').toBe(true);
    expect(result.enterBtnClicked,
      'Enter button should be clickable when input is empty').toBe(true);
    expect(result.pageStableAfterClick,
      'Page should remain stable after Enter with empty input').toBe(true);
    expect(result.lockNumberStillVisible,
      'Lock number 6803 should still be visible after failed click').toBe(true);
    expect(result.inputStillVisible,
      'Lock Key input should still be present after failed click').toBe(true);
  });

  // ── DU_ERL_WTC04 ──────────────────────────────────────────────────────────
  // Offline behavior on Enable RF Load
  test('DU_ERL_WTC04 - Offline mode: Enable RF Load page remains stable', async () => {
    const result = await duPage.tc_erl04_offline(SCREENSHOTS_DIR, context);

    expect(result.offlineSet,
      'Context should have been set to offline successfully').toBe(true);
    expect(result.enterClickedOffline,
      'Enter button should be clickable while offline').toBe(true);
    expect(result.pageStableOffline,
      'app-enable-rfload should remain visible while offline').toBe(true);
    expect(result.networkRestored,
      'Network should have been restored after offline test').toBe(true);
    expect(result.panelVisibleAfterRestore,
      'Panel should be visible after network restore').toBe(true);
    expect(result.lockNumberAfterRestore,
      'Lock number 6803 should be visible after network restore').toBe(duData.enableRFLockNo || '6803');
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TIME CLOCK
  // ══════════════════════════════════════════════════════════════════════════

  // ── DU_TC_WTC01 ───────────────────────────────────────────────────────────
  // Load Time Clock page and verify lock number 61810
  test('DU_TC_WTC01 - Load Time Clock page and verify lock number 61810', async () => {
    const result = await duPage.tc_tc01_loadPage(SCREENSHOTS_DIR, duData);

    expect(result.tabOpened,
      'app-time-clock component should be visible after navigation').toBe(true);
    expect(result.lockNumberVisible,
      'Lock number 61810 should be visible on Time Clock page').toBe(true);
    expect(result.lockNumberText,
      'Lock number text should be "61810"').toBe(duData.timeClockLockNo || '61810');
    expect(result.lockKeyInputVisible,
      'Lock Key input field should be visible').toBe(true);
    expect(result.enterBtnVisible,
      'Enter button should be visible').toBe(true);
    expect(result.enterBtnEnabled,
      'Enter button should be enabled by default').toBe(true);
  });

  // ── DU_TC_WTC03 ───────────────────────────────────────────────────────────
  // Negative: Empty lock key click on Time Clock
  test('DU_TC_WTC03 - Clicking Enter with empty lock key on Time Clock - no submission', async () => {
    const result = await duPage.tc_tc03_emptyLockKey(SCREENSHOTS_DIR);

    expect(result.inputIsEmpty,
      'Lock Key input should be empty before clicking Enter').toBe(true);
    expect(result.enterBtnClicked,
      'Enter button should be clickable when input is empty').toBe(true);
    expect(result.pageStableAfterClick,
      'Page should remain stable after Enter with empty input').toBe(true);
    expect(result.lockNumberStillVisible,
      'Lock number 61810 should still be visible after failed click').toBe(true);
    expect(result.inputStillVisible,
      'Lock Key input should still be present after failed click').toBe(true);
  });

  // ── DU_TC_WTC04 ───────────────────────────────────────────────────────────
  // Offline behavior on Time Clock
  test('DU_TC_WTC04 - Offline mode: Time Clock page remains stable', async () => {
    const result = await duPage.tc_tc04_offline(SCREENSHOTS_DIR, context);

    expect(result.offlineSet,
      'Context should have been set to offline successfully').toBe(true);
    expect(result.enterClickedOffline,
      'Enter button should be clickable while offline').toBe(true);
    expect(result.pageStableOffline,
      'app-time-clock should remain visible while offline').toBe(true);
    expect(result.networkRestored,
      'Network should have been restored after offline test').toBe(true);
    expect(result.panelVisibleAfterRestore,
      'Panel should be visible after network restore').toBe(true);
    expect(result.lockNumberAfterRestore,
      'Lock number 61810 should be visible after network restore').toBe(duData.timeClockLockNo || '61810');
  });

  // ── DU_TC_WTC05 ───────────────────────────────────────────────────────────
  // Edge/boundary: long string input, rapid Enter clicks, all Enter buttons enabled
  test('DU_TC_WTC05 - Edge boundary: long input string, rapid Enter clicks, button states across 3 pages', async () => {
    const result = await duPage.tc_tc05_edgeBoundary(SCREENSHOTS_DIR, context, duData);

    expect(result.longStringEntered,
      'Lock Key input should accept very long string (500 chars)').toBe(true);
    expect(result.pageStableAfterLong,
      'Page should remain stable after long string entry + Enter click').toBe(true);
    expect(result.rapidClicksCompleted,
      'Multiple rapid Enter clicks should complete without crash').toBe(true);
    expect(result.pageStableAfterRapid,
      'Page should remain stable after 5 rapid Enter clicks').toBe(true);

    expect(result.disableRFBtnEnabled,
      'Disable RF Load Enter button should be enabled (not conditionally disabled)').toBe(true);
    expect(result.enableRFBtnEnabled,
      'Enable RF Load Enter button should be enabled (not conditionally disabled)').toBe(true);
    expect(result.timeClockBtnEnabled,
      'Time Clock Enter button should be enabled (not conditionally disabled)').toBe(true);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // TEXT CONTENT VERIFICATION (WTC02) — appended; no prior tests modified
  // ══════════════════════════════════════════════════════════════════════════

  // ── DU_DRL_WTC02 ──────────────────────────────────────────────────────────
  // Verify all visible text labels and description paragraph on Disable RF Load
  test('DU_DRL_WTC02 - Verify panel heading, h5, description and field labels on Disable RF Load', async () => {
    const result = await duPage.tc_drl02_verifyTextContent(SCREENSHOTS_DIR);

    expect(result.panelHeadingText,
      'Panel heading should contain "Lock Key Required"').toContain('Lock Key Required');
    expect(result.h5HeadingText,
      'H5 heading should read "LOCK KEY REQUIRED"').toBe('LOCK KEY REQUIRED');
    expect(result.descriptionContainsCallText,
      'Description should include "Please call the support desk"').toBe(true);
    expect(result.lockKeyLabelVisible,
      '"Lock Key :" label should appear beside the input field').toBe(true);
    expect(result.lockNumberLabelVisible,
      '"Lock Number :" label should appear beside the lock number value').toBe(true);
  });

  // ── DU_ERL_WTC02 ──────────────────────────────────────────────────────────
  // Verify all visible text labels and description paragraph on Enable RF Load
  test('DU_ERL_WTC02 - Verify panel heading, h5, description and field labels on Enable RF Load', async () => {
    const result = await duPage.tc_erl02_verifyTextContent(SCREENSHOTS_DIR);

    expect(result.panelHeadingText,
      'Panel heading should contain "Lock Key Required"').toContain('Lock Key Required');
    expect(result.h5HeadingText,
      'H5 heading should read "LOCK KEY REQUIRED"').toBe('LOCK KEY REQUIRED');
    expect(result.descriptionContainsCallText,
      'Description should include "Please call the support desk"').toBe(true);
    expect(result.lockKeyLabelVisible,
      '"Lock Key :" label should appear beside the input field').toBe(true);
    expect(result.lockNumberLabelVisible,
      '"Lock Number :" label should appear beside the lock number value').toBe(true);
  });

  // ── DU_TC_WTC02 ───────────────────────────────────────────────────────────
  // Verify all visible text labels and description paragraph on Time Clock
  test('DU_TC_WTC02 - Verify panel heading, h5, description and field labels on Time Clock', async () => {
    const result = await duPage.tc_tc02_verifyTextContent(SCREENSHOTS_DIR);

    expect(result.panelHeadingText,
      'Panel heading should contain "Lock Key Required"').toContain('Lock Key Required');
    expect(result.h5HeadingText,
      'H5 heading should read "LOCK KEY REQUIRED"').toBe('LOCK KEY REQUIRED');
    expect(result.descriptionContainsCallText,
      'Description should include "Please call the support desk"').toBe(true);
    expect(result.lockKeyLabelVisible,
      '"Lock Key :" label should appear beside the input field').toBe(true);
    expect(result.lockNumberLabelVisible,
      '"Lock Number :" label should appear beside the lock number value').toBe(true);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // KEYBOARD ENTER SUBMISSION (WTC05 for DRL and ERL)
  // ══════════════════════════════════════════════════════════════════════════

  // ── DU_DRL_WTC05 ──────────────────────────────────────────────────────────
  // Pressing the Enter key inside the input field should behave like the Enter button
  test('DU_DRL_WTC05 - Keyboard Enter key in input field on Disable RF Load keeps page stable', async () => {
    const result = await duPage.tc_drl05_keyboardEnter(SCREENSHOTS_DIR);

    expect(result.inputFilled,
      'Lock Key input should accept a typed value via JS').toBe(true);
    expect(result.enterKeyPressed,
      'Enter key events should be dispatched to the input element').toBe(true);
    expect(result.pageStableAfterEnter,
      'Page should remain stable after pressing Enter in the input').toBe(true);
    expect(result.componentStillVisible,
      'app-disable-rfload component should still be present after Enter key press').toBe(true);
  });

  // ── DU_ERL_WTC05 ──────────────────────────────────────────────────────────
  // Pressing the Enter key inside the input field should behave like the Enter button
  test('DU_ERL_WTC05 - Keyboard Enter key in input field on Enable RF Load keeps page stable', async () => {
    const result = await duPage.tc_erl05_keyboardEnter(SCREENSHOTS_DIR);

    expect(result.inputFilled,
      'Lock Key input should accept a typed value via JS').toBe(true);
    expect(result.enterKeyPressed,
      'Enter key events should be dispatched to the input element').toBe(true);
    expect(result.pageStableAfterEnter,
      'Page should remain stable after pressing Enter in the input').toBe(true);
    expect(result.componentStillVisible,
      'app-enable-rfload component should still be present after Enter key press').toBe(true);
  });
});
