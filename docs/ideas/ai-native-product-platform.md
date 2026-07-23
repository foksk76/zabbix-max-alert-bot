# Idea: Дизайн-система и стандартизация UI queue-monitor

**Статус:** Принято как ADR-0036

**Автор:** Project Team

**Целевой релиз:** v2.x

**Обновлено:** 2026-07-23

---

# Резюме

Текущий React UI (`src/queue-monitor/ui/`) работает, но не имеет формализованных design tokens, переиспользуемых компонентов или документации. При добавлении новых экранов (ADR-0034 Phase 7 — Production UI Migration) возникнет дублирование и расхождение визуального стиля.

Предложение: ввести дизайн-систему для `queue-monitor/ui/` — design tokens, компонентную библиотеку, Storybook и AI-guidelines — без расширения scope проекта за пределы «очередь доставки + dashboard».

---

# Проблема

Текущее состояние `src/queue-monitor/ui/`:

```text
src/queue-monitor/ui/src/
├── components/
│   ├── ErrorsTable.jsx
│   ├── SummaryCards.jsx
│   ├── TimeseriesChart.jsx
│   └── TopTable.jsx
├── pages/
│   ├── DashboardPage.jsx
│   └── LoginPage.jsx
├── hooks/
│   └── useSession.js
├── App.jsx
└── main.jsx
```

Компоненты написаны «в лоб» — без общей системы токенов, без обёрток над primitives (Button, Card, Table), без документации. При масштабировании (новые метрики, новые экраны) это приведёт к:

- дублированию стилей между компонентами;
- расхождению визуального языка при разных авторах;
- трудностям с рефакторингом при смене бренда или темы;
- невозможностью переиспользовать компоненты между экранами.

---

# Контекст

### Что уже принято

| Решение | Статус | Связь |
|---|---|---|
| ADR-0034: Queue Monitor Dashboard | Принято | React + Vite + Tailwind + Recharts в `ui/` |
| ADR-0015: Zero external dependencies | Принято | UI-зависимости — исключение, ограниченное `ui/package.json` |
| ADR-0031: Бренд «Зяблик» | Принято | Логотип, имя — есть. Визуальная система — нет |
| ADR-0035: Session auth | Принято | Auth flow реализован |

### Что НЕ принято и НЕ входит в проект

Из `docs/project-context.md:79-87` и `AGENTS.md`:

```text
Не входит без отдельного ADR:
- промышленный bot-service;
- автоматическая повторная отправка;
- маршрутизация «на боте» (каналы и подписки);
- дедупликация, агрегация, приоритизация уведомлений;
- обработка инцидентов из МАХ;
- управление событиями Zabbix из мессенджера;
- автоматическое реагирование.
```

README.md:11 — «Проект не пытается быть большой платформой, SIEM-интеграцией или AI-помощником.»

**Проект — доставка уведомлений из Zabbix в МАХ. Dashboard — вспомогательный инструмент для оператора, а не SaaS-продукт.**

### Текущий UI-стек

```text
src/queue-monitor/ui/package.json:
  react ^18.3.1
  react-dom ^18.3.1
  recharts ^2.12.7
  vite ^5.3.4 (dev)
  tailwindcss ^3.4.6 (dev)
  autoprefixer ^10.4.19 (dev)
  postcss ^8.4.39 (dev)
```

Все зависимости — исключения из ADR-0015, обоснованные ADR-0034, живут в отдельном `package.json`.

---

# Предложение

Вместо «AI-Native Product Platform» (расширение scope проекта) — **дизайн-система для существующего React UI queue-monitor**.

## Что входит

### 1. Design Tokens (Phase 1)

Файл `src/queue-monitor/ui/src/tokens/` с CSS-переменными и JS-экспортом:

```text
tokens/
├── colors.js       — палитра (primary, neutral, semantic: success/warning/error)
├── typography.js   — размеры шрифтов, line-height, font-weight
├── spacing.js      — отступы (4px grid)
├── radii.js        — border-radius
├── shadows.js      — elevation
└── index.js        — единый экспорт
```

Tailwind-конфигурация подключает токены через `tailwind.config.js`.

