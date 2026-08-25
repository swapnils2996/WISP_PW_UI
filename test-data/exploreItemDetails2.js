/**
 * Explores Item Details DOM - waits for ANY new content to appear after search.
 * Run: node test-data/exploreItemDetails2.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  // Navigate to Item Inquiry
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => e.textContent.trim() === 'Item Inquiry' && e.children.length === 0);
    if (el) el.click();
    else console.log('Item Inquiry not found, trying Item Search...');
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  // Check what search input type is
  const inputType = await page.locator('input[placeholder="Please enter your search criteria."]').getAttribute('type').catch(() => 'unknown');
  console.log('Search input type:', inputType);

  // Perform search
  const searchInput = page.locator('input[placeholder="Please enter your search criteria."]');
  await searchInput.fill('123458');
  await page.locator('button:has-text("Find")').first().click({ force: true });

  console.log('Search triggered, waiting up to 60 seconds for results...');

  // Wait for either item details OR error alert to appear
  let result = null;
  try {
    result = await Promise.race([
      page.waitForSelector('app-item-details, app-itemdetails', { timeout: 60000 }).then(() => 'app-item-details'),
      page.waitForSelector('[class*="item-detail"]', { timeout: 60000 }).then(() => 'item-detail-class'),
      page.waitForSelector('text=On Hand', { timeout: 60000 }).then(() => 'on-hand-text'),
      page.waitForSelector('text=Selling Price', { timeout: 60000 }).then(() => 'selling-price-text'),
      page.waitForSelector('text=Sales History', { timeout: 60000 }).then(() => 'sales-history-text'),
      page.waitForSelector('.alert-danger', { timeout: 60000 }).then(() => 'alert-danger'),
      page.waitForSelector('tr.rowSelector, mat-row', { timeout: 60000 }).then(() => 'results-rows'),
    ]);
    console.log('Found:', result);
  } catch (e) {
    console.log('Timeout waiting for results:', e.message.substring(0, 100));
  }

  await page.waitForTimeout(2000);

  // Print Angular components
  const components = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('body *'));
    return [...new Set(all.filter(e => e.tagName.startsWith('APP-')).map(e => e.tagName))];
  });
  console.log('Angular components:', components);

  // Print all visible text
  const allTexts = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('body *'));
    return all
      .filter(e => e.children.length === 0 && e.textContent.trim().length > 2 && e.getBoundingClientRect().height > 0)
      .slice(0, 80)
      .map(e => ({ tag: e.tagName, cls: e.className ? e.className.toString().substring(0, 40) : '', text: e.textContent.trim().substring(0, 80) }));
  });
  console.log('\nVisible DOM elements:');
  allTexts.forEach(e => console.log('  ', e.tag, '|', e.cls, '|', e.text));

  // Check alert
  const alertText = await page.locator('.alert-danger, .alert').first().textContent().catch(() => '');
  if (alertText) console.log('\nAlert found:', alertText.trim());

  await page.screenshot({ path: 'test-data/exploreItemDetails2_result.png', fullPage: true });
  console.log('\nScreenshot saved');

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
