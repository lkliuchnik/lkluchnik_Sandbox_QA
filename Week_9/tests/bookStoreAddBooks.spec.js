const { test } = require('../fixtures/app.fixture');
const { BookStorePage } = require('../pages/BookStorePage');
const { getUserIdAndToken, getUserBooks, deleteAllUserBooks } = require('../helpers/bookStoreApi');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');

test('BookStoreAddBooks', async ({ loggedInBookStore, request }) => {
  /** @type {BookStorePage} */
  const bookStore = loggedInBookStore;
  const searchText = 'JavaScript';
  const { userName, password } = bookStoreCredentials.defaultUser;

  // check if user already has books, and if so, delete them via API
  const { userId, token } = await getUserIdAndToken(request, userName, password);
  const existingBooks = await getUserBooks(request, userId, token);

  if (existingBooks.length > 0) {
    await deleteAllUserBooks(request, userId, token);
  }

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
