# Implementation Plan: ADR-0029 Lifecycle Audit Trail

## Overview

Внедрить двуслойное журналирование (audit trail + lifecycle trace) в bot-platform pipeline. Каждое входящее HTTP-запрос получает `reqId` (crypto.randomUUID()), который прокидывается через auth → normalize → queue → outbound. Audit-записи — для быстрого grep, trace-записи — для полной трассировки по reqId. Формат: `[<ISO-timestamp>] [<level>] [<module>:<reqId>] <action> {<json-context>}`.

Контекст: ADR-0029 принят (2026-07-18). Live run подтвердил доставку, но промежуточные этапы не логируются. Текущий pipeline: 8 log calls на 1126 строк кода в 5 модулях.

## Architecture Decisions

- **Формат через helper, не через рефакторинг logger**: добавить `formatLogLine()` в `logger.js`, модули вызывают его для stdout-строки. Внутренний API `createSafeLogger` не меняется — минимум disruption.
- **reqId в payload + столбце**:双重存储 — payload для передачи между компонентами, `req_id` столбец для SQL-запросов.
- **Nullable req_id**: обратная совместимость с существующими записями в queue.
- **Флаги LOG_AUDIT / LOG_TRACE**: управление на уровне вызова, не на уровне logger. Если флаг выключен — соответствующие log-вызовы пропускаются.

## Task List

### Phase 1: Foundation

- [ ] Task 1: Config — add `LOG_AUDIT`, `LOG_TRACE` env vars
- [ ] Task 2: Logger — add `formatLogLine()` helper for ADR-0029 format
- [ ] Task 3: Schema — add `req_id` column + index to `delivery_queue`

### Checkpoint: Foundation
- [ ] `npm test` passes
- [ ] Config возвращает `logAudit: true`, `logTrace: true`
- [ ] `formatLogLine()` produces correct format
- [ ] `delivery_queue` таблица имеет `req_id` столбец

### Phase 2: Ingress Layer (reqId generation + audit/trace)

- [ ] Task 4: http-server.js — generate `reqId`, add trace/audit log calls
- [ ] Task 5: jwt-source-auth.js — add audit log, accept `reqId` + `ip`
- [ ] Task 6: Tests for ingress audit/trace

### Checkpoint: Ingress
- [ ] `POST /ingest` генерирует `reqId` и логирует ingress/jwt/normalize/enqueue
- [ ] Audit-логи: auth success/fail
- [ ] Trace-логи: ingress, jwt verified, normalized, enqueued
- [ ] Тесты проходят

### Phase 3: Queue + Outbound Layer

- [ ] Task 7: store.js — accept `reqId` in enqueue, return in dequeue, trace log
- [ ] Task 8: worker.js — add trace/audit logs for dequeue/delivered/failed
- [ ] Task 9: outbound-client.js — add trace log for outbound request/response
- [ ] Task 10: Tests for queue + outbound audit/trace

### Checkpoint: Queue + Outbound
- [ ] `reqId` прокидывается через queue payload и `req_id` столбец
- [ ] Audit-логи: message queued/delivered/failed
- [ ] Trace-логи: dequeued/outbound/delivered/failed
- [ ] Тесты проходят

### Phase 4: Integration + Documentation

- [ ] Task 11: End-to-end integration test (full lifecycle trace)
- [ ] Task 12: Documentation — logstash grok filter, env vars, format spec

### Checkpoint: Complete
- [ ] Полный lifecycle trace от ingress до delivery
- [ ] `journalctl -u max-identity-bot-live | grep '\[audit\]'` работает
- [ ] `npm test` — все тесты проходят
- [ ] Документация обновлена

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Logger format change breaks existing log consumers | Medium | formatLogLine is additive; existing emit() unchanged |
| req_id migration fails on existing DB | Low | ALTER TABLE ADD COLUMN is safe; column is nullable |
| Performance impact of randomUUID + 2 log calls per request | Low | randomUUID is ~microseconds; log writes are async |
| outbound-client.js shared-helpers createLogger only checks `info` | Low | Audit/trace use info level; error paths use logger.error directly |

## Open Questions

- Should `LOG_AUDIT` and `LOG_TRACE` default to `true` or `false`? ADR says `true`. Recommendation: `true` (safe default for MVP).
- Should the logger's `moduleName` come from options (refactor) or stay embedded in message strings? Recommendation: keep embedded (less disruption, matches current pattern).
