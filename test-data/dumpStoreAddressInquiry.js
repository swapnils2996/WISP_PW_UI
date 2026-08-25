/**
 * Diagnostic: dumps Store Address Inquiry page HTML/structure.
 * Run: node test-data/dumpStoreAddressInquiry.js
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

  // Open sidebar and navigate to Store Address Inquiry
  await page.evaluate(() => {
    const el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Store Address Inquiry/i.test(e.textContent || '') && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);

  // ── 1. Dump ALL form inputs ──
  const inputs = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('input, select, textarea').forEach(el => {
      res.push({
        tag: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.id,
        placeholder: el.getAttribute('placeholder'),
        maxlength: el.getAttribute('maxlength'),
        class: el.className.substring(0, 60)
      });
    });
    return res;
  });
  console.log('=== INPUTS ===');
  console.log(JSON.stringify(inputs, null, 2));

  // ── 2. Dump ALL buttons ──
  const buttons = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(el => {
      res.push({
        tag: el.tagName,
        text: el.innerText ? el.innerText.trim() : el.value,
        class: el.className.substring(0, 60),
        disabled: el.disabled
      });
    });
    return res;
  });
  console.log('=== BUTTONS ===');
  console.log(JSON.stringify(buttons, null, 2));

  // ── 3. Dump grid column headers ──
  const headers = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('mat-header-cell, th').forEach(el => {
      res.push(el.innerText ? el.innerText.trim() : el.textContent.trim());
    });
    return res;
  });
  console.log('=== GRID HEADERS ===');
  console.log(JSON.stringify(headers, null, 2));

  // ── 4. Search a store and get grid structure ──
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input.form-control');
    if (inputs[0]) { inputs[0].value = '2'; inputs[0].dispatchEvent(new Event('input', {bubbles:true})); }
  });
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Search")').first().click({ force: true });
  await page.waitForTimeout(3000);

  const afterSearch = await page.evaluate(() => {
    const mat = document.querySelector('mat-table');
    return mat ? mat.outerHTML.substring(0, 2000) : 'no mat-table';
  });
  console.log('=== AFTER SEARCH (mat-table partial) ===');
  console.log(afterSearch);

  // ── 5. Check paginator ──
  const paginator = await page.evaluate(() => {
    const p = document.querySelector('mat-paginator');
    return p ? p.outerHTML.substring(0, 500) : 'no paginator';
  });
  console.log('=== PAGINATOR ===');
  console.log(paginator);

  // ── 6. Check for filter/search input in grid area ──
  const filterInputs = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('input[placeholder="Filter"], input[placeholder*="filter" i], input[placeholder*="search" i]').forEach(el => {
      res.push({ placeholder: el.getAttribute('placeholder'), id: el.id, class: el.className.substring(0, 60) });
    });
    return res;
  });
  console.log('=== FILTER INPUTS ===');
  console.log(JSON.stringify(filterInputs, null, 2));

  // ── 7. Check for any extra UI elements (checkboxes, tabs, export buttons) ──
  const extra = await page.evaluate(() => {
    const res = [];
    // Check for checkboxes
    document.querySelectorAll('input[type="checkbox"], mat-checkbox').forEach(el => {
      res.push({ type: 'checkbox', text: el.closest('label')?.innerText || el.id, id: el.id });
    });
    // Check for tabs
    document.querySelectorAll('.nav-tab, mat-tab, [role="tab"]').forEach(el => {
      res.push({ type: 'tab', text: el.innerText || el.textContent });
    });
    // Check for any anchor/link with text
    document.querySelectorAll('a[href]:not([href="#"])').forEach(el => {
      const t = (el.innerText || '').trim();
      if (t && t.length < 50) res.push({ type: 'link', text: t, href: el.getAttribute('href') });
    });
    return res;
  });
  console.log('=== EXTRA ELEMENTS (checkboxes, tabs, links) ===');
  console.log(JSON.stringify(extra, null, 2));

  // ── 8. Screenshot ──
  await page.screenshot({ path: 'C:/Users/WISP Automation/WISP_PW_UI/test-data/sai_diagnostic.png', fullPage: true });
  console.log('Screenshot saved: test-data/sai_diagnostic.png');

  await browser.close();
})();
