import { getCsrfToken } from "./auth";
export type ProgressState = "NOT_STARTED" | "IN_PROGRESS" | "STUDIED" | "PRACTICED" | "ASSESSED" | "MASTERED";
export type Progress = { id: string; state: ProgressState; version: number; updatedAt: string | null };
const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";
async function api<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(`${baseUrl}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...init?.headers } }); if (!response.ok) throw new Error(response.status === 409 ? "PROGRESS_CONFLICT" : "PROGRESS_REQUEST_FAILED"); return response.json() as Promise<T>; }
export function getClassProgress(classId: string): Promise<Progress> { return api(`/api/v1/progress/classes/${classId}`); }
export async function setClassProgress(classId: string, state: ProgressState, version: number): Promise<Progress> { const csrf = await getCsrfToken(); return api(`/api/v1/progress/classes/${classId}`, { method: "PUT", headers: { [csrf.headerName]: csrf.token }, body: JSON.stringify({ state, version }) }); }
