# Sprint 14: Queue Infrastructure (ADR-0025 + ADR-0028)

## Outcome

Построить инфраструктуру очереди доставки сообщений: SQLite store с enqueue/dequeue/ack/nack, worker с retry и exponential backoff, интеграция с live-pipeline через conditional enqueue. По ADR-0025 (better-sqlite3) и ADR-0028 (delivery queue).

Контекст: текущий outbound-client делает fire-and-forget (`httpClient.post(request)`). При недоступности MAX Bot API сообщение теряется. Очередь гарантирует at-least-once доставку.

## Tasks

### Task 1: Add `better-sqlite3` dependency

**Status:** Planned

**Description:** Добавить `better-sqlite3` в `package.json` как runtime dependency. Проверить совместимость с Node 22.

**Acceptance criteria:**
- [x] `package.json` содержит `"dependencies": { "better-sqlite3": "^x.x" }`
- [x] `npm install` завершается без ошибок
- [x] `npm audit` не показывает критических уязвимостей

**Verification:**
- [x] `npm test` passes (существующие тесты не сломаны)

**Dependencies:** None

**Files likely touched:**
- `package.json`

**Estimated scope:** XS (1 file)

### Task 2: Add queue env vars to `src/bot-platform/core/config.js`

**Status:** Planned

**Description:** Расширить `createBotPlatformConfig()` новыми переменными окружения для очереди: `QUEUE_ENABLED`, `QUEUE_MAX_ATTEMPTS`, `QUEUE_INTERVAL_MS`, `QUEUE_BATCH_SIZE`, `QUEUE_BACKOFF_BASE`, `QUEUE_BACKOFF_MAX`. Значения по умолчанию из ADR-0028. `QUEUE_ENABLED=false` по умолчанию (backward compatible).

**Acceptance criteria:**
- [x] `createBotPlatformConfig({ QUEUE_ENABLED: 'true' })` возвращает `queueEnabled: true`
- [x] `createBotPlatformConfig({})` возвращает `queueEnabled: false` (default)
- [x] `queueMaxAttempts` по умолчанию = 5
- [x] `queueIntervalMs` по умолчанию = 5000
- [x] `queueBatchSize` по умолчанию = 10

**Verification:**
- [x] `npm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/bot-platform/core/config.js`

**Estimated scope:** S (1 file)

### Task 3: Create `src/bot-platform/queue/store.js`

**Status:** Planned

**Description:** SQLite-based queue store. Фабрика `createQueueStore(options = {})` принимает `{ dbPath }` (путь к SQLite файлу). Создаёт таблицу `delivery_queue` при инициализации (schema из ADR-0028). Экспортирует методы: `enqueue(entry)`, `dequeue(batchSize)`, `ack(id)`, `nack(id, attempts, maxAttempts)`, `stats()`. Все операции синхронные (better-sqlite3 API).

**Acceptance criteria:**
- [x] `createQueueStore({ dbPath: ':memory:' })` создаёт store без ошибок
- [x] `enqueue({ payload: {...}, source: 'zabbix' })` возвращает `{ id }` (autoincrement)
- [x] `dequeue(10)` возвращает массив pending записей, помечает их как `processing`
- [x] `ack(id)` устанавливает `status='delivered'`
- [x] `nack(id, 1, 5)` устанавливает `status='pending'` + `next_retry_at` (exponential backoff)
- [x] `nack(id, 5, 5)` устанавливает `status='failed'` (max attempts reached)
- [x] `stats()` возвращает `{ pending: N, processing: N, delivered: N, failed: N }`
- [x] `dequeue()` пропускает записи с `next_retry_at > Date.now()/1000`
- [x] Таблица `delivery_queue` создаётся автоматически при первом обращении

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `src/bot-platform/queue/store.js` (new)

**Estimated scope:** M (1 file, complex logic)

### Task 4: Create `tests/bot-platform/queue-store.test.js`

**Status:** Planned

**Description:** Unit tests для queue store: enqueue, dequeue, ack, nack (success + max attempts), stats, retry timing. Использовать in-memory SQLite (`:memory:`).

**Acceptance criteria:**
- [x] Тест: enqueue создаёт запись с `status='pending'`
- [x] Тест: dequeue возвращает pending записи и помечает как processing
- [x] Тест: ack устанавливает `status='delivered'`
- [x] Тест: nack с attempts < max устанавливает `status='pending'` + `next_retry_at > now`
- [x] Тест: nack с attempts >= max устанавливает `status='failed'`
- [x] Тест: stats возвращает правильные counts
- [x] Тест: dequeue пропускает записи с `next_retry_at` в будущем
- [x] Тест: enqueue с idempotency_key предотвращает дубли (опционально)

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 3

**Files likely touched:**
- `tests/bot-platform/queue-store.test.js` (new)

