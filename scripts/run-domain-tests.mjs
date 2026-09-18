import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function collect(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...collect(path));
    else if (name.endsWith('.node.test.ts')) files.push(path);
  }
  return files.sort();
}

const files = collect('src');
if (files.length === 0) {
  console.error('No dependency-free domain tests found.');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', '--experimental-strip-types', ...files], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
