import { watch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../prisma/schema.prisma');
const generatorPath = resolve(__dirname, './generate-contract-types.mjs');

let timeoutId = null;
let running = false;
let pending = false;

function runGenerator() {
  if (running) {
    pending = true;
    return;
  }

  running = true;
  const child = spawn(process.execPath, [generatorPath], {
    stdio: 'inherit'
  });

  child.on('exit', () => {
    running = false;
    if (pending) {
      pending = false;
      runGenerator();
    }
  });
}

console.log(`Watching ${schemaPath} for Prisma schema changes...`);
runGenerator();

watch(schemaPath, () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => runGenerator(), 100);
});
