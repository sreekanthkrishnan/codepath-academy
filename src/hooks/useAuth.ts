import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, login as signIn, logout as signOut, register as signUp, type AuthUser } from "../api/auth";

type AuthState = { loading: boolean; user?: AuthUser; error?: string };

export function useAuth() {
    const [state, setState] = useState<AuthState>({ loading: true });
    const restore = useCallback(async () => {
        try { setState({ loading: true }); setState({ loading: false, user: await getCurrentUser() }); }
        catch (error) { setState({ loading: false, error: error instanceof Error && error.message === "SESSION_EXPIRED" ? undefined : "We could not check your account session." }); }
    }, []);
    useEffect(() => { void restore(); }, [restore]);
    useEffect(() => { const expired = () => setState({ loading: false, error: "Your session has expired. Sign in again to continue syncing your learning progress." }); window.addEventListener("codepath:session-expired", expired); return () => window.removeEventListener("codepath:session-expired", expired); }, []);
    const login = useCallback(async (email: string, password: string) => { const user = await signIn({ email, password }); setState({ loading: false, user }); return user; }, []);
    const register = useCallback(async (email: string, password: string, displayName: string) => { const user = await signUp({ email, password, displayName }); setState({ loading: false, user }); return user; }, []);
    const logout = useCallback(async () => { await signOut(); setState({ loading: false }); }, []);
    return { ...state, restore, login, register, logout };
}
