import { expect, test, type BrowserContext, type Page } from "@playwright/test";

type Backup = { schemaVersion: number; exportedAt: string; source: string; data: { language: string; progress: number[]; notes: Record<string, string> } };

async function register(page: Page, email: string, name: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Create an account/ }).click();
  await page.getByLabel("Display name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("button", { name: new RegExp(`Sign out · ${name}`) })).toBeVisible();
}

async function login(page: Page, email: string, name: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Sign in" }).last().click();
  await expect(page.getByRole("button", { name: new RegExp(`Sign out · ${name}`) })).toBeVisible();
}

async function logout(page: Page, name: string) {
  const response = page.waitForResponse(item => item.url().endsWith("/api/v1/auth/logout") && item.request().method() === "POST");
  await page.getByRole("button", { name: new RegExp(`Sign out · ${name}`) }).click();
  expect((await response).status()).toBe(204);
}

async function curriculumClasses(page: Page) {
  const programs = await (await page.request.get("/api/v1/programs")).json() as Array<{ id: string }>;
  const curriculum = await (await page.request.get(`/api/v1/programs/${programs[0].id}/curriculum`)).json() as { weeks: Array<{ classes: Array<{ id: string; code: string }> }> };
  return curriculum.weeks.flatMap(week => week.classes);
}

async function browserImport(page: Page, payload: Backup, key: string) {
  return page.evaluate(async ({ payload, key }) => {
    const csrf = await fetch("/api/v1/auth/csrf", { credentials: "include" }).then(response => response.json());
    const response = await fetch("/api/v1/learning-data/imports", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token, "Idempotency-Key": key }, body: JSON.stringify(payload) });
    return { status: response.status, body: await response.json().catch(() => null) };
  }, { payload, key });
}

