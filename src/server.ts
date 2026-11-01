import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ServerConfig, ToolName } from './types.js';
import { isToolEnabled, ALL_TOOL_NAMES } from './config.js';
import { AGENT_DEFINITIONS } from './agents/index.js';
import { claudeInputSchema } from './agents/claude.js';
import { antigravityInputSchema } from './agents/antigravity.js';
import { cursorInputSchema } from './agents/cursor.js';
import { codexInputSchema } from './agents/codex.js';
import { opencodeInputSchema } from './agents/opencode.js';

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer({
    name: 'agent-delegate-mcp',
    version: '1.0.0',
  });

  const registeredTools: string[] = [];
  const disabledTools: string[] = [];

  for (const toolName of ALL_TOOL_NAMES) {
    if (!isToolEnabled(toolName, config)) {
      disabledTools.push(toolName);
      continue;
    }

    registeredTools.push(toolName);

    switch (toolName) {
      case 'delegate_claude': {
        const def = AGENT_DEFINITIONS[toolName];
        server.tool(
          def.name,
          def.description,
          claudeInputSchema,
          async (args) => {
            return handleAgentExecution(toolName, () =>
              def.run({
                ...args,
                timeoutMs: args.timeoutMs ?? config.defaultTimeoutMs,
              })
            );
          }
        );
        break;
      }
      case 'delegate_antigravity': {
        const def = AGENT_DEFINITIONS[toolName];
        server.tool(
          def.name,
          def.description,
          antigravityInputSchema,
          async (args) => {
            return handleAgentExecution(toolName, () =>
              def.run({
                ...args,
                timeoutMs: args.timeoutMs ?? config.defaultTimeoutMs,
              })
            );
          }
        );
        break;
      }
      case 'delegate_cursor': {
        const def = AGENT_DEFINITIONS[toolName];
        server.tool(
          def.name,
          def.description,
          cursorInputSchema,
          async (args) => {
            return handleAgentExecution(toolName, () =>
              def.run({
                ...args,
                timeoutMs: args.timeoutMs ?? config.defaultTimeoutMs,
              })
            );
          }
        );
        break;
      }
      case 'delegate_codex': {
        const def = AGENT_DEFINITIONS[toolName];
        server.tool(
          def.name,
          def.description,
          codexInputSchema,
          async (args) => {
            return handleAgentExecution(toolName, () =>
              def.run({
                ...args,
                timeoutMs: args.timeoutMs ?? config.defaultTimeoutMs,
              })
            );
          }
        );
        break;
      }
      case 'delegate_opencode': {
        const def = AGENT_DEFINITIONS[toolName];
        server.tool(
          def.name,
          def.description,
          opencodeInputSchema,
          async (args) => {
            return handleAgentExecution(toolName, () =>
              def.run({
                ...args,
                timeoutMs: args.timeoutMs ?? config.defaultTimeoutMs,
              })
            );
          }
        );
        break;
      }
    }
  }

  // Diagnostic log to stderr so it does not interfere with MCP stdio protocol
  console.error(
    `[agent-delegate-mcp] Initialized. Enabled tools: [${registeredTools.join(', ')}]. Disabled tools: [${disabledTools.join(', ')}]`
  );

  return server;
}

async function handleAgentExecution(
  toolName: ToolName,
  runner: () => Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    command: string;
    args: string[];
  }>
) {
  try {
    const result = await runner();
    const stdout = result.stdout.trim();
    const stderr = result.stderr.trim();

    if (result.exitCode !== 0) {
      let errorDetails = `Tool ${toolName} failed with exit code ${result.exitCode}.\nCommand: ${result.command} ${result.args.join(' ')}`;
      if (stderr) {
        errorDetails += `\n\nStderr:\n${stderr}`;
      }
      if (stdout) {
        errorDetails += `\n\nStdout:\n${stdout}`;
      }
      return {
        content: [{ type: 'text' as const, text: errorDetails }],
        isError: true,
      };
    }

    let output = stdout;
    if (stderr && !stdout) {
      output = stderr;
    } else if (stderr && stdout) {
      output = `${stdout}\n\n[Diagnostic stderr]:\n${stderr}`;
    }

    if (!output) {
      output = `Command executed successfully with no output.\nCommand: ${result.command} ${result.args.join(' ')}`;
    }

    return {
      content: [{ type: 'text' as const, text: output }],
    };
  } catch (err: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Execution error in ${toolName}: ${err?.message || String(err)}`,
        },
      ],
      isError: true,
    };
  }
}
