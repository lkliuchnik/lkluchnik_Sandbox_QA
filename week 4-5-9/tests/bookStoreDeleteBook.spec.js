const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, addBooksToCollection, getUser } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

// demoqa.com's Profile page can be slow to render, so UI checks here use a longer timeout.
const SLOW_RENDER_TIMEOUT = 45_000;

// Checks that the "Delete" icon next to one book removes only that book, not the
// others. Different from the bulk cleanup helper, which other tests use just for setup.
//
// KNOWN BUG, confirmed by running this test: the line below that waits for
// deleteBookButton to appear always fails (45s timeout, "element(s) not found"). The
// books ARE saved correctly on the server (checked directly via the API), but the
// Profile page never shows books that were added outside the browser's own session -
// see the "Знахідки під час реалізації" section of docs/book-store-test-plan.md. Since
// this test adds books through the API (line below), they can never show up here. This
// is not flakiness - it fails the same way every time. Fixing it would mean adding the
// books through the real "Add To Your Collection" UI popup instead of the API.
//
// Precondition: collection starts empty, then two real catalog books are added
// through the API.
// Test data: first two books from GET /BookStore/v1/Books.
// Cleanup: bookStoreCollection empties the collection again.
test('BookStoreDeleteBook - deleting one book removes only that book', async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
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

// Edge case: deleting the only book in the collection should leave the profile truly
// empty - no leftover row, no broken table.
//
// KNOWN BUG, same as the test above: the line below that waits for deleteBookButton to
// appear always fails, because the book was added through the API and never shows up
// in the browser's own Profile list (see the note above and
// docs/book-store-test-plan.md, "Знахідки під час реалізації"). Not flaky - fails the
// same way every run.
//
// Precondition: collection starts empty, then one real catalog book is added through the API.
// Cleanup: bookStoreCollection empties the collection again.
test('BookStoreDeleteBook - deleting the only book empties the profile', async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
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
