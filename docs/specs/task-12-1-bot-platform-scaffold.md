# Task 12.1 spec: bot-platform scaffold

Документ подготовлен по skill `spec-driven-development`.

## Status

```text
Implemented / CI pending
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
- [ ] `npm test` подтвержден локально или в GitHub Actions.

## Verification

- [x] Добавлены smoke tests на импорт модулей.
- [x] Тесты не требуют секретов и реальных идентификаторов.
- [x] Тесты не выполняют сетевых запросов.
- [ ] GitHub Actions green после commit.

## Next tasks

Следующий шаг после подтверждения CI:

```text
Task 12.2: описать internal event contract
Task 12.3: добавить обезличенные fixtures
```
