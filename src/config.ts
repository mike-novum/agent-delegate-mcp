import fs from 'node:fs';
import path from 'node:path';
import { ServerConfig, ToolName } from './types.js';

export const ALL_TOOL_NAMES: ToolName[] = [
  'delegate_claude',
  'delegate_antigravity',
  'delegate_cursor',
  'delegate_codex',
  'delegate_opencode',
];

export function normalizeToolName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  if (trimmed.startsWith('delegate_')) {
    return trimmed;
  }
  return `delegate_${trimmed}`;
}

export function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map(normalizeToolName);
}

export function loadConfig(argv: string[] = process.argv.slice(2), env: NodeJS.ProcessEnv = process.env): ServerConfig {
  let disabledTools: string[] = [];
  let enabledTools: string[] | undefined = undefined;
  let defaultTimeoutMs: number | undefined = undefined;

  let configFilePath: string | undefined = env.CONFIG_PATH;

  // Check AGENT_DELEGATE_CONFIG json in env
  if (env.AGENT_DELEGATE_CONFIG) {
    try {
      const parsed = JSON.parse(env.AGENT_DELEGATE_CONFIG);
      if (Array.isArray(parsed.disabledTools)) {
        disabledTools.push(...parsed.disabledTools.map(normalizeToolName));
      }
      if (Array.isArray(parsed.enabledTools)) {
        enabledTools = (enabledTools || []).concat(parsed.enabledTools.map(normalizeToolName));
      }
      if (typeof parsed.defaultTimeoutMs === 'number') {
        defaultTimeoutMs = parsed.defaultTimeoutMs;
      }
    } catch {
      // Ignore JSON parse error, fallback to other options
    }
  }

  // Parse CLI arguments
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--config' && i + 1 < argv.length) {
      configFilePath = argv[++i];
    } else if (arg.startsWith('--config=')) {
      configFilePath = arg.slice('--config='.length);
    } else if ((arg === '--disable-tools' || arg === '--disabled-tools' || arg === '--disable') && i + 1 < argv.length) {
      disabledTools.push(...parseList(argv[++i]));
    } else if (arg.startsWith('--disable-tools=')) {
      disabledTools.push(...parseList(arg.slice('--disable-tools='.length)));
    } else if (arg.startsWith('--disabled-tools=')) {
      disabledTools.push(...parseList(arg.slice('--disabled-tools='.length)));
    } else if (arg.startsWith('--disable=')) {
      disabledTools.push(...parseList(arg.slice('--disable='.length)));
    } else if ((arg === '--enable-tools' || arg === '--enabled-tools' || arg === '--enable') && i + 1 < argv.length) {
      const list = parseList(argv[++i]);
      enabledTools = (enabledTools || []).concat(list);
    } else if (arg.startsWith('--enable-tools=')) {
      const list = parseList(arg.slice('--enable-tools='.length));
      enabledTools = (enabledTools || []).concat(list);
    } else if (arg.startsWith('--enabled-tools=')) {
      const list = parseList(arg.slice('--enabled-tools='.length));
      enabledTools = (enabledTools || []).concat(list);
    } else if (arg.startsWith('--enable=')) {
      const list = parseList(arg.slice('--enable='.length));
      enabledTools = (enabledTools || []).concat(list);
    } else if (arg === '--timeout' && i + 1 < argv.length) {
      const parsed = Number.parseInt(argv[++i], 10);
      if (!Number.isNaN(parsed)) defaultTimeoutMs = parsed;
    } else if (arg.startsWith('--timeout=')) {
      const parsed = Number.parseInt(arg.slice('--timeout='.length), 10);
      if (!Number.isNaN(parsed)) defaultTimeoutMs = parsed;
    }
  }

  // Parse environment variables
  if (env.DISABLED_TOOLS) {
    disabledTools.push(...parseList(env.DISABLED_TOOLS));
  }
  if (env.ENABLED_TOOLS) {
    const list = parseList(env.ENABLED_TOOLS);
    enabledTools = (enabledTools || []).concat(list);
  }
  if (env.DEFAULT_TIMEOUT_MS) {
    const parsed = Number.parseInt(env.DEFAULT_TIMEOUT_MS, 10);
    if (!Number.isNaN(parsed)) defaultTimeoutMs = parsed;
  }

  // Load from config file if specified
  if (configFilePath) {
    try {
      const resolved = path.resolve(configFilePath);
      if (fs.existsSync(resolved)) {
        const fileContent = fs.readFileSync(resolved, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed.disabledTools)) {
          disabledTools.push(...parsed.disabledTools.map(normalizeToolName));
        }
        if (Array.isArray(parsed.enabledTools)) {
          enabledTools = (enabledTools || []).concat(parsed.enabledTools.map(normalizeToolName));
        }
        if (typeof parsed.defaultTimeoutMs === 'number' && defaultTimeoutMs === undefined) {
          defaultTimeoutMs = parsed.defaultTimeoutMs;
        }
      }
    } catch {
      // Ignore config file read error
    }
  }

  return {
    disabledTools: Array.from(new Set(disabledTools)),
    enabledTools: enabledTools ? Array.from(new Set(enabledTools)) : undefined,
    defaultTimeoutMs,
  };
}

export function isToolEnabled(toolName: ToolName, config: ServerConfig): boolean {
  const normalized = normalizeToolName(toolName);
  if (config.disabledTools.includes(normalized)) {
    return false;
  }
  if (config.enabledTools && config.enabledTools.length > 0) {
    return config.enabledTools.includes(normalized);
  }
  return true;
}
