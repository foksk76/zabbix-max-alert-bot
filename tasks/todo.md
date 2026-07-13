# Task List: Zabbix MAX Alert Bot

Задачи ведутся по `planning-and-task-breakdown`. Исторические задачи выполнены и заархивированы. Текущий статус проекта:

```text
docs/live-identity-bot.md
```

## Status summary

```text
Done: Tasks 1-18.8
Open: Task 18.9, Task 18.10
```

Historical tasks 1-18.8 completed. See git history and `docs/test-runs/` for verification.

---

## Task 18.9: Run live personal-dialog `user_id` verification

**Status:** Open

**Description:** Выполнить live run: пользователь отправляет сообщение боту МАХ в личном диалоге, бот отвечает `RecipientType: user_id` и обезличенным `To`.

**Method:** Live integration run

**Skill:** `debugging-and-error-recovery`, `documentation-and-adrs`

**Acceptance criteria:**

- [ ] Бот получил реальное личное сообщение.
- [ ] Бот отправил видимый ответ через MAX Bot API.
- [ ] Ответ содержит `RecipientType: user_id` and sanitized `To`.

**Verification:**

- [ ] Обезличенный live test-run добавлен в `docs/test-runs/`.
- [ ] Реальные токены and IDs are not committed.
- [ ] `npm test`.

**Dependencies:** Task 18.7, Task 18.8

**Files likely touched:** `docs/test-runs/`, `docs/live-identity-bot.md`, `tasks/todo.md`

**Estimated scope:** Small

---

## Task 18.10: Run live chat `chat_id` verification and update acceptance evidence

**Status:** Open

**Description:** Выполнить live chat-сценарий и закрыть evidence map: бот отвечает в групповом или другом поддержанном chat-сценарии с `RecipientType: chat_id`, затем обновляются acceptance документы.

**Method:** Live acceptance run

**Skill:** `debugging-and-error-recovery`, `documentation-and-adrs`

**Acceptance criteria:**

- [ ] Бот получил реальное chat-сообщение или supported chat event.
- [ ] Бот отправил видимый ответ through MAX Bot API.
- [ ] `docs/live-identity-bot.md` evidence map references sanitized live run.

**Verification:**

- [ ] Обезличенный live test-run добавлен или обновлен в `docs/test-runs/`.
- [ ] `docs/live-identity-bot.md` marks live scenario accepted.
- [ ] `npm test`.

**Dependencies:** Task 18.9

**Files likely touched:** `docs/test-runs/`, `docs/live-identity-bot.md`, `tasks/plan.md`, `tasks/todo.md`

**Estimated scope:** Small
