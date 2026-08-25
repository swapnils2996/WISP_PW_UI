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
  await page.waitForTimeout(1000);

  // Open create modal and enter mismatched passwords
  await page.locator('i.material-icons').filter({ hasText: 'person_add' }).click();
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  await page.locator('app-create-user input[type="text"]').nth(0).fill('testmismatch');
  await page.locator('app-create-user input[type="password"]').nth(0).fill('Pass@1234');
  await page.locator('app-create-user input[type="password"]').nth(1).fill('Wrong@5678');
  await page.locator('app-create-user input[type="password"]').nth(1).dispatchEvent('input');
  await page.locator('app-create-user input[type="password"]').nth(1).dispatchEvent('blur');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/um_mismatch_state.png', fullPage: true });

  // Get HTML of the mismatch area (col-md-1 area)
  const mismatchHtml = await page.evaluate(function () {
    var modal = document.querySelector('app-create-user .modal-body');
    return modal ? modal.innerHTML.substring(0, 4000) : 'NOT FOUND';
  });
  console.log('=== MODAL BODY HTML (mismatch state) ===');
  console.log(mismatchHtml);

  await browser.close();
})().catch(console.error);
