# Okta IdP setup for bot-platform live runs

Документ описывает установку и настройку Okta IdP на MVP стенде для live runs multi-source ingest (ADR-0027).

## Назначение

```text
Okta tenant → OIDC Application → JWT → bot-platform ingress → MAX
```

## Требования

```text
Доступ к Okta Admin Console (или free developer account)
Доступ к LXC стенду с bot-platform
make, g++ (для сборки better-sqlite3)
Node.js >= 20
```

## 1. Получить Okta tenant

### Вариант A: Free developer account

1. Перейти на https://www.okta.com/free-trial/
2. Зарегистрировать аккаунт
3. Получить домен вида `dev-123456.okta.com`

### Вариант B: Корпоративный Okta tenant

Получить доступ к существующему корпоративному Okta tenant у администратора.

### Проверить доступность

```bash
curl -s https://<okta-domain>/.well-known/openid-configuration | jq '.issuer'
# Ожидаемый результат: "https://<okta-domain>/oauth2/default"
```

## 2. Создать OIDC Application

В Okta Admin Console:

1. **Applications > Create App Integration**
2. Выбрать **OIDC - OpenID Connect**
3. Выбрать **Machine-to-Machine (Service)**
4. Заполнить:

| Поле | Значение |
|---|---|
| App name | `zabbix-bot-platform` |
| Grant type | Client Credentials |
| Audience | `bot-platform` |

5. Сохранить **Client ID** и **Client Secret**

### Проверить client-credentials flow

```bash
curl -s -X POST https://<okta-domain>/oauth2/default/v1/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&audience=bot-platform'

# Ожидаемый результат:
# {
#   "access_token": "<jwt>",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }
```

## 3. Добавить кастомный claim `bot_source`

В Okta Admin Console:

1. **Security > API > Authorization Servers > default**
2. Вкладка **Claims**
3. **Add Claim**:

| Поле | Значение |
|---|---|
| Name | `bot_source` |
| Value type | Expression |
| Value | `"zabbix"` |
| Include in token type | Access Token |

4. Сохранить

### Проверить claims в JWT

```bash
# Получить токен
TOKEN=$(curl -s -X POST https://<okta-domain>/oauth2/default/v1/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&audience=bot-platform' \
  | jq -r '.access_token')

# Декодировать payload (без верификации)
echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq .

# Ожидаемый результат:
# {
#   "iss": "https://<okta-domain>/oauth2/default",
#   "sub": "<CLIENT_ID>",
#   "aud": "bot-platform",
#   "iat": ...,
#   "exp": ...,
#   "bot_source": "zabbix",
#   "scp": ["bot.ingest"]
# }
```

## 4. Проверить JWKS endpoint

```bash
curl -s https://<okta-domain>/oauth2/default/v1/keys | jq '.keys | length'
# Ожидаемый результат: >= 1
```

## 5. Настроить bot-platform на стенде

### 5.1 Установить зависимости

```bash
cd zabbix-max-alert-bot
npm install
```

Если `better-sqlite3` не собрался:

```bash
# Debian/Ubuntu
sudo apt-get install make g++

# RHEL/CentOS
sudo yum groupinstall "Development Tools"

# macOS
xcode-select --install

npm install
```

### 5.2 Настроить переменные окружения

Создать `.env` файл на стенде (не коммитить в git):

```bash
cat > .env << 'EOF'
# MAX bot-platform
MAX_API_URL=https://platform-api2.max.ru
MAX_BOT_TOKEN=<your-max-bot-token>
MAX_LOG_LEVEL=info
MAX_TRANSPORT_MODE=long_polling

# Okta IdP
OKTA_ISSUER=https://<okta-domain>/oauth2/default
OKTA_AUDIENCE=bot-platform

# Ingress
INGRESS_ENABLED=true
INGRESS_PORT=8443

# Queue (опционально)
QUEUE_ENABLED=true
QUEUE_MAX_ATTEMPTS=5
QUEUE_INTERVAL_MS=5000
EOF
```

### 5.3 Проверить JWT-верификацию

```bash
node -e "
  const OktaJwtVerifier = require('@okta/jwt-verifier');
  const verifier = new OktaJwtVerifier({ issuer: 'https://<okta-domain>/oauth2/default' });
  verifier.verifyAccessToken('<jwt>', 'bot-platform')
    .then(c => console.log('OK', c.claims))
    .catch(e => console.error('FAIL', e.message));
"
# Ожидаемый результат: OK { sub: '...', bot_source: 'zabbix', ... }
```

### 5.4 Запустить bot-platform

```bash
# Foreground
node src/bot-platform/app.js

# Или с systemd
sudo cp systemd/max-identity-bot-live.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now max-identity-bot-live
```

Ожидаемый вывод:

```text
HTTP-ingress server started on port 8443
Queue worker started
MAX bot-platform safe test service started in long_polling mode with synthetic updates
```

### 5.5 Проверить ingress

```bash
# Получить токен
TOKEN=$(curl -s -X POST https://<okta-domain>/oauth2/default/v1/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&audience=bot-platform' \
  | jq -r '.access_token')

# Отправить тестовый alert
curl -X POST http://localhost:8443/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": { "kind": "user", "value": "<MAX_USER_ID>" },
    "message": "Test alert from Okta setup"
  }'

# Ожидаемый результат: 200 OK с status "queued" или "sent"
```

## 6. Хранение секретов

| Секрет | Где хранится | Не коммитится |
|---|---|---|
| `CLIENT_ID` (Zabbix) | env Media type Zabbix | да |
| `CLIENT_SECRET` (Zabbix) | env Media type Zabbix | да |
| Okta domain | env Media type Zabbix + bot-platform `.env` | да |
| Okta issuer URL | bot-platform `.env` | да |
| Bot API token | bot-platform `.env` | да |

## 7. TTL токена

- **Рекомендуемый TTL:** 3600 секунд (1 час)
- **Refresh:** Zabbix Media type запрашивает новый токен перед каждым alert
- **При недоступности Okta:** токен не выдаётся → alert не доставляется (ADR-0022)

## 8. Диагностика

### Токен не выдаётся

```bash
# Проверить доступность Okta
curl -s https://<okta-domain>/.well-known/openid-configuration | jq '.issuer'

# Проверить client-credentials
curl -s -X POST https://<okta-domain>/oauth2/default/v1/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>&audience=bot-platform'
```

### JWT не проходит верификацию

```bash
# Проверить JWKS
curl -s https://<okta-domain>/oauth2/default/v1/keys | jq '.keys[0].kid'

# Проверить claims
echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq '.iss, .aud, .bot_source'
```

### Ingress не принимает запросы

```bash
# Проверить порт
ss -tlnp | grep 8443

# Проверить логи
journalctl -u max-identity-bot-live -n 50 --no-pager | grep ingress
```

## 9. Rollback

Если Okta-интеграция не работает:

1. Отключить ingress: `INGRESS_ENABLED=false`
2. Перезапустить bot-platform
3. Продолжать работу через прямой путь `max-webhook.js → MAX Bot API`

## Проверка после изменения

- нет реальных токенов в документе;
- нет реальных `user_id` / `chat_id`;
- нет внутренних URL и доменных имен;
- `npm test` проходит;
- step-by-step команды работают на чистом стенде.
