# Task List: Zabbix MAX Alert Bot

Задачи оформлены по `planning-and-task-breakdown`: каждая задача небольшая, проверяемая и имеет явные критерии приемки.

## Task 1: Проверить MAX webhook на тестовом получателе

**Description:** Проверить отправку тестового сообщения из Zabbix Media type `MAX` на тестового получателя МАХ без изменения логики webhook.

**Acceptance criteria:**

- [ ] Тестовое сообщение отправляется из Zabbix Media type `MAX`.
- [ ] В сообщении отображаются тема и текст уведомления.
- [ ] Ошибка отправки, если она возникает, видна в логе webhook.

**Verification:**

- [ ] Выполнен тест Media type в Zabbix.
- [ ] Проверен результат доставки в МАХ.
- [ ] Итог проверки зафиксирован в `docs/zabbix-media-type.md`.

**Dependencies:** None

**Files likely touched:**

- `docs/zabbix-media-type.md`
- `examples/media-params.md`

**Estimated scope:** Small: 1-2 files

---

## Task 2: Зафиксировать результат Problem/Recovery

**Description:** Проверить и описать поведение уведомлений для Problem и Recovery, чтобы формат восстановления был понятен получателю.

**Acceptance criteria:**

- [ ] Problem-событие доставляется с корректной иконкой и текстом.
- [ ] Recovery-событие доставляется с корректной иконкой и текстом.
- [ ] Поведение Problem/Recovery описано без реальных событий и внутренних значений.

**Verification:**

- [ ] Проведен тест Problem.
- [ ] Проведен тест Recovery.
- [ ] Документация обновлена после проверки.

**Dependencies:** Task 1

**Files likely touched:**

- `docs/zabbix-media-type.md`
- `docs/project-context.md`

**Estimated scope:** Small: 1-2 files

---

## Task 3: Описать получение идентификатора получателя в МАХ

**Description:** Подготовить нейтральное описание порядка получения идентификатора получателя в МАХ для личной или групповой отправки.

**Acceptance criteria:**

- [ ] Описан общий порядок получения идентификатора получателя.
- [ ] Разделены сценарии личного получателя и группового чата.
- [ ] В документации нет реальных идентификаторов и внутренних названий.

**Verification:**

- [ ] Документ можно использовать для повторной настройки.
- [ ] Примеры обезличены.
- [ ] Проверено соответствие `docs/documentation-policy.md`.

**Dependencies:** None

**Files likely touched:**

- `docs/zabbix-media-type.md`
- `examples/media-params.md`

**Estimated scope:** Small: 1-2 files

---

## Task 4: Подготовить инструкцию export/import для Zabbix Media type

**Description:** Описать, как переносить или повторно создавать Media type `MAX` в Zabbix без публикации чувствительных значений.

**Acceptance criteria:**

- [ ] Описан вариант ручного создания Media type.
- [ ] Описан вариант переноса через экспорт Zabbix, если он применим.
- [ ] Отдельно указано, какие значения нужно задавать только в целевой системе.

**Verification:**

- [ ] Инструкция проверена по структуре Zabbix Media type.
- [ ] Нет реальных значений авторизации, URL внутренних систем и боевых идентификаторов.
- [ ] README не противоречит инструкции.

**Dependencies:** Task 1

**Files likely touched:**

- `docs/zabbix-media-type.md`
- `examples/`

**Estimated scope:** Medium: 2-3 files

---

## Task 5: Добавить минимальную проверку форматирования сообщения

**Description:** Добавить минимальную проверку формирования сообщения webhook, если для этого выбран простой локальный runtime или отдельный тестовый harness.

**Acceptance criteria:**

- [ ] Проверяется формирование текста для обычного события.
- [ ] Проверяется формирование текста для Recovery.
- [ ] Проверка не требует реального подключения к МАХ.

**Verification:**

- [ ] Проверка запускается локальной командой.
- [ ] `bash scripts/verify-repo.sh` остается рабочим.
- [ ] Документация обновлена, если добавлена новая команда.

**Dependencies:** Task 1, Task 2

**Files likely touched:**

- `src/zabbix-media-type/max-webhook.js`
- `tests/`
- `package.json`
- `scripts/verify-repo.sh`

**Estimated scope:** Medium: 3-5 files

---

## Task 6: Провести review документации и webhook-логики

**Description:** Проверить, что документация, текущий webhook и процесс разработки согласованы между собой и не расширяют проект за пределы первого этапа.

**Acceptance criteria:**

- [ ] Проверены `README.md`, `AGENTS.md`, `DEVELOPMENT.md` и `docs/`.
- [ ] Проверено, что ADR находятся только в `docs/decisions/`.
- [ ] Проверено, что задачи находятся в `tasks/plan.md` и `tasks/todo.md`.

**Verification:**

- [ ] Выполнен `bash scripts/verify-repo.sh`.
- [ ] Проверены чек-листы `.agents/checklists/`.
- [ ] Найденные замечания оформлены отдельными задачами или исправлены минимально.

**Dependencies:** Task 1, Task 2, Task 3, Task 4

**Files likely touched:**

- `README.md`
- `AGENTS.md`
- `DEVELOPMENT.md`
- `docs/`
- `tasks/`

**Estimated scope:** Medium: 3-5 files

---

## Task 7: Оценить необходимость отдельного bot-service

**Description:** После пилота оценить, достаточно ли прямого Zabbix Webhook или нужен отдельный сервис для очередей, повторной отправки и журнала доставки.

**Acceptance criteria:**

- [ ] Описаны признаки, при которых прямого webhook недостаточно.
- [ ] Описаны плюсы и минусы отдельного сервиса.
- [ ] При необходимости создан ADR до начала реализации.

**Verification:**

- [ ] Есть результаты пилота или эксплуатационные наблюдения.
- [ ] Решение не реализуется без ADR.
- [ ] Граница текущего этапа не изменена незаметно.

**Dependencies:** Task 1, Task 2, Task 6

**Files likely touched:**

- `docs/decisions/`
- `docs/project-context.md`
- `tasks/plan.md`

**Estimated scope:** Small: 1-2 files

---

## Task 8: Описать варианты повторной отправки и журнала доставки

**Description:** Подготовить описание возможного развития после пилота: повторная отправка, журнал попыток доставки, отдельные маршруты по группам получателей.

**Acceptance criteria:**

- [ ] Описаны варианты без немедленной реализации.
- [ ] Указаны ограничения прямого webhook-подхода.
- [ ] Решение о реализации вынесено в будущий ADR.

**Verification:**

- [ ] Документ не требует изменения текущего webhook.
- [ ] Не добавлены новые компоненты без решения.
- [ ] Формулировки соответствуют `docs/documentation-policy.md`.

**Dependencies:** Task 7

**Files likely touched:**

- `docs/project-context.md`
- `docs/decisions/`
- `tasks/plan.md`

**Estimated scope:** Small: 1-2 files

---

## Checkpoints

### After Tasks 1-2

- [ ] Базовая доставка подтверждена.
- [ ] Problem/Recovery описаны.
- [ ] Документация не содержит чувствительных значений.

### After Tasks 3-4

- [ ] Настройку можно повторить по документации.
- [ ] Получатель и параметры описаны обезличенно.
- [ ] Export/import или ручной перенос понятны инженеру.

### After Tasks 5-6

- [ ] Есть минимальная проверка качества.
- [ ] Документация и задачи согласованы.
- [ ] Проект готов к дальнейшему пилоту.

### Before Tasks 7-8

- [ ] Есть результаты пилота.
- [ ] Подтверждена необходимость развития.
- [ ] Перед архитектурным изменением создан ADR.
