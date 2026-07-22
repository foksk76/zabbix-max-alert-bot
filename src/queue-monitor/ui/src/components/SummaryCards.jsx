// SPDX-License-Identifier: Apache-2.0
import React from 'react';

// Карточки агрегированной статистики: pending/processing/delivered/failed/total.
const CARDS = [
    { key: 'pending', label: 'Ожидают', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'processing', label: 'В обработке', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'delivered', label: 'Доставлено', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'failed', label: 'Ошибки', color: 'bg-rose-50 text-rose-700 border-rose-200' }
];

export default function SummaryCards({ summary }) {
    if (!summary) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse h-24" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CARDS.map((card) => (
                <div key={card.key} className={`rounded-lg border p-4 ${card.color}`}>
                    <div className="text-2xl font-semibold">{summary[card.key] ?? 0}</div>
                    <div className="text-sm opacity-80">{card.label}</div>
                </div>
            ))}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-2xl font-semibold text-slate-800">{summary.total ?? 0}</div>
                <div className="text-sm text-slate-500">Всего</div>
                <div className="text-xs text-slate-400 mt-1">
                    попыток: {summary.totalAttempts ?? 0}
                </div>
            </div>
        </div>
    );
}
