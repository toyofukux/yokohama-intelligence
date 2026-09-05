import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveTheme, themeConfig } from '../packages/core/theme.ts';

test('Yokohama blue is the default outside the event', () => {
  assert.equal(resolveTheme(themeConfig, Date.parse('2026-09-05T00:00:00Z')), 'yokohama');
});
test('season begins and ends at Japanese midnight, regardless of reader timezone', () => {
  assert.equal(resolveTheme(themeConfig, Date.parse('2027-03-18T14:59:59Z')), 'yokohama');
  assert.equal(resolveTheme(themeConfig, Date.parse('2027-03-18T15:00:00Z')), 'green-expo');
  assert.equal(resolveTheme(themeConfig, Date.parse('2027-09-26T14:59:59Z')), 'green-expo');
  assert.equal(resolveTheme(themeConfig, Date.parse('2027-09-26T15:00:00Z')), 'yokohama');
});
test('an editor can disable the event or force a theme', () => {
  const now = Date.parse('2027-04-01T00:00:00Z');
  assert.equal(resolveTheme({ ...themeConfig, seasons: [] }, now), 'yokohama');
  assert.equal(resolveTheme({ ...themeConfig, override: 'yokohama' }, now), 'yokohama');
  assert.equal(resolveTheme({ ...themeConfig, override: 'green-expo' }, 0), 'green-expo');
});
