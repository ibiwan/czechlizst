import type { getEffectiveTaskStatus } from '../lib';

export function StatusPill({ status }: { status: ReturnType<typeof getEffectiveTaskStatus> }) {
  return <span className={`status-pill status-${status}`}>{status}</span>;
}
