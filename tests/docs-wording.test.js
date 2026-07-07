const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scannedRoots = ['README.md', 'docs', '.agents', 'tasks'];
const blockedPattern = /Отдел|SOC|NOC/;

function listMarkdownAndTextFiles(target) {
  const absoluteTarget = path.join(root, target);

  if (!fs.existsSync(absoluteTarget)) {
    return [];
  }

  const stat = fs.statSync(absoluteTarget);

  if (stat.isFile()) {
    return [absoluteTarget];
  }

  const result = [];
  const stack = [absoluteTarget];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }

      if (/\.(md|txt)$/i.test(entry.name)) {
        result.push(absolutePath);
      }
    }
  }

  return result.sort();
}

test('documentation does not use old organization-specific wording', () => {
  const matches = [];

  for (const scannedRoot of scannedRoots) {
    for (const file of listMarkdownAndTextFiles(scannedRoot)) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (blockedPattern.test(line)) {
          matches.push(`${path.relative(root, file)}:${index + 1}: ${line}`);
        }
      });
    }
  }

  assert.deepEqual(matches, [], `found old organization-specific wording:\n${matches.join('\n')}`);
});

test('README references project acceptance document without duplicating acceptance checklist', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

  assert.match(readme, /docs\/project-acceptance\.md/);
  assert.doesNotMatch(readme, /Критерии завершения первого этапа\n\n- \[ \]/);
});
