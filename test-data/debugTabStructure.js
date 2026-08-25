const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const mockData = require('./mockItemData.json');
  await context.route('**/ItemService.svc/jitem/saleshistory/**', async route => {
    const url = route.request().url();
    const sku = url.split('/saleshistory/')[1]?.split('?')[0] ?? '';
    const item = mockData[sku] ?? null;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(item ? JSON.stringify(item) : '"null"') });
  });

  const page = await context.newPage();
  await page.goto('http://isp.stores.michaels.com/webapp/');
  await page.waitForTimeout(3000);
  if (page.url().includes('Login')) {
    await page.locator('input[type="text"]').first().fill('system');
    await page.locator('input[type="password"]').first().fill('p38l');
    for (const sel of ['button:has-text("Login")', 'button.btn-primary']) {
      if (await page.locator(sel).isVisible({ timeout: 1000 }).catch(() => false)) { await page.locator(sel).click({ force: true }); break; }
    }
    await page.waitForTimeout(3000);
  }

  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'block'; });
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#sideMenu *'));
    const el = all.find(e => /Item Inquiry/i.test(e.textContent ?? '') && e.children.length === 0);
    if (el) el.click();
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const el = document.getElementById('sideMenu'); if (el) el.style.display = 'none'; });

  // Search for an item
  await page.locator('input[placeholder="Please enter your search criteria."]').fill('123458');
  await page.locator('button:has-text("Find")').first().click({ force: true });
  await page.waitForTimeout(3000);

  // Inspect tab structure
  const tabInfo = await page.evaluate(() => {
    const tabNavs = Array.from(document.querySelectorAll('.nav-tabs li'));
    const tabPanes = Array.from(document.querySelectorAll('.tab-pane, [class*="tab-panel"], [class*="tab-content"] > div'));
    return {
      navs: tabNavs.map(li => ({ 
        active: li.classList.contains('active'),
        text: li.querySelector('a')?.textContent?.trim() 
      })),
      panes: tabPanes.map(p => ({
        id: p.id,
        className: p.className.substring(0, 80),
        hasActive: p.classList.contains('active'),
        textPreview: p.textContent?.trim().substring(0, 50)
      })),
    };
  });
  console.log('Tab navs:', JSON.stringify(tabInfo.navs, null, 2));
  console.log('Tab panes (first 5):', JSON.stringify(tabInfo.panes.slice(0, 5), null, 2));

  // Check what textContent includes 'CLIP'
  const clipInfo = await page.evaluate(() => {
    const body = document.body;
    const hasClip = body.textContent?.includes('CLIP') ?? false;
    const activePane = document.querySelector('.tab-pane.active');
    const activePaneClip = activePane?.textContent?.includes('CLIP') ?? false;
    return { bodyHasClip: hasClip, activePaneExists: !!activePane, activePaneHasClip: activePaneClip };
  });
  console.log('CLIP info:', clipInfo);

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
