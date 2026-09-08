const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, addBooksToCollection, getUser, deleteBookFromCollection } = require('../helpers/bookStoreApi');
const { httpStatus } = require('../test-data/httpStatus');

// Adds books through the API, then checks with the API that they were really saved.
// We add through the API instead of the "Add To Your Collection" popup because it's
// faster and more stable for setup, and we verify through the API instead of the
// browser because the app's "My Books" list never reloads from the server - a book
// added through the API would never show up in the UI even though it's really saved
// (see docs/book-store-test-plan.md for details).
//
// Precondition: bookStoreCollection empties the shared account's collection.
// Cleanup: bookStoreCollection empties it again.
test('BookStoreCollectionApi - books added via the API are persisted and retrievable via the API', async ({
  request,
  bookStoreCollection,
}) => {
  const { body: catalog } = await getAllBooks(request);
  const [firstBook, secondBook] = catalog.books;

  const { status } = await addBooksToCollection(
    request,
    { userId: bookStoreCollection.userId, isbns: [firstBook.isbn, secondBook.isbn] },
    bookStoreCollection.token,
  );
  expect(status).toBe(httpStatus.CREATED);

  const { body: user } = await getUser(request, bookStoreCollection.userId, bookStoreCollection.token);
  const ownedIsbns = user.books.map((book) => book.isbn);
  expect(ownedIsbns).toContain(firstBook.isbn);
  expect(ownedIsbns).toContain(secondBook.isbn);
});

// Negative case: deleting a book (by ISBN) that the account does not own should be
// rejected by the API.
//
// Precondition: collection starts empty, so no book is owned - any catalog ISBN
// counts as "not owned" here.
// Cleanup: bookStoreCollection empties the collection again.
test('BookStoreCollectionApi - deleting an ISBN the account does not own is rejected', async ({
  request,
  bookStoreCollection,
}) => {
  const { body: catalog } = await getAllBooks(request);
  const unownedIsbn = catalog.books[0].isbn;

  const { status, body } = await deleteBookFromCollection(
    request,
    { isbn: unownedIsbn, userId: bookStoreCollection.userId },
    bookStoreCollection.token,
  );

  expect(status).toBe(httpStatus.BAD_REQUEST);
  expect(body.message).toBe("ISBN supplied is not available in User's Collection!");
});
