const test = require('node:test');
const assert = require('node:assert/strict');

const { createMaxOutboundClient, buildMaxOutboundPayload } = require('../../src/bot-platform/transports/max');

function createIdentityResponse() {
  return {
    kind: 'identity',
    recipient: {
      kind: 'user'
    },
    zabbix: {
      recipientType: 'user_id',
      to: '<synthetic-user-id>'
    },
    text: 'Use these Zabbix recipient parameters:\nRecipientType: user_id\nTo: <synthetic-user-id>'
  };
}

test('buildMaxOutboundPayload creates a minimal payload from identity response', () => {
  const payload = buildMaxOutboundPayload(createIdentityResponse());

  assert.deepEqual(payload, {
    recipientType: 'user_id',
    to: '<synthetic-user-id>',
    text: 'Use these Zabbix recipient parameters:\nRecipientType: user_id\nTo: <synthetic-user-id>'
  });
});

test('buildMaxOutboundPayload rejects invalid response', () => {
  assert.throws(
    () => buildMaxOutboundPayload({}),
    /Invalid identity response/
  );
});

test('createMaxOutboundClient returns dry-run request without raw fields', () => {
  const client = createMaxOutboundClient({
    apiUrl: 'https://synthetic.example/messages'
  });
  const result = client.send(createIdentityResponse());

  assert.equal(result.mode, 'dry-run');
  assert.equal(result.networkEnabled, false);
  assert.equal(result.request.method, 'POST');
  assert.equal(result.request.url, 'https://synthetic.example/messages');
  assert.equal(result.request.headers['Content-Type'], 'application/json');
  assert.deepEqual(result.request.body, {
    recipientType: 'user_id',
    to: '<synthetic-user-id>',
    text: 'Use these Zabbix recipient parameters:\nRecipientType: user_id\nTo: <synthetic-user-id>'
  });
  assert.equal(result.request.body.raw, undefined);
  assert.equal(result.payload.raw, undefined);
});

test('createMaxOutboundClient does not log raw token values', () => {
  const entries = [];
  const client = createMaxOutboundClient({
    apiUrl: 'https://synthetic.example/messages',
    token: 'synthetic-secret-token',
    logger: {
      info(entry, context) {
        entries.push({ entry, context });
      }
    }
  });

  client.send(createIdentityResponse());

  const serialized = JSON.stringify(entries);
  assert.doesNotMatch(serialized, /synthetic-secret-token/);
});
