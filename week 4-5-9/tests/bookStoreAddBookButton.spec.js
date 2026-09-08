const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

// Finds the first catalog book, then searches for it and opens its book page in the UI.
// Returns the book so the test can check its ISBN afterwards.
async function openFirstCatalogBook(request, bookStore) {
  const { body: catalog } = await getAllBooks(request);
  const [book] = catalog.books;

  await bookStore.openBookStoreFromMenu();
  await bookStore.searchAndWaitForResults(book.title);
  await bookStore.openBookByTitle(book.title);

  return book;
}

// Checks that clicking "Add To Your Collection" for one book works. Kept separate
// from the bigger multi-book test in bookStoreAddBooks.
//
// Precondition: collection starts empty (bookStoreCollection).
// Test data: first book from GET /BookStore/v1/Books, so it always matches real app data.
// Cleanup: bookStoreCollection empties the collection again.
test('BookStoreAddBookButton - adding a book persists it via the API', async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const book = await openFirstCatalogBook(request, bookStore);

  await bookStore.addCurrentBookToCollection();

  await expect.poll(() => bookStore.lastAddToCollectionMessage).toContain('Book added to your collection');

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  const ownedIsbns = user.books.map((b) => b.isbn);
  expect(ownedIsbns).toContain(book.isbn);
});

// Negative case: clicking "Add To Your Collection" twice for the same book should not
// add a duplicate - the app should say the book is already in the collection.
//
// Precondition: collection starts empty (bookStoreCollection).
// Cleanup: bookStoreCollection empties the collection again.
test('BookStoreAddBookButton - adding the same book twice reports it as already present', async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const book = await openFirstCatalogBook(request, bookStore);

  await bookStore.addCurrentBookToCollection();
  await expect.poll(() => bookStore.lastAddToCollectionMessage).toContain('Book added to your collection');

  await bookStore.addCurrentBookToCollection();
  await expect.poll(() => bookStore.lastAddToCollectionMessage).toContain('already present in the your collection');

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(user.books.filter((b) => b.isbn === book.isbn)).toHaveLength(1);
});
