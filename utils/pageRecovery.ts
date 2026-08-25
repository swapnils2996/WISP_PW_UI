import { Browser, BrowserContext, Page, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { getConfig } from './configReader';

/**
 * Adds a beforeEach hook that detects a crashed/closed page from a prior test
 * failure and transparently re-creates the browser context + re-logs in.
 *
 * Usage – call this INSIDE test.describe() after declaring the let variables:
 *
 *   addPageRecovery(
 *       () => ({ context, page }),
 *       (ctx, pg) => { context = ctx; page = pg; myPage = new MyPage(pg); }
 *   );
 */
export function addPageRecovery(
    getCtx: () => { context: BrowserContext; page: Page },
    setState: (context: BrowserContext, page: Page) => void,
    loginWait = 1000
): void {
    test.beforeEach(async ({ browser }: { browser: Browser }) => {
        const { context, page } = getCtx();
        let alive = false;
        try { await page.title(); alive = true; } catch { /* page was closed by prior crash */ }
        if (alive) return;

        try { await context.close(); } catch {}

        const cfg = getConfig();
        const newContext = await browser.newContext();
        const newPage    = await newContext.newPage();
        const loginPage  = new LoginPage(newPage);
        await loginPage.navigate();
        await loginPage.login(cfg.username, cfg.password);
        await newPage.waitForTimeout(loginWait);
        setState(newContext, newPage);
    });
}
