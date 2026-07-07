# Пример параметров Zabbix Media type

```text
APIUrl: https://platform-api2.max.ru/messages
HTTPProxy:
Message: {ALERT.MESSAGE}
ParseMode: HTML
RecipientType: chat_id
Severity: {EVENT.SEVERITY}
Subject: {ALERT.SUBJECT}
To: {ALERT.SENDTO}
Token: <MAX_BOT_TOKEN>
Trigger_status: {TRIGGER.STATUS}
```

`HTTPProxy` — необязательный параметр. Заполняется только если Zabbix должен отправлять исходящий запрос через HTTP-прокси.

Для боевой настройки токен не хранится в репозитории и задается только в настройках Zabbix.
