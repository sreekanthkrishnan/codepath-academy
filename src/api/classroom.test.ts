import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { loadClassroom } from "./classroom";

const base = "http://localhost:8080/api/v1";
const classId = "00000000-0000-4000-8000-000000000001";
const server = setupServer(
    http.get(`${base}/programs`, () => HttpResponse.json([{ id: "program-1" }])),
    http.get(`${base}/programs/program-1/curriculum`, () => HttpResponse.json({ program: { id: "program-1", code: "CPA" }, weeks: [{ id: "week-1", code: "CPA-W01", weekNumber: 1, title: { english: "Foundation" }, classes: [{ id: classId, code: "CPA-W01-C01", classNumber: 1, title: { english: "API title", malayalam: "എപിഐ പാഠം", malayalamFallback: false }, editorialStatus: "DRAFT", difficulty: "BEGINNER", estimatedMinutes: 30, hasExercise: true, hasQuiz: true }] }] })),
    http.get(`${base}/classes/${classId}/lessons`, ({ request }) => HttpResponse.json({ id: "lesson-1", classId, classCode: "CPA-W01-C01", publicationState: "DRAFT", requestedLocale: new URL(request.url).searchParams.get("locale"), actualContentLocale: "en-IN", fallback: true, revision: 0, blocks: [{ type: "introduction", english: "From API" }] })),
    http.get(`${base}/classes/${classId}/topics`, () => HttpResponse.json([
        { id: "topic-1", code: "TOPIC", title: { english: "Topic", malayalam: null, fallback: false }, description: { english: "", malayalam: null, fallback: false }, parentId: null, subtopics: [], prerequisites: [] },
    ])),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("loadClassroom", () => {
    it("resolves a deterministic class code then loads its lesson and topics", async () => {
        const result = await loadClassroom("CPA-W01-C01", "ml-IN");
        expect(result.clazz.id).toBe(classId);
        expect(result.lesson.blocks[0].english).toBe("From API");
        expect(result.lesson.requestedLocale).toBe("ml-IN");
        expect(result.topics).toHaveLength(1);
    });

    it("fails explicitly when the requested class code is absent", async () => {
        await expect(loadClassroom("CPA-W99-C99", "en-IN")).rejects.toThrow("was not returned by the curriculum API");
    });

    it("does not turn an HTTP failure into a successful fallback payload", async () => {
        server.use(http.get(`${base}/classes/${classId}/lessons`, () => new HttpResponse(null, { status: 503 })));
        await expect(loadClassroom("CPA-W01-C01", "en-IN")).rejects.toThrow("API returned 503");
    });
});
