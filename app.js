// Clubhouse Golf Handicap App - Main JavaScript Logic

// Preloaded Course Database (Pacific Northwest / Portland Metro)
const PRELOADED_COURSES = [
    {
        id: "mthood-foxglove-thistle",
        name: "Mt. Hood Oregon Resort (Foxglove/Thistle)",
        location: "Welches, OR",
        tees: [
            { name: "Blue", par: 70, rating: 69.0, slope: 130 },
            { name: "White", par: 70, rating: 67.5, slope: 125 },
            { name: "Red (W)", par: 71, rating: 71.8, slope: 124 }
        ],
        hasOfficialNine: false
    },
    {
        id: "mthood-pinecone-thistle",
        name: "Mt. Hood Oregon Resort (Pinecone/Thistle)",
        location: "Welches, OR",
        tees: [
            { name: "Blue", par: 71, rating: 69.0, slope: 120 },
            { name: "White", par: 71, rating: 67.5, slope: 115 },
            { name: "Red (W)", par: 72, rating: 71.2, slope: 118 }
        ],
        hasOfficialNine: false
    },
    {
        id: "mthood-foxglove-pinecone",
        name: "Mt. Hood Oregon Resort (Foxglove/Pinecone)",
        location: "Welches, OR",
        tees: [
            { name: "Blue", par: 71, rating: 69.5, slope: 125 },
            { name: "White", par: 71, rating: 68.0, slope: 120 },
            { name: "Red (W)", par: 72, rating: 71.5, slope: 122 }
        ],
        hasOfficialNine: false
    },
    {
        id: "heronlakes-blue",
        name: "Heron Lakes Golf Club (Great Blue)",
        location: "Portland, OR",
        tees: [
            { name: "Black", par: 72, rating: 74.0, slope: 139 },
            { name: "Blue", par: 72, rating: 71.8, slope: 132 },
            { name: "White", par: 72, rating: 69.8, slope: 125 },
            { name: "Red (W)", par: 72, rating: 71.5, slope: 122 }
        ],
        hasOfficialNine: false
    },
    {
        id: "heronlakes-green",
        name: "Heron Lakes Golf Club (Greenback)",
        location: "Portland, OR",
        tees: [
            { name: "Blue", par: 72, rating: 72.0, slope: 128 },
            { name: "White", par: 72, rating: 69.8, slope: 120 },
            { name: "Red (W)", par: 72, rating: 71.0, slope: 116 }
        ],
        hasOfficialNine: false
    },
    {
        id: "rosecity",
        name: "Rose City Golf Course",
        location: "Portland, OR",
        tees: [
            { name: "Blue", par: 72, rating: 71.7, slope: 123 },
            { name: "White", par: 72, rating: 69.8, slope: 119 },
            { name: "Red (W)", par: 73, rating: 71.8, slope: 118 }
        ],
        hasOfficialNine: false
    },
    {
        id: "glendoveer-east",
        name: "Glendoveer Golf Course (East)",
        location: "Portland, OR",
        tees: [
            { name: "Black", par: 73, rating: 70.8, slope: 128 },
            { name: "Blue", par: 73, rating: 69.5, slope: 122 },
            { name: "White", par: 73, rating: 67.5, slope: 115 }
        ],
        hasOfficialNine: false
    },
    {
        id: "glendoveer-west",
        name: "Glendoveer Golf Course (West)",
        location: "Portland, OR",
        tees: [
            { name: "Blue", par: 71, rating: 69.0, slope: 115 },
            { name: "White", par: 71, rating: 67.2, slope: 110 }
        ],
        hasOfficialNine: false
    },
    {
        id: "eastmoreland",
        name: "Eastmoreland Golf Course",
        location: "Portland, OR",
        tees: [
            { name: "Blue", par: 72, rating: 71.0, slope: 124 },
            { name: "White", par: 72, rating: 69.3, slope: 115 },
            { name: "Red (W)", par: 74, rating: 72.5, slope: 124 }
        ],
        hasOfficialNine: false
    }
];

// App State Management
let state = {
    rounds: [],
    courses: [],
    settings: {
        theme: 'light',
        nineHoleMethod: 'whs-2024',
        initialIndex: null,
        githubSync: {
            enabled: false,
            username: '',
            repo: 'Golf-Handicap-App',
            lastSync: null
        }
    }
};

let chartInstance = null;

// Initialize the Application
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    initTheme();
    initTabNavigation();
    initCourseFormListeners();
    initScoreFormListeners();
    initSettingsListeners();
    initBackupListeners();
    initDiagnostics();
    initGitHubSync();
    
    // Populate form selects
    populateCourseSelects();
    renderCourseDirectory();
    
    // Initial Handicap & UI Updates
    recalculateAll();
    
    // Set default date to today
    document.getElementById("score-date").valueAsDate = new Date();
    
    // Auto-sync in background on startup if enabled
    if (state.settings.githubSync && state.settings.githubSync.enabled) {
        syncWithGitHub().catch(err => console.error("Startup auto-sync failed:", err));
    }
});

// --- DATA PERSISTENCE ---

function loadData() {
    try {
        const storedRounds = localStorage.getItem("clubhouse_rounds");
        const storedCourses = localStorage.getItem("clubhouse_courses");
        const storedSettings = localStorage.getItem("clubhouse_settings");
        
        if (storedRounds) state.rounds = JSON.parse(storedRounds);
        
        if (storedCourses) {
            state.courses = JSON.parse(storedCourses);
        } else {
            state.courses = [...PRELOADED_COURSES];
            localStorage.setItem("clubhouse_courses", JSON.stringify(state.courses));
        }
        
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            state.settings = { ...state.settings, ...parsed };
            if (parsed.githubSync) {
                state.settings.githubSync = { ...state.settings.githubSync, ...parsed.githubSync };
            }
        } else {
            localStorage.setItem("clubhouse_settings", JSON.stringify(state.settings));
        }
    } catch (e) {
        console.error("Error loading data from localStorage:", e);
        // Fallbacks
        state.courses = [...PRELOADED_COURSES];
    }
}

function saveData() {
    try {
        localStorage.setItem("clubhouse_rounds", JSON.stringify(state.rounds));
        localStorage.setItem("clubhouse_courses", JSON.stringify(state.courses));
        localStorage.setItem("clubhouse_settings", JSON.stringify(state.settings));
    } catch (e) {
        console.error("Error saving data to localStorage:", e);
        alert("Failed to save data. Local storage might be full or disabled.");
    }
}

// --- THEME MANAGEMENT ---

function initTheme() {
    const body = document.body;
    const toggleBtn = document.getElementById("theme-toggle-btn");
    
    // Apply current theme class
    body.className = state.settings.theme === 'dark' ? 'theme-dark' : 'theme-light';
    
    toggleBtn.addEventListener("click", () => {
        if (state.settings.theme === 'light') {
            state.settings.theme = 'dark';
            body.className = 'theme-dark';
        } else {
            state.settings.theme = 'light';
            body.className = 'theme-light';
        }
        saveData();
        updateChartTheme();
    });
}

// --- NAVIGATION ---

