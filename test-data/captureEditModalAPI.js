const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // Capture all requests and responses
  const apiCalls = [];
  page.on('request', req => {
    if (!req.url().includes('.js') && !req.url().includes('.css') && !req.url().includes('.png')) {
      apiCalls.push({ type: 'REQ', method: req.method(), url: req.url() });
    }
  });
  page.on('response', resp => {
    if (!resp.url().includes('.js') && !resp.url().includes('.css') && !resp.url().includes('.png')) {
      apiCalls.push({ type: 'RESP', status: resp.status(), url: resp.url() });
    }
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);
  
  console.log('=== API calls after login ===');
  apiCalls.splice(0).forEach(c => console.log(JSON.stringify(c)));

  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });
  await page.waitForTimeout(3000);
  
  console.log('\n=== API calls after nav to User Management ===');
  apiCalls.splice(0).forEach(c => console.log(JSON.stringify(c)));

  // Click edit on 2738971
  const rows = page.locator('mat-row');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const txt = (await row.textContent()) || '';
    if (txt.includes('2738971')) {
      const editIcon = row.locator('i.material-icons').filter({ hasText: 'mode_edit' }).first();
      if (await editIcon.count() > 0) {
        await editIcon.click();
        break;
      }
    }
  }
  await page.waitForTimeout(5000);
  
  console.log('\n=== API calls after opening edit modal for 2738971 ===');
  apiCalls.splice(0).forEach(c => console.log(JSON.stringify(c)));

  await browser.close();
})();
