const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ httpCredentials: { username: 'system', password: 'p38l' } });
  const page = await context.newPage();

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(2000);

  // Open sidebar
  await page.evaluate(function() {
    var el = document.getElementById('sideMenu');
    if (el) el.style.display = 'block';
  });
  await page.waitForTimeout(500);

  // Dump ALL sidebar IDs and text
  const sidebarInfo = await page.evaluate(function() {
    var items = Array.from(document.querySelectorAll('#sideMenu *'));
    return items.map(function(i) {
      return { tag: i.tagName, id: i.id, text: (i.textContent || '').trim().substring(0, 60) };
    }).filter(function(i) { return i.text.length > 0 && i.text.length < 60; });
  });
  console.log('=== Sidebar items ===');
  sidebarInfo.forEach(function(i) { console.log(JSON.stringify(i)); });

  // Click Reports in sidebar
  const clicked = await page.evaluate(function() {
    var items = Array.from(document.querySelectorAll('#sideMenu li, #sideMenu a, #sideMenu span'));
    var reportsItem = items.find(function(i) { return (i.textContent || '').trim().toLowerCase() === 'reports'; });
    if (reportsItem) { reportsItem.click(); return 'clicked'; }
    return 'not found';
  });
  console.log('\nReports click result:', clicked);
  await page.waitForTimeout(1000);

  const submenu = await page.evaluate(function() {
    var items = Array.from(document.querySelectorAll('#sideMenu li, #sideMenu a'));
    return items.map(function(i) { return { id: i.id, text: (i.textContent || '').trim().substring(0, 80) }; });
  });
  console.log('\n=== After expanding Reports ===');
  submenu.forEach(function(i) { if (i.text) console.log(JSON.stringify(i)); });

  await page.screenshot({ path: 'C:/Users/WISP Automation/WISP_PW_UI/test-data/reports_sidebar.png', fullPage: true });

  await browser.close();
})();
