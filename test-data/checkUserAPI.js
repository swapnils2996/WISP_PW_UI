const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  let usersResponse = null;
  page.on('response', async resp => {
    if (resp.url().includes('jgetUsers')) {
      try {
        const text = await resp.text();
        usersResponse = text;
      } catch (e) { /* ignore */ }
    }
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });
  await page.waitForTimeout(3000);

  if (usersResponse) {
    console.log('Response type:', typeof usersResponse);
    console.log('First 500 chars:', usersResponse.substring(0, 500));
    try {
      let parsed = JSON.parse(usersResponse);
      // Response may be double-encoded (string inside JSON)
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      const arr = Array.isArray(parsed) ? parsed : (parsed.d ? JSON.parse(parsed.d) : []);
      console.log('Array length:', arr.length);
      if (arr.length > 0) {
        console.log('First item keys:', Object.keys(arr[0]));
        const u = arr.find(u => u.UserName === '2738971');
        console.log('User 2738971:', JSON.stringify(u, null, 2));
      }
    } catch(e) {
      console.log('JSON parse error:', e.message);
    }
  } else {
    console.log('No jgetUsers response captured');
  }

  await browser.close();
})();
