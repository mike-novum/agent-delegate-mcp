import { describe, it, expect } from 'vitest';
import { createServer } from '../src/server.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('server', () => {
  it('registers all tools by default', async () => {
    const server = createServer({ disabledTools: [] });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    const client = new Client({ name: 'test-client', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const toolsResponse = await client.listTools();
    const toolNames = toolsResponse.tools.map((t) => t.name);

    expect(toolNames).toContain('delegate_claude');
    expect(toolNames).toContain('delegate_antigravity');
    expect(toolNames).toContain('delegate_cursor');
    expect(toolNames).toContain('delegate_codex');
    expect(toolNames).toContain('delegate_opencode');
    expect(toolNames.length).toBe(5);

    await client.close();
    await server.close();
  });

  it('excludes disabled tools according to configuration', async () => {
    const server = createServer({
      disabledTools: ['delegate_claude', 'delegate_opencode'],
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    const client = new Client({ name: 'test-client', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const toolsResponse = await client.listTools();
    const toolNames = toolsResponse.tools.map((t) => t.name);

    expect(toolNames).not.toContain('delegate_claude');
    expect(toolNames).not.toContain('delegate_opencode');
    expect(toolNames).toContain('delegate_antigravity');
    expect(toolNames).toContain('delegate_cursor');
    expect(toolNames).toContain('delegate_codex');
    expect(toolNames.length).toBe(3);

    await client.close();
    await server.close();
  });

  it('only includes enabled tools when enabledTools is specified', async () => {
    const server = createServer({
      disabledTools: [],
      enabledTools: ['delegate_cursor'],
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    const client = new Client({ name: 'test-client', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const toolsResponse = await client.listTools();
    const toolNames = toolsResponse.tools.map((t) => t.name);

    expect(toolNames).toEqual(['delegate_cursor']);

    await client.close();
    await server.close();
  });
});
