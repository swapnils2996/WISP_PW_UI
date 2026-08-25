/**
 * Monitors network requests during Item Search.
 * Run: node test-data/checkNetworkRequests.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Monitor all network requests/responses
  const requests = [];
  page.on('request', req => {
    if (!req.url().includes('fonts') && !req.url().includes('.js') && !req.url().includes('.css')) {
      requests.push({ type: 'request', method: req.method(), url: req.url() });
    }
  });
  page.on('response', res => {
    if (!res.url().includes('fonts') && !res.url().includes('.js') && !res.url().includes('.css')) {
      requests.push({ type: 'response', status: res.status(), url: res.url() });
    }
  });
  page.on('requestfailed', req => {
    requests.push({ type: 'failed', url: req.url(), err: req.failure()?.errorText });
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);
  requests.length = 0; // Clear login requests

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
  requests.length = 0; // Clear navigation requests

  // Perform search with invalid SKU
  console.log('Performing search with invalid SKU: 00000001');
  const searchInput = page.locator('input[placeholder="Please enter your search criteria."]');
  await searchInput.fill('00000001');
  await page.locator('button:has-text("Find")').first().click({ force: true });

  // Wait 15 seconds and collect requests
  await page.waitForTimeout(15000);

  console.log('\n=== Network requests after search (15s) ===');
  requests.forEach(r => {
    if (r.type === 'request') console.log(`  REQUEST ${r.method} ${r.url}`);
    else if (r.type === 'response') console.log(`  RESPONSE ${r.status} ${r.url}`);
    else console.log(`  FAILED ${r.url} - ${r.err}`);
  });

  await page.screenshot({ path: 'test-data/checkNetworkRequests_result.png', fullPage: true });

  // Check if there's a POS error dialog in the DOM (might be hidden)
  const allDivText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('dialog, [role="dialog"], .modal'))
      .map(e => ({ visible: e.getBoundingClientRect().height > 0, text: e.textContent.trim().substring(0, 100) }));
  });
  console.log('\n=== Dialogs in DOM ===');
  allDivText.forEach(d => console.log('  visible:', d.visible, 'text:', d.text));

  // Print all alerts
  const alerts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.alert, [class*="alert"], [class*="error"]'))
      .map(e => ({ visible: e.getBoundingClientRect().height > 0, cls: e.className, text: e.textContent.trim().substring(0, 100) }));
  });
  console.log('\n=== Alert elements ===');
  alerts.forEach(a => console.log('  visible:', a.visible, 'class:', a.cls, 'text:', a.text));

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
