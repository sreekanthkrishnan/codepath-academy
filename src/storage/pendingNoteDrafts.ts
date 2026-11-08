/**
 * Recoverable note edits.  This intentionally contains no credentials or CSRF
 * material: accountId is only a partition key and is always checked again by
 * the API when a draft is retried.
 */
export type PendingDraftStatus = "PENDING" | "SESSION_EXPIRED" | "SYNCING" | "SYNC_FAILED" | "CONFLICT";

export type PendingNoteDraft = {
    schemaVersion: 1;
    draftId: string;
    accountId: string;
    classId: string;
    topicId?: string;
    noteId?: string;
    baseVersion: number;
    title: string;
    body: string;
    locale: "en" | "ml" | "both";
    updatedAt: string;
    status: PendingDraftStatus;
};

const KEY = "cpa-pending-note-drafts-v1";

function readAll(): PendingNoteDraft[] {
    try {
        const value: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
        if (!Array.isArray(value)) return [];
        return value.filter((draft): draft is PendingNoteDraft =>
            typeof draft === "object" && draft !== null &&
            (draft as PendingNoteDraft).schemaVersion === 1 &&
            typeof (draft as PendingNoteDraft).draftId === "string" &&
            typeof (draft as PendingNoteDraft).accountId === "string" &&
            typeof (draft as PendingNoteDraft).classId === "string" &&
            typeof (draft as PendingNoteDraft).body === "string",
        );
    } catch { return []; }
}

function writeAll(drafts: PendingNoteDraft[]): boolean {
    try { window.localStorage.setItem(KEY, JSON.stringify(drafts.slice(-100))); return true; }
    catch { return false; }
}

export function draftsForAccount(accountId: string): PendingNoteDraft[] {
    return readAll().filter(draft => draft.accountId === accountId);
}

export function pendingDraft(accountId: string, classId: string): PendingNoteDraft | undefined {
    return draftsForAccount(accountId)
        .filter(draft => draft.classId === classId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function savePendingDraft(draft: PendingNoteDraft): boolean {
    const drafts = readAll();
    const index = drafts.findIndex(item => item.draftId === draft.draftId && item.accountId === draft.accountId);
    if (index >= 0) drafts[index] = draft; else drafts.push(draft);
    return writeAll(drafts);
}

export function removePendingDraft(accountId: string, draftId: string): boolean {
    return writeAll(readAll().filter(draft => draft.accountId !== accountId || draft.draftId !== draftId));
}

export function newDraftId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
