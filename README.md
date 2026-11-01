# agent-delegate-mcp

Model Context Protocol (MCP) сервер на TypeScript для делегирования задач и промптов другим агентам (`Claude`, `Antigravity`, `Cursor`, `Codex`, `OpenCode`).

Сервер собирается с помощью `esbuild` в единый автономный исполняемый файл `index.js` (`dist/index.js`) со всеми зависимостями.

---

## Возможности

- **Поддержка 5 ведущих AI-агентов**:
  - `delegate_claude` — вызов Claude Code CLI (`claude -p`)
  - `delegate_antigravity` — вызов Google Antigravity CLI (`agy -p`)
  - `delegate_cursor` — вызов Cursor Agent CLI (`cursor agent -p`)
  - `delegate_codex` — вызов OpenAI Codex CLI (`codex exec` с авто-фоллбэком на `npx @openai/codex exec`)
  - `delegate_opencode` — вызов OpenCode CLI (`opencode run`)
- **Единый стандартизированный интерфейс**:
  - `prompt` (обязательный) — текст задачи / промпта
  - `model` (опциональный) — идентификатор модели
  - `effort` (опциональный) — уровень рассуждений / reasoning effort (`low`, `medium`, `high`, `max` и т.д.)
  - Специфичные настройки для каждого агента (режимы работы, права, рабочие каталоги, форматы вывода).
- **Гибкая конфигурация и отключение инструментов**:
  - Возможность выборочно отключать/включать тулы через CLI аргументы, переменные окружения или файл конфигурации.
- **Автоматический релиз через `semantic-release`**:
  - Автоинкремент версий по Conventional Commits.
  - Поддержка патч-версий для коммитов типов `fix`, `build`, `refactor` (на базе `conventional-changelog-conventionalcommits@^9.3.1`).
  - Автоматическая генерация `CHANGELOG.md` и релизов на GitHub с вливанием в `main`.

---

## Доступные инструменты (MCP Tools)

### 1. `delegate_claude`
Делегирование задачи Claude Code CLI в неинтерактивном режиме.
- `prompt` (`string`, required) — текст задачи.
- `model` (`string`, optional) — модель (например, `claude-3-7-sonnet`, `claude-3-5-sonnet`).
- `effort` (`low` | `medium` | `high` | `max`, optional) — уровень reasoning effort.
- `dangerouslySkipPermissions` (`boolean`, optional) — пропуск запросов подтверждения прав (`--dangerously-skip-permissions`).
- `addDir` (`string[]`, optional) — дополнительные директории для доступа (`--add-dir`).
- `outputFormat` (`text` | `json` | `stream-json`, optional) — формат вывода (`--output-format`).
- `appendSystemPrompt` (`string`, optional) — дополнительный системный промпт (`--append-system-prompt`).
- `continue` (`boolean`, optional) — продолжить последнюю сессию (`--continue`).
- `cwd` (`string`, optional) — рабочий каталог.
- `timeoutMs` (`number`, optional) — таймаут выполнения в миллисекундах.

### 2. `delegate_antigravity`
Делегирование задачи Google Antigravity CLI (`agy`) в неинтерактивном режиме.
- `prompt` (`string`, required) — текст задачи.
- `model` (`string`, optional) — модель для сессии CLI.
- `effort` (`low` | `medium` | `high` | `xhigh` | `max`, optional) — reasoning effort.
- `dangerouslySkipPermissions` (`boolean`, optional) — авто-подтверждение запросов тулов (`--dangerously-skip-permissions`).
- `mode` (`accept-edits` | `auto` | `plan`, optional) — режим выполнения агента.
- `addDir` (`string[]`, optional) — директории для включения в workspace.
- `conversation` (`string`, optional) — идентификатор предыдущего диалога для возобновления.
- `continue` (`boolean`, optional) — продолжить недавний диалог.
- `outputFormat` (`text` | `json` | `stream-json`, optional) — формат вывода.
- `cwd` (`string`, optional) — рабочий каталог.
- `timeoutMs` (`number`, optional) — таймаут в миллисекундах.

### 3. `delegate_cursor`
Делегирование задачи агенту Cursor CLI (`cursor agent`).
- `prompt` (`string`, required) — текст задачи.
- `model` (`string`, optional) — модель (например, `gpt-5`, `sonnet-4-thinking`).
- `effort` (`low` | `medium` | `high` | `max`, optional) — уровень reasoning effort.
- `mode` (`plan` | `ask`, optional) — режим планирования (`plan`) или вопросов-ответов (`ask`).
- `force` (`boolean`, optional) — запуск всех команд без ручного подтверждения (`-f` / `--yolo`).
- `workspace` (`string`, optional) — каталог воркспейса (`--workspace`).
- `outputFormat` (`text` | `json` | `stream-json`, optional) — формат вывода.
- `approveMcps` (`boolean`, optional) — авто-одобрение всех MCP серверов.
- `trust` (`boolean`, optional) — доверие воркспейсу без запроса.
- `continue` (`boolean`, optional) — продолжить предыдущую сессию.
- `cwd` (`string`, optional) — рабочий каталог.
- `timeoutMs` (`number`, optional) — таймаут в миллисекундах.

