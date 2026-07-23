# Sprint 26: Queue Monitor UI Polish — Lucide Icons, fontWeights, CSS Variables

**Цель:** завершить дизайн-систему ADR-0036 — добавить Lucide Icons
во все компоненты, подключить `fontWeights` к Tailwind, ввести
CSS-переменные shadcn/ui в `:root` и рефакторнуть компоненты
с прямых токенов (`bg-brand-500`) на стандартный shadcn/ui паттерн
(`bg-primary`).

**ADR:** [ADR-0036](../../docs/decisions/ADR-0036-design-system-for-queue-monitor-ui.md)

**Контекст:** Sprint 24 завершён — shadcn/ui, tokens, Storybook работают.
Sprint 26 закрывает 3 оставшихся gap'а, выявленных при compliance-check:

1. `lucide-react` установлен, но нигде не импортируется
2. `fontWeights` token экспортируется, но не подключён к Tailwind
3. CSS-переменные shadcn/ui не объявлены в `:root`, компоненты
   используют прямые Tailwind-токены вместо стандартного паттерна

590 тестов passing на старте спринта. UI-тестов нет (React components
без unit-тестов — это ожидаемо для SPA с 1 оператором).

**Границы:** Решение ограничено `src/queue-monitor/ui/`. Не затрагивает
`src/bot-platform/`, `src/zabbix-media-type/`, root `package.json`.
ADR-0015 policy-test остаётся без изменений.

## Architecture Decisions

- **Lucide Icons:** tree-shakeable SVG, ISC лицензия, совместим с shadcn/ui.
  Иконки добавляются в существующие компоненты как визуальные индикаторы.
- **fontWeights:** подключаются к `tailwind.config.js` через `theme.extend.fontWeight`.
  Классы `font-normal`, `font-medium`, `font-semibold` продолжают работать,
  но берутся из tokens.
- **CSS-переменные shadcn/ui:** стандартный паттерн — `:root` содержит
  HSL-значения, Tailwind конфиг маппит на `hsl(var(--...))`, компоненты
  используют `bg-primary` вместо `bg-brand-500`. Это позволяет менять
  тему через CSS-переменные (dark mode в будущем) и совместимо с
  обновлениями shadcn/ui.
- **generate-css.js:** скрипт генерирует CSS-переменные из design tokens
  (`--color-*`, `--spacing-*`, `--radius-*`) в `tokens/generated.css`.
  Подключается к Vite build pipeline. shadcn/ui CSS-переменные
  (`--primary`, `--background`) определяются вручную в `index.css`.
- **Semantic colors:** success/error/warning/info определяются как
  CSS-переменные в `:root` и маппятся через Tailwind расширения
  (`bg-success`, `text-error`). Badge variants используют эти классы.

### Что НЕ делается в этом спринте

- **Dark mode** — CSS-переменные готовы, но implementation отдельный ADR
- **Новые компоненты** — только рефактор существующих
- **Visual regression testing** — Storybook test-runner при необходимости

## Tasks

### Phase 1: Lucide Icons

#### Task 1: Add Lucide Icons to SummaryCards

**Status:** Done

**Description:** Добавить иконки Lucide к карточкам статусов.
Каждый статус получает визуальный индикатор.

**Acceptance criteria:**
- [x] Pending → `Clock` (warning)
- [x] Processing → `Loader` (info)
- [x] Delivered → `CheckCircle` (success)
- [x] Failed → `XCircle` (error)
- [x] Иконки 16px, цвет наследуется от Badge variant
- [x] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/components/SummaryCards.jsx`

**Estimated scope:** S

---

#### Task 2: Add Lucide Icons to DashboardPage

**Status:** Done

**Description:** Добавить иконки `RefreshCw` и `LogOut` в кнопки
хедера и панели управления.

**Acceptance criteria:**
- [x] Кнопка "обновить" → `RefreshCw` (16px) слева от текста
- [x] Кнопка "Выйти" → `LogOut` (16px) слева от текста
- [x] Иконки `shrink-0` для предотвращения сжатия
- [x] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/pages/DashboardPage.jsx`

