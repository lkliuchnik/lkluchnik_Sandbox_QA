const { test, expect } = require('../fixtures/app.fixture');
const { getAllBooks, addBooksToCollection, getUser, deleteBookFromCollection } = require('../helpers/bookStoreApi');
const { httpStatus } = require('../test-data/httpStatus');

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
