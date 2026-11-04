export type RemoteClass = { id: string; code: string; classNumber: number; title: { english: string; malayalam: string | null; malayalamFallback: boolean }; editorialStatus: string; difficulty: string; estimatedMinutes: number; hasExercise: boolean; hasQuiz: boolean };
export type RemoteCurriculum = { program: { id: string; code: string }; weeks: Array<{ id: string; code: string; weekNumber: number; title: { english: string }; classes: RemoteClass[] }> };
const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080';
export async function loadCurriculum(signal?: AbortSignal): Promise<RemoteCurriculum> {
  const programs = await fetch(`${baseUrl}/api/v1/programs?locale=en-IN`, { signal, credentials: 'include' });
  if (!programs.ok) throw new Error(`Curriculum API returned ${programs.status}`);
  const [program] = await programs.json() as Array<{ id: string }>;
  if (!program) throw new Error('Curriculum API returned no programs');
  const curriculum = await fetch(`${baseUrl}/api/v1/programs/${program.id}/curriculum?locale=en-IN`, { signal, credentials: 'include' });
  if (!curriculum.ok) throw new Error(`Curriculum API returned ${curriculum.status}`);
  return curriculum.json() as Promise<RemoteCurriculum>;
}
