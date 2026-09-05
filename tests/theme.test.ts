import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTheme, themeConfig, yokohamaSunTimes } from '../packages/core/theme.ts';

test('Yokohama blue is the default outside the event', () => {
  assert.equal(resolveTheme(themeConfig, Date.parse('2026-09-05T00:00:00Z')), 'yokohama');
});
const eventConfig = {
  ...themeConfig,
  nightEnabled: false,
  seasons: themeConfig.seasons.map((s) => ({ ...s, enabled: true })),
};

test('season begins and ends at Japanese midnight, regardless of reader timezone', () => {
  assert.equal(resolveTheme(eventConfig, Date.parse('2027-03-18T14:59:59Z')), 'yokohama');
  assert.equal(resolveTheme(eventConfig, Date.parse('2027-03-18T15:00:00Z')), 'green-expo');
  assert.equal(resolveTheme(eventConfig, Date.parse('2027-09-26T14:59:59Z')), 'green-expo');
  assert.equal(resolveTheme(eventConfig, Date.parse('2027-09-26T15:00:00Z')), 'yokohama');
});
test('an editor can disable the event or force a theme', () => {
  const now = Date.parse('2027-04-01T00:00:00Z');
  assert.equal(resolveTheme({ ...themeConfig, seasons: [] }, now), 'yokohama');
  assert.equal(resolveTheme({ ...themeConfig, override: 'yokohama' }, now), 'yokohama');
  assert.equal(resolveTheme({ ...themeConfig, override: 'green-expo' }, 0), 'green-expo');
});

// Independent published reference: NAOJ Yokohama 2026-09 table (35.45 N, 139.65 E).
// Approximation is for presentation; allow at most three minutes vs the almanac.
test('solar times agree with the Yokohama almanac', () => {
  for (const [date, rise, set] of [
    ['2026-09-01', '05:13', '18:09'],
    ['2026-09-05', '05:16', '18:04'],
    ['2026-09-30', '05:35', '17:27'],
    ['2026-06-01', '04:28', '18:51'],
    ['2026-12-21', '06:46', '16:32'],
  ]) {
    const sun = yokohamaSunTimes(Date.parse(`${date}T12:00:00+09:00`));
    assert.ok(Math.abs(sun.sunrise - Date.parse(`${date}T${rise}:00+09:00`)) < 180000);
    assert.ok(Math.abs(sun.sunset - Date.parse(`${date}T${set}:00+09:00`)) < 180000);
  }
});
test('sunset starts night; sunrise restores day, including JST midnight and leap day', () => {
  for (const date of ['2026-01-01', '2026-06-21', '2026-12-21', '2028-02-29']) {
    const midnight = Date.parse(`${date}T00:00:00+09:00`);
    const sun = yokohamaSunTimes(midnight);
    assert.equal(resolveTheme(themeConfig, midnight), 'yokohama-night');
    assert.equal(resolveTheme(themeConfig, sun.sunrise - 1), 'yokohama-night');
    assert.equal(resolveTheme(themeConfig, sun.sunrise), 'yokohama');
    assert.equal(resolveTheme(themeConfig, sun.sunset - 1), 'yokohama');
    assert.equal(resolveTheme(themeConfig, sun.sunset), 'yokohama-night');
    assert.ok(sun.sunrise < sun.sunset);
  }
});
test('season and manual override take precedence over night; event is on hold', () => {
  const now = Date.parse('2027-04-01T23:00:00+09:00');
  assert.equal(resolveTheme(themeConfig, now), 'yokohama-night');
  assert.equal(resolveTheme({ ...eventConfig, nightEnabled: true }, now), 'green-expo');
  assert.equal(resolveTheme({ ...themeConfig, override: 'yokohama' }, now), 'yokohama');
  assert.equal(resolveTheme({ ...themeConfig, nightEnabled: false }, now), 'yokohama');
});
