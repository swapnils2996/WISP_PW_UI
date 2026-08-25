/**
 * Diagnostic: navigate to Item Inquiry and dump SKU input attributes.
 * Run: node test-data/dumpSkuInput.js
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://isp.stores.michaels.com/webapp/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Login
  await page.evaluate(() => {
    const u = document.querySelector('input[type="text"]');
    const p = document.querySelector('input[type="password"]');
    if (u) { u.value = 'system'; u.dispatchEvent(new Event('input', {bubbles:true})); }
    if (p) { p.value = 'p38l'; p.dispatchEvent(new Event('input', {bubbles:true})); }
  });
  await page.locator('button[type="submit"], input[type="submit"]').first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(2000);

  // Navigate to Item Inquiry
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu li a, #sideMenu a'));
    const el = all.find(e => /Inquiry/i.test(e.textContent) && !/Item/i.test(e.textContent));
    if (el) el.click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent) && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);

  // Dump all inputs with the search placeholder
  const result = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[placeholder="Please enter your search criteria."]'));
    return inputs.map(inp => {
      const attrs = {};
      for (const attr of inp.attributes) { attrs[attr.name] = attr.value; }
      return {
        type: inp.getAttribute('type'),
        maxlength_attr: inp.getAttribute('maxlength'),
        maxLength_prop: inp.maxLength,
        ng_reflect: inp.getAttribute('ng-reflect-maxlength'),
        all_attrs: attrs,
        visible: inp.getBoundingClientRect().height > 0,
        outerHTML: inp.outerHTML.substring(0, 300)
      };
    });
  });

  console.log('=== SKU INPUTS ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('Count:', result.length);

  await browser.close();
})();
