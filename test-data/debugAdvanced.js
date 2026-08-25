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
    for (const sel of ['button:has-text("Login")', 'button.btn-primary', 'input[type="submit"]']) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) { await btn.click({ force: true }); break; }
    }
    await page.waitForTimeout(3000);
  }

  // Navigate to Item Inquiry
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

  // Test the new locator for desc input
  const descNew = page.locator('input.form-control[type="text"]').nth(0);
  const descVis0 = await descNew.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('descInput visible BEFORE toggle click:', descVis0);

  const count0 = await page.locator('input.form-control[type="text"]').count();
  console.log('Count of text form-control inputs BEFORE toggle:', count0);

  // Click toggle
  const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
  const toggleVis = await toggle.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Toggle visible:', toggleVis);
  if (toggleVis) {
    await toggle.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const count1 = await page.locator('input.form-control[type="text"]').count();
  console.log('Count of text form-control inputs AFTER toggle:', count1);

  const descVis1 = await descNew.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('descInput visible AFTER toggle click:', descVis1);

  if (descVis1) {
    await descNew.fill('test description');
    console.log('Filled description field');
    const val = await descNew.inputValue();
    console.log('Desc value:', val);
  }

  // Test reset
  const resetBtn = page.locator('button:has-text("Reset")').first();
  if (await resetBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await resetBtn.click({ force: true });
    await page.waitForTimeout(500);
    const descAfter = await descNew.inputValue().catch(() => 'error');
    console.log('Desc after reset:', descAfter);
    const skuAfter = await page.locator('input[placeholder="Please enter your search criteria."]').inputValue().catch(() => 'error');
    console.log('SKU after reset:', skuAfter);
  }

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