function initTabNavigation() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    // Deactivate all tabs & buttons
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    
    // Activate target tab & button
    const targetContent = document.getElementById(tabId);
    const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    
    if (targetContent && targetBtn) {
        targetContent.classList.add("active");
        targetBtn.classList.add("active");
        
        // Trigger specific tab loads if needed
        if (tabId === 'dashboard-view') {
            renderDashboard();
        } else if (tabId === 'history-view') {
            renderHistoryTable();
        } else if (tabId === 'courses-view') {
            renderCourseDirectory();
        }
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- HANDICAP INDEX ENGINE ---

/**
 * Calculates a Score Differential for a given score, rating, and slope.
 * Score Differential = (113 / Slope) * (Gross Score - Rating)
 */
function calculateDifferential(score, rating, slope) {
    if (!slope || slope === 0) return 0;
    return (113 / slope) * (score - rating);
}

/**
 * Calculates the Handicap Index from an array of differentials using WHS tables.
 */
function calculateHandicapFromDiffs(diffs) {
    const n = diffs.length;
    if (n < 3) return null; // WHS requires at least 3 rounds (54 holes) to establish an index.
    
    // WHS takes the most recent rounds, up to 20
    const recentDiffs = diffs.slice(-20);
    const m = recentDiffs.length;
    
    // Sort ascending to grab the lowest differentials
    const sorted = [...recentDiffs].sort((a, b) => a - b);
    
    let numToUse = 1;
    let adjustment = 0;
    
    // WHS 2020/2024 Standard lookup table for fewer than 20 rounds
    if (m === 3) { numToUse = 1; adjustment = -2.0; }
    else if (m === 4) { numToUse = 1; adjustment = -1.0; }
    else if (m === 5) { numToUse = 1; adjustment = 0; }
    else if (m === 6) { numToUse = 2; adjustment = -1.0; }
    else if (m === 7 || m === 8) { numToUse = 2; adjustment = 0; }
    else if (m >= 9 && m <= 11) { numToUse = 3; adjustment = 0; }
    else if (m >= 12 && m <= 14) { numToUse = 4; adjustment = 0; }
    else if (m >= 15 && m <= 16) { numToUse = 5; adjustment = 0; }
    else if (m >= 17 && m <= 18) { numToUse = 6; adjustment = 0; }
    else if (m === 19) { numToUse = 7; adjustment = 0; }
    else { numToUse = 8; adjustment = 0; } // m === 20
    
    const usedDiffs = sorted.slice(0, numToUse);
    const sum = usedDiffs.reduce((sum, val) => sum + val, 0);
    const average = sum / numToUse;
    
    // Round to nearest tenth
    const handicapIndex = Math.round((average + adjustment) * 10) / 10;
    
    // WHS limits are -10.0 to 54.0
    return Math.max(-10.0, Math.min(54.0, handicapIndex));
}

/**
 * Chronologically recalculates all round differentials and updates running Handicap Indices.
 */
function recalculateAll() {
    // 1. Sort rounds chronologically (oldest to newest)
    state.rounds.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 2. Initialize running index (use initial override if set)
    let runningIndex = null;
    if (state.settings.initialIndex !== null && !isNaN(state.settings.initialIndex)) {
        runningIndex = parseFloat(state.settings.initialIndex);
    }
    
    // 3. Process each round
    for (let i = 0; i < state.rounds.length; i++) {
        const round = state.rounds[i];
        
        let diff;
        if (parseInt(round.holes) === 18) {
            // 18-Hole standard calculation
            diff = calculateDifferential(round.gross, round.rating, round.slope);
            round.calculationNotes = `18-Hole round. Differential calculated directly.`;
        } else {
            // 9-Hole calculation
            const nineHoleDiff = calculateDifferential(round.gross, round.rating, round.slope);
            
            // Check if WHS 2024 is enabled AND we have a valid index to calculate expected score
            if (state.settings.nineHoleMethod === 'whs-2024' && runningIndex !== null) {
                // WHS 2024: 9-hole score differential + Expected 9-hole score differential
                const expectedNineDiff = (runningIndex * 0.52) + 1.2;
                diff = nineHoleDiff + expectedNineDiff;
                round.calculationNotes = `WHS 2024: 9-Hole Diff (${nineHoleDiff.toFixed(1)}) + Expected Diff (${expectedNineDiff.toFixed(1)}) based on Handicap Index of ${runningIndex.toFixed(1)}`;
            } else {
                // Fallback / Simple Scaling: Double the 9-hole differential
                diff = nineHoleDiff * 2;
                round.calculationNotes = `Simple Scaling: 9-Hole Diff (${nineHoleDiff.toFixed(1)}) doubled.`;
            }
        }
        
        round.differential = Math.round(diff * 10) / 10;
        
        // Calculate handicap index AFTER this round was posted
        const roundsToHere = state.rounds.slice(0, i + 1);
        const diffsToHere = roundsToHere.map(r => r.differential);
        runningIndex = calculateHandicapFromDiffs(diffsToHere);
        round.runningHandicap = runningIndex;
    }
    
    // 4. Mark which rounds in the overall history are "counting" towards the CURRENT handicap index.
    markCountingRounds();
    
    // 5. Update handicap values across the UI
    updateUIHandicapBadges();
}

/**
 * Identifies and marks the specific rounds counting towards the current index.
 * WHS looks at the last 20 rounds, and takes the lowest differentials based on the WHS table.
 */
function markCountingRounds() {
    // Reset all counting flags
    state.rounds.forEach(r => r.counting = false);
    
    const n = state.rounds.length;
    if (n < 3) return; // Need at least 3 rounds to establish an index.
    
    // We only care about the most recent 20 rounds
    const startIndex = Math.max(0, n - 20);
    const recentRounds = state.rounds.slice(startIndex);
    const m = recentRounds.length;
    
    // Create copies with indices so we can match them back
    const roundsWithIndex = recentRounds.map((r, idx) => ({
        round: r,
        localIndex: idx,
        differential: r.differential
    }));
    
    // Sort ascending by differential
    roundsWithIndex.sort((a, b) => a.differential - b.differential);
    
    let numToUse = 1;
    if (m === 3) numToUse = 1;
    else if (m === 4) numToUse = 1;
    else if (m === 5) numToUse = 1;
    else if (m === 6) numToUse = 2;
    else if (m === 7 || m === 8) numToUse = 2;
    else if (m >= 9 && m <= 11) numToUse = 3;
    else if (m >= 12 && m <= 14) numToUse = 4;
    else if (m >= 15 && m <= 16) numToUse = 5;
    else if (m >= 17 && m <= 18) numToUse = 6;
    else if (m === 19) numToUse = 7;
    else numToUse = 8; // m === 20
    
    // The lowest 'numToUse' rounds of the recent 20 are counting
    for (let i = 0; i < numToUse; i++) {
        roundsWithIndex[i].round.counting = true;
    }
}

function getCurrentHandicap() {
    if (state.rounds.length === 0) {
        return state.settings.initialIndex !== null ? parseFloat(state.settings.initialIndex) : null;
    }
    return state.rounds[state.rounds.length - 1].runningHandicap;
}

function updateUIHandicapBadges() {
    const currentHandicap = getCurrentHandicap();
    const formatted = currentHandicap !== null ? currentHandicap.toFixed(1) : "--.-";
    
    // Update header
    document.getElementById("header-handicap-val").innerText = formatted;
    
    // Update dashboard gauge
    const dashValEl = document.getElementById("dash-handicap-val");
    if (dashValEl) {
        dashValEl.innerText = formatted;
        
        const dashStatusEl = document.getElementById("dash-handicap-status");
        const dashRoundsEl = document.getElementById("dash-rounds-status");
        const totalRounds = state.rounds.length;
        
        if (totalRounds < 3) {
            dashStatusEl.innerText = "Unestablished";
            dashRoundsEl.innerText = `Log ${3 - totalRounds} more round(s) (54 holes total) to establish your index.`;
        } else {
            dashStatusEl.innerText = "Established";
            if (totalRounds < 20) {
                dashRoundsEl.innerText = `Based on ${totalRounds} rounds. Log ${20 - totalRounds} more to reach a full 20-round index.`;
            } else {
                dashRoundsEl.innerText = `Based on the best 8 of your most recent 20 rounds.`;
            }
        }
    }
}

// --- UI RENDERING: DASHBOARD ---

function renderDashboard() {
    updateUIHandicapBadges();
    
    const totalRounds = state.rounds.length;
    
    // Calculate stats
    let lowGross = "--";
    let bestDiff = "--.-";
    
    if (totalRounds > 0) {
        const grossScores = state.rounds.map(r => r.gross);
        const diffs = state.rounds.map(r => r.differential);
        lowGross = Math.min(...grossScores).toString();
        bestDiff = Math.min(...diffs).toFixed(1);
    }
    
    document.getElementById("stat-low-gross").innerText = lowGross;
    document.getElementById("stat-best-diff").innerText = bestDiff;
    document.getElementById("stat-total-rounds").innerText = totalRounds;
    
    // Render recent rounds list
    const tbody = document.getElementById("recent-rounds-list");
    tbody.innerHTML = "";
    
    if (totalRounds === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No rounds logged yet. Post a score to get started!</td></tr>`;
    } else {
        // Show up to 5 most recent rounds (newest first)
        const recent = [...state.rounds].reverse().slice(0, 5);
        
        recent.forEach(round => {
            const tr = document.createElement("tr");
            if (round.counting) {
                tr.classList.add("counting-round");
            }
            
            const dateStr = formatDate(round.date);
            const ratingSlope = `${round.rating.toFixed(1)} / ${round.slope}`;
            const typeStr = round.holes == 9 ? '<span class="badge badge-nine">9 Holes</span>' : '18 Holes';
            const countingStr = round.counting ? '<span class="badge badge-counting">Yes</span>' : 'No';
            
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td><strong>${round.courseName}</strong><br><small style="color:var(--text-secondary)">Tee: ${round.teeName}</small></td>
                <td>${round.gross}</td>
                <td>${ratingSlope}</td>
                <td><strong>${round.differential.toFixed(1)}</strong></td>
                <td>${typeStr}</td>
                <td>${countingStr}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    renderChart();
}

// --- UI RENDERING: HISTORY ---

function renderHistoryTable() {
    const tbody = document.getElementById("full-history-list");
    tbody.innerHTML = "";
    
    document.getElementById("history-round-count").innerText = state.rounds.length;
    
    if (state.rounds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No rounds logged yet. Go to 'Post Score' to log your rounds!</td></tr>`;
        return;
    }
    
    // Render chronological scores (reversed to show newest first)
    const displayRounds = [...state.rounds].reverse();
    
    displayRounds.forEach((round, index) => {
        // Original index in the state.rounds array
        const originalIndex = state.rounds.indexOf(round);
        
        const tr = document.createElement("tr");
        if (round.counting) {
            tr.classList.add("counting-round");
        }
        
        const dateStr = formatDate(round.date);
        const ratingSlopeStr = `${round.rating.toFixed(1)} / ${round.slope}`;
        const typeStr = round.holes == 9 ? '<span class="badge badge-nine">9 Holes</span>' : '18 Holes';
        const countingStr = round.counting ? '<span class="badge badge-counting">Yes</span>' : 'No';
        
        tr.innerHTML = `
            <td>${state.rounds.length - originalIndex}</td>
            <td>${dateStr}</td>
            <td><strong>${round.courseName}</strong></td>
            <td>${round.teeName}</td>
            <td>${typeStr}</td>
            <td>${round.gross}</td>
            <td>${ratingSlopeStr}</td>
            <td><strong>${round.differential.toFixed(1)}</strong><br><small style="color:var(--text-secondary);font-size:0.7rem">${round.runningHandicap !== null ? 'HCIP: ' + round.runningHandicap.toFixed(1) : 'HCIP: --'}</small></td>
            <td>${countingStr}</td>
            <td>
                <div class="row-actions">
                    <button type="button" class="btn-row-action btn-row-edit" onclick="openEditModal(${originalIndex})" title="Edit Round">✏️ Edit</button>
                    <button type="button" class="btn-row-action btn-row-delete" onclick="deleteRound(${originalIndex})" title="Delete Round">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- UI RENDERING: COURSE DIRECTORY ---

function renderCourseDirectory() {
    const container = document.getElementById("courses-container");
    container.innerHTML = "";
    
    const searchVal = document.getElementById("course-search").value.toLowerCase();
    
    // Filter courses by search string
    const filteredCourses = state.courses.filter(course => 
        course.name.toLowerCase().includes(searchVal) || 
        (course.location && course.location.toLowerCase().includes(searchVal))
    );
    
    if (filteredCourses.length === 0) {
        container.innerHTML = `<div class="empty-state">No courses match your search. Use the form on the right to add it!</div>`;
        return;
    }
    
    filteredCourses.forEach(course => {
        const div = document.createElement("div");
        div.className = "course-card";
        
        let teesHtml = "";
        course.tees.forEach(t => {
            // Determine dot border color
            let dotColor = t.name.toLowerCase();
            if (dotColor === 'white') dotColor = '#ffffff';
            else if (dotColor === 'blue') dotColor = '#0056b3';
            else if (dotColor === 'red') dotColor = '#dc3545';
            else if (dotColor === 'black') dotColor = '#1e2125';
            else dotColor = 'var(--text-secondary)';
            
            teesHtml += `
                <span class="tee-pill">
                    <span class="tee-color-dot" style="background-color: ${dotColor}"></span>
                    ${t.name} (Par ${t.par}, ${t.rating.toFixed(1)}/${t.slope})
                </span>
            `;
        });
        
        // Show if course has separate official 9-hole ratings
        let nineInfoHtml = "";
        if (course.hasOfficialNine && course.nineTees) {
            nineInfoHtml = `<div class="course-tees-list" style="margin-top: 0.5rem;"><small style="color:var(--accent-color);font-weight:600">Official 9-Hole Tees:</small></div>`;
            let nineTeesHtml = "";
            course.nineTees.forEach(t => {
                nineTeesHtml += `
                    <span class="tee-pill">
                        ${t.name} (Par ${t.par}, ${t.rating.toFixed(1)}/${t.slope})
                    </span>
                `;
            });
            nineInfoHtml += `<div class="course-tees-list">${nineTeesHtml}</div>`;
        }
        
        // Is it custom? (Can delete it if not in preloaded database)
        const isPreloaded = PRELOADED_COURSES.some(c => c.id === course.id);
        const deleteBtnHtml = !isPreloaded 
            ? `<button type="button" class="btn btn-text btn-delete-course" onclick="deleteCourse('${course.id}')" title="Delete Course">🗑️</button>` 
            : `<small style="color:var(--text-secondary);font-size:0.7rem;font-style:italic">Preloaded</small>`;
            
        div.innerHTML = `
            <div class="course-info">
                <h3>${course.name}</h3>
                <span class="course-loc">📍 ${course.location || 'Unknown Location'}</span>
                <div class="course-tees-list">
                    ${teesHtml}
                </div>
                ${nineInfoHtml}
            </div>
            <div class="course-card-actions">
                ${deleteBtnHtml}
            </div>
        `;
        container.appendChild(div);
    });
}

// --- FORM HANDLING: POST SCORE ---

function populateCourseSelects() {
    const courseSelect = document.getElementById("score-course");
    
    // Clear and add placeholder
    courseSelect.innerHTML = `<option value="" disabled selected>-- Select a Course --</option>`;
    
    // Sort courses alphabetically by name
    const sortedCourses = [...state.courses].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedCourses.forEach(course => {
        const option = document.createElement("option");
        option.value = course.id;
        option.innerText = course.name;
        courseSelect.appendChild(option);
    });
    
    // Disable tee select until course selected
    const teeSelect = document.getElementById("score-tee");
    teeSelect.innerHTML = `<option value="" disabled selected>Select a course first</option>`;
    teeSelect.disabled = true;
}

function initScoreFormListeners() {
    const courseSelect = document.getElementById("score-course");
    const teeSelect = document.getElementById("score-tee");
    const holes9Radio = document.getElementById("holes-9");
    const holes18Radio = document.getElementById("holes-18");
    const approxHelper = document.getElementById("approx-helper");
    const useAutoApproxCheckbox = document.getElementById("use-auto-approx");
    const manualInputs = document.getElementById("manual-approx-inputs");
    
    // Date input: set default date to today
    document.getElementById("score-date").valueAsDate = new Date();

    // Course selection changed
    courseSelect.addEventListener("change", () => {
        const courseId = courseSelect.value;
        const course = state.courses.find(c => c.id === courseId);
        
        if (course) {
            teeSelect.disabled = false;
            teeSelect.innerHTML = `<option value="" disabled selected>-- Select a Tee Box --</option>`;
            
            course.tees.forEach((tee, index) => {
                const option = document.createElement("option");
                option.value = index; // Store tee index
                option.innerText = tee.name;
                teeSelect.appendChild(option);
            });
            
            updateTeeInfoBadge();
            check9HoleApproximationState();
        }
    });

    // Tee selection changed
    teeSelect.addEventListener("change", () => {
        updateTeeInfoBadge();
        check9HoleApproximationState();
    });

    // Round type changed (18 vs 9 holes)
    holes9Radio.addEventListener("change", () => {
        check9HoleApproximationState();
        updateTeeInfoBadge();
    });
    
    holes18Radio.addEventListener("change", () => {
        check9HoleApproximationState();
        updateTeeInfoBadge();
    });

    // Auto-approximation checkbox toggle
    useAutoApproxCheckbox.addEventListener("change", () => {
        if (useAutoApproxCheckbox.checked) {
            manualInputs.style.display = "none";
            fillAutoApproximatedValues();
        } else {
            manualInputs.style.display = "block";
            // Pre-fill manual values so they have a starting point
            const { rating, slope, par } = getAutoApproximations();
            document.getElementById("manual-rating").value = rating;
            document.getElementById("manual-slope").value = slope;
            document.getElementById("manual-par").value = par;
        }
    });

    // Handle Form Submission
    const form = document.getElementById("post-score-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const courseId = courseSelect.value;
        const teeIdx = parseInt(teeSelect.value);
        const holes = parseInt(document.querySelector('input[name="score-holes"]:checked').value);
        const gross = parseInt(document.getElementById("score-gross").value);
        const date = document.getElementById("score-date").value;
        
        const course = state.courses.find(c => c.id === courseId);
        const tee = course.tees[teeIdx];
        
        let finalRating = tee.rating;
        let finalSlope = tee.slope;
        let finalPar = tee.par;
        
        if (holes === 9) {
            // Check if course has official 9-hole ratings
            if (course.hasOfficialNine && course.nineTees) {
                const officialNineTee = course.nineTees.find(nt => nt.name === tee.name);
                if (officialNineTee) {
                    finalRating = officialNineTee.rating;
                    finalSlope = officialNineTee.slope;
                    finalPar = officialNineTee.par;
                } else {
                    // Fall back to approximation
                    const approx = getFinal9HoleApproxValues();
                    finalRating = approx.rating;
                    finalSlope = approx.slope;
                    finalPar = approx.par;
                }
            } else {
                // Fall back to approximation
                const approx = getFinal9HoleApproxValues();
                finalRating = approx.rating;
                finalSlope = approx.slope;
                finalPar = approx.par;
            }
        }
        
        // Add new round to state
        state.rounds.push({
            id: 'rnd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            courseId: course.id,
            courseName: course.name,
            teeName: tee.name,
            holes: holes,
            gross: gross,
            rating: finalRating,
            slope: finalSlope,
            par: finalPar,
            date: date,
            counting: false,
            differential: 0,
            runningHandicap: null
        });
        
        // Recalculate
        recalculateAll();
        saveData();
        triggerSyncIfEnabled();
        
        // Reset form & redirect to dashboard
        form.reset();
        document.getElementById("score-date").valueAsDate = new Date();
        document.getElementById("tee-info-badge").style.display = "none";
        approxHelper.style.display = "none";
        
        switchTab("dashboard-view");
    });
}

function updateTeeInfoBadge() {
    const courseSelect = document.getElementById("score-course");
    const teeSelect = document.getElementById("score-tee");
    const holes = parseInt(document.querySelector('input[name="score-holes"]:checked').value);
    const badge = document.getElementById("tee-info-badge");
    const text = document.getElementById("tee-info-text");
    
    const course = state.courses.find(c => c.id === courseSelect.value);
    
    if (course && teeSelect.value !== "") {
        const tee = course.tees[parseInt(teeSelect.value)];
        badge.style.display = "inline-block";
        
        if (holes === 18) {
            text.innerText = `18-Hole Tee Info: Rating ${tee.rating.toFixed(1)} / Slope ${tee.slope} (Par ${tee.par})`;
        } else {
            // Check if official 9-hole tees are available
            let officialNineTee = null;
            if (course.hasOfficialNine && course.nineTees) {
                officialNineTee = course.nineTees.find(nt => nt.name === tee.name);
            }
            
            if (officialNineTee) {
                text.innerText = `Official 9-Hole Tee Info: Rating ${officialNineTee.rating.toFixed(1)} / Slope ${officialNineTee.slope} (Par ${officialNineTee.par})`;
            } else {
                const approx = getAutoApproximations();
                text.innerText = `Approximated 9-Hole Tee: Rating ${approx.rating.toFixed(1)} / Slope ${approx.slope} (Par ${approx.par})`;
            }
        }
    } else {
        badge.style.display = "none";
    }
}

function check9HoleApproximationState() {
    const courseSelect = document.getElementById("score-course");
    const teeSelect = document.getElementById("score-tee");
    const holes = parseInt(document.querySelector('input[name="score-holes"]:checked').value);
    const approxHelper = document.getElementById("approx-helper");
    
    const course = state.courses.find(c => c.id === courseSelect.value);
    
    if (course && teeSelect.value !== "" && holes === 9) {
        // Check if there are separate official 9-hole ratings for the selected tee
        const tee = course.tees[parseInt(teeSelect.value)];
        let hasOfficial = false;
        
        if (course.hasOfficialNine && course.nineTees) {
            hasOfficial = course.nineTees.some(nt => nt.name === tee.name);
        }
        
        if (hasOfficial) {
            approxHelper.style.display = "none";
        } else {
            approxHelper.style.display = "flex";
            const approxDesc = document.getElementById("approx-helper-desc");
            approxDesc.innerText = `"${course.name}" does not have official 9-hole ratings for the "${tee.name}" tee box. We will automatically approximate them (Rating: ${tee.rating.toFixed(1)} / 2 = ${(tee.rating/2).toFixed(1)}, same Slope: ${tee.slope}, Par: ${tee.par} / 2 = ${Math.round(tee.par/2)}).`;
            
            if (document.getElementById("use-auto-approx").checked) {
                document.getElementById("manual-approx-inputs").style.display = "none";
            } else {
                document.getElementById("manual-approx-inputs").style.display = "block";
            }
        }
    } else {
        approxHelper.style.display = "none";
    }
}

function getAutoApproximations() {
    const courseSelect = document.getElementById("score-course");
    const teeSelect = document.getElementById("score-tee");
    const course = state.courses.find(c => c.id === courseSelect.value);
    const tee = course.tees[parseInt(teeSelect.value)];
    
    return {
        rating: Math.round((tee.rating / 2) * 10) / 10,
        slope: tee.slope,
        par: Math.round(tee.par / 2)
    };
}

function getFinal9HoleApproxValues() {
    const useAutoApprox = document.getElementById("use-auto-approx").checked;
    if (useAutoApprox) {
        return getAutoApproximations();
    } else {
        const ratingInput = parseFloat(document.getElementById("manual-rating").value);
        const slopeInput = parseInt(document.getElementById("manual-slope").value);
        const parInput = parseInt(document.getElementById("manual-par").value);
        
        const auto = getAutoApproximations();
        return {
            rating: isNaN(ratingInput) ? auto.rating : ratingInput,
            slope: isNaN(slopeInput) ? auto.slope : slopeInput,
            par: isNaN(parInput) ? auto.par : parInput
        };
    }
}

// --- FORM HANDLING: ADD CUSTOM COURSE ---

function initCourseFormListeners() {
    const addTeeBtn = document.getElementById("btn-add-tee-row");
    const teesBuilder = document.getElementById("tees-builder");
    const hasOfficialNineCheckbox = document.getElementById("has-official-9");
    const nineTeesSection = document.getElementById("nine-tees-section");
    const nineTeesBuilder = document.getElementById("nine-tees-builder");
    
    // Add Row for 18-hole Tees
    addTeeBtn.addEventListener("click", () => {
        addTeeBuilderRow();
    });

    // Auto-fetch Greenskeeper Data
    const fetchGkBtn = document.getElementById("btn-fetch-gk");
    fetchGkBtn.addEventListener("click", () => {
        const url = document.getElementById("gk-url").value.trim();
        if (url) {
            fetchGreenskeeperData(url);
        } else {
            alert("Please paste a Greenskeeper scorecard URL first.");
        }
    });

    // Checkbox toggles official 9-hole inputs
    hasOfficialNineCheckbox.addEventListener("change", () => {
        if (hasOfficialNineCheckbox.checked) {
            nineTeesSection.style.display = "block";
            generateNineTeeRows();
        } else {
            nineTeesSection.style.display = "none";
            nineTeesBuilder.innerHTML = "";
        }
    });

    // Course Search listener
    document.getElementById("course-search").addEventListener("input", () => {
        renderCourseDirectory();
    });

    // Handle course form submit
    const form = document.getElementById("add-course-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const name = document.getElementById("course-name").value;
        const location = document.getElementById("course-location").value;
        const hasOfficialNine = hasOfficialNineCheckbox.checked;
        
        // Build 18-hole Tees array
        const teeRows = teesBuilder.querySelectorAll(".tee-builder-row");
        const tees = [];
        teeRows.forEach(row => {
            const teeName = row.querySelector(".tee-name-input").value;
            const par = parseInt(row.querySelector(".tee-par-input").value);
            const rating = parseFloat(row.querySelector(".tee-rating-input").value);
            const slope = parseInt(row.querySelector(".tee-slope-input").value);
            
            tees.push({ name: teeName, par: par, rating: rating, slope: slope });
        });
        
        // Build 9-hole Tees array if official checked
        let nineTees = [];
        if (hasOfficialNine) {
            const nineRows = nineTeesBuilder.querySelectorAll(".tee-builder-row");
            nineRows.forEach(row => {
                const teeName = row.querySelector(".tee-name-input").value;
                const par = parseInt(row.querySelector(".tee-par-input").value);
                const rating = parseFloat(row.querySelector(".tee-rating-input").value);
                const slope = parseInt(row.querySelector(".tee-slope-input").value);
                
                nineTees.push({ name: teeName, par: par, rating: rating, slope: slope });
            });
        }
        
        const newCourse = {
            id: 'crs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: name,
            location: location,
            tees: tees,
            hasOfficialNine: hasOfficialNine,
            nineTees: hasOfficialNine ? nineTees : null
        };
        
        // Add to state and save
        state.courses.push(newCourse);
        saveData();
        triggerSyncIfEnabled();
        
        // Reset and rebuild form
        form.reset();
        hasOfficialNineCheckbox.checked = false;
        nineTeesSection.style.display = "none";
        nineTeesBuilder.innerHTML = "";
        
        // Reset tee builder rows to default single row
        teesBuilder.innerHTML = `
            <div class="tee-builder-row default-row">
                <input type="text" class="tee-name-input" placeholder="Tee Name (e.g. Blue)" required>
                <input type="number" class="tee-par-input" placeholder="Par" min="20" max="80" required>
                <input type="number" class="tee-rating-input" placeholder="Rating" step="0.1" required>
                <input type="number" class="tee-slope-input" placeholder="Slope" min="55" max="155" required>
                <button type="button" class="btn btn-remove-tee" disabled>&times;</button>
            </div>
        `;
        
        // Re-populate selects across app
        populateCourseSelects();
        renderCourseDirectory();
        
        alert(`Course "${name}" added successfully!`);
    });
}

async function fetchGreenskeeperData(gkUrl) {
    const statusDiv = document.getElementById("gk-status");
    statusDiv.style.display = "block";
    statusDiv.textContent = "Fetching scorecard data...";
    
    try {
        // Use allorigins proxy to bypass CORS
        const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(gkUrl);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        const html = data.contents;
        
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Find the tees table. Look for a table containing a th with "Tees"
        const tables = doc.querySelectorAll("table");
        let teeTable = null;
        for (const table of tables) {
            const th = table.querySelector("th");
            if (th && th.textContent.includes("Tees")) {
                teeTable = table;
                break;
            }
        }
        
        if (!teeTable) {
            throw new Error("Could not find the Tees table in the provided URL.");
        }
        
        // Extract rows
        const rows = teeTable.querySelectorAll("tr");
        const tees = [];
        
        // Start from index 1 to skip header row
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].querySelectorAll("td");
            if (cols.length >= 4) {
                // Tee Name, Par, Rating, Slope, [Yardage]
                const name = cols[0].textContent.trim();
                const par = parseInt(cols[1].textContent.trim(), 10);
                const rating = parseFloat(cols[2].textContent.trim());
                const slope = parseInt(cols[3].textContent.trim(), 10);
                
                if (name && !isNaN(par) && !isNaN(rating) && !isNaN(slope)) {
                    tees.push({ name, par, rating, slope });
                }
            }
        }
        
        if (tees.length === 0) {
            throw new Error("Found the Tees table but could not extract any valid tee rows.");
        }
        
        // Populate the builder
        const teesBuilder = document.getElementById("tees-builder");
        teesBuilder.innerHTML = ""; // Clear existing
        
        tees.forEach((tee, index) => {
            addTeeBuilderRow();
            const rows = teesBuilder.querySelectorAll(".tee-builder-row");
            const newRow = rows[rows.length - 1];
            
            newRow.querySelector(".tee-name-input").value = tee.name;
            newRow.querySelector(".tee-par-input").value = tee.par;
            newRow.querySelector(".tee-rating-input").value = tee.rating;
            newRow.querySelector(".tee-slope-input").value = tee.slope;
        });
        
        // Attempt to auto-fill course name if possible
        const titleMatch = html.match(/<title>(.*?)( Scorecard)? - Greenskeeper/i);
        if (titleMatch && titleMatch[1]) {
            const courseNameInput = document.getElementById("course-name");
            if (!courseNameInput.value) {
                courseNameInput.value = titleMatch[1].trim();
            }
        }
        
        statusDiv.style.color = "var(--primary-color)";
        statusDiv.textContent = `Successfully added ${tees.length} tees!`;
        
    } catch (err) {
        statusDiv.style.color = "var(--danger-color)";
        statusDiv.textContent = `Error fetching data: ${err.message}`;
        console.error("Greenskeeper Fetch Error:", err);
    }
}

function addTeeBuilderRow(containerId = "tees-builder") {
    const builder = document.getElementById(containerId);
    const div = document.createElement("div");
    div.className = "tee-builder-row";
    
    div.innerHTML = `
        <input type="text" class="tee-name-input" placeholder="Tee Name (e.g. White)" required>
        <input type="number" class="tee-par-input" placeholder="Par" min="20" max="80" required>
        <input type="number" class="tee-rating-input" placeholder="Rating" step="0.1" required>
        <input type="number" class="tee-slope-input" placeholder="Slope" min="55" max="155" required>
        <button type="button" class="btn btn-remove-tee">&times;</button>
    `;
    
    // Wire up delete row listener
    div.querySelector(".btn-remove-tee").addEventListener("click", () => {
        div.remove();
        updateTeeRemoveButtons(containerId);
    });
    
    builder.appendChild(div);
    updateTeeRemoveButtons(containerId);
}

function updateTeeRemoveButtons(containerId) {
    const builder = document.getElementById(containerId);
    const rows = builder.querySelectorAll(".tee-builder-row");
    const removeButtons = builder.querySelectorAll(".btn-remove-tee");
    
    if (rows.length === 1) {
        removeButtons[0].disabled = true;
    } else {
        removeButtons.forEach(btn => btn.disabled = false);
    }
}

function generateNineTeeRows() {
    const teesBuilder = document.getElementById("tees-builder");
    const nineTeesBuilder = document.getElementById("nine-tees-builder");
    
    // Clear and build matching 9-hole tees rows
    nineTeesBuilder.innerHTML = "";
    
    const parentTeeNames = Array.from(teesBuilder.querySelectorAll(".tee-name-input")).map(input => input.value);
    
    parentTeeNames.forEach(name => {
        const teeName = name || "Unnamed Tee";
        const div = document.createElement("div");
        div.className = "tee-builder-row";
        
        div.innerHTML = `
            <input type="text" class="tee-name-input" value="${teeName}" readonly class="disabled-input">
            <input type="number" class="tee-par-input" placeholder="9-Hole Par" min="10" max="40" required>
            <input type="number" class="tee-rating-input" placeholder="9-Hole Rating" step="0.1" required>
            <input type="number" class="tee-slope-input" placeholder="9-Hole Slope" min="55" max="155" required>
            <span style="width:24px"></span>
        `;
        nineTeesBuilder.appendChild(div);
    });
}

function deleteCourse(courseId) {
    if (confirm("Are you sure you want to delete this custom course? All score history linking to this course will remain, but you won't be able to select it for new score postings.")) {
        state.courses = state.courses.filter(c => c.id !== courseId);
        saveData();
        triggerSyncIfEnabled();
        populateCourseSelects();
        renderCourseDirectory();
    }
}

// --- ROUND HISTORY ACTIONS ---

function deleteRound(index) {
    if (confirm("Are you sure you want to permanently delete this round? This will recalculate your Handicap Index immediately.")) {
        state.rounds.splice(index, 1);
        recalculateAll();
        saveData();
        triggerSyncIfEnabled();
        renderHistoryTable();
    }
}

function openEditModal(index) {
    const round = state.rounds[index];
    
    document.getElementById("edit-score-index").value = index;
    document.getElementById("edit-score-course").value = round.courseName;
    document.getElementById("edit-score-tee").value = round.teeName;
    document.getElementById("edit-score-holes").value = `${round.holes} Holes`;
    document.getElementById("edit-score-gross").value = round.gross;
    document.getElementById("edit-score-date").value = round.date;
    
    document.getElementById("edit-score-modal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("edit-score-modal").style.display = "none";
}

function initScoreFormListeners_edit() {
    const cancelBtn = document.getElementById("btn-cancel-edit");
    const closeBtn = document.getElementById("btn-close-edit-modal");
    const form = document.getElementById("edit-score-form");
    
    cancelBtn.addEventListener("click", closeEditModal);
    closeBtn.addEventListener("click", closeEditModal);
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const index = parseInt(document.getElementById("edit-score-index").value);
        const gross = parseInt(document.getElementById("edit-score-gross").value);
        const date = document.getElementById("edit-score-date").value;
        
        // Update score
        state.rounds[index].gross = gross;
        state.rounds[index].date = date;
        
        // Recalculate everything
        recalculateAll();
        saveData();
        triggerSyncIfEnabled();
        closeEditModal();
        renderHistoryTable();
    });
}
// Attach edit score form listener (wired separately to align layout)
initScoreFormListeners_edit();

// --- SETTINGS VIEW ---

function initSettingsListeners() {
    const methodSelect = document.getElementById("setting-nine-hole-method");
    const overrideInput = document.getElementById("setting-initial-index");
    
    // Load setting states
    methodSelect.value = state.settings.nineHoleMethod;
    if (state.settings.initialIndex !== null) {
        overrideInput.value = state.settings.initialIndex;
    }
    
    // Save setting changes
    methodSelect.addEventListener("change", () => {
        state.settings.nineHoleMethod = methodSelect.value;
        recalculateAll();
        saveData();
    });

    overrideInput.addEventListener("input", () => {
        const val = overrideInput.value;
        state.settings.initialIndex = val !== "" ? parseFloat(val) : null;
        recalculateAll();
        saveData();
    });

    // Reset App Data
    document.getElementById("btn-reset-app").addEventListener("click", () => {
        if (confirm("🚨 WARNING: Are you sure you want to delete ALL logged rounds, scores, and custom courses? This action is permanent and cannot be undone.")) {
            if (confirm("Confirm deletion of all local storage? Click yes to proceed.")) {
                localStorage.clear();
                window.location.reload();
            }
        }
    });
}

// --- DATA BACKUP & RECOVERY ---

function initBackupListeners() {
    const btnExport = document.getElementById("btn-export-data");
    const fileImport = document.getElementById("file-import-data");
    
    // Export JSON file
    btnExport.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `clubhouse_handicap_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Import JSON file
    fileImport.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                
                // Simple validation
                if (parsed.rounds && parsed.courses && parsed.settings) {
                    if (confirm(`Valid backup file found containing ${parsed.rounds.length} rounds. Overwrite your current scores and settings?`)) {
                        state = parsed;
                        saveData();
                        window.location.reload();
                    }
                } else {
                    alert("Invalid backup file. Make sure it's a file exported from this app.");
                }
            } catch (err) {
                console.error("Error reading file:", err);
                alert("Error parsing file. Please make sure it's valid JSON.");
            }
        };
        reader.readAsText(file);
    });
}

