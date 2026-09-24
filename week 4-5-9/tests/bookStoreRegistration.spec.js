const { test, expect } = require('../fixtures/app.fixture');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');
const { createUser } = require('../helpers/bookStoreApi');
const { httpStatus } = require('../test-data/httpStatus');
const { BookStorePage } = require('../pages/BookStorePage');

const { SLOW_RENDER_TIMEOUT } = BookStorePage;

test('BookStoreRegistration - a freshly API-created user can log in via the UI with an empty collection', { tag: '@flaky-site' }, async ({
  bookStoreLandingPage,
  apiUser,
}) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;

  await bookStore.loginAs(apiUser.userName, apiUser.password);
  await bookStore.expectUserName(apiUser.userName);
  await bookStore.expectLogoutVisible();

  await bookStore.openProfileFromMenu();
  await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);
});

test('BookStoreRegistration - registering an already-existing username via the API is rejected', async ({
  request,
}) => {
  const { status, body } = await createUser(request, bookStoreCredentials.defaultUser);

  expect(status).toBe(httpStatus.NOT_ACCEPTABLE);
  expect(body.message).toBe('User exists!');
});

test('BookStoreRegistration - a duplicate name fails, then a fresh unique name works', { tag: '@flaky-site' }, async ({
  request,
  bookStoreLandingPage,
  apiUser,
}) => {
  /** @type {BookStorePage} */
  const bookStore = bookStoreLandingPage;

  const { status, body } = await createUser(request, bookStoreCredentials.defaultUser);
  expect(status).toBe(httpStatus.NOT_ACCEPTABLE);
  expect(body.message).toBe('User exists!');

  await bookStore.loginAs(apiUser.userName, apiUser.password);
  await bookStore.expectUserName(apiUser.userName);
  await bookStore.expectLogoutVisible();

  await bookStore.openProfileFromMenu();
  await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);
});
