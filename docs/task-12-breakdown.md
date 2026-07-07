# Task 12 breakdown: каркас MAX Identity Bot

Документ подготовлен по skill `planning-and-task-breakdown`.

Цель — разложить Task 12 на точные и небольшие задачи для реализации MVP `MAX Identity Bot` в третьем этапе.

## Контекст

Task 12 относится к третьему этапу.

Базовые документы:

```text
docs/third-stage-acceptance.md
docs/third-stage-implementation-plan.md
docs/third-stage-stand-and-agent.md
docs/decisions/ADR-0005-use-hubot-for-max-identity-bot-mvp.md
```

Базовые ограничения:

- текущий `src/zabbix-media-type/max-webhook.js` не менять;
- текущий Zabbix Media type `MAX` не менять;
- не добавлять Zabbix API;
- не добавлять базу данных;
- не добавлять очередь;
- не добавлять журнал доставки;
- не добавлять retry;
- не коммитить реальные секреты и идентификаторы;
- сначала fixtures и unit-тесты, потом реальный интеграционный прогон.

## Целевой результат Task 12

После Task 12 в репозитории должен появиться минимальный каркас `src/bot-platform`, пригодный для последующей реализации:

```text
src/bot-platform/
  core/
  transports/max/
  plugins/identity/
  app.js
```

Task 12 не обязана подключаться к реальному API МАХ. Она должна подготовить каркас, контракты модулей, безопасную конфигурацию и первые тесты.

## Task 12.0: Зафиксировать baseline перед кодом

Goal:

Проверить, что перед началом реализации известен текущий baseline репозитория.

Scope:

- прочитать `docs/third-stage-acceptance.md`;
- прочитать `docs/third-stage-implementation-plan.md`;
- прочитать ADR-0005;
- зафиксировать текущий commit перед кодом;
- выполнить `npm test`.

Out of scope:

- изменение кода;
- изменение webhook первого этапа.

Dependencies:

- третий этап оформлен;
- ADR-0005 принят.

Files likely touched:

```text
нет
```

Acceptance criteria:

- [ ] baseline commit известен;
- [ ] `npm test` выполнен;
- [ ] статус baseline зафиксирован в рабочей заметке или в сообщении задачи.

Verification:

- [ ] есть вывод `npm test`;
- [ ] нет изменений в рабочем дереве после проверки.

Estimated size: S

Risks:

- начать код без понимания актуального состояния репозитория.

## Task 12.1: Создать структуру каталогов bot-platform

Goal:

Создать пустой каркас каталогов и минимальные module entrypoints.

Scope:

- создать `src/bot-platform/`;
- создать `core/`, `transports/max/`, `plugins/identity/`;
- создать минимальный `app.js`;
- добавить placeholder exports без бизнес-логики;
- не подключать реальный МАХ API.

Out of scope:

- network listener;
- real API client;
- Hubot adapter;
- fixtures;
- интеграционные прогоны.

Dependencies:

- Task 12.0.

Files likely touched:

```text
src/bot-platform/app.js
src/bot-platform/core/index.js
src/bot-platform/transports/max/index.js
src/bot-platform/plugins/identity/index.js
```

Acceptance criteria:

- [ ] структура каталогов создана;
- [ ] модули импортируются без ошибок;
- [ ] `npm test` проходит;
- [ ] текущий Zabbix Webhook не изменен.

Verification:

- [ ] `node --test` или `npm test`;
- [ ] `git diff -- src/zabbix-media-type/max-webhook.js` пустой.

Estimated size: S

Risks:

- преждевременно начать реализацию transport до фиксации контрактов.

## Task 12.2: Описать внутренний event contract

Goal:

Зафиксировать минимальный внутренний формат события, с которым будут работать плагины.

Scope:

- создать документированный event shape;
- определить поля: source, recipient kind, recipient value placeholder, message text, raw event reference;
- описать допустимые значения recipient kind;
- добавить JSDoc или Markdown-описание рядом с кодом.

Out of scope:

- полная модель всех событий МАХ;
- хранение событий;
- схемы для production audit.

Dependencies:

- Task 12.1.

Files likely touched:

```text
src/bot-platform/core/event-contract.js
src/bot-platform/core/README.md
```

