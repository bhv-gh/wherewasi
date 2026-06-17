import { tripDates, countedDateSet, schengenUsage, perCountry, isDateCovered } from './schengen';

// Helper to build a trip.
const trip = (country, arrive, leave, is_schengen) => ({
  country_code: country,
  arrive_at: arrive,
  leave_at: leave,
  ...(is_schengen === undefined ? {} : { is_schengen }),
});

describe('tripDates', () => {
  test('anytime counts entry and exit days (3-day trip = 3 days)', () => {
    const t = trip('FR', '2026-01-01T14:00:00', '2026-01-03T10:00:00');
    expect(tripDates(t, 'anytime')).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });

  test('midnight counts only nights present at 00:00 (same trip = 2 days)', () => {
    const t = trip('FR', '2026-01-01T14:00:00', '2026-01-03T10:00:00');
    expect(tripDates(t, 'midnight')).toEqual(['2026-01-02', '2026-01-03']);
  });

  test('single-day trip: anytime = 1 day, midnight = 0 days', () => {
    const t = trip('FR', '2026-01-01T08:00:00', '2026-01-01T20:00:00');
    expect(tripDates(t, 'anytime')).toEqual(['2026-01-01']);
    expect(tripDates(t, 'midnight')).toEqual([]);
  });

  test('open-ended trip counts up to asOf', () => {
    const t = trip('FR', '2026-01-01T00:00:00', null);
    const asOf = new Date('2026-01-03T12:00:00');
    expect(tripDates(t, 'anytime', asOf)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03']);
  });

  test('invalid (leave before arrive) yields no days', () => {
    const t = trip('FR', '2026-01-05T00:00:00', '2026-01-01T00:00:00');
    expect(tripDates(t, 'anytime')).toEqual([]);
  });
});

describe('countedDateSet de-duplicates overlapping trips', () => {
  test('overlapping Schengen trips do not double-count', () => {
    const trips = [
      trip('FR', '2026-01-01T10:00:00', '2026-01-05T10:00:00'),
      trip('DE', '2026-01-04T10:00:00', '2026-01-07T10:00:00'),
    ];
    // Union of Jan 1..7 = 7 distinct days even though Jan 4,5 overlap.
    const set = countedDateSet(trips, 'anytime', { schengenOnly: true });
    expect(set.size).toBe(7);
  });

  test('schengenOnly excludes non-Schengen trips', () => {
    const trips = [
      trip('FR', '2026-01-01T10:00:00', '2026-01-02T10:00:00', true),
      trip('US', '2026-01-10T10:00:00', '2026-01-20T10:00:00', false),
    ];
    expect(countedDateSet(trips, 'anytime', { schengenOnly: true }).size).toBe(2);
    expect(countedDateSet(trips, 'anytime', { schengenOnly: false }).size).toBe(13);
  });
});

describe('schengenUsage 90/180', () => {
  test('counts days in trailing 180-day window and computes remaining', () => {
    const trips = [trip('ES', '2026-03-01T10:00:00', '2026-03-10T10:00:00')]; // 10 days
    const asOf = new Date('2026-03-15T12:00:00');
    const u = schengenUsage(trips, 'anytime', asOf);
    expect(u.used).toBe(10);
    expect(u.remaining).toBe(80);
    expect(u.total).toBe(90);
  });

  test('days older than 180 days fall out of the window', () => {
    // A trip well over 180 days before asOf should not count.
    const trips = [trip('IT', '2025-01-01T10:00:00', '2025-01-10T10:00:00')];
    const asOf = new Date('2026-03-15T12:00:00');
    const u = schengenUsage(trips, 'anytime', asOf);
    expect(u.used).toBe(0);
    expect(u.remaining).toBe(90);
  });

  test('flags overstay beyond 90 days', () => {
    const trips = [trip('FR', '2026-01-01T00:00:00', '2026-05-01T00:00:00')]; // ~121 days
    const asOf = new Date('2026-05-01T12:00:00');
    const u = schengenUsage(trips, 'anytime', asOf);
    expect(u.used).toBeGreaterThan(90);
    expect(u.remaining).toBe(0);
    expect(u.overstay).toBe(true);
  });
});

describe('perCountry', () => {
  test('aggregates days per country sorted desc', () => {
    const trips = [
      trip('FR', '2026-01-01T10:00:00', '2026-01-05T10:00:00'), // 5
      trip('DE', '2026-02-01T10:00:00', '2026-02-02T10:00:00'), // 2
    ];
    const rows = perCountry(trips, 'anytime');
    expect(rows[0].code).toBe('FR');
    expect(rows[0].days).toBe(5);
    expect(rows[1].code).toBe('DE');
    expect(rows[1].days).toBe(2);
  });
});

describe('isDateCovered', () => {
  test('true within a trip, false outside', () => {
    const trips = [trip('FR', '2026-01-10T10:00:00', '2026-01-15T10:00:00')];
    expect(isDateCovered(trips, new Date('2026-01-12T09:00:00'))).toBe(true);
    expect(isDateCovered(trips, new Date('2026-01-20T09:00:00'))).toBe(false);
  });
});
