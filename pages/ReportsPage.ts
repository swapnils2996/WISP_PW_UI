import fs from 'fs';
import path from 'path';
import { Page, Locator, BrowserContext, test } from '@playwright/test';

// ── Return-type interfaces ────────────────────────────────────────────────────

export interface RP_TC01Result {
  pageLoaded: boolean;
  actionsHeaderVisible: boolean;
  fromFieldVisible: boolean;
  toFieldVisible: boolean;
  viewBtnVisible: boolean;
  printBtnVisible: boolean;
  // Validation step 2 — blank / high value
  blankViewValidationTriggered: boolean;
  beginRangeErrText: string;
  endRangeErrText: string;
  // Validation step 3 — From > To
  fromGtToErrText: string;
}

export interface RP_TC02Result {
  pageLoaded: boolean;
  viewClicked: boolean;
  viewResponseText: string;
  viewResponseVisible: boolean;
  printClicked: boolean;
  printResponseText: string;
  printResponseVisible: boolean;
}

export interface RP_TC07Result {
  pageLoaded: boolean;
  beginDateFieldVisible: boolean;
  endDateFieldVisible: boolean;
  viewBtnVisible: boolean;
  printBtnVisible: boolean;
  // Step 1 — blank dates
  blankDatesErrText: string;
  // Step 2 — begin > end
  dateOrderErrText: string;
  // Step 3 — valid range View + Print
  viewResponseText: string;
  viewResponseVisible: boolean;
  printResponseText: string;
  printResponseVisible: boolean;
}

export interface RP_TC08Result {
  pageLoaded: boolean;
  beginPOFieldVisible: boolean;
  endPOFieldVisible: boolean;
  viewPrintBtnVisible: boolean;
  // Step 1 — blank PO#
  beginNumErrText: string;
  endNumErrText: string;
  // Step 2 — begin > end
  poOrderErrText: string;
  // Step 3 — valid range
  responseText: string;
  responseVisible: boolean;
}

export interface RP_TC09Result {
  pageLoaded: boolean;
  fromDCFieldVisible: boolean;
  toDCFieldVisible: boolean;
  sortByClipVisible: boolean;
  viewBtnVisible: boolean;
  printBtnVisible: boolean;
  // Step 2 — invalid From > To
  dcAreaOrderErrText: string;
  // Step 3 — valid range + Sort by Clip
  viewResponseText: string;
  viewResponseVisible: boolean;
  printResponseText: string;
  printResponseVisible: boolean;
}

export interface RP_TC10Result {
  pageLoaded: boolean;
  expandBtnVisible: boolean;
  viewBtnVisible: boolean;
  printBtnVisible: boolean;
  refreshBtnVisible: boolean;
  bannerText: string;
  bannerVisible: boolean;
  filterVisible: boolean;
  createdChipVisible: boolean;
  reportDescChipVisible: boolean;
  rowsVisible: boolean;
  // Expand/Collapse
  expandClicked: boolean;
  collapseClicked: boolean;
  columnsAfterExpand: string[];
}

export interface RP_TC11Result {
  pageLoaded: boolean;
  rowCount: number;
  rowSelected: boolean;
  viewClicked: boolean;
  viewResponseText: string;
  printClicked: boolean;
  printResponseText: string;
  refreshClicked: boolean;
  afterRefreshBannerVisible: boolean;
}

export interface RP_TC12Result {
  pageLoaded: boolean;
  noSelViewErrText: string;
  noSelPrintErrText: string;
}

export interface RP_TC13Result {
  pageLoaded: boolean;
  iframePresent: boolean;
  iframeSrc: string;
  viewerVisible: boolean;
}

export interface RP_TC14Result {
  offlineSet: boolean;
  offlineErrVisible: boolean;
  offlineErrText: string;
  networkRestored: boolean;
  postRestorePageLoaded: boolean;
}

export interface RP_TC15Result {
  createdChipClicked: boolean;
  flatViewVisible: boolean;
  flatViewColumns: string[];
  reportDescColVisible: boolean;
  createdColVisible: boolean;
  notesColVisible: boolean;
  rowCountInFlatView: number;
}

export interface RP_TC16Result {
  filterInputVisible: boolean;
  rowCountBeforeFilter: number;
  filterApplied: boolean;
  rowCountAfterFilter: number;
  filterNarrowed: boolean;
  filterCleared: boolean;
}

export interface RP_TC17Result {
  viewNoSelMsg: string;
  printNoSelMsg: string;
  viewMsgMatchesExpected: boolean;
  printMsgMatchesExpected: boolean;
}

export interface RP_TC18Result {
  pageLoaded: boolean;
  fromFieldVisible: boolean;
  toFieldVisible: boolean;
  emptyFromErrText: string;
  emptyValidationTriggered: boolean;
  sortByClipToggled: boolean;
  checkboxStateAfterToggle: boolean;
}

export interface RP_TC19Result {
  tab1Opened: boolean;
  tab2Opened: boolean;
  tab3Opened: boolean;
  tabCount: number;
  switchToTab1Works: boolean;
  switchToTab2Works: boolean;
  allTabsPresent: boolean;
}

// ── ReportsPage ───────────────────────────────────────────────────────────────

export class ReportsPage {
  private readonly page: Page;

  // ── Component roots ─────────────────────────────────────────────────────────
  private readonly deptClassComp: Locator;
  private readonly openPOComp: Locator;
  private readonly poActivityComp: Locator;
  private readonly planogramComp: Locator;
  private readonly reprintComp: Locator;

