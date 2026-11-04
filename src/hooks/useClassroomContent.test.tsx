import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useClassroomContent } from "./useClassroomContent";

const { loadClassroom } = vi.hoisted(() => ({ loadClassroom: vi.fn() }));
vi.mock("../api/classroom", () => ({ loadClassroom }));

const payload = (code: string) => ({ clazz: { id: code, code, classNumber: 1, title: { english: code, malayalam: null, malayalamFallback: false }, editorialStatus: "DRAFT", difficulty: "BEGINNER", estimatedMinutes: 30, hasExercise: false, hasQuiz: false }, lesson: { id: code, classId: code, classCode: code, publicationState: "DRAFT", requestedLocale: "en-IN", actualContentLocale: "en-IN", fallback: false, revision: 0, blocks: [] }, topics: [] });

describe("useClassroomContent", () => {
    it("keeps the newest class result when an earlier, aborted request resolves late", async () => {
        let resolveFirst!: (value: ReturnType<typeof payload>) => void;
        let resolveSecond!: (value: ReturnType<typeof payload>) => void;
        loadClassroom
            .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
            .mockImplementationOnce(() => new Promise(resolve => { resolveSecond = resolve; }));
        const { result, rerender } = renderHook(({ code }) => useClassroomContent(code, "en-IN"), { initialProps: { code: "CPA-W01-C01" } });
        rerender({ code: "CPA-W01-C02" });
        resolveSecond(payload("CPA-W01-C02"));
        await waitFor(() => expect(result.current.lesson?.classCode).toBe("CPA-W01-C02"));
        resolveFirst(payload("CPA-W01-C01"));
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(result.current.lesson?.classCode).toBe("CPA-W01-C02");
    });

    it("labels a network failure as a fallback instead of a successful lesson", async () => {
        loadClassroom.mockRejectedValueOnce(new TypeError("network down"));
        const { result } = renderHook(() => useClassroomContent("CPA-W01-C01", "en-IN"));
        await waitFor(() => expect(result.current.error).toMatch(/local lesson fallback/));
        expect(result.current.lesson).toBeUndefined();
    });
});