**Estimated scope:** M (1 file, 8+ tests)

### Task 5: Create `src/bot-platform/queue/worker.js`

**Status:** Planned

**Description:** Queue worker — `setInterval` polling loop. Фабрика `createQueueWorker(options = {})` принимает `{ queueStore, outboundClient, batchSize, intervalMs, logger }`. Экспортирует `start()`, `stop()`, `poll()` (отдельно для тестирования). `poll()`: dequeue → send → ack/nack. Exponential backoff при nack. Логирование каждого результата.

**Acceptance criteria:**
- [x] `createQueueWorker({})` возвращает объект с `start()`, `stop()`, `poll()`
- [x] `poll()` вызывает `queueStore.dequeue(batchSize)` 
- [x] Для каждой записи: `outboundClient.send(payload)` → `ack(id)` при успехе
- [x] При ошибке отправки: `nack(id, attempts+1, maxAttempts)`
- [x] `start()` запускает `setInterval(poll, intervalMs)`
- [x] `stop()` очищает интервал
- [x] Worker не падает при ошибке отправки (продолжает работу)

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 3

**Files likely touched:**
- `src/bot-platform/queue/worker.js` (new)

**Estimated scope:** M (1 file)

### Task 6: Create `tests/bot-platform/queue-worker.test.js`

**Status:** Planned

**Description:** Unit tests для queue worker: poll обрабатывает очередь, ack/nack вызываются правильно, start/stop работают, ошибки не крашат worker.

**Acceptance criteria:**
- [x] Тест: poll() dequeues и отправляет через outboundClient
- [x] Тест: успешная отправка → ack(id)
- [x] Тест: ошибка отправки → nack(id, attempts+1, maxAttempts)
- [x] Тест: start() запускает interval
- [x] Тест: stop() останавливает interval
- [x] Тест: worker продолжает после ошибки отправки

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 5

**Files likely touched:**
- `tests/bot-platform/queue-worker.test.js` (new)

**Estimated scope:** M (1 file, 6+ tests)

### Task 7: Add conditional enqueue to `src/bot-platform/core/live-pipeline.js`

**Status:** Planned

**Description:** Расширить `createIdentityUpdateProcessor()` для поддержки очереди. Если `queueStore` передан через options И `queueEnabled=true`: вызывать `queueStore.enqueue()` вместо `outboundClient.send()`. Если `queueStore` не передан или `queueEnabled=false`: существующее поведение (fire-and-forget). Обратная совместимость обязательна.

**Acceptance criteria:**
- [x] Существующие тесты live-pipeline продолжают работать (queue не включена)
- [x] При `queueEnabled: true` и `queueStore`: вызывается `queueStore.enqueue()` вместо `outboundClient.send()`
- [x] При `queueEnabled: false`: вызывается `outboundClient.send()` (без изменений)
- [x] При `queueStore: undefined`: вызывается `outboundClient.send()` (без изменений)

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 3

**Files likely touched:**
- `src/bot-platform/core/live-pipeline.js`

**Estimated scope:** S (1 file, conditional branch)

### Task 8: Create `tests/bot-platform/queue-pipeline-integration.test.js`

**Status:** Planned

**Description:** Интеграционные тесты: live-pipeline с queue enabled, live-pipeline с queue disabled (backward compat), dry-run pipeline без очереди.

**Acceptance criteria:**
- [x] Тест: live-pipeline + queue enabled → enqueue вызван, send не вызван
- [x] Тест: live-pipeline + queue disabled → send вызван, enqueue не вызван
- [x] Тест: live-pipeline + no queueStore → send вызван
- [x] Тест: dry-run pipeline → send вызван (очередь не используется в dry-run)

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 7

**Files likely touched:**
- `tests/bot-platform/queue-pipeline-integration.test.js` (new)

**Estimated scope:** S (1 file, 4 tests)

## Checkpoint: After Tasks 1-2 (Foundation)

- [x] `better-sqlite3` установлен
- [x] Queue env vars добавлены в config
- [x] `npm test` passes (существующие тесты не сломаны)

## Checkpoint: After Tasks 3-4 (Queue Store)

- [x] `queue/store.js` создан и работает
- [x] `queue-store.test.js` — все тесты проходят
- [x] SQLite schema создаётся автоматически

## Checkpoint: After Tasks 5-6 (Queue Worker)

- [x] `queue/worker.js` создан и работает
- [x] `queue-worker.test.js` — все тесты проходят
- [x] Retry + exponential backoff работают

## Checkpoint: After Tasks 7-8 (Pipeline Integration)

- [x] Live-pipeline поддерживает conditional enqueue
- [x] Интеграционные тесты проходят
- [x] Backward compatibility сохранена (QUEUE_ENABLED=false)
- [x] `npm test` passes (все тесты)
