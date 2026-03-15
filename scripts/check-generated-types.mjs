import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const trackedFiles = [
  'packages/contracts/src/generated/prisma-types.ts',
  'packages/contracts/src/generated/prisma-types.d.ts',
  'packages/contracts/src/generated/prisma-zod.mjs',
  'packages/contracts/src/generated/prisma-zod.cjs',
  'packages/contracts/src/generated/prisma-zod.d.ts',
  'packages/contracts/src/generated/prisma-classes.mjs',
  'packages/contracts/src/generated/prisma-classes.cjs',
  'packages/contracts/src/generated/prisma-classes.d.ts'
];

function snapshotFiles() {
  const snapshot = new Map();
  for (const file of trackedFiles) {
    try {
      snapshot.set(file, readFileSync(file, 'utf8'));
    } catch {
      snapshot.set(file, null);
    }
  }
  return snapshot;
}

const before = snapshotFiles();
const generate = spawnSync('npm', ['run', 'types:generate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (generate.status !== 0) {
  process.exit(generate.status ?? 1);
}

const after = snapshotFiles();
const drifted = trackedFiles.filter((file) => before.get(file) !== after.get(file));

if (drifted.length > 0) {
  console.error('Generated type drift detected. Regenerated files changed:');
  for (const file of drifted) {
    console.error(`- ${file}`);
  }
  console.error('Re-run your workflow and include regenerated artifacts.');
  process.exit(1);
}

console.log('Generated type drift check passed.');