// --- DIAGNOSTICS & VERIFICATION ---

function initDiagnostics() {
    const btn = document.getElementById("btn-run-tests");
    const status = document.getElementById("test-results-status");
    
    if (btn && status) {
        btn.addEventListener("click", () => {
            status.style.display = "inline";
            status.style.color = "var(--text-secondary)";
            status.innerText = "Running verification tests...";
            
            setTimeout(() => {
                try {
                    if (typeof runHandicapTests === 'function') {
                        const passed = runHandicapTests();
                        if (passed) {
                            status.style.color = "var(--primary-color)";
                            status.innerText = "✅ Verification Successful: All 8 WHS calculation tests passed!";
                        } else {
                            status.style.color = "var(--danger-color)";
                            status.innerText = "❌ Verification Failed: Some tests failed. Check developer console.";
                        }
                    } else {
                        status.style.color = "var(--danger-color)";
                        status.innerText = "Error: Test suite not loaded.";
                    }
                } catch (e) {
                    status.style.color = "var(--danger-color)";
                    status.innerText = `Error: ${e.message}`;
                }
            }, 500);
        });
    }
}

// --- CHARTING ENGINE ---

function renderChart() {
    const canvas = document.getElementById("handicapChart");
    const placeholder = document.getElementById("chart-placeholder");
    
    if (state.rounds.length < 3) {
        canvas.style.display = "none";
        placeholder.style.display = "flex";
        return;
    }
    
    canvas.style.display = "block";
    placeholder.style.display = "none";
    
    // Get charts context
    const ctx = canvas.getContext('2d');
    
    // Chart labels (dates of rounds)
    const labels = state.rounds.map(r => formatDate(r.date));
    
    // Data series
    const handicapHistory = state.rounds.map(r => r.runningHandicap);
    const scoreDifferentials = state.rounds.map(r => r.differential);
    
    // Destroy previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Theme Colors for Charts
    const isDark = document.body.classList.contains("theme-dark");
    const textColor = isDark ? '#8e9e94' : '#5e6b62';
    const gridColor = isDark ? '#27312c' : '#e3e0d5';
    
    const primaryLineColor = isDark ? '#378c69' : '#1e4d3a';
    const accentLineColor = isDark ? '#e5b654' : '#c59b48';
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Handicap Index',
                    data: handicapHistory,
                    borderColor: primaryLineColor,
                    backgroundColor: isDark ? 'rgba(55, 140, 105, 0.1)' : 'rgba(30, 77, 58, 0.05)',
                    borderWidth: 3.5,
                    pointRadius: 4,
                    pointBackgroundColor: primaryLineColor,
                    tension: 0.2,
                    fill: true
                },
                {
                    label: 'Round Score Differential',
                    data: scoreDifferentials,
                    borderColor: accentLineColor,
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    pointRadius: 3.5,
                    pointBackgroundColor: accentLineColor,
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Outfit',
                            weight: '500'
                        },
                        color: isDark ? '#f0f4f1' : '#1b201c'
                    }
                },
                tooltip: {
                    bodyFont: {
                        family: 'Outfit'
                    },
                    titleFont: {
                        family: 'Outfit',
                        weight: '700'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Outfit',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Outfit',
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function updateChartTheme() {
    if (chartInstance) {
        renderChart();
    }
}

// --- UTILITY FUNCTIONS ---

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr + "T00:00:00"); // Avoid timezone shifting
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch (e) {
        return dateStr;
    }
}

