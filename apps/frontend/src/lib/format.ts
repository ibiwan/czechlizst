export function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString();
}
