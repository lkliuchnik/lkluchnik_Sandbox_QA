async function getUserIdAndToken(request, userName, password) {
  const response = await request.post('/Account/v1/Login', {
    data: { userName, password },
  });
  const body = await response.json();
  return { userId: body.userId, token: body.token };
}

async function getUserBooks(request, userId, token) {
  const response = await request.get(`/Account/v1/User/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json();
  return body.books || [];
}

async function deleteAllUserBooks(request, userId, token) {
  await request.delete('/BookStore/v1/Books', {
    headers: { Authorization: `Bearer ${token}` },
    data: { userId },
  });
}

module.exports = {
  getUserIdAndToken,
  getUserBooks,
  deleteAllUserBooks,
};