### 2. Компонентная библиотека (Phase 2)

Использовать [shadcn/ui](https://ui.shadcn.com/) как базу компонентов
и [Lucide Icons](https://lucide.dev/) для иконок.

```text
src/queue-monitor/ui/src/components/ui/   — shadcn/ui компоненты
src/queue-monitor/ui/src/components/      — business-компоненты на базе shadcn/ui
```

Требования:
- каждый компонент кастомизируется через design tokens;
- story для каждого варианта.

### 3. Storybook (Phase 3)

Добавить в `src/queue-monitor/ui/`:

```text
src/queue-monitor/ui/
├── .storybook/           — конфигурация
├── src/stories/          — stories для каждого компонента
│   ├── Button.stories.jsx
│   ├── Card.stories.jsx
│   └── ...
└── package.json          — добавить storybook devDependencies
```

Storybook — devDependency, не попадает в production bundle.

### 4. AI-guidelines (Phase 4)

Файл `docs/ui-guidelines.md`:

- какие компоненты использовать для типичных паттернов (карточки метрик, таблицы, графики);
- какие паттерны запрещены (inline styles, hardcoded colors);
- примеры генерации нового экрана из shadcn/ui компонентов.

### 5. Brand Book (Phase 5)

Минимальный brand book на основе текущего логотипа (`docs/assets/zyablik-logo.png`):

```text
docs/brand-book.md:
├── Логотип — текущий PNG, правила использования
├── Цвета — палитра из логотипа (primary, accent, neutral)
├── Типографика — шрифт для UI (Inter или аналог)
├── Тон — технический, без маркетинговых формулировок
└── Применение — dashboard UI, документация
```

## Что НЕ входит

| Исключение | Причина |
|---|---|
| Figma | Вне scope проекта. Design tokens = JS-файлы, не Figma-проект |
| «Enterprise SaaS» | Проект — доставка уведомлений, не SaaS-продукт |
| Мобильное приложение | Вне scope (ADR-0034: 1 оператор, desktop) |

## Зависимости

Новые зависимости в `ui/package.json`:

- `lucide-react` — runtime dependency (SVG-иконки, tree-shakeable);
- `storybook`, `@storybook/react-vite` — devDependencies (не в production bundle);
- `shadcn/ui` — copy-paste компоненты, нет внешней runtime-зависимости;
- Design tokens — JS-файлы, не пакет.

Существующие исключения ADR-0015 (react, vite, recharts, tailwind) остаются без изменений.

---

# Альтернативы

### Ничего не делать — писать компоненты по мере необходимости

Минус: при 3-4 авторах (люди + AI) каждый будет стилизовать по-своему. Через 5-6 экранов — хаос. При смене темы (dark mode) — ручной рефакторинг каждого компонента.

### Расширять scope до «Product Platform» (оригинальная idea)

Минус: противоречит README.md:11, project-context.md:79-87, AGENTS.md. Проект — доставка уведомлений, не SaaS. «Enterprise-grade Product Experience Platform» — оверхед для dashboard с 4 экранами.

### Писать свои primitives вместо shadcn/ui

Минус: для 5 компонентов потребуется ~300-500 строк кода + поддержка accessibility. shadcn/ui даёт готовые accessible-компоненты.

---

# Последствия

### Новые файлы

```text
src/queue-monitor/ui/src/tokens/          — design tokens (colors, typography, spacing)
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
```

### Не затронуто

- `src/bot-platform/` — без изменений;
- `src/zabbix-media-type/` — без изменений;
- root `package.json` — без изменений;
- ADR-0015 policy-test — без изменений;
- API endpoints, auth, queue — без изменений.

### Ожидаемый результат

- `npm test` проходит;
- UI собирается (`npm run build` в `ui/`);
- компоненты — shadcn/ui, кастомизированные через design tokens;
- иконки — Lucide;
- каждый компонент имеет story в Storybook;
- `docs/brand-book.md` фиксирует палитру и типографику;
- `docs/ui-guidelines.md` описывает паттерны для AI и людей.

---

# Решение

Зафиксировано в [ADR-0036](../decisions/ADR-0036-design-system-for-queue-monitor-ui.md).
