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

  // Open sidebar
  await page.locator('.sidebar-launcher').click({ force: true });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'test-results/sidebar_open.png', fullPage: true });

  // Click User Management link
  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) {
      var a = li.querySelector('a');
      if (a) a.click();
    }
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/userManagement_page.png', fullPage: true });

  // Capture page HTML after navigation
  const pageHtml = await page.evaluate(function () {
    return document.body.innerHTML.substring(0, 8000);
  });
  console.log('=== USER MANAGEMENT PAGE HTML ===');
  console.log(pageHtml);

  // Check what tags exist
  const tags = await page.evaluate(function () {
    var results = [];
    var selectors = ['mat-table', 'table', 'mat-paginator', '.modal', 'app-user-management', 'app-users', 'input[placeholder]'];
    selectors.forEach(function(s) {
      var el = document.querySelector(s);
      results.push(s + ': ' + (el ? 'FOUND' : 'NOT FOUND'));
    });
    return results.join('\n');
  });
  console.log('\n=== ELEMENT CHECK ===');
  console.log(tags);

  await browser.close();
})().catch(console.error);
