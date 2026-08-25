import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { getConfig } from '../utils/configReader';

test.describe('Login', () => {
  let page: Page;
  const cfg = getConfig();

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => { await page.context().close(); });

  test('Login test', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(cfg.username, cfg.password);

    const panel = loginPage.getLoggedInPanel();
    await expect(panel).toContainText('UserName (Logged in as)');
    await expect(panel).toContainText(cfg.username);
    await expect(panel).toContainText('Role Assigned');
    await expect(panel).toContainText('Admin');
    await expect(panel).toContainText('ISP Application Version');
    await expect(panel).toContainText('Store Number (Host Name)');
  });
});
