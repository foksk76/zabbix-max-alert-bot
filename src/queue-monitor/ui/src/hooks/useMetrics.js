// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useRef, useCallback } from 'react';

// ADR-0034/ADR-0035/ADR-0041: загрузка метрик с /api/metrics/* с автообновлением.
// Session-авторизация (ADR-0035) — session cookie отправляется автоматически
// (credentials: 'same-origin'), Bearer token не нужен для UI.
//
// ADR-0041: timeRange — объект { mode: 'relative'|'absolute', seconds, from, to }.
// Конвертация в query string происходит внутри хука.
//
// Возвращает { summary, timeseries, top, errors, loading, error, refresh, lastUpdated }.
export function useMetrics({ timeRange, windowSeconds: windowSecondsDeprecated, refreshMs = 30000, topLimit = 5, errorsLimit = 20 }) {
    // Backward compatibility: если передан windowSeconds (deprecated), конвертируем в timeRange
    const effectiveTimeRange = timeRange || { mode: 'relative', seconds: windowSecondsDeprecated || 3600 };

    const [summary, setSummary] = useState(null);
    const [timeseries, setTimeseries] = useState(null);
    const [top, setTop] = useState(null);
    const [topBy, setTopBy] = useState('source');
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const refreshRef = useRef(null);
    const redirectRef = useRef(null);

    const buildTimeQuery = useCallback(() => {
        if (effectiveTimeRange.mode === 'absolute' && effectiveTimeRange.from && effectiveTimeRange.to) {
            return `from=${effectiveTimeRange.from}&to=${effectiveTimeRange.to}`;
        }
        const w = effectiveTimeRange.seconds || 3600;
        return `window=${w}`;
    }, [effectiveTimeRange]);

    const refresh = useCallback(async () => {
        try {
            const fetchJson = async (url) => {
                const r = await fetch(url, { credentials: 'same-origin' });
                if (r.status === 401) {
                    throw new Error('SESSION_EXPIRED');
                }
                if (!r.ok) {
                    throw new Error(`HTTP ${r.status}`);
                }
                return r.json();
            };
            const timeQ = buildTimeQuery();
            const [sumRes, tsRes, topRes, errRes] = await Promise.all([
                fetchJson(`/api/metrics/summary?${timeQ}`),
                fetchJson(`/api/metrics/timeseries?${timeQ}`),
                fetchJson(`/api/metrics/top?by=${topBy}&limit=${topLimit}&${timeQ}`),
                fetchJson(`/api/metrics/errors?limit=${errorsLimit}&${timeQ}`)
            ]);
            setSummary(sumRes);
            setTimeseries(tsRes);
            setTop(topRes);
            setErrors(errRes);
            setError(null);
            setLastUpdated(new Date());
        } catch (err) {
            if (err.message === 'SESSION_EXPIRED') {
                if (refreshRef.current) {
                    clearInterval(refreshRef.current);
                    refreshRef.current = null;
                }
                setError('Сессия истекла. Перенаправление...');
                redirectRef.current = setTimeout(() => {
                    window.location.href = '/api/auth/login';
                }, 2000);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [buildTimeQuery, topBy, topLimit, errorsLimit]);

    useEffect(() => {
        refresh();
        if (refreshRef.current) {
            clearInterval(refreshRef.current);
        }
        refreshRef.current = setInterval(refresh, refreshMs);
        return () => {
            if (refreshRef.current) {
                clearInterval(refreshRef.current);
            }
            if (redirectRef.current) {
                clearTimeout(redirectRef.current);
            }
        };
    }, [refresh, refreshMs]);

    const refreshNow = useCallback(async () => {
        await refresh();
        if (redirectRef.current) {
            return;
        }
        if (refreshRef.current) {
            clearInterval(refreshRef.current);
        }
        refreshRef.current = setInterval(refresh, refreshMs);
    }, [refresh, refreshMs]);

    return {
        summary,
        timeseries,
        top,
        errors,
        topBy,
        setTopBy,
        loading,
        error,
        refresh,
        refreshNow,
        lastUpdated
    };
}
