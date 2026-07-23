# Sprint 6: Convention-Based Plugin Loader

## Outcome

Заменить ручную привязку плагинов на convention-based auto-discovery. Плагины автоматически обнаруживаются по директории `src/bot-platform/plugins/{name}/`, валидируются и регистрируются в event router без редактирования `app.js` или pipeline-файлов.

Контекст: текущий plugin pattern требует ручного импорта и привязки каждого плагина в `app.js`, `dry-run-pipeline.js`, `live-pipeline.js`. При планируемых 10+ плагинах это неприемлемо. В `core/index.js:20` уже зафиксирован `pluginLoader: 'pending'`.

## Tasks

### Task 1: Create `src/bot-platform/core/plugin-loader.js`

**Status:** Closed

**Description:** Создать модуль plugin-loader с тремя функциями: `loadPlugins(pluginsDir)`, `buildRouteMap(plugins)`, `createPluginLoader(pluginsDir)`.

**Acceptance criteria:**
- [x] `loadPlugins` сканирует директорию, находит поддиректории с `index.js`
- [x] `loadPlugins` валидирует интерфейс: `name` (string, совпадает с dirname), `routes` (object, все значения — функции)
- [x] `loadPlugins` пропускает директории без `index.js` молча
- [x] `buildRouteMap` объединяет маршруты, ошибается на дубликатах
- [x] `createPluginLoader` возвращает `{ plugins, routes }`

**Verification:**
- [x] Модуль импортируется без ошибок
- [x] `npm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/bot-platform/core/plugin-loader.js` (new)

**Estimated scope:** S (1 file)

### Task 2: Refactor `src/bot-platform/plugins/identity/index.js`

**Status:** Closed

**Description:** Заменить `createIdentityPlugin()` scaffold на flat export `{ name, routes }`. Удалить `moduleName` и `capabilities`. Сохранить прямые экспорты `formatIdentityResponse` и `handleIdentityEvent` для тестов.

**Acceptance criteria:**
- [x] Экспорт: `{ name: 'identity', routes: { identity: handleIdentityEvent }, formatIdentityResponse, handleIdentityEvent }`
- [x] `name` совпадает с именем директории `identity`
- [x] Нет `createIdentityPlugin`, `moduleName`, `capabilities`

**Verification:**
- [x] Модуль импортируется без ошибок
- [x] `npm test` passes (после обновления импортов в тестах)

**Dependencies:** Task 1

**Files likely touched:**
- `src/bot-platform/plugins/identity/index.js`

**Estimated scope:** XS (1 file)

### Task 3: Update `src/bot-platform/core/index.js`

**Status:** Closed

**Description:** Импортировать и реэкспортировать `createPluginLoader` из `./plugin-loader`. Изменить `pluginLoader: 'pending'` на `pluginLoader: 'available'` в компонентах.

**Acceptance criteria:**
- [x] `createPluginLoader` доступен из `require('./core')`
- [x] `core.components.pluginLoader === 'available'`

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `src/bot-platform/core/index.js`

**Estimated scope:** XS (1 file)

### Task 4: Update `src/bot-platform/core/dry-run-pipeline.js`

**Status:** Closed

**Description:** Изменить `runMaxIdentityDryRun` для принятия `routeHandlers` как второго параметра. Удалить хардкоженный импорт `handleIdentityEvent`.

**Acceptance criteria:**
- [x] Сигнатура: `runMaxIdentityDryRun(maxPayload, routeHandlers = {})`
- [x] Router создаётся из переданных `routeHandlers`
- [x] Нет импорта `handleIdentityEvent` в файле

**Verification:**
- [x] `npm test` passes (после обновления вызовов в тестах/app.js)

**Dependencies:** Task 1

**Files likely touched:**
- `src/bot-platform/core/dry-run-pipeline.js`

**Estimated scope:** XS (1 file)

### Task 5: Update `src/bot-platform/core/live-pipeline.js`

**Status:** Closed

**Description:** Изменить `createIdentityUpdateProcessor` для принятия `routeHandlers` через `options`. Удалить хардкоженный импорт `handleIdentityEvent`.

**Acceptance criteria:**
- [x] `options.routeHandlers` передаётся в `createEventRouter`
- [x] Значение по умолчанию: `{}` (пустой route map)
- [x] Нет импорта `handleIdentityEvent` в файле

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `src/bot-platform/core/live-pipeline.js`

**Estimated scope:** XS (1 file)

### Task 6: Update `src/bot-platform/app.js`

**Status:** Closed

**Description:** Импортировать `createPluginLoader` из `./core/plugin-loader`. Вызывать его в `createBotPlatformApp`. Передавать `routes` в `runMaxIdentityDryRun`. Удалить импорт `createIdentityPlugin`.

**Acceptance criteria:**
- [x] `createBotPlatformApp` вызывает `createPluginLoader(path.join(__dirname, 'plugins'))`
- [x] `app.routes` содержит загруженные маршруты
- [x] CLI handler передаёт `app.routes` в `runMaxIdentityDryRun`
- [x] Нет импорта `createIdentityPlugin`

**Verification:**
- [x] `npm test` passes