// --- GITHUB CLOUD SYNCHRONIZATION CONTROLLER ---

function initGitHubSync() {
    const setupSection = document.getElementById("github-sync-setup");
    const activeSection = document.getElementById("github-sync-active");
    
    if (!setupSection || !activeSection) return;
    
    const sync = state.settings.githubSync;
    
    if (sync && sync.enabled) {
        setupSection.style.display = "none";
        activeSection.style.display = "block";
        
        document.getElementById("sync-active-repo").innerText = `${sync.username}/${sync.repo}`;
        updateSyncTimeDisplay();
    } else {
        setupSection.style.display = "block";
        activeSection.style.display = "none";
        
        if (sync) {
            document.getElementById("sync-github-username").value = sync.username || "";
            document.getElementById("sync-github-repo").value = sync.repo || "Golf-Handicap-App";
        }
        document.getElementById("sync-github-token").value = "";
    }
    
    // Wire up Enable Sync button
    const btnEnable = document.getElementById("btn-enable-sync");
    if (btnEnable) {
        const newBtn = btnEnable.cloneNode(true);
        btnEnable.parentNode.replaceChild(newBtn, btnEnable);
        
        newBtn.addEventListener("click", async () => {
            const username = document.getElementById("sync-github-username").value.trim();
            const repo = document.getElementById("sync-github-repo").value.trim();
            const token = document.getElementById("sync-github-token").value.trim();
            
            if (!username || !repo || !token) {
                alert("Please fill in all fields (username, repository, and token).");
                return;
            }
            
            newBtn.disabled = true;
            newBtn.innerText = "Connecting...";
            
            // Set temporary token in localStorage to test connection
            localStorage.setItem("clubhouse_github_token", token);
            
            // Update state temporarily
            state.settings.githubSync.username = username;
            state.settings.githubSync.repo = repo;
            state.settings.githubSync.enabled = true;
            
            try {
                await syncWithGitHub();
                saveData();
                initGitHubSync();
                alert("GitHub Sync enabled and synced successfully!");
            } catch (err) {
                // Connection failed: revert changes
                localStorage.removeItem("clubhouse_github_token");
                state.settings.githubSync.enabled = false;
                initGitHubSync();
                alert(`Failed to enable sync: ${err}`);
            } finally {
                newBtn.disabled = false;
                newBtn.innerText = "Enable GitHub Sync";
            }
        });
    }
    
    // Wire up Disconnect button
    const btnDisable = document.getElementById("btn-disable-sync");
    if (btnDisable) {
        const newBtn = btnDisable.cloneNode(true);
        btnDisable.parentNode.replaceChild(newBtn, btnDisable);
        
        newBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to disconnect from GitHub Cloud Sync? Your local scores will remain intact, but they will no longer sync automatically.")) {
                localStorage.removeItem("clubhouse_github_token");
                state.settings.githubSync.enabled = false;
                state.settings.githubSync.lastSync = null;
                saveData();
                initGitHubSync();
            }
        });
    }
    
    // Wire up Sync Now button
    const btnSyncNow = document.getElementById("btn-sync-now");
    if (btnSyncNow) {
        const newBtn = btnSyncNow.cloneNode(true);
        btnSyncNow.parentNode.replaceChild(newBtn, btnSyncNow);
        
        newBtn.addEventListener("click", async () => {
            const statusText = document.getElementById("sync-operation-status");
            newBtn.disabled = true;
            if (statusText) {
                statusText.style.display = "inline";
                statusText.style.color = "var(--text-secondary)";
                statusText.innerText = "Syncing...";
            }
            
            try {
                await syncWithGitHub();
                saveData();
                
                // Refresh dashboard or history if currently on them
                const activeTab = document.querySelector(".tab-btn.active").getAttribute("data-tab");
                if (activeTab === 'dashboard-view') renderDashboard();
                else if (activeTab === 'history-view') renderHistoryTable();
                else if (activeTab === 'courses-view') renderCourseDirectory();
                
                if (statusText) {
                    statusText.style.color = "var(--primary-color)";
                    statusText.innerText = "Sync completed!";
                    setTimeout(() => { statusText.style.display = "none"; }, 3000);
                }
            } catch (err) {
                if (statusText) {
                    statusText.style.color = "var(--danger-color)";
                    statusText.innerText = "Sync failed.";
                }
                alert(`Sync failed: ${err}`);
            } finally {
                newBtn.disabled = false;
            }
        });
    }
}

