import fs from 'fs';
import path from 'path';
import { Locator, Page, test } from '@playwright/test';
import { SanityTestData } from '../utils/excelHelper';

export interface SanityRunResult {
  testCase: string;
  menuLabel: string;
  menuAvailable: boolean;
  sectionMenu: boolean;
  navClicked: boolean;
  tabVisible: boolean;
  tabChanged: boolean;
  tabText: string;
  appAreaVisible: boolean;
  expectedMarker: string;
  markerMatched: boolean;
}

export class SanityTestPage {
  readonly page: Page;
  readonly hamburger: Locator;
  readonly sideMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.hamburger = page.locator('.sidebar-launcher, button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    this.sideMenu = page.locator('#sideMenu');
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private normalizeKey(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private isExpectedTabMatch(tabText: string, expectedTab: string): boolean {
    const expectedKey = this.normalizeKey(expectedTab);
    if (!expectedKey) return true;
    return this.normalizeKey(tabText).includes(expectedKey);
  }

  private sanitizeForFileName(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  }

  async isSidebarVisible(): Promise<boolean> {
    return this.sideMenu.isVisible().catch(() => false);
  }

  async openSidebar(): Promise<void> {
    if (await this.isSidebarVisible()) return;
    await this.hamburger.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(400);
    if (!(await this.isSidebarVisible())) {
      await this.page.evaluate(() => {
        const el = document.getElementById('sideMenu');
        if (el) el.style.display = 'block';
      });
      await this.page.waitForTimeout(300);
    }
  }

  async closeSidebar(): Promise<void> {
    if (!(await this.isSidebarVisible())) return;
    await this.page.evaluate(() => {
      const sideMenu = document.getElementById('sideMenu');
      if (!sideMenu) return;
      sideMenu.style.display = 'none';
    });
    await this.page.waitForTimeout(200);
  }

  async clickMenuLabel(menuLabel: string): Promise<boolean> {
    await this.openSidebar();

    if (this.normalize(menuLabel) === 'application alerts') {
      const appAlertBtn = this.page.locator('#sideMenu .btn-danger, #sideMenu .Appalertbtn').first();
      if (await appAlertBtn.isVisible().catch(() => false)) {
        await appAlertBtn.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(1200);
        return true;
      }
    }

    const exact = this.sideMenu.getByText(menuLabel, { exact: true }).first();
    if (await exact.isVisible().catch(() => false)) {
      await exact.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1200);
      return true;
    }

    const partial = this.sideMenu.getByText(menuLabel).first();
    if (await partial.isVisible().catch(() => false)) {
      await partial.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1200);
      return true;
    }

    const clicked = await this.page.evaluate((label: string) => {
      const sideMenu = document.getElementById('sideMenu');
      if (!sideMenu) return false;

      const wanted = label.trim().toLowerCase();
      const nodes = Array.from(sideMenu.querySelectorAll<HTMLElement>('a, button, span, div, li'));
      const candidates = nodes.filter(node => {
        const text = (node.textContent ?? '').trim();
        const style = window.getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return !!text && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });

      const exact = candidates.find(node => (node.textContent ?? '').trim().toLowerCase() === wanted);
      const partial = candidates.find(node => (node.textContent ?? '').trim().toLowerCase().includes(wanted));
      const target = exact ?? partial;
      if (!target) return false;
      (target.closest('a,button,[role="button"],li,div,span') as HTMLElement | null ?? target).click();
      return true;
    }, menuLabel);

    await this.page.waitForTimeout(1200);
    return clicked;
  }

  async isMenuLabelAvailable(menuLabel: string): Promise<boolean> {
    await this.openSidebar();
    const expected = this.normalizeKey(menuLabel);
    if (!expected) return false;

    return this.page.evaluate((wanted: string) => {
      const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const sideMenu = document.getElementById('sideMenu');
      if (!sideMenu) return false;
      const all = Array.from(sideMenu.querySelectorAll<HTMLElement>('*'));
      return all.some(el => normalize(el.textContent ?? '').includes(wanted));
    }, expected).catch(() => false);
  }

  async isSectionMenuLabel(menuLabel: string): Promise<boolean> {
    await this.openSidebar();
    const expected = this.normalizeKey(menuLabel);
    if (!expected) return false;

    return this.page.evaluate((wanted: string) => {
      const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const sideMenu = document.getElementById('sideMenu');
      if (!sideMenu) return false;

      const all = Array.from(sideMenu.querySelectorAll<HTMLElement>('a, button, span, div, li'));
      const matches = all.filter(el => normalize(el.textContent ?? '').includes(wanted));
      const target = matches.find(el => normalize(el.textContent ?? '') === wanted) ?? matches[0];
      if (!target) return false;

      const descendants = Array.from(target.querySelectorAll<HTMLElement>('*'));
      return descendants.some(d => /arrow_drop_down|arrow_drop_up|chevron/i.test((d.textContent ?? '').trim()));
    }, expected).catch(() => false);
  }

