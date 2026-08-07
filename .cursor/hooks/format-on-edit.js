/**
 * Feedback hook for afterFileEdit.
 * Formats the edited file with the local Biome CLI when the extension is supported.
 * Best-effort only — CI remains the source of truth.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const BIOME_ENTRY = join(REPO_ROOT, 'node_modules', '@biomejs', 'biome', 'bin', 'biome');
const SUPPORTED_EXTENSIONS = new Set(['.js', '.json', '.mjs', '.cjs']);

/**
 * @param {unknown} payload
 * @returns {string | null}
 */
function readEditedPath(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const record = /** @type {Record<string, unknown>} */ (payload);
  const filePath = record.file_path ?? record.filePath;
  return typeof filePath === 'string' && filePath.length > 0 ? filePath : null;
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isSupportedFile(filePath) {
  return SUPPORTED_EXTENSIONS.has(extname(filePath).toLowerCase());
}

/**
 * @param {string} filePath
 * @returns {void}
 */
function formatWithBiome(filePath) {
  if (!existsSync(BIOME_ENTRY)) {
    return;
  }

  execFileSync(process.execPath, [BIOME_ENTRY, 'format', '--write', filePath], {
    cwd: REPO_ROOT,
    stdio: 'ignore',
  });
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const filePath = readEditedPath(payload);
    if (filePath !== null && isSupportedFile(filePath)) {
      try {
        formatWithBiome(filePath);
      } catch {
        // Formatting is guidance only; never fail the edit loop.
      }
    }
  } catch {
    // Malformed feedback payloads are ignored.
  }

  process.stdout.write('{}');
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === entry) {
  main();
}
