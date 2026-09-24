const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, addBooksToCollection, getUser } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

const { SLOW_RENDER_TIMEOUT } = BookStorePage;

test('BookStoreDeleteBook - deleting one book removes only that book', { tag: '@flaky-site' }, async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  test.fixme(true, 'Adds books via API, then waits for them in the UI - the UI never shows them. See the comment above.');

  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const { body: catalog } = await getAllBooks(request);
  const [bookToDelete, bookToKeep] = catalog.books;

  await addBooksToCollection(
    request,
    { userId: bookStoreCollection.userId, isbns: [bookToDelete.isbn, bookToKeep.isbn] },
    bookStoreCollection.token,
  );

  await bookStore.openProfileFromMenu();
  await expect(bookStore.deleteBookButton(bookToDelete.isbn)).toBeVisible({ timeout: SLOW_RENDER_TIMEOUT });

  await bookStore.deleteBookByIsbn(bookToDelete.isbn);

  await bookStore.expectBookHiddenInSearchResults(bookToDelete.title, SLOW_RENDER_TIMEOUT);
  await bookStore.expectBookVisibleInSearchResults(bookToKeep.title);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  const ownedIsbns = user.books.map((b) => b.isbn);
  expect(ownedIsbns).not.toContain(bookToDelete.isbn);
  expect(ownedIsbns).toContain(bookToKeep.isbn);
});

test('BookStoreDeleteBook - deleting the only book empties the profile', { tag: '@flaky-site' }, async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  test.fixme(true, 'Adds a book via API, then waits for it in the UI - the UI never shows it. See the comment above.');

  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const { body: catalog } = await getAllBooks(request);
  const [book] = catalog.books;

  await addBooksToCollection(request, { userId: bookStoreCollection.userId, isbns: [book.isbn] }, bookStoreCollection.token);

  await bookStore.openProfileFromMenu();
  await expect(bookStore.deleteBookButton(book.isbn)).toBeVisible({ timeout: SLOW_RENDER_TIMEOUT });

  await bookStore.deleteBookByIsbn(book.isbn);

  await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(user.books).toEqual([]);
});
