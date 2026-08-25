/**
 * Quick diagnostic: dumps Actions panel HTML on POG Activation page.
 * Run: node test-data/dumpActionsPanel.js
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
  const btn = page.locator('button[type="submit"], input[type="submit"]').first();
  if (await btn.isVisible().catch(() => false)) await btn.click({ force: true });
  else await page.locator('button').filter({ hasText: /login|sign in/i }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(2000);

  // Navigate to POG Activation
  await page.evaluate(() => {
    var links = document.querySelectorAll('#sideMenu li a');
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      if ((el.innerText || '').indexOf('Planogram') > -1) { el.click(); break; }
    }
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    var li = document.getElementById('pogActivationLink');
    if (li) { var d = li.querySelector('div'); if (d) d.click(); }
  });
  await page.waitForTimeout(2000);

  // Dump Actions panel area
  const html = await page.evaluate(() => {
    // Find collapse elements
    const collapseEls = document.querySelectorAll('[class*="collapse"]');
    const info = [];
    collapseEls.forEach(el => {
      info.push({
        id: el.id,
        classes: el.className,
        outerHTML: el.outerHTML.substring(0, 200)
      });
    });
    // Find toggle links
    const toggles = document.querySelectorAll('[data-toggle="collapse"], a[href*="collapse"]');
    const toggleInfo = [];
    toggles.forEach(el => {
      toggleInfo.push({
        tag: el.tagName,
        href: el.getAttribute('href'),
        dataTarget: el.getAttribute('data-target'),
        text: el.innerText.trim().substring(0, 50)
      });
    });
    return { collapseEls: info, toggles: toggleInfo };
  });

  console.log('=== Collapse Elements ===');
  console.log(JSON.stringify(html.collapseEls, null, 2));
  console.log('=== Toggle Links ===');
  console.log(JSON.stringify(html.toggles, null, 2));

  await browser.close();
})();
