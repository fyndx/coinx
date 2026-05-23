export function parseOptionalNumber(value: unknown): number {
  if (value == null) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
