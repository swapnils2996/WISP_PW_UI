const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const mock = JSON.parse(fs.readFileSync(path.join(__dirname, 'mockDRData.json'), 'utf-8'));
const dbl = (v) => JSON.stringify(JSON.stringify(v));
const dblStr = (s) => JSON.stringify(JSON.stringify(s));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Mock jGetAllConfigDataSDR
  await context.route('**/OverstockService.svc/jGetAllConfigDataSDR**', async route => {
    console.log('[MOCK HIT] jGetAllConfigDataSDR');
    await route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: dbl(mock.configData) });
  });
  // Mock jRetrieveAllOverstockLabels
  await context.route('**/OverstockService.svc/jRetrieveAllOverstockLabels**', async route => {
    console.log('[MOCK HIT] jRetrieveAllOverstockLabels');
    await route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: dbl(mock.labels) });
  });
  // Mock jGetAllOverstockLocations
  await context.route('**/OverstockService.svc/jGetAllOverstockLocations**', async route => {
    console.log('[MOCK HIT] jGetAllOverstockLocations');
    await route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: dbl(mock.locations) });
  });
  const page = await context.newPage();

  // Log all requests/responses for OverstockService
  page.on('request', req => {
    if (/OverstockService|jRetrieve|jGetAll/i.test(req.url())) {
      console.log('[REQ]', req.method(), req.url().substring(0, 120));
    }
  });
  page.on('response', async resp => {
    if (/OverstockService|jRetrieve|jGetAll/i.test(resp.url())) {
      const body = await resp.text().catch(() => '');
      console.log('[RESP]', resp.status(), resp.url().substring(0, 120), '->', body.substring(0, 80));
    }
  });

  // Login
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(2000);
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

  // Navigate to Overstock Label Printing
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => e.textContent.trim() === 'Overstock Label Printing' && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'test-data/debug_dr_page.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
