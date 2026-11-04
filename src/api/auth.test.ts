import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getCurrentUser, login, logout, register } from "./auth";

const base = "http://localhost:8080/api/v1/auth";
const user = { id: "user-1", email: "learner@example.com", displayName: "Learner", roles: ["STUDENT"] };
let logoutHeader = "";
const server = setupServer(
    http.get(`${base}/me`, () => HttpResponse.json(user)),
    http.post(`${base}/login`, async ({ request }) => (await request.json() as { password: string }).password === "correct-horse-battery" ? HttpResponse.json(user) : new HttpResponse(null, { status: 400 })),
    http.post(`${base}/register`, () => HttpResponse.json(user, { status: 201 })),
    http.get(`${base}/csrf`, () => HttpResponse.json({ headerName: "X-XSRF-TOKEN", token: "csrf-test-token" })),
    http.post(`${base}/logout`, ({ request }) => { logoutHeader = request.headers.get("X-XSRF-TOKEN") || ""; return new HttpResponse(null, { status: 204 }); }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => { logoutHeader = ""; server.resetHandlers(); });
afterAll(() => server.close());

describe("authentication API client", () => {
    it("restores a session and submits login/registration payloads", async () => {
        await expect(getCurrentUser()).resolves.toEqual(user);
        await expect(login({ email: user.email, password: "correct-horse-battery" })).resolves.toEqual(user);
        await expect(register({ email: user.email, password: "correct-horse-battery", displayName: user.displayName })).resolves.toEqual(user);
    });

    it("uses the server-provided CSRF header for logout", async () => {
        await logout();
        expect(logoutHeader).toBe("csrf-test-token");
    });

    it("does not expose backend failures as account-enumeration details", async () => {
        await expect(login({ email: user.email, password: "wrong" })).rejects.toThrow("AUTH_REQUEST_FAILED");
    });
});
