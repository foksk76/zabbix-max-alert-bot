const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { main } = require('../../src/bot-platform/app');

function runMain(fixtureName) {
  let stdout = '';
  let stderr = '';

  const exitCode = main([path.join('examples/bot-platform', fixtureName)], {
    stdout: {
      write(chunk) {
        stdout += chunk;
      }
    },
    stderr: {
      write(chunk) {
        stderr += chunk;
      }
    }
  });

  return {
    exitCode,
    stdout,
    stderr
  };
}

test('CLI dry-run prints a safe result for the user fixture', () => {
  const result = runMain('max-inbound-user.fixture.json');

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, '');

  const output = JSON.parse(result.stdout);
  assert.equal(output.mode, 'dry-run');
  assert.equal(output.networkEnabled, false);
  assert.equal(output.response.kind, 'identity');
  assert.equal(output.response.recipient.kind, 'user');
  assert.equal(output.outbound.networkEnabled, false);
  assert.equal(output.outbound.request.body.recipientType, 'user_id');
  assert.equal(output.response.raw, undefined);
});

test('CLI dry-run prints a safe result for the chat fixture', () => {
  const result = runMain('max-inbound-chat.fixture.json');

  assert.equal(result.exitCode, 0);
  assert.equal(result.stderr, '');

  const output = JSON.parse(result.stdout);
  assert.equal(output.mode, 'dry-run');
  assert.equal(output.networkEnabled, false);
  assert.equal(output.response.kind, 'identity');
  assert.equal(output.response.recipient.kind, 'chat');
  assert.equal(output.outbound.networkEnabled, false);
  assert.equal(output.outbound.request.body.recipientType, 'chat_id');
  assert.equal(output.response.raw, undefined);
});
