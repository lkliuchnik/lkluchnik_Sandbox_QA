const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, addBooksToCollection, getUser } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

const { SLOW_RENDER_TIMEOUT } = BookStorePage;

test('BookStoreDeleteAllBooks - clicking Delete All Books empties the collection', { tag: '@flaky-site' }, async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  test.fixme(true, 'Adds books via API, then waits for them in the UI - the UI never shows them. See the comment above.');

  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const { body: catalog } = await getAllBooks(request);
  const books = catalog.books.slice(0, 3);

  await addBooksToCollection(
    request,
    { userId: bookStoreCollection.userId, isbns: books.map((b) => b.isbn) },
    bookStoreCollection.token,
  );

  await bookStore.openProfileFromMenu();
  await expect(bookStore.deleteBookButton(books[0].isbn)).toBeVisible({ timeout: SLOW_RENDER_TIMEOUT });

  await bookStore.deleteAllBooksViaUi();

  await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(user.books).toEqual([]);
});

test('BookStoreDeleteAllBooks - clicking it with an already-empty collection is a safe no-op', { tag: '@flaky-site' }, async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;

  await bookStore.openProfileFromMenu();
  await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);

  await bookStore.deleteAllBooksViaUi();

  await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(user.books).toEqual([]);
});
