import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { RunResult } from './types.js';

export function resolveBinary(binaryName: string): string | null {
  // If absolute or explicit relative path
  if (path.isAbsolute(binaryName) || binaryName.startsWith('./') || binaryName.startsWith('../')) {
    return fs.existsSync(binaryName) ? binaryName : null;
  }

  const homedir = os.homedir();
  const searchPaths: string[] = [];

  if (process.env.PATH) {
    searchPaths.push(...process.env.PATH.split(path.delimiter));
  }

  // Common locations on macOS/Linux for CLI agents
  const fallbackPaths = [
    path.join(homedir, '.local', 'bin'),
    path.join(homedir, '.opencode', 'bin'),
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/usr/bin',
    '/bin',
  ];

  for (const p of fallbackPaths) {
    if (!searchPaths.includes(p)) {
      searchPaths.push(p);
    }
  }

  const isWindows = process.platform === 'win32';
  const extensions = isWindows ? ['.exe', '.cmd', '.bat', ''] : [''];

  for (const dir of searchPaths) {
    for (const ext of extensions) {
      const fullPath = path.join(dir, binaryName + ext);
      try {
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          if (stats.isFile()) {
            return fullPath;
          }
        }
      } catch {
        // Skip inaccessible paths
      }
    }
  }

  return null;
}

export interface ExecuteOptions {
  binary: string;
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  input?: string;
}

export async function executeCommand(options: ExecuteOptions): Promise<RunResult> {
  const { binary, args, cwd = process.cwd(), env = process.env, timeoutMs = 300_000, input } = options;

  const resolvedBinary = resolveBinary(binary);
  if (!resolvedBinary) {
    throw new Error(
      `Executable '${binary}' was not found in system PATH or standard binary locations.\n` +
      `Please ensure '${binary}' is installed and accessible.`
    );
  }

  return new Promise<RunResult>((resolve, reject) => {
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;

    const child = spawn(resolvedBinary, args, {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let timeoutTimer: NodeJS.Timeout | undefined;
    if (timeoutMs > 0) {
      timeoutTimer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 3000);
      }, timeoutMs);
    }

    if (input && child.stdin) {
      child.stdin.write(input);
      child.stdin.end();
    } else if (child.stdin) {
      child.stdin.end();
    }

    child.stdout.on('data', (data: Buffer) => {
      stdoutBuffer += data.toString('utf-8');
    });

    child.stderr.on('data', (data: Buffer) => {
      stderrBuffer += data.toString('utf-8');
    });

    child.on('error', (err) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      reject(err);
    });

    child.on('close', (code) => {
      if (timeoutTimer) clearTimeout(timeoutTimer);

      if (timedOut) {
        reject(
          new Error(
            `Execution of '${binary}' timed out after ${timeoutMs}ms.\n` +
            `Output before timeout:\n${stdoutBuffer}\n${stderrBuffer}`
          )
        );
        return;
      }

      resolve({
        stdout: stdoutBuffer,
        stderr: stderrBuffer,
        exitCode: code,
        command: resolvedBinary,
        args,
      });
    });
  });
}
