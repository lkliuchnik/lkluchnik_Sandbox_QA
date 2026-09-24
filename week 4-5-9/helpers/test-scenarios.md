# Test scenarios

This file collects the descriptions that used to live as comments directly above each
test. Organized by test file, then by test name (matching the exact string passed to
`test(...)`), so it's easy to find which note belongs to which test.

## bookStoreAccountIsolation.spec.js

### "BookStoreAccountIsolation - one account's books do not show up for another account"

Checks that books added to one account never show up for another account. User A adds
a book through the real "Add To Your Collection" popup, then user B logs in and should
see an empty "My Books" list - both in the UI and on the server.

- Precondition: creates two fresh, unique accounts (A and B) through the API.
- Test data: first catalog book from GET /BookStore/v1/Books.
- Cleanup: deletes both accounts through the API, even if the test fails.

**STATUS (temporary note - remove once this passes live on a good day for demoqa.com):**
Runs so far: 5, spread across a few separate check-ins. Every single run failed at the
same spot - user A's `searchAndWaitForResults()` call - because of demoqa.com's
already-documented slow search rendering. None of
the runs got far enough to reach user B's login or the actual isolation check, so that
part of the test is still unconfirmed by a live pass. One thing that IS guaranteed no
matter how demoqa.com behaves: cleanup. Both accounts are deleted in the `finally`
block, so they get removed even when the test fails early - that's a plain JavaScript
guarantee, not something that depends on the site.

## bookStoreAddBookButton.spec.js

### "BookStoreAddBookButton - adding a book persists it via the API"

Checks that clicking "Add To Your Collection" for one book works. Kept separate from
the bigger multi-book test in `bookStoreAddBooks.spec.js`.

- Precondition: collection starts empty (`bookStoreCollection`).
- Test data: first book from GET /BookStore/v1/Books, so it always matches real app data.
- Cleanup: `bookStoreCollection` empties the collection again.

### "BookStoreAddBookButton - adding the same book twice reports it as already present"

Negative case: clicking "Add To Your Collection" twice for the same book should not add
a duplicate - the app should say the book is already in the collection.

- Precondition: collection starts empty (`bookStoreCollection`).
- Cleanup: `bookStoreCollection` empties the collection again.

## bookStoreAddBooks.spec.js

### "BookStoreAddBooks - all search results get added to the collection"

Checks that searching for "JavaScript" and adding every result works, and that the same
books show up afterwards in the profile.

- Precondition: `bookStoreCollection` empties the shared account's collection first, so
  results don't depend on what a previous run left behind.
- Cleanup: the same fixture empties it again.

## bookStoreCollectionApi.spec.js

### "BookStoreCollectionApi - books added via the API are persisted and retrievable via the API"

Adds books through the API, then checks with the API that they were really saved. We
add through the API instead of the "Add To Your Collection" popup because it's faster
and more stable for setup, and we verify through the API instead of the browser because
the app's "My Books" list never reloads from the server - a book added through the API
would never show up in the UI even though it's really saved.

- Precondition: `bookStoreCollection` empties the shared account's collection.
- Cleanup: `bookStoreCollection` empties it again.

### "BookStoreCollectionApi - deleting an ISBN the account does not own is rejected"

Negative case: deleting a book (by ISBN) that the account does not own should be
rejected by the API.

- Precondition: collection starts empty, so no book is owned - any catalog ISBN counts
  as "not owned" here.
- Cleanup: `bookStoreCollection` empties the collection again.

## bookStoreDeleteAccount.spec.js

### "BookStoreDeleteAccount - a deleted account can no longer log in"

Full lifecycle of one account: create it, use it (log in, add a book, confirm it
saved), delete it, then try to log in with the same username and password again. A
deleted account should not work anymore - the login form should show the same error as
any other wrong login (checked manually: the API itself returns 200 with an empty body
for a deleted user's login, not a clear error - only the UI turns that into a proper
"Invalid username or password!" message).

- Precondition: `apiUser` creates a fresh, unique account through the API.
- Test data: first book from GET /BookStore/v1/Books.
- Cleanup: none needed - the test deletes the account itself. `apiUser` tries to delete
  it again afterwards, but that is harmless since the account is already gone.

**STATUS (temporary note - remove once this passes live on a good day for demoqa.com):**
What was checked by hand before writing this test: DELETE on the account returns 204.
Logging in again with the same credentials afterwards gets a 200 with an empty body
from the API (not a clean error), but the UI still shows the normal "Invalid username
or password!" message. So the assertions in the test match how the app really behaves,
not a guess. Runs so far: 6, spread across a few separate check-ins. Every run failed at
the same spot - `searchAndWaitForResults()` - because of demoqa.com's already-documented
slow search rendering. Failure screenshots showed
the search did eventually find the right book each time, just after the 45s timeout.
None of the runs reached the account-deletion or re-login part of the test, so that part
is still unconfirmed by a live pass - only by the manual checks above.

## bookStoreDeleteAllBooks.spec.js

*File-level note: demoqa.com's Profile page can be slow to render, so UI checks in this
file use a longer timeout (`SLOW_RENDER_TIMEOUT = 45_000`).*

### "BookStoreDeleteAllBooks - clicking Delete All Books empties the collection"

Checks that "Delete All Books" on the Profile page removes every book. Different from
the per-row "Delete" icon (`bookStoreDeleteBook.spec.js`) and from the API-only bulk
cleanup helper other tests use just for setup.

