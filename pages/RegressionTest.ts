import fs from 'fs';
import path from 'path';
import { BrowserContext, Page, TestInfo } from '@playwright/test';
import { ApplicationAlertsPage } from './ApplicationAlertsPage';
import { ArchiveRecordsPage } from './ArchiveRecordsPage';
import { InventoryAdjustmentsPage } from './InventoryAdjustmentsPage';
import { ItemInquiryPage } from './ItemInquiryPage';
import { LabelRequestPage } from './LabelRequestPage';
import { LoginPage } from './LoginPage';
import { OrderReceivingPage } from './OrderReceivingPage';
import { PriceChangeActivationPage } from './PriceChangeActivationPage';
import { SanityTestPage } from './SanityTest';
import { StoreAddressInquiryPage } from './StoreAddressInquiryPage';
import { UserManagementPage } from './UserManagementPage';
import {
  getAlertsTestData,
  getArchiveRecordsTestData,
  getGenericSKUListBuilderTestData,
  getInventoryAdjustmentsTestData,
  getItemInquiryTestData,
  getLabelRequestTestData,
  getOrderReceivingTestData,
  getPriceChangeActivationTestData,
  getRegressionDbData,
  getStoreAddressInquiryTestData,
  getUserManagementTestData,
  RegressionDbData,
} from '../utils/excelHelper';
import { getConfig } from '../utils/configReader';

export interface RegressionCase {
  id: string;
  feature: string;
  name: string;
  scenarioType: string;
}

export interface AllPagesLoadingResult {
  pagesChecked: number;
  loadedPages: string[];
  failedPages: string[];
}

const ALL_PAGE_MENU_LABELS = [
  'Application Alerts',
  'Item Inquiry',
  'Store Address Inquiry',
  'Worksheets',
  'Purchase Orders',
  'Receive Without PO',
  'Inventory Adjustments History',
  'Outbound Store To Store Transfer',
  'Quantity On-Hand Validation',
  'Negative On-Hand Validation',
  'Return To Vendor',
  'User Requested Labels',
  'Planogram Labels',
  'Item Maintenance Labels',
  'Mass Labels',
  'Price Point Labels',
  'Merchandise Labels',
  'Activation',
  'Deactivation',
  'Price Change Activation',
  'Generic SKU List Builder',
  'Archive Records',
  'User Management',
  'Overstock Label Printing',
  'Overstock Reset',
  'Overstock Transfer',
  'Override with Truck/Inventory Day',
  'Replenishment Threshold Report',
  'HINO Report',
  'High Overstock Report',
  'Clearance Overstock Report',
  'Existing Overstock Filter Report',
  'Seasonal Overstock Location Report',
  'SISO List Completion Report',
  'SISO List Item Detail Report',
  'Pull List Item Detail Report',
  'SISO List Completion History Report',
  'Audit Completion Report',
  'Audit Item Details Report',
  'Audit Completion History Report',
  'Department Class',
  'Open Purchase Orders',
  'Purchase Order Activity',
  'Planogram Profile',
  'Reprint Existing Reports',
] as const;

const PAGE_SECTION_LABELS: Record<string, string> = {
  'Item Inquiry': 'Inquiry',
  'Store Address Inquiry': 'Inquiry',
  'Worksheets': 'Ordering and Receiving',
  'Purchase Orders': 'Ordering and Receiving',
  'Receive Without PO': 'Ordering and Receiving',
  'Inventory Adjustments History': 'Inventory Adjustments',
  'Outbound Store To Store Transfer': 'Inventory Adjustments',
  'Quantity On-Hand Validation': 'Inventory Adjustments',
  'Negative On-Hand Validation': 'Inventory Adjustments',
  'Return To Vendor': 'Inventory Adjustments',
  'User Requested Labels': 'Label Request',
  'Planogram Labels': 'Label Request',
  'Item Maintenance Labels': 'Label Request',
  'Mass Labels': 'Label Request',
  'Price Point Labels': 'Label Request',
  'Merchandise Labels': 'Label Request',
  'Activation': 'Planogram',
  'Deactivation': 'Planogram',
  'Overstock Label Printing': 'SISO / DR',
  'Overstock Reset': 'SISO / DR',
  'Overstock Transfer': 'SISO / DR',
  'Override with Truck/Inventory Day': 'SISO / DR',
  'Replenishment Threshold Report': 'SISO / DR',
  'HINO Report': 'SISO / DR',
  'High Overstock Report': 'SISO / DR',
  'Clearance Overstock Report': 'SISO / DR',
  'Existing Overstock Filter Report': 'SISO / DR',
  'Seasonal Overstock Location Report': 'SISO / DR',
  'SISO List Completion Report': 'SISO / DR',
  'SISO List Item Detail Report': 'SISO / DR',
  'Pull List Item Detail Report': 'SISO / DR',
  'SISO List Completion History Report': 'SISO / DR',
  'Audit Completion Report': 'SISO / DR',
  'Audit Item Details Report': 'SISO / DR',
  'Audit Completion History Report': 'SISO / DR',
  'Department Class': 'Reports',
  'Open Purchase Orders': 'Reports',
  'Purchase Order Activity': 'Reports',
  'Planogram Profile': 'Reports',
  'Reprint Existing Reports': 'Reports',
};

