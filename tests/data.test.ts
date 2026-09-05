import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import raw from '../data/published/population.json';
import { compare, fact, series } from '../packages/core/query.ts';
import { validateDataset } from '../packages/core/schema.ts';
import { decodeCsv, parsePopulation } from '../packages/ingestion/population.ts';

const data = validateDataset(raw);
const snapshot = data.snapshots[0];
const csv = decodeCsv(readFileSync(snapshot.path));
test('official data has 18 wards, complete metrics and source-backed queries', () => {
  const latest = fact(data, '141097', 'population');
  assert.ok(latest.observation.value > 0);
  assert.equal(latest.source.id, latest.observation.sourceId);
  assert.equal(compare(data, 'population', latest.observation.period).length, 18);
  assert.equal(series(data, '141097', 'population').length, data.snapshots.length);
});
test('missing values never become zero', () => {
  const lines = csv.split('\r\n');
  const cells = lines[1].split(',');
  cells[5] = '';
  lines[1] = cells.join(',');
  assert.throws(() => parsePopulation(lines.join('\r\n'), snapshot.id), /Missing or invalid/);
});
test('format drift is a hard failure', () => {
  assert.throws(
    () => parsePopulation(csv.replace('人口総数［人］', '人数'), snapshot.id),
    /schema/,
  );
  assert.throws(() => parsePopulation(csv.replace('141011', '141003'), snapshot.id), /geography/);
});
test('zero padded and non padded dates parse to identical periods', () => {
  const current = csv.replaceAll('2024/01/01', '2024/1/1');
  assert.deepEqual(parsePopulation(current, snapshot.id), parsePopulation(csv, snapshot.id));
});
test('tampered observations fail arithmetic checks', () => {
  const broken = structuredClone(raw);
  broken.observations[0].value += 50;
  assert.throws(() => validateDataset(broken), /mismatch/);
});
test('duplicate, missing source, missing ward and future values fail closed', () => {
  const duplicate = structuredClone(raw);
  duplicate.observations.push(duplicate.observations[0]);
  assert.throws(() => validateDataset(duplicate), /Duplicate/);
  const missing = structuredClone(raw);
  missing.snapshots.shift();
  assert.throws(() => validateDataset(missing), /Missing source/);
  const incomplete = structuredClone(raw);
  incomplete.observations.pop();
  assert.throws(() => validateDataset(incomplete), /Incomplete/);
  const future = structuredClone(raw);
  future.observations[0].period = '2099-01-01';
  assert.throws(() => validateDataset(future), /Future/);
});
test('negative changes are valid but negative population is not', () => {
  assert.ok(data.observations.some((o) => o.metric === 'population_change' && o.value < 0));
  const broken = structuredClone(raw);
  const population = broken.observations.find((o) => o.metric === 'population');
  assert.ok(population);
  population.value = -1;
  assert.throws(() => validateDataset(broken), /non-positive/);
});
