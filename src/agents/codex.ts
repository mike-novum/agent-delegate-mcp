import { z } from 'zod';
import { CodexAgentInput, RunResult } from '../types.js';
import { executeCommand, resolveBinary } from '../runner.js';

export const codexInputSchema = {
  prompt: z.string().describe('The prompt / instructions for Codex CLI agent'),
  model: z.string().optional().describe('Model to use for Codex execution'),
  effort: z
    .enum(['low', 'medium', 'high'])
    .or(z.string())
    .optional()
    .describe('Reasoning effort level for the model (e.g. low, medium, high)'),
  sandbox: z
    .enum(['read-only', 'workspace-write', 'danger-full-access'])
    .optional()
    .describe('Sandbox policy for executing shell commands'),
  dangerouslyBypassApprovalsAndSandbox: z
    .boolean()
    .optional()
    .describe('Skip confirmation prompts and execute commands without sandboxing'),
  cd: z.string().optional().describe('Working root directory for the agent'),
  json: z.boolean().optional().describe('Print events as JSONL'),
  ephemeral: z.boolean().optional().describe('Run without persisting session files to disk'),
  cwd: z.string().optional().describe('Working directory to launch the process in'),
  timeoutMs: z.number().optional().describe('Execution timeout in milliseconds'),
};

export function buildCodexArgs(input: CodexAgentInput): { binary: string; args: string[] } {
  const hasCodex = resolveBinary('codex') !== null;
  const binary = hasCodex ? 'codex' : 'npx';
  const args: string[] = hasCodex ? ['exec'] : ['-y', '@openai/codex', 'exec'];

  if (input.model) {
    args.push('-m', input.model);
  }

  if (input.effort) {
    args.push('-c', `model_reasoning_effort="${input.effort}"`);
  }

  if (input.sandbox) {
    args.push('-s', input.sandbox);
  }

  if (input.dangerouslyBypassApprovalsAndSandbox) {
    args.push('--dangerously-bypass-approvals-and-sandbox');
  }

  if (input.cd) {
    args.push('-C', input.cd);
  }

  if (input.json) {
    args.push('--json');
  }

  if (input.ephemeral) {
    args.push('--ephemeral');
  }

  // Ensure non-interactive clean output
  args.push('--color', 'never');

  args.push(input.prompt);

  return { binary, args };
}

export async function runCodex(input: CodexAgentInput): Promise<RunResult> {
  const { binary, args } = buildCodexArgs(input);
  return executeCommand({
    binary,
    args,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
  });
}