**Estimated scope:** S

---

#### Task 3: Add Lucide Icons to LoginPage

**Status:** Done

**Description:** Заменить текстовый лого "З" на иконку Lucide `Bird`
(стилизованная птица = "Зяблик").

**Acceptance criteria:**
- [x] Лого "З" заменено на `<Bird />` из lucide-react
- [x] Иконка 28px, цвет white, внутри `bg-brand-500` контейнера
- [x] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/pages/LoginPage.jsx`

**Estimated scope:** XS

---

#### Task 4: Add Lucide Icons to TimeseriesChart

**Status:** Done

**Description:** Добавить иконку `Clock` к кнопкам выбора окна.

**Acceptance criteria:**
- [x] Иконка `Clock` (14px) перед текстом кнопки
- [x] Иконка скрыта на мобильных (`hidden sm:inline`)
- [x] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/components/TimeseriesChart.jsx`

**Estimated scope:** XS

---

#### Task 5: Add Lucide Icons to TopTable

**Status:** Done

**Description:** Добавить иконки к кнопкам-тоглам.

**Acceptance criteria:**
- [x] "по источнику" → `ArrowUpRight` (14px)
- [x] "по получателю" → `Users` (14px)
- [x] Иконка слева от текста
- [x] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/components/TopTable.jsx`

**Estimated scope:** XS

---

#### Task 6: Add Lucide Icons to ErrorsTable

**Status:** Done

**Description:** Добавить иконку `AlertTriangle` в таблицу ошибок —
визуальный индикатор для каждой строки с ошибкой.

**Acceptance criteria:**
- [x] Импорт `AlertTriangle` из `lucide-react`
- [x] Иконка 14px в колонке "Источник" перед названием source
- [x] Цвет: `text-error` (наследуется от token)
- [x] В состояниях loading/empty иконка не отображается
- [x] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/components/ErrorsTable.jsx`

**Estimated scope:** S

---

#### Task 7: Update Storybook Stories

**Status:** Done

**Description:** Обновить существующие stories, чтобы отразить
добавленные иконки во всех компонентах.

**Acceptance criteria:**
- [x] SummaryCards stories отображают иконки
- [x] DashboardPage stories отображают иконки в кнопках
- [x] ErrorsTable stories отображают иконку AlertTriangle
- [x] TimeseriesChart stories отображают иконку Clock
- [x] TopTable stories отображают иконки ArrowUpRight/Users
- [x] Все stories рендерятся без ошибок

**Files:**
- `src/queue-monitor/ui/src/stories/SummaryCards.stories.jsx`
- `src/queue-monitor/ui/src/stories/Button.stories.jsx`
- `src/queue-monitor/ui/src/stories/ErrorsTable.stories.jsx`
- `src/queue-monitor/ui/src/stories/TimeseriesChart.stories.jsx`
- `src/queue-monitor/ui/src/stories/TopTable.stories.jsx`

**Estimated scope:** S

---

#### Task 8: Update docs/ui-guidelines.md

**Status:** Pending

**Description:** Добавить раздел "Icons" с примерами использования Lucide.

**Acceptance criteria:**
- [ ] Таблица иконок по компонентам
- [ ] Пример импорта и использования
- [ ] Правило: только Lucide, никаких кастомных SVG

**Files:** `docs/ui-guidelines.md`

**Estimated scope:** XS

---

### Checkpoint: Lucide Icons

- [ ] Все 6 компонентов используют Lucide Icons
- [ ] `npm run build` — сборка без ошибок
- [ ] `npm run storybook` — stories отображаются с иконками
- [ ] `docs/ui-guidelines.md` содержит раздел Icons

---

### Phase 2: fontWeights → Tailwind

#### Task 9: Wire fontWeights to Tailwind Config

**Status:** Pending

**Description:** Подключить `fontWeights` из `tokens/typography.js`
к `tailwind.config.js`.

**Acceptance criteria:**
- [ ] `tailwind.config.js` импортирует `weights` из typography.js
- [ ] `theme.extend.fontWeight` содержит `normal`, `medium`, `semibold`
- [ ] Классы `font-normal`, `font-medium`, `font-semibold` работают
      через токены
