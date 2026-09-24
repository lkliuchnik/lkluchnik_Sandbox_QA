const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser, deleteUser, createApiAccount } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

const { SLOW_RENDER_TIMEOUT } = BookStorePage;

test("BookStoreAccountIsolation - one account's books do not show up for another account", async ({
  request,
  bookStoreLandingPage,
}) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;

  const userA = await createApiAccount(request);
  const userB = await createApiAccount(request);

  try {
    const { body: catalog } = await getAllBooks(request);
    const [book] = catalog.books;

    await bookStore.loginAs(userA.userName, userA.password);
    await bookStore.searchAndOpenBook(book.title);
    await bookStore.addCurrentBookToCollection();

    await bookStore.clickLogout();

    await bookStore.loginAs(userB.userName, userB.password);
    await bookStore.openProfileFromMenu();
    await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);

    const { body: userBData } = await getUser(request, userB.userId, userB.token);
    expect(userBData.books).toEqual([]);
  } finally {
    await deleteUser(request, userA.userId, userA.token);
    await deleteUser(request, userB.userId, userB.token);
  }
});
