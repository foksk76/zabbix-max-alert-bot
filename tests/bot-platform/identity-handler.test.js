const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { normalizeMaxEvent } = require('../../src/bot-platform/transports/max');
const {
  handleIdentityEvent
} = require('../../src/bot-platform/plugins/identity/handler');

const fixturesDir = path.join(__dirname, '../../examples/bot-platform');

function readFixture(fileName) {
  const filePath = path.join(fixturesDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('handleIdentityEvent accepts normalized user event', () => {
  const event = normalizeMaxEvent(readFixture('max-inbound-user.fixture.json'));
  const response = handleIdentityEvent(event);

  assert.equal(response.kind, 'identity');
  assert.equal(response.recipient.kind, 'user');
  assert.equal(response.zabbix.recipientType, 'user_id');
  assert.equal(response.zabbix.to, '<synthetic-user-id>');
});

test('handleIdentityEvent accepts normalized chat event', () => {
  const event = normalizeMaxEvent(readFixture('max-inbound-chat.fixture.json'));
  const response = handleIdentityEvent(event);

  assert.equal(response.kind, 'identity');
  assert.equal(response.recipient.kind, 'chat');
  assert.equal(response.zabbix.recipientType, 'chat_id');
  assert.equal(response.zabbix.to, '<synthetic-chat-id>');
});

test('handleIdentityEvent returns response object without raw event', () => {
  const event = normalizeMaxEvent(readFixture('max-inbound-user.fixture.json'));
  const response = handleIdentityEvent(event);

  assert.equal(typeof response.text, 'string');
  assert.equal(response.raw, undefined);
  assert.doesNotMatch(response.text, /<synthetic-message-id>/);
});

test('handleIdentityEvent rejects invalid event', () => {
  assert.throws(
    () => handleIdentityEvent({}),
    /Invalid identity event/
  );
});
