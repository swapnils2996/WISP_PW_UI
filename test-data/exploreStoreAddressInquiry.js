const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all network requests
  const requests = [];
  page.on('request', req => {
    const url = req.url();
    if (!url.includes('.png') && !url.includes('.js') && !url.includes('.css') && !url.includes('.woff')) {
      requests.push({ method: req.method(), url: url.substring(0, 200) });
    }
  });
  page.on('response', async resp => {
    const url = resp.url();
    if (/StoreAddress|storeaddress/i.test(url)) {
      const body = await resp.text().catch(() => '');
      console.log('[STORE API RESPONSE]', url, body.substring(0, 500));
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

  console.log('After login:', page.url());

  // Navigate via sidebar
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(500);

  // List all sidebar items
  const sidebarItems = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    return all.filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.textContent.trim()).filter(t => t.length > 0 && t.length < 50);
  });
  console.log('Sidebar items:', [...new Set(sidebarItems)].join(', '));

  // Click Inquiry menu
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /^Inquiry$/i.test(e.textContent.trim()) && e.children.length === 0);
    if (el) { console.log('Clicking Inquiry'); el.click(); }
    else {
      const el2 = all.find(e => /Inquiry/i.test(e.textContent.trim()) && e.children.length < 3);
      if (el2) { console.log('Clicking', el2.textContent.trim()); el2.click(); }
    }
  });
  await page.waitForTimeout(600);

  // List sub-items
  const inquiryItems = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    return all.filter(e => e.children.length === 0 && /inquiry/i.test(e.textContent)).map(e => e.textContent.trim());
  });
  console.log('Inquiry sub-items:', inquiryItems);

  // Click Store Address Inquiry
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Store Address/i.test(e.textContent) && e.children.length === 0);
    if (el) { console.log('Found:', el.textContent); el.click(); }
    else {
      // Try alternative
      const el2 = all.find(e => /store/i.test(e.textContent) && /address/i.test(e.textContent));
      if (el2) el2.click();
    }
  });
  await page.waitForTimeout(2000);

  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  // Get all inputs on page
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type, name: i.name, id: i.id, placeholder: i.placeholder, className: i.className.substring(0, 60)
    }));
  });
  console.log('\nInputs:', JSON.stringify(inputs, null, 2));

  // Get buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t);
  });
  console.log('Buttons:', buttons);

  // Get page heading / component name
  const compInfo = await page.evaluate(() => {
    const tags = ['app-store-address-inquiry', 'app-storeaddressinquiry', 'app-store-inquiry'];
    for (const tag of tags) {
      const el = document.querySelector(tag);
      if (el) return { tag, html: el.innerHTML.substring(0, 500) };
    }
    // Try by Angular component tag
    const appEls = Array.from(document.querySelectorAll('[_ngcontent-c\\d*]'));
    return { allTagNames: [...new Set(Array.from(document.querySelectorAll('*')).map(e => e.tagName).filter(t => t.startsWith('APP-')))].join(', ') };
  });
  console.log('\nComponent info:', JSON.stringify(compInfo, null, 2));

  // Take screenshot
  await page.screenshot({ path: 'test-data/explore_store_address.png' });

  // Try searching with store number
  const storeInput = await page.locator('input').nth(0);
  if (await storeInput.isVisible()) {
    await storeInput.fill('1425');
    const searchBtn = page.locator('button:has-text("Search"), button:has-text("Find")').first();
    if (await searchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchBtn.click({ force: true });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-data/explore_store_address_results.png' });

      // Get results
      const resultsHtml = await page.evaluate(() => {
        const grid = document.querySelector('mat-table, table, [class*="result"]');
        return grid ? grid.outerHTML.substring(0, 1000) : 'No grid found';
      });
      console.log('\nResults HTML:', resultsHtml.substring(0, 500));
    }
  }

  console.log('\nNetwork requests (Store-related):');
  requests.filter(r => /store/i.test(r.url)).forEach(r => console.log(' ', r.method, r.url));

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
