const PROJECT_BULLET_SEPARATOR = "\u241E";

export function splitProjectDescription(input: string) {
  if (!input) return [] as string[];

  if (input.includes(PROJECT_BULLET_SEPARATOR)) {
    return input.split(PROJECT_BULLET_SEPARATOR);
  }

  return input
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinProjectDescription(items: string[]) {
  const normalized = items.map((item) => item.replace(/\s*\n+\s*/g, " "));
  if (!normalized.some((item) => item.length)) return "";
  return normalized.join(PROJECT_BULLET_SEPARATOR);
}
