const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateCompletedDailyUnitsFromEntries,
  calculateDailyCompletedUnits,
  calculateGroupTorahProgress,
  calculateStudentTorahProgress,
  calculateStudentTripProgress,
  dailyCompletionPercentageFromEntry,
  normalizeParsedTorahEngagement,
} = require('../src/lib/bna/torah-learning');

test('Listening goal full completion', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'LISTENING',
    engagedListeningMinutes: 30,
  });

  assert.equal(result.countedMinutes, 30);
  assert.equal(result.individualPercentage, 100);
  assert.equal(result.individualComplete, true);
});

test('Listening goal partial completion', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'LISTENING',
    engagedListeningMinutes: 15,
  });

  assert.equal(result.countedMinutes, 15);
  assert.equal(result.individualPercentage, 50);
  assert.equal(result.individualComplete, false);
});

test('Listening goal over completion caps at 100', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'LISTENING',
    engagedListeningMinutes: 45,
  });

  assert.equal(result.countedMinutes, 45);
  assert.equal(result.individualPercentage, 100);
  assert.equal(result.individualComplete, true);
});

test('Inside goal full inside completion', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'INSIDE',
    insideEngagedMinutes: 30,
  });

  assert.equal(result.countedMinutes, 30);
  assert.equal(result.individualPercentage, 100);
  assert.equal(result.individualComplete, true);
});

test('Inside goal listening without following counts as half', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'INSIDE',
    listeningWithoutFollowingMinutes: 30,
  });

  assert.equal(result.countedMinutes, 15);
  assert.equal(result.individualPercentage, 50);
  assert.equal(result.individualComplete, false);
});

test('Inside goal half inside and half listening reaches 75 percent', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'INSIDE',
    insideEngagedMinutes: 15,
    listeningWithoutFollowingMinutes: 15,
  });

  assert.equal(result.countedMinutes, 22.5);
  assert.equal(result.individualPercentage, 75);
  assert.equal(result.individualComplete, false);
});

test('Parsed Torah timer maps inside, listening, and distracted minutes', () => {
  const result = normalizeParsedTorahEngagement(
    {
      goal_type: 'inside',
      inside_engaged_minutes: 10,
      listening_without_following_minutes: 10,
      distracted_minutes: 5,
      timer_total_minutes: 25,
    },
    {
      goalMinutes: 20,
      goalType: 'INSIDE',
    }
  );

  assert.equal(result.hasProgressSignal, true);
  assert.equal(result.hasTimerBreakdown, true);
  assert.equal(result.engagedListeningMinutes, 20);
  assert.equal(result.insideEngagedMinutes, 10);
  assert.equal(result.listeningWithoutFollowingMinutes, 10);
  assert.equal(result.distractedMinutes, 5);
  assert.equal(result.countedMinutes, 15);
  assert.equal(result.progressPercent, 75);
  assert.equal(result.dailyCompletedBoolean, false);
  assert.equal(result.engagementPercent, 80);
  assert.equal(result.engagementLevel, 'medium');
});

test('Parsed Torah percentage update maps to active inside goal minutes', () => {
  const result = normalizeParsedTorahEngagement(
    {
      daily_completion_percentage: 50,
    },
    {
      goalMinutes: 20,
      goalType: 'INSIDE',
    }
  );

  assert.equal(result.hasProgressSignal, true);
  assert.equal(result.hasTimerBreakdown, false);
  assert.equal(result.engagedListeningMinutes, 10);
  assert.equal(result.insideEngagedMinutes, 10);
  assert.equal(result.listeningWithoutFollowingMinutes, 0);
  assert.equal(result.countedMinutes, 10);
  assert.equal(result.progressPercent, 50);
});

test('Parsed Torah listening-only shorthand maps to half credit for inside goals', () => {
  const result = normalizeParsedTorahEngagement(
    {
      listening_minutes: 20,
    },
    {
      goalMinutes: 20,
      goalType: 'INSIDE',
    }
  );

  assert.equal(result.insideEngagedMinutes, 0);
  assert.equal(result.listeningWithoutFollowingMinutes, 20);
  assert.equal(result.countedMinutes, 10);
  assert.equal(result.progressPercent, 50);
});

test('Parsed engagement-only percentage does not become daily completion', () => {
  const result = normalizeParsedTorahEngagement(
    {
      engagement_percentage: 80,
    },
    {
      goalMinutes: 20,
      goalType: 'INSIDE',
    }
  );

  assert.equal(result.hasProgressSignal, false);
  assert.equal(result.progressPercent, null);
});

test('Inside goal distracted time does not count', () => {
  const result = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'INSIDE',
    insideEngagedMinutes: 0,
    listeningWithoutFollowingMinutes: 0,
    engagedListeningMinutes: 0,
  });

  assert.equal(result.countedMinutes, 0);
  assert.equal(result.individualPercentage, 0);
  assert.equal(result.individualComplete, false);
});

test('Group progress all complete', () => {
  const result = calculateGroupTorahProgress([100, 100, 100, 100, 100]);

  assert.equal(result.groupPercentage, 100);
  assert.equal(result.tripUnlocked, true);
});

