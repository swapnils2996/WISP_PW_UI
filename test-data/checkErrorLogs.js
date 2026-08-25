/**
 * Check what error messages are being logged during search.
 * Run: node test-data/checkErrorLogs.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  const log = [];
  page.on('request', async req => {
    if (req.url().includes('ErrorMessageService') || req.url().includes('ItemService')) {
      let body = '';
      try { body = req.postData() || ''; } catch(e) {}
      log.push({ type: 'REQ', method: req.method(), url: req.url(), body });
    }
  });
  page.on('response', async res => {
    if (res.url().includes('ErrorMessageService') || res.url().includes('ItemService')) {
      let body = '';
      try { body = (await res.text()).substring(0, 500); } catch(e) {}
      log.push({ type: 'RES', status: res.status(), url: res.url(), body });
    }
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => e.textContent.trim() === 'Item Inquiry' && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });
  await page.waitForTimeout(500);

  // Also intercept requests to see the item service request before saleshistory
  const allReqs = [];
  page.on('request', req => {
    if (!req.url().match(/\.(png|jpg|gif|ico|woff|ttf|js|css)$/i)) {
      allReqs.push(`${req.method()} ${req.url()}`);
    }
  });
  allReqs.length = 0;
  log.length = 0;

  // Perform search
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('00000001');
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(15000);

  console.log('\n=== All requests made ===');
  allReqs.forEach(r => console.log(' ', r));

  console.log('\n=== Error/Item service details ===');
  log.forEach(l => {
    console.log(`${l.type} [${l.status || l.method}] ${l.url}`);
    if (l.body) console.log('  Body:', l.body.substring(0, 300));
  });

  // Check console errors
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));

  // Try to intercept and check response for saleshistory
  console.log('\n--- Also check response for existing SKU 123458 ---');
  log.length = 0;
  allReqs.length = 0;

  // Reset  
  await page.locator('button:has-text("Reset")').first().click({ force: true });
  await page.waitForTimeout(1000);

  await page.locator('input[placeholder="Please enter your search criteria."]').fill('123458');
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(15000);

  console.log('\n=== All requests (SKU 123458, 15s) ===');
  allReqs.forEach(r => console.log(' ', r));
  log.forEach(l => {
    console.log(`${l.type} [${l.status || l.method}] ${l.url}`);
    if (l.body) console.log('  Body:', l.body.substring(0, 300));
  });

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
