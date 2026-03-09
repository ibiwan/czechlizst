import { spawnSync } from 'node:child_process';

const composeFile = 'apps/backend/docker-compose.yml';
const baseUrl = process.env.POSTGREST_BASE_URL ?? 'http://localhost:3002';

function run(cmd, args, label) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    const details = stderr || stdout || '(no output)';
    throw new Error(`${label} failed: ${details}`);
  }

  return (result.stdout || '').trim();
}

async function checkPostgrest() {
  const res = await fetch(`${baseUrl}/projects?select=id&limit=1`);
  if (!res.ok) {
    throw new Error(`PostgREST health check failed with status ${res.status}`);
  }
  return 'PostgREST API reachable';
}

async function main() {
  const checks = [];

  const nodeVersion = process.version;
  checks.push(`Node ${nodeVersion}`);

  const npmVersion = run('npm', ['--version'], 'npm version');
  checks.push(`npm ${npmVersion}`);

  const dockerVersion = run('docker', ['version', '--format', '{{.Server.Version}}'], 'Docker');
  checks.push(`Docker ${dockerVersion}`);

  const composePs = run(
    'docker',
    ['compose', '-f', composeFile, 'ps', '--services', '--status', 'running'],
    'docker compose ps'
  );
  const runningServices = composePs
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!runningServices.includes('db') || !runningServices.includes('postgrest')) {
    throw new Error(
      `Expected running services db and postgrest. Found: ${
        runningServices.join(', ') || '(none)'
      }`
    );
  }
  checks.push(`Compose services running: ${runningServices.join(', ')}`);

  checks.push(await checkPostgrest());

  console.log('Doctor checks passed:');
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

main().catch((error) => {
  console.error(`Doctor check failed: ${error.message}`);
  process.exit(1);
});