**KNOWN BUG** (this is why the test is marked with `test.fixme()`), confirmed by running
this test: the line that waits for `deleteBookButton` to appear always fails (45s
timeout, "element(s) not found"). The books ARE saved correctly on the server (checked
directly via the API), but the Profile page never shows books that were added outside
the browser's own session. Since this test adds books through the API, they can
never show up here. This is not flakiness - it fails the same way every time. Fixing it
would mean adding the books through the real "Add To Your Collection" UI popup instead
of the API.

- Precondition: collection starts empty, then a few real catalog books are added
  through the API (fast and stable - this test is about the button, not the setup).
- Test data: first three books from GET /BookStore/v1/Books.
- Cleanup: `bookStoreCollection` empties the collection again (redundant here, but keeps
  the same safety net as every other test).

### "BookStoreDeleteAllBooks - clicking it with an already-empty collection is a safe no-op"

Edge case: clicking "Delete All Books" on an already-empty collection should do nothing
- no error, no crash.

- Precondition: collection starts empty.
- Cleanup: empties it again (no-op, but consistent).

## bookStoreDeleteBook.spec.js

*File-level note: demoqa.com's Profile page can be slow to render, so UI checks in this
file use a longer timeout (`SLOW_RENDER_TIMEOUT = 45_000`).*

### "BookStoreDeleteBook - deleting one book removes only that book"

Checks that the "Delete" icon next to one book removes only that book, not the others.
Different from the bulk cleanup helper, which other tests use only for setup.

**KNOWN BUG** (this is why the test is marked with `test.fixme()`), confirmed by running
this test: the line that waits for `deleteBookButton` to appear always fails (45s
timeout, "element(s) not found"). The books ARE saved correctly on the server (checked
directly via the API), but the Profile page never shows books that were added outside
the browser's own session. Since this test adds books through the API, they can
never show up here. This is not flakiness - it fails the same way every time. Fixing it
would mean adding the books through the real "Add To Your Collection" UI popup instead
of the API.

- Precondition: collection starts empty, then two real catalog books are added through
  the API.
- Test data: first two books from GET /BookStore/v1/Books.
- Cleanup: `bookStoreCollection` empties the collection again.

### "BookStoreDeleteBook - deleting the only book empties the profile"

Edge case: deleting the only book in the collection should leave the profile truly
empty - no leftover row, no broken table.

**KNOWN BUG**, same as the test above (this is why it's marked with `test.fixme()`): the
line that waits for `deleteBookButton` to appear always fails, because the book was
added through the API and never shows up in the browser's own Profile list. Not flaky -
fails the same way every run.

- Precondition: collection starts empty, then one real catalog book is added through
  the API.
- Cleanup: `bookStoreCollection` empties the collection again.

## bookStoreLogin.spec.js

### "BookStoreLogin - valid credentials log the user in"

Checks that logging in with valid credentials works: the username shows up in the
header and the Logout button appears.

- Precondition: none.
- Cleanup: none - logging in does not create or change any account.

### "BookStoreLogin - the book store menu shows all navigation items"

Checks that before logging in, the side menu shows all navigation items. Kept as its
own test so a menu change doesn't look like a login bug, and a login bug doesn't hide a
menu problem.

- Precondition: none.
- Cleanup: none.

### "BookStoreLogin - wrong password is rejected with an error"

Negative case: the login form should show a clear error for bad credentials (wrong
password, unknown username) instead of failing silently or letting the user in.

- Precondition: none.
- Cleanup: none - no account is created or changed.

### "BookStoreLogin - unknown username is rejected with an error"

Same negative case as above, but with a username that does not exist at all.

## bookStoreLogout.spec.js

### "BookStoreLogout"

Checks that clicking Logout signs the user out and shows the Login screen again.

- Precondition: none - `loggedInBookStore` just logs in first.
- Cleanup: none - logging out does not create or change any account.

## bookStoreProfileSync.spec.js

### "BookStoreProfileSync - a book added via the UI is confirmed server-side and removed via the API"

Adds a book through the real UI, then checks with the API that it was really saved on
the server - not just shown on screen. We check the API because the app's "My Books"
list only reflects the current session and never reloads from the server, so a UI-only
check would prove nothing.

- Precondition: collection starts empty.
- Test data: a real catalog book with "JavaScript" in the title. We search the UI by
  its title, but check the result by ISBN, since ISBN is the real unique key and title
  text can differ slightly between UI and API.
- Cleanup: `bookStoreCollection` empties the collection again.

## bookStoreRegistration.spec.js

*File-level note: demoqa.com's Profile page can be slow to render, so checks in this
file use a longer timeout (`SLOW_RENDER_TIMEOUT = 45_000`).*

### "BookStoreRegistration - a freshly API-created user can log in via the UI with an empty collection"

Creates a new user through the API, logs in with it through the UI, and checks that "My
Books" starts empty.

- Precondition: `apiUser` creates a fresh, unique account through the API.
- Cleanup: `apiUser` deletes that account through the API, even if the test fails.

### "BookStoreRegistration - registering an already-existing username via the API is rejected"

Negative case: registering a username that already exists should fail - the API must
reject it, not overwrite the existing account.

- Precondition: the shared `defaultUser` account already exists.
- Cleanup: none - no new account is created since the call fails.

### "BookStoreRegistration - a duplicate name fails, then a fresh unique name works"

Registering an already-taken username fails, then registering right after with a fresh
unique username works and logs the user in normally.

- Precondition: the shared `defaultUser` account already exists (for the failed
  attempt). `apiUser` creates a separate, unique account through the API for the
  successful part.
- Cleanup: `apiUser` deletes its account through the API, even if the test fails. The
  failed attempt above creates nothing, so there's nothing else to clean up.
