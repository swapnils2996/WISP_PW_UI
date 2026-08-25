# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: IntermittentTestCases.spec.ts >> Intermittent Test Cases - Defect Verification >> ITC-DEF-002 - Store Number loads within 1 second on home page (no delayed render)
- Location: tests/IntermittentTestCases.spec.ts:68:7

# Error details

```
Error: Store Number should eventually load on home page

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e9] [cursor=pointer]: print
  - generic [ref=e11]:
    - generic:
      - generic [ref=e14]: 
      - list [ref=e16]:
        - listitem [ref=e17]:
          - generic [ref=e18] [cursor=pointer]: No Application Alerts
        - listitem [ref=e19]:
          - generic [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: arrow_drop_down
            - text: Inquiry
        - listitem [ref=e22]:
          - generic [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: arrow_drop_down
            - text: Ordering and Receiving
        - listitem [ref=e25]:
          - generic [ref=e26] [cursor=pointer]:
            - generic [ref=e27]: arrow_drop_down
            - text: Inventory Adjustments
        - listitem [ref=e28]:
          - generic [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: arrow_drop_down
            - text: Label Request
        - listitem [ref=e31]:
          - generic [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: arrow_drop_down
            - text: Planogram
        - listitem:
          - generic: Price Change Activation
        - listitem:
          - generic: Generic Sku List Builder
        - listitem:
          - generic: Archive Records
        - listitem:
          - generic: User Management
        - listitem [ref=e34]:
          - generic [ref=e35] [cursor=pointer]:
            - generic [ref=e36]: arrow_drop_down
            - text: SISO / DR
        - listitem [ref=e37]:
          - generic [ref=e38] [cursor=pointer]:
            - generic [ref=e39]: arrow_drop_down
            - text: Reports
    - generic [ref=e42]:
      - list [ref=e43]:
        - listitem
      - generic [ref=e47]:
        - generic [ref=e49]:
          - img [ref=e50]
          - separator [ref=e51]
          - generic [ref=e52]: Windows In-Store Processor
        - generic [ref=e53]:
          - generic [ref=e54]: "User Name :"
          - textbox [ref=e56]: system
        - generic [ref=e57]:
          - generic [ref=e58]: "Password :"
          - textbox [ref=e60]: p38l
        - generic [ref=e62]:
          - button "Login" [active] [ref=e63] [cursor=pointer]
          - button "Clear" [ref=e64] [cursor=pointer]
        - generic [ref=e67]:
          - generic [ref=e68]: 
          - text: Unable to connect to server!
```

# Test source

