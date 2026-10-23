# CLAUDE.md

Project context for Claude Code. Read this before making changes.

## What this is

**Clubhouse Golf Handicap Tracker**: a single-page web app that tracks a golfer's
WHS (World Handicap System) Handicap Index. It's a personal app for Pacific Northwest /
Portland-area courses, used on desktop and on a phone ("Add to Home Screen").

- Live via **GitHub Pages** from `https://github.com/interesanted/Golf-Handicap-App` (branch `master`).
- See `README.md` for user-facing setup (Pages hosting, GitHub PAT sync).

## Tech stack & constraints

- **Plain HTML + vanilla JS + vanilla CSS.** No framework, no bundler, no `package.json`, no build step.
- Only external dependencies are loaded from CDN in `index.html`: **Chart.js** (jsdelivr) and
  Google Fonts (**Outfit**, **Playfair Display**).
- Everything is global scope. `app.js` and `tests.js` share globals (tests call app functions directly).
- Keep it that way unless asked: the app must keep working by double-clicking `index.html`
  and by being served statically from GitHub Pages.

## Files

| File | Purpose |
|---|---|
| `index.html` | All markup. 5 tab views: `dashboard-view`, `post-score-view`, `history-view`, `courses-view`, `settings-view`. Also contains the edit-round modal. |
| `app.js` | All logic (~2.4k lines), organized by `// --- SECTION ---` banners (see below). |
| `styles.css` | All styles. Theming via `body.theme-light` / `body.theme-dark` + CSS variables (e.g. `--primary-color`, `--danger-color`, `--text-secondary`). |
| `tests.js` | Browser-console unit tests: `runHandicapTests()`. |
| `scores.json` | **User data**, written by the app's GitHub sync. Don't edit by hand (see "Sync" below). |

### `app.js` layout (top → bottom)

1. `PRELOADED_COURSES`: built-in course/tee data (id, name, location, tees `{name, par, rating, slope}`, `hasOfficialNine`).
2. `state`: `{ rounds, courses, settings }`. Settings defaults: `theme: 'light'`, `nineHoleMethod: 'whs-2024'`, `initialIndex: null`, `githubSync: {enabled, username, repo, lastSync}`.
3. `DOMContentLoaded` bootstrap: `loadData` → `init*` listeners → `populateCourseSelects` → `recalculateAll` → startup sync.
4. **DATA PERSISTENCE**: `loadData` / `saveData` (localStorage).
5. **THEME MANAGEMENT**, **NAVIGATION** (`switchTab` re-renders the dashboard/history/courses on entry).
6. **HANDICAP INDEX ENGINE**: `calculateDifferential`, `calculateHandicapFromDiffs`, `recalculateAll`, `markCountingRounds`, `getCurrentHandicap`.
7. **UI RENDERING**: dashboard, history table, course directory.
8. **FORM HANDLING: POST SCORE**: includes the 9-hole approximation solver (`getAutoApproximations`, `check9HoleApproximationState`, `getFinal9HoleApproxValues`).
9. **FORM HANDLING: ADD & EDIT COURSES**: tee builder rows, preset tees, 9-hole tee rows, edit/duplicate/reset preloaded courses.
10. **ROUND HISTORY & EDITING**: delete round, edit modal.
11. **SETTINGS**, **DATA BACKUP & RECOVERY** (JSON import/export), **DIAGNOSTICS** (button that runs `runHandicapTests`).
12. **CHARTING ENGINE**: Chart.js trend chart (`renderChart`, `updateChartTheme`).
13. **GITHUB CLOUD SYNCHRONIZATION**: `initGitHubSync`, `syncWithGitHub`, `mergeRounds`, `mergeCourses`, `triggerSyncIfEnabled`.

## Data model

