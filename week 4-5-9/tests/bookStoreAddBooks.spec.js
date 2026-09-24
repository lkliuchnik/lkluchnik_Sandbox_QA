const { test, expect } = require('../fixtures/app.fixture');
const { BookStorePage } = require('../pages/BookStorePage');

test('BookStoreAddBooks - all search results get added to the collection', { tag: '@flaky-site' }, async ({
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
