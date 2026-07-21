// SPDX-License-Identifier: Apache-2.0
'use strict';

const MODULE_NAME = 'queue-monitor-metrics';
const MAX_LIMIT = 100;

// ADR-0034: window задаётся как длительность (1h, 30m, 1d) или целое число секунд.
// parseInt('1h') молча возвращает 1, поэтому duration-формат нужно парсить явно.
const DURATION_PATTERN = /^(\d+)\s*(s|m|h|d)$/i;
const DURATION_TO_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 };

function parseWindowSeconds(raw) {
    if (raw === undefined || raw === null || raw === '') {
        return 0;
    }
    const value = String(raw).trim();

    const match = DURATION_PATTERN.exec(value);
    if (match) {
        return Number(match[1]) * DURATION_TO_SECONDS[match[2].toLowerCase()];
    }

    const parsed = parseInt(value, 10);
    // Требуем, что вся строка — неотрицательное целое: parseInt('1x') === 1
    // молча отбрасывает суффикс, что маскировало ошибочный формат window.
    if (Number.isNaN(parsed) || parsed < 0 || String(parsed) !== value) {
        return 0;
    }
    return parsed;
}

function createMetricsRoutes(options = {}) {
    const reader = options.reader;

    if (!reader) {
        throw new Error('reader is required');
    }

    function summary(_ctx) {
        const data = reader.summary();
        return {
            statusCode: 200,
            body: {
                status: 'ok',
                total: data.total,
                pending: data.pending,
                processing: data.processing,
                delivered: data.delivered,
                failed: data.failed,
                totalAttempts: data.totalAttempts
            }
        };
    }

    function discovery(_ctx) {
        return {
            statusCode: 200,
            body: {
                status: 'ok',
                data: [
                    {
                        '{#METRIC}': 'queue.pending',
                        '{#LABEL}': 'Ожидают отправки'
                    },
                    {
                        '{#METRIC}': 'queue.processing',
                        '{#LABEL}': 'В обработке'
                    },
                    {
                        '{#METRIC}': 'queue.delivered',
                        '{#LABEL}': 'Доставлено'
                    },
                    {
                        '{#METRIC}': 'queue.failed',
                        '{#LABEL}': 'Ошибки'
                    },
                    {
                        '{#METRIC}': 'queue.total',
                        '{#LABEL}': 'Всего сообщений'
                    },
                    {
                        '{#METRIC}': 'queue.totalAttempts',
                        '{#LABEL}': 'Всего попыток'
                    }
                ]
            }
        };
    }

    function timeseries(ctx) {
        const windowSeconds = parseWindowSeconds(ctx.query.window);
        const data = reader.timeseries(windowSeconds);
        return {
            statusCode: 200,
            body: {
                status: 'ok',
                window: windowSeconds,
                data
            }
        };
    }

    function top(ctx) {
        const by = ctx.query.by || 'source';
        const limit = Math.min(parseInt(ctx.query.limit, 10) || 5, MAX_LIMIT);

        if (by === 'recipient') {
            const data = reader.topRecipient(limit);
            return {
                statusCode: 200,
                body: { status: 'ok', by, limit, data }
            };
        }

        const data = reader.topSource(limit);
        return {
            statusCode: 200,
            body: { status: 'ok', by, limit, data }
        };
    }

    function errors(ctx) {
        const limit = Math.min(parseInt(ctx.query.limit, 10) || 20, MAX_LIMIT);
        const data = reader.errors(limit);
        return {
            statusCode: 200,
            body: {
                status: 'ok',
                limit,
                data
            }
        };
    }

    return {
        summary,
        discovery,
        timeseries,
        top,
        errors
    };
}

module.exports = {
    MODULE_NAME,
    createMetricsRoutes
};
