# Test runs

Раздел хранит инструкции и обезличенные результаты ручных прогонов.

Автоматический механизм тестирования здесь не определяется. Если потребуется локальный test harness, Zabbix container или другой runtime, сначала создается ADR в `docs/decisions/`.

## Текущие прогоны

- [`max-media-type-manual-run.md`](max-media-type-manual-run.md) — ручная проверка Zabbix Media type `MAX` на тестового получателя.
- [`max-problem-recovery-run.md`](max-problem-recovery-run.md) — ручная проверка доставки Problem и Recovery уведомлений через Zabbix Action.
- [`final-acceptance-run.md`](final-acceptance-run.md) — финальный приемочный прогон первого этапа по `docs/project-acceptance.md`.
- [`task-12-baseline.md`](task-12-baseline.md) — baseline перед кодом Task 12.
- [`task-12-3-fixtures-run.md`](task-12-3-fixtures-run.md) — CI-прогон Task 12.3 после добавления synthetic MAX fixtures.
- [`task-12-4-normalizer-run.md`](task-12-4-normalizer-run.md) — CI-прогон Task 12.4 после реализации MAX event normalizer без сети.
- [`task-12-5-identity-run.md`](task-12-5-identity-run.md) — CI-прогон Task 12.5 после реализации identity formatter и handler.
- [`task-12-6-router-dry-run.md`](task-12-6-router-dry-run.md) — CI-прогон Task 12.6 после реализации event router и dry-run pipeline.
