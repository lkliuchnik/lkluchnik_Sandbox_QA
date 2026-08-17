const { test } = require('../fixtures/app.fixture');

test('BookStoreLogin', async ({ bookStoreLandingPage, credentials }) => {
  await bookStoreLandingPage.expectMenuExpandedWithItems([
    'Login',
    'Book Store',
    'Profile',
    'Book Store API',
  ]);

  await bookStoreLandingPage.loginAs(credentials.userName, credentials.password);
  await bookStoreLandingPage.expectUserName(credentials.userName);
  await bookStoreLandingPage.expectLogoutVisible();
});