**Dependencies:** Tasks 1, 2, 4

**Files likely touched:**
- `src/bot-platform/app.js`

**Estimated scope:** S (1 file)

### Task 7: Update `src/bot-platform/runtime/live-service.js`

**Status:** Closed

**Description:** Передавать `options.routeHandlers` в `createIdentityUpdateProcessor`.

**Acceptance criteria:**
- [x] `routeHandlers` передаётся из `options` в `createIdentityUpdateProcessor`
- [x] Значение по умолчанию: `{}`

**Verification:**
- [x] `npm test` passes

**Dependencies:** Tasks 1, 5

**Files likely touched:**
- `src/bot-platform/runtime/live-service.js`

**Estimated scope:** XS (1 file)

### Task 8: Create `tests/bot-platform/plugin-loader.test.js`

**Status:** Closed

**Description:** Написать тесты для plugin-loader: загрузка из директории, валидация интерфейса, сборка route map, обработка дубликатов.

**Acceptance criteria:**
- [x] Тест: `loadPlugins` возвращает пустой массив для пустой директории
- [x] Тест: `loadPlugins` загружает identity plugin
- [x] Тест: `loadPlugins` пропускает директории без `index.js`
- [x] Тест: `loadPlugins` ошибается при отсутствии `name`
- [x] Тест: `loadPlugins` ошибается при несовпадении `name` с dirname
- [x] Тест: `loadPlugins` ошибается при не-функции в routes
- [x] Тест: `buildRouteMap` объединяет маршруты
- [x] Тест: `buildRouteMap` ошибается на дубликатах
- [x] Тест: `createPluginLoader` возвращает `{ plugins, routes }`

**Verification:**
- [x] `npm test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `tests/bot-platform/plugin-loader.test.js` (new)

**Estimated scope:** S (1 file)

### Task 9: Update `tests/bot-platform/scaffold.test.js`

**Status:** Closed

**Description:** Обновить импорты и проверки: удалить `createIdentityPlugin`, добавить `createPluginLoader`, проверять `app.plugins` как массив и `app.routes` как объект.

**Acceptance criteria:**
- [x] `createIdentityPlugin` удалён из импортов
- [x] `createPluginLoader` импортируется и проверяется как функция
- [x] `app.plugins` — массив плагинов
- [x] `app.routes` — объект с ключом `identity`
- [x] `app.core.components.pluginLoader === 'available'`

**Verification:**
- [x] `npm test` passes

**Dependencies:** Tasks 1, 2, 3, 6

**Files likely touched:**
- `tests/bot-platform/scaffold.test.js`

**Estimated scope:** S (1 file)

### Task 10: Update `tests/bot-platform/dry-run-pipeline.test.js`

**Status:** Closed

**Description:** Обновить вызовы `runMaxIdentityDryRun`: передавать `{ identity: handleIdentityEvent }` как `routeHandlers`.

**Acceptance criteria:**
- [x] Импорт `handleIdentityEvent` из identity plugin
- [x] Все вызовы `runMaxIdentityDryRun(payload)` заменены на `runMaxIdentityDryRun(payload, { identity: handleIdentityEvent })`

**Verification:**
- [x] `npm test` passes

**Dependencies:** Tasks 2, 4

**Files likely touched:**
- `tests/bot-platform/dry-run-pipeline.test.js`

**Estimated scope:** XS (1 file)

### Task 11: Create ADR-0012

**Status:** Closed

**Description:** Зафиксировать решение о convention-based plugin loader в `docs/decisions/ADR-0012-use-convention-based-plugin-loader.md`.

**Acceptance criteria:**
- [x] ADR создан в `docs/decisions/`
- [x] Статус: Accepted
- [x] Описан контекст (текущий manual plugin pattern, pain point)
- [x] Описано решение (convention-based auto-discovery)
- [x] Описан интерфейс плагина `{ name, routes }`
- [x] Рассмотрены альтернативы (config-driven, self-registering, middleware)
- [x] `docs/decisions/README.md` обновлён

**Verification:**
- [x] ADR существует и не содержит секретов
- [x] `npm test` passes

**Dependencies:** None (can be done in parallel with code tasks)

**Files likely touched:**
- `docs/decisions/ADR-0012-use-convention-based-plugin-loader.md` (new)
- `docs/decisions/README.md`

**Estimated scope:** S (2 files)

## Checkpoint: After Tasks 1-3 (Foundation)

- [x] `plugin-loader.js` создан и работает
- [x] Identity plugin рефакторен на новый интерфейс
- [x] `core/index.js` экспортирует `createPluginLoader`
- [x] `npm test` passes

## Checkpoint: After Tasks 4-7 (Pipeline Integration)

- [x] Dry-run pipeline принимает `routeHandlers`
- [x] Live pipeline принимает `routeHandlers`
- [x] `app.js` использует plugin loader
- [x] `live-service.js` передаёт `routeHandlers`
- [x] `npm test` passes

## Checkpoint: After Tasks 8-11 (Tests & Docs)

- [x] Все тесты проходят
- [x] ADR-0012 создан
- [x] Нет секретов и реальных идентификаторов
- [x] Готово к ревью
