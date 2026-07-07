# Task 12.1 spec: bot-platform scaffold

Документ подготовлен по skill `spec-driven-development`.

## Status

```text
Done
```

## Goal

Создать минимальный каркас `src/bot-platform`, который можно импортировать в тестах и расширять следующими задачами третьего этапа.

## Scope

Входит:

- создать `src/bot-platform/app.js`;
- создать `src/bot-platform/core/index.js`;
- создать `src/bot-platform/transports/max/index.js`;
- создать `src/bot-platform/plugins/identity/index.js`;
- добавить placeholder exports без бизнес-логики;
- добавить smoke tests на импорт модулей.

Не входит:

- real MAX API client;
- network listener;
- Hubot adapter;
- fixtures входящих событий;
- event normalizer;
- identity handler;
- outbound transport;
- интеграционный прогон.

## Module contracts

### `src/bot-platform/app.js`

Минимальный app entrypoint.

Ожидаемый export:

```text
createBotPlatformApp()
```

Функция возвращает объект с информацией о статусе scaffold и подключенных placeholder-модулях.

### `src/bot-platform/core/index.js`

Минимальный core module.

Ожидаемые exports:

```text
moduleName
createCore()
```

### `src/bot-platform/transports/max/index.js`

Минимальный MAX transport placeholder.

Ожидаемые exports:

```text
moduleName
createMaxTransport()
```

На Task 12.1 transport не выполняет сетевые запросы.

### `src/bot-platform/plugins/identity/index.js`

Минимальный identity plugin placeholder.

Ожидаемые exports:

```text
moduleName
createIdentityPlugin()
```

На Task 12.1 plugin не обрабатывает реальные события.

## Acceptance criteria

- [x] Структура каталогов создана.
- [x] Модули импортируются без ошибок.
- [x] Placeholder exports доступны для будущих задач.
- [x] Реальный МАХ API не подключен.
- [x] Текущий `src/zabbix-media-type/max-webhook.js` не изменен.
- [x] `npm test` подтвержден локально или в GitHub Actions.

## Verification

- [x] Добавлены smoke tests на импорт модулей.
- [x] Тесты не требуют секретов и реальных идентификаторов.
- [x] Тесты не выполняют сетевых запросов.
- [x] GitHub Actions green после commit.

## CI confirmation

```text
Commit: 89f63c11ddda36da48ae773f682470710f4638d7
Node.js: 22.23.1
npm: 10.9.8
Tests: 22
Pass: 22
Fail: 0
```

## Next tasks

```text
Task 12.2: Done — internal event contract
Task 12.3: добавить обезличенные fixtures входящих событий
```
