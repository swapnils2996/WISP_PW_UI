# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login >> Login test
- Location: tests/login.spec.ts:16:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('div.panel-body')
Expected substring: "UserName (Logged in as)"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('div.panel-body')

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
  1  | import { test, expect, Page } from '@playwright/test';
  2  | import { LoginPage } from '../pages/LoginPage';
  3  | import { getConfig } from '../utils/configReader';
  4  | 
  5  | test.describe('Login', () => {
  6  |   let page: Page;
  7  |   const cfg = getConfig();
  8  | 
  9  |   test.beforeAll(async ({ browser }) => {
  10 |     const context = await browser.newContext();
  11 |     page = await context.newPage();
  12 |   });
  13 | 
  14 |   test.afterAll(async () => { await page.context().close(); });
  15 | 
  16 |   test('Login test', async () => {
  17 |     const loginPage = new LoginPage(page);
  18 |     await loginPage.navigate();
  19 |     await loginPage.login(cfg.username, cfg.password);
  20 | 
  21 |     const panel = loginPage.getLoggedInPanel();
> 22 |     await expect(panel).toContainText('UserName (Logged in as)');
     |                         ^ Error: expect(locator).toContainText(expected) failed
  23 |     await expect(panel).toContainText(cfg.username);
  24 |     await expect(panel).toContainText('Role Assigned');
  25 |     await expect(panel).toContainText('Admin');
  26 |     await expect(panel).toContainText('ISP Application Version');
  27 |     await expect(panel).toContainText('Store Number (Host Name)');
  28 |   });
  29 | });
  30 | 
```