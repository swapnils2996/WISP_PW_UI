# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deploymentUtilities.spec.ts >> Deployment Utilities >> DU_TC_WTC05 - Edge boundary: long input string, rapid Enter clicks, button states across 3 pages
- Location: tests/deploymentUtilities.spec.ts:256:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e9] [cursor=pointer]: print
  - generic [ref=e11]:
    - generic [ref=e14]: 
    - generic [ref=e17]:
      - list [ref=e18]:
        - listitem
      - generic [ref=e22]:
        - generic [ref=e24]:
          - img [ref=e25]
          - separator [ref=e26]
          - generic [ref=e27]: Windows In-Store Processor
        - generic [ref=e28]:
          - generic [ref=e29]: "User Name :"
          - textbox [ref=e31]: system
        - generic [ref=e32]:
          - generic [ref=e33]: "Password :"
          - textbox [ref=e35]: p38l
        - generic [ref=e37]:
          - button "Login" [active] [ref=e38] [cursor=pointer]
          - button "Clear" [ref=e39] [cursor=pointer]
        - generic [ref=e42]:
          - generic [ref=e43]: 
          - text: Unable to connect to server!
```

# Test source

```ts
  290 |   // DU_DRL_WTC03 – Empty lock key negative
  291 |   async tc_drl03_emptyLockKey(screenshotDir: string): Promise<DU_TC03Result> {
  292 |     return this.emptyLockKeyNegative(
  293 |       path.join(screenshotDir, 'DU_DRL_WTC03_empty_key_click'),
  294 |       this.disableRFComponent, this.disableRFLockKeyInput,
  295 |       this.disableRFEnterBtn, '70606'
  296 |     );
  297 |   }
  298 | 
  299 |   // DU_DRL_WTC04 – Offline behavior
  300 |   async tc_drl04_offline(screenshotDir: string, context: BrowserContext): Promise<DU_TC04Result> {
  301 |     return this.offlineTest(
  302 |       path.join(screenshotDir, 'DU_DRL_WTC04_offline'),
  303 |       path.join(screenshotDir, 'DU_DRL_WTC04_restored'),
  304 |       this.disableRFComponent, this.disableRFLockKeyInput,
  305 |       this.disableRFEnterBtn, '70606', context
  306 |     );
  307 |   }
  308 | 
  309 |   // ══════════════════════════════════════════════════════════════════════════
  310 |   // ENABLE RF LOAD test methods
  311 |   // ══════════════════════════════════════════════════════════════════════════
  312 | 
  313 |   // DU_ERL_WTC01 – Load page and verify lock number 6803
  314 |   async tc_erl01_loadPage(screenshotDir: string, _data: DeploymentUtilitiesTestData): Promise<DU_TC01Result> {
  315 |     await this.openTabViaAngular('openEnableRFLoadPage');
  316 |     return this.loadAndValidateLockPage(
  317 |       path.join(screenshotDir, 'DU_ERL_WTC01_page_loaded'),
  318 |       this.enableRFComponent, this.enableRFPanelHeading,
  319 |       this.enableRFLockNumber, this.enableRFLockKeyInput,
  320 |       this.enableRFEnterBtn, '6803'
  321 |     );
  322 |   }
  323 | 
  324 |   // DU_ERL_WTC03 – Empty lock key negative
  325 |   async tc_erl03_emptyLockKey(screenshotDir: string): Promise<DU_TC03Result> {
  326 |     return this.emptyLockKeyNegative(
  327 |       path.join(screenshotDir, 'DU_ERL_WTC03_empty_key_click'),
  328 |       this.enableRFComponent, this.enableRFLockKeyInput,
  329 |       this.enableRFEnterBtn, '6803'
  330 |     );
  331 |   }
  332 | 
  333 |   // DU_ERL_WTC04 – Offline behavior
  334 |   async tc_erl04_offline(screenshotDir: string, context: BrowserContext): Promise<DU_TC04Result> {
  335 |     return this.offlineTest(
  336 |       path.join(screenshotDir, 'DU_ERL_WTC04_offline'),
  337 |       path.join(screenshotDir, 'DU_ERL_WTC04_restored'),
  338 |       this.enableRFComponent, this.enableRFLockKeyInput,
  339 |       this.enableRFEnterBtn, '6803', context
  340 |     );
  341 |   }
  342 | 
  343 |   // ══════════════════════════════════════════════════════════════════════════
  344 |   // TIME CLOCK test methods
  345 |   // ══════════════════════════════════════════════════════════════════════════
  346 | 
  347 |   // DU_TC_WTC01 – Load page and verify lock number 61810
  348 |   async tc_tc01_loadPage(screenshotDir: string, _data: DeploymentUtilitiesTestData): Promise<DU_TC01Result> {
  349 |     await this.openTabViaAngular('openTimeClockPage');
  350 |     return this.loadAndValidateLockPage(
  351 |       path.join(screenshotDir, 'DU_TC_WTC01_page_loaded'),
  352 |       this.timeClockComponent, this.timeClockPanelHeading,
  353 |       this.timeClockLockNumber, this.timeClockLockKeyInput,
  354 |       this.timeClockEnterBtn, '61810'
  355 |     );
  356 |   }
  357 | 
  358 |   // DU_TC_WTC03 – Empty lock key negative
  359 |   async tc_tc03_emptyLockKey(screenshotDir: string): Promise<DU_TC03Result> {
  360 |     return this.emptyLockKeyNegative(
  361 |       path.join(screenshotDir, 'DU_TC_WTC03_empty_key_click'),
  362 |       this.timeClockComponent, this.timeClockLockKeyInput,
  363 |       this.timeClockEnterBtn, '61810'
  364 |     );
  365 |   }
  366 | 
  367 |   // DU_TC_WTC04 – Offline behavior
  368 |   async tc_tc04_offline(screenshotDir: string, context: BrowserContext): Promise<DU_TC04Result> {
  369 |     return this.offlineTest(
  370 |       path.join(screenshotDir, 'DU_TC_WTC04_offline'),
  371 |       path.join(screenshotDir, 'DU_TC_WTC04_restored'),
  372 |       this.timeClockComponent, this.timeClockLockKeyInput,
  373 |       this.timeClockEnterBtn, '61810', context
  374 |     );
  375 |   }
  376 | 
  377 |   // DU_TC_WTC05 – Edge boundary: long strings, rapid clicks, button enabled state
  378 |   async tc_tc05_edgeBoundary(screenshotDir: string, context: BrowserContext, _data: DeploymentUtilitiesTestData): Promise<DU_TC05Result> {
  379 |     // Use JS evaluate to fill inputs regardless of which tab is active
  380 |     await this.page.evaluate(() => {
  381 |       const drl = document.querySelector('app-disable-rfload input') as HTMLInputElement;
  382 |       if (drl) { drl.value = 'a'.repeat(500); drl.dispatchEvent(new Event('input', { bubbles: true })); }
  383 |     });
  384 |     await this.page.waitForTimeout(200);
  385 |     const longStringEntered = await this.page.evaluate(() => {
  386 |       const drl = document.querySelector('app-disable-rfload input') as HTMLInputElement;
  387 |       return drl ? drl.value.length > 0 : false;
  388 |     });
  389 |     await this.disableRFEnterBtn.click({ force: true }).catch(() => {});
> 390 |     await this.page.waitForTimeout(300);
      |                     ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  391 |     const pageStableAfterLong = await this.disableRFComponent.count() > 0;
  392 |     await this.takeScreenshot(screenshotDir, 'DU_TC_WTC05_long_string');
  393 | 
  394 |     // Rapid clicks on Enable RF Load Enter button
  395 |     await this.page.evaluate(() => {
  396 |       const erl = document.querySelector('app-enable-rfload input') as HTMLInputElement;
  397 |       if (erl) { erl.value = 'testkey'; erl.dispatchEvent(new Event('input', { bubbles: true })); }
  398 |     });
  399 |     for (let i = 0; i < 5; i++) {
  400 |       await this.enableRFEnterBtn.click({ force: true }).catch(() => {});
  401 |       await this.page.waitForTimeout(100);
  402 |     }
  403 |     const rapidClicksCompleted = true;
  404 |     const pageStableAfterRapid = await this.enableRFComponent.count() > 0;
  405 |     await this.takeScreenshot(screenshotDir, 'DU_TC_WTC05_rapid_clicks');
  406 | 
  407 |     // Verify all 3 Enter buttons exist ([disabled]='false' is a static binding)
  408 |     const disableRFBtnEnabled = await this.disableRFEnterBtn.count() > 0;
  409 |     const enableRFBtnEnabled  = await this.enableRFEnterBtn.count() > 0;
  410 |     const timeClockBtnEnabled = await this.timeClockEnterBtn.count() > 0;
  411 | 
  412 |     return { longStringEntered, pageStableAfterLong, rapidClicksCompleted, pageStableAfterRapid,
  413 |       disableRFBtnEnabled, enableRFBtnEnabled, timeClockBtnEnabled };
  414 |   }
  415 | }
  416 | 
  417 | // ════════════════════════════════════════════════════════════════════════════
  418 | // EXTENSION — New test cases appended below; no existing code is modified.
  419 | // ════════════════════════════════════════════════════════════════════════════
  420 | 
  421 | export interface DU_TC02Result {
  422 |   panelHeadingText: string;
  423 |   h5HeadingText: string;
  424 |   descriptionContainsCallText: boolean;
  425 |   lockKeyLabelVisible: boolean;
  426 |   lockNumberLabelVisible: boolean;
  427 | }
  428 | 
  429 | export interface DU_TC05KeyboardResult {
  430 |   inputFilled: boolean;
  431 |   enterKeyPressed: boolean;
  432 |   pageStableAfterEnter: boolean;
  433 |   componentStillVisible: boolean;
  434 | }
  435 | 
  436 | // Interface merging: extends the class instance type with new method signatures
  437 | export interface DeploymentUtilitiesPage {
  438 |   tc_drl02_verifyTextContent(screenshotDir: string): Promise<DU_TC02Result>;
  439 |   tc_erl02_verifyTextContent(screenshotDir: string): Promise<DU_TC02Result>;
  440 |   tc_tc02_verifyTextContent(screenshotDir: string): Promise<DU_TC02Result>;
  441 |   tc_drl05_keyboardEnter(screenshotDir: string): Promise<DU_TC05KeyboardResult>;
  442 |   tc_erl05_keyboardEnter(screenshotDir: string): Promise<DU_TC05KeyboardResult>;
  443 | }
  444 | 
  445 | // ── Internal helper: verify page text labels and description ──────────────
  446 | async function _verifyPageTextContent(
  447 |   self: any,
  448 |   screenshotPath: string,
  449 |   componentLocator: Locator,
  450 |   openMethod: string
  451 | ): Promise<DU_TC02Result> {
  452 |   await self.openTabViaAngular(openMethod);
  453 |   await componentLocator.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  454 |   await self.closeSidebarIfOpen();
  455 |   await self.page.waitForTimeout(500);
  456 |   await self.takeScreenshot('', screenshotPath);
  457 | 
  458 |   const panelHeadingText = ((await componentLocator.locator('.panel-heading label').first()
  459 |     .textContent().catch(() => '')) ?? '').trim();
  460 |   const h5HeadingText    = ((await componentLocator.locator('h5').first()
  461 |     .textContent().catch(() => '')) ?? '').trim();
  462 |   const descText         = ((await componentLocator.locator('p').first()
  463 |     .textContent().catch(() => '')) ?? '').trim();
  464 |   const descriptionContainsCallText = descText.toLowerCase().includes('please call the support desk');
  465 | 
  466 |   const columnTexts: string[] = await componentLocator.evaluate((el: HTMLElement) =>
  467 |     Array.from(el.querySelectorAll('.Column')).map(c => (c.textContent ?? '').trim())
  468 |   ).catch(() => []);
  469 | 
  470 |   return {
  471 |     panelHeadingText,
  472 |     h5HeadingText,
  473 |     descriptionContainsCallText,
  474 |     lockKeyLabelVisible:    columnTexts.some(t => t === 'Lock Key :'),
  475 |     lockNumberLabelVisible: columnTexts.some(t => t === 'Lock Number :'),
  476 |   };
  477 | }
  478 | 
  479 | // ── Internal helper: keyboard Enter key submission ────────────────────────
  480 | async function _keyboardEnterSubmission(
  481 |   self: any,
  482 |   screenshotPath: string,
  483 |   componentLocator: Locator,
  484 |   componentSelector: string,
  485 |   openMethod: string
  486 | ): Promise<DU_TC05KeyboardResult> {
  487 |   await self.openTabViaAngular(openMethod);
  488 |   await componentLocator.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  489 |   await self.closeSidebarIfOpen();
  490 |   await self.page.waitForTimeout(500);
```