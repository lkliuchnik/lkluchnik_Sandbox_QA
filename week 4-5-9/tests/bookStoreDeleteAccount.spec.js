const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser, deleteUser } = require('../helpers/bookStoreApi');
const { httpStatus } = require('../test-data/httpStatus');
const { appMessages } = require('../test-data/appMessages');
const { BookStorePage } = require('../pages/BookStorePage');

test('BookStoreDeleteAccount - a deleted account can no longer log in', { tag: '@flaky-site' }, async ({
  request,
  bookStoreLandingPage,
  apiUser,
}) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;

  await bookStore.loginAs(apiUser.userName, apiUser.password);
  await bookStore.expectUserName(apiUser.userName);

  const { body: catalog } = await getAllBooks(request);
  const [book] = catalog.books;

  await bookStore.searchAndOpenBook(book.title);
  await bookStore.addCurrentBookToCollection();

  const { body: userAfterAdd } = await getUser(request, apiUser.userId, apiUser.token);
  const ownedIsbns = userAfterAdd.books.map((b) => b.isbn);
  expect(ownedIsbns).toContain(book.isbn);

  const { status: deleteStatus } = await deleteUser(request, apiUser.userId, apiUser.token);
  expect(deleteStatus).toBe(httpStatus.NO_CONTENT);

  await bookStore.clickLogout();
  await bookStore.loginAs(apiUser.userName, apiUser.password);
  await bookStore.expectLoginError(appMessages.INVALID_CREDENTIALS);
});
