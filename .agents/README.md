# AI workspace

Каталог `.agents/` хранит рабочий контекст для AI-разработки и помогает не терять рамки проекта между сессиями.

## Структура

```text
.agents/
  project-context.md              короткий рабочий контекст агента
  README.md                       карта AI workspace
  tasks/
    current.md                    текущая задача
    backlog.md                    накопительный список задач
  checklists/
    pre-commit.md                 проверка перед фиксацией изменений
    security.md                   проверка на чувствительные данные
  prompts/
    implement.md                  шаблон задания на реализацию
    review.md                     шаблон задания на code review
```

## Где искать решения

Архитектурные решения не хранятся в `.agents/`.

Каноничное место для ADR:

```text
docs/decisions/
```

Перед изменением архитектуры, границ проекта или процесса разработки агент должен проверить:

```text
docs/decisions/README.md
docs/documentation-policy.md
docs/project-context.md
```

## Принцип

Все файлы здесь служебные. Они не заменяют README и документацию, а помогают Codex/AI-агенту быстрее войти в контекст и не раздувать проект лишними функциями.