Acceptance criteria:

- [ ] event contract описан;
- [ ] contract не содержит реальных идентификаторов;
- [ ] contract достаточен для identity plugin;
- [ ] `npm test` проходит.

Verification:

- [ ] review contract fields;
- [ ] `npm test`.

Estimated size: S

Risks:

- слишком широкий contract приведет к преждевременному усложнению платформы.

## Task 12.3: Добавить обезличенные fixtures входящих событий

Goal:

Подготовить тестовые входящие события для личного сообщения и группового чата.

Scope:

- создать fixture для личного сообщения;
- создать fixture для группового чата;
- использовать только synthetic placeholder values;
- добавить README к fixtures.

Out of scope:

- реальные payload из МАХ;
- реальные идентификаторы;
- реальные callback URL.

Dependencies:

- Task 12.2.

Files likely touched:

```text
examples/bot-platform/max-inbound-user.fixture.json
examples/bot-platform/max-inbound-chat.fixture.json
examples/bot-platform/README.md
```

Acceptance criteria:

- [ ] есть user fixture;
- [ ] есть chat fixture;
- [ ] fixtures не содержат реальных данных;
- [ ] fixtures описаны в README.

Verification:

- [ ] grep по запрещенным значениям и секретам;
- [ ] review fixtures.

Estimated size: S

Risks:

- случайно скопировать реальные payload и идентификаторы.

## Task 12.4: Реализовать MAX event normalizer без сети

Goal:

Преобразовать обезличенные входящие события МАХ во внутренний event contract.

Scope:

- реализовать `event-normalizer`;
- обработать user fixture;
- обработать chat fixture;
- безопасно обрабатывать неизвестный или неполный payload;
- не выполнять сетевые запросы.

Out of scope:

- реальный inbound webhook listener;
- outbound API client;
- Hubot adapter.

Dependencies:

- Task 12.2;
- Task 12.3.

Files likely touched:

```text
src/bot-platform/transports/max/event-normalizer.js
tests/bot-platform/max-event-normalizer.test.js
```

Acceptance criteria:

- [ ] normalizer возвращает корректный internal event для user fixture;
- [ ] normalizer возвращает корректный internal event для chat fixture;
- [ ] unknown payload не приводит к утечке данных в ошибку;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест user fixture;
- [ ] unit-тест chat fixture;
- [ ] unit-тест invalid fixture;
- [ ] `npm test`.

Estimated size: M

Risks:

- неверно угадать реальный формат МАХ; для MVP fixtures должны быть явно помечены как synthetic до интеграционного прогона.

## Task 12.5: Реализовать identity formatter

Goal:

Сформировать безопасный текст ответа для настройки получателя в Zabbix.

Scope:

- реализовать formatter для user recipient;
- реализовать formatter для chat recipient;
- не включать лишние данные из входящего события;
- не логировать идентификаторы в тестах.

Out of scope:

- отправка ответа в МАХ;
- локализация нескольких языков;
- сложные шаблоны сообщений.

Dependencies:

- Task 12.2.

Files likely touched:

```text
src/bot-platform/plugins/identity/formatter.js
tests/bot-platform/identity-formatter.test.js
```

Acceptance criteria:

- [ ] formatter формирует ответ для user event;
- [ ] formatter формирует ответ для chat event;
- [ ] formatter не добавляет raw payload в ответ;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест user response;
- [ ] unit-тест chat response;
- [ ] unit-тест unsupported recipient kind;
- [ ] `npm test`.

Estimated size: S

Risks:

- включить в ответ лишние поля, не нужные для настройки Zabbix.

## Task 12.6: Реализовать identity handler

Goal:

Соединить internal event и formatter в один плагин.

Scope:

- принять normalized event;
- определить, поддерживается ли recipient kind;
- вернуть response object для outbound transport;
- обработать ошибочные события безопасно.

Out of scope:

- реальная отправка сообщения;
- persistent state;
- авторизация пользователей.

Dependencies:

- Task 12.4;
- Task 12.5.

Files likely touched:

```text
src/bot-platform/plugins/identity/handler.js
src/bot-platform/plugins/identity/index.js
tests/bot-platform/identity-handler.test.js
```

