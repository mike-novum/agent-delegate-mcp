import { z } from 'zod';
import { CursorAgentInput, RunResult } from '../types.js';
import { executeCommand, resolveBinary } from '../runner.js';

export const cursorInputSchema = {
  prompt: z.string().describe('The prompt / instructions for Cursor Agent'),
  model: z.string().optional().describe('Model to use (e.g. gpt-5, sonnet-4-thinking)'),
  effort: z
    .enum(['low', 'medium', 'high', 'max'])
    .or(z.string())
    .optional()
    .describe('Reasoning effort override (e.g. low, medium, high)'),
  mode: z.enum(['plan', 'ask']).optional().describe('Execution mode: plan (read-only/planning) or ask (Q&A)'),
  force: z.boolean().optional().describe('Force allow commands without prompting (auto-run / yolo)'),
  workspace: z.string().optional().describe('Workspace directory to use (defaults to current working directory)'),
  outputFormat: z
    .enum(['text', 'json', 'stream-json'])
    .optional()
    .describe('Output format for print mode (default: text)'),
  approveMcps: z.boolean().optional().describe('Automatically approve all MCP servers'),
  trust: z.boolean().optional().describe('Trust the workspace without prompting'),
  continue: z.boolean().optional().describe('Continue previous session'),
  cwd: z.string().optional().describe('Working directory to execute Cursor in'),
  timeoutMs: z.number().optional().describe('Execution timeout in milliseconds'),
};

export function formatCursorModel(model?: string, effort?: string): string | undefined {
  if (!model && !effort) return undefined;
  if (!effort) return model;

  if (!model) {
    return `default[effort=${effort}]`;
  }

  if (model.includes('[') && model.endsWith(']')) {
    const inside = model.slice(model.indexOf('[') + 1, -1);
    const base = model.slice(0, model.indexOf('['));
    return `${base}[${inside},effort=${effort}]`;
  }

  return `${model}[effort=${effort}]`;
}

export function buildCursorArgs(input: CursorAgentInput): { binary: string; args: string[] } {
  // Check if cursor exists, otherwise fallback to cursor-agent
  const hasCursor = resolveBinary('cursor') !== null;
  const binary = hasCursor ? 'cursor' : 'cursor-agent';

  const args: string[] = hasCursor ? ['agent', '-p'] : ['-p'];

  const modelWithEffort = formatCursorModel(input.model, input.effort);
  if (modelWithEffort) {
    args.push('--model', modelWithEffort);
  }

  if (input.mode) {
    args.push('--mode', input.mode);
  }

  if (input.force) {
    args.push('-f');
  }

  if (input.workspace) {
    args.push('--workspace', input.workspace);
  }

  if (input.outputFormat) {
    args.push('--output-format', input.outputFormat);
  }

  if (input.approveMcps) {
    args.push('--approve-mcps');
  }

  if (input.trust) {
    args.push('--trust');
  }

  if (input.continue) {
    args.push('--continue');
  }

  args.push(input.prompt);

  return { binary, args };
}

export async function runCursor(input: CursorAgentInput): Promise<RunResult> {
  const { binary, args } = buildCursorArgs(input);
  return executeCommand({
    binary,
    args,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
  });
}
