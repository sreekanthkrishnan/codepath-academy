export type LegacyLearningBackupV1 = {
  schemaVersion: 1;
  exportedAt: string;
  source: 'codepath-academy-client';
  data: { language: 'en' | 'ml' | 'both'; progress: number[]; notes: Record<string, string> };
};

const KEYS = { language: 'cpa-language', progress: 'cpa-progress', notes: 'cpa-notes' } as const;

export function readLegacy<T>(key: keyof typeof KEYS, fallback: T): T {
  try { const raw = localStorage.getItem(KEYS[key]); return raw === null ? fallback : JSON.parse(raw) as T; } catch { return fallback; }
}
export function writeLegacy(key: keyof typeof KEYS, value: unknown): void {
  try { localStorage.setItem(KEYS[key], JSON.stringify(value)); } catch { /* Offline/local persistence is best effort; UI state remains live. */ }
}
export function createLegacyBackup(): LegacyLearningBackupV1 {
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), source: 'codepath-academy-client', data: {
    language: readLegacy('language', 'both'), progress: readLegacy<number[]>('progress', []), notes: readLegacy<Record<string, string>>('notes', {})
  }};
}
export function downloadLegacyLearningBackup(): void {
  const file = new Blob([JSON.stringify(createLegacyBackup(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `codepath-academy-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
  URL.revokeObjectURL(url);
}
