# Sprint 15: Ingress Pipeline (ADR-0023 + ADR-0024)

## Outcome

Построить ingress pipeline: JWT-аутентификация через IdP (NanoIDP/Okta), per-source нормализаторы, HTTP-сервер с маршрутом `POST /ingest`. По ADR-0023 (http.createServer), ADR-0024 (@okta/jwt-verifier), ADR-0022 (multi-source ingest scope).

Контекст: bot-platform не принимает входящий HTTP. Источники (Zabbix, SIEM) не могут доставлять уведомления. Текущий прямой путь `max-webhook.js → MAX Bot API` не аутентифицируется.

## Tasks

### Task 1: Add `@okta/jwt-verifier` dependency

**Status:** Planned

**Description:** Добавить `@okta/jwt-verifier` v4.x в `package.json` как runtime dependency. Проверить `npm audit`.

**Acceptance criteria:**
- [x] `package.json` содержит `"dependencies": { "@okta/jwt-verifier": "^4.x" }`
- [x] `npm install` завершается без ошибок
- [x] `npm audit` не показывает критических уязвимостей

**Verification:**
- [x] `npm test` passes

**Dependencies:** None

**Files likely touched:**
- `package.json`

**Estimated scope:** XS (1 file)

### Task 2: Add IdP env vars to `src/bot-platform/core/config.js`

**Status:** Planned

**Description:** Расширить `createBotPlatformConfig()` переменными для IdP: `IDP_ISSUER`, `IDP_AUDIENCE`. Добавить валидацию: если ingress включён, `IDP_ISSUER` обязателен.

**Acceptance criteria:**
- [x] `createBotPlatformConfig({ IDP_ISSUER: 'https://example.idp.com' })` возвращает `idpIssuer`
- [x] `createBotPlatformConfig({})` возвращает `idpIssuer: ''` (default)
- [x] Валидация: `IDP_ISSUER` обязателен при `INGRESS_ENABLED=true`

**Verification:**
- [x] `npm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/bot-platform/core/config.js`

**Estimated scope:** S (1 file)

### Task 3: Create `src/bot-platform/ingress/jwt-source-auth.js`

**Status:** Planned

**Description:** JWT-аутентификация через `@okta/jwt-verifier` (совместим с OIDC-провайдерами). Фабрика `createJwtSourceAuth(options = {})` принимает `{ issuer, audience, claimName, claimValue, logger }`. Метод `authenticate(authorizationHeader)` извлекает Bearer token, верифицирует через IdP JWKS, возвращает `{ source }` из claim. Fail-closed: любая ошибка → исключение.

**Acceptance criteria:**
- [x] `createJwtSourceAuth({ issuer, audience })` создаёт auth-модуль
- [x] `authenticate('Bearer <valid-jwt>')` возвращает `{ source: 'zabbix' }`
- [x] `authenticate(null)` выбрасывает ошибку
- [x] `authenticate('Bearer invalid')` выбрасывает ошибку
- [x] `authenticate('Bearer <expired-jwt>')` выбрасывает ошибку
- [x] `authenticate('Bearer <wrong-aud-jwt>')` выбрасывает ошибку
- [x] Ошибки не содержат raw token в сообщении (safe logger)

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `src/bot-platform/ingress/jwt-source-auth.js` (new)

**Estimated scope:** M (1 file, auth logic)

### Task 4: Create `tests/bot-platform/jwt-source-auth.test.js`

**Status:** Planned

**Description:** Unit tests для JwtSourceAuth: мокать `@okta/jwt-verifier` (ADR-0016 — dependency injection). Тестировать happy path, отсутствие токена, невалидный токен, expired, wrong audience.

**Acceptance criteria:**
- [x] Тест: валидный JWT → `{ source: 'zabbix' }`
- [x] Тест: null header → ошибка
- [x] Тест: невалидный token → ошибка
- [x] Тест: expired token → ошибка
- [x] Тест: wrong audience → ошибка
- [x] Тест: ошибка не содержит raw token

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 3

**Files likely touched:**
- `tests/bot-platform/jwt-source-auth.test.js` (new)

**Estimated scope:** M (1 file, 6+ tests)

### Task 5: Add `SOURCE_ZABBIX` to `src/bot-platform/core/event-contract.js`

**Status:** Planned

**Description:** Добавить константу `SOURCE_ZABBIX = 'zabbix'` (и `SOURCE_INGEST = 'ingest'` для ingest pipeline) в event-contract. Расширить `createInternalEvent()` для поддержки ingest source.

**Acceptance criteria:**
- [x] `SOURCE_ZABBIX === 'zabbix'`
- [x] `SOURCE_INGEST === 'ingest'`
- [x] `createInternalEvent({ source: 'ingest', recipient: {...}, message: {...} })` работает
- [x] Существующие тесты event-contract продолжают работать

**Verification:**
- [x] `npm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/bot-platform/core/event-contract.js`

**Estimated scope:** XS (1 file)

### Task 6: Create `src/bot-platform/ingress/normalizers/zabbix.js`

**Status:** Planned

**Description:** Per-source normalizer для Zabbix. Принимает body из `POST /ingest` (контракт: `{ recipient: { kind, value }, message: '...' }`), возвращает canonical event `{ source: 'zabbix', recipient, message: { text }, raw }`. Валидирует `recipient.kind` (user|chat) и `recipient.value`.

