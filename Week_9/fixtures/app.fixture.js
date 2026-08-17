const base = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { BookStorePage } = require('../pages/BookStorePage');
const { ElementsPage } = require('../pages/ElementsPage');
const { bookStoreCredentials } = require('../test-data/bookStoreCredentials');

const AD_DOMAINS = /googlesyndication|doubleclick|adtrafficquality|criteo|openx|adnxs|amazon-adsystem/;

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route(AD_DOMAINS, route => route.abort());
    await page.route('https://demoqa.com/**', async route => {
      if (route.request().resourceType() !== 'document') {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace(
        '</head>',
        '<style id="__pw-ad-block">.col-12.mt-4.col-md-3.col-xl-3:has(#RightSide_Advertisement),.col-12.mt-4.col-md-3.col-xl-3:has(#BottomAds){display:none!important;pointer-events:none!important}</style></head>'
      );
      await route.fulfill({ response, body });
    });
    await use(page);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  bookStorePage: async ({ page }, use) => {
    await use(new BookStorePage(page));
  },

  elementsPage: async ({ page }, use) => {
    await use(new ElementsPage(page));
  },

  credentials: async ({}, use) => {
    await use(bookStoreCredentials.defaultUser);
  },

  bookStoreLandingPage: async ({ homePage, bookStorePage }, use) => {
    await homePage.open();
    await homePage.expectSeleniumOnlineTrainingVisible();
    await homePage.openBookStoreApplication();
    await use(bookStorePage);
  },

  elementsLandingPage: async ({ homePage, elementsPage }, use) => {
    await homePage.open();
    await homePage.expectSeleniumOnlineTrainingVisible();
    await homePage.openElementsSection();
    await use(elementsPage);
  },

  loggedInBookStore: async ({ bookStoreLandingPage, credentials }, use) => {
    await bookStoreLandingPage.loginAs(credentials.userName, credentials.password);
    await bookStoreLandingPage.expectUserName(credentials.userName);
    await bookStoreLandingPage.expectLogoutVisible();
    await use(bookStoreLandingPage);
  },
});


module.exports = {
  test,
  expect: base.expect,
};
