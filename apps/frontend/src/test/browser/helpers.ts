const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002';
export const TEST_PREFIX = '<@test@>';
export const TEST_RUN_ID = new Date().toISOString();

export function buildTestName(label: string) {
  return `${TEST_PREFIX} smoke ${TEST_RUN_ID} ${label}`;
}

export async function deleteProjectsByPrefix() {
  const like = `${TEST_PREFIX}%`;
  const res = await fetch(
    `${API_BASE_URL}/projects?select=id,name&name=like.${encodeURIComponent(like)}`
  );
  if (!res.ok) {
    throw new Error(`Failed to list projects for cleanup: ${res.status}`);
  }
  const projects = (await res.json()) as Array<{ id: number; name: string }>;
  for (const project of projects) {
    await fetch(`${API_BASE_URL}/projects?id=eq.${project.id}`, { method: 'DELETE' });
  }
}