**Round** (stored in `state.rounds`, kept sorted oldest → newest):
```json
{
  "id": "rnd_<timestamp>_<rand5>",
  "courseId": "heronlakes-blue", "courseName": "...", "teeName": "Blue",
  "holes": 18, "gross": 92, "rating": 71.8, "slope": 132, "par": 72,
  "date": "YYYY-MM-DD",
  "differential": 17.3, "runningHandicap": null, "counting": false,
  "calculationNotes": "..."
}
```
`differential`, `runningHandicap`, `counting`, `calculationNotes` are **derived**. `recalculateAll()`
recomputes them, so call it after any change to rounds or settings.

**Course** IDs: preloaded courses use slug IDs (e.g. `rosecity`, `heronlakes-blue`); user-created
courses use `crs_<timestamp>_<rand5>`. An edited preloaded course gets `isModified: true`.

**localStorage keys:** `clubhouse_rounds`, `clubhouse_courses`, `clubhouse_settings`,
`clubhouse_github_token` (the PAT is stored separately, **never** in settings or `scores.json`).

## Handicap math (WHS rules, don't break this)

- Differential = `(113 / slope) * (gross - rating)`, rounded to 0.1.
- Index uses the most recent 20 differentials, averaging the lowest N per the WHS table:
  3→1 (−2.0), 4→1 (−1.0), 5→1, 6→2 (−1.0), 7–8→2, 9–11→3, 12–14→4, 15–16→5, 17–18→6, 19→7, 20→8.
  You need at least 3 rounds or the result is `null`. Clamped to **[−10.0, 54.0]**.
- **9-hole rounds** (`settings.nineHoleMethod`):
  - `'whs-2024'` (default): 9-hole diff + expected 9-hole diff, where expected = `index * 0.52 + 1.2`,
    using the running index *before* that round. If there's no index yet, it falls back to simple scaling.
  - otherwise **simple scaling**: 9-hole diff × 2.
- **9-hole solver**: when a course lacks official 9-hole ratings, approximate as Rating/2, same Slope, Par/2.
- The lookup table is duplicated in `calculateHandicapFromDiffs` and `markCountingRounds`.
  **Keep them in sync** if you change one.

## Sync (important gotcha)

`syncWithGitHub()` uses the GitHub Contents API to GET → merge → PUT `scores.json` **directly in
this repo** (commit message: "Sync scores via Clubhouse Golf Handicap App").

- Merge rules: rounds merge by `id` (local wins); courses keep local custom (`crs_`) or `isModified` courses.
  Only custom and modified courses are pushed. `preferLocal=true` skips the merge (used after deletes).
- **The remote gets new commits whenever scores are posted from the phone.** Always
  `git pull` (rebase) before pushing, and don't overwrite or reformat `scores.json` in your commits.

## Testing

No test runner. Tests run in the browser:
1. Open `index.html` → Settings → Diagnostics → "Run tests", **or**
2. Open DevTools console and run `runHandicapTests()`.

Add a new test case to `tests.js` (same `assert` pattern) when you change calculation or merge logic.
If you want headless runs, `tests.js` + the engine functions could be loaded in Node, but that isn't set up.

## Deploying / cache busting

GitHub Pages serves whatever is pushed to `master`. Phones cache aggressively, so
`index.html` references assets with a version query: `styles.css?v=2.1`, `tests.js?v=2.1`, `app.js?v=2.1`.
**Bump all three `?v=` values whenever you change CSS or JS** that needs to reach the phone.

## Conventions

- Match the existing style: 4-space indent, double quotes, `function` declarations, section banners.
- UI should stay "premium clubhouse": Outfit/Playfair fonts, use the CSS variables, and support both themes.
- Interactive elements have unique, descriptive `id`s. Keep that pattern.
- After a data mutation: update `state` → `recalculateAll()` → `saveData()` → re-render → `triggerSyncIfEnabled()`.

## Known loose ends

- The diagnostics success message says "All 8 WHS calculation tests passed" but `tests.js` now has 9 tests.
- Preloaded course ratings/slopes are approximate. Verify against official USGA/OGA data before relying on them.
