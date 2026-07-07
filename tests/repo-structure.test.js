const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function listFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);

  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const result = [];
  const stack = [absoluteDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(root, absolutePath).replaceAll(path.sep, '/');

      if (entry.isDirectory()) {
        stack.push(absolutePath);
      } else {
        result.push(relativePath);
      }
    }
  }

  return result.sort();
}

test('required project files exist', () => {
  const requiredFiles = [
    'README.md',
    'AGENTS.md',
    '.agents/project-context.md',
    'DEVELOPMENT.md',
    'docs/README.md',
    'docs/project-context.md',
    'docs/project-acceptance.md',
    'docs/documentation-policy.md',
    'docs/decisions/README.md',
    'docs/decisions/ADR-0001-ai-assisted-dev.md',
    'docs/decisions/ADR-0002-use-external-agent-skills.md',
    'docs/decisions/ADR-0003-project-acceptance-and-run-methods.md',
    'docs/decisions/ADR-0004-use-node-policy-tests-and-github-actions.md',
    'docs/zabbix-media-type.md',
    'tasks/plan.md',
    'tasks/todo.md',
    'src/zabbix-media-type/max-webhook.js',
    'package.json',
    '.github/workflows/verify.yml'
  ];

  for (const file of requiredFiles) {
    assert.ok(exists(file), `required file is missing: ${file}`);
  }
});

test('ADR files are stored only in docs/decisions', () => {
  const legacyAdrFiles = listFiles('.agents/adr');
  assert.deepEqual(legacyAdrFiles, [], 'ADR files must not be stored in .agents/adr');
});

test('task files are stored only in tasks', () => {
  const legacyTaskFiles = listFiles('.agents/tasks');
  assert.deepEqual(legacyTaskFiles, [], 'task files must not be stored in .agents/tasks');
});

test('legacy bash repository check is removed', () => {
  assert.equal(exists('scripts/verify-repo.sh'), false, 'scripts/verify-repo.sh must be removed after Node policy tests migration');
});
