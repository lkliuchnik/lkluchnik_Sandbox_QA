const { test, expect } = require('../fixtures/app.fixture');
const { BookStorePage } = require('../pages/BookStorePage');

// Checks that searching for "JavaScript" and adding every result works, and that the
// same books show up afterwards in the profile.
//
// Precondition: bookStoreCollection empties the shared account's collection first, so
// results don't depend on what a previous run left behind.
// Cleanup: the same fixture empties it again.
test('BookStoreAddBooks - all search results get added to the collection', async ({
  loggedInBookStore,
  bookStoreCollection,
}) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const searchText = 'JavaScript';

  await bookStore.openBookStoreFromMenu();
  await bookStore.searchAndWaitForResults(searchText);

  const booksToAdd = await bookStore.getVisibleBookTitles();
  expect(booksToAdd.length).toBeGreaterThan(0);

  for (const bookTitle of booksToAdd) {
    await bookStore.openBookByTitle(bookTitle);
    await bookStore.addCurrentBookToCollection();
  }

  await bookStore.openProfileFromMenu();
  await bookStore.searchAndWaitForResults(searchText);
  await bookStore.expectSearchResultsMatchTitlesAndCount(booksToAdd);
});
