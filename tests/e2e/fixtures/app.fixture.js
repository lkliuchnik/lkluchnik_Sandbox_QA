const base = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { BookStorePage } = require('../pages/BookStorePage');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');
const {
  login,
  generateToken,
  deleteAllBooksFromCollection,
  createApiAccount,
  deleteApiAccount,
} = require('../helpers/bookStoreApi');

// demoqa.com serves Google ad iframes that can visually cover the book table and make
// Playwright's actionability checks hang on otherwise-valid locators. Blocking the ad
// domains keeps the tests reliable without touching any app locators.
const AD_DOMAINS = ['doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'adservice.google.com'];

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      return AD_DOMAINS.some((domain) => url.includes(domain)) ? route.abort() : route.continue();
    });
    await use(page);
  },

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

  // demoqa.com keeps only the latest token of a user valid - a UI login or a new
  // generateToken() call kills the previous one. So the browser (loggedInBookStore) and
  // the API calls (bookStoreCollection) share this one session instead of each logging in.
  defaultUserSession: async ({ request, credentials }, use) => {
    // Login also returns a "token", but it does not always work for later API
    // calls (we saw random 401 errors). Only the token from generateToken() is
    // reliable, so keep both calls - do not remove generateToken() to "simplify" this.
    const { body: tokenBody } = await generateToken(request, credentials);
    const { body: loginBody } = await login(request, credentials);
    await use({ userId: loginBody.userId, token: tokenBody.token, expires: tokenBody.expires });
  },

  // Logs the browser in with the API session's token (as the cookies the login form would
  // set), not via the form - the form itself is covered by bookStoreLogin.spec.js.
  loggedInBookStore: async ({ page, baseURL, bookStoreLandingPage, credentials, defaultUserSession }, use) => {
    const { userId, token, expires } = defaultUserSession;
    await page.context().addCookies([
      { name: 'token', value: token, url: baseURL },
      { name: 'userID', value: userId, url: baseURL },
      { name: 'userName', value: credentials.userName, url: baseURL },
      { name: 'expires', value: expires, url: baseURL },
    ]);
    await page.reload();
    await bookStoreLandingPage.expectUserName(credentials.userName);
    await bookStoreLandingPage.expectLogoutVisible();
    await use(bookStoreLandingPage);
  },

  // Precondition + cleanup for any test that touches the shared defaultUser's book
  // collection via the API: wipes it before the test and again after, so the shared
  // account always starts and ends empty regardless of what the test does in between.
  bookStoreCollection: async ({ request, defaultUserSession }, use) => {
    const { userId, token } = defaultUserSession;

    await deleteAllBooksFromCollection(request, userId, token);
    await use({ userId, token });
    await deleteAllBooksFromCollection(request, userId, token);
  },

  // Creates a disposable user via the API for tests that need their own isolated
  // account, and deletes that user via the API afterwards regardless of test outcome.
  apiUser: async ({ request }, use) => {
    const account = await createApiAccount(request);

    await use(account);

    await deleteApiAccount(request, account);
  },
});

module.exports = {
  test,
  expect: base.expect,
};
