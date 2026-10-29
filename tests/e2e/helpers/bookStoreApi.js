const { generateUniqueUser } = require('../test-data/bookStoreCredentials');

async function readBody(response) {
  const rawBody = await response.text();
  return rawBody ? JSON.parse(rawBody) : null;
}

async function postCredentials(request, path, { userName, password }) {
  const response = await request.post(path, {
    data: { userName, password },
  });
  return { status: response.status(), body: await readBody(response) };
}

async function login(request, credentials) {
  return postCredentials(request, '/Account/v1/Login', credentials);
}

async function generateToken(request, credentials) {
  return postCredentials(request, '/Account/v1/GenerateToken', credentials);
}

// Not used by any test yet - keeping it ready for whenever someone writes a test
// for this endpoint's quirk: it returns 404 "User not found!" instead of false
// for a wrong password.
async function isAuthorized(request, credentials) {
  return postCredentials(request, '/Account/v1/Authorized', credentials);
}

async function createUser(request, credentials) {
  return postCredentials(request, '/Account/v1/User', credentials);
}

async function deleteUser(request, userId, token) {
  const response = await request.delete(`/Account/v1/User/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: response.status() };
}

// Creates one fresh, unique account through the API and returns its credentials plus
// the ids needed for later API calls (userId, token).
async function createApiAccount(request) {
  const credentials = generateUniqueUser();
  const { body: created } = await createUser(request, credentials);
  const { body: tokenBody } = await generateToken(request, credentials);
  return { ...credentials, userId: created.userID, token: tokenBody.token };
}

async function getUser(request, userId, token) {
  const response = await request.get(`/Account/v1/User/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: response.status(), body: await readBody(response) };
}

async function getAllBooks(request) {
  const response = await request.get('/BookStore/v1/Books');
  return { status: response.status(), body: await readBody(response) };
}

async function addBooksToCollection(request, { userId, isbns }, token) {
  const response = await request.post('/BookStore/v1/Books', {
    data: { userId, collectionOfIsbns: isbns.map((isbn) => ({ isbn })) },
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: response.status(), body: await readBody(response) };
}

async function deleteBookFromCollection(request, { isbn, userId }, token) {
  const response = await request.delete('/BookStore/v1/Book', {
    data: { isbn, userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: response.status(), body: await readBody(response) };
}

// UserId must be sent as a query param here (not a body field) - the API rejects it otherwise.
async function deleteAllBooksFromCollection(request, userId, token) {
  const response = await request.delete('/BookStore/v1/Books', {
    params: { UserId: userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: response.status() };
}

module.exports = {
  login,
  generateToken,
  isAuthorized,
  createUser,
  deleteUser,
  createApiAccount,
  getUser,
  getAllBooks,
  addBooksToCollection,
  deleteBookFromCollection,
  deleteAllBooksFromCollection,
};