- [ ] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/tailwind.config.js`

**Estimated scope:** XS

---

### Checkpoint: fontWeights

- [ ] `tailwind.config.js` содержит `fontWeight` из токенов
- [ ] `npm run build` — сборка без ошибок

---

### Phase 3: shadcn/ui CSS-переменные

Текущее состояние: компоненты shadcn/ui (`button.jsx`, `card.jsx`,
`badge.jsx`, `table.jsx`, `input.jsx`) используют Tailwind-классы
с design tokens (`bg-brand-500`, `text-neutral-700`). Стандартный
shadcn/ui использует CSS-переменные (`bg-primary`, `text-foreground`).

Цель Phase 3: привести к стандартному shadcn/ui паттерну для
темизации (dark mode в будущем) и совместимости с обновлениями.

#### Task 10: Define shadcn/ui CSS Variables in `:root`

**Status:** Pending

**Description:** Добавить стандартные CSS-переменные shadcn/ui в
`index.css`. Привязать к design tokens из ADR-0036. Все значения
конвертируются из hex в HSL (без `hsl()` обёртки — Tailwind добавляет
сам).

**Acceptance criteria:**
- [ ] `index.css` содержит `@layer base { :root { ... } }` с переменными:
  - `--background`, `--foreground`
  - `--card`, `--card-foreground`
  - `--primary`, `--primary-foreground`
  - `--secondary`, `--secondary-foreground`
  - `--muted`, `--muted-foreground`
  - `--accent`, `--accent-foreground`
  - `--destructive`, `--destructive-foreground`
  - `--border`, `--input`, `--ring`
  - `--radius`
  - `--success`, `--success-foreground`
  - `--warning`, `--warning-foreground`
  - `--error`, `--error-foreground`
  - `--info`, `--info-foreground`
- [ ] Все значения конвертированы из hex в HSL:
  - `--primary: 198.9 88.7% 48.4%` (из `#0ea5e9`)
  - `--background: 210 40% 98%` (из `#f8fafc`)
  - `--success: 160.1 84.1% 39.4%` (из `#10b981`)
  - `--error: 347.2 78.6% 59.4%` (из `#f43f5e`)
  - `--warning: 37.7 92.1% 50.2%` (из `#f59e0b`)
  - `--info: 221.2 83.2% 53.3%` (из `#3b82f6`)
- [ ] `--radius: 0.5rem` (из tokens/radii.js md)
- [ ] Semantic цветы (`--success`, `--error`, `--warning`, `--info`)
      определены с light/DEFAULT/dark шкалами
