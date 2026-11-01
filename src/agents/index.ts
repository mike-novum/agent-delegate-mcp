import { z } from 'zod';
import { ToolName, RunResult } from '../types.js';
import { claudeInputSchema, runClaude } from './claude.js';
import { antigravityInputSchema, runAntigravity } from './antigravity.js';
import { cursorInputSchema, runCursor } from './cursor.js';
import { codexInputSchema, runCodex } from './codex.js';
import { opencodeInputSchema, runOpenCode } from './opencode.js';

export interface AgentDefinition {
  name: ToolName;
  description: string;
  schema: z.ZodObject<any>;
  run: (input: any) => Promise<RunResult>;
}

export const AGENT_DEFINITIONS: Record<ToolName, AgentDefinition> = {
  delegate_claude: {
    name: 'delegate_claude',
    description:
      'Delegates a prompt/task to Claude Code CLI agent non-interactively, returning its output.',
    schema: z.object(claudeInputSchema),
    run: runClaude,
  },
  delegate_antigravity: {
    name: 'delegate_antigravity',
    description:
      'Delegates a prompt/task to Google Antigravity CLI (agy) agent non-interactively, returning its output.',
    schema: z.object(antigravityInputSchema),
    run: runAntigravity,
  },
  delegate_cursor: {
    name: 'delegate_cursor',
    description:
      'Delegates a prompt/task to Cursor Agent CLI non-interactively, returning its output.',
    schema: z.object(cursorInputSchema),
    run: runCursor,
  },
  delegate_codex: {
    name: 'delegate_codex',
    description:
      'Delegates a prompt/task to OpenAI Codex CLI agent non-interactively, returning its output.',
    schema: z.object(codexInputSchema),
    run: runCodex,
  },
  delegate_opencode: {
    name: 'delegate_opencode',
    description:
      'Delegates a prompt/task to OpenCode CLI agent non-interactively, returning its output.',
    schema: z.object(opencodeInputSchema),
    run: runOpenCode,
  },
};
