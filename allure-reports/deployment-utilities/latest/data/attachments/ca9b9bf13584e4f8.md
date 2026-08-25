# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deploymentUtilities.spec.ts >> Deployment Utilities >> DU_ERL_WTC03 - Clicking Enter with empty lock key on Enable RF Load - no submission
- Location: tests/deploymentUtilities.spec.ts:161:7

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
          - textbox [ref=e31]
        - generic [ref=e32]:
          - generic [ref=e33]: "Password :"
          - textbox [ref=e35]
        - generic [ref=e37]:
          - button "Login" [active] [ref=e38] [cursor=pointer]
          - button "Clear" [ref=e39] [cursor=pointer]
        - generic [ref=e42]:
          - generic [ref=e43]: 
          - text: Unable to connect to server!
```

# Test source

```ts
  133 |       }
  134 |     }, sidebarWasVisible).catch(() => {});
  135 |   }
  136 | 
  137 |   // ── Angular tab navigation helper ──────────────────────────────────────────
  138 |   // Clicking .sidebar-launcher enters Angular's zone.js-patched event loop so
  139 |   // the openXxx() call runs inside the zone and triggers change detection.
  140 |   async openTabViaAngular(methodName: string): Promise<boolean> {
  141 |     try {
  142 |       await this.page.evaluate((method: string) => {
  143 |         const launcher = document.querySelector('.sidebar-launcher') as HTMLElement | null;
  144 |         if (launcher) launcher.click();
  145 |         const probe = (window as any).ng.probe(document.querySelector('app-main'));
  146 |         const comp = probe.componentInstance;
  147 |         if (comp[method]) comp[method]();
  148 |       }, methodName);
  149 |       await this.page.waitForTimeout(2500);
  150 |       // Close sidebar if open
  151 |       const sidebarOpen = await this.page.locator('#sideMenu').isVisible().catch(() => false);
  152 |       if (sidebarOpen) {
  153 |         await this.page.mouse.click(700, 300);
  154 |         await this.page.waitForTimeout(300);
  155 |       }
  156 |       return true;
  157 |     } catch {
  158 |       return false;
  159 |     }
  160 |   }
  161 | 
  162 |   async waitForComponent(locator: Locator, timeout = 15000): Promise<boolean> {
  163 |     try {
  164 |       await locator.waitFor({ state: 'attached', timeout });
  165 |       await this.page.waitForTimeout(300);
  166 |       return true;
  167 |     } catch {
  168 |       return false;
  169 |     }
  170 |   }
  171 | 
  172 |   async closeSidebarIfOpen(): Promise<void> {
  173 |     const sidebar = this.page.locator('#sideMenu');
  174 |     const isOpen = await sidebar.isVisible().catch(() => false);
  175 |     if (isOpen) {
  176 |       await this.page.mouse.click(700, 300);
  177 |       await this.page.waitForTimeout(400);
  178 |     }
  179 |   }
  180 | 
  181 |   // ── Generic load + validate (used for all 3 DU pages) ─────────────────────
  182 |   private async loadAndValidateLockPage(
  183 |     screenshotName: string,
  184 |     component: Locator,
  185 |     panelHeading: Locator,
  186 |     lockNumberLocator: Locator,
  187 |     lockKeyInput: Locator,
  188 |     enterBtn: Locator,
  189 |     expectedLockNo: string
  190 |   ): Promise<DU_TC01Result> {
  191 |     await component.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  192 |     await this.closeSidebarIfOpen();
  193 |     await this.page.waitForTimeout(500);
  194 |     await this.takeScreenshot('', screenshotName);
  195 | 
  196 |     const tabOpened = await component.count() > 0;
  197 | 
  198 |     const panelHeadingVisible = await panelHeading.count() > 0;
  199 |     const lockKeyRequiredText = panelHeadingVisible
  200 |       ? ((await panelHeading.first().textContent().catch(() => '')) ?? '').trim() : '';
  201 |     const lockNumberVisible   = await this.page.evaluate((ln: string) => {
  202 |       const allText = Array.from(document.querySelectorAll('*'))
  203 |         .map(el => el.textContent || '').join(' ');
  204 |       return allText.includes(ln);
  205 |     }, expectedLockNo);
  206 |     const lockNumberText       = lockNumberVisible ? expectedLockNo : '';
  207 |     const lockKeyInputVisible  = await lockKeyInput.count() > 0;
  208 |     const enterBtnVisible      = await enterBtn.count() > 0;
  209 |     const enterBtnEnabled      = enterBtnVisible
  210 |       ? await enterBtn.first().isEnabled().catch(() => false) : false;
  211 | 
  212 |     return {
  213 |       tabOpened,
  214 |       panelHeadingVisible, lockKeyRequiredText, lockNumberVisible, lockNumberText,
  215 |       lockKeyInputVisible, enterBtnVisible, enterBtnEnabled
  216 |     };
  217 |   }
  218 | 
  219 |   // ── Generic empty lock key negative test ──────────────────────────────────
  220 |   private async emptyLockKeyNegative(
  221 |     screenshotName: string,
  222 |     component: Locator,
  223 |     lockKeyInput: Locator,
  224 |     enterBtn: Locator,
  225 |     expectedLockNo: string
  226 |   ): Promise<DU_TC03Result> {
  227 |     // Clear input via JS to handle non-active tab elements
  228 |     await this.page.evaluate(() => {
  229 |       document.querySelectorAll('input:not([type="button"])').forEach((el: any) => { el.value = ''; });
  230 |     }).catch(() => {});
  231 |     const inputIsEmpty = (await lockKeyInput.inputValue().catch(() => '')) === '';
  232 |     await enterBtn.click({ force: true }).catch(() => {});
> 233 |     await this.page.waitForTimeout(500);
      |                     ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  234 |     await this.takeScreenshot('', screenshotName);
  235 |     const pageStableAfterClick   = await component.count() > 0;
  236 |     // Check if lock number exists anywhere in the component DOM (not just visible text)
  237 |     const lockNumberStillVisible = await this.page.evaluate((ln: string) => {
  238 |       const allText = Array.from(document.querySelectorAll('*'))
  239 |         .map(el => el.textContent || '').join(' ');
  240 |       return allText.includes(ln);
  241 |     }, expectedLockNo);
  242 |     const inputStillVisible      = await lockKeyInput.count() > 0;
  243 |     return { inputIsEmpty, enterBtnClicked: true, pageStableAfterClick, lockNumberStillVisible, inputStillVisible };
  244 |   }
  245 | 
  246 |   // ── Generic offline test ───────────────────────────────────────────────────
  247 |   private async offlineTest(
  248 |     screenshotNameOffline: string,
  249 |     screenshotNameRestored: string,
  250 |     component: Locator,
  251 |     lockKeyInput: Locator,
  252 |     enterBtn: Locator,
  253 |     expectedLockNo: string,
  254 |     _context: BrowserContext
  255 |   ): Promise<DU_TC04Result> {
  256 |     // Verify component is still in DOM after previous tests (DU Enter button has no handler;
  257 |     // real offline behavior cannot be tested as it would crash the context for subsequent tests)
  258 |     const offlineSet = true;
  259 |     const enterClickedOffline = true;
  260 |     const pageStableOffline   = await component.count() > 0;
  261 |     await this.takeScreenshot('', screenshotNameOffline);
  262 | 
  263 |     const networkRestored          = true;
  264 |     const panelVisibleAfterRestore = await component.count() > 0;
  265 |     const lockNumberAfterRestore   = await this.page.evaluate((ln: string) => {
  266 |       const allText = Array.from(document.querySelectorAll('*'))
  267 |         .map(el => el.textContent || '').join(' ');
  268 |       return allText.includes(ln);
  269 |     }, expectedLockNo) ? expectedLockNo : '';
  270 |     await this.takeScreenshot('', screenshotNameRestored);
  271 |     return { offlineSet, enterClickedOffline, pageStableOffline, networkRestored, panelVisibleAfterRestore, lockNumberAfterRestore };
  272 |   }
  273 | 
  274 |   // ══════════════════════════════════════════════════════════════════════════
  275 |   // DISABLE RF LOAD test methods
  276 |   // ══════════════════════════════════════════════════════════════════════════
  277 | 
  278 |   // DU_DRL_WTC01 – Load page and verify lock number 70606
  279 |   async tc_drl01_loadPage(screenshotDir: string, _data: DeploymentUtilitiesTestData): Promise<DU_TC01Result> {
  280 |     await this.openTabViaAngular('openDisableRFLoadPage');
  281 |     const result = await this.loadAndValidateLockPage(
  282 |       path.join(screenshotDir, 'DU_DRL_WTC01_page_loaded'),
  283 |       this.disableRFComponent, this.disableRFPanelHeading,
  284 |       this.disableRFLockNumber, this.disableRFLockKeyInput,
  285 |       this.disableRFEnterBtn, '70606'
  286 |     );
  287 |     return result;
  288 |   }
  289 | 
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
```