const PAGE_COMPONENT_SELECTORS: Record<string, string> = {
  'Department Class': 'app-department-class-report',
  'Open Purchase Orders': 'app-open-purchase-orders-report',
  'Purchase Order Activity': 'app-purchase-order-activity-report',
  'Planogram Profile': 'app-planogram-profile',
  'Reprint Existing Reports': 'app-reprint-existing-reports',
};

export const REGRESSION_CASES: RegressionCase[] = [
  ['AL_WTC01', 'Application Alerts', 'Load alerts grid and validate columns', 'Positive'],
  ['AL_WTC02', 'Application Alerts', 'Filter alerts and verify empty result behavior', 'Negative'],
  ['AL_WTC05', 'Application Alerts', 'No Application Alerts', 'Edge'],
  ['AR_WTC01', 'Archive Records', 'Load archive page controls and grid', 'Positive'],
  ['AR_WTC02', 'Archive Records', 'Toggle history/finalized view', 'Edge'],
  ['p', 'Inventory Adjustment History', 'Inventory Adjustment History UI and interaction walkthrough', 'Positive'],
  ['IA_WTC12', 'Inventory Adjustment History', 'Inventory Adjustment History no-record behavior', 'Negative'],
  ['TC-INQ-01', 'Item Inquiry', 'Load Item Inquiry screen', 'Positive'],
  ['TC-INQ-02', 'Item Inquiry', 'Search item by valid SKU', 'Positive'],
  ['TC-INQ-03', 'Item Inquiry', 'Search item by valid UPC', 'Positive'],
  ['TC-INQ-04', 'Item Inquiry', 'Search with invalid SKU/UPC', 'Negative'],
  ['TC-INQ-05', 'Item Inquiry', 'Search with empty input', 'Negative'],
  ['TC-INQ-06', 'Item Inquiry', 'Search with alphanumeric input in SKU field', 'Negative'],
  ['TC-INQ-08', 'Item Inquiry', 'Advanced search - search by Description', 'Positive'],
  ['TC-INQ-09', 'Item Inquiry', 'Advanced search - Vendor Name requires Department', 'Negative'],
  ['TC-INQ-10', 'Item Inquiry', 'Advanced search - Include/Exclude Clearance Items', 'Positive'],
  ['TC-INQ-11', 'Item Inquiry', 'Advanced search - no results found', 'Negative'],
  ['TC-INQ-12', 'Item Inquiry', 'Item Results list navigation', 'Positive'],
  ['TC-INQ-13', 'Item Inquiry', 'Item Details - verify Sales History table', 'Positive'],
  ['TC-INQ-14', 'Item Inquiry', 'Item Details - verify Planogram table', 'Positive'],
  ['TC-INQ-15', 'Item Inquiry', 'Item Details - verify Promotions table', 'Positive'],
  ['TC-INQ-16', 'Item Inquiry', 'Item Details - verify Vendor table', 'Positive'],
  ['TC-INQ-17', 'Item Inquiry', 'Item Details - verify Assortment and Overstock tables', 'Positive'],
  ['TC-INQ-18', 'Item Inquiry', 'Item Details - Pricing display format', 'Positive'],
  ['TC-INQ-21', 'Item Inquiry', 'Spinner displayed during search', 'Positive'],
  ['TC-INQ-22', 'Item Inquiry', 'Search by pressing Enter key', 'Positive'],
  ['TC-INQ-23', 'Item Inquiry', 'Item with no planogram data', 'Edge'],
  ['TC-INQ-24', 'Item Inquiry', 'Item with no sales history', 'Edge'],
  ['TC-LR-22', 'Item Maintenance Labels', 'Load Item Maintenance Label page', 'Positive'],
  ['TC-LR-23', 'Item Maintenance Labels', 'Filter by Reason', 'Positive'],
  ['OR_UI_013', 'PO Receiving Sessions', 'Load PO Receiving Sessions page and verify metadata', 'Positive'],
  ['OR_UI_014', 'PO Receiving Sessions', 'Expand session details and sort', 'Positive'],
  ['OR_UI_001', 'Purchase Orders', 'Load Purchase Orders page and identify all top-level controls', 'Positive'],
  ['OR_UI_003', 'Purchase Orders', 'Filter by valid criteria and reset', 'Positive'],
  ['OR_UI_004', 'Purchase Orders', 'Filter with empty criteria', 'Negative'],
  ['OR_UI_005', 'Purchase Orders', 'Filter with no matching records', 'Negative'],
  ['OR_UI_007', 'Purchase Orders', 'Expand hierarchy and sort columns', 'Positive'],
  ['OR_UI_034', 'Receive Without PO', 'Initial load, PO number generation, and default action states', 'Positive'],
  ['OR_UI_044', 'Worksheets', 'Load Worksheets UI controls and default grid', 'Positive'],
  ['TC-LR-15', 'Planogram Label Request', 'Load Planogram Label Request page', 'Positive'],
  ['TC-LR-16', 'Planogram Label Request', 'View valid Planogram', 'Positive'],
  ['TC-LR-17', 'Planogram Label Request', 'View invalid/non-existent Planogram', 'Negative'],
  ['PCA_WTC06', 'Price Change Activation - Find Popup', 'Find success flow for Event, Batch, and SKU', 'Positive'],
  ['PCA_WTC07', 'Price Change Activation - Find Popup', 'Find validation for empty and not-found input', 'Negative'],
  ['PCA_WTC03', 'Price Change Activation - Grid Interactions', 'Sort columns and verify value formatting', 'Positive'],
  ['PCA_WTC02', 'Price Change Activation - Hierarchy', 'Expand/collapse Event -> Batch -> Item hierarchy', 'Positive'],
  ['PCA_WTC01', 'Price Change Activation - Landing', 'Load page and validate primary UI controls', 'Positive'],
  ['TC-SAI-01', 'Store Address Inquiry', 'Load Store Address Inquiry screen', 'Positive'],
  ['TC-SAI-02', 'Store Address Inquiry', 'Search by Store Number', 'Positive'],
  ['TC-SAI-03', 'Store Address Inquiry', 'Search by City', 'Positive'],
  ['TC-SAI-04', 'Store Address Inquiry', 'Search by Zip Code', 'Positive'],
  ['TC-SAI-05', 'Store Address Inquiry', 'Search by State/Province code', 'Positive'],
  ['TC-SAI-06', 'Store Address Inquiry', 'Search with no criteria', 'Negative'],
  ['TC-SAI-07', 'Store Address Inquiry', 'Search with non-existent store number', 'Negative'],
  ['TC-SAI-08', 'Store Address Inquiry', 'Non-numeric input in Store Number field', 'Negative'],
  ['TC-SAI-10', 'Store Address Inquiry', 'Grid filter/search within results', 'Positive'],
  ['TC-SAI-11', 'Store Address Inquiry', 'Grid column sorting', 'Positive'],
  ['TC-SAI-12', 'Store Address Inquiry', 'Grid pagination', 'Positive'],
  ['TC-SAI-14', 'Store Address Inquiry', 'Combined multi-field search', 'Positive'],
  ['TC-SAI-16', 'Store Address Inquiry', 'Search by entering data and pressing Enter key', 'Positive'],
  ['TC-UM-01', 'User Management', 'Load User Management page', 'Positive'],
  ['TC-UM-02', 'User Management', 'Filter users by keyword', 'Positive'],
  ['TC-UM-03', 'User Management', 'Filter with no matching results', 'Negative'],
  ['TC-UM-04', 'User Management', 'Sort grid columns', 'Positive'],
  ['TC-UM-06', 'User Management', 'Pagination - change page size', 'Positive'],
  ['TC-UM-23', 'User Management', 'Load page with no users', 'Edge'],
  ['REG_UI_067', 'Webapp Navigation', 'Verify all pages are loading properly', 'Positive'],
].map(([id, feature, name, scenarioType]) => ({ id, feature, name, scenarioType }));

