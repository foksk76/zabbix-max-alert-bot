# ADR-0036: Дизайн-система для React UI queue-monitor

## Статус

Принято.

## Дата

2026-07-23

## Контекст

ADR-0034 вводит Queue Monitor Dashboard с React SPA в `src/queue-monitor/ui/`.
Стек: React, Vite, Tailwind CSS, Recharts. UI-зависимости — исключение из
ADR-0015, ограниченное `src/queue-monitor/ui/package.json`.

Текущее состояние UI (`src/queue-monitor/ui/src/`):

```text
components/
├── ErrorsTable.jsx
├── SummaryCards.jsx
├── TimeseriesChart.jsx
└── TopTable.jsx
pages/
├── DashboardPage.jsx
└── LoginPage.jsx
hooks/
└── useSession.js
App.jsx
main.jsx
```

Компоненты реализованы без формализованной системы токенов, без общих
primitives (Button, Card, Table), без документации. При масштабировании
(ADR-0034 Phase 7 — Production UI Migration: новые метрики, новые экраны)
это приведёт к:

- дублированию стилей между компонентами;
- расхождению визуального языка при разных авторах (люди + AI);
- трудностям с рефакторингом при смене темы;
- невозможностью переиспользовать компоненты между экранами.

Исходная idea document (`docs/ideas/ai-native-product-platform.md`)
предлагала расширение scope до «Enterprise SaaS Product Platform»
(Brand Book, Figma UI Kit, shadcn/ui, Lucide, «AI-Native Product
Experience Platform»). Это противоречит README.md:11 («Проект не
пытается быть большой платформой»), project-context.md:79-87 и
AGENTS.md. Dashboard — вспомогательный инструмент для 1 оператора,
не SaaS-продукт.

## Решение

Ввести дизайн-систему для `src/queue-monitor/ui/` — design tokens,
компонентную библиотеку, Storybook и AI-guidelines — без расширения
scope проекта и без добавления runtime-зависимостей.

### 1. Design Tokens

Каталог `src/queue-monitor/ui/src/tokens/`:

```text
tokens/
├── colors.js       — палитра (primary, neutral, semantic: success/warning/error)
├── typography.js   — размеры шрифтов, line-height, font-weight
├── spacing.js      — отступы (4px grid)
├── radii.js        — border-radius
├── shadows.js      — elevation
└── index.js        — единый экспорт
```

Токены экспортируются как JS-объекты и как CSS-переменные
(`:root { --color-primary: ... }`). Tailwind-конфигурация
подключает токены через `theme.extend`.

### 2. Компонентная библиотека — shadcn/ui + Lucide Icons