Acceptance criteria:

- [ ] handler принимает normalized user event;
- [ ] handler принимает normalized chat event;
- [ ] handler возвращает response object;
- [ ] invalid event возвращает контролируемую ошибку;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест user event;
- [ ] unit-тест chat event;
- [ ] unit-тест invalid event;
- [ ] `npm test`.

Estimated size: M

Risks:

- смешать transport logic и plugin logic.

## Task 12.7: Реализовать event router

Goal:

Добавить минимальную маршрутизацию normalized event к identity plugin.

Scope:

- реализовать `event-router`;
- зарегистрировать identity plugin;
- вернуть response object;
- оставить возможность добавить другие plugins позже.

Out of scope:

- dynamic plugin marketplace;
- внешняя конфигурация маршрутов;
- runtime hot reload.

Dependencies:

- Task 12.6.

Files likely touched:

```text
src/bot-platform/core/event-router.js
src/bot-platform/core/plugin-loader.js
tests/bot-platform/event-router.test.js
```

Acceptance criteria:

- [ ] router направляет событие в identity plugin;
- [ ] неизвестный plugin route обрабатывается безопасно;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест route to identity;
- [ ] unit-тест no plugin;
- [ ] `npm test`.

Estimated size: M

Risks:

- преждевременно реализовать сложный plugin framework вместо минимального router.

## Task 12.8: Реализовать config и безопасный logger

Goal:

Подготовить минимальную конфигурацию и обезличенное логирование.

Scope:

- читать настройки из environment;
- добавить `env.example`;
- реализовать logger с masking для секретов;
- описать правило: реальные значения не коммитить.

Out of scope:

- Vault integration;
- secret manager;
- централизованный logging.

Dependencies:

- Task 12.1.

Files likely touched:

```text
src/bot-platform/core/config.js
src/bot-platform/core/logger.js
examples/bot-platform/env.example
tests/bot-platform/logger.test.js
```

Acceptance criteria:

- [ ] config читает нужные переменные;
- [ ] env.example не содержит реальных секретов;
- [ ] logger маскирует секретные значения;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест config defaults;
- [ ] unit-тест masking;
- [ ] `npm test`.

Estimated size: M

Risks:

- случайно вывести токен или идентификатор в лог.

## Task 12.9: Реализовать outbound client contract без реального API

Goal:

Подготовить контракт отправки ответа без обращения к реальному МАХ API.

Scope:

- создать outbound client interface;
- добавить dry-run implementation;
- добавить unit-тесты на payload construction;
- не выполнять сетевой запрос.

Out of scope:

- реальная отправка в МАХ;
- retry;
- delivery journal.

Dependencies:

- Task 12.5;
- Task 12.8.

Files likely touched:

```text
src/bot-platform/transports/max/outbound-client.js
tests/bot-platform/max-outbound-client.test.js
```

Acceptance criteria:

- [ ] outbound client принимает response object;
- [ ] dry-run не делает сеть;
- [ ] payload не содержит лишние raw поля;
- [ ] token не логируется;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест payload construction;
- [ ] unit-тест dry-run;
- [ ] unit-тест no token in logs;
- [ ] `npm test`.

Estimated size: M

Risks:

- случайно добавить реальный API вызов раньше интеграционного этапа.

## Task 12.10: Реализовать inbound webhook handler без публикации endpoint

Goal:

Добавить локальный handler, который можно вызвать тестом или локальным dev server.

Scope:

- принять HTTP-like request object;
- вызвать normalizer;
- вызвать event router;
- вернуть response object;
- не публиковать endpoint наружу.

Out of scope:

- production HTTP server;
- TLS;
- reverse proxy;
- real callback registration.

Dependencies:

- Task 12.4;
- Task 12.7;
- Task 12.9.

Files likely touched:

```text
src/bot-platform/transports/max/inbound-webhook.js
tests/bot-platform/max-inbound-webhook.test.js
```

Acceptance criteria:

- [ ] handler принимает user fixture;
- [ ] handler принимает chat fixture;
- [ ] handler возвращает response object;
- [ ] invalid request обрабатывается безопасно;
- [ ] `npm test` проходит.

Verification:

