import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { evaluateShellGate } from '../.cursor/hooks/guard-shell.js';

const GUARD_SCRIPT = fileURLToPath(new URL('../.cursor/hooks/guard-shell.js', import.meta.url));

/**
 * @param {string} stdin
 * @returns {{ permission: string } & Record<string, unknown>}
 */
function runGate(stdin) {
  const result = spawnSync(process.execPath, [GUARD_SCRIPT], {
    input: stdin,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || 'gate hook exited non-zero');
  return JSON.parse(result.stdout);
}

describe('guard-shell gate', () => {
  describe('allow', () => {
    it('permite comandos comuns via evaluateShellGate', () => {
      assert.deepEqual(evaluateShellGate(JSON.stringify({ command: 'npm test' })), {
        permission: 'allow',
      });
      assert.deepEqual(evaluateShellGate(JSON.stringify({ command: 'git status' })), {
        permission: 'allow',
      });
      assert.deepEqual(evaluateShellGate(JSON.stringify({ command: 'npm run check' })), {
        permission: 'allow',
      });
      assert.deepEqual(evaluateShellGate(JSON.stringify({ command: 'rm -rf ./tmp-build' })), {
        permission: 'allow',
      });
    });

    it('permite comando comum via stdin do script', () => {
      const response = runGate(JSON.stringify({ command: 'npm test' }));
      assert.equal(response.permission, 'allow');
    });
  });

  describe('deny', () => {
    it('nega npm publish', () => {
      const decision = evaluateShellGate(JSON.stringify({ command: 'npm publish' }));
      assert.equal(decision.permission, 'deny');
    });

    it('nega git push --force', () => {
      const decision = evaluateShellGate(
        JSON.stringify({ command: 'git push --force origin main' }),
      );
      assert.equal(decision.permission, 'deny');
    });

    it('nega git reset --hard', () => {
      const decision = evaluateShellGate(JSON.stringify({ command: 'git reset --hard HEAD~1' }));
      assert.equal(decision.permission, 'deny');
    });

    it('nega remoção recursiva de raiz ou home', () => {
      assert.equal(evaluateShellGate(JSON.stringify({ command: 'rm -rf /' })).permission, 'deny');
      assert.equal(evaluateShellGate(JSON.stringify({ command: 'rm -rf ~' })).permission, 'deny');
      assert.equal(
        evaluateShellGate(JSON.stringify({ command: 'rm -rf $HOME' })).permission,
        'deny',
      );
    });

    it('nega Remove-Item destrutivo do PowerShell', () => {
      assert.equal(
        evaluateShellGate(JSON.stringify({ command: 'Remove-Item -Recurse -Force C:\\' }))
          .permission,
        'deny',
      );
      assert.equal(
        evaluateShellGate(JSON.stringify({ command: 'Remove-Item -Force -Recurse $HOME' }))
          .permission,
        'deny',
      );
    });

    it('nega npm publish via stdin do script', () => {
      const response = runGate(JSON.stringify({ command: 'npm publish --access public' }));
      assert.equal(response.permission, 'deny');
    });
  });

  describe('payload malformado', () => {
    it('retorna ask para JSON inválido', () => {
      const decision = evaluateShellGate('{not-json');
      assert.equal(decision.permission, 'ask');
    });

    it('retorna ask quando command está ausente', () => {
      const decision = evaluateShellGate(JSON.stringify({ cwd: '/tmp' }));
      assert.equal(decision.permission, 'ask');
    });

    it('retorna ask quando command não é string', () => {
      const decision = evaluateShellGate(JSON.stringify({ command: 42 }));
      assert.equal(decision.permission, 'ask');
    });

    it('retorna ask via stdin do script para payload inválido', () => {
      const response = runGate('not-json');
      assert.equal(response.permission, 'ask');
    });
  });
});
