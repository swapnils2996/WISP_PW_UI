import { expect, test } from '@playwright/test';
import { AllPagesLoadingResult, REGRESSION_CASES, RegressionTest } from '../pages/RegressionTest';

test.use({ baseURL: process.env.REGRESSION_BASE_URL ?? 'http://sr097402:8080' });

test.describe('Workbook search, sort, and read regression cases', () => {
  for (const testCase of REGRESSION_CASES) {
    test(`${testCase.id} - ${testCase.name}`, async ({ page, context }, testInfo) => {
      test.setTimeout(testCase.id === 'REG_UI_067' ? 300000 : 180000);

      const runner = new RegressionTest(page, context);
      await runner.login();
      const result = await runner.execute(testCase, testInfo);

      expect(result, `${testCase.id} should return a page-object result`).toBeDefined();
      expect(Object.keys(result), `${testCase.id} should expose validation output`).not.toHaveLength(0);

      if (testCase.id === 'REG_UI_067') {
        const allPagesResult = result as AllPagesLoadingResult;
        expect(allPagesResult.pagesChecked, 'All sidebar pages should be checked').toBe(45);
        expect(allPagesResult.failedPages, `Pages that failed to load: ${allPagesResult.failedPages.join(', ')}`).toEqual([]);
      }
    });
  }
});
