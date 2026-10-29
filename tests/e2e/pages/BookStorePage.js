const { expect } = require('@playwright/test');
const { appMessages } = require('../test-data/appMessages');

class BookStorePage {
  // demoqa.com's Book Store pages can take this long to render. Exposed here (not just
  // used internally) so tests that wait on this same page don't each hardcode their own
  // copy of the same number.
  static SLOW_RENDER_TIMEOUT = 45_000;

  constructor(page) {
    this.page = page;
    this.expandedBookStoreList = page.locator('.element-list.accordion-collapse.collapse.show');
    this.menuLoginItem = this.expandedBookStoreList.getByText('Login', { exact: true });
    this.menuBookStoreItem = this.expandedBookStoreList.getByText('Book Store', { exact: true });
    this.menuProfileItem = this.expandedBookStoreList.getByText('Profile', { exact: true });
    this.menuBookStoreApiItem = this.expandedBookStoreList.getByText('Book Store API', { exact: true });
    this.userNameInput = page.locator('#userName');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login');
    this.userNameValue = page.locator('#userName-value');
    this.logoutButton = page.getByRole('button', { name: /log out|logout/i });
    this.searchInput = page.locator('#searchBox');
    this.searchResultBookLinks = page.locator('.rt-tbody .rt-tr-group .rt-td a');
    this.noRowsMessage = page.locator('.rt-noData');
    this.goToBookStoreButton = page.getByRole('button', { name: 'Go To Book Store' });
    this.backToBookStoreButton = page.getByRole('button', { name: 'Back To Book Store' });
    this.addToYourCollectionButton = page.getByRole('button', { name: 'Add To Your Collection' });
    this.deleteAllBooksButton = page.getByRole('button', { name: 'Delete All Books' });
    this.loginErrorMessage = page.locator('#name');
  }

  async expectFullMenuVisible() {
    await expect(this.expandedBookStoreList).toBeVisible();
    await expect(this.menuLoginItem).toBeVisible();
    await expect(this.menuBookStoreItem).toBeVisible();
    await expect(this.menuProfileItem).toBeVisible();
    await expect(this.menuBookStoreApiItem).toBeVisible();
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

  async expectLoginError(message) {
    await expect(this.loginErrorMessage).toHaveText(message);
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

  // demoqa.com's search can be genuinely slow to render (observed up to tens of seconds).
  // Waiting for either an actual result or the explicit "no rows" message - rather than a
  // single fixed-timeout visibility check on results only - avoids misreading "hasn't
  // rendered yet" as "no matches", which the caller must not treat as equivalent.
  async searchAndWaitForResults(searchText, timeout = BookStorePage.SLOW_RENDER_TIMEOUT) {
    await this.searchBooks(searchText);
    await this.clickSearchButton();
    await expect
      .poll(async () => (await this.hasSearchResults()) || (await this.noRowsMessage.isVisible()), { timeout })
      .toBe(true);
  }

  async hasSearchResults() {
    return (await this.searchResultBookLinks.count()) > 0;
  }

  async expectSearchResultsEmpty(timeout) {
    await expect(this.searchResultBookLinks).toHaveCount(0, { timeout });
  }

  async getVisibleBookTitles() {
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

  // Goes to Book Store, searches for the exact title, and opens that book's page.
  async searchAndOpenBook(title) {
    await this.openBookStoreFromMenu();
    await this.searchAndWaitForResults(title);
    await this.openBookByTitle(title);
  }

  async addCurrentBookToCollection() {
    this.page.once('dialog', async (dialog) => {
      this.lastAddToCollectionMessage = dialog.message();
      expect(dialog.message()).toMatch(new RegExp(`${appMessages.BOOK_ADDED}|${appMessages.BOOK_ALREADY_PRESENT}`));
      await dialog.accept();
    });

    await this.addToYourCollectionButton.click();
  }

  async openProfileFromMenu() {
    await this.menuProfileItem.click();
    await expect(this.page).toHaveURL(/\/profile$/);
  }

  // The per-row trash icon on the Profile page uses a stable id of this form
  // (id="delete-record-<isbn>"), so it can be targeted directly by ISBN without needing
  // to first locate the row by title.
  deleteBookButton(isbn) {
    return this.page.locator(`#delete-record-${isbn}`);
  }

  async deleteBookByIsbn(isbn) {
    // Defensive: accept a confirmation dialog if the app happens to show one; this is a
    // no-op if the delete completes without any dialog.
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.deleteBookButton(isbn).click();
  }

  async deleteAllBooksViaUi() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.deleteAllBooksButton.click();
  }

  async expectBookVisibleInSearchResults(title) {
    await expect(this.searchResultBookLinks.filter({ hasText: title }).first()).toBeVisible();
  }

  async expectBookHiddenInSearchResults(title, timeout) {
    await expect(this.searchResultBookLinks.filter({ hasText: title }).first()).toBeHidden({ timeout });
  }

  async expectSearchResultsMatchTitlesAndCount(profileBooks) {
    const searchResults = await this.getVisibleBookTitles();
    expect(searchResults.sort()).toEqual([...profileBooks].sort());
  }
}

module.exports = {
  BookStorePage,
};
