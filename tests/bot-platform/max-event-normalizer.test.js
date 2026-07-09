const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  normalizeMaxEvent
} = require('../../src/bot-platform/transports/max/event-normalizer');

const fixturesDir = path.join(__dirname, '../../examples/bot-platform');

function readFixture(fileName) {
  const filePath = path.join(fixturesDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('normalizeMaxEvent maps user fixture to internal user recipient event', () => {
  const fixture = readFixture('max-inbound-user.fixture.json');
  const event = normalizeMaxEvent(fixture);

  assert.equal(event.source, 'max');
  assert.equal(event.recipient.kind, 'user');
  assert.equal(event.recipient.value, '<synthetic-user-id>');
  assert.equal(event.message.text, 'show my recipient id');
  assert.equal(event.raw.kind, 'reference');
  assert.equal(event.raw.value, '<synthetic-message-id>');
});

test('normalizeMaxEvent maps chat fixture to internal chat recipient event', () => {
  const fixture = readFixture('max-inbound-chat.fixture.json');
  const event = normalizeMaxEvent(fixture);

  assert.equal(event.source, 'max');
  assert.equal(event.recipient.kind, 'chat');
  assert.equal(event.recipient.value, '<synthetic-chat-id>');
  assert.equal(event.message.text, 'show this chat recipient id');
  assert.equal(event.raw.kind, 'reference');
  assert.equal(event.raw.value, '<synthetic-message-id>');
});

test('normalizeMaxEvent maps official personal message_created shape to sender user', () => {
  const event = normalizeMaxEvent({
    update_type: 'message_created',
    message: {
      id: '<synthetic-message-id>',
      sender: {
        user_id: 1001
      },
      recipient: {
        chat_id: 2002
      },
      body: {
        text: 'show my recipient id'
      }
    }
  });

  assert.equal(event.recipient.kind, 'user');
  assert.equal(event.recipient.value, '1001');
  assert.equal(event.message.text, 'show my recipient id');
  assert.equal(event.raw.value, '<synthetic-message-id>');
});

test('normalizeMaxEvent maps official chat message_created shape to chat recipient', () => {
  const event = normalizeMaxEvent({
    update_type: 'message_created',
    chat_id: 2002,
    message: {
      id: '<synthetic-message-id>',
      sender: {
        user_id: 1001
      },
      recipient: {
        chat_id: 2002
      },
      body: {
        text: 'show this chat recipient id'
      }
    }
  });

  assert.equal(event.recipient.kind, 'chat');
  assert.equal(event.recipient.value, '2002');
  assert.equal(event.message.text, 'show this chat recipient id');
});

test('normalizeMaxEvent maps official bot_started shape to user recipient', () => {
  const event = normalizeMaxEvent({
    update_type: 'bot_started',
    timestamp: 1,
    user: {
      user_id: 1001
    }
  });

  assert.equal(event.recipient.kind, 'user');
  assert.equal(event.recipient.value, '1001');
  assert.equal(event.message.text, '');
});

test('normalizeMaxEvent maps official bot_added shape to chat recipient', () => {
  const event = normalizeMaxEvent({
    update_type: 'bot_added',
    timestamp: 1,
    chat_id: 2002,
    user: {
      user_id: 1001
    },
    is_channel: false
  });

  assert.equal(event.recipient.kind, 'chat');
  assert.equal(event.recipient.value, '2002');
  assert.equal(event.message.text, '');
});

test('normalizeMaxEvent rejects missing payload', () => {
  assert.throws(
    () => normalizeMaxEvent(),
    /Invalid MAX inbound event/
  );
});

test('normalizeMaxEvent rejects unsupported chat type', () => {
  assert.throws(
    () => normalizeMaxEvent({
      source: 'max',
      chat: { type: 'unsupported', id: '<synthetic-chat-id>' },
      sender: { type: 'user', id: '<synthetic-user-id>' },
      message: { id: '<synthetic-message-id>', text: 'hello' }
    }),
    /Unsupported MAX chat type/
  );
});

test('normalizeMaxEvent rejects event without recipient value', () => {
  assert.throws(
    () => normalizeMaxEvent({
      source: 'max',
      chat: { type: 'group' },
      sender: { type: 'user', id: '<synthetic-user-id>' },
      message: { id: '<synthetic-message-id>', text: 'hello' }
    }),
    /Missing MAX recipient value/
  );
});

test('normalizeMaxEvent rejects dialog event without sender id', () => {
  assert.throws(
    () => normalizeMaxEvent({
      source: 'max',
      chat: { type: 'dialog', id: '<synthetic-user-id>' },
      sender: { type: 'user' },
      message: { id: '<synthetic-message-id>', text: 'hello' }
    }),
    /Missing MAX recipient value/
  );
});
