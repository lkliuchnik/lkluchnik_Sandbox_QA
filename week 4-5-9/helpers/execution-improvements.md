# Execution improvements: faster feedback, easier triage

I ran this suite many times while working on it, and a pretty clear split showed up
between two groups of tests:

- The pure API tests (`bookStoreLogin.spec.js`, `bookStoreCollectionApi.spec.js`,
  `bookStoreRegistration.spec.js`) are fast and boringly reliable - full runs land in
  roughly 7-15 seconds and I never once saw one fail on its own.
- The UI tests that call `searchAndWaitForResults()` (`bookStoreAddBooks.spec.js`,
  `bookStoreProfileSync.spec.js`, `bookStoreDeleteAccount.spec.js`,
  `bookStoreAccountIsolation.spec.js`) are the opposite: slow (they can eat the whole
  45s timeout) and unpredictable, because demoqa.com's own search rendering is
  unstable. That's on the site, not on the tests (I ran into this exact thing while
  chasing down a flaky run - see `helpers/instability-investigation.md`).
- Meanwhile `playwright.config.js` has `workers: 1` for the entire suite, so
  everything runs strictly one after another - the fast, reliable tests included.
  They just sit there waiting behind the slow ones for no real reason.

## Why that's annoying in practice

One slow, flaky test anywhere in the run can drag the whole suite out to several
minutes and end in a failure that has nothing to do with an actual code problem.
Whoever's looking at a red CI run then has to manually work out "is this the known
demoqa.com search thing again, or did I actually break something?" - right now there's
no signal for that beyond reading the failure message and recognizing the pattern.

## Suggested improvements

1. **Separate fast/stable tests from slow/flaky ones**, for example with two Playwright
   projects (or a tag like `@flaky-site` on the affected tests, filtered with
   `--grep`/`--grep-invert`). The fast lane (pure API tests) can run first and report
   in seconds; the slow lane (search-dependent UI tests) runs separately and its
   failures are immediately understood as "check the known demoqa.com issue first,"
   not "something is broken."

2. **Raise `workers` for the fast lane.** `workers: 1` makes sense for the flaky UI
   tests (avoids piling up unstable browser sessions), but the pure API tests have no
   such constraint and could run in parallel for quicker feedback.

3. **Point first responders at the answer immediately.** The root cause of the slow
   lane's flakiness is already written up (`helpers/instability-investigation.md`). A
   one-line note in the CI job output or PR check description linking straight there
   would save someone from re-diagnosing a problem that's already solved.

4. **Keep relying on the existing failure artifacts** (`trace: 'on-first-retry'`,
   `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`) - they already give
   enough evidence to tell "the search was just slow" (screenshot shows the right book
   eventually rendered) apart from "the app is actually broken" (screenshot shows
   something genuinely wrong). No change needed here, just worth keeping as-is.