- [ ] unit-тест user request;
- [ ] unit-тест chat request;
- [ ] unit-тест invalid request;
- [ ] `npm test`.

Estimated size: M

Risks:

- смешать локальный handler и реальный exposed endpoint.

## Task 12.11: Собрать app entrypoint для локального dry-run

Goal:

Добавить CLI/dev entrypoint для локального прогона fixtures.

Scope:

- `app.js` читает путь к fixture;
- выполняет pipeline normalizer -> router -> dry-run outbound;
- печатает обезличенный результат;
- не требует реального токена.

Out of scope:

- production daemon;
- systemd unit;
- network listener.

Dependencies:

- Task 12.10.

Files likely touched:

```text
src/bot-platform/app.js
package.json
tests/bot-platform/app-dry-run.test.js
```

Acceptance criteria:

- [ ] dry-run запускается на user fixture;
- [ ] dry-run запускается на chat fixture;
- [ ] результат не содержит секретов;
- [ ] `npm test` проходит.

Verification:

- [ ] локальный dry-run;
- [ ] unit-тест CLI behavior, если удобно;
- [ ] `npm test`.

Estimated size: M

Risks:

- добавить слишком сложный CLI вместо минимального dry-run.

## Task 12.12: Обновить документацию запуска dry-run

Goal:

Описать, как локально проверить MVP без реального API.

Scope:

- добавить команды запуска dry-run;
- описать fixtures;
- описать expected behavior;
- описать запрет на реальные секреты.

Out of scope:

- WSL/LXC runbook;
- real bot integration.

Dependencies:

- Task 12.11.

Files likely touched:

```text
docs/third-stage-implementation-plan.md
examples/bot-platform/README.md
README.md или docs/README.md, если нужна ссылка
```

Acceptance criteria:

- [ ] есть команды запуска dry-run;
- [ ] есть описание user/chat fixtures;
- [ ] есть предупреждение о секретах;
- [ ] `npm test` проходит после документационных изменений.

Verification:

- [ ] выполнить команды из документа;
- [ ] `npm test`.

Estimated size: S

Risks:

- документация устареет относительно фактических команд.

## Task 12.13: Security review перед реальным API

Goal:

Проверить, что каркас готов к следующему шагу и не содержит утечек.

Scope:

- проверить отсутствие реальных секретов;
- проверить отсутствие реальных идентификаторов;
- проверить отсутствие изменений в Zabbix Webhook;
- проверить границы MVP;
- подготовить short review note.

Out of scope:

- pentest;
- production hardening;
- secret manager integration.

Dependencies:

- Task 12.12.

Files likely touched:

```text
docs/test-runs/task-12-dry-run.md
```

Acceptance criteria:

- [ ] review note создан;
- [ ] `npm test` подтвержден;
- [ ] Zabbix Webhook не изменен;
- [ ] sensitive values не найдены.

Verification:

- [ ] grep/review sensitive placeholders;
- [ ] `npm test`;
- [ ] git diff по webhook.

Estimated size: S

Risks:

- перейти к реальному API без проверки локального каркаса.

## Рекомендуемый порядок выполнения

```text
12.0 -> 12.1 -> 12.2 -> 12.3 -> 12.4 -> 12.5 -> 12.6 -> 12.7 -> 12.8 -> 12.9 -> 12.10 -> 12.11 -> 12.12 -> 12.13
```

Можно выполнять параллельно после Task 12.2:

```text
12.3 fixtures
12.8 config/logger
```

Но код normalizer, identity handler и router лучше выполнять последовательно.

## Definition of Done для Task 12

- [ ] Каркас `src/bot-platform` создан.
- [ ] Есть internal event contract.
- [ ] Есть обезличенные fixtures.
- [ ] Есть normalizer.
- [ ] Есть identity formatter и handler.
- [ ] Есть event router.
- [ ] Есть config/logger.
- [ ] Есть outbound client dry-run contract.
- [ ] Есть inbound handler для локального вызова.
- [ ] Есть app dry-run.
- [ ] Есть тесты.
- [ ] Есть документация запуска.
- [ ] Есть security review note.
- [ ] `npm test` проходит.
- [ ] Текущий Zabbix Webhook не изменен.
