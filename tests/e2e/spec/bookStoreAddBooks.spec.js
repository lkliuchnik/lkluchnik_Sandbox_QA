const { test } = require('../fixtures/app.fixture');
const { BookStorePage } = require('../pages/BookStorePage');

test('BookStoreAddBooks', async ({ loggedInBookStore }) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const searchText = 'JavaScript';

  await bookStore.openBookStoreFromMenu();
  await bookStore.searchBooks(searchText);
  await bookStore.clickSearchButton();

  const booksToAdd = await bookStore.getSearchResultBookTitles();

  if (booksToAdd.length === 0) {
    await bookStore.expectSearchResultsEmpty();
    //if not books found we just return from the test
    return;
  }

  for (const bookTitle of booksToAdd) {
    await bookStore.openBookByTitle(bookTitle);
    await bookStore.addCurrentBookToCollection();
  }

  await bookStore.openProfileFromMenu();
  await bookStore.searchBooks(searchText);
  await bookStore.clickSearchButton();
  await bookStore.expectSearchResultsMatchTitlesAndCount(booksToAdd);
});
