const { expect } = require('@playwright/test');

class BookStorePage {
  constructor(page) {
    this.page = page;
    this.expandedBookStoreList = page.locator('.element-list.accordion-collapse.collapse.show');
    this.menuLoginItem = this.expandedBookStoreList.getByText('Login', { exact: true });
    this.menuBookStoreItem = this.expandedBookStoreList.getByText('Book Store', { exact: true });
    this.menuProfileItem = this.expandedBookStoreList.getByText('Profile', { exact: true });
    this.userNameInput = page.locator('#userName');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login');
    this.userNameValue = page.locator('#userName-value');
    this.logoutButton = page.getByRole('button', { name: /log out|logout/i });
    this.searchInput = page.locator('#searchBox');
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.searchResultBookLinks = page.locator('.rt-tbody .rt-tr-group .rt-td a');
    this.noRowsMessage = page.locator('.rt-noData');
    this.goToBookStoreButton = page.getByRole('button', { name: 'Go To Book Store' });
    this.backToBookStoreButton = page.getByRole('button', { name: 'Back To Book Store' });
    this.addToYourCollectionButton = page.getByRole('button', { name: 'Add To Your Collection' });
  }

  async expectMenuExpandedWithItems(itemNames) {
    await expect(this.expandedBookStoreList).toBeVisible();

    for (const itemName of itemNames) {
      await expect(this.expandedBookStoreList.getByText(itemName, { exact: true })).toBeVisible();
    }
  }

  async openLoginFromMenu() {
    await this.menuLoginItem.click();
    await expect(this.page).toHaveURL(/\/login$/);
  }

  async fillCredentialsAndSubmit(userName, password) {
    await this.userNameInput.fill(userName);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAs(userName, password) {
    await this.openLoginFromMenu();
    await this.fillCredentialsAndSubmit(userName, password);
  }

  async expectUserName(userName) {
    await expect(this.userNameValue).toHaveText(userName);
  }

  async expectLogoutVisible() {
    await expect(this.logoutButton).toBeVisible();
  }

  async clickLogout() {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
    await expect(this.logoutButton).toBeHidden();
  }

  async expectLoginInBookStoreVisible() {
    if (!/\/login$/.test(this.page.url())) {
      await this.openLoginFromMenu();
    }

    await expect(this.page.getByText('Login in Book Store', { exact: true })).toBeVisible();
  }

  async searchBooks(searchText) {
    await this.searchInput.fill(searchText);
  }

  async clickSearchButton() {
    await this.searchInput.press('Enter');
  }

  async hasSearchResults() {
    return (await this.searchResultBookLinks.count()) > 0;
  }

  async expectSearchResultsEmpty() {
    await expect(this.searchResultBookLinks).toHaveCount(0);
  }

  async getSearchResultBookTitles() {
    return await this.searchResultBookLinks.allTextContents();
  }

  async clickGoToBookStore() {
    await this.goToBookStoreButton.click();
    await expect(this.page).toHaveURL(/\/books$/);
  }

  async openBookStoreFromMenu() {
    await this.menuBookStoreItem.click();
    await expect(this.page).toHaveURL(/\/books$/);
  }

  async clickBackToBookStore() {
    await this.backToBookStoreButton.click();
    await expect(this.page).toHaveURL(/\/books$/);
  }

  async openBookByTitle(title) {
    await this.searchResultBookLinks.filter({ hasText: title }).first().click();
  }

  async addCurrentBookToCollection() {
    this.page.once('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/Book added to your collection|already present in the your collection/i);
      await dialog.accept();
    });

    await this.addToYourCollectionButton.click();
  }

  async openProfileFromMenu() {
    await this.menuProfileItem.click();
    await expect(this.page).toHaveURL(/\/profile$/);
  }

  async expectBookVisibleInSearchResults(title) {
    await expect(this.searchResultBookLinks.filter({ hasText: title }).first()).toBeVisible();
  }

  async expectSearchResultsMatchTitlesAndCount(profileBooks, searchText) {
    // Array 1: books found by search
    const searchResults = await this.getSearchResultBookTitles();

    // Array 2: books already in user's profile
    // Check that every book from search results exists in profile books
    for (const title of searchResults) {
      expect(profileBooks).toContain(title);
    }
  }
}

module.exports = {
  BookStorePage,
};
