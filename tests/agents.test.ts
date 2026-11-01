import { describe, it, expect } from 'vitest';
import { buildClaudeArgs } from '../src/agents/claude.js';
import { buildAntigravityArgs } from '../src/agents/antigravity.js';
import { buildCursorArgs, formatCursorModel } from '../src/agents/cursor.js';
import { buildCodexArgs } from '../src/agents/codex.js';
import { buildOpenCodeArgs } from '../src/agents/opencode.js';

describe('agents arguments builder', () => {
  describe('claude', () => {
    it('builds basic claude args', () => {
      const args = buildClaudeArgs({ prompt: 'Solve issue #42' });
      expect(args).toEqual(['-p', 'Solve issue #42']);
    });

    it('builds full claude args', () => {
      const args = buildClaudeArgs({
        prompt: 'Refactor module',
        model: 'claude-3-7-sonnet',
        effort: 'high',
        dangerouslySkipPermissions: true,
        addDir: ['/extra/path', '/other/path'],
        outputFormat: 'json',
        appendSystemPrompt: 'Be concise',
        continue: true,
      });

      expect(args).toEqual([
        '-p',
        'Refactor module',
        '--model',
        'claude-3-7-sonnet',
        '--effort',
        'high',
        '--dangerously-skip-permissions',
        '--add-dir',
        '/extra/path',
        '--add-dir',
        '/other/path',
        '--output-format',
        'json',
        '--append-system-prompt',
        'Be concise',
        '--continue',
      ]);
    });
  });

  describe('antigravity', () => {
    it('builds basic antigravity args', () => {
      const args = buildAntigravityArgs({ prompt: 'Implement feature' });
      expect(args).toEqual(['-p', 'Implement feature']);
    });

    it('builds full antigravity args', () => {
      const args = buildAntigravityArgs({
        prompt: 'Check architecture',
        model: 'gemini-2.5-flash',
        effort: 'medium',
        dangerouslySkipPermissions: true,
        mode: 'plan',
        addDir: ['/some/dir'],
        conversation: 'conv-12345',
        continue: true,
        outputFormat: 'json',
      });

      expect(args).toEqual([
        '-p',
        'Check architecture',
        '--model',
        'gemini-2.5-flash',
        '--effort',
        'medium',
        '--dangerously-skip-permissions',
        '--mode',
        'plan',
        '--add-dir',
        '/some/dir',
        '--conversation',
        'conv-12345',
        '--continue',
        '--output-format',
        'json',
      ]);
    });
  });

  describe('cursor', () => {
    it('formats cursor model with effort', () => {
      expect(formatCursorModel(undefined, undefined)).toBeUndefined();
      expect(formatCursorModel('sonnet-4-thinking', undefined)).toBe('sonnet-4-thinking');
      expect(formatCursorModel('sonnet-4-thinking', 'high')).toBe('sonnet-4-thinking[effort=high]');
      expect(formatCursorModel('sonnet-4-thinking[context=1m]', 'high')).toBe(
        'sonnet-4-thinking[context=1m,effort=high]'
      );
      expect(formatCursorModel(undefined, 'high')).toBe('default[effort=high]');
    });

    it('builds cursor args with options', () => {
      const { args } = buildCursorArgs({
        prompt: 'Write tests',
        model: 'gpt-5',
        effort: 'high',
        mode: 'ask',
        force: true,
        workspace: '/my/workspace',
        outputFormat: 'stream-json',
        approveMcps: true,
        trust: true,
        continue: true,
      });

      expect(args).toContain('-p');
      expect(args).toContain('--model');
      expect(args).toContain('gpt-5[effort=high]');
      expect(args).toContain('--mode');
      expect(args).toContain('ask');
      expect(args).toContain('-f');
      expect(args).toContain('--workspace');
      expect(args).toContain('/my/workspace');
      expect(args).toContain('--output-format');
      expect(args).toContain('stream-json');
      expect(args).toContain('--approve-mcps');
      expect(args).toContain('--trust');
      expect(args).toContain('--continue');
      expect(args[args.length - 1]).toBe('Write tests');
    });
  });

  describe('codex', () => {
    it('builds codex args with model and effort override', () => {
      const { args } = buildCodexArgs({
        prompt: 'Fix memory leak',
        model: 'o3',
        effort: 'high',
        sandbox: 'workspace-write',
        dangerouslyBypassApprovalsAndSandbox: true,
        cd: '/my/root',
        json: true,
        ephemeral: true,
      });

      expect(args).toContain('exec');
      expect(args).toContain('-m');
      expect(args).toContain('o3');
      expect(args).toContain('-c');
      expect(args).toContain('model_reasoning_effort="high"');
      expect(args).toContain('-s');
      expect(args).toContain('workspace-write');
      expect(args).toContain('--dangerously-bypass-approvals-and-sandbox');
      expect(args).toContain('-C');
      expect(args).toContain('/my/root');
      expect(args).toContain('--json');
      expect(args).toContain('--ephemeral');
      expect(args).toContain('--color');
      expect(args).toContain('never');
      expect(args[args.length - 1]).toBe('Fix memory leak');
    });
  });

  describe('opencode', () => {
    it('builds opencode args', () => {
      const args = buildOpenCodeArgs({
        prompt: 'Generate documentation',
        model: 'anthropic/claude-3-7-sonnet',
        effort: 'max',
        auto: true,
        dir: '/project',
        format: 'json',
        agent: 'developer',
        title: 'Doc generator',
        session: 'sess-abc',
        continue: true,
        thinking: true,
      });

      expect(args).toEqual([
        'run',
        '-m',
        'anthropic/claude-3-7-sonnet',
        '--variant',
        'max',
        '--auto',
        '--dir',
        '/project',
        '--format',
        'json',
        '--agent',
        'developer',
        '--title',
        'Doc generator',
        '-s',
        'sess-abc',
        '-c',
        '--thinking',
        'Generate documentation',
      ]);
    });
  });
});
