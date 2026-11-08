import { signalSessionExpired } from "./session";

export type AuthUser = { id: string; email: string; displayName: string; roles: string[] };

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...init.headers } });
    if (!response.ok) {
        if (response.status === 401) { signalSessionExpired(); throw new Error("SESSION_EXPIRED"); }
        if (response.status === 403) throw new Error("CSRF_REJECTED");
        throw new Error("AUTH_REQUEST_FAILED");
    }
    return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export async function getCurrentUser(): Promise<AuthUser> { return request<AuthUser>("/api/v1/auth/me"); }
export async function getCsrfToken(): Promise<{ headerName: string; token: string }> { return request("/api/v1/auth/csrf"); }
export async function register(input: { email: string; password: string; displayName: string }): Promise<AuthUser> {
    return request<AuthUser>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(input) });
}
export async function login(input: { email: string; password: string }): Promise<AuthUser> {
    return request<AuthUser>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(input) });
}
export async function logout(): Promise<void> {
    const csrf = await getCsrfToken();
    await request<void>("/api/v1/auth/logout", { method: "POST", headers: { [csrf.headerName]: csrf.token } });
}