  async getActiveTabText(): Promise<string> {
    return this.page.evaluate(() => {
      const active = document.querySelector('li.active a, li.active, .nav-tabs li.active a, .nav-tabs li.active');
      return (active?.textContent ?? '').trim();
    });
  }

  async isAppAreaVisible(): Promise<boolean> {
    const selectors = ['app-root', '.nav-tabs', 'mat-table', '.panel', '.container-fluid'];
    for (const selector of selectors) {
      const visible = await this.page.locator(selector).first().isVisible().catch(() => false);
      if (visible) return true;
    }
    return false;
  }

  async isExpectedMarkerVisible(expectedMarker: string): Promise<boolean> {
    if (!expectedMarker.trim()) return true;
    const marker = this.normalize(expectedMarker);
    const bodyText = await this.page.locator('body').innerText().catch(() => '');
    return this.normalize(bodyText).includes(marker);
  }

  async waitForExpectedTab(expectedTab: string, currentTab: string): Promise<void> {
    const expectedKey = this.normalizeKey(expectedTab);
    const currentKey = this.normalizeKey(currentTab);
    if (!expectedKey && !currentKey) return;

    await this.page.waitForFunction(
      ({ wanted, current }) => {
        const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const active = document.querySelector('li.active a, li.active, .nav-tabs li.active a, .nav-tabs li.active');
        const activeText = normalize((active?.textContent ?? '').trim());
        const tabTexts = Array.from(document.querySelectorAll('.nav-tabs li a, .nav-tabs li')).map(el =>
          normalize((el.textContent ?? '').trim())
        );

        if (wanted && (activeText.includes(wanted) || tabTexts.some(t => t.includes(wanted)))) return true;
        if (current && activeText && activeText !== current) return true;
        return false;
      },
      { wanted: expectedKey, current: currentKey },
      { timeout: 10000 }
    ).catch(() => {});
  }

  async activateExpectedTab(expectedTab: string): Promise<boolean> {
    const expectedKey = this.normalizeKey(expectedTab);
    if (!expectedKey) return false;

    const clicked = await this.page.evaluate((wanted: string) => {
      const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const tabs = Array.from(document.querySelectorAll('.nav-tabs li a')) as HTMLElement[];
      const target = tabs.find(tab => normalize((tab.textContent ?? '').trim()).includes(wanted));
      if (!target) return false;
      target.click();
      return true;
    }, expectedKey).catch(() => false);

    if (clicked) await this.page.waitForTimeout(500);
    return clicked;
  }

  async takeScreenshot(screenshotDir: string, fileName: string): Promise<void> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    const wasSidebarVisible = await this.isSidebarVisible();
    if (wasSidebarVisible) await this.closeSidebar();

    const filePath = path.join(screenshotDir, `${fileName}.png`);
    await this.page.waitForTimeout(150);
    await this.page.screenshot({ path: filePath, fullPage: true });
    await test.info().attach(fileName, { path: filePath, contentType: 'image/png' });

    if (wasSidebarVisible) await this.openSidebar();
  }

  async runSanityCase(data: SanityTestData, screenshotDir: string): Promise<SanityRunResult> {
    const testCase = data.testCase || 'SANITY_TC';
    const menuLabel = data.menuLabel || data.expectedTab || 'Application Alerts';
    const expectedTab = data.expectedTab || menuLabel;
    const expectedMarker = data.expectedMarker || '';

    const initialTabText = await this.getActiveTabText();
    const menuAvailable = await this.isMenuLabelAvailable(menuLabel);
    const sectionMenu = menuAvailable ? await this.isSectionMenuLabel(menuLabel) : false;
    const navClicked = menuAvailable ? await this.clickMenuLabel(menuLabel) : false;
    if (navClicked) await this.waitForExpectedTab(expectedTab, initialTabText);

    let tabText = await this.getActiveTabText();
    let tabVisible = this.isExpectedTabMatch(tabText, expectedTab);
    if (!tabVisible && navClicked) {
      const activated = await this.activateExpectedTab(expectedTab);
      if (activated) {
        tabText = await this.getActiveTabText();
        tabVisible = this.isExpectedTabMatch(tabText, expectedTab);
      }
    }
    const tabChanged = this.normalizeKey(tabText) !== this.normalizeKey(initialTabText);

    const appAreaVisible = await this.isAppAreaVisible();
    const markerMatched = await this.isExpectedMarkerVisible(expectedMarker);

    const screenshotName = this.sanitizeForFileName(`${testCase}_${menuLabel}`);
    await this.takeScreenshot(screenshotDir, screenshotName);
    await this.closeSidebar();

    return {
      testCase,
      menuLabel,
      menuAvailable,
      sectionMenu,
      navClicked,
      tabVisible,
      tabChanged,
      tabText,
      appAreaVisible,
      expectedMarker,
      markerMatched,
    };
  }
}
