import { z } from 'zod';
import { OpenCodeAgentInput, RunResult } from '../types.js';
import { executeCommand } from '../runner.js';

export const opencodeInputSchema = {
  prompt: z.string().describe('The prompt / instructions for OpenCode CLI agent'),
  model: z.string().optional().describe('Model to use in format provider/model (e.g. anthropic/claude-3-7-sonnet)'),
  effort: z
    .enum(['minimal', 'low', 'medium', 'high', 'max'])
    .or(z.string())
    .optional()
    .describe('Reasoning effort / model variant (e.g. minimal, low, medium, high, max)'),
  auto: z
    .boolean()
    .optional()
    .describe('Auto-approve permissions that are not explicitly denied'),
  dir: z.string().optional().describe('Directory to run OpenCode in'),
  format: z.enum(['default', 'json']).optional().describe('Output format (default or json)'),
  agent: z.string().optional().describe('Agent configuration to use'),
  title: z.string().optional().describe('Title for the session'),
  session: z.string().optional().describe('Session ID to continue'),
  continue: z.boolean().optional().describe('Continue the last session'),
  thinking: z.boolean().optional().describe('Show thinking blocks in output'),
  cwd: z.string().optional().describe('Working directory to launch the process in'),
  timeoutMs: z.number().optional().describe('Execution timeout in milliseconds'),
};

export function buildOpenCodeArgs(input: OpenCodeAgentInput): string[] {
  const args: string[] = ['run'];

  if (input.model) {
    args.push('-m', input.model);
  }

  if (input.effort) {
    args.push('--variant', input.effort);
  }

  if (input.auto) {
    args.push('--auto');
  }

  if (input.dir) {
    args.push('--dir', input.dir);
  }

  if (input.format) {
    args.push('--format', input.format);
  }

  if (input.agent) {
    args.push('--agent', input.agent);
  }

  if (input.title) {
    args.push('--title', input.title);
  }

  if (input.session) {
    args.push('-s', input.session);
  }

  if (input.continue) {
    args.push('-c');
  }

  if (input.thinking) {
    args.push('--thinking');
  }

  args.push(input.prompt);

  return args;
}

export async function runOpenCode(input: OpenCodeAgentInput): Promise<RunResult> {
  const args = buildOpenCodeArgs(input);
  return executeCommand({
    binary: 'opencode',
    args,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
  });
}
