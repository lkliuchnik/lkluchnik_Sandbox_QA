const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.elementsCard = page.getByText('Elements', { exact: true });
    this.bookStoreApplicationCard = page.getByText('Book Store Application', { exact: true });
    this.seleniumOnlineTrainingBanner = page.getByRole('link', { name: 'Selenium Online Training' });
  }

  async open() {
    await this.page.goto('/');
    await expect(this.page).toHaveURL(/demoqa\.com\/?$/);
  }

  async openElementsSection() {
    await this.elementsCard.click();
    await expect(this.page).toHaveURL(/\/elements$/);
  }

  async expectSeleniumOnlineTrainingVisible() {
    await expect(this.seleniumOnlineTrainingBanner).toBeVisible();
  }

  async openBookStoreApplication() {
    await this.bookStoreApplicationCard.click();
    await expect(this.page).toHaveURL(/\/books$/);
  }
}

module.exports = {
  HomePage,
};
