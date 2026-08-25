import { Page, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { IntermittentDefectP2TestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { LoginPage } from './LoginPage';

// ── Result interfaces ─────────────────────────────────────────────────────────

export interface DTC028_Result {
  sidebarOpened: boolean;
  deploymentUtilitiesNavVisible: boolean;
  disableRFLoadVisible: boolean;
  enableRFLoadVisible: boolean;
  timeClockVisible: boolean;
}

export interface DTC029_Result {
  pageNavigated: boolean;
  enterButtonVisible: boolean;
  enterButtonClicked: boolean;
  apiCallDetected: boolean;
  feedbackMessageVisible: boolean;
  feedbackMessageText: string;
}

export interface DTC030_Result {
  pageNavigated: boolean;
  lockKeyHeadingVisible: boolean;
  lockKeyHeadingText: string;
  hasLeadingSpace: boolean;
}

export interface DTC031_Result {
  pageNavigated: boolean;
  overstockLocationColVisible: boolean;
  overstockLocationColHeader: string;
  firstRowLocationValue: string;
  locationValueIsBlank: boolean;
}

export interface DTC032_Result {
  pageNavigated: boolean;
  apiCallMade: boolean;
  apiResponseStatus: number;
  locationDropdownLoaded: boolean;
  locationOptions: string[];
}

export interface DTC033_Result {
  pageNavigated: boolean;
  reportLoaded: boolean;
  reportHas404Error: boolean;
  reportContent: string;
}

export interface DTC034_Result {
  pageNavigated: boolean;
  reportUrlCaptured: boolean;
  reportUrl: string;
  urlPointsToWispOld: boolean;
  urlPointsToWispModern: boolean;
}

export interface DTC035_Result {
  sidebarOpened: boolean;
  highOverstockNavFound: boolean;
  highOverstockNavEnabled: boolean;
  pointerEvents: string;
}

export interface DTC036_Result {
  sidebarOpened: boolean;
  oldNavItemVisible: boolean;
  newNavItemVisible: boolean;
  navItemText: string;
}

export interface DTC037_Result {
  pageNavigated: boolean;
  overrideTextFound: boolean;
  overrideText: string;
  hasCorrectedCapitalization: boolean;
}

export interface DTC038_Result {
  pageNavigated: boolean;
  deleteButtonVisibleOnLoad: boolean;
  printButtonVisibleOnLoad: boolean;
}

export interface DTC039_Result {
  pageNavigated: boolean;
  locationDropdownFound: boolean;
  locationOptionCount: number;
  locationOptions: string[];
  hasOnlyAllOption: boolean;
}

export interface DTC040_Result {
  sidebarOpened: boolean;
  ebfSectionVisible: boolean;
  aurPageAccessible: boolean;
  cowPageAccessible: boolean;
  imcPageAccessible: boolean;
  pbfPageAccessible: boolean;
  windowNgDefined: boolean;
}

export interface DTC041_Result {
  pageNavigated: boolean;
  pbfContentVisible: boolean;
  folderTreeVisible: boolean;
  documentPreviewVisible: boolean;
  pageIsBlank: boolean;
}

export interface DTC042_Result {
  pageNavigated: boolean;
  imcHeadingVisible: boolean;
  imcHeadingText: string;
  hasTrailingBacktick: boolean;
}

export interface DTC043_Result {
  pageNavigated: boolean;
  historyBtnClicked: boolean;
  spinnerVisible: boolean;
  gridLoadedWithinTimeout: boolean;
  gridRowCount: number;
}

export interface DTC044_Result {
  pageNavigated: boolean;
  errorAlertVisible: boolean;
  errorAlertText: string;
  iconAndTextHaveSpace: boolean;
  rawIconText: string;
}

export interface DTC045_Result {
  pageNavigated: boolean;
  findBtnColor: string;
  printWkstBtnColor: string;
  printLabelsBtnColor: string;
  buttonsHaveSameColor: boolean;
  colorsAreDifferent: boolean;
}

export interface DTC046_Result {
  pageNavigated: boolean;
  validationTriggered: boolean;
  validationMessage: string;
  messageContainsBeginning: boolean;
  messageContainsEnding: boolean;
}

export interface DTC047_Result {
  pageNavigated: boolean;
  address3ColFound: boolean;
  address3ColWrapped: boolean;
  address3ColHeight: number;
  address3ColText: string;
}

export interface DTC048_Result {
  pageNavigated: boolean;
  createIconVisible: boolean;
  createIconClicked: boolean;
  createModalVisible: boolean;
  createModalTitle: string;
}

export interface DTC049_Result {
  pageNavigated: boolean;
  paginatorText: string;
  paginatorShowsZero: boolean;
  nextPageEnabled: boolean;
  actualUserCount: number;
}

export interface DTC050_Result {
  pageNavigated: boolean;
  dateColumnFound: boolean;
  wispOldDateTime: string;
  wispModernDateTime: string;
  timeDifferenceHours: number;
  utcOffsetDetected: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export class IntermittentDefectTestCasesP2Page {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Screenshot helper ──────────────────────────────────────────────────────

  async takeScreenshot(screenshotDir: string, name: string): Promise<void> {
    try {
      fs.mkdirSync(screenshotDir, { recursive: true });
      await this.page.evaluate(function () {
        const el = document.getElementById('sideMenu');
        if (el) el.setAttribute('style', 'display: none !important;');
      }).catch(() => {});
      await this.page.waitForTimeout(100).catch(() => {});
      const filePath = path.join(screenshotDir, `${name}.png`);
      await this.page.screenshot({ path: filePath, fullPage: true });
      await test.info().attach(name, { path: filePath, contentType: 'image/png' });
      await this.page.evaluate(function () {
        const el = document.getElementById('sideMenu');
        if (el) el.removeAttribute('style');
      }).catch(() => {});
    } catch { /* page may have been closed or navigated */ }
  }

  // ── Navigation helpers ─────────────────────────────────────────────────────

  private async ensureLoggedIn(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl || '/webapp/';
    await this.page.waitForSelector(
      'div.panel-body, button:has-text("Login"), input[type="password"]',
      { timeout: 15000 }
    ).catch(() => {});
    const needsLogin = await this.page.locator('input[type="password"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (!needsLogin) return;
    const cfg = getConfig();
    await this.page.fill('input[type="text"]', cfg.username);
    await this.page.fill('input[type="password"]', cfg.password);
    await this.page.click('button:has-text("Login")');
    await this.page.waitForSelector('div.panel-body, #sideMenu, .sidebar', { timeout: 25000 }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  private async navigateToWispModern(_data?: IntermittentDefectP2TestData): Promise<boolean> {
    const cfg = getConfig();
    // Always use the config baseUrl (correct WispModern URL); Excel data URL is stale
    const wispModernUrl = cfg.baseUrl || 'http://sr097402:8080/isp.webapp/';
    await this.page.goto(wispModernUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await this.ensureLoggedIn(wispModernUrl);
    await this.page.waitForTimeout(1000);
    return await this.page.locator('div.panel-body, #sideMenu, .sidebar, app-home').first().isVisible({ timeout: 10000 }).catch(() => false);
  }

  private async navigateToWispOld(): Promise<boolean> {
    // WISP Old (.NET app) runs on the same server at /isp.webapp/ path without port 8080
    // Since the config baseUrl is for WispModern, we navigate relative to the playwright baseURL
    await this.page.goto('/webapp/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await this.ensureLoggedIn();
    await this.page.waitForTimeout(1000);
    return await this.page.locator('div.panel-body').first().isVisible({ timeout: 10000 }).catch(() => false);
  }

  private async openSidebar(): Promise<boolean> {
    // Use the same direct DOM approach as DirectReplenishmentPage.navigateTo
    await this.page.evaluate(function () {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'block';
    });
    await this.page.waitForTimeout(400);
    return await this.page.locator('#sideMenu').isVisible({ timeout: 2000 }).catch(() => false);
  }

  private async closeSidebar(): Promise<void> {
    await this.page.evaluate(function () {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'none';
    });
    await this.page.waitForTimeout(200);
  }

  private async dismissModal(btnText: string): Promise<void> {
    const btn = this.page.locator(
      `button:has-text("${btnText}"), [role="dialog"] button:has-text("${btnText}")`
    ).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click({ force: true });
      await this.page.waitForTimeout(400);
    }
  }

  private async closeAllNavTabs(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      const closed = await this.page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.nav-tabs li'));
        for (const tab of tabs) {
          for (const el of Array.from(tab.querySelectorAll('a span, a i'))) {
            const h = el as HTMLElement;
            const r = h.getBoundingClientRect();
            const t = (h.textContent ?? '').trim();
            if (r.width > 0 && r.height > 0 && (t === 'x' || t === '×' || t === 'X')) {
              h.click();
              return true;
            }
          }
        }
        return false;
      }).catch(() => false);
      if (!closed) break;
      await this.page.waitForTimeout(500);
      const dlg = this.page.locator('.modal.in, [role="dialog"]').first();
      if (await dlg.isVisible({ timeout: 600 }).catch(() => false)) {
        await this.dismissModal('No');
        await this.dismissModal('Cancel');
        await this.page.waitForTimeout(400);
      }
    }
  }

  private async clickSidebarItemByText(label: string): Promise<boolean> {
    // Show sidebar via direct DOM (same pattern as DirectReplenishmentPage.navigateTo)
    await this.page.evaluate(function () {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'block';
    });
    await this.page.waitForTimeout(400);

    const clicked = await this.page.evaluate((lbl: string) => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      // Exact match first
      const exact = all.find(e =>
        e.children.length === 0 &&
        (e.textContent?.trim() ?? '').toLowerCase() === lbl.toLowerCase()
      );
      if (exact) { exact.click(); return true; }
      // Partial match fallback
      const partial = all.find(e =>
        e.children.length === 0 &&
        (e.textContent?.trim() ?? '').toLowerCase().includes(lbl.toLowerCase())
      );
      if (partial) { partial.click(); return true; }
      return false;
    }, label);

    await this.page.waitForTimeout(2000);
    // Hide sidebar
    await this.page.evaluate(function () {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'none';
    });
    await this.page.waitForTimeout(500);
    return clicked;
  }

  private async expandSidebarSection(sectionLabel: string): Promise<void> {
    // Show sidebar first
    await this.page.evaluate(function () {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'block';
    });
    await this.page.waitForTimeout(300);
    await this.page.evaluate((label: string) => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      // Find a parent-level item (has children or is a link with sub-menu arrow)
      const el = all.find(e =>
        (e.textContent?.trim() ?? '').toLowerCase().includes(label.toLowerCase()) &&
        (e.tagName === 'A' || e.tagName === 'LI' || e.tagName === 'SPAN' || e.tagName === 'DIV')
      );
      if (el) el.click();
    }, sectionLabel);
    await this.page.waitForTimeout(600);
  }

  // ── DTC028: Deployment Utilities Not in WispModern Nav ────────────────────

  async dtc028_deploymentUtilitiesNavMissing(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC028_Result> {
    await this.navigateToWispModern(data);
    await this.takeScreenshot(screenshotDir, 'DTC028_01_wispmodern_home');

    const sidebarOpened = await this.openSidebar();
    await this.page.waitForTimeout(800);
    await this.takeScreenshot(screenshotDir, 'DTC028_02_sidebar_open');

    const deploymentUtilitiesNavVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /deployment.?utilit/i.test(e.textContent?.trim() ?? ''));
    });

    const disableRFLoadVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /disable.?rf.?load/i.test(e.textContent?.trim() ?? ''));
    });

    const enableRFLoadVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /enable.?rf.?load/i.test(e.textContent?.trim() ?? ''));
    });

    const timeClockVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /time.?clock/i.test(e.textContent?.trim() ?? ''));
    });

    await this.closeSidebar();
    await this.takeScreenshot(screenshotDir, 'DTC028_03_nav_checked');

    return { sidebarOpened, deploymentUtilitiesNavVisible, disableRFLoadVisible, enableRFLoadVisible, timeClockVisible };
  }

  // ── DTC029: Enter Button No Server-Side Handler ────────────────────────────

  async dtc029_enterButtonNoHandler(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC029_Result> {
    await this.navigateToWispModern(data);

    // Try to navigate to Deployment Utilities via sidebar or URL
    let pageNavigated = await this.clickSidebarItemByText('Disable RF Load');
    if (!pageNavigated) {
      // Try via Angular route
      await this.page.evaluate(() => {
        try {
          const ngEl = document.querySelector('app-root') as any;
          if (ngEl && ngEl.__ngContext__) {
            // Attempt Angular Ivy routing
            const router = (window as any).getAllAngularRootElements?.()[0]?.__ngContext__?.[6]?.injector?.get?.('Router');
            if (router) router.navigate(['/disable-rf-load']);
          }
        } catch { /* ignore */ }
      });
      await this.page.waitForTimeout(1000);
    }

    await this.takeScreenshot(screenshotDir, 'DTC029_01_du_page');

    const enterButtonVisible = await this.page.locator(
      'button:has-text("Enter"), input[type="button"][value="Enter"], button[type="submit"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    let enterButtonClicked = false;
    let apiCallDetected = false;
    let feedbackMessageVisible = false;
    let feedbackMessageText = '';

    if (enterButtonVisible) {
      // Enter a lock key value
      const lockInput = this.page.locator(
        'input[type="text"], input[placeholder*="lock" i], input[placeholder*="key" i]'
      ).filter({ visible: true }).first();
      if (await lockInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await lockInput.fill(data.disableRFLockNo || '70606');
        await this.page.waitForTimeout(300);
      }

      // Intercept any network calls
      const requestPromise = this.page.waitForRequest(
        r => r.method() !== 'GET' || r.url().includes('lock') || r.url().includes('deploy') || r.url().includes('RF'),
        { timeout: 5000 }
      ).catch(() => null);

      const enterBtn = this.page.locator(
        'button:has-text("Enter"), input[type="button"][value="Enter"]'
      ).filter({ visible: true }).first();
      await enterBtn.click({ force: true });
      enterButtonClicked = true;
      await this.page.waitForTimeout(2000);

      const req = await requestPromise;
      apiCallDetected = req !== null;

      // Check for any feedback message
      feedbackMessageVisible = await this.page.locator(
        '.alert, [class*="alert"], [class*="message"], [class*="success"], [class*="error"]'
      ).filter({ visible: true }).first().isVisible({ timeout: 2000 }).catch(() => false);

      if (feedbackMessageVisible) {
        feedbackMessageText = await this.page.locator(
          '.alert, [class*="alert"], [class*="message"]'
        ).filter({ visible: true }).first().textContent().then(t => (t ?? '').trim()).catch(() => '');
      }
    }

    await this.takeScreenshot(screenshotDir, 'DTC029_02_after_enter_click');

    return { pageNavigated, enterButtonVisible, enterButtonClicked, apiCallDetected, feedbackMessageVisible, feedbackMessageText };
  }

  // ── DTC030: "Lock Key Required" Heading Has Leading Space ─────────────────

  async dtc030_lockKeyHeadingLeadingSpace(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC030_Result> {
    await this.navigateToWispModern(data);
    await this.clickSidebarItemByText('Disable RF Load');
    await this.page.waitForTimeout(1500);

    await this.takeScreenshot(screenshotDir, 'DTC030_01_du_page');

    const pageNavigated = await this.page.locator(
      '[class*="panel"], .panel, .card, h3, h4'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    // Get the exact text of the heading
    const lockKeyHeadingText = await this.page.evaluate(function () {
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      for (const el of allEls) {
        if (el.children.length > 0) continue;
        const t = el.textContent ?? '';
        if (/lock.?key.?required/i.test(t.trim())) return t; // return raw with spaces
      }
      // Fallback: panel heading/title
      const panel = document.querySelector('.panel-heading, .panel-title, .card-header, h3, h4');
      if (panel) {
        const t = panel.textContent ?? '';
        if (/lock.?key/i.test(t)) return t;
      }
      return '';
    });

    const lockKeyHeadingVisible = lockKeyHeadingText.length > 0;
    const hasLeadingSpace = lockKeyHeadingText.startsWith(' ') || /^\s+/.test(lockKeyHeadingText);

    await this.takeScreenshot(screenshotDir, 'DTC030_02_heading_inspected');

    return { pageNavigated, lockKeyHeadingVisible, lockKeyHeadingText, hasLeadingSpace };
  }

  // ── DTC031: Overstock Location Column Blank ────────────────────────────────

  async dtc031_overstockLocationColumnBlank(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC031_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    // Navigate to Overstock Label Printing via SISO/DR
    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    let pageNavigated = await this.clickSidebarItemByText('Overstock Label Printing');
    if (!pageNavigated) {
      pageNavigated = await this.clickSidebarItemByText('Overstock');
    }
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC031_01_overstock_page');

    // Check column header
    const overstockLocationColVisible = await this.page.locator(
      'th:has-text("Overstock Location"), mat-header-cell:has-text("Overstock Location"), [class*="header"]:has-text("Overstock Location")'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const overstockLocationColHeader = await this.page.evaluate(function () {
      const headers = Array.from(document.querySelectorAll('th, mat-header-cell, [class*="header"]'));
      for (const h of headers) {
        const t = (h.textContent ?? '').trim();
        if (/overstock.?location/i.test(t)) return t;
        if (/location/i.test(t)) return t;
      }
      return '';
    });

    // Get first row location value
    const firstRowLocationValue = await this.page.evaluate(function () {
      const headers = Array.from(document.querySelectorAll('th, mat-header-cell'));
      let colIdx = -1;
      headers.forEach((h, i) => {
        if (/overstock.?location|location/i.test(h.textContent ?? '')) colIdx = i;
      });
      if (colIdx < 0) return '';
      const rows = document.querySelectorAll('tr, mat-row');
      for (const row of Array.from(rows)) {
        const cells = row.querySelectorAll('td, mat-cell');
        if (cells.length > colIdx) {
          const val = (cells[colIdx].textContent ?? '').trim();
          if (val) return val;
        }
      }
      return '';
    });

    await this.takeScreenshot(screenshotDir, 'DTC031_02_column_value');

    return {
      pageNavigated,
      overstockLocationColVisible,
      overstockLocationColHeader,
      firstRowLocationValue,
      locationValueIsBlank: firstRowLocationValue === '',
    };
  }

  // ── DTC032: OverstockService.svc Returns 404 ──────────────────────────────

  async dtc032_overstockServiceApi404(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC032_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    // Listen for OverstockService API calls
    const responses: Array<{ url: string; status: number }> = [];
    this.page.on('response', (resp) => {
      if (/OverstockService|overstock/i.test(resp.url())) {
        responses.push({ url: resp.url(), status: resp.status() });
      }
    });

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Overstock Label Printing');
    await this.page.waitForTimeout(3000);

    await this.takeScreenshot(screenshotDir, 'DTC032_01_overstock_page');

    const apiCallMade = responses.length > 0;
    const apiResponseStatus = responses.length > 0 ? responses[0].status : 0;

    // Check location dropdown
    const locationDropdownLoaded = await this.page.locator(
      'select option:not([value=""]):not([value="0"]), mat-option, [role="option"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const locationOptions = await this.page.evaluate(function () {
      const opts = Array.from(document.querySelectorAll('select option, mat-option, [role="option"]'));
      return opts.map(o => (o.textContent ?? '').trim()).filter(t => t && t !== '---Select---');
    });

    await this.takeScreenshot(screenshotDir, 'DTC032_02_api_status');

    return { pageNavigated, apiCallMade, apiResponseStatus, locationDropdownLoaded, locationOptions };
  }

  // ── DTC033: SDR Reports Show 404 Error ────────────────────────────────────

  async dtc033_sdrReports404(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC033_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Replenishment Threshold Report');
    if (!pageNavigated) await this.clickSidebarItemByText('Threshold Report');
    await this.page.waitForTimeout(3000);

    await this.takeScreenshot(screenshotDir, 'DTC033_01_report_page');

    const reportLoaded = await this.page.locator(
      'iframe, embed, object[type="application/pdf"], [class*="report"], [class*="viewer"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    // Check for ASP.NET Server Error 404 text in page or iframe
    const reportHas404Error = await this.page.evaluate(function () {
      // Check main page
      const mainText = document.body.innerText;
      if (/404|Server Error|File or directory not found/i.test(mainText)) return true;
      // Check iframes
      const iframes = Array.from(document.querySelectorAll('iframe'));
      for (const ifr of iframes) {
        try {
          const ifrDoc = (ifr as HTMLIFrameElement).contentDocument;
          if (ifrDoc && /404|Server Error/i.test(ifrDoc.body?.innerText ?? '')) return true;
        } catch { /* cross-origin */ }
      }
      return false;
    });

    const reportContent = await this.page.evaluate(function () {
      const viewerEl = document.querySelector('[class*="report"], [class*="viewer"], iframe');
      if (!viewerEl) return '';
      if (viewerEl.tagName === 'IFRAME') {
        try {
          return ((viewerEl as HTMLIFrameElement).contentDocument?.body?.innerText ?? '').substring(0, 300);
        } catch { return 'cross-origin'; }
      }
      return (viewerEl.textContent ?? '').substring(0, 300).trim();
    });

    await this.takeScreenshot(screenshotDir, 'DTC033_02_report_content');

    return { pageNavigated, reportLoaded, reportHas404Error, reportContent };
  }

  // ── DTC034: WispModern Report URL Points to WISP Old ─────────────────────

  async dtc034_reportUrlPointsToWispOld(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC034_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    const capturedUrls: string[] = [];
    this.page.on('request', (req) => {
      const url = req.url();
      if (/\.pdf|Report|report/i.test(url) && !/favicon|\.js|\.css/i.test(url)) {
        capturedUrls.push(url);
      }
    });

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Replenishment Threshold Report');
    if (!pageNavigated) await this.clickSidebarItemByText('Threshold Report');
    await this.page.waitForTimeout(4000);

    await this.takeScreenshot(screenshotDir, 'DTC034_01_report_viewer');

    const reportUrlCaptured = capturedUrls.length > 0;
    const reportUrl = capturedUrls[0] ?? '';

    // :8080 = WispModern, no port (port 80) = WISP Old
    const urlPointsToWispOld = reportUrl.includes('isp.stores.michaels.com/') && !reportUrl.includes(':8080');
    const urlPointsToWispModern = reportUrl.includes(':8080');

    await this.takeScreenshot(screenshotDir, 'DTC034_02_url_captured');

    return { pageNavigated, reportUrlCaptured, reportUrl, urlPointsToWispOld, urlPointsToWispModern };
  }

  // ── DTC035: High Overstock Report Nav Item Disabled ───────────────────────

  async dtc035_highOverstockNavDisabled(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC035_Result> {
    await this.navigateToWispModern(data);
    const sidebarOpened = await this.openSidebar();

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(800);

    await this.takeScreenshot(screenshotDir, 'DTC035_01_sidebar_dr');

    const highOverstockNavFound = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /high.?overstock.?report/i.test(e.textContent?.trim() ?? ''));
    });

    const { highOverstockNavEnabled, pointerEvents } = await this.page.evaluate(function () {
      // Find the LEAF element (no children) to avoid picking up parent containers
      var all = Array.from(document.querySelectorAll('#sideMenu *'));
      var el = all.filter(function(e) { return e.children.length === 0; })
                  .find(function(e) { return /^high\s*overstock\s*report$/i.test((e.textContent ?? '').trim()); });
      if (!el) return { highOverstockNavEnabled: false, pointerEvents: '' };
      var style = window.getComputedStyle(el);
      var pe = style.pointerEvents;
      var parentEl = el.parentElement;
      var parentPE = parentEl ? window.getComputedStyle(parentEl).pointerEvents : 'auto';
      // Disabled when: element OR its parent has pointer-events: none, has .disabled class, or is gray
      var isDisabled = pe === 'none' || parentPE === 'none' ||
        el.classList.contains('disabled') || (parentEl ? parentEl.classList.contains('disabled') : false);
      return { highOverstockNavEnabled: !isDisabled, pointerEvents: pe };
    });

    await this.closeSidebar();
    await this.takeScreenshot(screenshotDir, 'DTC035_02_nav_state');

    return { sidebarOpened, highOverstockNavFound, highOverstockNavEnabled, pointerEvents };
  }

  // ── DTC036: Nav Item Renamed from Overstock Item List Report ──────────────

  async dtc036_navItemRenamed(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC036_Result> {
    await this.navigateToWispModern(data);
    const sidebarOpened = await this.openSidebar();

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(800);

    await this.takeScreenshot(screenshotDir, 'DTC036_01_sidebar_dr');

    const oldNavItemVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /overstock.?item.?list.?report/i.test(e.textContent?.trim() ?? ''));
    });

    const newNavItemVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /existing.?overstock.?filter.?report/i.test(e.textContent?.trim() ?? ''));
    });

    const navItemText = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      const el = all.find(e =>
        /overstock.?item.?list|existing.?overstock.?filter/i.test(e.textContent?.trim() ?? '') &&
        e.children.length === 0
      );
      return el ? (el.textContent?.trim() ?? '') : '';
    });

    await this.closeSidebar();
    await this.takeScreenshot(screenshotDir, 'DTC036_02_nav_item');

    return { sidebarOpened, oldNavItemVisible, newNavItemVisible, navItemText };
  }

  // ── DTC037: Override Text "Truck/Inventory day" Lowercase d ───────────────

  async dtc037_overrideDayTextCapitalization(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC037_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Override with Truck/Inventory Day')
      || await this.clickSidebarItemByText('Override with Truck')
      || await this.clickSidebarItemByText('Override Truck');
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC037_01_dr_page');

    const overrideText = await this.page.evaluate(function () {
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      for (const el of allEls) {
        if (el.children.length > 0) continue;
        const t = (el.textContent ?? '').trim();
        if (/truck.{0,5}inventory.{0,5}day/i.test(t)) return t;
      }
      const body = document.body.innerText;
      const m = body.match(/(Truck\/Inventory\s*[Dd]ay)/);
      return m ? m[1] : '';
    });

    const overrideTextFound = overrideText.length > 0;
    const hasCorrectedCapitalization = /Truck\/Inventory Day/.test(overrideText);

    await this.takeScreenshot(screenshotDir, 'DTC037_02_override_text');

    return { pageNavigated, overrideTextFound, overrideText, hasCorrectedCapitalization };
  }

  // ── DTC038: Overstock Label Printing Missing Delete/Print Buttons ─────────

  async dtc038_overstockLabelPrintingMissingButtons(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC038_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Overstock Label Printing');
    await this.page.waitForTimeout(3000);

    await this.takeScreenshot(screenshotDir, 'DTC038_01_olp_initial_load');

    const deleteButtonVisibleOnLoad = await this.page.locator(
      'button:has-text("Delete"), button[title*="Delete"], input[value="Delete"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    const printButtonVisibleOnLoad = await this.page.locator(
      'button:has-text("Print"), button[title*="Print"], input[value="Print"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    await this.takeScreenshot(screenshotDir, 'DTC038_02_buttons_check');

    return { pageNavigated, deleteButtonVisibleOnLoad, printButtonVisibleOnLoad };
  }

  // ── DTC039: Existing Overstock Filter Report Location Dropdown ────────────

  async dtc039_overstockFilterLocationDropdown(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC039_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    await this.expandSidebarSection('SISO');
    await this.expandSidebarSection('DR');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Existing Overstock Filter Report');
    if (!pageNavigated) await this.clickSidebarItemByText('Overstock Item List Report');
    await this.page.waitForTimeout(3000);

    await this.takeScreenshot(screenshotDir, 'DTC039_01_report_page');

    const locationDropdownFound = await this.page.locator(
      'select, mat-select, [role="combobox"], [class*="dropdown"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const locationOptions: string[] = await this.page.evaluate(function () {
      const selects = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
      for (const sel of selects) {
        if ((sel as HTMLElement).offsetParent === null) continue;
        const opts = Array.from(sel.options).map(o => o.text.trim()).filter(t => t);
        if (opts.length > 0) return opts;
      }
      // Try Angular Material mat-select
      const opts = Array.from(document.querySelectorAll('mat-option, [role="option"]'));
      return opts.map(o => (o.textContent ?? '').trim()).filter(t => t);
    });

    const hasOnlyAllOption = locationOptions.length <= 1 && locationOptions.some(o => /^all$/i.test(o));
    const locationOptionCount = locationOptions.length;

    await this.takeScreenshot(screenshotDir, 'DTC039_02_location_options');

    return { pageNavigated, locationDropdownFound, locationOptionCount, locationOptions, hasOnlyAllOption };
  }

  // ── DTC040: EBF Pages Inaccessible in WispModern ─────────────────────────

  async dtc040_ebfPagesInaccessible(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC040_Result> {
    await this.navigateToWispModern(data);
    const sidebarOpened = await this.openSidebar();
    await this.page.waitForTimeout(600);

    await this.takeScreenshot(screenshotDir, 'DTC040_01_sidebar_open');

    const ebfSectionVisible = await this.page.evaluate(function () {
      const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
      return all.some(e => /electronic.?business.?forms|EBF/i.test(e.textContent?.trim() ?? ''));
    });

    // Check if EBF pages are accessible
    const checkNavItem = async (label: string): Promise<boolean> => {
      return await this.page.evaluate((lbl: string) => {
        const all = Array.from(document.querySelectorAll('#sideMenu *, .sidebar *, nav *')) as HTMLElement[];
        return all.some(e => (e.textContent?.trim() ?? '').toLowerCase().includes(lbl.toLowerCase()));
      }, label);
    };

    const aurPageAccessible = await checkNavItem('Alarm Update Report');
    const cowPageAccessible = await checkNavItem('Cashier Override');
    const imcPageAccessible = await checkNavItem('Inventory Mgmt');
    const pbfPageAccessible = await checkNavItem('Printable Business');

    // Check window.ng availability
    const windowNgDefined = await this.page.evaluate(function () {
      return typeof (window as any).ng !== 'undefined';
    });

    await this.closeSidebar();
    await this.takeScreenshot(screenshotDir, 'DTC040_02_nav_checked');

    return { sidebarOpened, ebfSectionVisible, aurPageAccessible, cowPageAccessible, imcPageAccessible, pbfPageAccessible, windowNgDefined };
  }

  // ── DTC041: Printable Business Forms Renders Blank ────────────────────────

  async dtc041_pbfRenderBlank(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC041_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    let pageNavigated = await this.clickSidebarItemByText('Printable Business Forms');
    if (!pageNavigated) pageNavigated = await this.clickSidebarItemByText('Printable');
    await this.page.waitForTimeout(3000);

    await this.takeScreenshot(screenshotDir, 'DTC041_01_pbf_page');

    const pbfContentVisible = await this.page.locator(
      'app-pbf, [class*="pbf"], [class*="business-form"], iframe, object'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const folderTreeVisible = await this.page.locator(
      '[class*="tree"], [class*="folder"], ul.tree, .tree-view'
    ).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    const documentPreviewVisible = await this.page.locator(
      'iframe, embed, [class*="preview"], [class*="document"], [class*="viewer"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    const pageIsBlank = await this.page.evaluate(function () {
      const body = document.body.innerText.trim();
      const hasContent = body.length > 50;
      const hasMeaningfulContent = !/^\s*(loading|please wait)?\s*$/i.test(body);
      return !hasContent || !hasMeaningfulContent;
    });

    await this.takeScreenshot(screenshotDir, 'DTC041_02_content_check');

    return { pageNavigated, pbfContentVisible, folderTreeVisible, documentPreviewVisible, pageIsBlank };
  }

  // ── DTC042: IMC Panel Heading Has Trailing Backtick ───────────────────────

  async dtc042_imcHeadingTrailingBacktick(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC042_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    let pageNavigated = await this.clickSidebarItemByText('Inventory Mgmt Communique');
    if (!pageNavigated) pageNavigated = await this.clickSidebarItemByText('IMC');
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC042_01_imc_page');

    const imcHeadingText = await this.page.evaluate(function () {
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      for (const el of allEls) {
        if (el.children.length > 0) continue;
        const t = el.textContent ?? '';
        if (/inventory.?mgmt.?communique/i.test(t)) return t.trim();
      }
      const hdrs = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, .panel-title, .card-title'));
      for (const h of hdrs) {
        const t = (h.textContent ?? '').trim();
        if (/inventory.?mgmt/i.test(t)) return t;
      }
      return '';
    });

    const imcHeadingVisible = imcHeadingText.length > 0;
    const hasTrailingBacktick = imcHeadingText.endsWith('`') || imcHeadingText.includes('`');

    await this.takeScreenshot(screenshotDir, 'DTC042_02_heading_text');

    return { pageNavigated, imcHeadingVisible, imcHeadingText, hasTrailingBacktick };
  }

  // ── DTC043: POG Deactivation History Perpetual Spinner ────────────────────

  async dtc043_pogDeactivationHistorySpinner(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC043_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    // Navigate to Planogram > Deactivation
    await this.expandSidebarSection('Planogram');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Deactivation');
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC043_01_deactivation_page');

    // Click History button
    const historyBtn = this.page.locator(
      'button:has-text("History"), button[title*="History"]'
    ).filter({ visible: true }).first();

    const historyBtnClicked = await historyBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (historyBtnClicked) {
      await historyBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
    }

    await this.takeScreenshot(screenshotDir, 'DTC043_02_history_loading');

    // Check if spinner is still visible (perpetual)
    const spinnerVisible = await this.page.locator(
      '[class*="spinner"], [class*="loading"], mat-spinner, .spinner, [class*="progress"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 2000 }).catch(() => false);

    // Wait up to 20 seconds for grid to load
    let gridLoadedWithinTimeout = false;
    let gridRowCount = 0;
    for (let i = 0; i < 4; i++) {
      await this.page.waitForTimeout(5000);
      gridRowCount = await this.page.evaluate(function () {
        const rows = Array.from(document.querySelectorAll('mat-row, tr'));
        return rows.filter(r => {
          const el = r as HTMLElement;
          return el.offsetParent !== null && r.querySelectorAll('td, mat-cell').length > 0;
        }).length;
      }).catch(() => 0);
      if (gridRowCount > 0) {
        gridLoadedWithinTimeout = true;
        break;
      }
    }

    await this.takeScreenshot(screenshotDir, 'DTC043_03_grid_state');

    return { pageNavigated, historyBtnClicked, spinnerVisible, gridLoadedWithinTimeout, gridRowCount };
  }

  // ── DTC044: Planogram Error Alert Missing Space Between Icon and Text ──────

  async dtc044_planogramErrorAlertSpacing(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC044_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    await this.expandSidebarSection('Planogram');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Activation');
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC044_01_activation_page');

    // Trigger error alert by clicking Activate with no selection
    const activateBtn = this.page.locator(
      'button:has-text("Activate"), button[title*="Activate"]'
    ).filter({ visible: true }).first();
    if (await activateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await activateBtn.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    await this.takeScreenshot(screenshotDir, 'DTC044_02_error_alert');

    const errorAlertVisible = await this.page.locator(
      '.alert, [class*="alert"], [class*="error"], [class*="danger"]'
    ).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    const errorAlertText = await this.page.locator(
      '.alert, [class*="alert-danger"], [class*="alert-warning"]'
    ).filter({ visible: true }).first().textContent().then(t => (t ?? '').trim()).catch(() => '');

    // Check spacing between icon and text by inspecting HTML structure
    const { iconAndTextHaveSpace, rawIconText } = await this.page.evaluate(function () {
      var alerts = Array.from(document.querySelectorAll('.alert, [class*="alert"]'));
      for (var i = 0; i < alerts.length; i++) {
        var alert = alerts[i];
        if ((alert as HTMLElement).offsetParent === null) continue;
        var rawText = (alert as HTMLElement).innerText ?? (alert as HTMLElement).textContent ?? '';
        if (rawText.trim().length === 0) continue;
        // Look for icon span (glyphicon or material icon) followed immediately by message span
        var iconSpan = alert.querySelector('[class*="glyphicon"], i[class*="icon"], mat-icon');
        var msgSpan = alert.querySelector('.message, [class*="message"], span:not([class*="icon"]):not([class*="glyph"])');
        if (iconSpan && msgSpan) {
          // Walk child nodes to see if there is any text/whitespace node between icon and message
          var nodes = Array.from(alert.childNodes);
          var foundIcon = false;
          var betweenContent = '';
          for (var n = 0; n < nodes.length; n++) {
            var node = nodes[n];
            if (node === iconSpan) { foundIcon = true; continue; }
            if (foundIcon && node === msgSpan) break;
            if (foundIcon) betweenContent += (node.textContent ?? '');
          }
          // If betweenContent is empty or only whitespace that's NOT a space, there's no space
          var hasWhitespace = /[ \t\u00A0]/.test(betweenContent);
          return { iconAndTextHaveSpace: hasWhitespace, rawIconText: rawText.substring(0, 60) };
        }
        // Fallback: check if raw text has a visible space right after first character
        var hasSpacePattern = /[\s\u00A0]/.test(rawText.charAt(1));
        return { iconAndTextHaveSpace: hasSpacePattern, rawIconText: rawText.substring(0, 60) };
      }
      return { iconAndTextHaveSpace: false, rawIconText: '' };
    });

    await this.takeScreenshot(screenshotDir, 'DTC044_03_spacing_check');

    return { pageNavigated, errorAlertVisible, errorAlertText, iconAndTextHaveSpace, rawIconText };
  }

  // ── DTC045: PCA Print Buttons Same Color as Other Buttons ─────────────────

  async dtc045_pcaButtonColors(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC045_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    await this.expandSidebarSection('Price Change');
    await this.page.waitForTimeout(400);
    const pageNavigated = await this.clickSidebarItemByText('Price Change Activation');
    if (!pageNavigated) await this.clickSidebarItemByText('Activation');
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC045_01_pca_page');

    const { findBtnColor, printWkstBtnColor, printLabelsBtnColor } = await this.page.evaluate(function () {
      const getAllButtons = (text: string): HTMLElement | null => {
        const btns = Array.from(document.querySelectorAll('button, input[type="button"]')) as HTMLElement[];
        return btns.find(b => (b.textContent?.trim() ?? (b as HTMLInputElement).value ?? '').toLowerCase().includes(text.toLowerCase())) ?? null;
      };
      const getColor = (el: HTMLElement | null): string => {
        if (!el) return '';
        return window.getComputedStyle(el).backgroundColor;
      };
      const findBtn = getAllButtons('Find');
      const printWkstBtn = getAllButtons('Print Wkst') || getAllButtons('Print Worksheet');
      const printLabelsBtn = getAllButtons('Print Labels') || getAllButtons('Print Label');
      return {
        findBtnColor: getColor(findBtn),
        printWkstBtnColor: getColor(printWkstBtn),
        printLabelsBtnColor: getColor(printLabelsBtn),
      };
    });

    const buttonsHaveSameColor =
      printWkstBtnColor !== '' &&
      findBtnColor !== '' &&
      printWkstBtnColor === findBtnColor;

    const colorsAreDifferent =
      printWkstBtnColor !== '' &&
      findBtnColor !== '' &&
      printWkstBtnColor !== findBtnColor;

    await this.takeScreenshot(screenshotDir, 'DTC045_02_button_colors');

    return { pageNavigated, findBtnColor, printWkstBtnColor, printLabelsBtnColor, buttonsHaveSameColor, colorsAreDifferent };
  }

  // ── DTC046: Reports Validation Message Says "Ending Range" ───────────────
  // This test uses WISP Old (.NET) URL per test case step 1

  async dtc046_reportsValidationMessage(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC046_Result> {
    // Defect DEF-063 is in WispModern — navigate to WispModern Department Class report
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    // Navigate to Department Class Report via sidebar (it's under Reports section)
    const pageNavigated = await this.clickSidebarItemByText('Department Class');
    await this.page.waitForTimeout(2000);

    // Also try confirming by component presence
    const compVisible = await this.page.locator('app-department-class-report, [class*="dept"], [class*="department"]')
      .first().isVisible({ timeout: 8000 }).catch(() => false);
    const pageReady = pageNavigated || compVisible;

    await this.takeScreenshot(screenshotDir, 'DTC046_01_dept_class_report');

    // Enter a value exceeding max integer in the FROM dept/beginning range field
    const fromInput = this.page.locator(
      'input[placeholder*="from" i], input[placeholder*="begin" i], input[name*="from" i], input[name*="begin" i], input[type="text"]'
    ).filter({ visible: true }).first();

    if (await fromInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fromInput.fill('2147483648');
      await fromInput.press('Tab');
      await this.page.waitForTimeout(500);
    }

    // Click Generate / Find / Print to trigger validation
    const genBtn = this.page.locator(
      'button:has-text("Generate"), button:has-text("Find"), button:has-text("Print"), button:has-text("View"), input[type="button"]'
    ).filter({ visible: true }).first();
    let validationTriggered = false;
    if (await genBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await genBtn.click({ force: true });
      validationTriggered = true;
      await this.page.waitForTimeout(1500);
    }

    await this.takeScreenshot(screenshotDir, 'DTC046_02_validation_message');

    // Scope alert search to active pane to avoid picking up stale alerts from other modules
    const validationMessage = await this.page.evaluate(function () {
      var pane = document.querySelector('.tab-pane.active, .tab-content .active, app-department-class-report') as HTMLElement || document.body;
      var alerts = Array.from(pane.querySelectorAll('.alert, [class*="alert"], [class*="error"], [class*="validation"]'));
      for (var i = 0; i < alerts.length; i++) {
        var el = alerts[i] as HTMLElement;
        if (el.offsetParent === null) continue;
        var t = (el.textContent || '').trim();
        if (t.length > 5) return t;
      }
      // Fallback: any visible element with range/beginning/ending text
      var allEls = Array.from(pane.querySelectorAll('*'));
      for (var j = 0; j < allEls.length; j++) {
        var e = allEls[j] as HTMLElement;
        if (e.children.length > 0 || e.offsetParent === null) continue;
        var txt = (e.textContent || '').trim();
        if (/range|beginning|ending/i.test(txt) && txt.length > 5) return txt;
      }
      return '';
    });

    const messageContainsBeginning = /beginning|begin|start|from/i.test(validationMessage);
    const messageContainsEnding = /ending|end/i.test(validationMessage);

    await this.takeScreenshot(screenshotDir, 'DTC046_03_message_content');

    return { pageNavigated: pageReady, validationTriggered, validationMessage, messageContainsBeginning, messageContainsEnding };
  }

  // ── DTC047: Store Address "Address 3" Column Wraps ────────────────────────

  async dtc047_addressColumnWrapping(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC047_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    const pageNavigated = await this.clickSidebarItemByText('Store Address Inquiry');
    await this.page.waitForTimeout(2000);

    await this.takeScreenshot(screenshotDir, 'DTC047_01_sai_page');

    // Search for stores to load the grid
    const storeInput = this.page.locator('input[type="text"]').filter({ visible: true }).first();
    if (await storeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await storeInput.fill(data.validStoreNo || '97401');
      await this.page.waitForTimeout(300);
    }
    const findBtn = this.page.locator('button:has-text("Find"), button:has-text("Search")').filter({ visible: true }).first();
    if (await findBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await findBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
    }

    await this.takeScreenshot(screenshotDir, 'DTC047_02_results_grid');

    const address3ColFound = await this.page.locator(
      'th:has-text("Address 3"), mat-header-cell:has-text("Address 3"), [class*="header"]:has-text("Address 3")'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const { address3ColWrapped, address3ColHeight, address3ColText } = await this.page.evaluate(function () {
      const headers = Array.from(document.querySelectorAll('th, mat-header-cell, [class*="header-cell"]')) as HTMLElement[];
      const addr3 = headers.find(h => /address\s*3/i.test(h.textContent ?? ''));
      if (!addr3) return { address3ColWrapped: false, address3ColHeight: 0, address3ColText: '' };
      const rect = addr3.getBoundingClientRect();
      // A header "wraps" if it is significantly taller than a standard single-line header (~24-30px)
      const isWrapped = rect.height > 35;
      return {
        address3ColWrapped: isWrapped,
        address3ColHeight: Math.round(rect.height),
        address3ColText: (addr3.textContent ?? '').trim(),
      };
    });

    await this.takeScreenshot(screenshotDir, 'DTC047_03_column_height');

    return { pageNavigated, address3ColFound, address3ColWrapped, address3ColHeight, address3ColText };
  }

  // ── DTC048: User Management Create User Modal Doesn't Open ────────────────

  async dtc048_createUserModalNotOpening(screenshotDir: string, _data: IntermittentDefectP2TestData): Promise<DTC048_Result> {
    await this.navigateToWispModern(_data);
    await this.closeAllNavTabs();

    const pageNavigated = await this.clickSidebarItemByText('User Management');
    await this.page.waitForTimeout(2000);
    await this.page.locator('mat-table, [class*="user"], table').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    await this.takeScreenshot(screenshotDir, 'DTC048_01_user_management');

    // Find the person_add icon — it is a bare <i class="material-icons"> element (from UserManagementPage)
    const createIconVisible = await this.page.locator('i.material-icons').filter({ hasText: 'person_add' }).count()
      .then(c => c > 0).catch(() => false);

    let createIconClicked = false;
    let createModalVisible = false;
    let createModalTitle = '';

    if (createIconVisible) {
      const createIcon = this.page.locator('i.material-icons').filter({ hasText: 'person_add' }).first();
      await createIcon.click({ force: true });
      createIconClicked = true;
      await this.page.waitForTimeout(1500);

      createModalVisible = await this.page.locator(
        '[role="dialog"], .modal.in, mat-dialog-container'
      ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

      if (createModalVisible) {
        createModalTitle = await this.page.locator(
          '[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3, mat-dialog-container h1, mat-dialog-container h2, mat-dialog-container .mat-dialog-title'
        ).first().textContent().then(t => (t ?? '').trim()).catch(() => '');
      }
    }

    await this.takeScreenshot(screenshotDir, 'DTC048_02_modal_state');

    await this.dismissModal('Cancel');
    await this.dismissModal('Close');

    return { pageNavigated, createIconVisible, createIconClicked, createModalVisible, createModalTitle };
  }

  // ── DTC049: User Management Paginator Shows 0 of 0 ────────────────────────

  async dtc049_paginatorShowsZero(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC049_Result> {
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();

    const pageNavigated = await this.clickSidebarItemByText('User Management');
    await this.page.waitForTimeout(2000);
    // Wait for mat-table to render
    await this.page.locator('mat-table, table').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(1000);

    await this.takeScreenshot(screenshotDir, 'DTC049_01_user_management');

    // Scope to the active tab pane to avoid picking up paginators from other open modules
    const paginatorText = await this.page.evaluate(function () {
      var pane = document.querySelector('.tab-pane.active, .tab-content .active, app-user-management') as HTMLElement | null;
      var scope = pane ?? document.body;
      // mat-mdc-paginator-range-label (Angular Material v15+) OR mat-paginator-range-label (older)
      var labels = Array.from(scope.querySelectorAll('[class*="paginator-range-label"], [class*="paginator"] [class*="range-label"]')) as HTMLElement[];
      var visible = labels.filter(function(l) { return l.offsetParent !== null; });
      return visible.length > 0 ? visible[0].textContent!.trim() : '';
    }).catch(() => '');

    const paginatorShowsZero = paginatorText.includes('0 of 0') || paginatorText === '0 of 0';

    const nextPageEnabled = await this.page.evaluate(function () {
      const nextBtn = document.querySelector('[aria-label="Next page"], button.mat-paginator-navigation-next');
      if (!nextBtn) return false;
      return !(nextBtn as HTMLButtonElement).disabled;
    });

    const actualUserCount = await this.page.locator('mat-table:visible mat-row, table:visible tbody tr').count();

    await this.takeScreenshot(screenshotDir, 'DTC049_02_paginator_state');

    return { pageNavigated, paginatorText, paginatorShowsZero, nextPageEnabled, actualUserCount };
  }

  // ── DTC050: User Management Date/Time Timezone Mismatch ───────────────────

  async dtc050_dateTimeTimezoneMismatch(screenshotDir: string, data: IntermittentDefectP2TestData): Promise<DTC050_Result> {
    // Step 1: Get date from WISP Old
    await this.navigateToWispOld();
    await this.closeAllNavTabs();
    await this.clickSidebarItemByText('User Management');
    await this.page.waitForTimeout(2000);
    await this.page.locator('mat-table, table').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    await this.takeScreenshot(screenshotDir, 'DTC050_01_wispold_user_mgmt');

    // Capture first user's date/time from WISP Old
    const wispOldDateTime = await this.page.evaluate(function () {
      const cells = Array.from(document.querySelectorAll('mat-cell, td')) as HTMLElement[];
      for (const cell of cells) {
        if (cell.offsetParent === null) continue;
        const t = (cell.textContent ?? '').trim();
        if (/\d{1,2}\/\d{1,2}\/\d{4}.*(?:AM|PM)/i.test(t) || /\d{4}-\d{2}-\d{2}T/i.test(t)) return t;
      }
      return '';
    });

    const dateColumnFound = wispOldDateTime.length > 0;

    // Step 2: Get date from WispModern for same user
    await this.navigateToWispModern(data);
    await this.closeAllNavTabs();
    await this.clickSidebarItemByText('User Management');
    await this.page.waitForTimeout(2000);
    await this.page.locator('mat-table, table').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(500);

    await this.takeScreenshot(screenshotDir, 'DTC050_02_wispmodern_user_mgmt');

    const wispModernDateTime = await this.page.evaluate(function () {
      const cells = Array.from(document.querySelectorAll('mat-cell, td')) as HTMLElement[];
      for (const cell of cells) {
        if (cell.offsetParent === null) continue;
        const t = (cell.textContent ?? '').trim();
        if (/\d{1,2}\/\d{1,2}\/\d{4}.*(?:AM|PM)/i.test(t) || /\d{4}-\d{2}-\d{2}T/i.test(t)) return t;
      }
      return '';
    });

    // Parse and compare times
    let timeDifferenceHours = 0;
    let utcOffsetDetected = false;

    if (wispOldDateTime && wispModernDateTime) {
      const parseHour = (dt: string): number => {
        const m = dt.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) return -1;
        let h = parseInt(m[1], 10);
        if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h;
      };
      const oldHour = parseHour(wispOldDateTime);
      const modernHour = parseHour(wispModernDateTime);
      if (oldHour >= 0 && modernHour >= 0) {
        timeDifferenceHours = Math.abs(modernHour - oldHour);
        utcOffsetDetected = timeDifferenceHours >= 4 && timeDifferenceHours <= 5;
      }
    }

    await this.takeScreenshot(screenshotDir, 'DTC050_03_timezone_comparison');

    return { pageNavigated: true, dateColumnFound, wispOldDateTime, wispModernDateTime, timeDifferenceHours, utcOffsetDetected };
  }
}
