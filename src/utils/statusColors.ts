const STATUS_DOT_CLASS: Record<'alive' | 'dead' | 'unknown', string> = {
  alive: 'bg-alive',
  dead: 'bg-dead',
  unknown: 'bg-unknown',
};

// Case-insensitive: the API returns 'Alive' | 'Dead' | 'unknown', while the
// status filter uses lowercase 'alive' | 'dead' | 'unknown'.
export function getStatusDotClass(status: string): string {
  const key = status.toLowerCase() as keyof typeof STATUS_DOT_CLASS;
  return STATUS_DOT_CLASS[key] ?? STATUS_DOT_CLASS.unknown;
}
