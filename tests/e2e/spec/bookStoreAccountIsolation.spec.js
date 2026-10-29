const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, getUser, createApiAccount, deleteApiAccount } = require('../helpers/bookStoreApi');
const { BookStorePage } = require('../pages/BookStorePage');

const { SLOW_RENDER_TIMEOUT } = BookStorePage;

test("BookStoreAccountIsolation - one account's books do not show up for another account", { tag: '@flaky-site' }, async ({
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
    await bookStore.expectUserName(userA.userName);
    await bookStore.searchAndOpenBook(book.title);
    await bookStore.addCurrentBookToCollection();

    await bookStore.clickLogout();

    await bookStore.loginAs(userB.userName, userB.password);
    await bookStore.expectUserName(userB.userName);
    await bookStore.openProfileFromMenu();
    await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);

    const { body: userBData } = await getUser(request, userB.userId, await bookStore.getSessionToken());
    expect(userBData.books).toEqual([]);
  } finally {
    await deleteApiAccount(request, userA);
    await deleteApiAccount(request, userB);
  }
});