function updateSyncTimeDisplay() {
    const timeEl = document.getElementById("sync-last-time");
    if (timeEl && state.settings.githubSync && state.settings.githubSync.lastSync) {
        const date = new Date(state.settings.githubSync.lastSync);
        timeEl.innerText = date.toLocaleString();
    }
}

async function syncWithGitHub() {
    const sync = state.settings.githubSync;
    const token = localStorage.getItem("clubhouse_github_token");
    
    if (!sync || !sync.enabled || !token) {
        return Promise.reject("Sync is not enabled or credentials are missing.");
    }
    
    const url = `https://api.github.com/repos/${sync.username}/${sync.repo}/contents/scores.json`;
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };
    
    // 1. Pull current file from GitHub
    let cloudData = null;
    let fileSha = null;
    
    try {
        const res = await fetch(url, { headers });
        if (res.status === 200) {
            const data = await res.json();
            fileSha = data.sha;
            const contentBase64 = data.content.replace(/\s/g, '');
            const decodedText = decodeURIComponent(escape(atob(contentBase64)));
            cloudData = JSON.parse(decodedText);
        } else if (res.status === 404) {
            cloudData = null;
        } else if (res.status === 401 || res.status === 403) {
            return Promise.reject("Access denied. Please check your GitHub Personal Access Token.");
        } else {
            return Promise.reject(`Server returned status code ${res.status}`);
        }
    } catch (err) {
        return Promise.reject(`Network error contacting GitHub: ${err.message}`);
    }
    
    // 2. Perform merge logic
    let mergedRounds = [...state.rounds];
    let mergedCourses = [...state.courses];
    
    if (cloudData) {
        const cloudRounds = cloudData.rounds || [];
        const cloudCourses = cloudData.courses || [];
        
        mergedRounds = mergeRounds(state.rounds, cloudRounds);
        
        const localCustom = state.courses.filter(c => c.id.startsWith('crs_'));
        const cloudCustom = cloudCourses.filter(c => c.id.startsWith('crs_'));
        const mergedCustom = mergeCourses(localCustom, cloudCustom);
        const preloaded = state.courses.filter(c => !c.id.startsWith('crs_'));
        
        mergedCourses = [...preloaded, ...mergedCustom];
        
        state.rounds = mergedRounds;
        state.courses = mergedCourses;
        recalculateAll();
        saveData();
    }
    
    // 3. Push merged data back to GitHub
    const payload = {
        rounds: state.rounds,
        courses: state.courses.filter(c => c.id.startsWith('crs_'))
    };
    
    const payloadText = JSON.stringify(payload, null, 2);
    const payloadBase64 = btoa(unescape(encodeURIComponent(payloadText)));
    
    const putBody = {
        message: fileSha ? "Sync scores via Clubhouse Golf Handicap App" : "Initialize score file via Clubhouse Golf Handicap App",
        content: payloadBase64
    };
    
    if (fileSha) {
        putBody.sha = fileSha;
    }
    
    try {
        const putRes = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(putBody)
        });
        
        if (putRes.status === 200 || putRes.status === 201) {
            state.settings.githubSync.lastSync = new Date().toISOString();
            saveData();
            updateSyncTimeDisplay();
        } else {
            const errData = await putRes.json();
            return Promise.reject(`Failed to upload scores: ${errData.message}`);
        }
    } catch (err) {
        return Promise.reject(`Network error during upload: ${err.message}`);
    }
    
    return true;
}

function mergeRounds(local, cloud) {
    const map = new Map();
    cloud.forEach(r => map.set(r.id, r));
    local.forEach(r => map.set(r.id, r));
    
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(a.date) - new Date(b.date));
    return merged;
}

function mergeCourses(local, cloud) {
    const map = new Map();
    cloud.forEach(c => map.set(c.id, c));
    local.forEach(c => map.set(c.id, c));
    return Array.from(map.values());
}

function triggerSyncIfEnabled() {
    if (state.settings.githubSync && state.settings.githubSync.enabled) {
        syncWithGitHub().catch(err => console.error("Background sync failed:", err));
    }
}
