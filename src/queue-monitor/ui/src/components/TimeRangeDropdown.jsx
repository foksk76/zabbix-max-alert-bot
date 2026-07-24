// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Button } from './ui/button.jsx';
import { Clock } from 'lucide-react';

// ADR-0041: предустановленные диапазоны времени для глобального фильтра.
const PRESETS = [
    { label: '1ч', seconds: 3600 },
    { label: '6ч', seconds: 21600 },
    { label: '12ч', seconds: 43200 },
    { label: '24ч', seconds: 86400 },
    { label: '3 дня', seconds: 259200 },
    { label: '7 дней', seconds: 604800 },
    { label: '30 дней', seconds: 2592000 }
];

export default function TimeRangeDropdown({ value, onChange }) {
    return (
        <div className="flex gap-1">
            {PRESETS.map((preset) => (
                <Button
                    key={preset.seconds}
                    variant={value === preset.seconds ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onChange(preset.seconds)}
                >
                    <Clock className="w-3.5 h-3.5 mr-1 shrink-0 hidden sm:inline" />
                    {preset.label}
                </Button>
            ))}
        </div>
    );
}
