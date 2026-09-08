const { test } = require('../fixtures/app.fixture');
const { BookStorePage } = require('../pages/BookStorePage');

// Checks that clicking Logout signs the user out and shows the Login screen again.
//
// Precondition: none - loggedInBookStore just logs in first.
// Cleanup: none - logging out does not create or change any account.
test('BookStoreLogout', async ({ loggedInBookStore }) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;

  await bookStore.clickLogout();
  await bookStore.expectLoginInBookStoreVisible();
});