Использовать [shadcn/ui](https://ui.shadcn.com/) как базу компонентов и
[Lucide Icons](https://lucide.dev/) для иконок.

Почему shadcn/ui:
- готовые accessible-компоненты (WCAG AA) с поддержкой Tailwind CSS;
- copy-paste модель — код живёт в проекте, нет внешней runtime-зависимости;
- стабильный API, большой выбор компонентов (Button, Card, Table, Badge, Input и др.);
- легко кастомизируется через Tailwind-классы и design tokens.

Почему Lucide:
- SVG-иконки, tree-shakeable, легковесные;
- консистентный дизайн, совместимый с shadcn/ui;
- open source (ISC лицензия).

Установка в `src/queue-monitor/ui/`:

```text
npx shadcn@latest init    — инициализация (tailwind config, utils)
npx shadcn@latest add button card table badge input  — добавление компонентов
npm install lucide-react                              — иконки
```

Компоненты шadcn/ui кастомизируются через design tokens (Section 1)
и CSS-переменные в `globals.css`.

### 3. Storybook

Добавить Storybook как devDependency в `src/queue-monitor/ui/package.json`:

```text
src/queue-monitor/ui/
├── .storybook/
│   ├── main.js
│   └── preview.js
├── src/stories/
│   ├── Button.stories.jsx
│   ├── Card.stories.jsx
│   ├── Table.stories.jsx
│   ├── Badge.stories.jsx
│   └── Input.stories.jsx
```

Storybook — devDependency, не попадает в production bundle.
Запуск: `npm run storybook` в `src/queue-monitor/ui/`.

### 4. AI-guidelines

Файл `docs/ui-guidelines.md`:

- какие компоненты использовать для типичных паттернов
  (карточки метрик, таблицы ошибок, графики);
- какие паттерны запрещены (inline styles, hardcoded colors);
- примеры генерации нового экрана из существующих компонентов.

### 5. Brand Book

Минимальный brand book на основе текущего логотипа (`docs/assets/zyablik-logo.png`).

Файл `docs/brand-book.md`:

```text
Brand Book: Зяблик
├── Логотип — текущий PNG, правила использования
├── Цвета — палитра из логотипа (primary, accent, neutral)
├── Типографика — шрифт для UI (Inter или аналог)
├── Тон — технический, без маркетинговых формулировок
└── Применение — dashboard UI, документация, systemd unit-файлы
```

Brand Book — отправная точка для design tokens (Section 1).
Цвета из логотипа экспортируются как primary-палитра в `tokens/colors.js`.

### Граница решения

Это дизайн-система для dashboard, не «Product Platform» для всего
проекта. Решение ограничено `src/queue-monitor/ui/`:

- не расширяет scope проекта за пределы «очередь доставки + dashboard»;
- не затрагивает `src/bot-platform/`, `src/zabbix-media-type/`;
- не добавляет runtime-зависимостей в root `package.json`;
- ADR-0015 policy-test остаётся без изменений.

## Исключения из ADR-0015

Storybook, shadcn/ui и Lucide Icons добавляются в
`src/queue-monitor/ui/package.json`:

| Пакет | Тип | Обоснование |
|---|---|---|
| `storybook` | devDependency | Документация компонентов для людей и AI |
| `@storybook/react-vite` | devDependency | Интеграция с текущим Vite-стеком |
| `shadcn/ui` | copy-paste (нет пакета) | Базовые UI-компоненты (Button, Card, Table, Badge, Input) |
| `lucide-react` | runtime dependency | SVG-иконки для dashboard |

Storybook:
- не попадает в production bundle (`vite build` не включает `.storybook/`);
- живёт в отдельном `package.json` (не затрагивает root ADR-0015);
- ограничен слоем `ui/` (как react, vite, recharts, tailwind в ADR-0034).

shadcn/ui:
- компоненты — copy-paste в `src/queue-monitor/ui/src/components/ui/`;
- нет внешней runtime-зависимости (модель shadcn);
- кастомизируются через Tailwind-классы и design tokens.

lucide-react:
- runtime dependency в `ui/package.json`;
- tree-shakeable, не попадает в bundle если не импортирован;
- ISC лицензия, совместима с Apache-2.0.

## Рассмотренные альтернативы

### Ничего не делать — писать компоненты по мере необходимости

Минус: при 3-4 авторах (люди + AI) каждый стилизует по-своему.
Через 5-6 экранов — хаос стилей. При смене темы (dark mode) —
ручной рефакторинг каждого компонента. Отклонено.

### Расширять scope до «Product Platform» (оригинальная idea)

Минус: противоречит README.md:11, project-context.md:79-87, AGENTS.md.
Brand Book, Figma UI Kit, «enterprise-grade Product Experience Platform»
— оверхед для dashboard с 4 экранами у 1 оператора. Отклонено.

### Писать свои primitives (Button, Card, Table, Badge, Input)

Минус: для 5 компонентов потребуется ~300-500 строк кода + поддержка
accessibility (aria, keyboard), вариантов (variant, size), тестов.
shadcn/ui даёт готовые accessible-компоненты с кастомизацией через
Tailwind. При 15+ компонентах разрыв в пользу shadcn ещё больше.
Отклонено.

### Не делать Brand Book

Минус: ADR-0031 определил логотип и имя, но не зафиксировал палитру
и типографику. Без отправной точки design tokens будут ad-hoc.
Минимальный brand book (палитра из логотипа, шрифт, тон) — 1 страница.
Отклонено.

## Последствия

### Новые файлы

```text
src/queue-monitor/ui/src/tokens/          — design tokens
src/queue-monitor/ui/src/components/ui/   — shadcn/ui компоненты (Button, Card, Table, Badge, Input)
src/queue-monitor/ui/.storybook/          — конфигурация Storybook
src/queue-monitor/ui/src/stories/         — stories для компонентов
docs/ui-guidelines.md                     — AI-guidelines для frontend
docs/brand-book.md                        — Brand Book (палитра, типографика, тон)
```

### Изменённые файлы

```text
src/queue-monitor/ui/tailwind.config.js   — подключение design tokens
src/queue-monitor/ui/package.json         — storybook devDependencies, lucide-react runtime dependency
src/queue-monitor/ui/src/components/      — рефакторинг на базе shadcn/ui
src/queue-monitor/ui/src/index.css        — shadcn/ui CSS-переменные + design tokens
docs/decisions/ADR-0015-zero-external-dependencies.md — добавить исключения (shadcn, lucide, storybook)
docs/decisions/README.md                  — добавить ADR-0036
```

### Не затронуто

- `src/bot-platform/` — без изменений;
- `src/zabbix-media-type/` — без изменений;
- root `package.json` — без изменений;
- ADR-0015 policy-test (root) — без изменений;
- API endpoints, auth, queue — без изменений;
- `npm test` — все тесты продолжают работать.

### Ожидаемый результат

- `npm test` проходит (590/590);
- UI собирается (`npm run build` в `ui/`);
- компоненты — shadcn/ui, кастомизированные через design tokens;
- иконки — Lucide;
- каждый компонент имеет story в Storybook;
- `docs/brand-book.md` фиксирует палитру и типографику;
- `docs/ui-guidelines.md` описывает паттерны для AI и людей;
- при добавлении нового экрана — reuse shadcn/ui компонентов.

## Ссылки

- [docs/ideas/ai-native-product-platform.md](../ideas/ai-native-product-platform.md) — исходная idea document (переписана)
- [ADR-0034](ADR-0034-queue-monitor-dashboard.md) — Queue Monitor Dashboard, React + Vite + Tailwind
- [ADR-0015](ADR-0015-zero-external-dependencies.md) — нулевые внешние зависимости
- [ADR-0031](ADR-0031-preprod-brand-license-rename.md) — бренд «Зяблик»
- [ADR-0035](ADR-0035-session-auth-for-dashboard-metrics.md) — session auth для dashboard
