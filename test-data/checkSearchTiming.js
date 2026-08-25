/**
 * Checks how long a search (valid + invalid SKU) takes to respond.
 * Run: node test-data/checkSearchTiming.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);

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

  // Test 1: Invalid SKU - should return "not found" quickly
  console.log('\n--- Test 1: Invalid SKU (00000001) ---');
  const searchInput = page.locator('input[placeholder="Please enter your search criteria."]');
  await searchInput.fill('00000001');
  const t1start = Date.now();
  await page.locator('button:has-text("Find")').first().click({ force: true });

  // Poll for changes every second
  let found = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1000);
    const elapsed = Math.round((Date.now() - t1start) / 1000);
    // Check for alert
    const alertVis = await page.locator('.alert-danger, .alert').first().isVisible().catch(() => false);
    // Check for new angular components
    const components = await page.evaluate(() => {
      return [...new Set(Array.from(document.querySelectorAll('body *')).filter(e => e.tagName.startsWith('APP-')).map(e => e.tagName))];
    });
    // Check for item details text
    const hasOnHand = await page.locator('text=On Hand').isVisible({ timeout: 100 }).catch(() => false);
    const hasSellingPrice = await page.locator('text=Selling Price').isVisible({ timeout: 100 }).catch(() => false);
    const spinnerVisible = await page.locator('.spinner').isVisible({ timeout: 100 }).catch(() => false);

    console.log(`  ${elapsed}s: alert=${alertVis} spinner=${spinnerVisible} components=${components.join(',')} onHand=${hasOnHand} sellingPrice=${hasSellingPrice}`);

    if (alertVis || hasOnHand || hasSellingPrice || components.length > 5) {
      found = true;
      await page.screenshot({ path: `test-data/checkTiming_t1_${elapsed}s.png`, fullPage: true });
      console.log(`  => Result found at ${elapsed}s!`);
      break;
    }
  }
  if (!found) console.log('  => No result after 60s');

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
