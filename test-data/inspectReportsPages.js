const { chromium } = require('@playwright/test');

const LINKS = [
  { id: 'deptClassRptLink',  name: 'DeptClass' },
  { id: 'openPORptLink',     name: 'OpenPO' },
  { id: 'POActivityRptLink', name: 'POActivity' },
  { id: 'POGProfileRptLink', name: 'PlanogramProfile' },
  { id: 'ReprintRptLink',    name: 'Reprint' },
];

async function login(page) {
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(1500);
  // Fill login form
  const user = page.locator('input[type="text"]').first();
  const pass = page.locator('input[type="password"]').first();
  await user.fill('system');
  await pass.fill('p38l');
  await page.locator('button:has-text("Login")').click();
  await page.waitForTimeout(2000);
  console.log('Logged in');
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await login(page);

  for (const link of LINKS) {
    console.log('\n' + '='.repeat(60));
    console.log('=== ' + link.name + ' (' + link.id + ') ===');

    // Open sidebar
    await page.evaluate(function() {
      var el = document.getElementById('sideMenu');
      if (el) el.style.display = 'block';
    });
    await page.waitForTimeout(400);

    // Click link
    await page.evaluate(function(id) {
      var li = document.getElementById(id);
      if (li) {
        var a = li.querySelector('a');
        if (a) a.click(); else li.click();
      }
    }, link.id);
    await page.waitForTimeout(2500);

    // Close sidebar
    await page.evaluate(function() {
      var el = document.getElementById('sideMenu');
      if (el) el.setAttribute('style', 'display: none !important;');
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: 'C:/Users/WISP Automation/WISP_PW_UI/test-data/report_' + link.name + '.png',
      fullPage: true
    });

    const info = await page.evaluate(function() {
      var customEls = Array.from(document.querySelectorAll('*')).filter(function(el) {
        return el.tagName.toLowerCase().startsWith('app-') && el.tagName.toLowerCase() !== 'app-root' && el.tagName.toLowerCase() !== 'app-main' && el.tagName.toLowerCase() !== 'app-slidenav';
      }).map(function(el) { return el.tagName.toLowerCase(); });
      var uniqueComps = Array.from(new Set(customEls));

      var sidebar = document.getElementById('sideMenu');
      function notInSidebar(el) { return !sidebar || !sidebar.contains(el); }

      var inputs = Array.from(document.querySelectorAll('input, button, mat-checkbox')).filter(notInSidebar).map(function(el) {
        return {
          tag: el.tagName,
          type: el.getAttribute('type'),
          value: el.value || '',
          text: (el.textContent || '').trim().substring(0, 60),
          id: el.id,
          class: (el.className || '').toString().substring(0, 60)
        };
      });

      var labels = Array.from(document.querySelectorAll('label, .label, td, th, mat-header-cell, mat-cell')).filter(notInSidebar).map(function(l) {
        return (l.textContent || '').trim();
      }).filter(function(t) { return t.length > 0 && t.length < 80; });

      var allText = Array.from(document.querySelectorAll('h2, h3, h4, .card-title, .section-title, .panel-title, .actions, [class*="header"]')).filter(notInSidebar).map(function(el) {
        return (el.textContent || '').trim().substring(0, 80);
      }).filter(function(t) { return t.length > 0; });

      var tabs = Array.from(document.querySelectorAll('.tab, [role="tab"], .nav-link, .tab-header')).filter(notInSidebar).map(function(t) {
        return (t.textContent || '').trim();
      }).filter(function(t) { return t.length > 0; });

      return { uniqueComps: uniqueComps, inputs: inputs, labels: labels, allText: allText, tabs: tabs };
    });

    console.log('Components:', info.uniqueComps.join(', '));
    console.log('Headings/sections:', info.allText.slice(0, 8).join(' | '));
    console.log('Labels:', info.labels.slice(0, 15).join(' | '));
    var btns = info.inputs.filter(function(i) { return i.tag === 'BUTTON' || (i.tag === 'INPUT' && (i.type === 'button' || i.type === 'submit')); });
    console.log('Buttons:', btns.map(function(b) { return b.text || b.value; }).join(' | '));
    var fields = info.inputs.filter(function(i) { return i.tag === 'INPUT' && i.type !== 'button' && i.type !== 'submit'; });
    console.log('Input fields:', fields.map(function(f) { return f.type + '(id=' + f.id + ',val=' + f.value + ')'; }).join(' | '));
    console.log('Tabs:', info.tabs.join(' | '));
  }

  await browser.close();
})();
