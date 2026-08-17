const { test } = require('../fixtures/app.fixture');

test('BookStoreLogout', async ({ loggedInBookStore }) => {
  await loggedInBookStore.clickLogout();
  await loggedInBookStore.expectLoginInBookStoreVisible();
});
