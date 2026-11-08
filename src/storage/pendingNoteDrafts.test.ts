import { beforeEach, describe, expect, it } from "vitest";
import { draftsForAccount, pendingDraft, removePendingDraft, savePendingDraft, type PendingNoteDraft } from "./pendingNoteDrafts";

const draft = (accountId: string, draftId = "draft-a"): PendingNoteDraft => ({ schemaVersion: 1, draftId, accountId, classId: "class-1", baseVersion: 2, title: "Unicode", body: "English and മലയാളം", locale: "both", updatedAt: "2026-11-06T00:00:00.000Z", status: "SESSION_EXPIRED" });

describe("pending note drafts", () => {
    beforeEach(() => {
        const values = new Map<string, string>();
        Object.defineProperty(window, "localStorage", { configurable: true, value: {
            getItem: (key: string) => values.get(key) ?? null,
            setItem: (key: string, value: string) => values.set(key, value),
        } });
    });
    it("persists Unicode drafts and only exposes them to their account", () => {
        savePendingDraft(draft("account-a"));
        savePendingDraft(draft("account-b", "draft-b"));
        expect(pendingDraft("account-a", "class-1")?.body).toBe("English and മലയാളം");
        expect(draftsForAccount("account-b")).toHaveLength(1);
        expect(pendingDraft("account-b", "class-1")?.draftId).toBe("draft-b");
    });
    it("updates and removes only the matching account draft", () => {
        savePendingDraft(draft("account-a")); savePendingDraft(draft("account-b"));
        savePendingDraft({ ...draft("account-a"), body: "newest", status: "PENDING" });
        expect(draftsForAccount("account-a")).toEqual([expect.objectContaining({ body: "newest", status: "PENDING" })]);
        removePendingDraft("account-a", "draft-a");
        expect(draftsForAccount("account-a")).toEqual([]);
        expect(draftsForAccount("account-b")).toHaveLength(1);
    });
});
