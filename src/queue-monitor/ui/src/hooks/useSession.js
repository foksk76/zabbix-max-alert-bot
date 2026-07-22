// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react';

// ADR-0034: проверка статуса аутентификации через /api/auth/session.
// Возвращает { session, loading, error }.
// При 401/ошибке session = null (UI покажет LoginPage).
export function useSession() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            try {
                const res = await fetch('/api/auth/session', { credentials: 'same-origin' });
                if (!res.ok) {
                    if (!cancelled) {
                        setSession(null);
                        setLoading(false);
                    }
                    return;
                }
                const data = await res.json();
                if (!cancelled) {
                    setSession(data);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        check();
        return () => { cancelled = true; };
    }, []);

    return { session, loading, error };
}
