# ADR-0037: SSRF-защита для IdP-запросов

## Статус

Принято.

## Дата

2026-07-23

## Контекст

ADR-0034 вводит OAuth2/OIDC-auth для queue-monitor через hand-rolled
OIDC-клиент (`src/queue-monitor/auth/oidc.js`). Клиент делает исходящие
fetch-запросы к IdP по URL из `IDP_ISSUER`:

- discovery: `/.well-known/openid-configuration`
- token: POST `/token`
- userinfo: GET `/userinfo`

URL IdP задаётся через ENV `IDP_ISSUER`. Если атакующий подменит DNS
или control plane (DNS rebinding), fetch может обратиться к internal
сервису (cloud metadata `169.254.169.254`, внутренний API, база данных).

Текущий MVP-стенд использует HTTP issuer (`http://nanoidp:8000`) —
IdP на trusted LAN. SSRF-проверки должны работать для production
(Keycloak/Authentik на HTTPS) и быть обходимыми для MVP- стенда.

## Решение

Ввести модуль `src/queue-monitor/auth/url-safety.js` с функцией
`assertSafeUrl(rawUrl, options)` — SSRF-проверка перед каждым
fetch к IdP.

### Механизм

1. **URL parsing** — валидация через `new URL(rawUrl)`
2. **Scheme check** — только `https:` (или `http:` при `relaxSsrf=true`)
3. **IP literal check** — если hostname уже IP, проверить напрямую
4. **DNS resolution** — `node:dns/promises` с `all: true` (ВСЕ A/AAAA)
5. **Private IP check** — каждый resolved адрес проверяется на
   private/reserved/loopback/link-local диапазоны

### IPv4-диапазоны (отклонить)

| Диапазон | RFC |
|---|---|
| `0.0.0.0/8` | this network |
| `10.0.0.0/8` | private |
| `127.0.0.0/8` | loopback |
| `169.254.0.0/16` | link-local (включая cloud metadata) |
| `172.16.0.0/12` | private |
| `192.0.0.0/24` | IETF protocol assignments |
| `192.0.2.0/24` | TEST-NET-1 |
| `192.168.0.0/16` | private |
| `198.18.0.0/15` | benchmarking (RFC 2544) |
| `100.64.0.0/10` | CGNAT (RFC 6598) |
| `224.0.0.0/4` | multicast |
| `240.0.0.0/4` | reserved |

### IPv6-диапазоны (отклонить)

| Диапазон | Описание |
|---|---|
| `::1/128` | loopback |
| `::` | unspecified |
| `fe80::/10` | link-local |
| `fc00::/7` | unique-local |
| `ff00::/8` | multicast |
| `64:ff9b::/96` | NAT64 well-known prefix |
| `100::/64` | discard prefix (RFC 6666) |
| `2001:db8::/32` | documentation |
| `2001::/32` | teredo |
| `::ffff:0:0/96` | IPv4-mapped (проверить embedded IPv4) |
| `::a.b.c.d` | IPv4-compatible (deprecated) |

### relaxSsrf

Параметр `options.relaxSsrf = true` отключает scheme + IP-проверки
(но не отклоняет опасные scheme: `file:`, `javascript:`, `data:`).

Используется для HTTP issuer на MVP стенде (ADR-0034, known limitation).
При вызове с `relaxSsrf=true` вызывается `onAudit({ hostname, reason })`
для ADR-0029 (lifecycle audit trail).

### Логирование

- Ошибка: `hostname + reason` (без resolved IP — минимизация info disclosure)
- Debug: `hostname + addresses` через injectable `onDebug`
- Audit: `relaxSsrf=true` bypass через injectable `onAudit`

### Known limitation: TOCTOU

`fetch` ре-резолвит DNS после `assertSafeUrl`. Короткий-TTL рекорд
может rebind'нуть на internal IP между проверкой и соединением.

Принято как known limitation для MVP. Для full mitigation нужен
pin-to-IP или filtering-agent — отдельный ADR при high-assurance need.

### API

```text
assertSafeUrl(rawUrl, options) → Promise<void>
  options.dnsLookup  — injectable (для тестов), default: node:dns/promises
  options.onDebug    — injectable ({ hostname, addresses })
  options.onAudit    — injectable ({ hostname, reason })
  options.relaxSsrf  — boolean, default: false
```

Бросает `Error` при:
- невалидный URL
- non-https scheme (без relaxSsrf)
- опасный scheme (file:, javascript:, data:) — даже при relaxSsrf
- hostname резолвится в private/reserved range
- DNS-ошибка
- нет адресов

## Рассмотренные альтернативы

### Не делать SSRF-проверку

Минус: атакующий может направить fetch к cloud metadata
(`169.254.169.254`), internal API или базе данных. Для IdP на
production (Keycloak/Authentik) — критический риск. Отклонено.

### pin-to-IP (trust-on-first-use)

Минус: требует хранения IP-адреса, ручного обновления при смене
IP IdP. Сложность для MVP. TOCTOU всё равно остаётся для
первой проверки. Отклонено (revisit при high-assurance need).

### Использовать готовую SSRF-библиотеку

Минус: ADR-0015 (zero deps). Логика укладывается в ~200 строк
stdlib (`node:dns/promises`). Отклонено.

## Последствия

### Новые файлы

```text
src/queue-monitor/auth/url-safety.js    — SSRF-защита (217 строк)
```

### Изменённые файлы

```text
src/queue-monitor/auth/oidc.js          — assertSafeUrl перед fetch к IdP
src/queue-monitor/api/auth-routes.js    — assertSafeUrl перед OAuth2 callback
```

### Не затронуто

- root `package.json` — без изменений (используется `node:dns/promises`);
- `src/bot-platform/` — без изменений;
- ADR-0015 policy-test — без изменений.

### Ожидаемый результат

- все fetch к IdP проходят через `assertSafeUrl`;
- DNS rebinding в private range → отказ + лог;
- `relaxSsrf=true` работает для MVP стенда;
- тесты покрывают IPv4/IPv6 private диапазоны, scheme check, TOCTOU.

## Ссылки

- [ADR-0034](ADR-0034-queue-monitor-dashboard.md) — Queue Monitor Dashboard, OAuth2/OIDC auth
- [ADR-0015](ADR-0015-zero-external-dependencies.md) — нулевые внешние зависимости
- [ADR-0029](ADR-0029-lifecycle-audit-trail.md) — audit trail (onAudit callback)
- `src/queue-monitor/auth/url-safety.js` — реализация