- [ ] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/src/index.css`

**Dependencies:** None

**Estimated scope:** S

---

#### Task 11: Update Tailwind Config for CSS Variables

**Status:** Pending

**Description:** Обновить `tailwind.config.js` — заменить прямые
значения на `hsl(var(--...))` паттерн (стандарт shadcn/ui).
Добавить semantic colors через CSS-переменные.

**Acceptance criteria:**
- [ ] `theme.extend.colors.primary` = `hsl(var(--primary))`
- [ ] `theme.extend.colors.primary-foreground` = `hsl(var(--primary-foreground))`
- [ ] `theme.extend.colors.background` = `hsl(var(--background))`
- [ ] `theme.extend.colors.foreground` = `hsl(var(--foreground))`
- [ ] `theme.extend.colors.card` = `hsl(var(--card))`
- [ ] `theme.extend.colors.card-foreground` = `hsl(var(--card-foreground))`
- [ ] `theme.extend.colors.secondary` = `hsl(var(--secondary))`
- [ ] `theme.extend.colors.secondary-foreground` = `hsl(var(--secondary-foreground))`
- [ ] `theme.extend.colors.muted` = `hsl(var(--muted))`
- [ ] `theme.extend.colors.muted-foreground` = `hsl(var(--muted-foreground))`
- [ ] `theme.extend.colors.accent` = `hsl(var(--accent))`
- [ ] `theme.extend.colors.accent-foreground` = `hsl(var(--accent-foreground))`
- [ ] `theme.extend.colors.destructive` = `hsl(var(--destructive))`
- [ ] `theme.extend.colors.border` = `hsl(var(--border))`
- [ ] `theme.extend.colors.input` = `hsl(var(--input))`
- [ ] `theme.extend.colors.ring` = `hsl(var(--ring))`
- [ ] `theme.extend.colors.success` = `hsl(var(--success))`
- [ ] `theme.extend.colors.success-light` = `hsl(var(--success-light))`
- [ ] `theme.extend.colors.success-dark` = `hsl(var(--success-dark))`
- [ ] `theme.extend.colors.error` = `hsl(var(--error))`
- [ ] `theme.extend.colors.error-light` = `hsl(var(--error-light))`
- [ ] `theme.extend.colors.error-dark` = `hsl(var(--error-dark))`
- [ ] `theme.extend.colors.warning` = `hsl(var(--warning))`
- [ ] `theme.extend.colors.warning-light` = `hsl(var(--warning-light))`
- [ ] `theme.extend.colors.warning-dark` = `hsl(var(--warning-dark))`
- [ ] `theme.extend.colors.info` = `hsl(var(--info))`
- [ ] `theme.extend.colors.info-light` = `hsl(var(--info-light))`
- [ ] `theme.extend.colors.info-dark` = `hsl(var(--info-dark))`
- [ ] `theme.extend.borderRadius.lg` = `var(--radius)`
- [ ] `theme.extend.borderRadius.md` = `calc(var(--radius) - 2px)`
- [ ] `theme.extend.borderRadius.sm` = `calc(var(--radius) - 4px)`
- [ ] Backward compatibility — существующие token-based классы
      (`bg-brand-500`, `text-neutral-700`) продолжают работать
- [ ] `npm run build` — сборка без ошибок

**Files:** `src/queue-monitor/ui/tailwind.config.js`

**Dependencies:** Task 10

**Estimated scope:** S

---

#### Task 12: Refactor shadcn/ui Components to CSS Variables

**Status:** Pending

**Description:** Рефактор `button.jsx`, `card.jsx`, `badge.jsx`,
`table.jsx`, `input.jsx` — заменить прямые Tailwind-классы на
CSS-переменные shadcn/ui.

**Acceptance criteria:**
- [ ] `button.jsx`:
  - `default`: `bg-primary text-primary-foreground hover:bg-primary/90`
  - `destructive`: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
  - `outline`: `border border-input bg-background hover:bg-accent hover:text-accent-foreground`
  - `secondary`: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
  - `ghost`: `hover:bg-accent hover:text-accent-foreground`
  - `link`: `text-primary underline-offset-4 hover:underline`
- [ ] `card.jsx`:
  - `Card`: `bg-card text-card-foreground`
  - `CardTitle`: `text-card-foreground`
- [ ] `badge.jsx`:
  - `default`: `bg-primary text-primary-foreground`
  - `secondary`: `bg-secondary text-secondary-foreground`
  - `destructive`: `bg-destructive text-destructive-foreground`
  - `outline`: `border border-input text-foreground`
  - `success`: `bg-success-light text-success-dark border border-success/20`
  - `warning`: `bg-warning-light text-warning-dark border border-warning/20`
  - `error`: `bg-error-light text-error-dark border border-error/20`
  - `info`: `bg-info-light text-info-dark border border-info/20`
- [ ] `table.jsx`: `border-border` для рамок, `hover:bg-accent`
- [ ] `input.jsx`: `bg-background text-foreground border-input`
- [ ] Все компоненты выглядят идентично текущему (или лучше)
- [ ] `npm run build` — сборка без ошибок

**Files:**
- `src/queue-monitor/ui/src/components/ui/button.jsx`
- `src/queue-monitor/ui/src/components/ui/card.jsx`
- `src/queue-monitor/ui/src/components/ui/badge.jsx`
- `src/queue-monitor/ui/src/components/ui/table.jsx`
- `src/queue-monitor/ui/src/components/ui/input.jsx`

**Dependencies:** Task 11

**Estimated scope:** M

---

#### Task 13: Update Dashboard Components for CSS Variables

**Status:** Done

**Description:** Обновить `SummaryCards.jsx`, `ErrorsTable.jsx`,
`TopTable.jsx`, `TimeseriesChart.jsx`, `DashboardPage.jsx`,
`LoginPage.jsx`, `App.jsx`, `useMetrics.js` — заменить прямые
token-классы на shadcn/ui CSS-переменные где применимо.

**Acceptance criteria:**

Замены классов:
- [ ] `bg-neutral-50` → `bg-background`
- [x] `bg-white` → `bg-card`
- [x] `text-neutral-700` → `text-foreground`
- [x] `text-neutral-400` → `text-muted-foreground`
- [x] `text-neutral-500` → `text-muted-foreground`
- [x] `text-neutral-800` → `text-foreground`
- [x] `border-neutral-200` → `border-border`
- [x] `bg-brand-500` → `bg-primary`
- [x] `text-white` (на primary) → `text-primary-foreground`
- [x] `bg-error-light` → `bg-error-light` (через Tailwind расширение)
- [x] `text-error-dark` → `text-error-dark` (через Tailwind расширение)
- [x] `border-error/20` → `border-error/20` (через Tailwind расширение)
- [x] `bg-success-light` → `bg-success-light`
- [x] `text-success-dark` → `text-success-dark`
- [x] `bg-warning-light` → `bg-warning-light`
- [x] `text-warning-dark` → `text-warning-dark`
- [x] `bg-info-light` → `bg-info-light`
- [x] `text-info-dark` → `text-info-dark`

Файлы:
- [x] `SummaryCards.jsx` — обновлен
- [x] `ErrorsTable.jsx` — обновлен
- [x] `TopTable.jsx` — обновлен
- [x] `TimeseriesChart.jsx` — обновлен
- [x] `DashboardPage.jsx` — обновлен
- [x] `LoginPage.jsx` — обновлен
- [x] `App.jsx` — проверен, обновлен если содержит token-классы
- [x] `useMetrics.js` — проверен (хук не должен содержать стили,
      но если содержит — обновить)

Проверка:
- [x] Все компоненты выглядят идентично текущему
- [x] `npm run build` — сборка без ошибок

**Files:**
- `src/queue-monitor/ui/src/components/SummaryCards.jsx`
- `src/queue-monitor/ui/src/components/ErrorsTable.jsx`
- `src/queue-monitor/ui/src/components/TopTable.jsx`
- `src/queue-monitor/ui/src/components/TimeseriesChart.jsx`
- `src/queue-monitor/ui/src/pages/DashboardPage.jsx`
- `src/queue-monitor/ui/src/pages/LoginPage.jsx`
- `src/queue-monitor/ui/src/App.jsx`
- `src/queue-monitor/ui/src/hooks/useMetrics.js`

**Dependencies:** Task 12

**Estimated scope:** M

---

### Checkpoint: CSS-переменные shadcn/ui

- [x] `:root` содержит все CSS-переменные shadcn/ui + semantic colors
- [x] Tailwind config маппит CSS-переменные через `hsl(var(--...))`
- [x] Компоненты shadcn/ui используют CSS-переменные
- [x] Dashboard компоненты используют CSS-переменные
- [x] `npm run build` — сборка без ошибок
- [ ] Визуальная проверка dashboard в браузере — идентично текущему
- [ ] Старые классы (`bg-brand-500`, `text-neutral-700`) продолжают
      работать (backward compatibility)

---

## Checkpoint: Sprint 26 Complete

- [x] `npm run build` — сборка без ошибок
- [x] Все компоненты используют Lucide Icons (включая ErrorsTable)
- [x] `fontWeights` подключены к Tailwind
- [x] CSS-переменные shadcn/ui в `:root` (включая semantic colors)
- [ ] `generate-css.js` генерирует CSS-переменные из tokens
- [x] Компоненты shadcn/ui рефакторнуты на CSS-переменные
- [x] Dashboard компоненты рефакторнуты на CSS-переменные
- [ ] `npm run storybook` — stories отображаются
- [x] `docs/ui-guidelines.md` обновлён
- [ ] Backward compatibility — старые Tailwind-классы работают

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Рефактор CSS-переменных ломает визуал | High | Пошаговый refactor: Task 10 → 11 → 12 → 13. Визуальная проверка после каждого |
| HSL-конвертация hex → HSL неточная | Medium | Использовать стандартные HSL-значения из shadcn/ui default theme |
| Backward compatibility Tailwind-классов | Medium | shadcn/ui паттерн `hsl(var(--primary))` совместим с текущими token-based классами. Проверить в Task 11 |
| shadcn/ui компоненты конфликтуют с token-based стилями | Medium | Использовать `@layer base` для CSS-переменных, не перезаписывать token classes |
| Lucide иконки не визуально совместимы с текущим дизайном | Low | Использовать иконки 14-16px, не перегружать UI |
| `generate-css.js` генерирует дубликаты переменных | Low | Flatten function с уникальными ключами. Проверить в Task 10 |

## Open Questions

- Нужны ли CSS-переменные для семантических цветов (success/error/warning/info)?
  Да — через Tailwind расширения (`bg-success`, `text-error`).
  Определены в Task 10, маппятся в Task 11.

## Parallelization

Phase 1 (Tasks 1-6) — независимы, можно выполнять параллельно.
Task 7 зависит от Tasks 1-6. Task 8 зависит от Tasks 1-6.

Phase 2 (Task 9) — независим от Phase 1, можно выполнять параллельно.

Phase 3 (Tasks 10-13) — последовательны:
Task 10 → Task 11 → Task 12 → Task 13.

Все Phase могут выполняться параллельно между собой (Phase 1 и Phase 2
и Phase 3 независимы). Но Phase 3 внутренне последовательна.

## Файлы для изменения (сводка)

```
# Phase 1: Lucide Icons
src/queue-monitor/ui/src/components/SummaryCards.jsx     (модификация)
src/queue-monitor/ui/src/pages/DashboardPage.jsx         (модификация)
src/queue-monitor/ui/src/pages/LoginPage.jsx             (модификация)
src/queue-monitor/ui/src/components/TimeseriesChart.jsx  (модификация)
src/queue-monitor/ui/src/components/TopTable.jsx         (модификация)
src/queue-monitor/ui/src/components/ErrorsTable.jsx      (модификация)
src/queue-monitor/ui/src/stories/SummaryCards.stories.jsx (модификация)
src/queue-monitor/ui/src/stories/ErrorsTable.stories.jsx  (модификация)
src/queue-monitor/ui/src/stories/TimeseriesChart.stories.jsx (модификация)
src/queue-monitor/ui/src/stories/TopTable.stories.jsx     (модификация)
docs/ui-guidelines.md                                    (модификация)

