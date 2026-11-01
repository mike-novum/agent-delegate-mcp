import { z } from 'zod';
import { ClaudeAgentInput, RunResult } from '../types.js';
import { executeCommand } from '../runner.js';

export const claudeInputSchema = {
  prompt: z.string().describe('The prompt / instructions for Claude Code'),
  model: z.string().optional().describe('Model for the session (e.g. claude-3-7-sonnet, claude-3-5-sonnet)'),
  effort: z
    .enum(['low', 'medium', 'high', 'max'])
    .or(z.string())
    .optional()
    .describe('Reasoning effort level (low, medium, high, max)'),
  dangerouslySkipPermissions: z
    .boolean()
    .optional()
    .describe('Bypass all permission checks for automated execution'),
  addDir: z.array(z.string()).optional().describe('Additional directories to allow tool access to'),
  outputFormat: z
    .enum(['text', 'json', 'stream-json'])
    .optional()
    .describe('Output format for non-interactive output (default: text)'),
  appendSystemPrompt: z.string().optional().describe('Append a system prompt to the default system prompt'),
  continue: z.boolean().optional().describe('Continue the most recent conversation in current directory'),
  cwd: z.string().optional().describe('Working directory to run Claude Code in'),
  timeoutMs: z.number().optional().describe('Execution timeout in milliseconds'),
};

export function buildClaudeArgs(input: ClaudeAgentInput): string[] {
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

  if (input.addDir && input.addDir.length > 0) {
    for (const dir of input.addDir) {
      args.push('--add-dir', dir);
    }
  }

  if (input.outputFormat) {
    args.push('--output-format', input.outputFormat);
  }

  if (input.appendSystemPrompt) {
    args.push('--append-system-prompt', input.appendSystemPrompt);
  }

  if (input.continue) {
    args.push('--continue');
  }

  return args;
}

export async function runClaude(input: ClaudeAgentInput): Promise<RunResult> {
  const args = buildClaudeArgs(input);
  return executeCommand({
    binary: 'claude',
    args,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
  });
}
