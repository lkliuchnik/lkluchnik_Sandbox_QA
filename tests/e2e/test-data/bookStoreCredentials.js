const defaultUser = {
  userName: 'TestUser2',
  password: 'ABab123!',
};

const bookStoreCredentials = {
  defaultUser,
  invalidPassword: {
    userName: defaultUser.userName,
    password: 'WrongPass123!',
  },
  nonExistentUser: {
    userName: 'ghost_user_does_not_exist',
    password: 'AnyPass123!',
  },
};

// Unique credentials for tests that create/delete their own throwaway user via the API,
// so they never touch the shared defaultUser account.
function generateUniqueUser() {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  return {
    userName: `ApiUser_${suffix}`,
    password: 'ApiPass123!',
  };
}

module.exports = {
  bookStoreCredentials,
  generateUniqueUser,
};
