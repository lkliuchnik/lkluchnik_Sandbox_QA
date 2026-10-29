const { test } = require('../fixtures/app.fixture');
const { BookStorePage } = require('../pages/BookStorePage');

test('BookStoreLogout', async ({ loggedInBookStore }) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;

  await bookStore.clickLogout();
  await bookStore.expectLoginInBookStoreVisible();
});
