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

  // Open sidebar and navigate to User Management
  const sideMenu = page.locator('#sideMenu');
  if (!await sideMenu.isVisible()) {
    await page.locator('.sidebar-launcher').click({ force: true });
    await page.waitForTimeout(600);
  }
  await page.evaluate(function () {
    var li = document.getElementById('userMgmtLink');
    if (li) { var a = li.querySelector('a'); if (a) a.click(); }
  });
  await page.waitForTimeout(2000);

  // Close sidebar
  await page.evaluate(function () {
    var el = document.getElementById('sideMenu');
    if (el) el.style.display = 'none';
  });
  await page.waitForTimeout(500);

  // Screenshot full table
  await page.screenshot({ path: 'test-results/um_grid_full.png', fullPage: true });

  // Get all mat-header-cell text
  const headers = await page.evaluate(function () {
    var cells = Array.from(document.querySelectorAll('mat-header-cell'));
    return cells.map(function (c) { return (c.className + ' | ' + (c.textContent || '').trim()); });
  });
  console.log('Grid headers:', JSON.stringify(headers, null, 2));

  // Click person_add icon
  const clicked = await page.evaluate(function () {
    var icons = Array.from(document.querySelectorAll('i.material-icons, mat-icon'));
    for (var i = 0; i < icons.length; i++) {
      if ((icons[i].textContent || '').trim() === 'person_add') {
        var btn = icons[i].closest('button');
        if (btn) { btn.click(); return 'person_add btn clicked'; }
        icons[i].click(); return 'person_add icon clicked';
      }
    }
    return 'person_add NOT FOUND';
  });
  console.log('Create icon click:', clicked);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'test-results/um_create_modal.png', fullPage: true });

  // Get modal HTML
  const modalHtml = await page.evaluate(function () {
    var modal = document.querySelector('.modal-dialog, .modal');
    return modal ? modal.outerHTML.substring(0, 5000) : 'MODAL NOT FOUND';
  });
  console.log('\n=== CREATE MODAL HTML ===');
  console.log(modalHtml);

  // Close modal and click edit on first row
  await page.evaluate(function () {
    var closeBtn = document.querySelector('.modal button.btn-warning, .modal-footer .btn-warning');
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(800);

  // Click the edit (mode_edit) icon on first row
  const editClicked = await page.evaluate(function () {
    var rows = document.querySelectorAll('mat-row');
    if (rows.length > 0) {
      var icons = rows[0].querySelectorAll('i.material-icons, mat-icon');
      for (var i = 0; i < icons.length; i++) {
        if ((icons[i].textContent || '').trim() === 'mode_edit') {
          var btn = icons[i].closest('button');
          if (btn) { btn.click(); return 'mode_edit clicked'; }
        }
      }
      // fallback - click first button
      var btn = rows[0].querySelector('button');
      if (btn) { btn.click(); return 'first button clicked'; }
    }
    return 'no rows found';
  });
  console.log('Edit icon click:', editClicked);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'test-results/um_edit_modal.png', fullPage: true });

  const editModalHtml = await page.evaluate(function () {
    var modal = document.querySelector('.modal-dialog, .modal');
    return modal ? modal.outerHTML.substring(0, 5000) : 'MODAL NOT FOUND';
  });
  console.log('\n=== EDIT MODAL HTML ===');
  console.log(editModalHtml);

  await browser.close();
})().catch(console.error);
