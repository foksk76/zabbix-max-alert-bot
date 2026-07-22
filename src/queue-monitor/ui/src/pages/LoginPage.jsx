// SPDX-License-Identifier: Apache-2.0
import React from 'react';

// Простая страница с кнопкой редиректа на /api/auth/login (OAuth2 flow стартует на сервере).
export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-sm w-full bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-brand-500 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">З</span>
                </div>
                <h1 className="text-xl font-semibold text-slate-800 mb-1">Зяблик</h1>
                <p className="text-sm text-slate-500 mb-6">Дашборд очереди доставки</p>
                <a
                    href="/api/auth/login"
                    className="inline-block w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                    Войти через IdP
                </a>
            </div>
        </div>
    );
}
