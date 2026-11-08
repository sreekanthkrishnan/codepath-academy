import { expect, request, test } from "@playwright/test";

test("real isolated API, session and CSRF smoke test", async ({ page, context }) => {
  const unique = Date.now();
  const email = `e2e-${unique}@example.test`;
  const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/v1/auth/register") && response.request().method() === "POST").then(async registration => ({
    url: registration.url(),
    method: registration.request().method(),
    request: { contentType: await registration.request().headerValue("content-type"), jsonFields: ["email", "password", "displayName"] },
    status: registration.status(),
    responseHeaders: Object.fromEntries((await Promise.all(["content-type", "location"].map(async name => [name, await registration.headerValue(name)]))).filter(([, value]) => value)),
    responseBody: await registration.text().catch(() => "[response body unavailable after UI transition]"),
  }));

  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Create an account/ }).click();
  await page.getByLabel("Display name").fill("E2E Learner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();

  const diagnostic = await responsePromise;
  await test.info().attach("registration-response.json", { body: JSON.stringify(diagnostic, null, 2), contentType: "application/json" });
  expect(diagnostic.status, JSON.stringify(diagnostic)).toBe(201);

  await expect(page.getByRole("button", { name: /Sign out · E2E Learner/ })).toBeVisible();
  const proxiedCurrentUser = await page.request.get("/api/v1/auth/me");
  expect(proxiedCurrentUser.ok()).toBeTruthy();
  await expect(proxiedCurrentUser.json()).resolves.toMatchObject({ email, displayName: "E2E Learner", roles: ["STUDENT"] });
  expect((await page.request.get("/api/v1/auth/csrf")).ok()).toBeTruthy();

  const direct = await request.newContext({ baseURL: process.env.E2E_API_ORIGIN });
  const directRegistration = await direct.post("/api/v1/auth/register", { data: { email: `direct-${unique}@example.test`, password: "correct-horse-battery", displayName: "Direct Learner" } });
  expect(directRegistration.status()).toBe(201);
  await expect(directRegistration.json()).resolves.toMatchObject({ email: `direct-${unique}@example.test`, displayName: "Direct Learner", roles: ["STUDENT"] });
  expect((await direct.get("/api/v1/auth/me")).ok()).toBeTruthy();
  expect((await direct.post("/api/v1/auth/register", { data: { email: "not-an-email", password: "short", displayName: "" } })).status()).toBe(400);
  expect((await direct.post("/api/v1/auth/register", { data: { email: `direct-${unique}@example.test`, password: "correct-horse-battery", displayName: "Direct Learner" } })).status()).toBe(400);
  expect((await direct.post("/api/v1/auth/logout")).status()).toBe(403);
  await direct.dispose();

  const logoutResponse = page.waitForResponse(response => response.url().endsWith("/api/v1/auth/logout") && response.request().method() === "POST");
  await page.getByRole("button", { name: /Sign out · E2E Learner/ }).click();
  expect((await logoutResponse).status()).toBe(204);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

  const second = await context.browser()!.newContext();
  const secondPage = await second.newPage();
  await secondPage.goto("/");
  await expect(secondPage.getByRole("button", { name: "Sign in" })).toBeVisible();
  await second.close();
});
