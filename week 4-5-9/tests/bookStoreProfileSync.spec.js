const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser, deleteAllBooksFromCollection } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

test('BookStoreProfileSync - a book added via the UI is confirmed server-side and removed via the API', async ({
  request,
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const searchText = 'JavaScript';

  const { body: catalog } = await getAllBooks(request);
  const book = catalog.books.find((b) => b.title.includes(searchText));
  expect(book, `No catalog book with "${searchText}" in the title`).toBeTruthy();

  await bookStore.searchAndOpenBook(book.title);
  await bookStore.addCurrentBookToCollection();

  const { body: userAfterAdd } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  const ownedIsbns = userAfterAdd.books.map((b) => b.isbn);
  expect(ownedIsbns).toContain(book.isbn);

  await deleteAllBooksFromCollection(request, bookStoreCollection.userId, bookStoreCollection.token);

  const { body: userAfterCleanup } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(userAfterCleanup.books).toEqual([]);
});
