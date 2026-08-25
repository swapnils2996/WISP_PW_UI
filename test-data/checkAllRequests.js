/**
 * Monitors ALL network requests during Item Search for 30 seconds.
 * Run: node test-data/checkAllRequests.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  const requests = [];
  page.on('request', req => requests.push({ type: 'req', method: req.method(), url: req.url().replace('http://isp.stores.michaels.com/isp.services/', '') }));
  page.on('response', async res => {
    const url = res.url().replace('http://isp.stores.michaels.com/isp.services/', '');
    let body = '';
    try {
      if (url.includes('ItemService') || url.includes('ErrorMessage')) {
        body = await res.text().catch(() => '');
        body = body.substring(0, 200);
      }
    } catch (e) {}
    requests.push({ type: 'res', status: res.status(), url, body });
  });
  page.on('requestfailed', req => requests.push({ type: 'fail', url: req.url(), err: req.failure()?.errorText }));

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);
  requests.length = 0;

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
  requests.length = 0;

  // Search for invalid SKU
  console.log('Searching for: 00000001');
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('00000001');
  await page.locator('button:has-text("Find")').first().click({ force: true });

  // Wait 30s and print all requests
  await page.waitForTimeout(30000);

  console.log('\n=== All API requests (30s) ===');
  const apiReqs = requests.filter(r => r.url && (r.url.includes('Service') || r.url.includes('isp')));
  apiReqs.forEach(r => {
    if (r.type === 'req') console.log(`REQ ${r.method} ${r.url}`);
    else if (r.type === 'res') console.log(`RES ${r.status} ${r.url}`, r.body ? '\n   body:' + r.body : '');
    else console.log(`FAIL ${r.url} - ${r.err}`);
  });

  // Check visible DOM elements
  const textEls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('body *'))
      .filter(e => e.children.length === 0 && e.textContent.trim().length > 3 && e.getBoundingClientRect().height > 0)
      .map(e => e.textContent.trim().substring(0, 80));
  });
  console.log('\n=== Visible text after 30s ===');
  textEls.forEach(t => console.log(' -', t));

  await page.screenshot({ path: 'test-data/checkAllRequests_result.png', fullPage: true });

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
