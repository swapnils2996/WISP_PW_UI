const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(1500);
  await page.locator('input[type="text"]').first().fill('system');
  await page.locator('input[type="password"]').first().fill('p38l');
  await page.locator('button:has-text("Login")').click();
  await page.waitForTimeout(2000);

  // Open sidebar
  await page.evaluate(function() { document.getElementById('sideMenu').style.display = 'block'; });
  await page.waitForTimeout(500);

  // Get HTML of the deptClassRptLink and its parent area
  const html = await page.evaluate(function() {
    var li = document.getElementById('deptClassRptLink');
    return li ? li.outerHTML : 'NOT FOUND';
  });
  console.log('DeptClass LI HTML:', html);

  // Get HTML of archiveRecordsLink for comparison
  const arHtml = await page.evaluate(function() {
    var li = document.getElementById('archiveRecordsLink');
    return li ? li.outerHTML : 'NOT FOUND';
  });
  console.log('\nArchiveRecords LI HTML:', arHtml);

  // Click div inside deptClassRptLink
  const clicked = await page.evaluate(function() {
    var li = document.getElementById('deptClassRptLink');
    if (!li) return 'li not found';
    var div = li.querySelector('div');
    if (div) { div.click(); return 'div clicked'; }
    li.click(); return 'li clicked';
  });
  console.log('\nClick result:', clicked);
  await page.waitForTimeout(3000);

  // Close sidebar and screenshot
  await page.evaluate(function() { document.getElementById('sideMenu').setAttribute('style', 'display:none!important'); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/WISP Automation/WISP_PW_UI/test-data/report_DeptClass2.png', fullPage: true });

  // Check what's in the DOM now
  const dom = await page.evaluate(function() {
    var comps = Array.from(document.querySelectorAll('*')).filter(function(el) {
      return el.tagName.toLowerCase().startsWith('app-');
    }).map(function(el) { return el.tagName.toLowerCase(); });
    var unique = Array.from(new Set(comps));
    var tabs = Array.from(document.querySelectorAll('li.nav-item, .nav-tab, [class*="tab"]')).map(function(t) {
      return (t.textContent || '').trim().substring(0, 50);
    }).filter(function(t) { return t.length > 0; });
    return { comps: unique, tabs: tabs.slice(0, 10) };
  });
  console.log('Components after click:', dom.comps.join(', '));
  console.log('Tabs:', dom.tabs.join(' | '));

  await browser.close();
})();
