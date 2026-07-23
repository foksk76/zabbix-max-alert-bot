// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import SummaryCards from '../components/SummaryCards.jsx';
import TimeseriesChart from '../components/TimeseriesChart.jsx';
import TopTable from '../components/TopTable.jsx';
import ErrorsTable from '../components/ErrorsTable.jsx';
import { useMetrics } from '../hooks/useMetrics.js';
import { Button } from '../components/ui/button.jsx';
import { RefreshCw, LogOut } from 'lucide-react';

export default function DashboardPage({ user, csrf }) {
    const [windowSeconds, setWindowSeconds] = useState(3600);

    const metrics = useMetrics({
        windowSeconds,
        refreshMs: 30000
    });

    async function logout() {
        try {
            const r = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'X-CSRF-Token': csrf },
                credentials: 'same-origin'
            });
            if (!r.ok) {
                alert(`Не удалось выйти (сервер: ${r.status}). Сессия может быть активна.`);
            }
        } catch {
            // Network error — redirect anyway (session may already be destroyed)
        }
        window.location.href = '/';
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">З</span>
                        </div>
                        <h1 className="text-base font-semibold text-foreground">Зяблик — очередь доставки</h1>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground hidden sm:inline">{user?.name || user?.email || user?.sub}</span>
                        <Button variant="ghost" size="sm" onClick={logout}>
                            <LogOut className="w-4 h-4 mr-1 shrink-0" />
                            Выйти
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => metrics.refresh()}>
                        <RefreshCw className="w-4 h-4 mr-1 shrink-0" />
                        обновить
                    </Button>
                </div>

                {metrics.error && (
                    <div className="bg-error-light border border-error/20 text-error-dark text-sm rounded-lg p-3">
                        Ошибка загрузки метрик: {metrics.error}
                    </div>
                )}

                <SummaryCards summary={metrics.summary} />

                <TimeseriesChart
                    timeseries={metrics.timeseries}
                    windowSeconds={windowSeconds}
                    onWindowChange={setWindowSeconds}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <TopTable
                        top={metrics.top}
                        topBy={metrics.topBy}
                        onByChange={metrics.setTopBy}
                    />
                    <ErrorsTable errors={metrics.errors} />
                </div>

                {metrics.lastUpdated && (
                    <p className="text-xs text-muted-foreground text-center">
                        обновлено: {metrics.lastUpdated.toLocaleTimeString('ru-RU')}
                    </p>
                )}
            </main>
        </div>
    );
}