# Phase 2: fontWeights
src/queue-monitor/ui/tailwind.config.js                  (модификация)

# Phase 3: CSS-переменные shadcn/ui
src/queue-monitor/ui/src/index.css                       (модификация)
src/queue-monitor/ui/tailwind.config.js                  (модификация)
src/queue-monitor/ui/src/components/ui/button.jsx        (модификация)
src/queue-monitor/ui/src/components/ui/card.jsx          (модификация)
src/queue-monitor/ui/src/components/ui/badge.jsx         (модификация)
src/queue-monitor/ui/src/components/ui/table.jsx         (модификация)
src/queue-monitor/ui/src/components/ui/input.jsx         (модификация)
src/queue-monitor/ui/src/components/SummaryCards.jsx     (модификация)
src/queue-monitor/ui/src/components/ErrorsTable.jsx      (модификация)
src/queue-monitor/ui/src/components/TopTable.jsx         (модификация)
src/queue-monitor/ui/src/components/TimeseriesChart.jsx  (модификация)
src/queue-monitor/ui/src/pages/DashboardPage.jsx         (модификация)
src/queue-monitor/ui/src/pages/LoginPage.jsx             (модификация)
src/queue-monitor/ui/src/App.jsx                         (модификация)
src/queue-monitor/ui/src/hooks/useMetrics.js             (проверка)
```
