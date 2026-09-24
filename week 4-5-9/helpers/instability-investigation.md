# Flaky case: `bookStoreRegistration.spec.js` - a missing timeout on a slow page

This one came up naturally, while reviewing a test that was already written - I wasn't
hunting for a bug on purpose, it just turned up.

## 1. Investigating it (following the 6.5.1 checklist order)

While reviewing `bookStoreRegistration.spec.js` I noticed this line:

```js
await bookStore.expectSearchResultsEmpty();
```

- called with no timeout. That looked off, because every other file in the project
that calls this same method on the Profile page passes `SLOW_RENDER_TIMEOUT`
(45 seconds). So I went through the checklist:

- **Locator correctness** - same locator as everywhere else, nothing wrong with it.
- **Trace/screenshots** - no recent failure of this specific test to look at.
- **Test data / environment state** - I went back through the project's run history
  (`test-results/` from earlier sessions) and actually found evidence: the
  `test-results/bookStoreDeleteAllBooks-...retry1/error-context.md` files showed this
  exact same method (`expectSearchResultsEmpty`) had already failed and needed a retry
  in a different file. So this wasn't a hypothetical risk, it was a problem the run
  history already confirmed.
- **Does it depend on prior state?** - no, the test is self-contained.

## 2. Root cause

The Profile page on `demoqa.com` renders unpredictably slowly - not something specific
to this test, it's just how that page behaves on the live site. Because of that, the
project already has an agreed-on pattern: every call to
`expectSearchResultsEmpty()` on that page gets an explicit `SLOW_RENDER_TIMEOUT =
45_000` instead of Playwright's much shorter default. In
`bookStoreRegistration.spec.js`, this one call just happened to be left without it - so
the problem isn't the test or the locator, it's that this one call fell out of sync
with the rest of the project.

## 3. The fix

```js
const SLOW_RENDER_TIMEOUT = 45_000;
...
await bookStore.expectSearchResultsEmpty(SLOW_RENDER_TIMEOUT);
```

## 4. Why this isn't a band-aid (hard wait/retry), but an actual root-cause fix

Worth being precise here: this is **not** `page.waitForTimeout(45000)`, a hard pause
that always blocks for the full 45 seconds no matter what the page is doing.
`expectSearchResultsEmpty` is a web-first assertion (`toHaveCount(0, { timeout })`) -
Playwright polls the page and returns as soon as the condition is actually true, so
the big number is only a ceiling, not a guaranteed delay. The test still finishes in a
fraction of a second whenever the page renders quickly.

And `45_000` isn't a number I picked out of thin air - it's the same value already
proven out and used consistently everywhere else in the project for this exact method
on this exact page. So the fix isn't quieting a symptom with a bigger number; it's
bringing one accidental exception in line with behavior the site already has, and
we've already measured.

## Before / after

| | Before | After |
|---|---|---|
| Timeout | Playwright's default (10s per this project's config) | 45s, same as everywhere else on this page |
| Risk | The test could fail on a slow Profile render even though the app was working correctly | The test waits as long as the page genuinely needs, and finishes early if it's already ready |
| Consistency with the rest of the project | The one exception among all the files | Same behavior as everywhere else |

## Why not one of the `test.fixme()` cases (bookStoreDeleteBook/DeleteAllBooks)

I looked hard at those two files during this same session, but they don't actually fit
as a Stage 4 example: that problem is a **deterministic bug** (books added via the API
never show up in the UI) - it fails the exact same way every single time, regardless of
timing or load. Stage 4 is specifically about **instability** - timing issues, weak
locators, state leakage - probabilistic failures, not something that's just broken
outright. So those two are a good example for "telling different kinds of problems
apart" in general, but not for "investigate a flaky test" specifically.

## Debugging workflow checklist (6.5.1) - as actually used

This is the order I actually followed during the session, not just for the case above
but also while digging into the search instability in `bookStoreAddBooks` and
`bookStoreProfileSync`: assertion message → is the locator even right → trace details →
screenshots/video → network/requests → test data/environment state → does it depend on
prior state. More than once, the failure screenshots confirmed the search result had
actually shown up correctly, just after the timeout had already fired - which is a
pretty clean example of using screenshots/video to tell "the test is wrong" apart from
"the site is just slow."
