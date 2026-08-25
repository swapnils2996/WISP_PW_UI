/**
 * Explores the Item Inquiry page DOM structure.
 * Run: node test-data/exploreItemInquiry.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  // Open sidebar
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(500);

  // Print sidebar items
  const sidebarItems = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    return all
      .filter(e => e.textContent.trim() && e.children.length === 0)
      .map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 50) }));
  });
  console.log('=== Sidebar items ===');
  sidebarItems.forEach(i => console.log(i.tag, ':', i.text));

  // Click Inquiry
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu li a, #sideMenu a'));
    const el = all.find(e => /Inquiry/i.test(e.textContent) && !/Item|Store/i.test(e.textContent));
    if (el) { console.log('Clicking:', el.textContent); el.click(); }
    else {
      // Try any element with Inquiry text
      const any = Array.from(document.querySelectorAll('#sideMenu *')).find(e => e.textContent.trim() === 'Inquiry' || e.textContent.trim() === 'Inquiries');
      if (any) { console.log('Clicking any:', any.textContent); any.click(); }
    }
  });
  await page.waitForTimeout(800);

  // Print expanded submenu
  const subItems = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    return all
      .filter(e => e.offsetHeight > 0 && e.textContent.trim() && e.children.length === 0)
      .map(e => ({ tag: e.tagName, text: e.textContent.trim().substring(0, 60) }));
  });
  console.log('\n=== Visible sidebar after Inquiry click ===');
  subItems.forEach(i => console.log(i.tag, ':', i.text));

  // Click Item Inquiry / Item Search
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => (/Item.*(Inquiry|Search)/i.test(e.textContent) || /Inquiry.*Item/i.test(e.textContent)) && e.children.length === 0);
    if (el) { console.log('Clicking Item Inquiry:', el.textContent.trim()); el.click(); }
    else {
      // Fallback: click first visible item in sub-list
      const visible = all.filter(e => e.offsetHeight > 0 && e.children.length === 0 && /Item/i.test(e.textContent));
      if (visible[0]) { console.log('Fallback click:', visible[0].textContent.trim()); visible[0].click(); }
    }
  });
  await page.waitForTimeout(1500);

  // Close sidebar
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'none';
  });
  await page.waitForTimeout(500);

  console.log('\n=== Current URL:', page.url());
  const tabTexts = await page.locator('.nav-tabs li a').allTextContents().catch(() => []);
  console.log('=== Tabs:', tabTexts);

  // Check input visibility
  const inputs = await page.locator('input').all();
  console.log('\n=== Inputs ===');
  for (const inp of inputs) {
    const placeholder = await inp.getAttribute('placeholder').catch(() => '');
    const type = await inp.getAttribute('type').catch(() => '');
    const visible = await inp.isVisible().catch(() => false);
    if (visible) console.log('  type:', type, '| placeholder:', placeholder);
  }

  // Print all button texts visible
  const buttons = await page.locator('button').filter({ visible: true }).allTextContents();
  console.log('\n=== Visible buttons:', buttons);

  // Perform search with SKU 123458
  const searchInput = page.locator('input[placeholder="Please enter your search criteria."]');
  const inputVisible = await searchInput.isVisible().catch(() => false);
  console.log('\nSearch input visible:', inputVisible);

  if (inputVisible) {
    await searchInput.fill('123458');
    await page.locator('button:has-text("Find")').first().click({ force: true });
    console.log('Clicked Find, waiting for page...');
    await page.waitForTimeout(8000);

    // Print DOM after search
    console.log('\n=== Page URL after search:', page.url());
    const allTexts = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('body *'));
      return all
        .filter(e => e.children.length === 0 && e.textContent.trim().length > 2 && e.offsetHeight > 0)
        .slice(0, 60)
        .map(e => ({ tag: e.tagName, cls: e.className.substring(0, 30), text: e.textContent.trim().substring(0, 60) }));
    });
    console.log('Visible text elements:');
    allTexts.forEach(e => console.log(' ', e.tag, e.cls, ':', e.text));

    // Check for angular components
    const components = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('body *'));
      return [...new Set(all.filter(e => e.tagName.startsWith('APP-')).map(e => e.tagName))];
    });
    console.log('\nAngular components:', components);

    // Take screenshot
    await page.screenshot({ path: 'test-data/exploreItemInquiry_result.png', fullPage: true });
    console.log('Screenshot saved: test-data/exploreItemInquiry_result.png');
  }

  await browser.close();
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