export type RegressionResult = object;

export class RegressionTest {
  private readonly cfg = getConfig();
  private readonly baseUrl = (process.env.REGRESSION_BASE_URL ?? 'http://sr097402:8080').replace(/\/+$/, '');
  private readonly screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots', 'regressionTest');
  private dbData: RegressionDbData[] = [];

  constructor(
    private readonly page: Page,
    private readonly context: BrowserContext,
  ) {}

  async login(): Promise<void> {
    await new ItemInquiryPage(this.page).setupApiMocks(this.context);
    await new StoreAddressInquiryPage(this.page).setupApiMocks(this.context);
    await this.page.goto(`${this.baseUrl}/webapp/`);
    const loginPage = new LoginPage(this.page);
    await loginPage.login(
      process.env.REGRESSION_USERNAME ?? this.cfg.username,
      process.env.REGRESSION_PASSWORD ?? this.cfg.password,
    );
    await this.page.waitForTimeout(1200);
    this.dbData = await getRegressionDbData();
  }

  async execute(testCase: RegressionCase, testInfo: TestInfo): Promise<RegressionResult> {
    try {
      return await this.runActions(testCase.id);
    } finally {
      await this.attachScreenshot(testCase.id, testInfo);
    }
  }

  private async runActions(id: string): Promise<RegressionResult> {
    const alerts = new ApplicationAlertsPage(this.page);
    const archive = new ArchiveRecordsPage(this.page);
    const inventory = new InventoryAdjustmentsPage(this.page);
    const inquiry = new ItemInquiryPage(this.page);
    const labels = new LabelRequestPage(this.page);
    const orderReceiving = new OrderReceivingPage(this.page);
    const pca = new PriceChangeActivationPage(this.page);
    const store = new StoreAddressInquiryPage(this.page);
    const users = new UserManagementPage(this.page);
    const screenshotDir = this.screenshotDir;

    if (id === 'REG_UI_067') {
      return this.runAllPagesLoading(screenshotDir);
    }

    if (id.startsWith('AL_')) {
      const data = await this.byId(getAlertsTestData, id);
      if (id === 'AL_WTC01') return alerts.tc01_loadAlertsGrid(screenshotDir, data);
      if (id === 'AL_WTC02') return alerts.tc02_filterAlerts(screenshotDir, data);
      return alerts.tc05_noApplicationAlerts(screenshotDir);
    }

    if (id.startsWith('AR_')) {
      const data = await this.byId(getArchiveRecordsTestData, id);
      if (id === 'AR_WTC01') return archive.tc01_loadArchivePage(screenshotDir);
      return archive.tc02_toggleHistoryView(screenshotDir);
    }

    if (id === 'p') return inventory.ia11_iaHistoryUIWalkthrough(screenshotDir);
    if (id === 'IA_WTC12') {
      return inventory.ia12_iaHistoryNoRecord(screenshotDir, await this.byId(getInventoryAdjustmentsTestData, id));
    }

    if (id.startsWith('TC-INQ-')) {
      const data = this.itemData(await this.byId(getItemInquiryTestData, id));
      const actions: Record<string, () => Promise<RegressionResult>> = {
        'TC-INQ-01': () => inquiry.tc01_loadItemInquiryScreen(screenshotDir),
        'TC-INQ-02': () => inquiry.tc02_searchByValidSku(screenshotDir, data),
        'TC-INQ-03': () => inquiry.tc03_searchByValidUpc(screenshotDir, data),
        'TC-INQ-04': () => inquiry.tc04_searchWithInvalidSku(screenshotDir, data),
        'TC-INQ-05': () => inquiry.tc05_searchWithEmptyInput(screenshotDir),
        'TC-INQ-06': () => inquiry.tc06_alphanumericInputRejected(screenshotDir),
        'TC-INQ-08': () => inquiry.tc08_advancedSearchByDescription(screenshotDir, data),
        'TC-INQ-09': () => inquiry.tc09_vendorNameRequiresDept(screenshotDir, data),
        'TC-INQ-10': () => inquiry.tc10_clearanceItemsFilter(screenshotDir, data),
        'TC-INQ-11': () => inquiry.tc11_noResultsFound(screenshotDir, data),
        'TC-INQ-12': () => inquiry.tc12_itemResultsNavigation(screenshotDir, data),
        'TC-INQ-13': () => inquiry.tc13_salesHistoryTable(screenshotDir, data),
        'TC-INQ-14': () => inquiry.tc14_planogramTable(screenshotDir, data),
        'TC-INQ-15': () => inquiry.tc15_promotionsTable(screenshotDir, data),
        'TC-INQ-16': () => inquiry.tc16_vendorTable(screenshotDir, data),
        'TC-INQ-17': () => inquiry.tc17_assortmentAndOverstock(screenshotDir, data),
        'TC-INQ-18': () => inquiry.tc18_pricingDisplayFormat(screenshotDir, data),
        'TC-INQ-21': () => inquiry.tc21_spinnerDuringSearch(screenshotDir, data),
        'TC-INQ-22': () => inquiry.tc22_searchByEnterKey(screenshotDir, data),
        'TC-INQ-23': () => inquiry.tc23_itemNoPlanogramData(screenshotDir, data),
        'TC-INQ-24': () => inquiry.tc24_itemNoSalesHistory(screenshotDir, data),
      };
      return actions[id]();
    }

    if (id === 'TC-LR-22') return labels.lr22_loadItemMaintenancePage(screenshotDir);
    if (id === 'TC-LR-23') return labels.lr23_filterByReason(screenshotDir, await this.byId(getLabelRequestTestData, id));

    const orderData = await this.byId(getOrderReceivingTestData, 'OR_WTC01');
    const orderActions: Record<string, () => Promise<RegressionResult>> = {
      OR_UI_013: () => orderReceiving.tc07_sessionsLoad(screenshotDir, orderData),
      OR_UI_014: () => orderReceiving.tc08_sessionsActionsAndAudit(screenshotDir, orderData),
      OR_UI_001: () => orderReceiving.tc01_poLoadAndControls(screenshotDir),
      OR_UI_003: () => orderReceiving.tc03_filterSearchReset(screenshotDir, orderData),
      OR_UI_004: () => orderReceiving.tc03_filterSearchReset(screenshotDir, orderData),
      OR_UI_005: () => orderReceiving.tc03_filterSearchReset(screenshotDir, orderData),
      OR_UI_007: () => orderReceiving.tc05_expandHierarchyAndSort(screenshotDir),
      OR_UI_034: () => orderReceiving.tc13_receiveWithoutPOLoad(screenshotDir, orderData),
      OR_UI_044: () => orderReceiving.tc15_worksheetsLoad(screenshotDir, orderData),
    };
    if (orderActions[id]) return orderActions[id]();

    const labelData = await this.byId(getLabelRequestTestData, id);
    const labelActions: Record<string, () => Promise<RegressionResult>> = {
      'TC-LR-15': () => labels.lr15_loadPlanogramPage(screenshotDir),
      'TC-LR-16': () => labels.lr16_viewValidPlanogram(screenshotDir, labelData),
      'TC-LR-17': () => labels.lr17_viewInvalidPlanogram(screenshotDir, labelData),
    };
    if (labelActions[id]) return labelActions[id]();

    const pcaData = await this.byId(getPriceChangeActivationTestData, id);
    const pcaActions: Record<string, () => Promise<RegressionResult>> = {
      PCA_WTC06: () => pca.pca06_findSuccessFlow(screenshotDir, pcaData),
      PCA_WTC07: () => pca.pca07_findValidation(screenshotDir, pcaData),
      PCA_WTC03: () => pca.pca03_sortAndFormat(screenshotDir),
      PCA_WTC02: () => pca.pca02_expandCollapseHierarchy(screenshotDir),
      PCA_WTC01: () => pca.pca01_loadPageAndValidateUI(screenshotDir),
    };
    if (pcaActions[id]) return pcaActions[id]();

    if (id.startsWith('TC-SAI-')) {
      const data = this.storeData(await this.byId(getStoreAddressInquiryTestData, id));
      const storeActions: Record<string, () => Promise<RegressionResult>> = {
        'TC-SAI-01': () => store.tc01_loadScreen(screenshotDir),
        'TC-SAI-02': () => store.tc02_searchByStoreNumber(screenshotDir, data),
        'TC-SAI-03': () => store.tc03_searchByCity(screenshotDir, data),
        'TC-SAI-04': () => store.tc04_searchByZip(screenshotDir, data),
        'TC-SAI-05': () => store.tc05_searchByState(screenshotDir, data),
        'TC-SAI-06': () => store.tc06_searchWithNoCriteria(screenshotDir, data),
        'TC-SAI-07': () => store.tc07_searchNonExistentStore(screenshotDir, data),
        'TC-SAI-08': () => store.tc08_nonNumericInStoreField(screenshotDir),
        'TC-SAI-10': () => store.tc10_gridFilter(screenshotDir, data),
        'TC-SAI-11': () => store.tc11_gridColumnSorting(screenshotDir, data),
        'TC-SAI-12': () => store.tc12_gridPagination(screenshotDir, data),
        'TC-SAI-14': () => store.tc14_multiFieldSearch(screenshotDir, data),
        'TC-SAI-16': () => store.tc16_searchByEnterKey(screenshotDir, data),
      };
      return storeActions[id]();
    }

    if (id.startsWith('TC-UM-')) {
      const data = await this.byId(getUserManagementTestData, id);
      const userActions: Record<string, () => Promise<RegressionResult>> = {
        'TC-UM-01': () => users.tc01_loadUserManagementPage(screenshotDir),
        'TC-UM-02': () => users.tc02_filterUsersByKeyword(screenshotDir, data),
        'TC-UM-03': () => users.tc03_filterNoMatch(screenshotDir, data),
        'TC-UM-04': () => users.tc04_sortGridColumns(screenshotDir),
        'TC-UM-06': () => users.tc06_pagination(screenshotDir),
        'TC-UM-23': () => users.tc23_loadPageEmptyState(screenshotDir),
      };
      return userActions[id]();
    }

    throw new Error(`No regression action mapping exists for ${id}`);
  }

