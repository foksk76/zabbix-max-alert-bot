const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createConsoleRuntimeLogger,
  formatRuntimeLogLine
} = require('../../src/bot-platform/runtime');

test('formatRuntimeLogLine renders compact one-line context', () => {
  const line = formatRuntimeLogLine('long polling cycle failed', {
    error: 'MAX API request failed',
    code: 'MAX_API_ERROR',
    details: {
      reason: 'transport failure',
      causeCode: 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
      causeMessage: 'unable to get local issuer certificate',
      causeHost: 'platform-api2.max.ru'
    },
    ignored: 'not needed'
  });

  assert.equal(
    line,
    'long polling cycle failed error="MAX API request failed" code=MAX_API_ERROR reason="transport failure" causeCode=UNABLE_TO_GET_ISSUER_CERT_LOCALLY causeMessage="unable to get local issuer certificate" causeHost=platform-api2.max.ru'
  );
  assert.doesNotMatch(line, /ignored/);
  assert.doesNotMatch(line, /details/);
  assert.doesNotMatch(line, /{/);
});

test('createConsoleRuntimeLogger writes one argument per log entry', () => {
  const calls = [];
  const logger = createConsoleRuntimeLogger({
    info(line, extra) {
      calls.push({ line, extra });
    }
  });

  logger.info('long polling update processed', {
    polls: 2,
    updates: 1,
    results: 1
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].line, 'long polling update processed polls=2 updates=1 results=1');
  assert.equal(calls[0].extra, undefined);
});
