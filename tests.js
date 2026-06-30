// Clubhouse Golf Handicap Tracker - Calculation Tests
// Load this file in the browser and run `runHandicapTests()` in the console.

function runHandicapTests() {
    console.group("⛳ Starting Handicap Tracker Unit Tests");
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`%c[PASS] ${message}`, "color: green");
            passed++;
        } else {
            console.error(`[FAIL] ${message}`);
            failed++;
        }
    }

    // --- TEST 1: 18-HOLE DIFFERENTIAL CALCULATION ---
    try {
        // Score = 85, Rating = 71.7, Slope = 123
        // Expected diff = (113 / 123) * (85 - 71.7) = 0.918699 * 13.3 = 12.218 = 12.2
        const diff18 = calculateDifferential(85, 71.7, 123);
        const roundedDiff18 = Math.round(diff18 * 10) / 10;
        assert(roundedDiff18 === 12.2, `18-Hole Differential math: score 85 on 71.7/123. Got ${roundedDiff18}, expected 12.2`);
    } catch (e) {
        assert(false, `18-Hole Differential failed with error: ${e.message}`);
    }

    // --- TEST 2: 9-HOLE SIMPLE SCALING CALCULATION ---
    try {
        // Score = 42, Rating = 35.8, Slope = 119
        // 9-hole diff = (113 / 119) * (42 - 35.8) = 0.949579 * 6.2 = 5.887
        // Doubled = 11.77 = 11.8
        const nineHoleDiff = calculateDifferential(42, 35.8, 119);
        const doubledDiff = Math.round((nineHoleDiff * 2) * 10) / 10;
        assert(doubledDiff === 11.8, `9-Hole Simple Scaling (Doubled) math: score 42 on 35.8/119. Got ${doubledDiff}, expected 11.8`);
    } catch (e) {
        assert(false, `9-Hole Simple Scaling failed with error: ${e.message}`);
    }

    // --- TEST 3: 9-HOLE WHS 2024 EXPECTED SCORE CALCULATION ---
    try {
        // Score = 42, Rating = 35.8, Slope = 119, Handicap Index = 14.5
        // 9-hole diff = (113 / 119) * (42 - 35.8) = 5.887
        // Expected 9-hole diff = (14.5 * 0.52) + 1.2 = 7.54 + 1.2 = 8.74
        // Combined diff = 5.887 + 8.74 = 14.627 = 14.6
        const nineHoleDiff = calculateDifferential(42, 35.8, 119);
        const expectedDiff = (14.5 * 0.52) + 1.2;
        const finalDiff = Math.round((nineHoleDiff + expectedDiff) * 10) / 10;
        assert(finalDiff === 14.6, `WHS 2024 Expected Score math: score 42 on 35.8/119, index 14.5. Got ${finalDiff}, expected 14.6`);
    } catch (e) {
        assert(false, `WHS 2024 expected score failed with error: ${e.message}`);
    }

    // --- TEST 4: HANDICAP INDEX TABLE - 3 ROUNDS ---
    try {
        // 3 Rounds: lowest 1 used, adjustment -2.0
        const diffs = [12.2, 14.6, 18.0]; // Lowest is 12.2
        // Expected Index = 12.2 - 2.0 = 10.2
        const index = calculateHandicapFromDiffs(diffs);
        assert(index === 10.2, `Handicap from 3 rounds (Lowest 1 - 2.0): Got ${index}, expected 10.2`);
    } catch (e) {
        assert(false, `Handicap from 3 rounds failed with error: ${e.message}`);
    }

    // --- TEST 5: HANDICAP INDEX TABLE - 5 ROUNDS ---
    try {
        // 5 Rounds: lowest 1 used, adjustment 0.0
        const diffs = [10.5, 12.2, 14.6, 18.0, 22.1]; // Lowest is 10.5
        // Expected Index = 10.5
        const index = calculateHandicapFromDiffs(diffs);
        assert(index === 10.5, `Handicap from 5 rounds (Lowest 1 - 0.0): Got ${index}, expected 10.5`);
    } catch (e) {
        assert(false, `Handicap from 5 rounds failed with error: ${e.message}`);
    }

    // --- TEST 6: HANDICAP INDEX TABLE - 6 ROUNDS ---
    try {
        // 6 Rounds: average of lowest 2, adjustment -1.0
        const diffs = [10.5, 12.5, 14.6, 18.0, 22.1, 24.0]; // Lowest 2 are 10.5 and 12.5
        // Avg = 11.5
        // Expected Index = 11.5 - 1.0 = 10.5
        const index = calculateHandicapFromDiffs(diffs);
        assert(index === 10.5, `Handicap from 6 rounds (Avg 2 - 1.0): Got ${index}, expected 10.5`);
    } catch (e) {
        assert(false, `Handicap from 6 rounds failed with error: ${e.message}`);
    }

    // --- TEST 7: HANDICAP INDEX TABLE - 20 ROUNDS ---
    try {
        // 20 Rounds: average of lowest 8, adjustment 0.0
        const diffs = [
            10.0, 10.0, 10.0, 10.0, // 4 lowest
            11.0, 11.0, 11.0, 11.0, // next 4 lowest (total 8: average is 10.5)
            12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 19.0, 20.0, 21.0, 22.0, 23.0
        ];
        // Expected Index = 10.5
        const index = calculateHandicapFromDiffs(diffs);
        assert(index === 10.5, `Handicap from 20 rounds (Avg 8): Got ${index}, expected 10.5`);
    } catch (e) {
        assert(false, `Handicap from 20 rounds failed with error: ${e.message}`);
    }

    // --- TEST 8: WHS CAP ADJUSTMENT LIMITS ---
    try {
        // Test lower bound check
        const extremeDiffs = [-15.0, -15.0, -15.0]; // Lowest is -15.0. Adj -2.0 = -17.0
        const index = calculateHandicapFromDiffs(extremeDiffs);
        assert(index === -10.0, `Handicap lower bound cap: Got ${index}, expected -10.0`);
    } catch (e) {
        assert(false, `Handicap bound cap failed with error: ${e.message}`);
    }

    console.groupEnd();
    console.log(`%cTests complete. Passed: ${passed}, Failed: ${failed}`, `font-weight: bold; color: ${failed > 0 ? "red" : "green"}`);
    return failed === 0;
}
