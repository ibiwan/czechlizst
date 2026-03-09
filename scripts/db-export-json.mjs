import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseUrl = process.env.POSTGREST_BASE_URL ?? 'http://localhost:3002';
const outputArg = process.argv[2];

function defaultOutputPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `data/backups/postgrest-${stamp}.json`;
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status} for ${url}`);
  }
  return res.json();
}

function resolveResources(openApi) {
  const paths = openApi?.paths ?? {};
  return Object.keys(paths)
    .filter((path) => /^\/[a-zA-Z_][a-zA-Z0-9_]*$/.test(path))
    .map((path) => path.slice(1))
    .filter((resource) => !resource.startsWith('_'))
    .sort();
}

async function main() {
  const openApi = await fetchJson(`${baseUrl}/`, {
    headers: { Accept: 'application/openapi+json' }
  });

  const resources = resolveResources(openApi);
  if (resources.length === 0) {
    throw new Error('No PostgREST resources discovered from OpenAPI.');
  }

  const data = {};
  for (const resource of resources) {
    data[resource] = await fetchJson(`${baseUrl}/${resource}?select=*`);
  }

  const payload = {
    meta: {
      exportedAt: new Date().toISOString(),
      baseUrl,
      resources
    },
    data
  };

  const outputPath = resolve(outputArg ?? defaultOutputPath());
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Exported ${resources.length} resources to ${outputPath}`);
}

main().catch((error) => {
  console.error(`Failed to export JSON snapshot: ${error.message}`);
  process.exit(1);
});