  private async runAllPagesLoading(screenshotDir: string): Promise<AllPagesLoadingResult> {
    const sanityPage = new SanityTestPage(this.page);
    const loadedPages: string[] = [];
    const failedPages: string[] = [];

    for (const [index, menuLabel] of ALL_PAGE_MENU_LABELS.entries()) {
      const initialTabText = await sanityPage.getActiveTabText();
      const initialPageSignature = await this.getPageSignature();
      const menuAvailable = await sanityPage.isMenuLabelAvailable(menuLabel);
      const sectionMenu = menuAvailable ? await sanityPage.isSectionMenuLabel(menuLabel) : false;
      const sectionLabel = PAGE_SECTION_LABELS[menuLabel];
      if (menuAvailable && !sectionMenu && sectionLabel) {
        await this.ensureSectionExpanded(sectionLabel, menuLabel);
      }
      const navClicked = menuAvailable && !sectionMenu
        ? await sanityPage.clickMenuLabel(menuLabel)
        : false;

      if (navClicked) await this.page.waitForTimeout(1800);

      let tabText = await sanityPage.getActiveTabText();
      let tabVisible = this.isExpectedTabMatch(tabText, menuLabel);
      if (!tabVisible && navClicked) {
        const activated = await sanityPage.activateExpectedTab(menuLabel);
        if (activated) {
          tabText = await sanityPage.getActiveTabText();
          tabVisible = this.isExpectedTabMatch(tabText, menuLabel);
        }
      }

      const tabChanged = tabText.trim().toLowerCase() !== initialTabText.trim().toLowerCase();
      const pageChanged = initialPageSignature !== await this.getPageSignature();
      const componentVisible = await this.isVisibleComponent(PAGE_COMPONENT_SELECTORS[menuLabel]);
      const appAreaVisible = await sanityPage.isAppAreaVisible();

      if (menuAvailable && !sectionMenu && navClicked &&
        (tabVisible || tabChanged || pageChanged || componentVisible) && appAreaVisible) {
        loadedPages.push(menuLabel);
      } else {
        failedPages.push(menuLabel);
      }
    }

    return {
      pagesChecked: ALL_PAGE_MENU_LABELS.length,
      loadedPages,
      failedPages,
    };
  }

