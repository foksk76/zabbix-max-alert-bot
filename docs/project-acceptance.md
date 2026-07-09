# Критерии завершения проекта

Документ является единственным источником project-level критериев завершения проекта.

Критерии конкретных задач остаются в `tasks/todo.md`. Здесь фиксируются только условия, при которых проект в целом считается завершенным.

## Граница приемки

Проект считается завершенным при выполнении двух пользовательских сценариев:

- Zabbix отправляет уведомления в МАХ через Zabbix Media type `Webhook`.
- бот МАХ возвращает `user_id` / `chat_id` для настройки получателя в Zabbix.

Критерии ниже не требуют очереди сообщений, базы данных, автоматического реагирования или хранения чувствительных данных в репозитории.

## Критерии завершения проекта

- [ ] В Zabbix создан и включен Media type `MAX` с типом `Webhook`.
- [ ] В Media type используется скрипт из `src/zabbix-media-type/max-webhook.js`.
- [ ] Параметры Media type заполнены по `docs/zabbix-media-type.md`.
- [ ] Тестовое сообщение из Zabbix успешно доставляется в МАХ.
- [ ] Problem-событие успешно доставляется в МАХ.
- [ ] Recovery-событие успешно доставляется в МАХ.
- [ ] Бот МАХ принимает входящее сообщение и возвращает `user_id` или `chat_id` для настройки получателя в Zabbix.
- [ ] Существующий Telegram-канал не нарушен и продолжает работать.
- [ ] Документация позволяет повторить настройку без неформальных пояснений.
- [ ] В документации и примерах нет реальных авторизационных значений, боевых идентификаторов, внутренних адресов и организационных названий.
- [ ] Завершены задачи из `tasks/todo.md`, относящиеся к проекту.
- [ ] Выполнен `npm test` без ошибок.
- [ ] Проверка GitHub Actions завершилась успешно.
- [ ] Проект не вышел за согласованные границы.

## Доказательства

Критерии выше подтверждаются следующими артефактами:

| Критерий | Доказательства |
|---|---|
| Media type `MAX` создан и включен | [`docs/test-runs/max-media-type-manual-run.md`](test-runs/max-media-type-manual-run.md), [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Используется `src/zabbix-media-type/max-webhook.js` | [`src/zabbix-media-type/max-webhook.js`](../src/zabbix-media-type/max-webhook.js), [`docs/test-runs/max-media-type-manual-run.md`](test-runs/max-media-type-manual-run.md), [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Параметры заполнены по `docs/zabbix-media-type.md` | [`docs/zabbix-media-type.md`](zabbix-media-type.md), [`docs/test-runs/max-media-type-manual-run.md`](test-runs/max-media-type-manual-run.md), [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Test message доставляется в МАХ | [`docs/test-runs/max-media-type-manual-run.md`](test-runs/max-media-type-manual-run.md), [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Problem доставляется в МАХ | [`docs/test-runs/max-problem-recovery-run.md`](test-runs/max-problem-recovery-run.md), [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Recovery доставляется в МАХ | [`docs/test-runs/max-problem-recovery-run.md`](test-runs/max-problem-recovery-run.md), [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Бот МАХ возвращает `user_id` / `chat_id` | [`docs/test-runs/task-12-5-identity-run.md`](test-runs/task-12-5-identity-run.md), [`docs/test-runs/task-12-12-dry-run-cli-run.md`](test-runs/task-12-12-dry-run-cli-run.md), [`docs/test-runs/task-14-safe-test-bot-run.md`](test-runs/task-14-safe-test-bot-run.md) |
| Telegram-канал продолжает работать | [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Документация позволяет повторить настройку | [`docs/zabbix-media-type.md`](zabbix-media-type.md), [`examples/media-params.md`](../examples/media-params.md), [`examples/media-type-recreate-checklist.md`](../examples/media-type-recreate-checklist.md) |
| Нет реальных авторизационных значений и боевых идентификаторов | [`docs/test-runs/max-media-type-manual-run.md`](test-runs/max-media-type-manual-run.md), [`docs/test-runs/max-problem-recovery-run.md`](test-runs/max-problem-recovery-run.md), [`docs/test-runs/task-12-9-config-logger-run.md`](test-runs/task-12-9-config-logger-run.md), [`docs/test-runs/task-12-10-outbound-client-run.md`](test-runs/task-12-10-outbound-client-run.md), [`docs/test-runs/task-12-11-inbound-webhook-run.md`](test-runs/task-12-11-inbound-webhook-run.md), [`docs/test-runs/task-14-safe-test-bot-run.md`](test-runs/task-14-safe-test-bot-run.md) |
| Завершены задачи из `tasks/todo.md`, относящиеся к проекту | [`tasks/todo.md`](../tasks/todo.md) |
| `npm test` проходит без ошибок | [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md), текущий `npm test` |
| GitHub Actions завершился успешно | [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md) |
| Проект не вышел за согласованные границы | [`docs/test-runs/final-acceptance-run.md`](test-runs/final-acceptance-run.md), [`docs/project-context.md`](project-context.md) |

## Не входит в приемку проекта

- отдельный bot-service;
- очередь сообщений;
- база данных;
- журнал доставки;
- повторная отправка;
- SIEM-интеграция;
- AI-обработка событий;
- автоматическое реагирование;
- управление событиями Zabbix из МАХ.

## Финальный приемочный прогон

Финальный прогон выполняется после закрытия задач из `tasks/todo.md`.

Последовательность:

1. Проверить структуру репозитория командой `npm test`.
2. Проверить настройки Media type `MAX` по `docs/zabbix-media-type.md`.
3. Отправить тестовое сообщение из Zabbix.
4. Проверить доставку Problem-события.
5. Проверить доставку Recovery-события.
6. Проверить, что существующий Telegram-канал продолжает работать.
7. Проверить, что документация и примеры не содержат чувствительных значений.
8. Зафиксировать результат приемки в `docs/zabbix-media-type.md` или отдельной обезличенной заметке, если она будет создана в рамках задачи.

## Правило изменения критериев

Критерии завершения проекта меняются только через отдельное решение в `docs/decisions/`.

Если появляется необходимость добавить новый компонент или изменить границы проекта, сначала создается ADR, затем обновляется этот документ.
