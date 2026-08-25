const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ baseURL: 'http://isp.stores.michaels.com' });
  const page = await ctx.newPage();

  await page.goto('/webapp/');
  await page.fill('input[type="text"]', 'system');
  await page.fill('input[type="password"]', 'p38l');
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(2000);

  // Open sidebar
  const sideMenu = page.locator('#sideMenu');
  if (!await sideMenu.isVisible()) {
    await page.locator('.sidebar-launcher').click({ force: true });
    await page.waitForTimeout(600);
  }
  // Click User Management
  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });

  // Wait for mat-table to appear
  await page.waitForSelector('mat-table', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Check person_add location
  const personAddInfo = await page.evaluate(function () {
    var icons = Array.from(document.querySelectorAll('i.material-icons, mat-icon'));
    for (var i = 0; i < icons.length; i++) {
      if ((icons[i].textContent || '').trim() === 'person_add') {
        var parent = icons[i].parentElement;
        return {
          found: true,
          tagName: icons[i].tagName,
          parentTag: parent ? parent.tagName : '',
          parentClass: parent ? parent.className : '',
          grandparent: parent && parent.parentElement ? parent.parentElement.outerHTML.substring(0, 200) : ''
        };
      }
    }
    return { found: false };
  });
  console.log('person_add info:', JSON.stringify(personAddInfo, null, 2));

  // Click mode_edit on first mat-row
  const rowCount = await page.locator('mat-row').count();
  console.log('mat-row count:', rowCount);

  if (rowCount > 0) {
    // Get text of first row
    const firstRowText = await page.locator('mat-row').first().textContent();
    console.log('First row text:', firstRowText.substring(0, 100));

    // Inspect all clickable elements in first row
    const rowInspect = await page.evaluate(function () {
      var rows = document.querySelectorAll('mat-row');
      if (!rows.length) return 'no rows';
      var row = rows[0];
      // Get all elements in Actions cell
      var actionCells = row.querySelectorAll('mat-cell.mat-column-actions, mat-cell[class*="action"]');
      var allElems = row.querySelectorAll('i, a, span, div, button');
      var results = [];
      allElems.forEach(function (el) {
        if (el.children.length === 0 || el.tagName === 'I') {
          results.push({ tag: el.tagName, class: el.className, text: (el.textContent || '').trim().substring(0, 30) });
        }
      });
      return JSON.stringify({ actionCellCount: actionCells.length, rowInnerHTML: row.innerHTML.substring(0, 2000), elements: results });
    });
    console.log('Row inspection:', rowInspect);
  }

  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/um_edit_modal2.png', fullPage: true });

  // Get edit modal HTML
  const editModalHtml = await page.evaluate(function () {
    var modal = document.querySelector('div[role="dialog"], .modal.in, .modal.show');
    return modal ? modal.outerHTML.substring(0, 6000) : 'MODAL NOT FOUND: ' + document.body.innerHTML.substring(0, 500);
  });
  console.log('\n=== EDIT MODAL HTML ===');
  console.log(editModalHtml);

  await browser.close();
})().catch(console.error);
