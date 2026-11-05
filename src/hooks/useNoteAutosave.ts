import { useEffect, useRef, useState } from "react";
import { createNote, listNotes, updateNote, type Note } from "../api/notes";

type SyncState = "local" | "loading" | "pending" | "saving" | "saved" | "failed" | "conflict";

export function useNoteAutosave(enabled: boolean, classId: string | undefined, title: string, localValue: string, onLocalChange: (value: string) => void) {
    const [note, setNote] = useState<Note>();
    const [value, setValue] = useState(localValue);
    const [status, setStatus] = useState<SyncState>(enabled ? "loading" : "local");
    const timer = useRef<number | undefined>(undefined);
    const latest = useRef(localValue);
    useEffect(() => { latest.current = localValue; if (!note) setValue(localValue); }, [localValue, note]);
    useEffect(() => {
        let current = true;
        if (!enabled || !classId) { setNote(undefined); setStatus("local"); return; }
        setStatus("loading");
        listNotes(classId).then(items => { if (!current) return; const remote = items[0]; if (remote) { setNote(remote); setValue(remote.body); latest.current = remote.body; } setStatus("saved"); }).catch(() => { if (current) setStatus("failed"); });
        return () => { current = false; window.clearTimeout(timer.current); };
    }, [enabled, classId]);
    const save = async () => {
        if (!enabled || !classId) return;
        setStatus("saving");
        try { const input = { classId, title, body: latest.current, version: note?.version ?? 0 }; const saved = note ? await updateNote(note.id, input) : await createNote(input); setNote(saved); setStatus("saved"); }
        catch (error) { setStatus(error instanceof Error && error.message === "NOTE_CONFLICT" ? "conflict" : "failed"); }
    };
    const change = (next: string) => { latest.current = next; setValue(next); onLocalChange(next); if (!enabled || !classId) return; setStatus("pending"); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => void save(), 700); };
    const retry = () => void save();
    return { value, status, change, retry };
}
