# AGENTS.md — Clubhouse Golf Handicap Tracker

This document provides architectural context, domain rules, data schemas, and coding conventions for AI coding assistants working on the **Clubhouse Golf Handicap Tracker**.

---

## 1. Project Overview & Tech Stack

- **Purpose**: A privacy-first, single-page web application (SPA) for tracking golf scores and calculating a World Handicap System (WHS)-aligned Handicap Index, tailored with preloaded Pacific Northwest / Portland Metro courses and a built-in 9-hole rating solver.
- **Stack**:
  - **HTML5** (`index.html`) — Single-page layout with 5 tabbed views and an edit modal.
  - **Vanilla CSS3** (`styles.css`) — Custom design system using CSS custom properties for Light (`:root`) and Dark (`body.theme-dark`) themes.
  - **Vanilla JavaScript (ES6+)** (`app.js`, `tests.js`) — Zero build step, no bundler, no NPM runtime dependencies.
  - **External CDN Assets**:
    - [Chart.js](https://www.chartjs.org/) (`https://cdn.jsdelivr.net/npm/chart.js`) for the Handicap Index & Score Differential trend chart.
    - Google Fonts (`Playfair Display` for headings, `Outfit` for UI/body).
- **Hosting & Execution**: Runs directly by opening `index.html` in a browser or via static hosting on **GitHub Pages**.

---

## 2. File Structure

| File | Responsibility |
| :--- | :--- |
| `index.html` | App shell, header handicap badge, navigation tabs (`dashboard-view`, `post-score-view`, `history-view`, `courses-view`, `settings-view`), forms, and the `#edit-score-modal` dialog. |
| `app.js` | Preloaded course database (`PRELOADED_COURSES`), global `state`, `localStorage` persistence, WHS calculation engine, DOM rendering, course builder/editor, JSON backup/restore, and GitHub REST API cloud sync. |
| `styles.css` | Theme tokens, typography, responsive grid layouts, mobile card-table transformations (`td[data-label]`), badges, and modal styling. |
| `tests.js` | In-browser unit test suite (`runHandicapTests()`) triggered from **Settings → Diagnostics & Verification** or the browser console. |
| `scores.json` | Cloud-synced data file read/written via the GitHub Repository Contents API when GitHub Sync is enabled. |
| `README.md` | User-facing documentation, local usage instructions, GitHub Pages deployment guide, and GitHub PAT sync setup instructions. |

---

## 3. State Management & Persistence

### Global State (`state` in `app.js`)
```js
let state = {
    rounds: [],
    courses: [],
    settings: {
        theme: 'light',            // 'light' | 'dark'
        nineHoleMethod: 'whs-2024',// 'whs-2024' | 'simple-scale'
        initialIndex: null,        // number | null (bootstraps 9-hole expected score before 3 rounds)
        githubSync: {
            enabled: false,
            username: '',
            repo: 'Golf-Handicap-App',
            lastSync: null         // ISO timestamp string | null
        }
    }
};
```

### `localStorage` Keys
- `clubhouse_rounds`: Serialized `state.rounds` array.
- `clubhouse_courses`: Serialized `state.courses` array (initialized from `clonePreloadedCourses()` on first load).
- `clubhouse_settings`: Serialized `state.settings` object.
- `clubhouse_github_token`: GitHub Personal Access Token (stored separately from `state.settings` so JSON exports do not leak tokens).

### Data Schemas

#### Round Object (`state.rounds[i]`)
```js
{
    id: "rnd_1710000000000_abc12", // Unique ID ('rnd_' + timestamp + random suffix)
    courseId: "rosecity",          // Matches course.id
    courseName: "Rose City Golf Course",
    teeName: "Blue",
    holes: 18,                     // 18 | 9
    gross: 85,                     // Adjusted Gross Score (integer)
    rating: 71.7,                  // Course Rating used for this round (18H or 9H)
    slope: 123,                    // Slope Rating used for this round
    par: 72,                       // Par used for this round
    date: "2026-05-14",            // YYYY-MM-DD
    counting: false,               // Computed by markCountingRounds()
    differential: 12.2,            // Computed by recalculateAll() (rounded to 0.1)
    runningHandicap: 10.2,         // Handicap Index after this round (number | null)
    calculationNotes: "..."        // Diagnostic note set during recalculateAll()
}
```

#### Course Object (`state.courses[i]`)
```js
{
    id: "crs_1710000000000_xyz98", // Preloaded courses use slug IDs (e.g., 'rosecity'); custom courses use 'crs_...'
    name: "Eastmoreland Golf Course",
    location: "Portland, OR",
    tees: [
        { name: "Blue", par: 72, rating: 71.0, slope: 124 }
    ],
    hasOfficialNine: false,        // true if official 9-hole ratings are configured
    nineTees: [                    // Present when hasOfficialNine === true; matched to 18H tees by name/index
        { name: "Blue", par: 36, rating: 35.5, slope: 124 }
    ],
    isModified: true               // Set to true when a preloaded course is edited by the user
}
```

---

## 4. Domain Logic: WHS Handicap Engine

All handicap math lives in `app.js` (`calculateDifferential`, `calculateHandicapFromDiffs`, `recalculateAll`, `markCountingRounds`):

1. **Chronological Ordering**:
   - `recalculateAll()` sorts `state.rounds` ascending by `new Date(a.date) - new Date(b.date)`.
2. **18-Hole Score Differential**:
   $$\text{Differential} = \frac{113}{\text{Slope}} \times (\text{Adjusted Gross Score} - \text{Course Rating})$$
3. **9-Hole Tee Rating Resolution**:
   - If the course has `hasOfficialNine && course.nineTees` with a matching tee name, use the official 9-hole `rating`, `slope`, and `par`.
   - Otherwise, approximate from the 18-hole tee:
     - `rating = Math.round((tee.rating / 2) * 10) / 10`
     - `slope = tee.slope` (unchanged)
     - `par = Math.round(tee.par / 2)`
   - Users can also uncheck `#use-auto-approx` on the Post Score form to supply manual 9-hole Rating/Slope/Par values.
4. **9-Hole Differential Scaling (18-Hole Equivalent)**:
   - First compute the raw 9-hole differential: `nineHoleDiff = calculateDifferential(gross, rating9, slope9)`.
   - **WHS 2024 Method** (`state.settings.nineHoleMethod === 'whs-2024'` and `runningIndex !== null`):
     $$\text{Expected 9-Hole Diff} = (\text{runningIndex} \times 0.52) + 1.2$$
     $$\text{18-Hole Equivalent Diff} = \text{nineHoleDiff} + \text{Expected 9-Hole Diff}$$
   - **Simple Scaling / Fallback** (when `simple-scale` is selected OR `runningIndex === null`):
     $$\text{18-Hole Equivalent Diff} = \text{nineHoleDiff} \times 2$$
   - Each round's final `differential` is rounded to the nearest tenth (`Math.round(diff * 10) / 10`).
5. **WHS Lookup Table (`calculateHandicapFromDiffs`)**:
   - Requires at least **3 rounds** (`n < 3` returns `null`).
   - Considers only the most recent **20 rounds** (`diffs.slice(-20)`).
   - Selects the lowest $k$ differentials and applies the WHS adjustment:
     - 3 rounds: lowest 1, `-2.0` adjustment
     - 4 rounds: lowest 1, `-1.0` adjustment
     - 5 rounds: lowest 1, `0` adjustment
     - 6 rounds: average of lowest 2, `-1.0` adjustment
     - 7–8 rounds: average of lowest 2, `0` adjustment
     - 9–11 rounds: average of lowest 3, `0` adjustment
     - 12–14 rounds: average of lowest 4, `0` adjustment
     - 15–16 rounds: average of lowest 5, `0` adjustment
     - 17–18 rounds: average of lowest 6, `0` adjustment
     - 19 rounds: average of lowest 7, `0` adjustment
     - 20 rounds: average of lowest 8, `0` adjustment
   - Clamped between `-10.0` and `54.0`.

---

## 5. GitHub Cloud Synchronization

- Syncs `scores.json` in the user's configured repository via `https://api.github.com/repos/{username}/{repo}/contents/scores.json`.
- **Payload**: Contains `rounds` (all logged rounds) and `courses` (filtered to custom courses starting with `crs_` or preloaded courses with `isModified: true`).
- **Pull & Merge vs. Local Mutation (`preferLocal`)**:
  - Startup and manual "Sync Now" call `syncWithGitHub(false)`, which merges cloud and local rounds/courses (`mergeRounds`, `mergeCourses`) before pushing.
  - Explicit local mutations (adding/editing/deleting a round or course) call `triggerSyncIfEnabled(true)` (`preferLocal = true`), which skips the cloud merge so deleted rounds/courses are not resurrected from the remote `scores.json`.

---

## 6. Conventions & Guidelines for Modifying the Codebase

1. **State Mutation Workflow**:
   Whenever rounds or course ratings are added, edited, or deleted, always run the standard pipeline in order:
   ```js
   recalculateAll();
   saveData();
   triggerSyncIfEnabled(true);
   ```
   Then refresh relevant UI views (`renderDashboard()`, `renderHistoryTable()`, `renderCourseDirectory()`, `populateCourseSelects()`).
2. **Theme Compatibility**:
   - Never hardcode light-only or dark-only colors in CSS rules. Always use the CSS custom properties defined in `:root` and `body.theme-dark` in `styles.css` (e.g., `var(--card-bg)`, `var(--text-primary)`, `var(--primary-color)`, `var(--border-color)`).
   - Exception: Tee box color dots (`getTeeDotColor(teeName)`) use semantic tee colors.
3. **Responsive Tables**:
   - Tables in Dashboard (`#recent-rounds-table`) and History (`#full-history-table`) transform into stacked cards on mobile viewports (`max-width: 768px`).
   - Every `<td>` dynamically rendered in `renderDashboard()` or `renderHistoryTable()` **must** include a `data-label="..."` attribute matching its column header.
4. **Date Handling**:
   - Round dates are stored as `YYYY-MM-DD` strings.
   - When formatting dates for display in `formatDate(dateStr)`, append `"T00:00:00"` (`new Date(dateStr + "T00:00:00")`) to prevent local timezone offsets from shifting dates back by one day.
5. **Testing & Verification**:
   - When changing handicap formulas, 9-hole approximations, or course/round merge logic, update or add unit tests in `tests.js` (`runHandicapTests()`).
   - Ensure the UI test runner in `initDiagnostics()` (`#btn-run-tests`) continues to pass without errors.
6. **Cache Busting**:
   - `index.html` references `styles.css?v=2.1`, `tests.js?v=2.1`, and `app.js?v=2.1`. Bump the query version when making significant deployable changes if requested.