**Acceptance criteria:**
- [x] `normalizeZabbixEvent({ recipient: { kind: 'user', value: '123' }, message: 'alert' })` → canonical event
- [x] `normalizeZabbixEvent({ recipient: { kind: 'chat', value: '456' }, message: 'alert' })` → canonical event
- [x] `normalizeZabbixEvent({})` → ошибка (recipient обязателен)
- [x] `normalizeZabbixEvent({ recipient: { kind: 'unknown' } })` → ошибка
- [x] `normalizeZabbixEvent({ recipient: { value: '123' } })` → ошибка (kind обязателен)

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 5

**Files likely touched:**
- `src/bot-platform/ingress/normalizers/zabbix.js` (new)

**Estimated scope:** S (1 file)

### Task 7: Create `src/bot-platform/ingress/normalizers/index.js`

**Status:** Planned

**Description:** Normalizer registry. Объект `{ zabbix: normalizeZabbixEvent }`. Функция `getNormalizer(sourceName)` возвращает normalizer или `null`. Пока только Zabbix, расширяемость для будущих источников.

**Acceptance criteria:**
- [x] `getNormalizer('zabbix')` возвращает функцию
- [x] `getNormalizer('unknown')` возвращает `null`
- [x] Экспортирует `normalizeZabbixEvent` для прямого использования

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 6

**Files likely touched:**
- `src/bot-platform/ingress/normalizers/index.js` (new)

**Estimated scope:** XS (1 file)

### Task 8: Create `tests/bot-platform/ingress-normalizers.test.js`

**Status:** Planned

**Description:** Unit tests для normalizers: Zabbix normalizer happy path + error cases, registry lookup.

**Acceptance criteria:**
- [x] Тест: Zabbix user event → canonical event с `source: 'zabbix'`
- [x] Тест: Zabbix chat event → canonical event с `source: 'zabbix'`
- [x] Тест: Zabbix без recipient → ошибка
- [x] Тест: getNormalizer('zabbix') → функция
- [x] Тест: getNormalizer('unknown') → null

**Verification:**
- [x] `npm test` passes

**Dependencies:** Tasks 6, 7

**Files likely touched:**
- `tests/bot-platform/ingress-normalizers.test.js` (new)

**Estimated scope:** S (1 file, 5 tests)

### Task 9: Create `src/bot-platform/ingress/http-server.js`

**Status:** Planned

**Description:** HTTP-сервер на `http.createServer` (stdlib). Маршрут `POST /ingest`. Принимает `{ port, jwtAuth, normalizer, queueStore, outboundClient, logger }` через options. Парсит JSON body, вызывает `jwtAuth.authenticate(header)`, определяет normalizer по `source`, нормализует, отправляет через `outboundClient` или `queueStore.enqueue()`. Ответы: 200 (ok), 400 (invalid body), 401 (auth failure), 501 (channel without recipient).

**Acceptance criteria:**
- [x] `POST /ingest` с валидным JWT + body → 200
- [x] `POST /ingest` без JWT → 401
- [x] `POST /ingest` с невалидным JWT → 401
- [x] `POST /ingest` с невалидным JSON body → 400
- [x] `POST /ingest` без recipient → 400
- [x] `POST /ingest` с `channel` без `recipient` → 501
- [x] Сервер слушает на указанном порту
- [x] GET/PUT/DELETE → 404

**Verification:**
- [x] `npm test` passes

**Dependencies:** Tasks 3, 6, 7

**Files likely touched:**
- `src/bot-platform/ingress/http-server.js` (new)

**Estimated scope:** L (1 file, HTTP + auth + routing)

### Task 10: Create `tests/bot-platform/ingress-http-server.test.js`

**Status:** Planned

**Description:** Интеграционные тесты HTTP-сервера: мокать jwtAuth, normalizer, outboundClient. Тестировать все HTTP-ответы, включая ошибки.

**Acceptance criteria:**
- [x] Тест: POST /ingest + valid JWT → 200 + outbound/send вызван
- [x] Тест: POST /ingest + no JWT → 401
- [x] Тест: POST /ingest + invalid JWT → 401
- [x] Тест: POST /ingest + invalid JSON → 400
- [x] Тест: POST /ingest + no recipient → 400
- [x] Тест: POST /ingest + channel only → 501
- [x] Тест: GET /ingest → 404

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 9

**Files likely touched:**
- `tests/bot-platform/ingress-http-server.test.js` (new)

**Estimated scope:** M (1 file, 7+ tests)

## Checkpoint: After Tasks 1-2 (Foundation)

- [x] `@okta/jwt-verifier` установлен
- [x] IdP env vars добавлены в config
- [x] `npm test` passes

## Checkpoint: After Tasks 3-4 (JWT Auth)

- [x] `jwt-source-auth.js` создан и работает
- [x] `jwt-source-auth.test.js` — все тесты проходят
- [x] Mock-JWT тесты работают без реального IdP

## Checkpoint: After Tasks 5-8 (Normalizers)

- [x] `SOURCE_ZABBIX` добавлен в event-contract
- [x] Zabbix normalizer работает
- [x] Normalizer registry работает
- [x] Тесты normalizers проходят

## Checkpoint: After Tasks 9-10 (HTTP Server)

- [x] HTTP-сервер работает с `POST /ingest`
- [x] Все HTTP-коды ответов протестированы
- [x] Интеграционные тесты проходят
- [x] `npm test` passes (все тесты)
