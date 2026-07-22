// SPDX-License-Identifier: Apache-2.0
import React from 'react';

function formatTime(ts) {
    if (!ts) {
        return '—';
    }
    const d = new Date(ts * 1000);
    return d.toLocaleString('ru-RU');
}

function parseRecipient(payload) {
    if (!payload) {
        return '—';
    }
    try {
        const obj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        return obj?.recipient?.value || '—';
    } catch {
        return '—';
    }
}

// Таблица последних ошибок: id, source, recipient, attempts, updated_at, payload (свёрнуто).
export default function ErrorsTable({ errors }) {
    const rows = errors?.data || [];

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-medium text-slate-700 mb-3">Последние ошибки</h2>
            {rows.length === 0 ? (
                <p className="text-sm text-emerald-600 py-8 text-center">Ошибок нет ✓</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-100">
                                <th className="py-2 font-medium">ID</th>
                                <th className="py-2 font-medium">Источник</th>
                                <th className="py-2 font-medium">Получатель</th>
                                <th className="py-2 font-medium text-center">Попыток</th>
                                <th className="py-2 font-medium">Обновлено</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-50 align-top">
                                    <td className="py-2 text-slate-400 font-mono text-xs">{row.id}</td>
                                    <td className="py-2 text-slate-700">{row.source || '—'}</td>
                                    <td className="py-2 text-slate-700 break-all">{parseRecipient(row.payload)}</td>
                                    <td className="py-2 text-center text-rose-600 font-mono">{row.attempts}</td>
                                    <td className="py-2 text-slate-500 text-xs">{formatTime(row.updatedAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
