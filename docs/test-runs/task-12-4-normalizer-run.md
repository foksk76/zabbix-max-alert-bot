# Task 12.4 normalizer CI run

Документ фиксирует проверку Task 12.4 после реализации MAX event normalizer без сети.

## Статус

```text
Done
```

## Commit

```text
abf0d734b421ba6687a8143e84adb6e0031928fb
```

## Что проверено

- Добавлен MAX event normalizer.
- User fixture преобразуется во внутреннее событие с `recipient.kind = user`.
- Chat fixture преобразуется во внутреннее событие с `recipient.kind = chat`.
- Missing payload обрабатывается контролируемой ошибкой.
- Unsupported chat type обрабатывается контролируемой ошибкой.
- Missing recipient value обрабатывается контролируемой ошибкой.
- Сетевые вызовы не добавлялись.
- Текущий Zabbix Webhook не изменялся.

## GitHub Actions

```text
Node.js: 22.23.1
npm: 10.9.8
Tests: 30
Pass: 30
Fail: 0
Duration: 472.6935 ms
```

## Результат

```text
Task 12.4 закрыта. Следующий шаг: Task 12.5 — реализовать identity formatter и handler.
```
