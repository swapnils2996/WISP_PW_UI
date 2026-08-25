const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();

  // Log all navigation events
  context.on('page', page => {
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log('[NAV]', frame.url());
      }
    });
    page.on('close', () => console.log('[PAGE CLOSED]'));
  });

  const page = await context.newPage();

  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('[NAV]', frame.url());
    }
  });
  page.on('close', () => console.log('[PAGE CLOSED]'));

  // Setup route mock to catch ItemService calls
  await context.route('**/ItemService.svc/**', async route => {
    console.log('[ROUTE]', route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '"null"' });
  });

  // Login
  console.log('Navigating to app...');
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log('After goto:', url);

  // Login if needed
  if (url.includes('login') || url.includes('Login')) {
    await page.locator('input[name="username"], input[type="text"]').first().fill('system');
    await page.locator('input[name="password"], input[type="password"]').first().fill('p38l');
    await page.locator('button[type="submit"], input[type="submit"], button:has-text("Login")').first().click();
    await page.waitForTimeout(2000);
  }

  console.log('After login:', page.url());

  // Navigate to Item Inquiry via sidebar
  const sidebarBtn = page.locator('.sidebar-launcher, #sidebarToggle, button[data-target="#sideMenu"]').first();
  if (await sidebarBtn.isVisible()) {
    await sidebarBtn.click();
    await page.waitForTimeout(800);
  }

  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) {
      console.log('Clicking Item Inquiry:', el.tagName, el.textContent);
      el.click();
    } else {
      console.log('Item Inquiry element not found');
    }
  });
  await page.waitForTimeout(2000);
  console.log('After sidebar nav:', page.url());

  // Check if skuInput is visible
  const skuInput = page.locator('input[placeholder="Please enter your search criteria."]');
  const visible = await skuInput.isVisible();
  console.log('SKU input visible:', visible);

  if (visible) {
    await skuInput.fill('123458');
    console.log('Filled SKU');

    // Try to expand advanced search
    const toggle = page.locator('a:has-text("View More"), span:has-text("View More"), button:has-text("View More")').first();
    const toggleVisible = await toggle.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Toggle visible:', toggleVisible);
    if (toggleVisible) {
      await toggle.click({ force: true });
      await page.waitForTimeout(1000);
    }

    // Check desc input
    const descInput = page.locator('input[name="description"], input[placeholder*="escription"]').first();
    const descVisible = await descInput.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Desc input visible:', descVisible);

    if (descVisible) {
      await descInput.fill('test desc');
      console.log('Filled desc');
    }

    // Check Reset button
    const resetBtn = page.locator('button:has-text("Reset")').first();
    const resetVisible = await resetBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Reset btn visible:', resetVisible);
    if (resetVisible) {
      console.log('Clicking Reset...');
      await resetBtn.click({ force: true });
      await page.waitForTimeout(1000);
      console.log('After reset click:', page.url());
      const skuAfter = await skuInput.inputValue().catch(() => 'error');
      const descAfter = await descInput.inputValue().catch(() => 'error');
      console.log('SKU after reset:', skuAfter);
      console.log('Desc after reset:', descAfter);
    }
  }

  await page.waitForTimeout(3000);
  await browser.close();
  console.log('Done');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
