# Task 11.1: Поиск и сравнение open source кандидатов для модульной bot-platform

Документ фиксирует рабочую задачу второго этапа: найти и сравнить open source проекты, которые потенциально можно использовать как основу модульной bot-platform для МАХ.

Task 11.1 является частью исследования Task 11 и не означает начало реализации.

## Цель

Найти и сравнить open source кандидатов, которые могут подойти для одного из вариантов:

```text
1. адаптация готового bot framework;
2. адаптация workflow-platform;
3. подтверждение, что готовые варианты не подходят и нужен собственный минимальный сервис.
```

Основной проверяемый сценарий:

```text
входящее сообщение боту МАХ -> получение chat_id / user_id -> безопасная подсказка для настройки получателя в Zabbix
```

## Граница Task 11.1

Входит:

- поиск open source проектов в открытых источниках;
- первичная оценка лицензии, активности и архитектуры;
- проверка применимости к МАХ как transport;
- проверка применимости к Zabbix как источнику уведомлений;
- сравнение кандидатов по единым критериям;
- формирование предварительной рекомендации для MVP.

Не входит:

- написание кода;
- создание нового сервиса;
- запуск нового runtime;
- подключение к реальному МАХ API;
- подключение к реальному Zabbix;
- хранение реальных `chat_id` / `user_id`;
- изменение текущего Zabbix Webhook;
- создание промышленной архитектуры без ADR.

## Кандидаты для первичного поиска

Список ниже является стартовым. Он должен быть подтвержден или скорректирован после поиска в открытых источниках.

```text
Errbot
Hubot
Botpress Community / open source варианты
Node-RED
n8n self-hosted
Mattermost Bot / integration framework варианты
другие self-hosted bot/workflow frameworks
```

Если проект не является open source, плохо поддерживается или не подходит для локального контура, он исключается из дальнейшего сравнения с указанием причины.

## Поисковые запросы

Для открытого поиска использовать группы запросов:

```text
open source chatbot framework plugin backend adapter
open source chatops bot framework webhook backend
self hosted bot framework plugin architecture
custom transport adapter chatbot framework
self hosted workflow automation webhook bot
open source workflow automation custom node webhook
Zabbix webhook alert bot framework
chatops bot custom backend self hosted
```

Для каждого кандидата дополнительно искать:

```text
<project name> license
<project name> plugin architecture
<project name> custom adapter
<project name> webhook integration
<project name> self hosted
<project name> GitHub releases
<project name> security configuration secrets
```

## Обязательные поля оценки кандидата

Для каждого кандидата заполнить:

| Поле | Что указать |
|---|---|
| Project | название проекта |
| Type | bot framework / workflow-platform / integration framework |
| Source | ссылка на официальный сайт, репозиторий или документацию |
| License | лицензия |
| Activity | признаки активности: commits, releases, issues, дата последнего релиза |
| Self-hosted | можно ли развернуть локально |
| Plugin model | есть ли plugins, adapters, nodes, extensions или hooks |
| Webhook support | можно ли принимать входящие HTTP-события |
| Custom transport | можно ли добавить МАХ как transport / adapter / node |
| Zabbix source | можно ли принять Zabbix webhook или событие |
| Identity scenario | подходит ли для получения `chat_id` / `user_id` |
| Secret handling | можно ли хранить токены вне репозитория |
| Operational complexity | простота сопровождения |
| Main risks | ключевые риски |
| Preliminary verdict | keep / reject / investigate |

## Таблица сравнения

| Candidate | Type | License | Activity | Self-hosted | Plugin / adapter | Webhook | MAX transport | Zabbix source | Identity scenario | Risk | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Шкала оценки

Для краткой оценки использовать значения:

```text
yes       подходит или поддерживается явно
partial   возможно, но нужно уточнение или доработка
no        не подходит
unknown   не подтверждено источниками
```

## Рекомендация по итогам сравнения

После заполнения таблицы нужно выбрать один из выводов:

```text
1. Рекомендуется собственный минимальный сервис.
2. Рекомендуется адаптировать open source bot framework.
3. Рекомендуется workflow-прототип для проверки сценария.
4. Реализация MVP не рекомендуется: ценность или применимость не подтверждена.
```

## Acceptance criteria

- [ ] Найдено не менее 4 open source кандидатов или зафиксировано, почему меньше.
- [ ] По каждому кандидату заполнены обязательные поля оценки.
- [ ] Подготовлена сравнительная таблица.
- [ ] Указаны кандидаты, отклоненные на раннем этапе, и причины отклонения.
- [ ] Сделан предварительный вывод по подходу для MVP.
- [ ] Отдельно отмечено, нужен ли ADR перед реализацией выбранного подхода.
- [ ] Подтверждено, что текущий Zabbix Webhook не меняется.

## Verification

- [ ] Для каждого кандидата есть ссылки на открытые источники.
- [ ] Лицензия не указана по памяти: она подтверждена источником.
- [ ] Активность проекта проверена по репозиторию, релизам или официальной документации.
- [ ] Не добавлены реальные токены, `chat_id`, `user_id`, внутренние адреса или организационные данные.
- [ ] Не добавлены новые runtime-компоненты.
- [ ] Не изменен `src/zabbix-media-type/max-webhook.js`.
- [ ] Выполнен `npm test`, если менялись файлы, покрываемые policy tests.

## Ожидаемый результат

```text
Подготовлено сравнение open source кандидатов для модульной bot-platform. Выявлены подходящие и неподходящие варианты. Сформирована предварительная рекомендация для MVP MAX Identity Bot. Перед реализацией нового сервиса, runtime или входящих webhooks требуется ADR.
```
