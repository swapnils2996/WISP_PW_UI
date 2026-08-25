const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ baseURL: 'http://isp.stores.michaels.com' });
  const page = await ctx.newPage();

  await page.goto('/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  // Navigate to User Management
  const sideMenu = page.locator('#sideMenu');
  if (!await sideMenu.isVisible()) {
    await page.locator('.sidebar-launcher').click({ force: true });
    await page.waitForTimeout(600);
  }
  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });
  await page.waitForSelector('mat-table', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Click mode_edit on the first row
  const firstRow = page.locator('mat-row').first();
  const editIcon = firstRow.locator('i.material-icons').filter({ hasText: 'mode_edit' }).first();
  await editIcon.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  await page.waitForTimeout(2000); // Wait for data to load in modal

  await page.screenshot({ path: 'test-results/um_modify_modal.png', fullPage: true });

  // Get modal HTML
  const modalHtml = await page.evaluate(function () {
    var modal = document.querySelector('[role="dialog"]');
    return modal ? modal.outerHTML.substring(0, 6000) : 'NOT FOUND';
  });
  console.log('=== MODIFY MODAL HTML ===');
  console.log(modalHtml);

  await browser.close();
})().catch(console.error);