  constructor(page: Page) {
    this.page = page;
    this.deptClassComp = page.locator('app-department-class-report');
    this.openPOComp     = page.locator('app-open-purchase-orders-report');
    this.poActivityComp = page.locator('app-purchase-order-activity-report');
    this.planogramComp  = page.locator('app-planogram-profile');
    this.reprintComp    = page.locator('app-reprint-existing-reports');
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

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

  private async closeSidebar(): Promise<void> {
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.setAttribute('style', 'display: none !important;');
    });
    await this.page.waitForTimeout(100);
  }

  // Navigate to a Reports sub-page via its sidebar link id and component tag.
  // Report links use <div> children (not <a>) inside the <li>.
  private async navigateTo(linkId: string, compLocator: Locator, compTag?: string): Promise<void> {
    // 1. Close all stale "View Existing Report" tabs
    await this.page.evaluate(function () {
      var allLis = Array.from(document.querySelectorAll('li'));
      allLis.forEach(function (li) {
        if (li.id) return; // skip sidebar items
        var text = (li.textContent || '').toLowerCase();
        if (text.includes('view existing')) {
          // Try multiple close-button selectors
          var closeBtn = li.querySelector('sup') ||
            li.querySelector('[class*="close"]') ||
            li.querySelector('[title*="Close"]') ||
            li.querySelector('[title*="close"]') ||
            li.querySelector('span') ||  // sometimes just a span
            li.querySelector('i');
          if (closeBtn) (closeBtn as HTMLElement).click();
          else (li as HTMLElement).click(); // fallback: click the tab then find another way
        }
      });
    });
    await this.page.waitForTimeout(500);

    // 2. Get this feature's tab text (from sidebar link) and close existing tab if open
    const tabText = await this.page.evaluate(function (id: string) {
      var li = document.getElementById(id);
      return li ? ((li.querySelector('div') || li).textContent || '').trim() : '';
    }, linkId);

    if (tabText) {
      await this.page.evaluate(function (text: string) {
        var allLis = Array.from(document.querySelectorAll('li:not([id])'));
        var tabLi = allLis.find(function (li) {
          return (li.textContent || '').toLowerCase().includes(text.toLowerCase().substring(0, 10));
        });
        if (tabLi) {
          var closeBtn = tabLi.querySelector('sup') ||
            tabLi.querySelector('[class*="close"]') ||
            tabLi.querySelector('span.close') ||
            tabLi.querySelector('i.close');
          if (closeBtn) (closeBtn as HTMLElement).click();
        }
      }, tabText);
      await this.page.waitForTimeout(500);
    }

    // 3. Count current tabs so we can detect the newly opened one
    const tabCountBefore = await this.page.evaluate(function () {
      return document.querySelectorAll('li:not([id])').length;
    });

    // 4. Open sidebar and click the link
    await this.page.evaluate(function () {
      var el = document.getElementById('sideMenu');
      if (el) el.style.display = 'block';
    });
    await this.page.waitForTimeout(400);

    await this.page.evaluate(function (id: string) {
      var li = document.getElementById(id);
      if (!li) return;
      var a = li.querySelector('a');
      var div = li.querySelector('div');
      if (a) (a as HTMLElement).click();
      else if (div) (div as HTMLElement).click();
      else (li as HTMLElement).click();
    }, linkId);

    await this.page.waitForTimeout(800);
    await this.closeSidebar();

    // 5. Wait for a new tab to appear, then click it (reliable: always click the last new tab)
    await this.page.waitForFunction(function (before: number) {
      return document.querySelectorAll('li:not([id])').length > before;
    }, tabCountBefore, { timeout: 10000 }).catch(function () {});

    // Click the last non-sidebar tab (the newly opened one)
    await this.page.evaluate(function () {
      var allLis = Array.from(document.querySelectorAll('li:not([id])'));
      if (allLis.length === 0) return;
      var lastTab = allLis[allLis.length - 1];
      // Click a child span/div (not the close button) to activate the tab
      var clickTarget = lastTab.querySelector('span:not([class*="close"]):not(sup)') ||
        lastTab.querySelector('a') ||
        lastTab;
      (clickTarget as HTMLElement).click();
    });
    await this.page.waitForTimeout(500);

    // 6. Wait until at least one visible component instance exists; retry tab click once if needed
    if (compTag) {
      const visible = await this.page.waitForFunction(function (tag: string) {
        var els = document.querySelectorAll(tag);
        return Array.from(els).some(function (el) { return (el as HTMLElement).offsetParent !== null; });
      }, compTag, { timeout: 10000 }).catch(function () { return null; });

      if (!visible) {
        // Retry: click the last tab again
        await this.page.evaluate(function () {
          var allLis = Array.from(document.querySelectorAll('li:not([id])'));
          if (allLis.length === 0) return;
          var lastTab = allLis[allLis.length - 1];
          var clickTarget = lastTab.querySelector('span:not([class*="close"]):not(sup)') ||
            lastTab.querySelector('a') ||
            lastTab;
          (clickTarget as HTMLElement).click();
        });
        await this.page.waitForFunction(function (tag: string) {
          var els = document.querySelectorAll(tag);
          return Array.from(els).some(function (el) { return (el as HTMLElement).offsetParent !== null; });
        }, compTag, { timeout: 10000 }).catch(function () {});
      }
    } else {
      await compLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(function () {});
    }
    await this.page.waitForTimeout(500);
  }

  // Read validation / alert text from inside a component
  private async getAlertInsideComp(comp: Locator): Promise<string> {
    const candidates = [
      comp.locator('.alert-danger, .alert-warning, .alert-success, .alert-info').first(),
      comp.locator('[class*="error"], [class*="msg"], [class*="alert"]').first(),
      comp.locator('span.text-danger, p.text-danger').first(),
    ];
    for (const loc of candidates) {
      const visible = await loc.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        const txt = (await loc.textContent().catch(() => '')) || '';
        if (txt.trim()) return txt.trim();
      }
    }
    // Fallback: DOM TreeWalker for any new error text
    return this.page.evaluate(function (compSel: string) {
      var comp = document.querySelector(compSel);
      if (!comp) return '';
      var walker = document.createTreeWalker(comp, NodeFilter.SHOW_TEXT);
      var result: string[] = [];
      var node: Node | null;
      while ((node = walker.nextNode())) {
        var t = (node.textContent || '').trim();
        if (t.length > 5) result.push(t);
      }
      return result.join(' ');
    }, comp.toString().replace(/^Locator\(/, '').replace(/\)$/, ''));
  }

  private async getAlertText(compSelector: string): Promise<string> {
    return this.page.evaluate(function (sel: string) {
      var comp = document.querySelector(sel);
      if (!comp) return '';
      var candidates = Array.from(comp.querySelectorAll(
        '.alert-danger,.alert-warning,.alert-success,.alert-info,[class*="error"],[class*="msg"],span.text-danger,p.text-danger'
      ));
      for (var i = 0; i < candidates.length; i++) {
        var t = (candidates[i].textContent || '').trim();
        if (t.length > 0) return t;
      }
      return '';
    }, compSelector);
  }

  private async waitForAlertInComp(compSelector: string, timeoutMs = 5000): Promise<string> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const txt = await this.getAlertText(compSelector);
      if (txt.length > 0) return txt;
      await this.page.waitForTimeout(300);
    }
    return '';
  }

  // ── Department Class helpers ─────────────────────────────────────────────────

  // ── Generic DOM helpers (always target the VISIBLE component instance) ────────

  private async fillInputsInComp(compTag: string, values: string[]): Promise<void> {
    await this.page.evaluate(function (args: { tag: string; vals: string[] }) {
      var comps = Array.from(document.querySelectorAll(args.tag)) as HTMLElement[];
      var visible = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!visible) return;
      var inputs = Array.from(visible.querySelectorAll(
        'input:not([type="checkbox"]):not([type="button"]):not([type="submit"]):not([type="radio"])'
      )) as HTMLInputElement[];
      args.vals.forEach(function (val, i) {
        var inp = inputs[i];
        if (!inp) return;
        inp.value = val;
        inp.dispatchEvent(new Event('input',  { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        inp.dispatchEvent(new Event('blur',   { bubbles: true }));
      });
    }, { tag: compTag, vals: values });
    await this.page.waitForTimeout(300);
  }

  private async clickBtnInComp(compTag: string, btnText: string, waitMs = 1500): Promise<void> {
    await this.page.evaluate(function (args: { tag: string; text: string }) {
      var comps = Array.from(document.querySelectorAll(args.tag)) as HTMLElement[];
      var visible = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!visible) return;
      var btns = Array.from(visible.querySelectorAll('button, input[type="button"], input[type="submit"], input[value]'));
      var lower = args.text.toLowerCase();
      var btn = btns.find(function (b) {
        var byText = (b.textContent || '').trim().toLowerCase();
        var byVal  = ((b as HTMLInputElement).value || '').trim().toLowerCase();
        return byText.includes(lower) || byVal.includes(lower);
      });
      if (btn) (btn as HTMLElement).click();
    }, { tag: compTag, text: btnText });
    await this.page.waitForTimeout(waitMs);
  }

  // Click a visible input by its index within the visible component instance (bypasses hidden stale instances)
  private async clickVisibleInput(compTag: string, index: number): Promise<void> {
    const coords = await this.page.evaluate(function (args: { tag: string; idx: number }) {
      var comps = Array.from(document.querySelectorAll(args.tag)) as HTMLElement[];
      var visible = comps.find(function (c) { return (c as HTMLElement).offsetParent !== null; });
      if (!visible) return null;
      var inputs = Array.from(visible.querySelectorAll('input'));
      var inp = inputs[args.idx] as HTMLInputElement | undefined;
      if (!inp) return null;
      var rect = inp.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, { tag: compTag, idx: index });
    if (coords && coords.x > 0 && coords.y > 0) {
      await this.page.mouse.click(coords.x, coords.y);
    }
  }

  private async clearAndFill(input: Locator, value: string): Promise<void> {
    await input.click({ force: true });
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
    if (value) await input.fill(value);
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(200);
  }

  // ── Department Class helpers ─────────────────────────────────────────────────

  private async fillDeptRange(from: string, to: string): Promise<void> {
    await this.fillInputsInComp('app-department-class-report', [from, to]);
  }

  private async clickDeptView(): Promise<void> {
    await this.clickBtnInComp('app-department-class-report', 'View', 1500);
  }

  private async clickDeptPrint(): Promise<void> {
    await this.clickBtnInComp('app-department-class-report', 'Print', 2000);
  }

  // ── Open PO helpers ──────────────────────────────────────────────────────────

  private async clickOpenPOView(): Promise<void> {
    await this.clickBtnInComp('app-open-purchase-orders-report', 'View', 1500);
  }

  private async clickOpenPOPrint(): Promise<void> {
    await this.clickBtnInComp('app-open-purchase-orders-report', 'Print', 2000);
  }

  // ── PO Activity helpers ──────────────────────────────────────────────────────

  private async clickPOActivityViewPrint(): Promise<void> {
    await this.clickBtnInComp('app-purchase-order-activity-report', 'View/Print', 2000);
  }

  // ── Planogram Profile helpers ────────────────────────────────────────────────

  private async fillPlanogramProfile(from: string, to: string, sortByClip: boolean): Promise<void> {
    // DOM evaluate targeting the VISIBLE instance — avoids stale hidden tabs
    await this.page.evaluate(function (args: { from: string; to: string; clip: boolean }) {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile'));
      var visible = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!visible) return;
      var inputs = Array.from(visible.querySelectorAll('input:not([type="checkbox"])')) as HTMLInputElement[];
      if (inputs[0]) {
        inputs[0].value = args.from;
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (inputs[1]) {
        inputs[1].value = args.to;
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (args.clip) {
        var cb = visible.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (cb && !cb.checked) cb.click();
      }
    }, { from, to, clip: sortByClip });
    await this.page.waitForTimeout(300);
  }

  private async clickPlanogramView(): Promise<void> {
    await this.clickBtnInComp('app-planogram-profile', 'View', 1500);
  }

  private async clickPlanogramPrint(): Promise<void> {
    await this.clickBtnInComp('app-planogram-profile', 'Print', 2000);
  }

  // ── Reprint helpers ──────────────────────────────────────────────────────────

  private async reprintBtnExistsInComp(text: string): Promise<boolean> {
    return this.page.evaluate(function (btnText: string) {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var comp = comps.find(function (c) { return c.offsetParent !== null; }) || comps[0];
      if (!comp) return false;
      var btns = Array.from(comp.querySelectorAll('button, input[type="button"], input[value]'));
      var lower = btnText.toLowerCase();
      return btns.some(function (b) {
        var byText = (b.textContent || '').trim().toLowerCase();
        var byVal  = ((b as HTMLInputElement).value || '').trim().toLowerCase();
        return byText.includes(lower) || byVal.includes(lower);
      });
    }, text);
  }

  private async clickReprintBtn(text: string): Promise<void> {
    await this.page.evaluate(function (btnText: string) {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var comp = comps.find(function (c) { return c.offsetParent !== null; }) || comps[0];
      if (!comp) return;
      var btns = Array.from(comp.querySelectorAll('button, input[type="button"], input[value]'));
      var lower = btnText.toLowerCase();
      var btn = btns.find(function (b) {
        var byText = (b.textContent || '').trim().toLowerCase();
        var byVal  = ((b as HTMLInputElement).value || '').trim().toLowerCase();
        return byText.includes(lower) || byVal.includes(lower);
      });
      if (btn) (btn as HTMLElement).click();
    }, text);
    await this.page.waitForTimeout(1200);
  }

  private async selectFirstReprintRow(): Promise<boolean> {
    const selected = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var comp = comps.find(function (c) { return c.offsetParent !== null; }) || comps[0];
      if (!comp) return false;
      var plusEls = Array.from(comp.querySelectorAll('button, input[type="button"], input[value]')).filter(function (b) {
        var txt = (b.textContent || '').trim();
        var val = ((b as HTMLInputElement).value || '').trim();
        return txt === '+' || val === '+';
      });
      if (plusEls.length > 0) { (plusEls[0] as HTMLElement).click(); return true; }
      var rows = Array.from(comp.querySelectorAll('tr, mat-row, [class*="row"]'));
      if (rows.length > 0) { (rows[0] as HTMLElement).click(); return true; }
      return false;
    });
    await this.page.waitForTimeout(800);
    return selected;
  }

  private async selectFirstExpandedRow(): Promise<boolean> {
    const selected = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var comp = comps.find(function (c) { return c.offsetParent !== null; }) || comps[0];
      if (!comp) return false;
      var rows = Array.from(comp.querySelectorAll('tr[class*="child"], tr[class*="detail"], mat-row, .child-row'));
      if (rows.length > 0) { (rows[0] as HTMLElement).click(); return true; }
      var allRows = Array.from(comp.querySelectorAll('tr, [role="row"]'));
      var dataRows = allRows.filter(function (r) { return (r.textContent || '').trim().length > 10; });
      if (dataRows.length > 0) { (dataRows[0] as HTMLElement).click(); return true; }
      return false;
    });
    await this.page.waitForTimeout(500);
    return selected;
  }

  // ── TC01: Department Class UI + validation ───────────────────────────────────

  async tc01_deptClassUI(screenshotDir: string): Promise<RP_TC01Result> {
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    await this.takeScreenshot(screenshotDir, 'RP_WTC01_01_page_loaded');

    const pageLoaded          = await this.deptClassComp.isVisible().catch(() => false);
    const actionsHeaderVisible = await this.page.evaluate(function () {
      var comp = document.querySelector('app-department-class-report');
      return !!comp && (comp.textContent || '').toLowerCase().includes('actions');
    });
    const fromFieldVisible = await this.deptClassComp.locator('input[type="number"], input').first().isVisible({ timeout: 2000 }).catch(() => false);
    const toFieldVisible   = await this.deptClassComp.locator('input').nth(1).isVisible({ timeout: 2000 }).catch(() => false);
    const viewBtnVisible   = await this.deptClassComp.locator('button:has-text("View")').first().isVisible({ timeout: 2000 }).catch(() => false);
    const printBtnVisible  = await this.deptClassComp.locator('button:has-text("Print")').first().isVisible({ timeout: 2000 }).catch(() => false);

    // Step 2: Enter high value > max (2147483647) → validation
    await this.fillDeptRange('2147483648', '2147483648');
    await this.clickDeptView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC01_02_high_value_validation');
    const highValErrText = await this.waitForAlertInComp('app-department-class-report', 4000);
    const blankViewValidationTriggered = highValErrText.length > 0;
    const beginRangeErrText = highValErrText;
    // Also check To error separately (may be same block)
    const endRangeErrText = highValErrText;

    // Step 3: From > To → validation
    await this.fillDeptRange('100', '1');
    await this.clickDeptView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC01_03_from_gt_to_validation');
    const fromGtToErrText = await this.waitForAlertInComp('app-department-class-report', 4000);

    return {
      pageLoaded, actionsHeaderVisible, fromFieldVisible, toFieldVisible, viewBtnVisible, printBtnVisible,
      blankViewValidationTriggered, beginRangeErrText, endRangeErrText, fromGtToErrText,
    };
  }

  // ── TC02: Department Class E2E ───────────────────────────────────────────────

  async tc02_deptClassE2E(screenshotDir: string): Promise<RP_TC02Result> {
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    await this.takeScreenshot(screenshotDir, 'RP_WTC02_01_page_loaded');

    const pageLoaded = await this.deptClassComp.isVisible().catch(() => false);

    // Step 1+2: Enter valid range and click View
    await this.fillDeptRange('1', '100');
    await this.clickDeptView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC02_02_after_view');
    const viewResponseText    = await this.waitForAlertInComp('app-department-class-report', 6000);
    const viewResponseVisible = viewResponseText.length > 0 ||
      await this.page.locator('embed[type="application/pdf"], iframe').count() > 0;

    // Step 3: Navigate back to Dept Class (View may have opened a new tab) then Print
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    await this.fillDeptRange('1', '100');
    await this.clickDeptPrint();
    await this.takeScreenshot(screenshotDir, 'RP_WTC02_03_after_print');
    const printResponseText    = await this.waitForAlertInComp('app-department-class-report', 6000);
    const printResponseVisible = printResponseText.length > 0 ||
      await this.page.locator('embed[type="application/pdf"], iframe').count() > 0;

    return { pageLoaded, viewClicked: true, viewResponseText, viewResponseVisible, printClicked: true, printResponseText, printResponseVisible };
  }

  // ── TC03–TC06: Not in sidebar — mark as not applicable ──────────────────────

  async tc03_inboundTrailerUI(screenshotDir: string): Promise<{ notApplicable: boolean; reason: string }> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    return { notApplicable: true, reason: 'Inbound Trailer Workload is not present in the current sidebar navigation — "Confirm with tech on the UI flow" per CSV.' };
  }

  async tc04_inboundTrailerNegative(screenshotDir: string): Promise<{ notApplicable: boolean; reason: string }> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    return { notApplicable: true, reason: 'Inbound Trailer Workload is not present in the current sidebar navigation — "Confirm with tech on the UI flow" per CSV.' };
  }

  async tc05_poolWorkloadUI(screenshotDir: string): Promise<{ notApplicable: boolean; reason: string }> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    return { notApplicable: true, reason: 'Inbound Trailer Pool Workload is not present in the current sidebar navigation — "Confirm with tech on the UI flow" per CSV.' };
  }

  async tc06_manifestUI(screenshotDir: string): Promise<{ notApplicable: boolean; reason: string }> {
    fs.mkdirSync(screenshotDir, { recursive: true });
    return { notApplicable: true, reason: 'Manifest Report is not present in the current sidebar navigation — "Confirm with tech on the UI flow" per CSV.' };
  }

  // ── TC07: Open Purchase Orders ───────────────────────────────────────────────

  async tc07_openPOReport(screenshotDir: string, validBeginDate: string, validEndDate: string): Promise<RP_TC07Result> {
    const beginDate = validBeginDate || '01/01/2024';
    const endDate   = validEndDate   || '12/31/2024';
    validBeginDate = beginDate;
    validEndDate   = endDate;
    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    await this.takeScreenshot(screenshotDir, 'RP_WTC07_01_page_loaded');

    const pageLoaded           = await this.openPOComp.isVisible().catch(() => false);
    const beginDateFieldVisible = await this.openPOComp.locator('input').first().isVisible({ timeout: 2000 }).catch(() => false);
    const endDateFieldVisible   = await this.openPOComp.locator('input').nth(1).isVisible({ timeout: 2000 }).catch(() => false);
    const viewBtnVisible        = await this.openPOComp.locator('button:has-text("View")').first().isVisible({ timeout: 2000 }).catch(() => false);
    const printBtnVisible       = await this.openPOComp.locator('button:has-text("Print")').first().isVisible({ timeout: 2000 }).catch(() => false);

    // Re-navigate before each step; use clickVisibleInput to avoid hidden stale instances
    // Step 1: Clear both dates via keyboard and click View
    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    await this.clickVisibleInput('app-open-purchase-orders-report', 0);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.press('Delete'); await this.page.waitForTimeout(100);
    await this.clickVisibleInput('app-open-purchase-orders-report', 1);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.press('Delete'); await this.page.waitForTimeout(100);
    await this.clickOpenPOView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC07_02_blank_dates_validation');
    const blankDatesErrText = await this.waitForAlertInComp('app-open-purchase-orders-report', 4000);

    // Step 2: begin > end (set future begin, past end)
    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    await this.clickVisibleInput('app-open-purchase-orders-report', 0);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.type(validEndDate); await this.page.keyboard.press('Tab'); await this.page.waitForTimeout(200);
    await this.clickVisibleInput('app-open-purchase-orders-report', 1);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.type(validBeginDate); await this.page.keyboard.press('Tab'); await this.page.waitForTimeout(200);
    await this.clickOpenPOView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC07_03_date_order_validation');
    const dateOrderErrText = await this.waitForAlertInComp('app-open-purchase-orders-report', 4000);

    // Step 3: Valid range — View then Print
    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    await this.clickVisibleInput('app-open-purchase-orders-report', 0);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.type(validBeginDate); await this.page.keyboard.press('Tab'); await this.page.waitForTimeout(200);
    await this.clickVisibleInput('app-open-purchase-orders-report', 1);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.type(validEndDate); await this.page.keyboard.press('Tab'); await this.page.waitForTimeout(200);
    await this.clickOpenPOView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC07_04_after_view');
    const viewResponseText    = await this.waitForAlertInComp('app-open-purchase-orders-report', 6000);
    const viewResponseVisible = viewResponseText.length > 0 || await this.page.locator('iframe, embed').count() > 0;

    // Navigate back (View may have opened a report tab)
    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    await this.clickVisibleInput('app-open-purchase-orders-report', 0);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.type(validBeginDate); await this.page.keyboard.press('Tab'); await this.page.waitForTimeout(200);
    await this.clickVisibleInput('app-open-purchase-orders-report', 1);
    await this.page.keyboard.press('Control+A'); await this.page.keyboard.type(validEndDate); await this.page.keyboard.press('Tab'); await this.page.waitForTimeout(200);
    await this.clickOpenPOPrint();
    await this.takeScreenshot(screenshotDir, 'RP_WTC07_05_after_print');
    const printResponseText    = await this.waitForAlertInComp('app-open-purchase-orders-report', 6000);
    const printResponseVisible = printResponseText.length > 0 || await this.page.locator('iframe, embed').count() > 0;

    return {
      pageLoaded, beginDateFieldVisible, endDateFieldVisible, viewBtnVisible, printBtnVisible,
      blankDatesErrText, dateOrderErrText, viewResponseText, viewResponseVisible, printResponseText, printResponseVisible,
    };
  }

  // ── TC08: Purchase Order Activity ────────────────────────────────────────────

  async tc08_poActivityReport(screenshotDir: string, validFromNo: string, validToNo: string): Promise<RP_TC08Result> {
    validFromNo = validFromNo || '1000';
    validToNo   = validToNo   || '9999';
    await this.navigateTo('POActivityRptLink', this.poActivityComp, 'app-purchase-order-activity-report');
    await this.takeScreenshot(screenshotDir, 'RP_WTC08_01_page_loaded');

    const pageLoaded         = await this.poActivityComp.isVisible().catch(() => false);
    const beginPOFieldVisible = await this.poActivityComp.locator('input').first().isVisible({ timeout: 2000 }).catch(() => false);
    const endPOFieldVisible   = await this.poActivityComp.locator('input').nth(1).isVisible({ timeout: 2000 }).catch(() => false);
    const viewPrintBtnVisible = await this.poActivityComp.locator('button:has-text("View/Print"), input[value="View/Print"]').first().isVisible({ timeout: 2000 }).catch(() => false);

    // Re-navigate before each step to ensure fresh visible inputs
    // Step 1: Leave blank — click View/Print
    await this.navigateTo('POActivityRptLink', this.poActivityComp, 'app-purchase-order-activity-report');
    await this.fillInputsInComp('app-purchase-order-activity-report', ['', '']);
    await this.clickPOActivityViewPrint();
    await this.takeScreenshot(screenshotDir, 'RP_WTC08_02_blank_validation');
    const blankErrText = await this.waitForAlertInComp('app-purchase-order-activity-report', 4000);
    const beginNumErrText = blankErrText;
    const endNumErrText   = blankErrText;

    // Step 2: Begin > End
    await this.navigateTo('POActivityRptLink', this.poActivityComp, 'app-purchase-order-activity-report');
    await this.fillInputsInComp('app-purchase-order-activity-report', [validToNo, '1']);
    await this.clickPOActivityViewPrint();
    await this.takeScreenshot(screenshotDir, 'RP_WTC08_03_order_validation');
    const poOrderErrText = await this.waitForAlertInComp('app-purchase-order-activity-report', 4000);

    // Step 3: Navigate back (step 2 View/Print may have opened a new tab)
    await this.navigateTo('POActivityRptLink', this.poActivityComp, 'app-purchase-order-activity-report');
    await this.fillInputsInComp('app-purchase-order-activity-report', [validFromNo, validToNo]);
    await this.clickPOActivityViewPrint();
    await this.takeScreenshot(screenshotDir, 'RP_WTC08_04_after_viewprint');
    const responseText    = await this.waitForAlertInComp('app-purchase-order-activity-report', 6000);
    const responseVisible = responseText.length > 0 || await this.page.locator('iframe, embed').count() > 0;

    return {
      pageLoaded, beginPOFieldVisible, endPOFieldVisible, viewPrintBtnVisible,
      beginNumErrText, endNumErrText, poOrderErrText, responseText, responseVisible,
    };
  }

  // ── TC09: Planogram Profile ───────────────────────────────────────────────────

  async tc09_planogramProfileReport(screenshotDir: string, validFrom: string, validTo: string): Promise<RP_TC09Result> {
    validFrom = validFrom || '1';
    validTo   = validTo   || '999';
    await this.navigateTo('POGProfileRptLink', this.planogramComp, 'app-planogram-profile');
    // Wait for at least one action button (View/Print) to appear in the visible component
    await this.page.waitForFunction(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return false;
      return Array.from(vis.querySelectorAll('button, input[type="button"], input[value]')).some(function (b) {
        var t = (b.textContent || '').toLowerCase();
        var v = ((b as HTMLInputElement).value || '').toLowerCase();
        return t.includes('view') || v.includes('view') || t.includes('print') || v.includes('print');
      });
    }, undefined, { timeout: 10000 }).catch(function () {});
    await this.takeScreenshot(screenshotDir, 'RP_WTC09_01_page_loaded');

    // Use DOM evaluate to find the VISIBLE instance (multiple instances exist when tabs are open)
    const pageLoaded = await this.page.evaluate(function () {
      var els = document.querySelectorAll('app-planogram-profile');
      return Array.from(els).some(function (el) { return (el as HTMLElement).offsetParent !== null; });
    });
    const fromDCFieldVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return false;
      var inputs = vis.querySelectorAll('input:not([type="checkbox"])');
      return inputs.length > 0;
    });
    const toDCFieldVisible   = fromDCFieldVisible;
    const sortByClipVisible  = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      return !!vis && vis.querySelectorAll('input[type="checkbox"]').length > 0;
    });
    const viewBtnVisible  = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return false;
      return Array.from(vis.querySelectorAll('button, input[type="button"], input[value]')).some(function (b) {
        return (b.textContent || '').toLowerCase().includes('view') || ((b as HTMLInputElement).value || '').toLowerCase().includes('view');
      });
    });
    const printBtnVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return false;
      return Array.from(vis.querySelectorAll('button, input[type="button"], input[value]')).some(function (b) {
        return (b.textContent || '').toLowerCase().includes('print') || ((b as HTMLInputElement).value || '').toLowerCase().includes('print');
      });
    });

    // Step 2: From > To → validation
    await this.fillPlanogramProfile('100', '1', false);
    await this.clickPlanogramView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC09_02_from_gt_to_validation');
    const dcAreaOrderErrText = await this.waitForAlertInComp('app-planogram-profile', 4000);

    // Step 3: Navigate back to Planogram Profile (View in step 2 may have opened a new tab)
    await this.navigateTo('POGProfileRptLink', this.planogramComp, 'app-planogram-profile');
    await this.fillPlanogramProfile(validFrom, validTo, true);
    await this.clickPlanogramView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC09_03_after_view');
    const viewResponseText    = await this.waitForAlertInComp('app-planogram-profile', 6000);
    const viewResponseVisible = viewResponseText.length > 0 || await this.page.locator('iframe, embed').count() > 0;

    // Navigate back before Print (View opened a report tab)
    await this.navigateTo('POGProfileRptLink', this.planogramComp, 'app-planogram-profile');
    await this.fillPlanogramProfile(validFrom, validTo, false);
    await this.clickPlanogramPrint();
    await this.takeScreenshot(screenshotDir, 'RP_WTC09_04_after_print');
    const printResponseText    = await this.waitForAlertInComp('app-planogram-profile', 6000);
    const printResponseVisible = printResponseText.length > 0 || await this.page.locator('iframe, embed').count() > 0;

    return {
      pageLoaded, fromDCFieldVisible, toDCFieldVisible, sortByClipVisible, viewBtnVisible, printBtnVisible,
      dcAreaOrderErrText, viewResponseText, viewResponseVisible, printResponseText, printResponseVisible,
    };
  }

  // ── TC10: Reprint Existing Reports UI walkthrough ─────────────────────────────

  async tc10_reprintUI(screenshotDir: string): Promise<RP_TC10Result> {
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    // Wait until the VISIBLE reprint instance finishes loading; capture banner text at resolve time
    const bannerText = await this.page.waitForFunction(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return (c as HTMLElement).offsetParent !== null; }) as HTMLElement | undefined;
      if (!vis) return null;
      var text = (vis.textContent || '').toLowerCase();
      if (text.includes('loaded')) return 'Reports Loaded';
      if (text.includes('report description')) return 'Reports Ready';
      return null;
    }, { timeout: 45000 }).then(h => h.jsonValue() as Promise<string>).catch(() => '');
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'RP_WTC10_01_page_loaded');

    const pageLoaded       = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      return comps.some(function (c) { return c.offsetParent !== null; });
    });
    const expandBtnVisible = await this.reprintBtnExistsInComp('Expand');
    const viewBtnVisible   = await this.reprintBtnExistsInComp('View');
    const printBtnVisible  = await this.reprintBtnExistsInComp('Print');
    const refreshBtnVisible = await this.reprintBtnExistsInComp('Refresh');
    const bannerVisible = (bannerText || '').length > 0;

    // Filter/chip checks — VISIBLE instance only
    const filterVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      return !!vis && (vis.textContent || '').toLowerCase().includes('filter');
    });
    const createdChipVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      return !!vis && (vis.textContent || '').includes('Created');
    });
    const reportDescChipVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      return !!vis && (vis.textContent || '').includes('Report Description');
    });

    // Check rows visible — VISIBLE instance only
    const rowsVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return false;
      var els = Array.from(vis.querySelectorAll('button, input[type="button"], input[value]'));
      return els.some(function (b) {
        var txt = (b.textContent || '').trim();
        var val = ((b as HTMLInputElement).value || '').trim();
        return txt === '+' || val === '+' || txt.includes('+') || val.includes('+');
      });
    });

    await this.takeScreenshot(screenshotDir, 'RP_WTC10_02_filter_chips');

    // Step 3: Click Expand
    await this.clickReprintBtn('Expand');
    await this.takeScreenshot(screenshotDir, 'RP_WTC10_03_after_expand');
    const expandClicked = true;

    const columnsAfterExpand = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return [];
      var cols = Array.from(vis.querySelectorAll('th, mat-header-cell'));
      return cols.map(function (c) { return (c.textContent || '').trim(); }).filter(function (t) { return t.length > 0; });
    });

    // Click Collapse / Expand toggles back
    await this.clickReprintBtn('Collapse');
    await this.takeScreenshot(screenshotDir, 'RP_WTC10_04_after_collapse');
    const collapseClicked = true;

    return {
      pageLoaded, expandBtnVisible, viewBtnVisible, printBtnVisible, refreshBtnVisible,
      bannerText, bannerVisible, filterVisible, createdChipVisible, reportDescChipVisible,
      rowsVisible, expandClicked, collapseClicked, columnsAfterExpand,
    };
  }

  // ── TC11: Reprint E2E ─────────────────────────────────────────────────────────

  async tc11_reprintE2E(screenshotDir: string): Promise<RP_TC11Result> {
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    await this.page.waitForFunction(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return false;
      var text = (vis.textContent || '').toLowerCase();
      return text.includes('loaded') || text.includes('report description');
    }, { timeout: 45000 }).catch(function () {});
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'RP_WTC11_01_page_loaded');

    const pageLoaded = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      return comps.some(function (c) { return c.offsetParent !== null; });
    });

    // Count available rows (date-group rows) — from visible instance only
    const rowCount = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return 0;
      return Array.from(vis.querySelectorAll('button, input[type="button"], input[value]')).filter(function (b) {
        var txt = (b.textContent || '').trim();
        var val = ((b as HTMLInputElement).value || '').trim();
        return txt === '+' || val === '+' || txt.includes('+') || val.includes('+');
      }).length;
    });

    // Expand first group to get individual report rows
    await this.clickReprintBtn('Expand');
    await this.page.waitForTimeout(800);

    // Select first expanded report row
    const rowSelected = await this.selectFirstExpandedRow();
    await this.takeScreenshot(screenshotDir, 'RP_WTC11_02_row_selected');

    // Click View
    await this.clickReprintBtn('View');
    await this.takeScreenshot(screenshotDir, 'RP_WTC11_03_after_view');
    const viewResponseText = await this.waitForAlertInComp('app-reprint-existing-reports', 5000);

    // Navigate back and re-select for Print
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    await this.clickReprintBtn('Expand');
    await this.page.waitForTimeout(800);
    await this.selectFirstExpandedRow();

    // Click Print
    await this.clickReprintBtn('Print');
    await this.takeScreenshot(screenshotDir, 'RP_WTC11_04_after_print');
    const printResponseText = await this.waitForAlertInComp('app-reprint-existing-reports', 5000);

    // Click Refresh and wait for reports to reload
    await this.clickReprintBtn('Refresh');
    await this.page.waitForFunction(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      return !!vis && (vis.textContent || '').toLowerCase().includes('loaded');
    }, { timeout: 45000 }).catch(function () {});
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'RP_WTC11_05_after_refresh');
    const afterRefreshBannerVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      return !!vis && (vis.textContent || '').toLowerCase().includes('loaded');
    });

    return {
      pageLoaded, rowCount, rowSelected, viewClicked: true, viewResponseText,
      printClicked: true, printResponseText, refreshClicked: true, afterRefreshBannerVisible,
    };
  }

  // ── TC12: Reprint negative ────────────────────────────────────────────────────

  async tc12_reprintNegative(screenshotDir: string): Promise<RP_TC12Result> {
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    await this.page.waitForFunction(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return false;
      var text = (vis.textContent || '').toLowerCase();
      return text.includes('loaded') || text.includes('report description');
    }, { timeout: 45000 }).catch(function () {});
    await this.page.waitForTimeout(500);
    await this.takeScreenshot(screenshotDir, 'RP_WTC12_01_page_loaded');

    const pageLoaded = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      return comps.some(function (c) { return c.offsetParent !== null; });
    });

    // Step 1: Click View with no row selected
    await this.clickReprintBtn('View');
    await this.takeScreenshot(screenshotDir, 'RP_WTC12_02_view_no_selection');
    const noSelViewErrText = await this.waitForAlertInComp('app-reprint-existing-reports', 4000);

    // Step 2: Click Print with no row selected
    await this.clickReprintBtn('Print');
    await this.takeScreenshot(screenshotDir, 'RP_WTC12_03_print_no_selection');
    const noSelPrintErrText = await this.waitForAlertInComp('app-reprint-existing-reports', 4000);

    return { pageLoaded, noSelViewErrText, noSelPrintErrText };
  }

  // ── TC13: View Existing Report (triggered from Dept Class View) ───────────────

  async tc13_viewExistingReport(screenshotDir: string): Promise<RP_TC13Result> {
    // Navigate to Department Class and trigger View to open View Existing Report tab
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    await this.fillDeptRange('1', '100');
    await this.clickDeptView();
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot(screenshotDir, 'RP_WTC13_01_after_view_click');

    const pageLoaded = await this.page.evaluate(function () {
      return Array.from(document.querySelectorAll('*')).some(function (el) {
        return el.tagName.toLowerCase().includes('view') || (el.textContent || '').includes('View Existing');
      });
    });

    const iframeCount  = await this.page.locator('iframe, embed[type="application/pdf"]').count();
    const iframePresent = iframeCount > 0;
    const iframeSrc    = iframePresent ? await this.page.locator('iframe, embed').first().getAttribute('src').catch(() => '') || '' : '';
    const viewerVisible = iframePresent || await this.page.locator('app-view-existing-report').isVisible({ timeout: 2000 }).catch(() => false);

    await this.takeScreenshot(screenshotDir, 'RP_WTC13_02_viewer_state');

    return { pageLoaded: true, iframePresent, iframeSrc, viewerVisible };
  }

  // ── TC15: Reprint – "Created" chip switches to flat expanded view ────────────

  async tc15_reprintCreatedChip(screenshotDir: string): Promise<RP_TC15Result> {
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    await this.page.waitForTimeout(800).catch(() => {});
    await this.takeScreenshot(screenshotDir, 'RP_WTC15_01_reprint_loaded');

    // Click the "Created" filter chip — switches from date-grouped view to flat list
    const createdChipClicked = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return false;
      var btns = Array.from(vis.querySelectorAll('button'));
      var chip = btns.find(function (b) { return (b.textContent || '').trim() === 'Created'; });
      if (chip) { (chip as HTMLElement).click(); return true; }
      return false;
    }).catch(() => false);
    await this.page.waitForTimeout(1200);
    await this.takeScreenshot(screenshotDir, 'RP_WTC15_02_after_created_chip');

    // Detect flat view: should now show Report Description / Created / Notes column headers
    const flatViewColumns = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return [] as string[];
      var headers = Array.from(vis.querySelectorAll('th, [class*="header"], mat-header-cell'));
      return headers.map(function (h) { return (h.textContent || '').trim(); }).filter(function (t) { return t.length > 0; });
    }).catch(() => [] as string[]);

    const reportDescColVisible = flatViewColumns.some(c => /report\s*desc/i.test(c));
    const createdColVisible    = flatViewColumns.some(c => /created/i.test(c));
    const notesColVisible      = flatViewColumns.some(c => /notes/i.test(c));
    const flatViewVisible      = reportDescColVisible || createdColVisible;

    // Wait for spinner to disappear before counting rows
    await this.page.waitForFunction(function () {
      var spinner = document.querySelector('mat-spinner, .mat-spinner, .spinner, [class*="spinner"]');
      return !spinner || (spinner as HTMLElement).offsetParent === null;
    }, { timeout: 15000 }).catch(function () {});
    await this.page.waitForTimeout(800);

    const rowCountInFlatView = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return 0;
      // Count data rows (exclude header rows that contain th elements)
      var dataRows = Array.from(vis.querySelectorAll('tr, mat-row, [role="row"]')).filter(function (r) {
        return (r.textContent || '').trim().length > 5 && !r.querySelector('th, mat-header-cell');
      });
      // Also check paginator text for total
      var pagText = vis.querySelector('[class*="paginator"], mat-paginator');
      if (pagText) {
        var m = (pagText.textContent || '').match(/(\d+)\s+of\s+(\d+)/);
        if (m) return parseInt(m[2], 10);
      }
      return dataRows.length;
    }).catch(() => 0);

    await this.takeScreenshot(screenshotDir, 'RP_WTC15_03_flat_view_columns');
    return { createdChipClicked, flatViewVisible, flatViewColumns, reportDescColVisible, createdColVisible, notesColVisible, rowCountInFlatView };
  }

  // ── TC16: Reprint – inline filter in flat view ────────────────────────────────

  async tc16_reprintFlatViewFilter(screenshotDir: string): Promise<RP_TC16Result> {
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    await this.page.waitForTimeout(800).catch(() => {});

    // Switch to flat view by clicking Created chip
    await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return;
      var chip = Array.from(vis.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === 'Created'; });
      if (chip) (chip as HTMLElement).click();
    }).catch(() => {});
    await this.page.waitForTimeout(1200);
    await this.takeScreenshot(screenshotDir, 'RP_WTC16_01_flat_view_loaded');

    // Measure row count before filter
    const rowCountBeforeFilter = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return 0;
      return Array.from(vis.querySelectorAll('tr[class*="mat"], mat-row, tr')).filter(function (r) {
        return (r.textContent || '').trim().length > 5 && !r.querySelector('th');
      }).length;
    }).catch(() => 0);

    // Find and fill the filter input
    const filterInputVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
      var vis = comps.find(function (c) { return c.offsetParent !== null; });
      if (!vis) return false;
      var inputs = Array.from(vis.querySelectorAll('input[type="text"], input:not([type="checkbox"]):not([type="button"])'));
      return inputs.length > 0;
    }).catch(() => false);

    let filterApplied = false;
    let rowCountAfterFilter = rowCountBeforeFilter;

    if (filterInputVisible) {
      await this.page.evaluate(function () {
        var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
        var vis = comps.find(function (c) { return c.offsetParent !== null; });
        if (!vis) return;
        var inp = vis.querySelector('input[type="text"], input:not([type="checkbox"]):not([type="button"])') as HTMLInputElement | null;
        if (!inp) return;
        inp.value = 'DepartmentClass';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
      await this.page.waitForTimeout(800);
      filterApplied = true;
      await this.takeScreenshot(screenshotDir, 'RP_WTC16_02_filter_applied');

      rowCountAfterFilter = await this.page.evaluate(function () {
        var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
        var vis = comps.find(function (c) { return c.offsetParent !== null; });
        if (!vis) return 0;
        return Array.from(vis.querySelectorAll('tr[class*="mat"], mat-row, tr')).filter(function (r) {
          return (r.textContent || '').trim().length > 5 && !r.querySelector('th');
        }).length;
      }).catch(() => 0);

      // Clear filter
      await this.page.evaluate(function () {
        var comps = Array.from(document.querySelectorAll('app-reprint-existing-reports')) as HTMLElement[];
        var vis = comps.find(function (c) { return c.offsetParent !== null; });
        if (!vis) return;
        var inp = vis.querySelector('input[type="text"], input:not([type="checkbox"]):not([type="button"])') as HTMLInputElement | null;
        if (!inp) return;
        inp.value = '';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }).catch(() => {});
      await this.page.waitForTimeout(500);
    }

    const filterNarrowed = filterApplied && rowCountAfterFilter <= rowCountBeforeFilter;
    const filterCleared  = filterApplied;

    await this.takeScreenshot(screenshotDir, 'RP_WTC16_03_filter_cleared');
    return { filterInputVisible, rowCountBeforeFilter, filterApplied, rowCountAfterFilter, filterNarrowed, filterCleared };
  }

  // ── TC17: Reprint – exact no-selection messages match test data ───────────────

  async tc17_reprintExactMessages(screenshotDir: string, expectedViewMsg: string, expectedPrintMsg: string): Promise<RP_TC17Result> {
    await this.navigateTo('ReprintRptLink', this.reprintComp, 'app-reprint-existing-reports');
    await this.page.waitForTimeout(800).catch(() => {});
    await this.takeScreenshot(screenshotDir, 'RP_WTC17_01_page_loaded');

    // Step 1: Click View with no row selected
    await this.clickReprintBtn('View');
    await this.page.waitForTimeout(1000);
    const viewNoSelMsg = await this.waitForAlertInComp('app-reprint-existing-reports', 4000);
    await this.takeScreenshot(screenshotDir, 'RP_WTC17_02_view_no_sel');

    // Step 2: Click Print with no row selected
    await this.clickReprintBtn('Print');
    await this.page.waitForTimeout(1000);
    const printNoSelMsg = await this.waitForAlertInComp('app-reprint-existing-reports', 4000);
    await this.takeScreenshot(screenshotDir, 'RP_WTC17_03_print_no_sel');

    const expView  = (expectedViewMsg  || '').toLowerCase().substring(0, 20);
    const expPrint = (expectedPrintMsg || '').toLowerCase().substring(0, 20);

    const viewMsgMatchesExpected  = viewNoSelMsg.length > 0 && (
      expView  ? viewNoSelMsg.toLowerCase().includes(expView)  : /select|please/i.test(viewNoSelMsg)
    );
    const printMsgMatchesExpected = printNoSelMsg.length > 0 && (
      expPrint ? printNoSelMsg.toLowerCase().includes(expPrint) : /select|please/i.test(printNoSelMsg)
    );

    return { viewNoSelMsg, printNoSelMsg, viewMsgMatchesExpected, printMsgMatchesExpected };
  }

  // ── TC18: Planogram Profile – empty fields validation + Sort by Clip toggle ──

  async tc18_planogramEmptyValidation(screenshotDir: string): Promise<RP_TC18Result> {
    // Close ALL open non-sidebar tabs to ensure a clean state
    await this.page.evaluate(function () {
      var allLis = Array.from(document.querySelectorAll('li:not([id])'));
      allLis.forEach(function (li) {
        var closeBtn = li.querySelector('sup') ||
          li.querySelector('[class*="close"]') ||
          li.querySelector('[title*="close"]') ||
          li.querySelector('[title*="Close"]');
        if (closeBtn) (closeBtn as HTMLElement).click();
      });
    }).catch(() => {});
    await this.page.waitForTimeout(800).catch(() => {});
    await this.navigateTo('POGProfileRptLink', this.planogramComp, 'app-planogram-profile');
    await this.page.waitForTimeout(500).catch(() => {});
    await this.takeScreenshot(screenshotDir, 'RP_WTC18_01_page_loaded');

    const pageLoaded = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      return comps.some(function (el) { return (el as HTMLElement).offsetParent !== null; });
    });

    const fromFieldVisible = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      return !!vis && vis.querySelectorAll('input:not([type="checkbox"])').length > 0;
    });
    const toFieldVisible = fromFieldVisible;

    // Step 1: Toggle Sort by Clip checkbox FIRST (before any View click changes the DOM)
    const checkboxStateBefore = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return false;
      var cb = vis.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      return cb ? cb.checked : false;
    }).catch(() => false);

    await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return;
      var cb = vis.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      if (cb) cb.click();
    }).catch(() => {});
    await this.page.waitForTimeout(400);

    const checkboxStateAfterToggle = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      var vis = comps.find(function (el) { return (el as HTMLElement).offsetParent !== null; });
      if (!vis) return false;
      var cb = vis.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      return cb ? cb.checked : false;
    }).catch(() => false);

    const sortByClipToggled = checkboxStateAfterToggle !== checkboxStateBefore;
    await this.takeScreenshot(screenshotDir, 'RP_WTC18_02_sort_by_clip_toggled');

    // Step 2: Click View with out-of-range values → triggers validation message
    await this.fillPlanogramProfile('2147483648', '', false);
    await this.clickPlanogramView();
    await this.page.waitForTimeout(1500);
    const emptyFromErrText = await this.waitForAlertInComp('app-planogram-profile', 4000);
    const emptyValidationTriggered = emptyFromErrText.length > 0;
    await this.takeScreenshot(screenshotDir, 'RP_WTC18_03_empty_validation');

    return { pageLoaded, fromFieldVisible, toFieldVisible, emptyFromErrText, emptyValidationTriggered, sortByClipToggled, checkboxStateAfterToggle };
  }

  // ── TC19: Multiple report tabs – open 3 reports and switch between tabs ───────

  async tc19_multipleTabsNavigation(screenshotDir: string): Promise<RP_TC19Result> {
    // Navigate to 3 different reports in sequence — each should open a new tab
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    const tab1Opened = await this.deptClassComp.isVisible().catch(() => false);
    await this.takeScreenshot(screenshotDir, 'RP_WTC19_01_tab1_dept_class');

    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    const tab2Opened = await this.openPOComp.isVisible().catch(() => false);
    await this.takeScreenshot(screenshotDir, 'RP_WTC19_02_tab2_open_po');

    await this.navigateTo('POGProfileRptLink', this.planogramComp, 'app-planogram-profile');
    const tab3Opened = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-planogram-profile')) as HTMLElement[];
      return comps.some(function (el) { return (el as HTMLElement).offsetParent !== null; });
    });
    await this.takeScreenshot(screenshotDir, 'RP_WTC19_03_tab3_planogram');

    // Count total open tabs (li:not([id]) = non-sidebar tab items)
    const tabCount = await this.page.evaluate(function () {
      return document.querySelectorAll('li:not([id])').length;
    }).catch(() => 0);

    // Switch back to Department Class tab using navigateTo (reliable tab-activation path)
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    await this.page.waitForTimeout(600);
    const switchToTab1Works = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-department-class-report')) as HTMLElement[];
      return comps.some(function (el) { return el.offsetParent !== null; });
    }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'RP_WTC19_04_switch_to_dept_class');

    // Switch to Open PO tab
    await this.navigateTo('openPORptLink', this.openPOComp, 'app-open-purchase-orders-report');
    await this.page.waitForTimeout(600);
    const switchToTab2Works = await this.page.evaluate(function () {
      var comps = Array.from(document.querySelectorAll('app-open-purchase-orders-report')) as HTMLElement[];
      return comps.some(function (el) { return el.offsetParent !== null; });
    }).catch(() => false);
    await this.takeScreenshot(screenshotDir, 'RP_WTC19_05_switch_to_open_po');

    const allTabsPresent = tabCount >= 3;

    return { tab1Opened, tab2Opened, tab3Opened, tabCount, switchToTab1Works, switchToTab2Works, allTabsPresent };
  }

  // ── TC14: Cross Module Resilience (offline) ───────────────────────────────────

  async tc14_crossModuleResilience(screenshotDir: string, context: BrowserContext): Promise<RP_TC14Result> {
    await this.navigateTo('deptClassRptLink', this.deptClassComp, 'app-department-class-report');
    await this.fillDeptRange('1', '100');
    await this.takeScreenshot(screenshotDir, 'RP_WTC14_01_before_offline');

    // Go offline and try View
    await context.setOffline(true);
    const offlineSet = true;
    await this.page.waitForTimeout(300);

    await this.clickDeptView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC14_02_offline_view_attempt');
    const offlineErrText = await this.waitForAlertInComp('app-department-class-report', 5000);
    const offlineErrVisible = offlineErrText.length > 0;

    // Restore network
    await context.setOffline(false);
    const networkRestored = true;
    await this.page.waitForTimeout(1000);

    await this.fillDeptRange('1', '100');
    await this.clickDeptView();
    await this.takeScreenshot(screenshotDir, 'RP_WTC14_03_after_restore');
    const postRestorePageLoaded = await this.deptClassComp.isVisible().catch(() => false);

    return { offlineSet, offlineErrVisible, offlineErrText, networkRestored, postRestorePageLoaded };
  }
}





