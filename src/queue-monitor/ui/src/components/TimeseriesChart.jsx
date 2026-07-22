// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const WINDOWS = [
    { label: '1ч', seconds: 3600 },
    { label: '6ч', seconds: 21600 },
    { label: '12ч', seconds: 43200 },
    { label: '24ч', seconds: 86400 }
];

const STATUS_COLORS = {
    delivered: '#10b981',
    failed: '#f43f5e',
    pending: '#f59e0b',
    processing: '#3b82f6'
};

// Трансформировать rows [{bucket, status, count}] в [{bucket, delivered, failed, ...}].
function pivot(rows) {
    const byBucket = new Map();
    for (const row of rows || []) {
        if (!byBucket.has(row.bucket)) {
            byBucket.set(row.bucket, { bucket: row.bucket });
        }
        byBucket.get(row.bucket)[row.status] = (byBucket.get(row.bucket)[row.status] || 0) + row.count;
    }
    return Array.from(byBucket.values()).sort((a, b) => a.bucket - b.bucket);
}

function formatBucket(ts) {
    const d = new Date(ts * 1000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TimeseriesChart({ timeseries, windowSeconds, onWindowChange }) {
    const data = pivot(timeseries?.data);

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-700">Временные ряды по статусам</h2>
                <div className="flex gap-1">
                    {WINDOWS.map((w) => (
                        <button
                            key={w.seconds}
                            onClick={() => onWindowChange(w.seconds)}
                            className={`px-2 py-1 text-xs rounded ${
                                windowSeconds === w.seconds
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {w.label}
                        </button>
                    ))}
                </div>
            </div>
            {data.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">Нет данных за период</p>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="bucket" tickFormatter={formatBucket} fontSize={11} />
                        <YAxis allowDecimals={false} fontSize={11} />
                        <Tooltip labelFormatter={formatBucket} />
                        <Legend />
                        {Object.keys(STATUS_COLORS).map((status) => (
                            <Line
                                key={status}
                                type="monotone"
                                dataKey={status}
                                stroke={STATUS_COLORS[status]}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
