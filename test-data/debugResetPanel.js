const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.route('**/ItemService.svc/**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '"null"' });
  });
  const page = await context.newPage();

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  if (page.url().includes('Login')) {
    await page.locator('input[type="text"]').first().fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    for (const sel of ['button:has-text("Login")', 'button.btn-primary']) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) { await btn.click({ force: true }); break; }
    }
    await page.waitForTimeout(3000);
  }

  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  // Expand panel
  const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await toggle.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const desc = page.locator('input.form-control[type="text"]').nth(0);
  const v0 = await desc.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('1. Desc visible after toggle:', v0);

  // Fill SKU and desc
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('123458');
  await desc.fill('test description');
  console.log('2. Filled SKU and desc');

  // Click Reset
  await page.locator('button:has-text("Reset")').first().click({ force: true });
  await page.waitForTimeout(600);

  // Check if desc is still visible
  const v1 = await desc.isVisible({ timeout: 1000 }).catch(() => false);
  const descVal = await desc.inputValue().catch(() => 'error');
  console.log('3. After reset - desc visible:', v1, 'value:', descVal);

  const count = await page.locator('input.form-control[type="text"]').count();
  console.log('4. Text input count after reset:', count);

  await page.screenshot({ path: 'test-data/debug_after_reset.png' });

  // Now simulate TC-INQ-08: fill desc and click Find
  const v2 = await desc.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('5. Desc visible for fill:', v2);
  if (v2) {
    await desc.fill('MATBOARD');
    const val = await desc.inputValue();
    console.log('6. Desc value after fill:', val);
  }

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
