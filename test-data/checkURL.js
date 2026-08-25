const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  const beforeUrl = page.url();
  console.log('After login URL:', beforeUrl);

  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });
  await page.waitForTimeout(2000);

  const afterUrl = page.url();
  console.log('After User Management nav URL:', afterUrl);
  
  await browser.close();
})();
