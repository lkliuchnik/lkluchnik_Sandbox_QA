const { test } = require('../fixtures/app.fixture');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');
const { BookStorePage } = require('../pages/BookStorePage');

const INVALID_CREDENTIALS_ERROR = 'Invalid username or password!';

// Checks that logging in with valid credentials works: the username shows up in the
// header and the Logout button appears.
//
// Precondition: none. Cleanup: none - logging in does not create or change any account.
test('BookStoreLogin - valid credentials log the user in', async ({ bookStoreLandingPage, credentials }) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;

  await bookStore.loginAs(credentials.userName, credentials.password);
  await bookStore.expectUserName(credentials.userName);
  await bookStore.expectLogoutVisible();
});

// Checks that before logging in, the side menu shows all navigation items. Kept as its
// own test so a menu change doesn't look like a login bug, and a login bug doesn't
// hide a menu problem.
//
// Precondition: none. Cleanup: none.
test('BookStoreLogin - the book store menu shows all navigation items', async ({ bookStoreLandingPage }) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;

  await bookStore.expectFullMenuVisible();
});

// Negative case: the login form should show a clear error for bad credentials (wrong
// password, unknown username) instead of failing silently or letting the user in.
//
// Precondition: none. Cleanup: none - no account is created or changed.
test('BookStoreLogin - wrong password is rejected with an error', async ({ bookStoreLandingPage }) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;
  const { userName, password } = bookStoreCredentials.invalidPassword;

  await bookStore.loginAs(userName, password);
  await bookStore.expectLoginError(INVALID_CREDENTIALS_ERROR);
});

// Same negative case as above, but with a username that does not exist at all.
test('BookStoreLogin - unknown username is rejected with an error', async ({ bookStoreLandingPage }) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;
  const { userName, password } = bookStoreCredentials.nonExistentUser;

  await bookStore.loginAs(userName, password);
  await bookStore.expectLoginError(INVALID_CREDENTIALS_ERROR);
});
