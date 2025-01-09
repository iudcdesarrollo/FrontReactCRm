export interface AuthSession {
    email: string;
    timestamp: number;
}

const AUTH_KEY = 'authSession';
const SESSION_DURATION = 3600000;

export const authService = {
    saveSession(email: string) {
        const session: AuthSession = {
            email,
            timestamp: Date.now()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    },

    getSession(): AuthSession | null {
        const session = localStorage.getItem(AUTH_KEY);
        if (!session) return null;

        const parsedSession: AuthSession = JSON.parse(session);
        const isExpired = Date.now() - parsedSession.timestamp > SESSION_DURATION;

        if (isExpired) {
            this.clearSession();
            return null;
        }

        this.refreshSession(parsedSession.email);
        return parsedSession;
    },

    refreshSession(email: string) {
        this.saveSession(email);
    },

    clearSession() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem('agenteData');
        localStorage.removeItem('rawData');
        localStorage.removeItem('dataTimestamp');
    },

    isAuthenticated(): boolean {
        return this.getSession() !== null;
    }
};