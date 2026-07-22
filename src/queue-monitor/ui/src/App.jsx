// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect } from 'react';
import { useSession } from './hooks/useSession.js';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

// ADR-0034: корневой компонент. Простой state-based routing:
// не authenticated → LoginPage, authenticated → DashboardPage.
// react-router не используется (лишняя зависимость для 1 оператора).
export default function App() {
    const { session, loading } = useSession();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Загрузка…</p>
            </div>
        );
    }

    if (!session || !session.authenticated) {
        return <LoginPage />;
    }

    return <DashboardPage user={session.user} csrf={session.csrf} />;
}
