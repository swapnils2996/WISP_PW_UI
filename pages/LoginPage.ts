import { Page } from '@playwright/test';

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  username = 'input[type="text"]';
  password = 'input[type="password"]';
  loginBtn = 'button:has-text("Login")';
  loggedInPanel = 'div.panel-body';

  // Actions
  async navigate() {
    await this.page.goto('/webapp/');
  }

  async login(user: string, pass: string) {
    await this.page.fill(this.username, user);
    await this.page.fill(this.password, pass);
    await this.page.click(this.loginBtn);
  }

  getLoggedInPanel() {
    return this.page.locator(this.loggedInPanel);
  }
}