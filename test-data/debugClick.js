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

  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await toggle.click({ force: true });
    await page.waitForTimeout(1000);
  }
  const descEl = page.locator('input.form-control[type="text"]').nth(0);
  await descEl.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('MATBOARD');
  
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(4000);

  // Inspect table DOM
  const tableHtml = await page.evaluate(() => {
    const tbl = document.querySelector('[class*="mat-table"], table, mat-table');
    return tbl ? tbl.outerHTML.substring(0, 2000) : 'no table found';
  });
  console.log('Table HTML:', tableHtml.substring(0, 500));

  // Get all clickable rows
  const clickableRows = await page.evaluate(() => {
    const selectors = ['tr[class*="clickable"], tr[style*="cursor"], tr.row', 
                       '[class*="mat-row"]', 'tr', 
                       'mat-row'];
    const results = [];
    for (const sel of selectors) {
      const els = Array.from(document.querySelectorAll(sel));
      if (els.length > 0) {
        results.push({ selector: sel, count: els.length, first: els[0]?.className });
      }
    }
    return results;
  });
  console.log('Clickable rows:', JSON.stringify(clickableRows, null, 2));

  // Try clicking at the area where the row should be (between header and pagination)
  const tableBox = await page.locator('[class*="mat-table"], table').first().boundingBox();
  if (tableBox) {
    console.log('Table box:', tableBox);
    // Click in the middle of where a row should be (y = header_height + row_height/2)
    const clickY = tableBox.y + 60; // 40px header + 20px into row
    const clickX = tableBox.x + tableBox.width / 2;
    console.log('Clicking at:', clickX, clickY);
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(3000);
    const tabsAfter = await page.locator('.nav-tabs li a').allTextContents();
    console.log('Tabs after click:', tabsAfter);
    await page.screenshot({ path: 'test-data/debug_after_click.png' });
  }

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
