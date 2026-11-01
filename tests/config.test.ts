import { describe, it, expect } from 'vitest';
import { loadConfig, isToolEnabled, normalizeToolName, parseList } from '../src/config.js';

describe('config', () => {
  it('normalizes tool names properly', () => {
    expect(normalizeToolName('claude')).toBe('delegate_claude');
    expect(normalizeToolName('delegate_claude')).toBe('delegate_claude');
    expect(normalizeToolName('CURSOR')).toBe('delegate_cursor');
    expect(normalizeToolName('delegate_antigravity')).toBe('delegate_antigravity');
  });

  it('parses comma-separated lists', () => {
    expect(parseList('claude, cursor, delegate_codex')).toEqual([
      'delegate_claude',
      'delegate_cursor',
      'delegate_codex',
    ]);
    expect(parseList(undefined)).toEqual([]);
    expect(parseList('')).toEqual([]);
  });

  it('loads config from argv disable-tools', () => {
    const config = loadConfig(['--disable-tools', 'claude,cursor'], {});
    expect(config.disabledTools).toEqual(['delegate_claude', 'delegate_cursor']);
    expect(isToolEnabled('delegate_claude', config)).toBe(false);
    expect(isToolEnabled('delegate_cursor', config)).toBe(false);
    expect(isToolEnabled('delegate_codex', config)).toBe(true);
  });

  it('loads config from argv disabled-tools with equals', () => {
    const config = loadConfig(['--disabled-tools=antigravity,opencode'], {});
    expect(config.disabledTools).toEqual(['delegate_antigravity', 'delegate_opencode']);
    expect(isToolEnabled('delegate_antigravity', config)).toBe(false);
    expect(isToolEnabled('delegate_opencode', config)).toBe(false);
    expect(isToolEnabled('delegate_claude', config)).toBe(true);
  });

  it('loads config from argv enable-tools', () => {
    const config = loadConfig(['--enable-tools', 'claude'], {});
    expect(config.enabledTools).toEqual(['delegate_claude']);
    expect(isToolEnabled('delegate_claude', config)).toBe(true);
    expect(isToolEnabled('delegate_cursor', config)).toBe(false);
  });

  it('loads config from environment variables', () => {
    const config = loadConfig([], {
      DISABLED_TOOLS: 'cursor,codex',
      DEFAULT_TIMEOUT_MS: '60000',
    });
    expect(config.disabledTools).toEqual(['delegate_cursor', 'delegate_codex']);
    expect(config.defaultTimeoutMs).toBe(60000);
    expect(isToolEnabled('delegate_cursor', config)).toBe(false);
    expect(isToolEnabled('delegate_claude', config)).toBe(true);
  });

  it('loads config from AGENT_DELEGATE_CONFIG JSON', () => {
    const config = loadConfig([], {
      AGENT_DELEGATE_CONFIG: JSON.stringify({
        disabledTools: ['opencode'],
        defaultTimeoutMs: 120000,
      }),
    });
    expect(config.disabledTools).toEqual(['delegate_opencode']);
    expect(config.defaultTimeoutMs).toBe(120000);
    expect(isToolEnabled('delegate_opencode', config)).toBe(false);
  });
});
