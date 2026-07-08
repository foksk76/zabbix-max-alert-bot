# Task 12.8 spec: Codex agent workflow

Документ подготовлен по skill `spec-driven-development`.

## Status

```text
Done / verified
```

## Objective

Описать и закрепить рабочий workflow для Codex agent на третьем этапе так, чтобы агент:

- брал задачу только из каноничных документов;
- не менял текущий `src/zabbix-media-type/max-webhook.js` без отдельного решения;
- запускал обязательные проверки перед завершением задачи;
- фиксировал результат в документации и task list.

Успех означает, что новый workflow можно использовать как повторяемый operational guide для следующих Task 12.x без расширения границ проекта.

## Tech Stack

```text
Markdown documentation
Existing repository docs and task files
npm test
```

## Commands

```bash
npm test
```

```bash
git diff -- src/zabbix-media-type/max-webhook.js
```

## Project Structure

Документация и статус задачи должны быть обновлены в:

```text
docs/third-stage-stand-and-agent.md
tasks/plan.md
docs/specs/task-12-8-agent-workflow.md
```

## Code Style

Для workflow-документа используем краткие императивные формулировки и явные запреты.

Пример:

```text
1. Прочитать AGENTS.md и каноничные документы.
2. Выбрать одну Task 12.x.
3. Внести минимальный diff.
4. Запустить npm test.
5. Проверить, что src/zabbix-media-type/max-webhook.js не изменен.
6. Обновить документацию и статус задачи.
```

## Testing Strategy

Проверка здесь документальная:

- `npm test` должен проходить после изменений документации;
- `git diff -- src/zabbix-media-type/max-webhook.js` должен быть пустым;
- workflow не должен требовать реального MAX API, секретов или внутренних адресов;
- результат должен быть зафиксирован в `docs/test-runs/` при выполнении соответствующего task verification.

## Boundaries

- Always: читать каноничные документы, выполнять `npm test`, проверять, что текущий webhook не изменен, фиксировать результат в docs.
- Ask first: менять границы проекта, добавлять зависимости, менять CI, вводить новый runtime или сетевой endpoint.
- Never: коммитить секреты, реальные tokens, real `chat_id` / `user_id`, внутренние IPs/domains, или переписывать `src/zabbix-media-type/max-webhook.js` без отдельного решения.

## Success Criteria

- Workflow описан в `docs/third-stage-stand-and-agent.md`.
- Workflow задает входные документы, разрешенные действия, запреты и обязательные проверки.
- Workflow прямо фиксирует, что текущий Zabbix Webhook не меняется.
- Workflow прямо фиксирует, что `npm test` — обязательная проверка перед завершением task.
- Workflow не добавляет новый runtime, сеть или секреты.
- `tasks/plan.md` отмечает Task 12.8 как выполненную после проверки.

## Open Questions

- Нужен ли отдельный ADR для дальнейшей автоматизации agent workflow.
- Требуется ли отдельный runbook для task execution, или текущего документа достаточно.

## Verification result

```text
npm test: pass
src/zabbix-media-type/max-webhook.js: unchanged
workflow documented: yes
task status updated: yes
```
