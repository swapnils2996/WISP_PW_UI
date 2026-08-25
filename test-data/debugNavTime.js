const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.route('**/ItemService.svc/**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '"null"' });
  });
  const page = await context.newPage();

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log(`[NAV ${Date.now()}]`, frame.url());
    }
  });

  const t0 = Date.now();
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  console.log(`Login page loaded in ${Date.now()-t0}ms`);

  if (page.url().includes('Login')) {
    await page.locator('input[type="text"]').first().fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    for (const sel of ['button:has-text("Login")', 'button.btn-primary', 'input[type="submit"]']) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) { await btn.click({ force: true }); break; }
    }
    await page.waitForTimeout(3000);
  }

  const t1 = Date.now();
  console.log(`After login: ${Date.now()-t0}ms, URL:`, page.url());

  // Navigate to Item Inquiry
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  const t2 = Date.now();
  console.log(`After sidebar nav: ${t2-t0}ms total, ${t2-t1}ms nav time`);

  const skuInput = page.locator('input[placeholder="Please enter your search criteria."]');
  const visible = await skuInput.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`SKU input visible: ${visible}, total time: ${Date.now()-t0}ms`);

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