  private isExpectedTabMatch(tabText: string, expectedTab: string): boolean {
    const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const expectedKey = normalize(expectedTab);
    return !!expectedKey && normalize(tabText).includes(expectedKey);
  }

  private async getPageSignature(): Promise<string> {
    return this.page.evaluate(() => {
      const body = document.body.cloneNode(true) as HTMLElement;
      body.querySelector('#sideMenu')?.remove();
      return (body.innerText || body.textContent || '').replace(/\s+/g, ' ').trim();
    }).catch(() => '');
  }

  private async isVisibleComponent(selector?: string): Promise<boolean> {
    if (!selector) return false;
    return this.page.locator(selector).evaluateAll(elements =>
      elements.some(element => {
        const node = element as HTMLElement;
        return node.offsetParent !== null && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0;
      })
    ).catch(() => false);
  }

  private async ensureSectionExpanded(sectionLabel: string, pageLabel: string): Promise<void> {
    const pageMenuItem = this.page.locator('#sideMenu').getByText(pageLabel, { exact: true }).first();
    if (await pageMenuItem.isVisible().catch(() => false)) return;

    const expanded = await this.page.evaluate((label: string) => {
      const normalize = (value: string) =>
        value.replace(/arrow_drop_(down|up)/gi, '').trim().toLowerCase().replace(/\s+/g, ' ');
      const sideMenu = document.getElementById('sideMenu');
      if (!sideMenu) return false;

      const wanted = normalize(label);
      const sectionItems = Array.from(sideMenu.querySelectorAll('li'));
      for (const item of sectionItems) {
        const candidates = Array.from(item.querySelectorAll<HTMLElement>('*'));
        const target = candidates.find(candidate => normalize(candidate.textContent ?? '') === wanted);
        if (!target) continue;
        if (/arrow_drop_down/i.test(target.textContent ?? '')) {
          target.click();
          return true;
        }
        return true;
      }
      return false;
    }, sectionLabel).catch(() => false);

    if (expanded) await this.page.waitForTimeout(700);
  }

