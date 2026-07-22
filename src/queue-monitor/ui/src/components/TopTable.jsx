// SPDX-License-Identifier: Apache-2.0
import React from 'react';

// Таблица топ-N: по source или по recipient (переключатель).
export default function TopTable({ top, topBy, onByChange }) {
    const rows = top?.data || [];
    const labelKey = topBy === 'recipient' ? 'recipient' : 'source';

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-700">Топ отправителей/получателей</h2>
                <div className="flex gap-1">
                    <button
                        onClick={() => onByChange('source')}
                        className={`px-2 py-1 text-xs rounded ${
                            topBy === 'source'
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        по источнику
                    </button>
                    <button
                        onClick={() => onByChange('recipient')}
                        className={`px-2 py-1 text-xs rounded ${
                            topBy === 'recipient'
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        по получателю
                    </button>
                </div>
            </div>
            {rows.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Нет данных</p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-100">
                            <th className="py-2 font-medium">{topBy === 'recipient' ? 'Получатель' : 'Источник'}</th>
                            <th className="py-2 font-medium text-right">Сообщений</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={`${row[labelKey]}-${i}`} className="border-b border-slate-50">
                                <td className="py-2 text-slate-700 break-all">{row[labelKey] || '—'}</td>
                                <td className="py-2 text-right text-slate-600 font-mono">{row.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
