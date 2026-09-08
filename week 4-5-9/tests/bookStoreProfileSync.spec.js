const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser, deleteAllBooksFromCollection } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

// Adds a book through the real UI, then checks with the API that it was really saved
// on the server - not just shown on screen. We check the API because the app's "My
// Books" list only reflects the current session and never reloads from the server, so
// a UI-only check would prove nothing (see docs/book-store-test-plan.md for details).
//
// Precondition: collection starts empty.
// Test data: a real catalog book with "JavaScript" in the title. We search the UI by
// its title, but check the result by ISBN, since ISBN is the real unique key and title
// text can differ slightly between UI and API.
// Cleanup: bookStoreCollection empties the collection again.
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

  await bookStore.openBookStoreFromMenu();
  await bookStore.searchAndWaitForResults(book.title);
  await bookStore.openBookByTitle(book.title);
  await bookStore.addCurrentBookToCollection();

  const { body: userAfterAdd } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  const ownedIsbns = userAfterAdd.books.map((b) => b.isbn);
  expect(ownedIsbns).toContain(book.isbn);

  await deleteAllBooksFromCollection(request, bookStoreCollection.userId, bookStoreCollection.token);

  const { body: userAfterCleanup } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  expect(userAfterCleanup.books).toEqual([]);
});
