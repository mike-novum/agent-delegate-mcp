import * as esbuild from 'esbuild';
import fs from 'node:fs';

async function build() {
  console.log('Building agent-delegate-mcp bundle with esbuild...');

  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    banner: {
      js: '#!/usr/bin/env node\nimport { createRequire as __createRequire } from "node:module";\nconst require = __createRequire(import.meta.url);\n',
    },
    sourcemap: true,
    logLevel: 'info',
  });

  // Make the output executable
  fs.chmodSync('dist/index.js', 0o755);
  fs.copyFileSync('dist/index.js', 'index.js');
  fs.chmodSync('index.js', 0o755);
  console.log('Build completed: dist/index.js and index.js (executable)');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
