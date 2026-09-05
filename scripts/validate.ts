import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { validateDataset } from '../packages/core/schema.ts';
import { decodeCsv, parsePopulation } from '../packages/ingestion/population.ts';

const data = validateDataset(JSON.parse(await readFile('data/published/population.json', 'utf8')));
for (const snapshot of data.snapshots) {
  const bytes = await readFile(snapshot.path);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== snapshot.sha256 || hash !== snapshot.id)
    throw new Error('Snapshot integrity failure');
  const expected = data.observations.filter((o) => o.sourceId === snapshot.id);
  const actual = parsePopulation(decodeCsv(bytes), snapshot.id, expected[0]?.revision);
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw new Error(`Published data differs from source: ${snapshot.id}`);
}
console.log(
  `Verified ${data.observations.length} observations against ${data.snapshots.length} original CSV snapshots.`,
);
