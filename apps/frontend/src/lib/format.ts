export function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString();
}

export function formatProjectTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const time = `${hour}:${minute}`;

  if (sameYear) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day} ${time}`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}/${month} ${time}`;
}
