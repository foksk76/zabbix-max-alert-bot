// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Card, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';

const CARDS = [
    { key: 'pending', label: 'Ожидают', variant: 'warning', Icon: Clock },
    { key: 'processing', label: 'В обработке', variant: 'info', Icon: Loader },
    { key: 'delivered', label: 'Доставлено', variant: 'success', Icon: CheckCircle },
    { key: 'failed', label: 'Ошибки', variant: 'error', Icon: XCircle }
];
// Total items rendered: CARDS.length (4) + 1 total card = 5.
// md:grid-cols-5 matches exactly; skeleton also renders 5 placeholders.

export default function SummaryCards({ summary }) {
    if (!summary) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="animate-pulse h-24" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CARDS.map((card) => (
                <Card key={card.key}>
                    <CardContent>
                        <div className="text-2xl font-semibold">{summary[card.key] ?? 0}</div>
                        <Badge variant={card.variant} className="mt-1">
                            <card.Icon className="w-4 h-4 mr-1 shrink-0" />
                            {card.label}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
            <Card>
                <CardContent>
                    <div className="text-2xl font-semibold text-foreground">{summary.total ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Всего</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        попыток: {summary.totalAttempts ?? 0}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
