import { useCallback, useEffect, useRef, useState } from "react";
import { createNote, listNotes, updateNote, type Note } from "../api/notes";
import { newDraftId, pendingDraft, removePendingDraft, savePendingDraft, type PendingDraftStatus, type PendingNoteDraft } from "../storage/pendingNoteDrafts";

type SyncState = "local" | "loading" | "pending" | "saving" | "saved" | "failed" | "conflict" | "session-expired" | "recovery-pending";
type DraftFields = Pick<PendingNoteDraft, "accountId" | "classId" | "title" | "body" | "noteId" | "baseVersion" | "status">;

/** A recoverable account-bound edit is persisted before each mutation. */
export function useNoteAutosave(enabled: boolean, accountId: string | undefined, classId: string | undefined, title: string, localValue: string, onLocalChange: (value: string) => void) {
    const [note, setNote] = useState<Note>();
    const [value, setValue] = useState(localValue);
    const [status, setStatus] = useState<SyncState>(enabled ? "loading" : "local");
    const timer = useRef<number | undefined>(undefined); const latest = useRef(localValue); const revision = useRef(0);
    const draftId = useRef(newDraftId()); const fence = useRef(0); const noteRef = useRef<Note | undefined>(undefined);
    useEffect(() => { noteRef.current = note; }, [note]);
    const persist = useCallback((fields: DraftFields): PendingNoteDraft | undefined => {
        const draft: PendingNoteDraft = { schemaVersion: 1, draftId: draftId.current, accountId: fields.accountId, classId: fields.classId, title: fields.title, body: fields.body, noteId: fields.noteId, baseVersion: fields.baseVersion, status: fields.status, locale: /[\u0D00-\u0D7F]/u.test(fields.body) ? "ml" : "en", updatedAt: new Date().toISOString() };
        return savePendingDraft(draft) ? draft : undefined;
    }, []);
    useEffect(() => { if (!noteRef.current && !accountId && localValue) { latest.current = localValue; setValue(localValue); } }, [localValue, accountId]);
    useEffect(() => {
        const requestFence = ++fence.current; window.clearTimeout(timer.current); setNote(undefined);
        if (!enabled || !accountId || !classId) { setStatus(current => current === "session-expired" ? current : "local"); return; }
        const stored = pendingDraft(accountId, classId);
        if (stored) { draftId.current = stored.draftId; latest.current = stored.body; setValue(stored.body); }
        else { draftId.current = newDraftId(); latest.current = ""; setValue(""); }
        setStatus("loading");
        void listNotes(classId).then(items => {
            if (fence.current !== requestFence) return;
            const remote = stored ? (stored.noteId ? items.find(item => item.id === stored.noteId) : undefined) : items[0];
            if (remote) setNote(remote);
            if (stored) setStatus(stored.noteId && (!remote || remote.version !== stored.baseVersion) ? "conflict" : "recovery-pending");
            else if (remote) { latest.current = remote.body; setValue(remote.body); setStatus("saved"); } else setStatus("saved");
        }).catch(() => { if (fence.current === requestFence) setStatus("failed"); });
        return () => { ++fence.current; };
    }, [enabled, accountId, classId]);
    const save = useCallback(async () => {
        if (!enabled || !accountId || !classId) return;
        const saveFence = fence.current; const savedRevision = revision.current; const currentNote = noteRef.current;
        const draft = persist({ accountId, classId, title, body: latest.current, noteId: currentNote?.id, baseVersion: currentNote?.version ?? 0, status: "SYNCING" });
        if (!draft) { setStatus("failed"); return; }
        setStatus("saving");
        try {
            const input = { classId, title, body: draft.body, version: currentNote?.version ?? 0, clientKey: currentNote ? undefined : draft.draftId };
            const saved = currentNote ? await updateNote(currentNote.id, input) : await createNote(input);
            if (fence.current !== saveFence || revision.current !== savedRevision) return;
            setNote(saved); noteRef.current = saved; removePendingDraft(accountId, draft.draftId); setStatus("saved");
        } catch (error) {
            if (fence.current !== saveFence) return;
            const message = error instanceof Error ? error.message : "NOTE_REQUEST_FAILED";
            const draftStatus: PendingDraftStatus = message === "NOTE_CONFLICT" ? "CONFLICT" : message === "SESSION_EXPIRED" ? "SESSION_EXPIRED" : "SYNC_FAILED";
            persist({ accountId, classId, title, body: latest.current, noteId: currentNote?.id, baseVersion: currentNote?.version ?? 0, status: draftStatus });
            setStatus(message === "NOTE_CONFLICT" ? "conflict" : message === "SESSION_EXPIRED" ? "session-expired" : "failed");
        }
    }, [accountId, classId, enabled, persist, title]);
    const change = useCallback((next: string) => {
        latest.current = next; revision.current += 1; setValue(next); onLocalChange(next);
        if (!enabled || !accountId || !classId) { setStatus("local"); return; }
        const currentNote = noteRef.current;
        persist({ accountId, classId, title, body: next, noteId: currentNote?.id, baseVersion: currentNote?.version ?? 0, status: "PENDING" });
        setStatus("pending"); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void save(), 700);
    }, [accountId, classId, enabled, onLocalChange, persist, save, title]);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    return { value, status, change, retry: () => void save() };
}