```ts
  1   | import { test, expect, Page, BrowserContext } from '@playwright/test';
  2   | import path from 'path';
  3   | import { LoginPage } from '../pages/LoginPage';
  4   | import {
  5   |   IntermittentTestCasesPage,
  6   | } from '../pages/IntermittentTestCases';
  7   | import type {
  8   |   ITC_DEF003_Result,
  9   |   ITC_DEF004_Result,
  10  |   ITC_DEF017_Result,
  11  |   ITC_DEF018_Result,
  12  |   ITC_DEF022_Result,
  13  |   ITC_DEF023_Result,
  14  |   ITC_DEF024_Result,
  15  |   ITC_DEF025_Result,
  16  |   ITC_DEF026_Result,
  17  |   ITC_DEF031_Result,
  18  |   ITC_DEF039_Result,
  19  | } from '../pages/IntermittentTestCases';
  20  | import { getIntermittentTestData, IntermittentTestCasesTestData } from '../utils/excelHelper';
  21  | import { getConfig } from '../utils/configReader';
  22  | import { addPageRecovery } from '../utils/pageRecovery';
  23  | 
  24  | const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'intermittentTestCases');
  25  | 
  26  | test.describe('Intermittent Test Cases - Defect Verification', () => {
  27  |   let page: Page;
  28  |   let context: BrowserContext;
  29  |   let itcData: IntermittentTestCasesTestData[];
  30  |   let itcPage: IntermittentTestCasesPage;
  31  |   const cfg = getConfig();
  32  | 
  33  |   addPageRecovery(
  34  |     () => ({ context, page }),
  35  |     (ctx, pg) => { context = ctx; page = pg; itcPage = new IntermittentTestCasesPage(pg); }
  36  |   );
  37  | 
  38  |   test.beforeAll(async ({ browser }) => {
  39  |     test.setTimeout(120000);
  40  |     itcData = await getIntermittentTestData();
  41  |     context = await browser.newContext();
  42  |     page = await context.newPage();
  43  |     itcPage = new IntermittentTestCasesPage(page);
  44  | 
  45  |     const loginPage = new LoginPage(page);
  46  |     await loginPage.navigate();
  47  |     await loginPage.login(cfg.username, cfg.password);
  48  |     await page.waitForTimeout(2000);
  49  |   });
  50  | 
  51  |   test.afterAll(async () => { await context.close(); });
  52  | 
  53  |   function getData(tc: string): IntermittentTestCasesTestData {
  54  |     return itcData.find(r => r.testCase === tc) ?? itcData[0];
  55  |   }
  56  | 
  57  |   // ── ITC-DEF-001: Version Number Mismatch on Home Page ────────────────────
  58  |   test('ITC-DEF-001 - Home page ISP Application Version is visible and non-empty', async () => {
  59  |     test.setTimeout(60000);
  60  |     const data = getData('ITC-DEF-001');
  61  |     const result = await itcPage.itc_def001_versionNumberOnHome(SCREENSHOTS_DIR, data);
  62  | 
  63  |     expect(result.versionVisible, 'ISP Application Version row should be visible on home page').toBe(true);
  64  |     expect(result.versionNonEmpty, `Version value should not be empty; got: "${result.versionValue}"`).toBe(true);
  65  |   });
  66  | 
  67  |   // ── ITC-DEF-002: Store Number Delayed Loading ─────────────────────────────
  68  |   test('ITC-DEF-002 - Store Number loads within 1 second on home page (no delayed render)', async () => {
  69  |     test.setTimeout(60000);
  70  |     const data = getData('ITC-DEF-002');
  71  |     const result = await itcPage.itc_def002_storeNumberLoading(SCREENSHOTS_DIR, data);
  72  | 
> 73  |     expect(result.storeNumberLoadedEventually, 'Store Number should eventually load on home page').toBe(true);
      |                                                                                                    ^ Error: Store Number should eventually load on home page
  74  |     expect(result.storeNumberLoadedImmediate,
  75  |       `Store Number should load within 1 second (no 3-5 second delay); value="${result.storeNumberValue}"`
  76  |     ).toBe(true);
  77  |   });
  78  | 
  79  |   // ── ITC-DEF-013: Planogram Grids Show 12/31/1969 Dates ───────────────────
  80  |   test('ITC-DEF-013 - Planogram Activation History dates must not contain 12/31/1969', async () => {
  81  |     test.setTimeout(90000);
  82  |     const data = getData('ITC-DEF-013');
  83  |     const result = await itcPage.itc_def013_planogramDates1969(SCREENSHOTS_DIR, data);
  84  | 
  85  |     expect(result.historyGridVisible, 'Planogram history grid should be visible').toBe(true);
  86  |     expect(result.hasInvalidDate1969,
  87  |       `No dates should contain 1969; found: ${JSON.stringify(result.invalidDates)}`
  88  |     ).toBe(false);
  89  |   });
  90  | 
  91  |   // ── ITC-DEF-014: RWOPO PO Number Leading Digit Dropped ───────────────────
  92  |   test('ITC-DEF-014 - Receive Without PO header PO number must be 8+ digits (not truncated)', async () => {
  93  |     test.setTimeout(60000);
  94  |     const data = getData('ITC-DEF-014');
  95  |     const result = await itcPage.itc_def014_rwopoPoNumberTruncated(SCREENSHOTS_DIR, data);
  96  | 
  97  |     expect(result.rwopoPageVisible, 'Receive Without PO page should be visible').toBe(true);
  98  |     if (result.poHeaderVisible) {
  99  |       expect(result.poNumberIs8Digits,
  100 |         `PO number should be 8+ digits; got: "${result.poNumberDisplayed}"`
  101 |       ).toBe(true);
  102 |     }
  103 |   });
  104 | 
  105 |   // ── ITC-DEF-015: PO Receiving Sessions Header Dates Show 12/31/1969 ───────
  106 |   test('ITC-DEF-015 - PO Receiving Sessions Ordered and Arrived dates must not contain 1969', async () => {
  107 |     test.setTimeout(120000);
  108 |     const data = getData('ITC-DEF-015');
  109 |     const result = await itcPage.itc_def015_sessionHeaderDates(SCREENSHOTS_DIR, data);
  110 | 
  111 |     if (result.sessionHeaderVisible) {
  112 |       expect(result.orderedDateHas1969,
  113 |         `Ordered date should not contain 1969; got: "${result.orderedDateValue}"`
  114 |       ).toBe(false);
  115 |       expect(result.arrivedDateHas1969,
  116 |         `Arrived date should not contain 1969; got: "${result.arrivedDateValue}"`
  117 |       ).toBe(false);
  118 |     } else {
  119 |       expect(result.sessionHeaderVisible, 'PO Receiving Sessions page should be accessible').toBe(true);
  120 |     }
  121 |   });
  122 | 
  123 |   // ── ITC-DEF-016: PO Receiving Sessions Grid Empty Despite API Rows ─────────
  124 |   test('ITC-DEF-016 - PO Receiving Sessions grid must show rows (not remain empty)', async () => {
  125 |     test.setTimeout(120000);
  126 |     const data = getData('ITC-DEF-016');
  127 |     const result = await itcPage.itc_def016_sessionGridEmpty(SCREENSHOTS_DIR, data);
  128 | 
  129 |     expect(result.sessionGridVisible, 'Session grid should be visible').toBe(true);
  130 |     expect(result.gridHasRows,
  131 |       `Session grid should have at least 1 row; found ${result.sessionRowCount}`
  132 |     ).toBe(true);
  133 |   });
  134 | 
  135 |   // ── ITC-DEF-019: Not Ordered Opens Browser Prompt Instead of Modal ────────
  136 |   test('ITC-DEF-019 - Not Ordered button must open a modal dialog, not a browser prompt', async () => {
  137 |     test.setTimeout(90000);
  138 |     const data = getData('ITC-DEF-019');
  139 |     const result = await itcPage.itc_def019_notOrderedInteractionModel(SCREENSHOTS_DIR, data);
  140 | 
  141 |     if (result.notOrderedBtnVisible) {
  142 |       expect(result.browserPromptDetected,
  143 |         'Not Ordered should NOT trigger a browser window.prompt()'
  144 |       ).toBe(false);
  145 |       expect(result.notOrderedModalVisible,
  146 |         'Not Ordered should open an in-page Angular modal dialog'
  147 |       ).toBe(true);
  148 |     } else {
  149 |       expect(result.notOrderedBtnVisible, 'Not Ordered button should be visible on PO Receive page').toBe(true);
  150 |     }
  151 |   });
  152 | 
  153 |   // ── ITC-DEF-020: Finalize Skips Print Receiver Confirmation ──────────────
  154 |   test('ITC-DEF-020 - Receive Without PO finalize must show Print Receiver confirmation dialog', async () => {
  155 |     test.setTimeout(180000);
  156 |     const data = getData('ITC-DEF-020');
  157 |     const result = await itcPage.itc_def020_finalizeSkipsPrintDialog(SCREENSHOTS_DIR, data);
  158 | 
  159 |     // Finalize must have been attempted; if items were present a dialog should appear,
  160 |     // if no items an error message is shown — both confirm finalize is functional
  161 |     expect(result.finalizeAttempted, 'Finalize button should be clickable on the RWOPO page').toBe(true);
  162 |     if (result.finalizeAttempted && result.printReceiverDialogVisible) {
  163 |       expect(result.printReceiverDialogText.toLowerCase()).toMatch(/print|receiver|yes|no/i);
  164 |     }
  165 |   });
  166 | 
  167 |   // ── ITC-DEF-021: On Order Column Blank in RWOPO Grid ─────────────────────
  168 |   test('ITC-DEF-021 - Receive Without PO grid On Order column must not be blank', async () => {
  169 |     test.setTimeout(180000);
  170 |     const data = getData('ITC-DEF-021');
  171 |     const result = await itcPage.itc_def021_onOrderColumnBlank(SCREENSHOTS_DIR, data);
  172 | 
  173 |     // On Order column must exist in the grid; if an item was added, value must not be blank
```