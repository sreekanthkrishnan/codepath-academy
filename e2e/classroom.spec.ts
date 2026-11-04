import { expect, test } from "@playwright/test";

const classOne = "11111111-1111-4111-8111-111111111111";
const classTwo = "22222222-2222-4222-8222-222222222222";

test("classroom uses controlled API data, shows Malayalam fallback, and preserves local learning state", async ({ page }) => {
    await page.route("**/api/v1/**", async route => {
        const url = new URL(route.request().url());
        const json = (body: unknown) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
        if (url.pathname === "/api/v1/programs") return json([{ id: "program-1", code: "CPA-BACKEND-40" }]);
        if (url.pathname === "/api/v1/programs/program-1/curriculum") return json({
            program: { id: "program-1", code: "CPA-BACKEND-40" },
            weeks: [{ id: "week-1", code: "CPA-W01", weekNumber: 1, title: { english: "Foundation · Introduction to Computers" }, classes: [
                { id: classOne, code: "CPA-W01-C01", classNumber: 1, title: { english: "What Is a Computer and How Does It Work?", malayalam: "കമ്പ്യൂട്ടർ എന്താണ്", malayalamFallback: false }, editorialStatus: "DRAFT", difficulty: "BEGINNER", estimatedMinutes: 35, hasExercise: true, hasQuiz: true },
                { id: classTwo, code: "CPA-W01-C02", classNumber: 2, title: { english: "Hardware, Software, CPU, RAM and Storage", malayalam: "ഹാർഡ്‌വെയർ", malayalamFallback: false }, editorialStatus: "OUTLINE", difficulty: "BEGINNER", estimatedMinutes: 35, hasExercise: false, hasQuiz: false },
                { id: "3", code: "CPA-W01-C03", classNumber: 3, title: { english: "Operating Systems, Files and Folders", malayalam: null, malayalamFallback: true }, editorialStatus: "OUTLINE", difficulty: "BEGINNER", estimatedMinutes: 35, hasExercise: false, hasQuiz: false },
                { id: "4", code: "CPA-W01-C04", classNumber: 4, title: { english: "Installing and Using Developer Tools", malayalam: null, malayalamFallback: true }, editorialStatus: "OUTLINE", difficulty: "BEGINNER", estimatedMinutes: 35, hasExercise: false, hasQuiz: false },
                { id: "5", code: "CPA-W01-C05", classNumber: 5, title: { english: "Lab: Set Up a Development Environment", malayalam: null, malayalamFallback: true }, editorialStatus: "OUTLINE", difficulty: "BEGINNER", estimatedMinutes: 35, hasExercise: false, hasQuiz: false },
            ] }],
        });
        const classId = url.pathname.match(/\/classes\/([^/]+)/)?.[1];
        if (classId && url.pathname.endsWith("/topics")) return json([{ id: `topic-${classId}`, code: "TOPIC", title: { english: "Controlled topic", malayalam: null, fallback: false }, description: { english: "", malayalam: null, fallback: false }, parentId: null, subtopics: [], prerequisites: [] }]);
        if (classId && url.pathname.endsWith("/lessons")) return json({ id: `lesson-${classId}`, classId, classCode: classId === classOne ? "CPA-W01-C01" : "CPA-W01-C02", publicationState: "DRAFT", requestedLocale: url.searchParams.get("locale"), actualContentLocale: "en-IN", fallback: url.searchParams.get("locale") !== "en-IN", revision: 1, blocks: [{ type: "introduction", english: `Controlled API lesson for ${classId}` }, { type: "analogy", english: "Controlled analogy" }] });
        return route.fulfill({ status: 404 });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Learning path" }).click();
    await expect(page.getByRole("button", { name: /Week 1: Introduction to Computers/ })).toBeVisible();
    await page.getByRole("button", { name: /What Is a Computer and How Does It Work/ }).click();
    await expect(page.getByText(`Controlled API lesson for ${classOne}`)).toBeVisible();
    await expect(page.getByText(/1 API topic linked/)).toBeVisible();

    const notes = page.locator("textarea").first();
    await notes.fill("Keep this note");
    await page.getByRole("button", { name: "Mark class complete" }).click();
    await page.getByRole("button", { name: /EN \| മ/ }).click();
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByText(/Malayalam translation is unavailable/)).toBeVisible();

    await page.getByRole("button", { name: /Hardware, Software, CPU, RAM and Storage/ }).click();
    await expect(page.getByText(`Controlled API lesson for ${classTwo}`)).toBeVisible();
    await expect.poll(() => page.evaluate(() => ({ notes: localStorage.getItem("cpa-notes"), progress: localStorage.getItem("cpa-progress") }))).toEqual({ notes: JSON.stringify({ "1-1": "Keep this note" }), progress: JSON.stringify([11]) });
});
