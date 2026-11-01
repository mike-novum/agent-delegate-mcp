export type AgentName = 'claude' | 'antigravity' | 'cursor' | 'codex' | 'opencode';

export type ToolName =
  | 'delegate_claude'
  | 'delegate_antigravity'
  | 'delegate_cursor'
  | 'delegate_codex'
  | 'delegate_opencode';

export interface ServerConfig {
  disabledTools: string[];
  enabledTools?: string[];
  defaultTimeoutMs?: number;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  command: string;
  args: string[];
}

export interface BaseAgentInput {
  prompt: string;
  model?: string;
  effort?: string;
  cwd?: string;
  timeoutMs?: number;
}

export interface ClaudeAgentInput extends BaseAgentInput {
  dangerouslySkipPermissions?: boolean;
  addDir?: string[];
  outputFormat?: 'text' | 'json' | 'stream-json';
  appendSystemPrompt?: string;
  continue?: boolean;
}

export interface AntigravityAgentInput extends BaseAgentInput {
  dangerouslySkipPermissions?: boolean;
  mode?: 'accept-edits' | 'auto' | 'plan';
  addDir?: string[];
  conversation?: string;
  continue?: boolean;
  outputFormat?: 'text' | 'json' | 'stream-json';
}

export interface CursorAgentInput extends BaseAgentInput {
  mode?: 'plan' | 'ask';
  force?: boolean;
  workspace?: string;
  outputFormat?: 'text' | 'json' | 'stream-json';
  approveMcps?: boolean;
  trust?: boolean;
  continue?: boolean;
}

export interface CodexAgentInput extends BaseAgentInput {
  sandbox?: 'read-only' | 'workspace-write' | 'danger-full-access';
  dangerouslyBypassApprovalsAndSandbox?: boolean;
  cd?: string;
  json?: boolean;
  ephemeral?: boolean;
}

export interface OpenCodeAgentInput extends BaseAgentInput {
  auto?: boolean;
  dir?: string;
  format?: 'default' | 'json';
  agent?: string;
  title?: string;
  session?: string;
  continue?: boolean;
  thinking?: boolean;
}
