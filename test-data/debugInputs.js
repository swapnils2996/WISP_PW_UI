const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.route('**/ItemService.svc/**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '"null"' });
  });
  const page = await context.newPage();

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  console.log('URL after goto:', page.url());

  if (page.url().includes('Login')) {
    await page.locator('input[type="text"]').first().fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    // Try different login button selectors
    const btnSelectors = [
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'input[type="submit"]',
      'button[type="submit"]',
      'button.btn-primary',
    ];
    for (const sel of btnSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click({ force: true });
        break;
      }
    }
    await page.waitForTimeout(3000);
  }
  console.log('After login URL:', page.url());

  // Navigate to Item Inquiry
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'none';
  });

  // Click toggle
  const toggle = page.locator('a:has-text("View More"), span:has-text("View More")').first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await toggle.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Get all inputs info
  const inputs = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('input'));
    return els.map((i, idx) => ({
      idx,
      type: i.type,
      name: i.name,
      id: i.id,
      placeholder: i.placeholder,
      className: i.className.substring(0, 80),
      ngModel: i.getAttribute('ng-model') || i.getAttribute('[(ngmodel)]') || '',
      visible: i.offsetParent !== null,
      value: i.value
    }));
  });

  console.log('All inputs:');
  inputs.forEach(inp => console.log(`  [${inp.idx}]`, JSON.stringify(inp)));

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