  private async byId<T>(
    loader: () => Promise<T[]>,
    id: string,
  ): Promise<T> {
    const rows = await loader();
    return rows.find(row => (row as { testCase?: string }).testCase === id) ?? rows[0];
  }

  private itemData<T extends object>(data: T): T {
    const values = data as Record<string, string>;
    const dbItem = this.dbData.find(row => row.dataSet === 'activeItem' && row.skuNo);
    if (!dbItem) return data;
    return {
      ...data,
      validSkuNo: values.validSkuNo || dbItem.skuNo,
      validUpcNo: values.validUpcNo || dbItem.upcNo,
      validItemDesc: values.validItemDesc || dbItem.description,
      skuWithPlanogram: values.skuWithPlanogram || dbItem.skuNo,
      skuWithSalesHistory: values.skuWithSalesHistory || dbItem.skuNo,
    } as T;
  }

  private storeData<T extends object>(data: T): T {
    const values = data as Record<string, string>;
    const dbStore = this.dbData.find(row => row.dataSet === 'activeStore' && row.storeNo);
    if (!dbStore) return data;
    return {
      ...data,
      validStoreNo: values.validStoreNo || dbStore.storeNo,
      validCity: values.validCity || dbStore.city,
      validState: values.validState || dbStore.state,
      validZip: values.validZip || dbStore.zip,
      validPhone: values.validPhone || dbStore.phone,
      validAddress1: values.validAddress1 || dbStore.addressLine1,
    } as T;
  }

  private async attachScreenshot(id: string, testInfo: TestInfo): Promise<void> {
    fs.mkdirSync(this.screenshotDir, { recursive: true });
    const screenshotPath = path.join(this.screenshotDir, `${id}.png`);
    await this.page.evaluate(() => {
      const sideMenu = document.getElementById('sideMenu');
      if (sideMenu) {
        sideMenu.dataset.regressionPreviousStyle = sideMenu.getAttribute('style') ?? '';
        sideMenu.style.setProperty('display', 'none', 'important');
      }
    }).catch(() => {});
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true, timeout: 10000 });
      await testInfo.attach(`${id}-screenshot`, { path: screenshotPath, contentType: 'image/png' });
    } catch {
      // The page may already be closed after a test timeout.
    } finally {
      await this.page.evaluate(() => {
        const sideMenu = document.getElementById('sideMenu');
        if (!sideMenu) return;
        const previous = sideMenu.dataset.regressionPreviousStyle;
        if (previous) sideMenu.setAttribute('style', previous);
        else sideMenu.removeAttribute('style');
        delete sideMenu.dataset.regressionPreviousStyle;
      }).catch(() => {});
    }
  }
}
