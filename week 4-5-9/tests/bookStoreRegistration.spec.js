const { test, expect } = require('../fixtures/app.fixture');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');
const { createUser } = require('../helpers/bookStoreApi');
const { httpStatus } = require('../test-data/httpStatus');
const { BookStorePage } = require('../pages/BookStorePage');

// demoqa.com's Profile page can be slow to render, so this check uses a longer timeout.
const SLOW_RENDER_TIMEOUT = 45_000;

// Creates a new user through the API, logs in with it through the UI, and checks that
// "My Books" starts empty.
//
// Precondition: apiUser creates a fresh, unique account through the API.
// Cleanup: apiUser deletes that account through the API, even if the test fails.
test('BookStoreRegistration - a freshly API-created user can log in via the UI with an empty collection', async ({
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

// Negative case: registering a username that already exists should fail - the API
// must reject it, not overwrite the existing account.
//
// Precondition: the shared defaultUser account already exists.
// Cleanup: none - no new account is created since the call fails.
test('BookStoreRegistration - registering an already-existing username via the API is rejected', async ({
  request,
}) => {
  const { status, body } = await createUser(request, bookStoreCredentials.defaultUser);

  expect(status).toBe(httpStatus.NOT_ACCEPTABLE);
  expect(body.message).toBe('User exists!');
});
