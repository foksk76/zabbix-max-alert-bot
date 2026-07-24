// SPDX-License-Identifier: Apache-2.0
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button.jsx';
import { ChevronDown } from 'lucide-react';

// ADR-0041: интервалы автообновления.
const REFRESH_OPTIONS = [
    { label: '30с', ms: 30000 },
    { label: '1 мин', ms: 60000 },
    { label: '5 мин', ms: 300000 },
    { label: '10 мин', ms: 600000 },
    { label: '30 мин', ms: 1800000 },
    { label: 'Выкл', ms: 0 }
];

// ADR-0041: выпадающий список для выбора интервала автообновления.
export default function RefreshDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const current = REFRESH_OPTIONS.find((o) => o.ms === value) || REFRESH_OPTIONS[0];

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setOpen((prev) => !prev)}
            >
                {current.label}
                <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
            </Button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-md z-50 min-w-[80px]">
                    {REFRESH_OPTIONS.map((opt) => (
                        <button
                            key={opt.ms}
                            className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground ${
                                opt.ms === value ? 'bg-accent font-medium' : ''
                            }`}
                            onClick={() => {
                                onChange(opt.ms);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
