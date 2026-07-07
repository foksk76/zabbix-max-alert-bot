const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const fixturesDir = path.join(__dirname, '../../examples/bot-platform');

function readFixture(fileName) {
  const filePath = path.join(fixturesDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function stringify(value) {
  return JSON.stringify(value);
}

function assertSyntheticFixture(fixture) {
  const serialized = stringify(fixture);

  assert.equal(fixture.meta.synthetic, true);
  assert.equal(fixture.meta.realPayload, false);
  assert.equal(fixture.source, 'max');
  assert.ok(serialized.includes('<synthetic-'));
  assert.doesNotMatch(serialized, /Bearer\s+/i);
  assert.doesNotMatch(serialized, /token/i);
  assert.doesNotMatch(serialized, /https?:\/\//i);
  assert.doesNotMatch(serialized, /\b\d{8,}\b/);
}

test('MAX user fixture is present and synthetic', () => {
  const fixture = readFixture('max-inbound-user.fixture.json');

  assert.equal(fixture.event_type, 'message_created');
  assert.equal(fixture.chat.type, 'dialog');
  assert.equal(fixture.sender.type, 'user');
  assert.equal(fixture.sender.id, '<synthetic-user-id>');
  assert.equal(fixture.chat.id, '<synthetic-user-id>');
  assertSyntheticFixture(fixture);
});

test('MAX chat fixture is present and synthetic', () => {
  const fixture = readFixture('max-inbound-chat.fixture.json');

  assert.equal(fixture.event_type, 'message_created');
  assert.equal(fixture.chat.type, 'group');
  assert.equal(fixture.sender.type, 'user');
  assert.equal(fixture.chat.id, '<synthetic-chat-id>');
  assert.equal(fixture.sender.id, '<synthetic-user-id>');
  assertSyntheticFixture(fixture);
});

test('MAX fixtures are documented', () => {
  const readmePath = path.join(fixturesDir, 'README.md');
  const readme = fs.readFileSync(readmePath, 'utf8');

  assert.match(readme, /max-inbound-user\.fixture\.json/);
  assert.match(readme, /max-inbound-chat\.fixture\.json/);
  assert.match(readme, /synthetic/i);
  assert.match(readme, /not real/i);
});
