// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { Button } from './ui/button.jsx';

// ADR-0041: выбор абсолютного временного диапазона через datetime-local inputs.
function toLocalISOString(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value) {
    if (!value) return null;
    return Math.floor(new Date(value).getTime() / 1000);
}

export default function AbsoluteRangePicker({ from, to, onApply, onCancel }) {
    const [localFrom, setLocalFrom] = useState(toLocalISOString(from));
    const [localTo, setLocalTo] = useState(toLocalISOString(to));

    function handleApply() {
        const fromTs = fromLocalInput(localFrom);
        const toTs = fromLocalInput(localTo);
        if (fromTs && toTs && fromTs < toTs) {
            onApply(fromTs, toTs);
        }
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-muted-foreground" htmlFor="time-from">от</label>
            <input
                id="time-from"
                type="datetime-local"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                aria-label="Начало диапазона"
            />
            <label className="text-xs text-muted-foreground" htmlFor="time-to">до</label>
            <input
                id="time-to"
                type="datetime-local"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
                aria-label="Конец диапазона"
            />
            <Button size="sm" onClick={handleApply}>Применить</Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>Отмена</Button>
        </div>
    );
}
