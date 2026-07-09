# Task 14 breakdown: safe test bot in outbound-only LXC

Документ подготовлен после ADR-0008.

Цель — довести MVP bot-platform до безопасного тестового бота, который можно запускать в текущем outbound-only LXC, а webhook-ингресс оставить для отдельного production-контура.

```text
long_polling for dev/test in current LXC
webhook for production ingress only
```

## Контекст

Текущий operator LXC в Proxmox:

- имеет серый IP и NAT only outbound;
- не принимает входящие подключения;
- не имеет DNS-имени;
- не публикует порт наружу;
- подходит для долгоживущего процесса под `systemd`.

Это означает, что safe test bot можно реализовать и тестировать здесь только в `long_polling` режиме. Webhook path остаётся отдельной задачей для ingress-capable среды.

## Что означает “network, DNS и ports are defined”

Для webhook endpoint это означает:

- **Network** — известно, как внешний сервис добирается до контейнера и как контейнер добирается до внешних сервисов.
- **DNS** — есть hostname, который резолвится в адрес webhook endpoint.
- **Ports** — известен локальный listener port и способ его публикации наружу.

Если хотя бы один из этих пунктов не определён, webhook integration остаётся deferred.

## Task 14.1: Собрать safe test bot в long polling режиме

Goal:

Добавить повторяемый safe test bot, который работает в текущем LXC без inbound traffic.

Method:

```text
Incremental implementation
```

Scope:

- использовать `MAX_TRANSPORT_MODE=long_polling` как default;
- читать локальный `.env`;
- запускать процесс под `systemd`;
- обрабатывать synthetic updates безопасно;
- не открывать inbound endpoint.
- reuse the existing `MAX_TRANSPORT_MODE` contract from Task 13; no second transport selector is introduced.
- держать long-polling loop в существующем runtime entrypoint bot-platform, а не выносить его в отдельный adapter/process boundary.

Минимальный runtime flow для Task 14.1:

1. прочитать `MAX_TRANSPORT_MODE` из environment;
2. запустить существующий bot-platform entrypoint в `long_polling` режиме;
3. получить MAX updates через outbound polling only;
4. нормализовать payload через `normalizeMaxEvent()`;
5. прогнать internal event через `event-router`;
6. обработать событие identity plugin;
7. собрать synthetic outbound payload;
8. остаться в том же runtime process без отдельного polling adapter.

Skill:

```text
agent-skills:incremental-implementation
agent-skills:test-driven-development
agent-skills:source-driven-development
```

Acceptance criteria:

- [x] safe test bot запускается in target outbound-only LXC;
- [x] safe test bot использует `long_polling`;
- [x] secrets остаются в local `.env`;
- [x] service lifecycle управляется `systemd`;
- [x] `npm test` проходит.

Verification:

- [x] unit-test for long polling mode;
- [x] smoke check on current operator host;
- [x] manual run in target outbound-only LXC;
- [x] verification that `.env` is not committed;
- [x] `npm test`.

Dependencies:

- ADR-0007;
- ADR-0008;
- ADR-0009;
- Task 13.

Files likely touched:

```text
src/bot-platform/*
examples/bot-platform/env.example
tests/bot-platform/*
systemd/*
```

Estimated scope: M

## Task 14.2: Зафиксировать webhook ingress prerequisites

Goal:

Описать и проверить prerequisites для перехода от safe test bot к real webhook path.

Method:

```text
Documentation update
```

Scope:

- описать network, DNS и ports;
- описать callback endpoint exposure;
- описать, что webhook остается production-only path;
- не внедрять inbound webhook runtime в current LXC.

Skill:

```text
agent-skills:documentation-and-adrs
agent-skills:api-and-interface-design
```

Acceptance criteria:

- [x] docs explain network prerequisites;
- [x] docs explain DNS prerequisites;
- [x] docs explain port exposure prerequisites;
- [x] docs state webhook is production-only;
- [x] `npm test` проходит.

Verification:

- [x] docs review;
- [x] `npm test`.

Dependencies:

- Task 14.1;
- ADR-0006;
- ADR-0008.

Files likely touched:

```text
docs/decisions/ADR-0006-use-lxc-integration-stand-for-mvp-callback-path.md
docs/third-stage-stand-and-agent.md
docs/test-runs/task-12-9-integration-deferred.md
docs/runbooks/bot-platform-stand.md
```

Result:

```text
Webhook ingress prerequisites are documented in ADR-0006, the stand notes, and the integration-deferred record. The production-only webhook boundary is explicit, and npm test passes.
```

Estimated scope: S

## Checkpoint: After Task 14.1

- [x] safe test bot runs in target outbound-only LXC;
- [x] long polling mode is default;
- [x] `.env` remains local-only;
- [x] `systemd` service works in target LXC.

## Checkpoint: After Task 14.2

- [x] webhook ingress prerequisites are documented;
- [x] production-only boundary is explicit;
- [x] `npm test` passes.
