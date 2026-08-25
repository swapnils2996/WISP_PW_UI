const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const mockData = require('./mockItemData.json');
  await context.route('**/ItemService.svc/jitem/saleshistory/**', async route => {
    const url = route.request().url();
    const sku = url.split('/saleshistory/')[1]?.split('?')[0] ?? '';
    const item = mockData[sku] ?? null;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(item ? JSON.stringify(item) : '"null"') });
  });
  await context.route('**/ItemService.svc/jitems**', async route => {
    const url = route.request().url();
    const params = new URL(url).searchParams;
    const desc = (params.get('description') ?? '').toLowerCase();
    const results = Object.values(mockData).filter(i => i.Description && i.Description.toLowerCase().includes(desc));
    console.log('[jitems] desc:', desc, 'results:', results.length);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(JSON.stringify(results)) });
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

  // Expand and search by description
  const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await toggle.click({ force: true });
    await page.waitForTimeout(1000);
  }
  const descEl = page.locator('input.form-control[type="text"]').nth(0);
  await descEl.click({ timeout: 3000 }).catch(() => {});
  await page.keyboard.press('Control+a');
  await page.keyboard.type('MATBOARD');
  await page.waitForTimeout(500);
  
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(4000);
  
  // Get row info
  const rowInfo = await page.evaluate(() => {
    const allRows = Array.from(document.querySelectorAll('mat-row, tr, [class*="mat-row"]'));
    return allRows.map(r => ({
      tag: r.tagName,
      className: r.className.substring(0, 100),
      text: r.textContent?.trim().substring(0, 100),
      visible: r.offsetParent !== null,
    })).filter(r => r.visible && r.text && r.text.length > 0);
  });
  
  console.log('Visible rows:');
  rowInfo.slice(0, 10).forEach(r => console.log(' ', JSON.stringify(r)));
  
  // Screenshot
  await page.screenshot({ path: 'test-data/debug_results_page.png' });
  
  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
