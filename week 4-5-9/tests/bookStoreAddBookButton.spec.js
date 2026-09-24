const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser } = require('../helpers/bookStoreApi');
const { appMessages } = require('../test-data/appMessages');
const { BookStorePage } = require('../pages/BookStorePage');

test('BookStoreAddBookButton - adding a book persists it via the API', { tag: '@flaky-site' }, async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const { body: catalog } = await getAllBooks(request);
  const [book] = catalog.books;
  await bookStore.searchAndOpenBook(book.title);

  await bookStore.addCurrentBookToCollection();

  await expect.poll(() => bookStore.lastAddToCollectionMessage).toContain(appMessages.BOOK_ADDED);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  const ownedIsbns = user.books.map((b) => b.isbn);
  expect(ownedIsbns).toContain(book.isbn);
});

test('BookStoreAddBookButton - adding the same book twice reports it as already present', { tag: '@flaky-site' }, async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const { body: catalog } = await getAllBooks(request);
  const [book] = catalog.books;
  await bookStore.searchAndOpenBook(book.title);

  await bookStore.addCurrentBookToCollection();
  await expect.poll(() => bookStore.lastAddToCollectionMessage).toContain(appMessages.BOOK_ADDED);

  await bookStore.addCurrentBookToCollection();
  await expect.poll(() => bookStore.lastAddToCollectionMessage).toContain(appMessages.BOOK_ALREADY_PRESENT);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(user.books.filter((b) => b.isbn === book.isbn)).toHaveLength(1);
});
