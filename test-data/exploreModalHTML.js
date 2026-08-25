const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost/webapp/');
  await page.waitForTimeout(2000);
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

  // Navigate to User Management
  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });
  await page.waitForTimeout(3000);

  // Click edit on row for 2738971
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

  // Wait for modal
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  console.log('Modal opened, waiting 3s for data to load...');
  await page.waitForTimeout(3000);

  // Capture HTML
  const html = await page.locator('app-update-user, app-edit-user').evaluate(el => el.outerHTML).catch(() => 'NOT FOUND');
  fs.writeFileSync(path.join(__dirname, 'modal_html.txt'), html);
  console.log('HTML saved to modal_html.txt');
  console.log('First 1000 chars:', html.substring(0, 1000));

  // Check for labels
  const labelInfo = await page.evaluate(() => {
    const labels = document.querySelectorAll('app-update-user label, app-edit-user label');
    return Array.from(labels).map(l => ({ tag: l.tagName, text: l.textContent?.trim(), class: l.className }));
  });
  console.log('Labels in update modal:', JSON.stringify(labelInfo, null, 2));

  // Check for all elements with user data
  const allText = await page.evaluate(() => {
    const el = document.querySelector('app-update-user') || document.querySelector('app-edit-user');
    if (!el) return 'Not found';
    return el.innerText;
  });
  console.log('Modal text:', allText);

  await browser.close();
})();
