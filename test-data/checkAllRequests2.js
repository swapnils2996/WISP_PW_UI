/**
 * Monitors ALL network requests including responses for 20 seconds.
 * Run: node test-data/checkAllRequests2.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  const log = [];
  page.on('request', req => {
    if (!req.url().match(/\.(png|jpg|gif|ico|woff|ttf)$/i)) {
      log.push(`REQ  [${req.method()}] ${req.url()}`);
    }
  });
  page.on('response', async res => {
    if (!res.url().match(/\.(png|jpg|gif|ico|woff|ttf)$/i)) {
      let body = '';
      try { body = (await res.text()).substring(0, 300); } catch(e) {}
      log.push(`RES  [${res.status()}] ${res.url()} => ${body}`);
    }
  });
  page.on('requestfailed', req => log.push(`FAIL [${req.failure()?.errorText}] ${req.url()}`));

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  // Navigate to Item Search
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
  log.length = 0; // Clear previous logs

  // Search
  console.log('\n--- Searching for 00000001 ---');
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('00000001');
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(20000);

  console.log('\n=== All requests (20s) ===');
  log.forEach(l => console.log(l));

  // Inspect the DOM for any alert elements (including hidden ones)
  const allAlerts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[class*="alert"], [class*="error"], [class*="message"]'))
      .map(e => ({
        cls: e.className,
        visible: e.getBoundingClientRect().height > 0,
        display: window.getComputedStyle(e).display,
        text: e.textContent.trim().substring(0, 100)
      }))
      .filter(e => e.text.length > 2);
  });
  console.log('\n=== Alert/error elements (including hidden) ===');
  allAlerts.forEach(a => console.log(`  cls=${a.cls} visible=${a.visible} display=${a.display} text=${a.text}`));

  await page.screenshot({ path: 'test-data/checkAllRequests2.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
