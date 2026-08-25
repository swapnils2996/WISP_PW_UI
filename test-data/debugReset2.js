const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Setup route mock to catch ItemService calls
  await context.route('**/ItemService.svc/**', async route => {
    console.log('[ROUTE]', route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '"null"' });
  });

  const page = await context.newPage();

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('[NAV]', frame.url());
    }
  });
  page.on('close', () => console.log('[PAGE CLOSED]'));

  // Login
  console.log('Navigating to app...');
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());

  // Login
  const usernameInput = await page.locator('input[type="text"], input[name="username"]').first();
  if (await usernameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await usernameInput.fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    await page.locator('button[type="submit"], button:has-text("Login"), input[type="submit"]').first().click();
    await page.waitForTimeout(3000);
  }

  console.log('After login URL:', page.url());

  // Navigate to Item Inquiry via sidebar - click directly
  const sideMenuVisible = await page.locator('#sideMenu').isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Side menu visible:', sideMenuVisible);

  if (sideMenuVisible) {
    // Close sidebar first if needed
    await page.evaluate(() => {
      const el = document.getElementById('sideMenu');
      if (el) el.style.display = 'none';
    });
    await page.waitForTimeout(300);
  }

  // Check if Item Inquiry tab already exists
  const tabTexts = await page.locator('.nav-tabs li a').allTextContents().catch(() => []);
  console.log('Existing tabs:', tabTexts);

  // Navigate via sidebar - open it
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(500);

  // Click Item Inquiry
  const clicked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) {
      el.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Item Inquiry:', clicked);
  await page.waitForTimeout(2000);
  console.log('After nav URL:', page.url());

  // Close sidebar
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'none';
  });

  // Check skuInput
  const skuInput = page.locator('input[placeholder="Please enter your search criteria."]');
  const visible = await skuInput.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('SKU input visible:', visible);

  if (visible) {
    await skuInput.fill('123458');

    // Try expand advanced search
    const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
    const toggleVis = await toggle.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Toggle visible:', toggleVis);
    if (toggleVis) {
      await toggle.click({ force: true });
      await page.waitForTimeout(1000);
    }

    const descInput = page.locator('input[name="description"], input[placeholder*="escription"]').first();
    const descVis = await descInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Desc input visible:', descVis);
    if (descVis) {
      await descInput.fill('test desc');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-data/debug_before_reset.png' });
    console.log('Screenshot saved');

    const resetBtn = page.locator('button:has-text("Reset")').first();
    const resetVis = await resetBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Reset btn visible:', resetVis);

    if (resetVis) {
      // Check what reset does to URL
      console.log('Before reset URL:', page.url());
      await resetBtn.click({ force: true });
      await page.waitForTimeout(1000);
      console.log('After reset URL:', page.url());
      const skuAfter = await skuInput.inputValue().catch(() => 'error');
      console.log('SKU after reset:', skuAfter);
    }
  }

  await page.waitForTimeout(1000);
  await browser.close();
  console.log('Done');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
