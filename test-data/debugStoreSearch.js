const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const mockData = [
    { StoreNo: 1425, StoreType: 'S', CloseDate: null, ShippingAddress: { City: 'SAN TAN VALLEY', State: 'AZ', Phone: '', AddressLine1: 'NEW STORE 2026', AddressLine2: 'CONTACT CHRIS NEU FOR MORE INF', AddressLine3: 'NEUC@MICHAELS.COM', Zip: '75038' } },
    { StoreNo: 1437, StoreType: 'S', CloseDate: null, ShippingAddress: { City: 'SHORELINE', State: 'WA', Phone: '', AddressLine1: 'NEW STORE 2026', AddressLine2: 'CONTACT CHRIS NEU FOR INFO', AddressLine3: 'NEUC@MICHAELS.COM', Zip: '75038' } },
  ];

  // Try BOTH single and double encoding
  let routeCallCount = 0;

  await context.route('**/StoreService.svc/jRetrieveStores**', async route => {
    routeCallCount++;
    const url = route.request().url();
    const params = new URL(url).searchParams;
    const storeNum = params.get('storeNumber') ?? '';
    console.log(`[ROUTE #${routeCallCount}] intercepted: storeNumber=${storeNum}`);

    let results = mockData;
    if (storeNum) results = results.filter(s => String(s.StoreNo).includes(storeNum));
    
    // Double-encode: Angular auto-parses outer layer, component calls JSON.parse(resp)
    const body = JSON.stringify(JSON.stringify(results));
    console.log('Returning body:', body.substring(0, 120));

    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: body,
    });
  });

  const page = await context.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (/StoreService/i.test(url)) {
      const body = await resp.text().catch(() => '');
      console.log('[STORE RESPONSE]', resp.status(), url.substring(0, 100), '→', body.substring(0, 200));
    }
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  if (page.url().includes('Login')) {
    await page.locator('input[type="text"]').first().fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    for (const sel of ['button:has-text("Login")', 'button.btn-primary']) {
      if (await page.locator(sel).isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.locator(sel).click({ force: true }); break;
      }
    }
    await page.waitForTimeout(3000);
  }

  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Store Address Inquiry/i.test(e.textContent) && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  // Fill store number
  const inputs = page.locator('input.form-control');
  await inputs.nth(0).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('1425');

  await page.locator('button:has-text("Search")').first().click({ force: true });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'test-data/debug_store_search.png', fullPage: true });

  const gridText = await page.evaluate(() => {
    const grid = document.querySelector('mat-table');
    return grid ? grid.textContent?.trim().replace(/\s+/g, ' ').substring(0, 500) : 'no mat-table';
  });
  console.log('Grid text:', gridText);

  const matRows = await page.locator('mat-row').count();
  console.log('Mat row count:', matRows);

  const paginationText = await page.locator('[class*="paginator"]').first().textContent({ timeout: 2000 }).catch(() => '');
  console.log('Pagination text:', paginationText?.trim());

  console.log('Route intercept count:', routeCallCount);

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
