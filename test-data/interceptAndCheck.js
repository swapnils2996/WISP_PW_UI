/**
 * Intercepts the ItemService response within the browser session.
 * Run: node test-data/interceptAndCheck.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Listen to all responses with full body
  page.on('response', async res => {
    if (res.url().includes('ItemService') || res.url().includes('isp.services')) {
      let body = '';
      try { body = await res.text(); } catch(e) { body = 'error reading body: ' + e.message; }
      console.log(`RESP [${res.status()}] ${res.url()}`);
      console.log(`  Headers: Content-Length=${res.headers()['content-length']}, Content-Type=${res.headers()['content-type']}`);
      console.log(`  Body (${body.length} chars): ${body.substring(0, 500)}`);
    }
  });

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

  // Search
  console.log('\nSearching for: 00000001');
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('00000001');
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(10000);

  console.log('\n--- Also checking advanced search (description) ---');
  await page.locator('button:has-text("Reset")').first().click({ force: true });
  await page.waitForTimeout(500);

  // Expand advanced search
  await page.locator('a:has-text("View More Search Options"), span:has-text("View More Search Options")').first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(1000);

  // Find description input and type something
  const descInput = page.locator('input[placeholder*="escription"], input[name="description"]').first();
  const descVisible = await descInput.isVisible().catch(() => false);
  console.log('Description input visible:', descVisible);

  if (descVisible) {
    await descInput.fill('PLATE');
    await page.locator('button:has-text("Find")').first().click({ force: true });
    await page.waitForTimeout(10000);
  }

  // Print the advanced search expanded HTML
  const advancedHtml = await page.evaluate(() => {
    const collapse = document.querySelector('#viewMoreSearchOptions, [class*="collapse"], [class*="more-search"]');
    return collapse ? collapse.innerHTML.substring(0, 2000) : 'not found';
  });
  console.log('\nAdvanced panel HTML:', advancedHtml.substring(0, 1000));

  await page.screenshot({ path: 'test-data/interceptAndCheck.png', fullPage: true });
  console.log('\nScreenshot saved');
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
