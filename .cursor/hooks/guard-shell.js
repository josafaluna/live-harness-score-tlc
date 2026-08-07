/**
 * Gate hook for beforeShellExecution.
 * Denies known destructive commands; asks when the payload cannot be interpreted.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {{ permission: 'allow' | 'deny' | 'ask', user_message?: string, agent_message?: string }} GateDecision
 */

/**
 * @param {string} command
 * @returns {boolean}
 */
function isDeniedCommand(command) {
  if (/\bnpm\s+publish\b/i.test(command)) {
    return true;
  }

  if (/\bgit\s+push\b[^\n]*--force\b/i.test(command)) {
    return true;
  }

  if (/\bgit\s+reset\b[^\n]*--hard\b/i.test(command)) {
    return true;
  }

  // Recursive unix-style removal of filesystem root or home.
  if (
    /\brm\b/i.test(command) &&
    (/(?:^|\s)-[A-Za-z]*r[A-Za-z]*(?:\s|$)/i.test(command) ||
      /(?:^|\s)--recursive(?:\s|$)/i.test(command)) &&
    /(?:^|\s)(?:\/(?=\s|$)|\/\*(?=\s|$)|~(?=\/|\s|$)|\$HOME(?=\/|\s|$)|\$\{HOME\}(?=\/|\s|$))/i.test(
      command,
    )
  ) {
    return true;
  }

  // Destructive PowerShell Remove-Item against root or home.
  if (
    /\bRemove-Item\b/i.test(command) &&
    /-(?:Recurse|r)\b/i.test(command) &&
    /-(?:Force|f)\b/i.test(command) &&
    /(?:[A-Za-z]:\\(?:\s|$)|(?:^|\s)\/(?:\s|$)|(?:^|\s)~(?:\s|$|\\)|\$HOME\b|\$\{HOME\}|\$env:USERPROFILE|\$env:HOME)/i.test(
      command,
    )
  ) {
    return true;
  }

  return false;
}

/**
 * @param {string} rawInput
 * @returns {GateDecision}
 */
export function evaluateShellGate(rawInput) {
  let payload;
  try {
    payload = JSON.parse(rawInput);
  } catch {
    return {
      permission: 'ask',
      user_message: 'Hook payload could not be parsed as JSON.',
      agent_message:
        'beforeShellExecution payload was not valid JSON. Ask the user before running the command.',
    };
  }

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      permission: 'ask',
      user_message: 'Hook payload is not a JSON object.',
      agent_message:
        'beforeShellExecution payload was not a JSON object. Ask the user before running the command.',
    };
  }

  if (typeof payload.command !== 'string') {
    return {
      permission: 'ask',
      user_message: 'Hook payload is missing a string command.',
      agent_message:
        'beforeShellExecution payload did not include a string command. Ask the user before running.',
    };
  }

  if (isDeniedCommand(payload.command)) {
    return {
      permission: 'deny',
      user_message: 'Blocked destructive command.',
      agent_message: `Blocked by gate hook: ${payload.command}`,
    };
  }

  return { permission: 'allow' };
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  process.stdout.write(JSON.stringify(evaluateShellGate(raw)));
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === entry) {
  main();
}
