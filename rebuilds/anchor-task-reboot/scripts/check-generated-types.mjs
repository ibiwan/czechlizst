import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const targetFile = 'src/types.ts';

function readSnapshot(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

const before = readSnapshot(targetFile);
const result = spawnSync('npm', ['run', 'types:generate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const after = readSnapshot(targetFile);
if (before !== after) {
  console.error('Generated type drift detected for', targetFile);
  process.exit(1);
}

console.log('Generated type drift check passed.');