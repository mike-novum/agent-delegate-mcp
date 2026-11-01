import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { createServer } from './server.js';

async function main() {
  const config = loadConfig(process.argv.slice(2), process.env);
  const server = createServer(config);
  const transport = new StdioServerTransport();

  process.on('SIGINT', async () => {
    console.error('[agent-delegate-mcp] Received SIGINT, shutting down...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('[agent-delegate-mcp] Received SIGTERM, shutting down...');
    await server.close();
    process.exit(0);
  });

  await server.connect(transport);
}

main().catch((err) => {
  console.error('[agent-delegate-mcp] Fatal error:', err);
  process.exit(1);
});
