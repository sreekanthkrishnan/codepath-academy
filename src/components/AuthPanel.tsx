import { useState } from "react";
import "./AuthPanel.css";

export function AuthPanel({ onClose, onLogin, onRegister }: { onClose: () => void; onLogin: (email: string, password: string) => Promise<unknown>; onRegister: (email: string, password: string, displayName: string) => Promise<unknown> }) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const submit = async (event: React.FormEvent) => {
        event.preventDefault(); setSaving(true); setError("");
        try { if (mode === "login") await onLogin(email, password); else await onRegister(email, password, displayName); onClose(); }
        catch { setError("We could not sign you in. Check your details and try again."); }
        finally { setSaving(false); }
    };
    return <div className="auth-backdrop" role="dialog" aria-modal="true" aria-label="Account access"><form className="auth-panel" onSubmit={submit}>
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close account access">×</button>
        <p className="eyebrow">YOUR CODEPATH ACCOUNT</p><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        {mode === "register" && <label>Display name<input value={displayName} onChange={event => setDisplayName(event.target.value)} maxLength={120} required /></label>}
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} required /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="primary" disabled={saving}>{saving ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        <button className="auth-switch" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
    </form></div>;
}
