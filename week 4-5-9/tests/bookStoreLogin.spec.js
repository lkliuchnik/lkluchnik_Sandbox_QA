const { test } = require('../fixtures/app.fixture');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');
const { appMessages } = require('../test-data/appMessages');
const { BookStorePage } = require('../pages/BookStorePage');

/** @type {BookStorePage} */
let bookStore;

test.beforeEach(({ bookStoreLandingPage }) => {
  bookStore = bookStoreLandingPage;
});

test('BookStoreLogin - valid credentials log the user in', async ({ credentials }) => {
  await bookStore.loginAs(credentials.userName, credentials.password);
  await bookStore.expectUserName(credentials.userName);
  await bookStore.expectLogoutVisible();
});

test('BookStoreLogin - the book store menu shows all navigation items', async () => {
  await bookStore.expectFullMenuVisible();
});

test('BookStoreLogin - wrong password is rejected with an error', async () => {
  const { userName, password } = bookStoreCredentials.invalidPassword;

  await bookStore.loginAs(userName, password);
  await bookStore.expectLoginError(appMessages.INVALID_CREDENTIALS);
});

test('BookStoreLogin - unknown username is rejected with an error', async () => {
  const { userName, password } = bookStoreCredentials.nonExistentUser;

  await bookStore.loginAs(userName, password);
  await bookStore.expectLoginError(appMessages.INVALID_CREDENTIALS);
});
