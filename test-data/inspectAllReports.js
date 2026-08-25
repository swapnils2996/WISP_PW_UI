const { chromium } = require('@playwright/test');

const LINKS = [
  { id: 'deptClassRptLink',  name: 'DeptClass',    comp: 'app-department-class-report' },
  { id: 'openPORptLink',     name: 'OpenPO',       comp: '' },
  { id: 'POActivityRptLink', name: 'POActivity',   comp: '' },
  { id: 'POGProfileRptLink', name: 'PlanogramProfile', comp: '' },
  { id: 'ReprintRptLink',    name: 'Reprint',      comp: '' },
];

async function clickLink(page, id) {
  await page.evaluate(function() { document.getElementById('sideMenu').style.display = 'block'; });
  await page.waitForTimeout(400);
  // Close any existing tab first
  const closeTab = await page.evaluate(function(lid) {
    var li = document.getElementById(lid);
    var text = li ? (li.querySelector('div') ? li.querySelector('div').textContent.trim() : '') : '';
    return text;
  }, id);
  // Click the link
  await page.evaluate(function(id) {
    var li = document.getElementById(id);
    if (li) {
      var a = li.querySelector('a'); var div = li.querySelector('div');
      if (a) a.click(); else if (div) div.click(); else li.click();
    }
  }, id);
  await page.waitForTimeout(2500);
  await page.evaluate(function() { document.getElementById('sideMenu').setAttribute('style', 'display:none!important'); });
  await page.waitForTimeout(300);
}

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
  console.log('Logged in\n');

  for (const link of LINKS) {
    await clickLink(page, link.id);

    await page.screenshot({ path: 'C:/Users/WISP Automation/WISP_PW_UI/test-data/rpt_' + link.name + '.png', fullPage: true });

    const info = await page.evaluate(function() {
      var sidebar = document.getElementById('sideMenu');
      function notIn(el) { return !sidebar || !sidebar.contains(el); }

      var comps = Array.from(new Set(Array.from(document.querySelectorAll('*')).filter(function(el) {
        var t = el.tagName.toLowerCase();
        return t.startsWith('app-') && t !== 'app-root' && t !== 'app-main' && t !== 'app-slidenav';
      }).map(function(el) { return el.tagName.toLowerCase(); })));

      var inputs = Array.from(document.querySelectorAll('input, button')).filter(notIn).map(function(el) {
        return { tag: el.tagName, type: el.getAttribute('type'), value: el.value, text: (el.textContent || '').trim().substring(0,50), id: el.id };
      });

      var labels = Array.from(document.querySelectorAll('label, span, p, td, th, mat-header-cell, div')).filter(notIn).map(function(el) {
        var t = (el.textContent || '').trim();
        return t;
      }).filter(function(t) { return t.length > 2 && t.length < 70; });

      var checkboxes = Array.from(document.querySelectorAll('mat-checkbox, input[type="checkbox"]')).filter(notIn).map(function(el) {
        return (el.textContent || el.getAttribute('ng-reflect-name') || '').trim();
      });

      var cols = Array.from(document.querySelectorAll('th, mat-header-cell')).filter(notIn).map(function(c) {
        return (c.textContent || '').trim();
      }).filter(function(t) { return t.length > 0; });

      var allBtns = inputs.filter(function(i) { return i.tag === 'BUTTON' || (i.tag === 'INPUT' && (i.type === 'button' || i.type === 'submit')); });
      var allFields = inputs.filter(function(i) { return i.tag === 'INPUT' && i.type !== 'button' && i.type !== 'submit'; });

      return { comps: comps, labels: Array.from(new Set(labels)).slice(0, 20), btns: allBtns.map(function(b){ return b.text||b.value; }), fields: allFields, cols: cols, checkboxes: checkboxes };
    });

    console.log('=== ' + link.name + ' ===');
    console.log('Components:', info.comps.join(', '));
    console.log('Labels:', info.labels.join(' | '));
    console.log('Buttons:', info.btns.join(' | '));
    console.log('Input fields:', info.fields.map(function(f) { return '['+f.type+' id='+f.id+' val='+f.value+']'; }).join(', '));
    console.log('Checkboxes:', info.checkboxes.join(' | '));
    console.log('Table cols:', info.cols.join(' | '));
    console.log('');
  }

  await browser.close();
})();