### 4. `delegate_codex`
Делегирование задачи агенту OpenAI Codex CLI (`codex exec`).
- `prompt` (`string`, required) — текст задачи.
- `model` (`string`, optional) — модель агента.
- `effort` (`low` | `medium` | `high`, optional) — reasoning effort (`-c model_reasoning_effort="..."`).
- `sandbox` (`read-only` | `workspace-write` | `danger-full-access`, optional) — политика песочницы (`-s`).
- `dangerouslyBypassApprovalsAndSandbox` (`boolean`, optional) — выполнение без ограничений и подтверждений.
- `cd` (`string`, optional) — рабочий корень агента (`-C`).
- `json` (`boolean`, optional) — вывод событий в формате JSONL.
- `ephemeral` (`boolean`, optional) — запуск без сохранения файлов сессии.
- `cwd` (`string`, optional) — рабочий каталог.
- `timeoutMs` (`number`, optional) — таймаут в миллисекундах.

### 5. `delegate_opencode`
Делегирование задачи OpenCode CLI (`opencode run`).
- `prompt` (`string`, required) — текст задачи.
- `model` (`string`, optional) — модель в формате `provider/model` (`-m`).
- `effort` (`minimal` | `low` | `medium` | `high` | `max`, optional) — вариант модели / reasoning effort (`--variant`).
- `auto` (`boolean`, optional) — авто-одобрение действий (`--auto`).
- `dir` (`string`, optional) — рабочий каталог для OpenCode (`--dir`).
- `format` (`default` | `json`, optional) — формат вывода.
- `agent` (`string`, optional) — профиль агента.
- `title` (`string`, optional) — заголовок сессии.
- `session` (`string`, optional) — ID сессии для продолжения (`-s`).
- `continue` (`boolean`, optional) — продолжить последнюю сессию (`-c`).
- `thinking` (`boolean`, optional) — отображение блоков размышлений (`--thinking`).
- `cwd` (`string`, optional) — рабочий каталог.
- `timeoutMs` (`number`, optional) — таймаут в миллисекундах.

---

## Конфигурация: отключение и включение тулов

Вы можете гибко управлять списком доступных инструментов несколькими способами:

### 1. Через CLI аргументы при запуске сервера
```bash
# Отключить определенные тулы:
node dist/index.js --disable-tools claude,cursor
# или
node dist/index.js --disable=codex,opencode

# Включить ТОЛЬКО определенные тулы:
node dist/index.js --enable-tools claude,antigravity
```

### 2. Через переменные окружения
```bash
# Отключить тулы:
export DISABLED_TOOLS=delegate_claude,delegate_cursor

# Или включить строго определенные:
export ENABLED_TOOLS=delegate_antigravity,delegate_codex

# Или через JSON-строку:
export AGENT_DELEGATE_CONFIG='{"disabledTools": ["claude"], "defaultTimeoutMs": 60000}'
```

### 3. Через файл конфигурации
Создайте файл `agent-delegate.json`:
```json
{
  "disabledTools": ["cursor", "opencode"],
  "defaultTimeoutMs": 180000
}
```
И передайте путь через аргумент `--config path/to/agent-delegate.json` или переменную окружения `CONFIG_PATH`.

---

## Подключение к MCP клиентам

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "agent-delegate": {
      "command": "node",
      "args": [
        "/path/to/agent-delegate-mcp/dist/index.js",
        "--disable-tools", "opencode"
      ]
    }
  }
}
```

---

## Сборка и тестирование

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Сборка в единый автономный index.js файл через esbuild
npm run build

# Проверка типов
npm run typecheck
```

---

## Релиз и версионирование (Semantic Release)

В проекте настроен `semantic-release` с плагином `"conventional-changelog-conventionalcommits": "^9.3.1"`.

При коммитах в ветку `main`:
- Автоматически инкрементируется версия по семантическому версионированию.
- Коммиты типов `fix`, `build`, `refactor` увеличивают **patch** версию (`x.y.Z`).
- Коммиты типа `feat` увеличивают **minor** версию (`x.Y.0`).
- Breaking changes увеличивают **major** версию (`X.0.0`).
- Генерируется и обновляется файл `CHANGELOG.md`.
- Создается релиз на GitHub с релизными заметками.
- Обновленные `package.json`, `package-lock.json` и `CHANGELOG.md` коммитятся обратно в ветку `main`.
