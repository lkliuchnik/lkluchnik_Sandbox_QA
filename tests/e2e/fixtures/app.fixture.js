const base = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { BookStorePage } = require('../pages/BookStorePage');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');

const test = base.test.extend({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  bookStorePage: async ({ page }, use) => {
    await use(new BookStorePage(page));
  },

  credentials: async ({}, use) => {
    await use(bookStoreCredentials.defaultUser);
  },

  bookStoreLandingPage: async ({ homePage, bookStorePage }, use) => {
    await homePage.open();
    await homePage.expectSeleniumOnlineTrainingVisible();
    await homePage.openBookStoreApplication();
    await use(bookStorePage);
  },

  loggedInBookStore: async ({ bookStoreLandingPage, credentials }, use) => {
    await bookStoreLandingPage.loginAs(credentials.userName, credentials.password);
    await bookStoreLandingPage.expectUserName(credentials.userName);
    await bookStoreLandingPage.expectLogoutVisible();
    await use(bookStoreLandingPage);
  },
});

module.exports = {
  test,
  expect: base.expect,
};
