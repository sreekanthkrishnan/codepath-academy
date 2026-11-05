import { getCsrfToken } from "./auth";

export type Note = { id: string; classId: string | null; topicId: string | null; title: string; body: string; bodyEn: string | null; bodyMl: string | null; version: number; createdAt: string; updatedAt: string };
export type NoteInput = { classId: string; title: string; body: string; bodyEn?: string; bodyMl?: string; version: number };
const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...init?.headers } });
    if (!response.ok) throw new Error(response.status === 409 ? "NOTE_CONFLICT" : response.status === 401 || response.status === 403 ? "SESSION_EXPIRED" : "NOTE_REQUEST_FAILED");
    return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
async function mutate<T>(path: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
    const csrf = await getCsrfToken();
    return api<T>(path, { method, headers: { [csrf.headerName]: csrf.token }, body: body === undefined ? undefined : JSON.stringify(body) });
}
export function listNotes(classId: string): Promise<Note[]> { return api(`/api/v1/notes?classId=${encodeURIComponent(classId)}`); }
export function createNote(input: NoteInput): Promise<Note> { return mutate("/api/v1/notes", "POST", input); }
export function updateNote(id: string, input: NoteInput): Promise<Note> { return mutate(`/api/v1/notes/${id}`, "PATCH", input); }
export function deleteNote(id: string, version: number): Promise<void> { return mutate(`/api/v1/notes/${id}?version=${version}`, "DELETE"); }
