# Implementation Plan: Zabbix MAX Alert Bot

## Overview

План описывает развитие проекта в формате `planning-and-task-breakdown`. Задачи выполняются маленькими проверяемыми шагами, чтобы человек и AI-агент одинаково понимали порядок работ, проверки и границы текущего этапа.

Project-level критерии завершения проекта не дублируются в этом файле. Единый источник приемки проекта:

```text
docs/live-identity-bot.md
```

## Architecture Decisions

- Основной рабочий артефакт: `src/zabbix-media-type/max-webhook.js`.
- Telegram-канал не заменяется и не ломается. МАХ добавляется как дополнительный канал доставки.
- Архитектурные и процессные решения фиксируются только в `docs/decisions/`.
- Документация ведется по `docs/documentation-policy.md`.
- Внешний `agent-skills` используется ссылкой и локальной установкой, без submodule.
- Задачи ведутся в `tasks/plan.md` и `tasks/todo.md`; `.agents/` остается рабочим контекстом агента, а не местом хранения задач.
- Код меняется только на основании документации проекта, внешней документации или ADR.
- Проверки репозитория выполняются через `npm test` и GitHub Actions согласно ADR-0004.

## Historical Acceptance

Историческая приемка Zabbix -> МАХ доставки завершена. Details see `docs/test-runs/final-acceptance-run.md`.

## Current Work: Live MAX Identity Bot

Текущая фаза выполняет live-сценарий MAX Identity Bot по ADR-0010.

Детальная декомпозиция:

```text
docs/task-18-breakdown.md
```

### Sprint 0: API Source And Contract

- [x] Task 18.1: Confirm MAX Bot API live transport contract.
- [x] Task 18.2: Write live transport spec and test plan.

Checkpoint:

- [x] `docs/specs/task-18-1-max-api-source.md` marked `Ready for Task 18.2`.
- [x] Official MAX Bot API source is documented.
- [x] Selected live transport mode is documented: `long_polling`.
- [x] No code performs live network calls yet.

### Sprint 1: Live Boundaries

- [x] Task 18.3: Add live runtime config and secret validation.
- [x] Task 18.4: Implement live outbound MAX client behind an injectable HTTP boundary.

Checkpoint:

- [x] `npm test` passes.
- [x] Tests prove secrets are not logged.
- [x] Outbound client tests use fake HTTP only.

### Sprint 2: Live Inbound

- [x] Task 18.5: Implement live inbound MAX updates client for `long_polling`.
- [x] Task 18.6: Connect live inbound updates to the identity pipeline.

Checkpoint:

- [x] `npm test` passes.
- [x] Existing synthetic dry-run still works.
- [x] Live runtime can be exercised with fake MAX API responses.

### Sprint 3: Runtime And Operations

- [x] Task 18.7: Add live service entrypoint and operational runbook.
- [x] Task 18.8: Add security review and failure-mode tests for live runtime.

Checkpoint:

- [x] `npm test` passes.
- [x] Runbook explains start, stop, logs and rollback.
- [x] `.env` and service docs do not contain real secrets.

### Sprint 4: Live Acceptance

- [ ] Task 18.9: Run live personal-dialog `user_id` verification.
- [ ] Task 18.10: Run live chat `chat_id` verification and update acceptance evidence.

Checkpoint:

- [ ] Bot replies visibly in personal dialog.
- [ ] Bot replies visibly in chat scenario.
- [ ] Sanitized live test-run is committed.
- [ ] `docs/live-identity-bot.md` evidence map references the live run.
- [ ] `npm test` passes.

## Checkpoint: Before Task 18.9

- [x] ADR-0010 принят.
- [x] Task 18 decomposed into sprints in `docs/task-18-breakdown.md`.
- [x] Официальный MAX Bot API для inbound events подтвержден в Task 18.1.
- [x] Официальный MAX Bot API для outbound response подтвержден в Task 18.1.
- [x] Выбран live transport mode в Task 18.2: `long_polling`.
- [ ] Определен stand, в котором допустимо хранить runtime-секреты вне репозитория.

## Checkpoint: After Task 18.10

- [ ] Бот получил реальное входящее сообщение МАХ.
- [ ] Бот отправил реальный ответ через MAX Bot API.
- [ ] Ответ в личном диалоге содержит `RecipientType: user_id`.
- [ ] Ответ в chat-сценарии содержит `RecipientType: chat_id`.
- [ ] Обезличенный live test-run добавлен в `docs/test-runs/`.
- [ ] `npm test` подтвержден.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Формат MAX API понят неправильно | High | Не писать код по предположениям; сначала уточнить документацию или создать ADR |
| В документацию попадут чувствительные значения | High | Использовать только обезличенные примеры и проверять `npm test` |
| AI-агент расширит проект за пределы этапа | High | Перед задачей проверять `docs/project-context.md`, `docs/decisions/README.md` и `AGENTS.md` |
| Live runtime exposes secrets | High | Runtime-секреты только в `.env`, никогда не в git |

## Definition of Done для плана

- [x] Каждая задача имеет acceptance criteria.
- [x] Каждая задача имеет verification.
- [x] Указаны dependencies.
- [x] Указаны files likely touched.
- [x] Указан estimated scope.
- [x] Указаны method и skill.
- [x] После фаз есть checkpoints.
