const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.route('**/ItemService.svc/**', async route => {
    const url = route.request().url();
    console.log('[ROUTE intercepted]', url.substring(url.indexOf('ItemService')));
    const mockData = require('./mockItemData.json');
    if (url.includes('/saleshistory/')) {
      const sku = url.split('/saleshistory/')[1]?.split('?')[0] ?? '';
      const item = mockData[sku] ?? null;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(item ? JSON.stringify(item) : '"null"') });
    } else if (url.includes('/jitems')) {
      const params = new URL(url).searchParams;
      const desc = params.get('description') ?? '';
      const kw = desc.toLowerCase();
      const results = Object.values(mockData).filter(i => i.Description && i.Description.toLowerCase().includes(kw));
      console.log('[jitems] desc:', desc, 'results:', results.length);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(JSON.stringify(results)) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '"null"' });
    }
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

  // Check form-control text inputs before and after toggle
  const beforeCount = await page.locator('input.form-control[type="text"]').count();
  console.log('Text inputs before toggle:', beforeCount);

  // Check if panel is already expanded
  const descVis = await page.locator('input.form-control[type="text"]').nth(0).isVisible({ timeout: 1000 }).catch(() => false);
  console.log('Desc vis before toggle:', descVis);

  // Click toggle
  const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await toggle.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const afterCount = await page.locator('input.form-control[type="text"]').count();
  const afterVis = await page.locator('input.form-control[type="text"]').nth(0).isVisible({ timeout: 1000 }).catch(() => false);
  console.log('Text inputs after toggle:', afterCount, 'vis:', afterVis);

  // Try filling desc
  const t0 = Date.now();
  await page.locator('input.form-control[type="text"]').nth(0).fill('MATBOARD', { timeout: 5000 }).catch(e => console.log('fill error:', e.message));
  console.log('Fill took', Date.now() - t0, 'ms');
  const val = await page.locator('input.form-control[type="text"]').nth(0).inputValue().catch(() => 'error');
  console.log('Desc value after fill:', val);

  // Check Find btn
  const findBtn = page.locator('button:has-text("Find")').first();
  const findVis = await findBtn.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Find btn visible:', findVis);

  if (findVis) {
    console.log('Clicking Find...');
    const t1 = Date.now();
    await findBtn.click({ force: true, timeout: 10000 }).catch(e => console.log('findBtn error:', e.message));
    console.log('Find click took', Date.now() - t1, 'ms');
    await page.waitForTimeout(3000);

    const tabs = await page.locator('.nav-tabs li a').allTextContents().catch(() => []);
    console.log('Tabs after search:', tabs);
    await page.screenshot({ path: 'test-data/debug_after_find.png' });
    console.log('Screenshot saved');
  }

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
