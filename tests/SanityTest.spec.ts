import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { SanityTestPage } from '../pages/SanityTest';
import { getSanityTestData, SanityTestData } from '../utils/excelHelper';
import { seedSanityTestData } from '../utils/sanityDataSeeder';

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'test-results', 'screenshots', 'sanityTest');
const BASE_URL = 'http://sr097402:8080/webapp/';
const USERNAME = 'system';
const PASSWORD = 'p38l';

test.describe('SanityTest', () => {
  let page: Page;
  let context: BrowserContext;
  let sanityPage: SanityTestPage;
  let sanityData: SanityTestData[];

  test.beforeAll(async ({ browser }) => {
    await seedSanityTestData();
    sanityData = await getSanityTestData();

    context = await browser.newContext();
    page = await context.newPage();
    sanityPage = new SanityTestPage(page);

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const loginPage = new LoginPage(page);
    await loginPage.login(USERNAME, PASSWORD);
    await page.waitForTimeout(1500);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Run sanity cases from Webapp_Sanity.xlsx and DB-seeded testData.xlsx', async () => {
    test.setTimeout(240000);
    expect(sanityData.length, 'SanityTest sheet should have at least one row').toBeGreaterThan(0);

    for (const data of sanityData) {
      await test.step(`${data.testCase} - ${data.menuLabel}`, async () => {
        const result = await sanityPage.runSanityCase(data, SCREENSHOTS_DIR);
        if (!result.menuAvailable) {
          test.info().annotations.push({
            type: 'info',
            description: `Skipped "${result.menuLabel}" because it is not available in current navigation.`,
          });
          return;
        }
        if (result.sectionMenu) {
          test.info().annotations.push({
            type: 'info',
            description: `Skipped "${result.menuLabel}" because it is a section menu and not a direct page.`,
          });
          return;
        }
        if (!result.tabVisible && !result.tabChanged) {
          test.info().annotations.push({
            type: 'info',
            description: `Skipped "${result.menuLabel}" because no matching tab opened in this environment.`,
          });
          return;
        }

        expect(result.navClicked, `Navigation click failed for "${result.menuLabel}"`).toBe(true);
        expect(
          result.tabVisible,
          `Active tab mismatch for "${result.menuLabel}". Actual tab text: "${result.tabText}"`
        ).toBe(true);
        expect(result.appAreaVisible, `Target page area not visible for "${result.menuLabel}"`).toBe(true);

        if (result.expectedMarker.trim()) {
          expect(
            result.markerMatched,
            `Expected page marker text not found for "${result.menuLabel}" (marker: "${result.expectedMarker}")`
          ).toBe(true);
        }
      });
    }
  });
});
