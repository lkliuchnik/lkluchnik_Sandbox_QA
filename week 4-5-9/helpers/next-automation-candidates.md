# What's worth automating next (a short backlog)

Ideas I jotted down while going through coverage but haven't turned into tests yet.
Roughly sorted by how much value they'd give for how little work - for the full
reasoning behind why these gaps exist in the first place, see `helpers/coverage-explanation.md`.

## P1 - cheap and immediately useful

1. **`GET /BookStore/v1/Book?ISBN=<doesn't exist>` should return `400`.** A plain API-contract check, no UI involved at all - closes the gap on one of the two BookStore GET endpoints nobody's touched yet.
2. **Call a protected endpoint with no token - should get `401`.** For example `DELETE /BookStore/v1/Books` with no `Authorization` header. Nobody's actually confirmed that auth is enforced rather than just quietly ignored by the server.
3. **Add the same ISBN twice in ONE `POST /BookStore/v1/Books` request.** The duplicate case is only checked through the UI right now (`bookStoreAddBookButton`) - worth knowing exactly how the API contract itself handles it.

## P2 - also worth doing, needs a bit more setup

4. **`PUT /BookStore/v1/Books/{isbn}` - replacing a book in the collection.** The one BookStore endpoint that's completely unused anywhere - not in a test, not in a UI flow.
5. **A dedicated test for `POST /Account/v1/Authorized`.** This quirk is already known (returns `404 "User not found!"` instead of `false` for a wrong password), but without a test it could quietly get "fixed" or break some other way and nobody would notice.
6. **The fields on the book details page** - rating, publisher, page count, description. The data's real and stable there, I just haven't gotten to it yet.

## P3 - can wait

7. **The UI registration form ("New User" on the login page).** Registration is only checked through the API right now; whether the UI form leads to the same result is genuinely unknown. Not urgent, since the API path is already covered.
8. **The "Delete Account" button on Profile.** It's destructive, so automating it without a disposable account (the way `apiUser` works) is risky - too easy to accidentally break the shared `defaultUser`.
9. **Pagination ("Previous"/"Next").** With only 8 books on one page right now, this check wouldn't prove anything - only makes sense once the demo catalog actually grows.