test("real migration preserves browser data, persists safely, and isolates accounts", async ({ page, context }) => {
  const unique = Date.now();
  const accountA = `migration-a-${unique}@example.test`;
  const backup: Backup = { schemaVersion: 1, exportedAt: "2026-11-05T00:00:00.000Z", source: "codepath-academy-client", data: { language: "both", progress: [11, 12], notes: { "1-1": "English migration note", "1-2": "മലയാളം പഠന കുറിപ്പ്", "99-1": "must remain unmapped" } } };

  await register(page, accountA, "Migration A");
  const classes = await curriculumClasses(page);
  const classOne = classes.find(item => item.code === "CPA-W01-C01")!;
  const classTwo = classes.find(item => item.code === "CPA-W01-C02")!;
  await page.evaluate(data => {
    localStorage.setItem("cpa-language", JSON.stringify(data.data.language));
    localStorage.setItem("cpa-progress", JSON.stringify(data.data.progress));
    localStorage.setItem("cpa-notes", JSON.stringify(data.data.notes));
  }, backup);
  const originalStorage = await page.evaluate(() => ({ language: localStorage.getItem("cpa-language"), progress: localStorage.getItem("cpa-progress"), notes: localStorage.getItem("cpa-notes") }));

  await page.getByRole("button", { name: "Import local data" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup first" }).click();
  expect((await download).suggestedFilename()).toMatch(/^codepath-academy-backup-/);
  await expect.poll(() => page.evaluate(() => ({ language: localStorage.getItem("cpa-language"), progress: localStorage.getItem("cpa-progress"), notes: localStorage.getItem("cpa-notes") }))).toEqual(originalStorage);

  const previewResponse = page.waitForResponse(item => item.url().endsWith("/api/v1/learning-data/imports/preview") && item.request().method() === "POST");
  await page.getByRole("button", { name: "Preview import" }).click();
  expect((await previewResponse).status()).toBe(200);
  await expect(page.getByRole("dialog", { name: "Import browser learning data" })).toContainText("Found 3 local notes and 2 completion markers.");
  await expect(page.getByRole("dialog", { name: "Import browser learning data" })).toContainText("4 eligible · 0 conflicts · 0 duplicates · 1 unmapped");
  await expect(page.getByText(/99-1: unmapped/)).toBeVisible();
  expect(await (await page.request.get(`/api/v1/notes?classId=${classOne.id}`)).json()).toEqual([]);
  expect((await (await page.request.get("/api/v1/progress/overview")).json()).classes).toEqual([]);

  const importResponse = page.waitForResponse(item => item.url().endsWith("/api/v1/learning-data/imports") && item.request().method() === "POST").then(async response => ({ status: response.status(), body: await response.json(), payload: response.request().postDataJSON() as Backup, key: await response.request().headerValue("idempotency-key") }));
  await page.getByRole("button", { name: "Confirm import" }).click();
  const imported = await importResponse;
  expect(imported.status).toBe(200);
  await expect(page.getByText("Imported 4 eligible records. Local browser data was retained.")).toBeVisible();
  await expect.poll(() => page.evaluate(() => ({ language: localStorage.getItem("cpa-language"), progress: localStorage.getItem("cpa-progress"), notes: localStorage.getItem("cpa-notes") }))).toEqual(originalStorage);

  const notesOne = await (await page.request.get(`/api/v1/notes?classId=${classOne.id}`)).json();
  const notesTwo = await (await page.request.get(`/api/v1/notes?classId=${classTwo.id}`)).json();
  expect(notesOne).toHaveLength(1);
  expect(notesOne[0]).toMatchObject({ body: "English migration note", classId: classOne.id });
  expect(notesTwo[0]).toMatchObject({ body: "മലയാളം പഠന കുറിപ്പ്", classId: classTwo.id });
  expect(await (await page.request.get(`/api/v1/progress/classes/${classOne.id}`)).json()).toMatchObject({ id: classOne.id, state: "STUDIED" });
  expect(await (await page.request.get(`/api/v1/progress/classes/${classTwo.id}`)).json()).toMatchObject({ id: classTwo.id, state: "STUDIED" });

  const repeat = await browserImport(page, imported.payload, "repeat-import-key-0001");
  expect(repeat.status).toBe(200);
  expect(repeat.body).toMatchObject({ alreadyImported: true, importId: imported.body.importId });
  expect(await (await page.request.get(`/api/v1/notes?classId=${classOne.id}`)).json()).toHaveLength(1);
  const changed = structuredClone(imported.payload); changed.data.notes["1-1"] = "different content";
  expect((await browserImport(page, changed, imported.key!)).status).toBe(409);
  const conflictPreview = await page.evaluate(async data => {
    const csrf = await fetch("/api/v1/auth/csrf", { credentials: "include" }).then(response => response.json());
    return fetch("/api/v1/learning-data/imports/preview", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", [csrf.headerName]: csrf.token }, body: JSON.stringify(data) }).then(response => response.json());
  }, { ...backup, data: { ...backup.data, notes: { "1-1": "conflicting local value" }, progress: [] } });
  expect(conflictPreview).toMatchObject({ conflicts: 1 });
  expect((await (await page.request.get(`/api/v1/notes?classId=${classOne.id}`)).json())[0].body).toBe("English migration note");
  expect((await browserImport(page, { ...backup, schemaVersion: 2 }, "invalid-schema-key-0001")).status).toBe(400);

  await page.getByRole("button", { name: "Close import" }).click();
  await logout(page, "Migration A");
  await login(page, accountA, "Migration A");
  expect((await (await page.request.get(`/api/v1/notes?classId=${classTwo.id}`)).json())[0].body).toBe("മലയാളം പഠന കുറിപ്പ്");

  const browserB = await context.browser()!.newContext();
  const pageB = await browserB.newPage();
  await login(pageB, accountA, "Migration A");
  expect(await pageB.evaluate(() => JSON.parse(localStorage.getItem("cpa-notes") ?? "{}"))).toEqual({});
  expect((await (await pageB.request.get(`/api/v1/notes?classId=${classOne.id}`)).json())[0].body).toBe("English migration note");

  const browserC = await context.browser()!.newContext();
  const pageC = await browserC.newPage();
  await register(pageC, `migration-b-${unique}@example.test`, "Migration B");
  expect(await (await pageC.request.get(`/api/v1/notes?classId=${classOne.id}`)).json()).toEqual([]);
  expect((await (await pageC.request.get(`/api/v1/progress/classes/${classOne.id}`)).json()).state).toBe("NOT_STARTED");
  expect((await pageC.request.get(`/api/v1/learning-data/imports/${imported.body.importId}`)).status()).toBe(404);
  await browserB.close();
  await browserC.close();
});
