// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Bird } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="max-w-sm w-full shadow-md">
                <CardContent className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-primary flex items-center justify-center">
                        <Bird className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground mb-1">Зяблик</h1>
                    <p className="text-sm text-muted-foreground mb-6">Дашборд очереди доставки</p>
                    <Button asChild className="w-full">
                        <a href="/api/auth/login">Войти через IdP</a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
