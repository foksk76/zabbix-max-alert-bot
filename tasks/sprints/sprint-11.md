# Sprint 11: ADR-0016 DI Injection Audit Test

## Outcome

Создать table-driven тест, проверяющий что все модули bot-platform принимают options параметр и могут быть сконструированы с инжектированными зависимостями (ADR-0016).

## Tasks

### Task 1: Проверка что все create* функцииAccept options

**Status:** Done

**Description:** Импортировать все 6 модулей из ADR-0016, проверить что каждый `create*` — функция с ≤2 аргументами.

**Acceptance criteria:**
- [ ] Все 6 функций — `typeof fn === 'function'`
- [ ] `fn.length <= 2`

**Verification:**
- [ ] `npm test` passes

**Dependencies:** None

**Files likely touched:**
- `tests/bot-platform/di-contract.test.js` (new)

**Estimated scope:** S (1 file)

### Task 2: Проверка что модули конструируются с инжектированными зависимостями

**Status:** Done

**Description:** Конструировать каждый модуль с mock-зависимостями и проверить что ключевые методы доступны.

**Acceptance criteria:**
- [ ] `outbound.send` — функция
- [ ] `inbound.poll` — функция
- [ ] `longPolling.start` и `.stop` — функции
- [ ] `liveService.start` — функция
- [ ] `app.plugins` — массив, `app.routes` — объект

**Verification:**
- [ ] `npm test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `tests/bot-platform/di-contract.test.js`

**Estimated scope:** S (1 file)

## Checkpoint: After Tasks 1-2

- [x] `tests/bot-platform/di-contract.test.js` создан
- [x] `npm test` passes (151 tests)
- [x] ADR-0016 DI контракт автоматически проверяется
