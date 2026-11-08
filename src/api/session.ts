let expiryProbe: Promise<boolean> | undefined;

export function signalSessionExpired(): void {
    window.dispatchEvent(new Event("codepath:session-expired"));
}

/** One identity probe is shared by concurrent failed mutations. */
export function unauthenticatedAfterForbidden(baseUrl: string): Promise<boolean> {
    if (!expiryProbe) {
        expiryProbe = fetch(`${baseUrl}/api/v1/auth/me`, { credentials: "include" })
            .then(response => response.status === 401 || response.status === 403)
            .catch(() => false)
            .finally(() => { expiryProbe = undefined; });
    }
    return expiryProbe;
}
