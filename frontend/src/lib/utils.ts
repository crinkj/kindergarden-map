export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  return dateStr;
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('ko-KR');
}

export function getDataFreshnessLabel(updatedAt: string): {
  label: string;
  colorClass: string;
} {
  const diff = Date.now() - new Date(updatedAt).getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 1) return { label: '최신', colorClass: 'text-green-600' };
  if (days <= 7) return { label: '보통', colorClass: 'text-gray-600' };
  return { label: '오래됨', colorClass: 'text-amber-600' };
}

export function buildQueryString(params: Record<string, string | number | undefined | null>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}
