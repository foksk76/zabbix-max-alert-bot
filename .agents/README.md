# AI workspace

Каталог `.agents/` хранит короткий рабочий контекст для AI-разработки.

## Структура

```text
.agents/
  project-context.md              короткий рабочий контекст агента
  README.md                       карта AI workspace
  checklists/
    pre-commit.md                 проверка перед фиксацией изменений
    security.md                   проверка на безопасное ведение проекта
  prompts/
    implement.md                  шаблон задания на реализацию
    review.md                     шаблон задания на code review
```

## Где искать задачи

Задачи не хранятся в `.agents/`.

Каноничное место для задач:

```text
tasks/plan.md
tasks/todo.md
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
tasks/plan.md
tasks/todo.md
```

## Принцип

Все файлы здесь служебные. Они не заменяют README, документацию и план задач, а помогают Codex/AI-агенту быстрее войти в контекст и не раздувать проект лишними функциями.
