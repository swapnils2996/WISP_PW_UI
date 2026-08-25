/**
 * Explores Item Details DOM after a search completes.
 * Run: node test-data/exploreItemDetails.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  // Navigate via sidebar
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => e.textContent.trim() === 'Item Inquiry' && e.children.length === 0);
    if (el) el.click();
    else console.log('Item Inquiry not found in sidebar');
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });
  await page.waitForTimeout(500);

  // Perform search
  const searchInput = page.locator('input[placeholder="Please enter your search criteria."]');
  await searchInput.fill('123458');
  await page.locator('button:has-text("Find")').first().click({ force: true });

  // Wait for spinner to disappear (up to 45 seconds)
  console.log('Waiting for spinner to disappear...');
  try {
    await page.waitForSelector('.spinner, [class*="spinner"], [class*="loading"]', { state: 'hidden', timeout: 45000 });
    console.log('Spinner disappeared!');
  } catch (e) {
    console.log('Spinner timeout:', e.message);
  }
  await page.waitForTimeout(2000);

  // Also check for any error
  const alertText = await page.locator('.alert-danger, .alert.alert-danger').first().textContent().catch(() => '');
  if (alertText) console.log('Alert text:', alertText);

  // Print DOM
  const allTexts = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('body *'));
    return all
      .filter(e => e.children.length === 0 && e.textContent.trim().length > 2 && e.getBoundingClientRect().height > 0)
      .slice(0, 100)
      .map(e => ({ tag: e.tagName, cls: e.className.toString().substring(0, 40), text: e.textContent.trim().substring(0, 80) }));
  });
  console.log('\n=== Visible DOM elements after search ===');
  allTexts.forEach(e => console.log('  ', e.tag, '|', e.cls, '|', e.text));

  // Print Angular components
  const components = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('body *'));
    return [...new Set(all.filter(e => e.tagName.startsWith('APP-')).map(e => e.tagName))];
  });
  console.log('\nAngular components:', components);

  await page.screenshot({ path: 'test-data/exploreItemDetails_result.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
