import { expect, test } from "@playwright/test";

test("expired session rejects note sync and preserves the browser draft", async ({ page }) => {
  const email = `expired-${Date.now()}@example.test`;
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Create an account/ }).click();
  await page.getByLabel("Display name").fill("Expired Learner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "▤ Classroom" }).click();
  await expect(page.getByText("Saved to your account")).toBeVisible();
  const draft = "Unsaved മലയാളം draft after expiry";

  const invalidated = await page.evaluate(async () => {
    const csrf = await fetch("/api/v1/auth/csrf", { credentials: "include" }).then(response => response.json());
    return fetch("/api/v1/__e2e/session/invalidate", { method: "POST", credentials: "include", headers: { [csrf.headerName]: csrf.token } }).then(response => response.status);
  });
  expect(invalidated).toBe(204);

  const noteRequest = page.waitForResponse(response => response.url().includes("/api/v1/notes") && response.request().method() === "POST");
  await page.getByPlaceholder("Capture an idea, question, or example…").fill(draft);
  expect((await noteRequest).status()).toBe(403);
  await expect(page.getByRole("alert")).toContainText("Your session has expired");
  await expect(page.getByRole("button", { name: "Sign in again" })).toBeVisible();
  await expect(page.getByPlaceholder("Capture an idea, question, or example…")).toHaveValue(draft);
  await expect(page.getByText("Session expired — draft kept locally. Sign in again, then retry.")).toBeVisible();
  expect((await page.request.get("/api/v1/notes")).status()).toBe(403);

  await page.getByRole("button", { name: "Sign in again" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("dialog", { name: "Account access" }).getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("You have an unsynchronized note. Review and")).toBeVisible();
  await page.getByRole("button", { name: "Retry sync" }).click();
  await expect(page.getByText("Saved to your account")).toBeVisible();
  const noteBodies = await page.evaluate(() => fetch("/api/v1/notes", { credentials: "include" }).then(async response => ({ status: response.status, body: await response.json() })));
  expect(noteBodies.status).toBe(200);
  expect(noteBodies.body).toEqual(expect.arrayContaining([expect.objectContaining({ body: draft })]));
  await page.reload();
  await page.getByRole("button", { name: "▤ Classroom" }).click();
  await expect(page.getByPlaceholder("Capture an idea, question, or example…")).toHaveValue(draft);
});

test("a pending draft is not exposed or replayed after a different account signs in", async ({ page }) => {
  const unique = Date.now();
  const emailA = `draft-a-${unique}@example.test`;
  const emailB = `draft-b-${unique}@example.test`;
  const password = "correct-horse-battery";
  const draft = "Private Malayalam draft: മലയാളം";
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: /Create an account/ }).click();
  await page.getByLabel("Display name").fill("Draft A");
  await page.getByLabel("Email").fill(emailA); await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "▤ Classroom" }).click();
  await expect(page.getByText("Saved to your account")).toBeVisible();
  const invalidated = await page.evaluate(async () => {
    const csrf = await fetch("/api/v1/auth/csrf", { credentials: "include" }).then(response => response.json());
    return fetch("/api/v1/__e2e/session/invalidate", { method: "POST", credentials: "include", headers: { [csrf.headerName]: csrf.token } }).then(response => response.status);
  });
  expect(invalidated).toBe(204);
  await page.getByPlaceholder("Capture an idea, question, or example…").fill(draft);
  await expect(page.getByRole("alert")).toContainText("Your session has expired");
  await page.getByRole("button", { name: "Sign in again" }).click();
  await page.getByRole("button", { name: /Create an account/ }).click();
  await page.getByLabel("Display name").fill("Draft B");
  await page.getByLabel("Email").fill(emailB); await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("button", { name: /Sign out · Draft B/ })).toBeVisible();
  await expect(page.getByText("You have an unsynchronized note. Review and")).toHaveCount(0);
  await expect(page.getByPlaceholder("Capture an idea, question, or example…")).not.toHaveValue(draft);
  expect(await page.evaluate(() => fetch("/api/v1/notes", { credentials: "include" }).then(response => response.status))).toBe(200);
  await page.getByRole("button", { name: /Sign out · Draft B/ }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill(emailA); await page.getByLabel("Password").fill(password);
  await page.getByRole("dialog", { name: "Account access" }).getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("You have an unsynchronized note. Review and")).toBeVisible();
  await expect(page.getByPlaceholder("Capture an idea, question, or example…")).toHaveValue(draft);
});
