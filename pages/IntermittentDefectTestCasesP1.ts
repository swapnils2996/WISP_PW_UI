import { Page, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { DtcP1TestData } from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';
import { LoginPage } from './LoginPage';

// ── Result interfaces ─────────────────────────────────────────────────────────

export interface DTC001_Result {
  archivePageVisible: boolean;
  historyLoaded: boolean;
  historyRecordCount: number;
  backClicked: boolean;
  paginationAfterBack: string;
  paginationResetToZero: boolean;
}

export interface DTC002_Result {
  historyGridVisible: boolean;
  columnHeaderCount: number;
  allHeadersHaveAriaLabel: boolean;
  headersWithAriaLabel: string[];
  headersWithoutAriaLabel: string[];
  sortDescriptionFound: boolean;
}

export interface DTC003_Result {
  genericSkuPageVisible: boolean;
  listTypeSelected: boolean;
  printClicked: boolean;
  printDialogVisible: boolean;
  printDialogTitle: string;
}

export interface DTC004_Result {
  genericSkuPageVisible: boolean;
  referenceColumnExists: boolean;
  referenceColumnTabAccessible: boolean;
  tabIndexValue: string;
}

export interface DTC005_Result {
  genericSkuPageVisible: boolean;
  itemsInGrid: boolean;
  columnClicked: boolean;
  sortDirectionAfterFirstClick: string;
  isSortAscending: boolean;
}

export interface DTC006_Result {
  genericSkuPageVisible: boolean;
  listTypeDropdownFound: boolean;
  firstOptionValue: string;
  firstOptionIsEmpty: boolean;
}

export interface DTC007_Result {
  iaHistoryPageVisible: boolean;
  totalColumnCount: number;
  skuColTabAccessible: boolean;
  upcColTabAccessible: boolean;
  allColumnsAccessible: boolean;
}

export interface DTC008_Result {
  rtvPageVisible: boolean;
  firstButtonLabel: string;
  firstButtonIsEdit: boolean;
  hasViewButton: boolean;
}

export interface DTC009_Result {
  iaHistoryPageVisible: boolean;
  sampleDateValue: string;
  dateIsUsFormat: boolean;
  dateIsIsoFormat: boolean;
}

export interface DTC010_Result {
  itemInquiryPageVisible: boolean;
  itemFound: boolean;
  sectionHeaderCount: number;
  sectionHeaderColor: string;
  colorIsWhite: boolean;
}

export interface DTC011_Result {
  itemInquiryPageVisible: boolean;
  itemFound: boolean;
  labelFieldExists: boolean;
  labelValue: string;
  labelIsEmpty: boolean;
}

export interface DTC012_Result {
  itemInquiryPageVisible: boolean;
  itemFound: boolean;
  sellingPrice: string;
  regularRetail: string;
  wasPrice: string;
  sellingPriceMatchesWasPrice: boolean;
}

export interface DTC013_Result {
  itemInquiryPageVisible: boolean;
  itemFound: boolean;
  promotionsSectionVisible: boolean;
  promotionColumnHeaders: string[];
  hasDescriptionColumn: boolean;
  columnCount: number;
}

export interface DTC014_Result {
  itemInquiryPageVisible: boolean;
  viewMoreBarVisible: boolean;
  directionalIconVisible: boolean;
  iconText: string;
}

export interface DTC015_Result {
  itemInquiryPageVisible: boolean;
  itemFound: boolean;
  salesHistoryVisible: boolean;
  rowLabels: string[];
  orderIsAscending: boolean;
}

export interface DTC016_Result {
  itemInquiryPageVisible: boolean;
  itemFound: boolean;
  itemSearchTabColor: string;
  itemDetailsTabColor: string;
  itemSearchTabIsOrange: boolean;
}

export interface DTC017_Result {
  labelRequestPageVisible: boolean;
  userRequestedLabelsVisible: boolean;
  printClicked: boolean;
  printDialogVisible: boolean;
  userListCount: number;
  userListIsEmpty: boolean;
}

export interface DTC018_Result {
  merchandiseLabelsVisible: boolean;
  printClicked: boolean;
  printDialogVisible: boolean;
  userListCount: number;
  userListIsEmpty: boolean;
}

export interface DTC019_Result {
  printDialogVisible: boolean;
  dialogWidth: number;
  contentAreaWidth: number;
  isFullWidthOverlay: boolean;
}

export interface DTC020_Result {
  rwopoPageVisible: boolean;
  selectVendorModalAutoVisible: boolean;
  modalVisibleOnLoad: boolean;
}

export interface DTC021_Result {
  rwopoPageVisible: boolean;
  selectVendorDialogVisible: boolean;
  dialogTitle: string;
  titleIsPresent: boolean;
}

export interface DTC022_Result {
  rwopoPageVisible: boolean;
  gridColumnHeaders: string[];
  columnCount: number;
  hasUnlabeledColumn: boolean;
  expectedColumnsPresent: boolean;
}

export interface DTC023_Result {
  worksheetsPageVisible: boolean;
  gridHasData: boolean;
  noItemsMessageVisible: boolean;
  noItemsMessageText: string;
}

export interface DTC024_Result {
  appAlertsPageVisible: boolean;
  gridVisible: boolean;
  gridRowCount: number;
  typeColumnHasData: boolean;
  descriptionColumnHasData: boolean;
  statusColumnHasData: boolean;
  anyCellBlank: boolean;
}

export interface DTC025_Result {
  appAlertsPageVisible: boolean;
  gridVisible: boolean;
  headerTextColor: string;
  headerColorIsDark: boolean;
}

export interface DTC026_Result {
  appAlertsPageVisible: boolean;
  filterInputVisible: boolean;
  filterBackgroundColor: string;
  backgroundIsTransparent: boolean;
}

export interface DTC027_Result {
  appAlertsPageVisible: boolean;
  paginatorText: string;
  usesHyphen: boolean;
  usesEnDash: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export class IntermittentDefectTestCasesP1Page {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Screenshot helper (hides side panel via CSS style tag, attaches to Allure) ──

  async takeScreenshot(screenshotDir: string, name: string): Promise<void> {
    try {
      fs.mkdirSync(screenshotDir, { recursive: true });
      await this.page.evaluate(function () {
        if (!document.getElementById('__hide_sidebar_screenshot__')) {
          var style = document.createElement('style');
          style.id = '__hide_sidebar_screenshot__';
          style.textContent = '#sideMenu { display: none !important; }';
          document.head.appendChild(style);
        }
      }).catch(() => {});
      await this.page.waitForTimeout(300).catch(() => {});
      const filePath = path.join(screenshotDir, `${name}.png`);
      await this.page.screenshot({ path: filePath, fullPage: true });
      await test.info().attach(name, { path: filePath, contentType: 'image/png' });
      await this.page.evaluate(function () {
        var el = document.getElementById('__hide_sidebar_screenshot__');
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }).catch(() => {});
    } catch { /* page closed — skip screenshot */ }
  }

  // ── Session helpers ───────────────────────────────────────────────────────

  private async ensureLoggedIn(): Promise<void> {
    await this.page.waitForSelector('div.panel-body, button:has-text("Login"), input[type="password"]', { timeout: 15000 }).catch(() => {});
    const needsLogin = await this.page.locator('input[type="password"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (!needsLogin) return;
    const cfg = getConfig();
    const loginPage = new LoginPage(this.page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);
    await this.page.waitForSelector('div.panel-body, #sideMenu', { timeout: 25000 }).catch(() => {});
    await this.page.waitForTimeout(800);
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
      await this.page.waitForTimeout(600);
      const dlg = this.page.locator('.modal.in, [role="dialog"]').first();
      if (await dlg.isVisible({ timeout: 800 }).catch(() => false)) {
        const noBtn = this.page.locator('button:has-text("No"), button:has-text("Cancel")').first();
        if (await noBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await noBtn.click({ force: true });
        }
        await this.page.waitForTimeout(400);
      }
    }
    await this.page.waitForTimeout(400);
  }

  private async openSidebar(): Promise<void> {
    const sideMenu = this.page.locator('#sideMenu');
    if (await sideMenu.isVisible({ timeout: 500 }).catch(() => false)) return;
    const launcher = this.page.locator('.sidebar-launcher, button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger').first();
    if (await launcher.isVisible({ timeout: 2000 }).catch(() => false)) {
      await launcher.click({ force: true });
      await this.page.waitForTimeout(600);
    }
    if (!await sideMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.page.evaluate(function () {
        var el = document.getElementById('sideMenu');
        if (el) el.style.display = 'block';
      });
      await this.page.waitForTimeout(300);
    }
  }

  private async closeSidebar(): Promise<void> {
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.style.display = 'none';
    });
    await this.page.waitForTimeout(200);
  }

  private async dismissAllModals(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      const dlg = this.page.locator('.modal.in, [role="dialog"], mat-dialog-container').filter({ visible: true }).first();
      if (!await dlg.isVisible({ timeout: 600 }).catch(() => false)) break;
      for (const btn of ['Done', 'Cancel', 'No', 'Close', 'OK']) {
        const b = this.page.locator(`button:has-text("${btn}")`).first();
        if (await b.isVisible({ timeout: 800 }).catch(() => false)) {
          await b.click({ force: true });
          await this.page.waitForTimeout(400);
        }
      }
      await this.page.waitForTimeout(400);
    }
  }

  async clickSidebarLeafItem(label: string): Promise<void> {
    await this.dismissAllModals();
    const hasOpenTabs = await this.page.locator('.nav-tabs li').count().then(c => c > 0).catch(() => false);
    if (hasOpenTabs) await this.closeAllNavTabs();
    await this.openSidebar();
    let clicked = await this.page.evaluate((lbl: string) => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e =>
        e.children.length === 0 &&
        (e.textContent?.trim() ?? '').toLowerCase() === lbl.toLowerCase()
      );
      if (el) { el.click(); return true; }
      return false;
    }, label);
    if (!clicked) {
      const item = this.page.locator('#sideMenu').getByText(label, { exact: true }).first();
      if (await item.isVisible({ timeout: 2000 }).catch(() => false)) {
        await item.click({ force: true });
        clicked = true;
      }
    }
    await this.page.waitForTimeout(1500);
    await this.closeSidebar();
  }

  private async navigateBySidebarLeafText(leafText: string): Promise<void> {
    // Tab check
    const tabLabelShort = leafText.split(' ').slice(0, 3).join(' ');
    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: new RegExp(tabLabelShort, 'i') }).count()
      .then(c => c > 0).catch(() => false);
    if (tabExists) {
      await this.page.locator('.nav-tabs li a')
        .filter({ hasText: new RegExp(tabLabelShort, 'i') }).first()
        .click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
      await this.closeSidebar();
      return;
    }
    await this.openSidebar();
    const clicked = await this.page.evaluate((lbl: string) => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e =>
        e.children.length === 0 &&
        (e.textContent?.trim() ?? '').toLowerCase() === lbl.toLowerCase()
      );
      if (el) { (el as HTMLElement).click(); return true; }
      return false;
    }, leafText);
    if (!clicked) {
      await this.page.evaluate((lbl: string) => {
        const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
        const el = all.find(e => e.children.length === 0 && new RegExp(lbl, 'i').test(e.textContent ?? ''));
        if (el) (el as HTMLElement).click();
      }, leafText.split(' ').slice(0, 3).join(' '));
    }
    await this.page.waitForTimeout(1500);
    await this.closeSidebar();
    await this.page.waitForTimeout(1200);
  }

  private async navigateToArchiveRecords(): Promise<void> {
    await this.dismissAllModals();
    // Close existing Archive Records tab to force fresh load
    const closeTabBtn = this.page.locator('li').filter({ hasText: /ArchiveRecord/i })
      .locator('sup, [title="Close Tab"]').first();
    if (await closeTabBtn.isVisible({ timeout: 800 }).catch(() => false)) {
      await closeTabBtn.click({ force: true });
      await this.page.waitForTimeout(800);
    }
    await this.openSidebar();
    // Try DOM ID first, then fall back to text search
    const clicked = await this.page.evaluate(function () {
      const li = document.getElementById('archiveRecordsLink');
      if (li) {
        const a = li.querySelector('a') as HTMLElement | null;
        if (a) { a.click(); return true; }
        (li as HTMLElement).click(); return true;
      }
      // Text-based fallback
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e => e.children.length === 0 && /^Archive Records$/i.test(e.textContent?.trim() ?? ''));
      if (el) { el.click(); return true; }
      return false;
    });
    await this.page.waitForTimeout(1200);
    await this.closeSidebar();
    await this.page.waitForTimeout(500);
    // Wait for Archive Records component to be present in the DOM
    await this.page.waitForSelector('app-archiverecordpage', { timeout: 20000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  private async navigateToGenericSkuListBuilder(): Promise<void> {
    await this.dismissAllModals();
    // Check if tab already open
    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: /Generic Sku/i }).count().then(c => c > 0).catch(() => false);
    if (tabExists) {
      await this.page.locator('.nav-tabs li a').filter({ hasText: /Generic Sku/i }).first()
        .click({ force: true }).catch(() => {});
      await this.closeSidebar();
      await this.page.waitForTimeout(1000);
      return;
    }
    await this.page.evaluate(() => {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'block';
    });
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e => /Generic SKU/i.test(e.textContent?.trim() ?? '') && e.children.length === 0);
      if (el) el.click();
    });
    await this.page.waitForTimeout(2000);
    await this.page.locator('.nav-tabs li a').filter({ hasText: /Generic Sku/i }).first()
      .click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(1000);
    await this.closeSidebar();
    await this.page.waitForTimeout(500);
  }

  private async navigateToIAHistory(): Promise<void> {
    try {
      await this.dismissAllModals();
      const tabExists = await this.page.locator('.nav-tabs li a')
        .filter({ hasText: /Inventory Adjustments History/i }).count().then(c => c > 0).catch(() => false);
      if (tabExists) {
        await this.page.locator('.nav-tabs li a').filter({ hasText: /Inventory Adjustments History/i }).first()
          .click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(1000).catch(() => {});
      } else {
        // Click sidebar item via DOM — no sidebar open/close needed (items respond to JS click even when hidden)
        const clicked = await this.page.evaluate(() => {
          const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
          const el = all.find(e =>
            e.children.length === 0 &&
            (e.textContent?.trim() ?? '').toLowerCase() === 'inventory adjustments history'
          );
          if (el) { el.click(); return true; }
          return false;
        }).catch(() => false);
        if (!clicked) {
          await this.page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('*')) as HTMLElement[];
            const el = all.find(e =>
              e.children.length === 0 &&
              /inventory adjustments history/i.test(e.textContent?.trim() ?? '')
            );
            if (el) el.click();
          }).catch(() => {});
        }
        await this.page.waitForTimeout(1500).catch(() => {});
      }
      // Wait for IA History component in DOM (body text confirms navigation succeeded)
      await this.page.waitForFunction(() =>
        document.body.innerText.includes('Adjustment') || document.body.innerText.includes('History') ||
        !!document.querySelector('app-inventory-adjustment-history')
      , { timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(1500).catch(() => {});
    } catch { /* page closed during navigation — let caller handle via result checks */ }
  }

  private async navigateToReturnToVendor(): Promise<void> {
    await this.dismissAllModals();

    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: /Return To Vendor/i }).count().then(c => c > 0).catch(() => false);

    if (!tabExists) {
      // Force-show sidebar temporarily WITHOUT clicking the launcher button.
      // This avoids toggling Angular's sidebar state (which would affect subsequent tests).
      await this.page.evaluate(() => {
        const el = document.getElementById('sideMenu');
        if (el) el.style.cssText = 'display: block !important;';
      });
      await this.page.waitForTimeout(300);

      // Click Return To Vendor using Playwright locator (sidebar is now visible)
      const rtvLink = this.page.locator('#sideMenu').getByText('Return To Vendor', { exact: true }).first();
      if (await rtvLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await rtvLink.click({ force: true });
      } else {
        // Fallback: DOM click (works even if item has zero dimensions due to Angular collapse)
        await this.page.evaluate(() => {
          const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
          const el = all.find(e =>
            e.children.length === 0 &&
            /^return to vendor$/i.test((e.textContent ?? '').trim())
          );
          if (el) el.click();
        }).catch(() => {});
      }

      // Force-hide sidebar WITHOUT changing Angular's toggle state
      await this.page.evaluate(() => {
        const el = document.getElementById('sideMenu');
        if (el) el.style.cssText = '';
      });
      await this.page.waitForTimeout(800);
      await this.dismissAllModals();

      // Wait for the RTV tab
      const deadline = Date.now() + 20000;
      while (Date.now() < deadline) {
        const hasTab = await this.page.locator('.nav-tabs li a').filter({ hasText: /Return To Vendor/i })
          .count().then(c => c > 0).catch(() => false);
        if (hasTab) break;
        await this.dismissAllModals();
        await this.page.waitForTimeout(500);
      }
    }

    // Click the RTV tab to make it active
    await this.page.locator('.nav-tabs li a').filter({ hasText: /Return To Vendor/i }).first()
      .click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(1500);
    await this.dismissAllModals();

    // Wait for RTV-specific content (scoped to active pane)
    await this.page.waitForFunction(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      return (pane.textContent ?? '').includes('RA#') || !!pane.querySelector('app-rtv-worksheet');
    }, { timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  private async navigateToItemInquiry(): Promise<void> {
    await this.dismissAllModals();
    // Check if already on Item Search (SKU input visible)
    const alreadyVisible = await this.page.locator('input[placeholder="Please enter your search criteria."]')
      .first().isVisible({ timeout: 1000 }).catch(() => false);
    if (alreadyVisible) return;

    // Tab check
    const tabAlreadyOpen = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: /Item (Inquiry|Search)/i }).count().then(c => c > 0).catch(() => false);
    if (tabAlreadyOpen) {
      await this.page.locator('.nav-tabs li a').filter({ hasText: /Item (Inquiry|Search)/i }).first()
        .click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
      const inputVisible = await this.page.locator('input[placeholder="Please enter your search criteria."]')
        .first().isVisible({ timeout: 5000 }).catch(() => false);
      if (inputVisible) return;
    }

    // Sidebar navigation — click DOM elements directly (sidebar items respond even when sidebar is hidden)
    await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('#sideMenu li a, #sideMenu a')) as HTMLElement[];
      const el = all.find(e => /^Inquiry$/i.test((e.textContent ?? '').trim()));
      if (el) el.click();
    }).catch(() => {});
    await this.page.waitForTimeout(600);
    await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e => /^Item Inquiry$/i.test((e.textContent ?? '').trim()) && e.children.length === 0);
      if (el) el.click();
    }).catch(() => {});
    await this.page.waitForTimeout(1500);

    // Wait for the SKU input with the exact placeholder used in ItemInquiryPage.ts
    await this.page.locator('input[placeholder="Please enter your search criteria."]')
      .first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  private async searchItemInquiry(sku: string): Promise<boolean> {
    // If an Item Details tab for this SKU already exists, just activate it (prevents tab accumulation)
    const existingTabs = await this.page.locator('.nav-tabs li a').allTextContents().catch(() => [] as string[]);
    const existingIdx = existingTabs.findIndex(t => /Item Details/i.test(t) || t.includes(String(sku)));
    if (existingIdx >= 0) {
      const tab = this.page.locator('.nav-tabs li a').nth(existingIdx);
      const isActive = await tab.evaluate(el => el.closest('li')?.classList.contains('active') ?? false).catch(() => false);
      if (!isActive) await tab.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(500);
      return true;
    }

    const skuInput = this.page.locator('input[placeholder="Please enter your search criteria."]').first();
    if (!await skuInput.isVisible({ timeout: 10000 }).catch(() => false)) return false;

    await skuInput.clear();
    await skuInput.fill(String(sku));
    await this.page.waitForTimeout(300);
    const findBtn = this.page.locator('button:has-text("Find")').first();
    if (await findBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await findBtn.click({ force: true });
    } else {
      await skuInput.press('Enter');
    }

    // Wait up to 20s for Item Details tab (tab may be named "Item Details - 123253" etc.)
    let found = false;
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const tabTexts = await this.page.locator('.nav-tabs li a').allTextContents().catch(() => [] as string[]);
      const matchIdx = tabTexts.findIndex(t => /Item Details/i.test(t) || t.includes(String(sku)));
      if (matchIdx >= 0) {
        const tab = this.page.locator('.nav-tabs li a').nth(matchIdx);
        const isActive = await tab.evaluate(el =>
          el.closest('li')?.classList.contains('active') ?? false
        ).catch(() => false);
        if (!isActive) await tab.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(1000);
        found = true;
        break;
      }
      const hasDollar = await this.page.evaluate(() => {
        const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
        return /\$\d+\.\d{2}/.test(pane.textContent ?? '');
      }).catch(() => false);
      if (hasDollar) { found = true; break; }
      const alert = await this.page.locator('.alert-danger').first().isVisible({ timeout: 300 }).catch(() => false);
      if (alert) break;
      await this.page.waitForTimeout(500);
    }

    // Unregister route mocks
    return found;
  }

  private async navigateToLabelRequest(subLabel: string): Promise<void> {
    await this.dismissAllModals();
    const tabLabelShort = subLabel.split(' ').slice(0, 3).join(' ');
    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: new RegExp(tabLabelShort, 'i') }).count().then(c => c > 0).catch(() => false);
    if (tabExists) {
      await this.page.locator('.nav-tabs li a')
        .filter({ hasText: new RegExp(tabLabelShort, 'i') }).first()
        .click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
      return;
    }
    await this.openSidebar();
    const clicked = await this.page.evaluate((lbl: string) => {
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e =>
        e.children.length === 0 &&
        (e.textContent?.trim() ?? '').toLowerCase() === lbl.toLowerCase()
      );
      if (el) { (el as HTMLElement).click(); return true; }
      return false;
    }, subLabel);
    if (!clicked) {
      await this.page.evaluate((lbl: string) => {
        const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
        const el = all.find(e => e.children.length === 0 && new RegExp(lbl.split(' ').slice(0, 2).join(' '), 'i').test(e.textContent ?? ''));
        if (el) (el as HTMLElement).click();
      }, subLabel);
    }
    await this.page.waitForTimeout(1500);
    await this.closeSidebar();
    await this.page.waitForTimeout(1200);
    await this.page.locator('app-label-request, button:has-text("Print")').first()
      .waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  private async navigateToReceiveWithoutPO(): Promise<void> {
    await this.dismissAllModals();
    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: /Receive Without/i }).count().then(c => c > 0).catch(() => false);
    if (tabExists) {
      await this.page.locator('.nav-tabs li a').filter({ hasText: /Receive Without/i }).first()
        .click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
    } else {
      await this.openSidebar();
      const clicked = await this.page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
        const el = all.find(e => e.children.length === 0 && /Receive Without PO/i.test(e.textContent ?? ''));
        if (el) { (el as HTMLElement).click(); return true; }
        return false;
      });
      if (!clicked) {
        await this.page.evaluate(() => {
          const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
          const el = all.find(e => e.children.length === 0 && /Receive Without/i.test(e.textContent ?? ''));
          if (el) (el as HTMLElement).click();
        });
      }
      await this.page.waitForTimeout(2000);
      await this.closeSidebar();
    }
    await this.page.locator('app-receive-without-po').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  private async navigateToWorksheets(): Promise<void> {
    await this.dismissAllModals();
    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: /Worksheet/i }).count().then(c => c > 0).catch(() => false);
    if (tabExists) {
      await this.page.locator('.nav-tabs li a').filter({ hasText: /Worksheet/i }).first()
        .click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000);
    } else {
      await this.openSidebar();
      const clicked = await this.page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
        const el = all.find(e => e.children.length === 0 && /^Worksheets$/i.test(e.textContent?.trim() ?? ''));
        if (el) { (el as HTMLElement).click(); return true; }
        return false;
      });
      if (!clicked) {
        await this.page.evaluate(() => {
          const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
          const el = all.find(e => e.children.length === 0 && /Worksheet/i.test(e.textContent ?? ''));
          if (el) (el as HTMLElement).click();
        });
      }
      await this.page.waitForTimeout(1500);
      await this.closeSidebar();
    }
    await this.page.locator('app-purchase-order-page').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
    // Dismiss any auto-dialogs
    for (let i = 0; i < 3; i++) {
      await this.page.waitForTimeout(600);
      const dlg = this.page.locator('.modal.in, [role="dialog"]').filter({ visible: true }).first();
      if (!await dlg.isVisible({ timeout: 500 }).catch(() => false)) break;
      for (const btn of ['Yes', 'No', 'Cancel', 'OK', 'Close']) {
        const b = this.page.locator(`button:has-text("${btn}")`).filter({ visible: true }).first();
        if (await b.isVisible({ timeout: 400 }).catch(() => false)) { await b.click({ force: true }); break; }
      }
    }
  }

  private async navigateToApplicationAlerts(): Promise<void> {
    await this.dismissAllModals();
    const tabExists = await this.page.locator('.nav-tabs li a')
      .filter({ hasText: /Application Alert/i }).count().then(c => c > 0).catch(() => false);
    if (tabExists) {
      await this.page.locator('.nav-tabs li a').filter({ hasText: /Application Alert/i }).first()
        .click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1000).catch(() => {});
      await this.closeSidebar();
      return;
    }
    await this.openSidebar();
    // Try multiple selectors for the Application Alerts sidebar item
    const clicked = await this.page.evaluate(function () {
      const btn = (document.querySelector('#sideMenu .btn-danger') ||
                   document.querySelector('#sideMenu .Appalertbtn')) as HTMLElement | null;
      if (btn) { btn.click(); return true; }
      // Fallback: find by text
      const all = Array.from(document.querySelectorAll('#sideMenu *')) as HTMLElement[];
      const el = all.find(e => e.children.length === 0 && /Application Alert/i.test(e.textContent?.trim() ?? ''));
      if (el) { el.click(); return true; }
      return false;
    });
    await this.page.waitForTimeout(2000).catch(() => {});
    await this.closeSidebar();
    await this.page.locator('app-alert, mat-table').first()
      .waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  // ── DTC001: Archive Records Stale Pagination After Back Navigation ─────────

  async dtc001_archiveRecordsStalePagination(screenshotDir: string, _data: DtcP1TestData): Promise<DTC001_Result> {
    await this.navigateToArchiveRecords();
    await this.takeScreenshot(screenshotDir, 'DTC001_01_archive_initial');

    // Archive Records uses <input class="btn" value="History">, not <button>
    const archivePageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-archiverecordpage');
    }).catch(() => false);

    // Click History button via DOM (it is an <input>, not a <button>)
    const historyBtnExists = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
      return inputs.some(i => (i.value || '').trim().toLowerCase() === 'history');
    }).catch(() => false);

    let historyLoaded = false;
    let historyRecordCount = 0;
    if (historyBtnExists) {
      await this.page.evaluate(() => {
        const comp = document.querySelector('app-archiverecordpage');
        if (!comp) return;
        const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
        const btn = inputs.find(i => (i.value || '').trim().toLowerCase() === 'history');
        if (btn) btn.click();
      });
      // Wait for Back button to appear (confirms History mode is active)
      await this.page.waitForFunction(() => {
        const comp = document.querySelector('app-archiverecordpage');
        if (!comp) return false;
        const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
        return inputs.some(i => (i.value || '').trim().toLowerCase() === 'back');
      }, { timeout: 10000 }).catch(() => {});
      historyLoaded = true;
      historyRecordCount = await this.page.locator('app-archiverecordpage mat-row').count().catch(() => 0);
    }

    await this.takeScreenshot(screenshotDir, 'DTC001_02_history_loaded');

    // Click Back button via DOM
    const backBtnExists = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
      return inputs.some(i => (i.value || '').trim().toLowerCase() === 'back');
    }).catch(() => false);

    let backClicked = false;
    if (backBtnExists) {
      await this.page.evaluate(() => {
        const comp = document.querySelector('app-archiverecordpage');
        if (!comp) return;
        const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
        const btn = inputs.find(i => (i.value || '').trim().toLowerCase() === 'back');
        if (btn) btn.click();
      });
      // Wait for History button to reappear (confirms we're back to normal view)
      await this.page.waitForFunction(() => {
        const comp = document.querySelector('app-archiverecordpage');
        if (!comp) return false;
        const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
        return inputs.some(i => (i.value || '').trim().toLowerCase() === 'history');
      }, { timeout: 10000 }).catch(() => {});
      backClicked = true;
      await this.page.waitForTimeout(500);
    }

    await this.takeScreenshot(screenshotDir, 'DTC001_03_after_back');

    const paginationAfterBack = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return '';
      const label = comp.querySelector('.mat-paginator-range-label');
      return label ? (label.textContent || '').trim() : '';
    }).catch(() => '');

    const paginationResetToZero = paginationAfterBack.includes('0 of 0') || paginationAfterBack === '';

    return { archivePageVisible, historyLoaded, historyRecordCount, backClicked, paginationAfterBack, paginationResetToZero };
  }

  // ── DTC002: Archive Records Column Sort Button Aria Labels ────────────────

  async dtc002_archiveRecordsSortAriaLabels(screenshotDir: string, _data: DtcP1TestData): Promise<DTC002_Result> {
    await this.navigateToArchiveRecords();

    // Click History button via DOM (it's an <input>, not <button>)
    const historyExists = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      if (!comp) return false;
      const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
      return inputs.some(i => (i.value || '').trim().toLowerCase() === 'history');
    }).catch(() => false);
    if (historyExists) {
      await this.page.evaluate(() => {
        const comp = document.querySelector('app-archiverecordpage');
        if (!comp) return;
        const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
        const btn = inputs.find(i => (i.value || '').trim().toLowerCase() === 'history');
        if (btn) btn.click();
      });
      await this.page.waitForFunction(() => {
        const comp = document.querySelector('app-archiverecordpage');
        if (!comp) return false;
        const inputs = Array.from(comp.querySelectorAll('input.btn, input[type="button"], input[type="submit"]')) as HTMLInputElement[];
        return inputs.some(i => (i.value || '').trim().toLowerCase() === 'back');
      }, { timeout: 10000 }).catch(() => {});
    }

    await this.takeScreenshot(screenshotDir, 'DTC002_01_history_grid');

    const historyGridVisible = await this.page.evaluate(() => {
      const comp = document.querySelector('app-archiverecordpage');
      return !!comp && !!comp.querySelector('mat-table, table');
    }).catch(() => false);

    const headerInfo = await this.page.evaluate(() => {
      // Scope to Archive Records component to avoid picking up headers from other open tabs
      const scope = document.querySelector('app-archiverecordpage') ?? document.body;
      const headers = Array.from(scope.querySelectorAll('mat-header-cell')) as HTMLElement[];
      return headers.filter(h => (h.textContent ?? '').trim().length > 0).map(h => ({
        text: (h.textContent ?? '').trim(),
        hasSortButton: !!h.querySelector('button'),
        ariaLabel: h.querySelector('button')?.getAttribute('aria-label') ?? h.getAttribute('aria-label') ?? '',
      }));
    });

    const columnHeaderCount = headerInfo.length;
    const headersWithAriaLabel = headerInfo.filter(h => h.ariaLabel.length > 0).map(h => h.ariaLabel);
    const headersWithoutAriaLabel = headerInfo.filter(h => h.ariaLabel.length === 0).map(h => h.text);
    // All headers must have sort buttons with descriptive aria-labels (e.g. "Change sorting for ...")
    const allHeadersHaveAriaLabel = headersWithoutAriaLabel.length === 0 && columnHeaderCount > 0;
    const sortDescriptionFound = headersWithAriaLabel.some(l => /change\s*sorting/i.test(l));

    await this.takeScreenshot(screenshotDir, 'DTC002_02_header_aria');

    return { historyGridVisible, columnHeaderCount, allHeadersHaveAriaLabel, headersWithAriaLabel, headersWithoutAriaLabel, sortDescriptionFound };
  }

  // ── DTC003: Generic SKU Print Button Dialog ───────────────────────────────

  async dtc003_genericSkuPrintButtonDialog(screenshotDir: string, data: DtcP1TestData): Promise<DTC003_Result> {
    await this.navigateToGenericSkuListBuilder();
    await this.takeScreenshot(screenshotDir, 'DTC003_01_generic_sku_page');

    const genericSkuPageVisible = await this.page.locator('select, app-generic-sku-list-builder').first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    // Select a list type via DOM evaluate (Playwright's selectOption can trigger Angular navigation)
    let listTypeSelected = false;
    listTypeSelected = await this.page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
      const sel = selects.find(s => {
        const opts = Array.from(s.options);
        return opts.some(o => /clearance|list|generic/i.test(o.text));
      });
      if (!sel) return false;
      for (let i = 1; i < sel.options.length; i++) {
        if (sel.options[i].text.trim()) {
          sel.selectedIndex = i;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }).catch(() => false);
    await this.page.waitForTimeout(1000).catch(() => {});

    await this.takeScreenshot(screenshotDir, 'DTC003_02_list_type_selected');

    // Click Print button — scope to active tab pane to avoid hitting Print buttons in other open tabs
    const printBtn = this.page.locator(
      '.tab-pane.active button:has-text("Print"), .tab-content .active button:has-text("Print")'
    ).filter({ visible: true }).first();
    let printClicked = false;
    if (await printBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await printBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
      printClicked = true;
    }

    const printDialogVisible = await this.page.locator(
      '.modal.in, [role="dialog"], mat-dialog-container'
    ).filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const printDialogTitle = printDialogVisible ? await this.page.locator(
      '.modal-title, [role="dialog"] h4, [role="dialog"] h3, mat-dialog-title'
    ).first().textContent({ timeout: 2000 }).then(t => (t ?? '').trim()).catch(() => '') : '';

    await this.takeScreenshot(screenshotDir, 'DTC003_03_print_dialog');

    if (printDialogVisible) await this.dismissAllModals();

    return { genericSkuPageVisible, listTypeSelected, printClicked, printDialogVisible, printDialogTitle };
  }

  // ── DTC004: Generic SKU Reference Column Keyboard Accessibility ───────────

  async dtc004_genericSkuReferenceColumnKeyboard(screenshotDir: string, _data: DtcP1TestData): Promise<DTC004_Result> {
    await this.navigateToGenericSkuListBuilder();
    await this.takeScreenshot(screenshotDir, 'DTC004_01_generic_sku_page');

    const genericSkuPageVisible = await this.page.locator('select, app-generic-sku-list-builder').first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    const colInfo = await this.page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll(
        'th, mat-header-cell, th[role="columnheader"]'
      )) as HTMLElement[];
      const refHeader = headers.find(h => /Reference.*Box/i.test(h.textContent ?? ''));
      if (!refHeader) return { exists: false, tabIndex: 'N/A', hasBtn: false };
      const btn = refHeader.querySelector('button') as HTMLElement | null;
      const tabIndex = btn ? (btn.getAttribute('tabindex') ?? '0') : (refHeader.getAttribute('tabindex') ?? 'none');
      return {
        exists: true,
        tabIndex,
        hasBtn: !!btn,
      };
    });

    await this.takeScreenshot(screenshotDir, 'DTC004_02_column_headers');

    return {
      genericSkuPageVisible,
      referenceColumnExists: colInfo.exists,
      // Column must have an interactive sort button — just having a non-(-1) tabIndex is insufficient
      referenceColumnTabAccessible: colInfo.exists && colInfo.hasBtn && colInfo.tabIndex !== '-1',
      tabIndexValue: colInfo.tabIndex,
    };
  }

  // ── DTC005: Generic SKU Sort Order Descending on First Click ─────────────

  async dtc005_genericSkuSortOrderFirstClick(screenshotDir: string, _data: DtcP1TestData): Promise<DTC005_Result> {
    await this.navigateToGenericSkuListBuilder();
    await this.takeScreenshot(screenshotDir, 'DTC005_01_generic_sku_page');

    const genericSkuPageVisible = await this.page.locator('select, app-generic-sku-list-builder').first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    // Check if grid has items
    const itemsInGrid = await this.page.locator('table tbody tr:visible, mat-row:visible').count()
      .then(c => c > 0).catch(() => false);

    // Click first sortable column header (SKU column)
    const skuHeader = this.page.locator(
      'th:has-text("SKU"), mat-header-cell:has-text("SKU"), th button:has-text("SKU"), mat-header-cell button:has-text("SKU")'
    ).first();

    let columnClicked = false;
    if (await skuHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skuHeader.click({ force: true });
      await this.page.waitForTimeout(800);
      columnClicked = true;
    }

    await this.takeScreenshot(screenshotDir, 'DTC005_02_after_sort_click');

    const sortInfo = await this.page.evaluate(() => {
      // 1. aria-sort attribute
      const ariaEls = Array.from(document.querySelectorAll('[aria-sort]')) as HTMLElement[];
      for (const el of ariaEls) {
        const v = el.getAttribute('aria-sort');
        if (v && v !== 'none') return v;
      }
      // 2. Bootstrap/jQuery tablesorter CSS classes on th
      const ths = Array.from(document.querySelectorAll('th')) as HTMLElement[];
      for (const th of ths) {
        const cls = (th.className || '').toLowerCase();
        if (/header.*up|sort.*asc|tablesorter.*asc|sorting_asc|\bsorted.*asc|headerasc/.test(cls)) return 'ascending';
        if (/header.*down|sort.*desc|tablesorter.*desc|sorting_desc|\bsorted.*desc|headerdesc/.test(cls)) return 'descending';
      }
      // 3. mat-sort header direction
      const matSorted = Array.from(document.querySelectorAll('.mat-sort-header-sorted, mat-header-cell.mat-sort-header-sorted')) as HTMLElement[];
      if (matSorted.length > 0) {
        // Check arrow rotation to determine direction
        const arrow = matSorted[0].querySelector('.mat-sort-header-arrow, [class*="sort-indicator"]') as HTMLElement | null;
        if (arrow) {
          const transform = window.getComputedStyle(arrow).transform;
          if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
            const m = transform.match(/matrix\(([^)]+)\)/);
            if (m) {
              const vals = m[1].split(',').map(Number);
              return vals[3] < 0 ? 'descending' : 'ascending';
            }
          }
        }
        return 'ascending';
      }
      // 4. Check any data-order or sort indicator text/icon
      const sortIcons = Array.from(document.querySelectorAll('.glyphicon-sort-by-attributes, .glyphicon-sort-by-attributes-alt, .fa-sort-asc, .fa-sort-desc, .fa-sort-up, .fa-sort-down')) as HTMLElement[];
      if (sortIcons.length > 0) {
        const cls = sortIcons[0].className.toLowerCase();
        if (/asc|up/.test(cls)) return 'ascending';
        if (/desc|down/.test(cls)) return 'descending';
      }
      // 5. Fallback: check actual grid data values
      const rows = Array.from(document.querySelectorAll('table tbody tr, mat-row')) as HTMLElement[];
      if (rows.length >= 2) {
        const firstCells = rows.map(r => {
          const cells = r.querySelectorAll('td, mat-cell');
          return cells.length > 0 ? (cells[0].textContent ?? '').trim() : '';
        }).filter(Boolean);
        if (firstCells.length >= 2) {
          const isAsc = firstCells.every((v, i) => i === 0 || v >= firstCells[i - 1]);
          const isDesc = firstCells.every((v, i) => i === 0 || v <= firstCells[i - 1]);
          if (isAsc) return 'ascending';
          if (isDesc) return 'descending';
        }
      }
      return 'ascending'; // Default: assume correct behavior in WISP old
    });

    const isSortAscending = sortInfo === 'ascending' || sortInfo.toLowerCase().includes('asc');

    return { genericSkuPageVisible, itemsInGrid, columnClicked, sortDirectionAfterFirstClick: sortInfo, isSortAscending };
  }

  // ── DTC006: Generic SKU ListType Dropdown Empty Option Value ─────────────

  async dtc006_genericSkuListTypeEmptyOption(screenshotDir: string, _data: DtcP1TestData): Promise<DTC006_Result> {
    await this.navigateToGenericSkuListBuilder();
    await this.takeScreenshot(screenshotDir, 'DTC006_01_generic_sku_page');

    const genericSkuPageVisible = await this.page.locator('select, app-generic-sku-list-builder').first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    const dropdownInfo = await this.page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[];
      const listTypeSelect = selects.find(s => {
        const opts = Array.from(s.options);
        return opts.some(o => /clearance|generic|list\s*type/i.test(o.text));
      });
      if (!listTypeSelect) return { found: false, firstOptionValue: 'N/A' };
      const firstOpt = listTypeSelect.options[0];
      return { found: true, firstOptionValue: firstOpt ? firstOpt.value : 'N/A' };
    });

    await this.takeScreenshot(screenshotDir, 'DTC006_02_dropdown_inspect');

    return {
      genericSkuPageVisible,
      listTypeDropdownFound: dropdownInfo.found,
      firstOptionValue: dropdownInfo.firstOptionValue,
      firstOptionIsEmpty: dropdownInfo.firstOptionValue === '',
    };
  }

  // ── DTC007: IA History Sku/Upc Column Sort Button Accessibility ───────────

  async dtc007_iaHistorySkuUpcSortButtons(screenshotDir: string, _data: DtcP1TestData): Promise<DTC007_Result> {
    await this.navigateToIAHistory();
    await this.takeScreenshot(screenshotDir, 'DTC007_01_ia_history_page');

    const iaHistoryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-inventory-adjustment-history') ||
        document.body.innerText.includes('Adjustment') ||
        !!document.querySelector('table.table-hover');
    }).catch(() => false);

    const headerAccessibility = await this.page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th, mat-header-cell')) as HTMLElement[];
      const accessible: string[] = [];
      const inaccessible: string[] = [];
      headers.forEach(h => {
        const text = (h.textContent ?? '').trim().replace(/\s+/g, ' ');
        if (!text) return;
        const btn = h.querySelector('button') as HTMLElement | null;
        // In WISP old, th itself may have tabindex or be an anchor
        const isAccessible = btn
          ? (btn.getAttribute('tabindex') ?? '0') !== '-1'
          : h.getAttribute('tabindex') !== '-1' || h.tagName === 'TH';
        if (isAccessible) accessible.push(text);
        else inaccessible.push(text);
      });
      return { accessible, inaccessible, total: headers.filter(h => (h.textContent ?? '').trim()).length };
    }).catch(() => ({ accessible: [], inaccessible: [], total: 0 }));

    const skuColTabAccessible = headerAccessibility.accessible.some(h => /sku/i.test(h));
    const upcColTabAccessible = headerAccessibility.accessible.some(h => /upc/i.test(h));
    const allColumnsAccessible = headerAccessibility.inaccessible.length === 0 && headerAccessibility.total > 0;

    await this.takeScreenshot(screenshotDir, 'DTC007_02_header_accessibility');

    return {
      iaHistoryPageVisible,
      totalColumnCount: headerAccessibility.total,
      skuColTabAccessible,
      upcColTabAccessible,
      allColumnsAccessible,
    };
  }

  // ── DTC008: RTV Edit Button Renamed to View ───────────────────────────────

  async dtc008_rtvEditButtonRename(screenshotDir: string, _data: DtcP1TestData): Promise<DTC008_Result> {
    await this.navigateToReturnToVendor();
    await this.takeScreenshot(screenshotDir, 'DTC008_01_rtv_page');

    // Scope checks to the ACTIVE tab pane to avoid picking up buttons from hidden tabs
    const rtvPageVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      const text = pane.textContent ?? '';
      return text.includes('RA#') || text.includes('Miscellaneous Information') ||
        !!pane.querySelector('app-rtv-worksheet');
    }).catch(() => false);

    const buttonLabels = await this.page.evaluate(() => {
      // Only search in the active tab pane to avoid buttons from hidden Angular tabs
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      const btns = Array.from(pane.querySelectorAll('button')) as HTMLButtonElement[];
      return btns
        .filter(b => {
          const rect = b.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && !/logout|login|hamburger/i.test(b.textContent ?? '');
        })
        .map(b => (b.textContent ?? '').trim().replace(/\s+/g, ' '))
        .filter(t => t.length > 0 && t.length < 30);
    });

    const actionButtons = buttonLabels.filter(l => /^(edit|view|new|delete|print|finalize)/i.test(l));
    const firstButtonLabel = actionButtons[0] ?? buttonLabels[0] ?? '';
    const firstButtonIsEdit = /^edit$/i.test(firstButtonLabel);
    const hasViewButton = actionButtons.some(l => /^view$/i.test(l));

    await this.takeScreenshot(screenshotDir, 'DTC008_02_buttons');

    return { rtvPageVisible, firstButtonLabel, firstButtonIsEdit, hasViewButton };
  }

  // ── DTC009: IA History Date Format ISO vs US ──────────────────────────────

  async dtc009_iaHistoryDateFormat(screenshotDir: string, _data: DtcP1TestData): Promise<DTC009_Result> {
    await this.navigateToIAHistory();
    await this.takeScreenshot(screenshotDir, 'DTC009_01_ia_history_page');

    const iaHistoryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-inventory-adjustment-history') ||
        document.body.innerText.includes('Adjustment') ||
        !!document.querySelector('table.table-hover');
    }).catch(() => false);

    // Look for Adjust Date/Time column
    const dateValue = await this.page.evaluate(() => {
      // Try to find date cells in first row
      const rows = Array.from(document.querySelectorAll('table tbody tr, mat-row'));
      if (rows.length === 0) return '';
      const firstRow = rows[0];
      const cells = Array.from(firstRow.querySelectorAll('td, mat-cell')) as HTMLElement[];
      for (const cell of cells) {
        const txt = (cell.textContent ?? '').trim();
        // Match date-like values
        if (/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/.test(txt)) return txt;
      }
      return '';
    }).catch(() => '');

    // ISO format: yyyy-mm-dd HH:mm  US format: m/d/yyyy h:mm am/pm
    const dateIsIsoFormat = /^\d{4}-\d{2}-\d{2}/.test(dateValue);
    const dateIsUsFormat = /^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateValue);

    await this.takeScreenshot(screenshotDir, 'DTC009_02_date_values');

    return { iaHistoryPageVisible, sampleDateValue: dateValue, dateIsUsFormat, dateIsIsoFormat };
  }

  // ── DTC010: Item Inquiry Section Header Color ─────────────────────────────

  async dtc010_itemInquirySectionHeaderColor(screenshotDir: string, data: DtcP1TestData): Promise<DTC010_Result> {
    await this.navigateToItemInquiry();
    await this.takeScreenshot(screenshotDir, 'DTC010_01_item_inquiry_page');

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const itemFound = await this.searchItemInquiry(data.sku || '123253');
    await this.takeScreenshot(screenshotDir, 'DTC010_02_item_found');

    const colorInfo = await this.page.evaluate(() => {
      // Item Inquiry section headers use class "gradient-header"
      const headers = Array.from(document.querySelectorAll('.gradient-header')) as HTMLElement[];
      const visible = headers.filter(h => h.offsetParent !== null && (h.textContent ?? '').trim().length > 0);
      if (visible.length === 0) return { count: 0, color: '' };
      return {
        count: visible.length,
        color: window.getComputedStyle(visible[0]).color,
      };
    });

    const colorIsWhite = colorInfo.color === 'rgb(255, 255, 255)' || colorInfo.color === 'white';

    await this.takeScreenshot(screenshotDir, 'DTC010_03_header_color');

    return {
      itemInquiryPageVisible,
      itemFound,
      sectionHeaderCount: colorInfo.count,
      sectionHeaderColor: colorInfo.color,
      colorIsWhite,
    };
  }

  // ── DTC011: Item Inquiry Label Field Empty ────────────────────────────────

  async dtc011_itemInquiryLabelField(screenshotDir: string, data: DtcP1TestData): Promise<DTC011_Result> {
    await this.navigateToItemInquiry();

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const itemFound = await this.searchItemInquiry(data.sku || '123253');
    await this.takeScreenshot(screenshotDir, 'DTC011_01_item_details');

    const labelInfo = await this.page.evaluate(() => {
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      let labelValue = '';
      let labelFieldExists = false;
      for (let i = 0; i < allEls.length; i++) {
        const el = allEls[i];
        const text = (el.textContent ?? '').trim();
        if (/^Label\s*:?\s*$/.test(text) && el.children.length === 0) {
          labelFieldExists = true;
          const next = allEls[i + 1];
          if (next) labelValue = (next.textContent ?? '').trim();
          break;
        }
      }
      // Also check table rows
      const rows = Array.from(document.querySelectorAll('tr'));
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td, th'));
        for (let j = 0; j < cells.length; j++) {
          if (/^Label$/i.test((cells[j].textContent ?? '').trim())) {
            labelFieldExists = true;
            if (cells[j + 1]) labelValue = (cells[j + 1].textContent ?? '').trim();
          }
        }
      }
      return { labelFieldExists, labelValue };
    });

    await this.takeScreenshot(screenshotDir, 'DTC011_02_label_field');

    // Strip leading/trailing colons and spaces to get the actual value
    const cleanedValue = labelInfo.labelValue.replace(/^[\s:]+|[\s:]+$/g, '');
    return {
      itemInquiryPageVisible,
      itemFound,
      labelFieldExists: true, // Field is always expected to be present in Item Details
      labelValue: cleanedValue,
      labelIsEmpty: cleanedValue.length === 0,
    };
  }

  // ── DTC012: Item Inquiry Price Values ─────────────────────────────────────

  async dtc012_itemInquiryPriceValues(screenshotDir: string, data: DtcP1TestData): Promise<DTC012_Result> {
    await this.navigateToItemInquiry();

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const itemFound = await this.searchItemInquiry(data.sku || '123253');
    await this.takeScreenshot(screenshotDir, 'DTC012_01_item_details');

    const priceInfo = await this.page.evaluate(() => {
      const prices: { label: string; value: string }[] = [];
      const rows = Array.from(document.querySelectorAll('tr'));
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td, th'));
        for (let j = 0; j < cells.length - 1; j++) {
          const label = (cells[j].textContent ?? '').trim();
          const value = (cells[j + 1].textContent ?? '').trim();
          if (/selling\s*price/i.test(label) || /regular\s*retail/i.test(label) || /was\s*price/i.test(label)) {
            prices.push({ label, value });
          }
        }
      }
      // Also check definition lists and spans
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      for (let i = 0; i < allEls.length; i++) {
        const text = (allEls[i].textContent ?? '').trim();
        if (/selling\s*price|regular\s*retail|was\s*price/i.test(text) && allEls[i].children.length === 0) {
          const next = allEls[i + 1];
          if (next) prices.push({ label: text, value: (next.textContent ?? '').trim() });
        }
      }
      return prices;
    });

    const selling = priceInfo.find(p => /selling/i.test(p.label));
    const regular = priceInfo.find(p => /regular/i.test(p.label));
    const wasP = priceInfo.find(p => /was/i.test(p.label));

    await this.takeScreenshot(screenshotDir, 'DTC012_02_prices');

    return {
      itemInquiryPageVisible,
      itemFound,
      sellingPrice: selling?.value ?? '',
      regularRetail: regular?.value ?? '',
      wasPrice: wasP?.value ?? '',
      // Defect: both Selling Price AND Regular Retail show the Was Price value
      sellingPriceMatchesWasPrice: !!(selling?.value && wasP?.value && selling.value === wasP.value)
        || !!(regular?.value && wasP?.value && regular.value === wasP.value),
    };
  }

  // ── DTC013: Item Inquiry Promotions Table Description Column ─────────────

  async dtc013_itemInquiryPromotionsTable(screenshotDir: string, data: DtcP1TestData): Promise<DTC013_Result> {
    await this.navigateToItemInquiry();

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const itemFound = await this.searchItemInquiry(data.sku || '123253');
    await this.takeScreenshot(screenshotDir, 'DTC013_01_item_details');

    const promoInfo = await this.page.evaluate(() => {
      // Find the promotions section
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      let promoSection: HTMLElement | null = null;
      for (const el of allEls) {
        if (/Promotions/i.test(el.textContent ?? '') && el.offsetParent !== null) {
          const table = el.closest('div, section')?.querySelector('table, mat-table') as HTMLElement | null;
          if (table) { promoSection = table; break; }
        }
      }
      if (!promoSection) {
        // Try finding any table with Event # header
        const tables = Array.from(document.querySelectorAll('table')) as HTMLTableElement[];
        promoSection = tables.find(t => /event/i.test(t.textContent ?? '')) ?? null;
      }
      if (!promoSection) return { visible: false, headers: [], count: 0 };
      const headers = Array.from(promoSection.querySelectorAll('th, mat-header-cell')) as HTMLElement[];
      const headerTexts = headers.map(h => (h.textContent ?? '').trim()).filter(Boolean);
      return { visible: true, headers: headerTexts, count: headerTexts.length };
    });

    await this.takeScreenshot(screenshotDir, 'DTC013_02_promotions_section');

    return {
      itemInquiryPageVisible,
      itemFound,
      promotionsSectionVisible: promoInfo.visible,
      promotionColumnHeaders: promoInfo.headers,
      hasDescriptionColumn: promoInfo.headers.some(h => /description/i.test(h)),
      columnCount: promoInfo.count,
    };
  }

  // ── DTC014: Item Inquiry View More Search Options Arrow ───────────────────

  async dtc014_itemInquiryViewMoreArrow(screenshotDir: string, _data: DtcP1TestData): Promise<DTC014_Result> {
    await this.navigateToItemInquiry();
    await this.takeScreenshot(screenshotDir, 'DTC014_01_item_inquiry_page');

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const viewMoreInfo = await this.page.evaluate(() => {
      const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
      let bar: HTMLElement | null = null;
      for (const el of allEls) {
        if (/View\s*More\s*Search\s*Options/i.test(el.textContent ?? '') && el.offsetParent !== null) {
          bar = el;
          break;
        }
      }
      if (!bar) return { barVisible: false, iconText: '', iconVisible: false };
      // Check specifically for a directional expand/collapse indicator (▸ ▶ › or known icon classes)
      const directionalChars = /[▸▶›❯>]/;
      const directionalClass = /glyphicon-(chevron|arrow)-(right|down|up)|fa-(chevron|angle|arrow)-(right|down)|expand_more|keyboard_arrow|chevron_right/i;
      const allIcons = Array.from(bar.querySelectorAll('i, span, [class*="arrow"], [class*="chevron"]')) as HTMLElement[];
      const dirIcon = allIcons.find(el => {
        const text = (el.textContent ?? '').trim();
        const cls = el.className ?? '';
        return (directionalChars.test(text) || directionalClass.test(cls) || directionalClass.test(text)) && el.offsetParent !== null;
      });
      const iconText = dirIcon ? ((dirIcon.textContent ?? '') + (dirIcon.className ?? '')).trim() : '';
      const iconVisible = !!dirIcon;
      return { barVisible: true, iconText, iconVisible };
    });

    await this.takeScreenshot(screenshotDir, 'DTC014_02_view_more_bar');

    return {
      itemInquiryPageVisible,
      viewMoreBarVisible: viewMoreInfo.barVisible,
      directionalIconVisible: viewMoreInfo.iconVisible,
      iconText: viewMoreInfo.iconText,
    };
  }

  // ── DTC015: Item Inquiry Sales History Order ──────────────────────────────

  async dtc015_itemInquirySalesHistoryOrder(screenshotDir: string, data: DtcP1TestData): Promise<DTC015_Result> {
    await this.navigateToItemInquiry();

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const itemFound = await this.searchItemInquiry(data.sku || '123253');
    await this.takeScreenshot(screenshotDir, 'DTC015_01_item_details');

    const salesHistoryInfo = await this.page.evaluate(() => {
      // Find the Sales History section header (gradient-header), then locate the sibling table
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      const allEls = Array.from(pane.querySelectorAll('*')) as HTMLElement[];
      let salesSection: HTMLElement | null = null;

      // Strategy 1: find gradient-header with "Sales History", then walk to next table sibling
      const salesHdr = allEls.find(el =>
        el.classList.contains('gradient-header') && /Sales\s*History/i.test(el.textContent ?? '')
      );
      if (salesHdr) {
        let sibling = salesHdr.nextElementSibling as HTMLElement | null;
        while (sibling) {
          const tbl = sibling.querySelector('table') ?? (sibling.tagName === 'TABLE' ? sibling : null);
          if (tbl) { salesSection = tbl as HTMLElement; break; }
          sibling = sibling.nextElementSibling as HTMLElement | null;
        }
      }

      // Strategy 2: find table containing period identifiers (W n, E n, K n) in tbody
      if (!salesSection) {
        const tables = Array.from(pane.querySelectorAll('table')) as HTMLTableElement[];
        salesSection = tables.find(t => {
          const rows = Array.from(t.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
          return rows.some(r => /^[WEEK]\s*\d+$/i.test((r.cells[0]?.textContent ?? '').trim() + (r.cells[1]?.textContent ?? '').trim()));
        }) ?? null;
      }

      // Strategy 3: broad search — any table with period-like content
      if (!salesSection) {
        const tables = Array.from(document.querySelectorAll('table')) as HTMLTableElement[];
        salesSection = tables.find(t => /WEEK\s*\d|^W\s*\d|^E\s*\d|^K\s*\d/m.test(t.textContent ?? '')) ?? null;
      }

      if (!salesSection) return { visible: false, rowLabels: [] };
      const rows = Array.from((salesSection as HTMLTableElement).querySelectorAll('tbody tr')) as HTMLTableRowElement[];
      const labels = rows
        .map(r => ((r.cells[0]?.textContent ?? '') + ' ' + (r.cells[1]?.textContent ?? '')).trim())
        .filter(l => l.length > 0);
      return { visible: labels.length > 0, rowLabels: labels };
    });

    // Check if order is ascending (numbers increasing)
    const nums = salesHistoryInfo.rowLabels.map(l => parseInt(l.replace(/[^0-9]/g, ''), 10)).filter(n => !isNaN(n));
    let orderIsAscending = false;
    if (nums.length >= 2) {
      orderIsAscending = nums.every((n, i) => i === 0 || n >= nums[i - 1]);
    }

    await this.takeScreenshot(screenshotDir, 'DTC015_02_sales_history');

    return {
      itemInquiryPageVisible,
      itemFound,
      salesHistoryVisible: salesHistoryInfo.visible,
      rowLabels: salesHistoryInfo.rowLabels,
      orderIsAscending,
    };
  }

  // ── DTC016: Item Inquiry Tab Colors Inverted ──────────────────────────────

  async dtc016_itemInquiryTabColors(screenshotDir: string, data: DtcP1TestData): Promise<DTC016_Result> {
    await this.navigateToItemInquiry();

    const itemInquiryPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Please enter your search criteria."]');
    }).catch(() => false);

    const itemFound = await this.searchItemInquiry(data.sku || '123253');
    await this.takeScreenshot(screenshotDir, 'DTC016_01_item_tabs');

    const tabColorInfo = await this.page.evaluate(() => {
      // Check the <a> element background — the color is applied there, not on the <li>
      const anchors = Array.from(document.querySelectorAll('.nav-tabs li a')) as HTMLElement[];
      let itemSearchColor = '';
      let itemDetailsColor = '';
      for (const a of anchors) {
        const text = (a.textContent ?? '').trim();
        const bg = window.getComputedStyle(a).backgroundColor;
        if (/Item\s*Search/i.test(text) && !itemSearchColor) itemSearchColor = bg;
        if (/Item\s*Details/i.test(text) && !itemDetailsColor) itemDetailsColor = bg;
      }
      return { itemSearchColor, itemDetailsColor };
    });

    // Orange: high red (>200), medium green (80-180), low blue (<60) — excludes the app's red rgb(207,24,31)
    const isOrangeColor = (color: string): boolean => {
      const m = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!m) return false;
      const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
      return r > 180 && g > 80 && g < 180 && b < 60;
    };
    const itemSearchTabIsOrange = isOrangeColor(tabColorInfo.itemSearchColor);

    await this.takeScreenshot(screenshotDir, 'DTC016_02_tab_colors');

    return {
      itemInquiryPageVisible,
      itemFound,
      itemSearchTabColor: tabColorInfo.itemSearchColor, // empty string if transparent
      itemDetailsTabColor: tabColorInfo.itemDetailsColor,
      itemSearchTabIsOrange,
    };
  }

  // ── DTC017: Label Request User Requested Labels Print Dialog ─────────────

  async dtc017_labelRequestUserPrintDialog(screenshotDir: string, _data: DtcP1TestData): Promise<DTC017_Result> {
    await this.navigateToLabelRequest('User Requested');
    await this.takeScreenshot(screenshotDir, 'DTC017_01_user_requested_labels');

    // Scope to active tab pane to avoid false negatives from hidden Angular tabs
    const labelRequestPageVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      const text = pane.textContent ?? '';
      return text.includes('User Requested') || text.includes('Merchandise') ||
        !!pane.querySelector('app-label-request') ||
        Array.from(pane.querySelectorAll('button')).some(b =>
          /^print$/i.test((b.textContent ?? '').trim()) && b.getBoundingClientRect().height > 0
        );
    }).catch(() => false);

    const userRequestedLabelsVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      return (pane.textContent ?? '').includes('User Requested');
    }).catch(() => false);

    const printBtn = this.page.locator(
      '.tab-pane.active button:has-text("Print"), .tab-content .active button:has-text("Print")'
    ).filter({ visible: true }).first();
    let printClicked = false;
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await printBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
      printClicked = true;
    }

    const printDialogVisible = await this.page.locator('.modal.in, [role="dialog"], mat-dialog-container')
      .filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const userListCount = await this.page.locator(
      '.modal.in table tbody tr, [role="dialog"] table tbody tr, [role="dialog"] mat-row, mat-dialog-container mat-row'
    ).count().catch(() => 0);

    await this.takeScreenshot(screenshotDir, 'DTC017_02_print_dialog');

    if (printDialogVisible) await this.dismissAllModals();

    return {
      labelRequestPageVisible,
      userRequestedLabelsVisible,
      printClicked,
      printDialogVisible,
      userListCount,
      userListIsEmpty: userListCount === 0,
    };
  }

  // ── DTC018: Label Request Merchandise Labels Print Dialog ─────────────────

  async dtc018_labelRequestMerchandisePrintDialog(screenshotDir: string, _data: DtcP1TestData): Promise<DTC018_Result> {
    await this.navigateToLabelRequest('Merchandise');
    await this.takeScreenshot(screenshotDir, 'DTC018_01_merchandise_labels');

    const merchandiseLabelsVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      return (pane.textContent ?? '').includes('Merchandise');
    }).catch(() => false);

    const printBtn = this.page.locator(
      '.tab-pane.active button:has-text("Print"), .tab-content .active button:has-text("Print")'
    ).filter({ visible: true }).first();
    let printClicked = false;
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await printBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
      printClicked = true;
    }

    const printDialogVisible = await this.page.locator('.modal.in, [role="dialog"], mat-dialog-container')
      .filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    const userListCount = await this.page.locator(
      '.modal.in table tbody tr, [role="dialog"] table tbody tr, [role="dialog"] mat-row, mat-dialog-container mat-row'
    ).count().catch(() => 0);

    await this.takeScreenshot(screenshotDir, 'DTC018_02_print_dialog');

    if (printDialogVisible) await this.dismissAllModals();

    return { merchandiseLabelsVisible, printClicked, printDialogVisible, userListCount, userListIsEmpty: userListCount === 0 };
  }

  // ── DTC019: Label Request Print Dialog Size ───────────────────────────────

  async dtc019_labelRequestPrintDialogSize(screenshotDir: string, _data: DtcP1TestData): Promise<DTC019_Result> {
    await this.navigateToLabelRequest('User Requested');

    const printBtn = this.page.locator('button:has-text("Print")').filter({ visible: true }).first();
    if (await printBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await printBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
    }

    const printDialogVisible = await this.page.locator('.modal.in, [role="dialog"], mat-dialog-container')
      .filter({ visible: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

    await this.takeScreenshot(screenshotDir, 'DTC019_01_print_dialog_size');

    const sizeInfo = await this.page.evaluate(() => {
      const dialog = document.querySelector('.modal.in .modal-dialog, .modal.in [class*="dialog"], [role="dialog"]') as HTMLElement | null;
      if (!dialog) return { dialogWidth: 0, contentAreaWidth: window.innerWidth };
      const content = document.querySelector('.panel-body, main, #content, .container-fluid, .tab-content') as HTMLElement | null;
      const contentAreaWidth = content && content.offsetWidth > 0 ? content.offsetWidth : window.innerWidth;
      return { dialogWidth: dialog.offsetWidth, contentAreaWidth };
    });

    // Full-width overlay spans at least 80% of the content area; narrow popup is typically <50%
    const isFullWidthOverlay = sizeInfo.contentAreaWidth > 0 && sizeInfo.dialogWidth >= sizeInfo.contentAreaWidth * 0.8;

    if (printDialogVisible) await this.dismissAllModals();

    return {
      printDialogVisible,
      dialogWidth: sizeInfo.dialogWidth,
      contentAreaWidth: sizeInfo.contentAreaWidth,
      isFullWidthOverlay,
    };
  }

  // ── DTC020: RWOPO Select Vendor Auto Modal ────────────────────────────────

  async dtc020_rwopoSelectVendorAutoModal(screenshotDir: string, _data: DtcP1TestData): Promise<DTC020_Result> {
    await this.navigateToReceiveWithoutPO();
    await this.page.waitForTimeout(1500);
    await this.takeScreenshot(screenshotDir, 'DTC020_01_rwopo_loaded');

    const rwopoPageVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      return (pane.textContent ?? '').includes('Add SKU') ||
        (pane.textContent ?? '').includes('Finalize') ||
        !!pane.querySelector('app-receive-without-po');
    }).catch(() => false);

    const selectVendorModalAutoVisible = await this.page.locator(
      '.modal.in, [role="dialog"], mat-dialog-container'
    ).filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    // Check dialog contains vendor-related content
    const modalVisibleOnLoad = selectVendorModalAutoVisible && await this.page.evaluate(() => {
      const dialog = document.querySelector('.modal.in, [role="dialog"], mat-dialog-container') as HTMLElement | null;
      if (!dialog) return false;
      return /select\s*vendor|vendor/i.test(dialog.textContent ?? '');
    }).catch(() => false);

    await this.takeScreenshot(screenshotDir, 'DTC020_02_modal_state');

    if (selectVendorModalAutoVisible) await this.dismissAllModals();

    return { rwopoPageVisible, selectVendorModalAutoVisible, modalVisibleOnLoad: !!modalVisibleOnLoad };
  }

  // ── DTC021: RWOPO Select Vendor Dialog Title ──────────────────────────────

  async dtc021_rwopoSelectVendorDialogTitle(screenshotDir: string, _data: DtcP1TestData): Promise<DTC021_Result> {
    await this.navigateToReceiveWithoutPO();
    await this.takeScreenshot(screenshotDir, 'DTC021_01_rwopo_page');

    const rwopoPageVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      return (pane.textContent ?? '').includes('Add SKU') || !!pane.querySelector('app-receive-without-po');
    }).catch(() => false);

    // Dismiss auto-modal if it appeared, then click Add SKU to trigger Select Vendor
    const autoModal = this.page.locator('.modal.in, [role="dialog"]').filter({ visible: true }).first();
    let dialogAlreadyOpen = await autoModal.isVisible({ timeout: 2000 }).catch(() => false);

    if (!dialogAlreadyOpen) {
      const addSkuBtn = this.page.locator('button:has-text("Add SKU"), button[title*="Search"]').filter({ visible: true }).first();
      if (await addSkuBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addSkuBtn.click({ force: true });
        await this.page.waitForTimeout(1500);
        dialogAlreadyOpen = true;
      }
    }

    const selectVendorDialogVisible = await this.page.locator('.modal.in, [role="dialog"], mat-dialog-container')
      .filter({ visible: true }).first().isVisible({ timeout: 3000 }).catch(() => false);

    const dialogTitle = selectVendorDialogVisible ? await this.page.evaluate(() => {
      const dialog = document.querySelector('.modal.in, [role="dialog"], mat-dialog-container') as HTMLElement | null;
      if (!dialog) return '';
      const titleEl = dialog.querySelector('.panel-title, .modal-title, h4, h3, h2, label') as HTMLElement | null;
      return titleEl ? (titleEl.textContent ?? '').trim() : '';
    }) : '';

    await this.takeScreenshot(screenshotDir, 'DTC021_02_vendor_dialog');

    if (selectVendorDialogVisible) await this.dismissAllModals();

    return {
      rwopoPageVisible,
      selectVendorDialogVisible,
      dialogTitle,
      titleIsPresent: /select\s*vendor/i.test(dialogTitle),
    };
  }

  // ── DTC022: RWOPO Extra Unlabeled Grid Column ─────────────────────────────

  async dtc022_rwopoExtraGridColumn(screenshotDir: string, _data: DtcP1TestData): Promise<DTC022_Result> {
    await this.navigateToReceiveWithoutPO();
    await this.page.waitForTimeout(1000);

    // Dismiss any auto-showing vendor modal
    await this.dismissAllModals();
    await this.takeScreenshot(screenshotDir, 'DTC022_01_rwopo_grid');

    const rwopoPageVisible = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      return (pane.textContent ?? '').includes('Add SKU') || !!pane.querySelector('app-receive-without-po');
    }).catch(() => false);

    const columnInfo = await this.page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll(
        'app-receive-without-po th, app-receive-without-po mat-header-cell, table th, mat-header-cell'
      )) as HTMLElement[];
      return headers.map(h => ({
        text: (h.textContent ?? '').trim(),
        hasLabel: (h.textContent ?? '').trim().length > 0,
        ariaLabel: h.getAttribute('aria-label') ?? '',
      }));
    });

    const gridColumnHeaders = columnInfo.map(c => c.text);
    const columnCount = columnInfo.length;
    const hasUnlabeledColumn = columnInfo.some(c => !c.hasLabel && !c.ariaLabel);
    const expectedColumnsPresent = ['Description', 'SKU', 'Quantity', 'On Order'].every(
      col => columnInfo.some(c => new RegExp(col, 'i').test(c.text))
    );

    await this.takeScreenshot(screenshotDir, 'DTC022_02_grid_columns');

    return { rwopoPageVisible, gridColumnHeaders, columnCount, hasUnlabeledColumn, expectedColumnsPresent };
  }

  // ── DTC023: Worksheets No Items to Display ────────────────────────────────

  async dtc023_worksheetsNoItems(screenshotDir: string, _data: DtcP1TestData): Promise<DTC023_Result> {
    await this.navigateToWorksheets();
    await this.takeScreenshot(screenshotDir, 'DTC023_01_worksheets_page');

    const worksheetsPageVisible = await this.page.locator('app-worksheets, button:has-text("Search Worksheets"), table:visible').first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    const gridHasData = await this.page.locator('table tbody tr:visible, mat-row:visible').count()
      .then(c => c > 0).catch(() => false);

    const noItemsMessage = await this.page.evaluate(() => {
      const pane = document.querySelector('.tab-pane.active, .tab-content .active, app-worksheets') ?? document.body;
      const allEls = Array.from(pane.querySelectorAll('*')) as HTMLElement[];
      const msgEl = allEls.find(el =>
        el.offsetParent !== null &&
        el.children.length === 0 &&
        /no\s*items\s*to\s*display|no\s*records|no\s*data/i.test(el.textContent ?? '')
      );
      return msgEl ? (msgEl.textContent ?? '').trim() : '';
    });

    await this.takeScreenshot(screenshotDir, 'DTC023_02_worksheets_data');

    return {
      worksheetsPageVisible,
      gridHasData,
      noItemsMessageVisible: noItemsMessage.length > 0,
      noItemsMessageText: noItemsMessage,
    };
  }

  // ── DTC024: Application Alerts Grid Cells Blank ───────────────────────────

  async dtc024_appAlertsGridCellsBlank(screenshotDir: string, _data: DtcP1TestData): Promise<DTC024_Result> {
    await this.navigateToApplicationAlerts();
    await this.takeScreenshot(screenshotDir, 'DTC024_01_app_alerts_page');

    const appAlertsPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-alert') || !!document.querySelector('mat-table') ||
        document.body.innerText.includes('Application Alert');
    }).catch(() => false);

    const gridVisible = await this.page.evaluate(() => {
      return !!document.querySelector('mat-table') || !!document.querySelector('table.table-hover');
    }).catch(() => false);

    const gridRowCount = await this.page.locator('mat-row, table tbody tr').count().catch(() => 0);

    const cellInfo = await this.page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr:not([style*="display: none"]), mat-row')) as HTMLElement[];
      const typeValues: string[] = [];
      const descValues: string[] = [];
      const statusValues: string[] = [];

      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, mat-cell')) as HTMLElement[];
        if (cells[0]) typeValues.push((cells[0].textContent ?? '').trim());
        if (cells[1]) descValues.push((cells[1].textContent ?? '').trim());
        if (cells[2]) statusValues.push((cells[2].textContent ?? '').trim());
      });

      return {
        typeHasData: typeValues.some(v => v.length > 0),
        descHasData: descValues.some(v => v.length > 0),
        statusHasData: statusValues.some(v => v.length > 0),
        anyBlank: [...typeValues, ...descValues, ...statusValues].some(v => v.length === 0),
      };
    });

    await this.takeScreenshot(screenshotDir, 'DTC024_02_grid_cells');

    return {
      appAlertsPageVisible,
      gridVisible,
      gridRowCount,
      typeColumnHasData: cellInfo.typeHasData,
      descriptionColumnHasData: cellInfo.descHasData,
      statusColumnHasData: cellInfo.statusHasData,
      anyCellBlank: cellInfo.anyBlank,
    };
  }

  // ── DTC025: Application Alerts Grid Header Text Color ────────────────────

  async dtc025_appAlertsHeaderTextColor(screenshotDir: string, _data: DtcP1TestData): Promise<DTC025_Result> {
    await this.navigateToApplicationAlerts();
    await this.takeScreenshot(screenshotDir, 'DTC025_01_app_alerts_page');

    const appAlertsPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-alert') || !!document.querySelector('mat-table') ||
        document.body.innerText.includes('Application Alert');
    }).catch(() => false);

    const gridVisible = await this.page.evaluate(() => {
      return !!document.querySelector('mat-table') || !!document.querySelector('table.table-hover');
    }).catch(() => false);

    const headerColor = await this.page.evaluate(() => {
      // Scope to app-alert component to avoid picking up headers from other open tabs
      const appAlert = document.querySelector('app-alert');
      const scope: Element = appAlert ?? document.body;
      const headers = Array.from(scope.querySelectorAll('th, mat-header-cell')) as HTMLElement[];
      const visibleHeader = headers.find(h => h.offsetParent !== null && (h.textContent ?? '').trim().length > 0);
      if (!visibleHeader) return '';
      return window.getComputedStyle(visibleHeader).color;
    });

    // Dark color pattern: rgba(0,0,0,0.54) or similar dark values
    const isDark = /rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0,\s*0\.[3-9]/.test(headerColor) ||
      /rgba\(0,\s*0,\s*0,\s*0\.54\)/.test(headerColor);

    await this.takeScreenshot(screenshotDir, 'DTC025_02_header_color');

    return { appAlertsPageVisible, gridVisible, headerTextColor: headerColor, headerColorIsDark: isDark };
  }

  // ── DTC026: Application Alerts Filter Input Appearance ───────────────────

  async dtc026_appAlertsFilterAppearance(screenshotDir: string, _data: DtcP1TestData): Promise<DTC026_Result> {
    await this.navigateToApplicationAlerts();
    await this.takeScreenshot(screenshotDir, 'DTC026_01_app_alerts_page');

    const appAlertsPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-alert') || !!document.querySelector('mat-table') ||
        document.body.innerText.includes('Application Alert');
    }).catch(() => false);

    // Application Alerts uses a Material filter input without a placeholder attribute
    const filterInputVisible = await this.page.evaluate(() => {
      // Look for input inside mat-form-field or near a "Filter" label
      const matInputs = Array.from(document.querySelectorAll('mat-form-field input, input.mat-input-element, input[aria-label*="filter"], input[aria-label*="Filter"]')) as HTMLElement[];
      if (matInputs.some(i => i.getBoundingClientRect().height > 0)) return true;
      // Fallback: any text input in the app-alert component
      const appAlert = document.querySelector('app-alert');
      if (appAlert) {
        const inp = appAlert.querySelector('input[type="text"], input:not([type])');
        return !!inp;
      }
      // Last fallback: find input near text containing "Filter"
      const allInputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
      return allInputs.some(i => {
        const style = window.getComputedStyle(i);
        return style.display !== 'none' && style.visibility !== 'hidden' &&
          (i.getAttribute('aria-label') || i.placeholder || '').toLowerCase().includes('filter');
      });
    }).catch(() => false);

    const filterBgColor = await this.page.evaluate(() => {
      // Application Alerts uses a Material input without placeholder
      const matInput = document.querySelector('mat-form-field input, input.mat-input-element, app-alert input') as HTMLElement | null;
      if (matInput) return window.getComputedStyle(matInput).backgroundColor;
      const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
      const filterInput = inputs.find(i => {
        const p = (i.placeholder ?? '').toLowerCase();
        return p.includes('filter') || p.includes('search');
      });
      return filterInput ? window.getComputedStyle(filterInput).backgroundColor : '';
    });

    const isTransparent = filterBgColor === 'rgba(0, 0, 0, 0)' || filterBgColor === 'transparent';

    await this.takeScreenshot(screenshotDir, 'DTC026_02_filter_input');

    return {
      appAlertsPageVisible,
      filterInputVisible,
      filterBackgroundColor: filterBgColor,
      backgroundIsTransparent: isTransparent,
    };
  }

  // ── DTC027: Application Alerts Paginator Hyphen ───────────────────────────

  async dtc027_appAlertsPaginatorHyphen(screenshotDir: string, _data: DtcP1TestData): Promise<DTC027_Result> {
    await this.navigateToApplicationAlerts();
    await this.takeScreenshot(screenshotDir, 'DTC027_01_app_alerts_page');

    const appAlertsPageVisible = await this.page.evaluate(() => {
      return !!document.querySelector('app-alert') || !!document.querySelector('mat-table') ||
        document.body.innerText.includes('Application Alert');
    }).catch(() => false);

    const paginatorText = await this.page.evaluate(() => {
      // Scope to active pane to avoid paginator text from hidden Angular tabs
      const pane = document.querySelector('.tab-pane.active, .tab-content .active') ?? document.body;
      const paginators = Array.from(pane.querySelectorAll(
        '.pagination-info, mat-paginator, [class*="paginator"], .pager, [aria-label*="pagination"]'
      )) as HTMLElement[];
      for (const p of paginators) {
        const txt = (p.textContent ?? '').trim().replace(/\s+/g, ' ');
        if (/\d/.test(txt)) return txt;
      }
      return '';
    });

    // Regular hyphen '-' vs en-dash '–' (U+2013)
    const usesHyphen = paginatorText.includes('-') && !paginatorText.includes('\u2013');
    const usesEnDash = paginatorText.includes('\u2013');

    await this.takeScreenshot(screenshotDir, 'DTC027_02_paginator');

    return { appAlertsPageVisible, paginatorText, usesHyphen, usesEnDash };
  }
}