test('Group progress one incomplete', () => {
  const result = calculateGroupTorahProgress([100, 100, 100, 100, 50]);

  assert.equal(result.groupPercentage, 90);
  assert.equal(result.tripUnlocked, false);
});

test('Goal minutes 0 throws validation error', () => {
  assert.throws(
    () =>
      calculateStudentTorahProgress({
        goalMinutes: 0,
        goalType: 'LISTENING',
        engagedListeningMinutes: 10,
      }),
    /goal_minutes must be greater than 0/
  );
});

test('Trip progress carried-over only rounds to 12 percent', () => {
  const result = calculateStudentTripProgress({
    carriedOverCompletedUnits: 3.5,
    completedDailyUnits: 0,
    totalRequiredUnits: 30,
  });

  assert.equal(result.totalCompletedUnits, 3.5);
  assert.equal(result.totalTripProgressPercentage, 12);
  assert.equal(result.totalTripComplete, false);
});

test('Trip progress carried-over plus one completed day reaches 15 percent', () => {
  const result = calculateStudentTripProgress({
    carriedOverCompletedUnits: 3.5,
    completedDailyUnits: 1,
    totalRequiredUnits: 30,
  });

  assert.equal(result.totalCompletedUnits, 4.5);
  assert.equal(result.totalTripProgressPercentage, 15);
  assert.equal(result.totalTripComplete, false);
});

test('Trip progress counts partial daily completion units', () => {
  const halfDay = calculateStudentTripProgress({
    carriedOverCompletedUnits: 4.5,
    completedDailyUnits: calculateDailyCompletedUnits(50),
    totalRequiredUnits: 30,
  });
  const twoThirdsDay = calculateStudentTripProgress({
    carriedOverCompletedUnits: 4.5,
    completedDailyUnits: calculateDailyCompletedUnits(66.67),
    totalRequiredUnits: 30,
  });

  assert.equal(halfDay.totalCompletedUnits, 5);
  assert.equal(halfDay.totalTripProgressPercentage, 17);
  assert.equal(Number(twoThirdsDay.totalCompletedUnits.toFixed(4)), 5.1667);
  assert.equal(twoThirdsDay.totalTripProgressPercentage, 17);
});

test('Daily completion rows calculate cumulative fractional trip units', () => {
  const entries = [
    { daily_completion_percentage: 100 },
    { daily_completion_percentage: 50 },
    { daily_completion_percentage: 66.67 },
    { daily_completion_percentage: 0, daily_completed_boolean: false },
    { daily_completed_boolean: true },
  ];

  assert.equal(dailyCompletionPercentageFromEntry({ daily_completed_boolean: true }), 100);
  assert.equal(Math.round(calculateCompletedDailyUnitsFromEntries(entries) * 100), 317);
});

test('Task 134 fractions do not flatten every student to 15 percent', () => {
  const carriedOverCompletedUnits = 3.5;
  const totalRequiredUnits = 30;
  const migrationSeedUnit = 1;
  const fridayFractions = [1, 1, 0.5, 0.5, 2 / 3];
  const percentages = fridayFractions.map((fraction) =>
    calculateStudentTripProgress({
      carriedOverCompletedUnits,
      completedDailyUnits: migrationSeedUnit + fraction,
      totalRequiredUnits,
    }).totalTripProgressPercentage
  );

  assert.deepEqual(percentages, [18, 18, 17, 17, 17]);
  assert.equal(calculateGroupTorahProgress(percentages).groupPercentage, 17);
});

test('Daily 100 percent does not imply full trip completion after one day', () => {
  const daily = calculateStudentTorahProgress({
    goalMinutes: 30,
    goalType: 'LISTENING',
    engagedListeningMinutes: 30,
  });
  const trip = calculateStudentTripProgress({
    carriedOverCompletedUnits: 3.5,
    completedDailyUnits: calculateDailyCompletedUnits(daily.individualPercentageRaw),
    totalRequiredUnits: 30,
  });

  assert.equal(daily.individualPercentage, 100);
  assert.equal(trip.totalTripProgressPercentage, 15);
  assert.equal(trip.totalTripComplete, false);
});

test('Group trip progress stays locked at 15 percent when everyone is at 15', () => {
  const result = calculateGroupTorahProgress([15, 15, 15, 15, 15]);

  assert.equal(result.groupPercentageRaw, 15);
  assert.equal(result.groupPercentage, 15);
  assert.equal(result.tripUnlocked, false);
});

test('Group trip progress keeps raw average when one student is at 99', () => {
  const result = calculateGroupTorahProgress([100, 100, 100, 100, 99]);

  assert.equal(result.groupPercentageRaw, 99.8);
  assert.equal(result.tripUnlocked, false);
});

test('Trip progress reaches 100 only when all students are at 100', () => {
  const result = calculateGroupTorahProgress([100, 100, 100, 100, 100]);

  assert.equal(result.groupPercentageRaw, 100);
  assert.equal(result.groupPercentage, 100);
  assert.equal(result.tripUnlocked, true);
});
