import { z } from 'zod';
import { AntigravityAgentInput, RunResult } from '../types.js';
import { executeCommand } from '../runner.js';

export const antigravityInputSchema = {
  prompt: z.string().describe('The prompt / instructions for Antigravity CLI (agy)'),
  model: z.string().optional().describe('Model for the CLI session'),
  effort: z
    .enum(['low', 'medium', 'high', 'xhigh', 'max'])
    .or(z.string())
    .optional()
    .describe('Reasoning effort for the session (low, medium, high, xhigh, max)'),
  dangerouslySkipPermissions: z
    .boolean()
    .optional()
    .describe('Auto-approve all tool permission requests without prompting'),
  mode: z
    .enum(['accept-edits', 'auto', 'plan'])
    .optional()
    .describe('Agent execution mode (accept-edits, auto, plan)'),
  addDir: z.array(z.string()).optional().describe('Add a directory to the workspace'),
  conversation: z.string().optional().describe('Resume a previous conversation by ID'),
  continue: z.boolean().optional().describe('Continue the most recent conversation'),
  outputFormat: z
    .enum(['text', 'json', 'stream-json'])
    .optional()
    .describe('Output format for print mode (default: text)'),
  cwd: z.string().optional().describe('Working directory to run agy in'),
  timeoutMs: z.number().optional().describe('Execution timeout in milliseconds'),
};

export function buildAntigravityArgs(input: AntigravityAgentInput): string[] {
  const args: string[] = ['-p', input.prompt];

  if (input.model) {
    args.push('--model', input.model);
  }

  if (input.effort) {
    args.push('--effort', input.effort);
  }

  if (input.dangerouslySkipPermissions) {
    args.push('--dangerously-skip-permissions');
  }

  if (input.mode) {
    args.push('--mode', input.mode);
  }

  if (input.addDir && input.addDir.length > 0) {
    for (const dir of input.addDir) {
      args.push('--add-dir', dir);
    }
  }

  if (input.conversation) {
    args.push('--conversation', input.conversation);
  }

  if (input.continue) {
    args.push('--continue');
  }

  if (input.outputFormat) {
    args.push('--output-format', input.outputFormat);
  }

  return args;
}

export async function runAntigravity(input: AntigravityAgentInput): Promise<RunResult> {
  const args = buildAntigravityArgs(input);
  return executeCommand({
    binary: 'agy',
    args,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
  });
}
