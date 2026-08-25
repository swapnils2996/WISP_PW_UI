const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiCalls = [];
  page.on('response', async resp => {
    const url = resp.url();
    if (/store|address/i.test(url) && !url.includes('.js') && !url.includes('.css')) {
      const body = await resp.text().catch(() => '');
      apiCalls.push({ url: url.substring(0, 300), status: resp.status(), body: body.substring(0, 600) });
    }
  });

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  if (page.url().includes('Login')) {
    await page.locator('input[type="text"]').first().fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    for (const sel of ['button:has-text("Login")', 'button.btn-primary']) {
      if (await page.locator(sel).isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.locator(sel).click({ force: true }); break;
      }
    }
    await page.waitForTimeout(3000);
  }

  // Navigate to Store Address Inquiry via sidebar
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Store Address/i.test(e.textContent) && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  // Screenshot before search
  await page.screenshot({ path: 'test-data/sai_before_search.png', fullPage: true });
  console.log('Screenshot saved: sai_before_search.png');

  // Get all inputs order
  const inputInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    return inputs.map((inp, i) => ({
      idx: i, type: inp.type, placeholder: inp.placeholder, 
      nearbyLabel: inp.closest('[class*="form-group"], [class*="form-field"]')?.textContent?.trim().substring(0, 40) || ''
    }));
  });
  console.log('Input info:', JSON.stringify(inputInfo, null, 2));

  // Fill store number and search
  const inputs = page.locator('input.form-control');
  const count = await inputs.count();
  console.log('form-control input count:', count);

  if (count >= 1) {
    await inputs.nth(0).fill('1425'); // Store number
  }
  
  const searchBtn = page.locator('button:has-text("Search")').first();
  if (await searchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await searchBtn.click({ force: true });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'test-data/sai_after_search.png', fullPage: true });
    console.log('Screenshot saved: sai_after_search.png');
  }

  console.log('\nAPI calls:');
  apiCalls.forEach(c => console.log(' ', c.status, c.url, '→', c.body.substring(0, 200)));

  // Get grid structure
  const gridHtml = await page.evaluate(() => {
    const grid = document.querySelector('mat-table');
    if (!grid) return 'No mat-table found';
    return grid.outerHTML.substring(0, 2000);
  });
  console.log('\nGrid HTML:', gridHtml.substring(0, 600));

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
