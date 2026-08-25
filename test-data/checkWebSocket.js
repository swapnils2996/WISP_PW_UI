/**
 * Check for WebSockets and all XHR/fetch requests during search.
 * Run: node test-data/checkWebSocket.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Capture WebSocket messages
  page.on('websocket', ws => {
    console.log('WebSocket opened:', ws.url());
    ws.on('framesent', f => console.log('WS sent:', f.payload));
    ws.on('framereceived', f => console.log('WS received:', String(f.payload).substring(0, 200)));
    ws.on('close', () => console.log('WebSocket closed:', ws.url()));
  });

  // Monitor console to catch Angular errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
    if (msg.text().includes('item') || msg.text().includes('sku') || msg.text().includes('Item')) {
      console.log('CONSOLE LOG:', msg.type(), msg.text().substring(0, 200));
    }
  });

  // Monitor all requests including non-standard
  page.on('request', req => {
    const url = req.url();
    if (!url.match(/\.(png|jpg|gif|ico|woff|ttf|js|css|html)$/i)) {
      console.log(`REQUEST [${req.method()}] ${url}`);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (!url.match(/\.(png|jpg|gif|ico|woff|ttf|js|css|html)$/i)) {
      const len = res.headers()['content-length'];
      console.log(`RESPONSE [${res.status()}] ${url} len=${len || 'unknown'}`);
      if (url.includes('ItemService') && res.status() !== 202) {
        try {
          const body = await res.text();
          console.log('  BODY:', body.substring(0, 500));
        } catch(e) {}
      }
    }
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(3000);

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

  console.log('\n--- Searching for SKU 123458 ---');
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('123458');
  await page.locator('button:has-text("Find")').first().click({ force: true });

  // Wait 12 seconds
  await page.waitForTimeout(12000);
  console.log('\nDone waiting');

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
