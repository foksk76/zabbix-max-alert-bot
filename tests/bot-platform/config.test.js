const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  createBotPlatformConfig,
  createLiveRuntimeConfig,
  CONFIG_VALIDATION_ERROR_CODE,
  TRANSPORT_NOT_IMPLEMENTED_ERROR_CODE,
  WEBHOOK_NOT_IMPLEMENTED_MESSAGE
} = require('../../src/bot-platform/core/config');

const envExamplePath = path.join(__dirname, '../../examples/bot-platform/env.example');

test('createBotPlatformConfig uses safe defaults when env is empty', () => {
  const config = createBotPlatformConfig({});

  assert.equal(config.moduleName, 'config');
  assert.equal(config.status, 'available');
  assert.equal(config.maxApiUrl, '');
  assert.equal(config.maxBotToken, '');
  assert.equal(config.httpProxy, '');
  assert.equal(config.logLevel, 'info');
  assert.equal(config.maxTransportMode, 'long_polling');
  assert.equal(config.maxPollLimit, 100);
  assert.equal(config.maxPollTimeoutSeconds, 30);
  assert.deepEqual(config.maxPollTypes, ['message_created', 'bot_started', 'bot_added']);
});

test('createBotPlatformConfig reads environment overrides', () => {
  const config = createBotPlatformConfig({
    MAX_API_URL: 'https://synthetic.example/messages',
    MAX_BOT_TOKEN: 'synthetic-bot-token',
    MAX_HTTP_PROXY: 'http://synthetic-proxy:3128',
    MAX_LOG_LEVEL: 'debug',
    MAX_TRANSPORT_MODE: 'webhook',
    MAX_POLL_LIMIT: '7',
    MAX_POLL_TIMEOUT_SECONDS: '3',
    MAX_POLL_TYPES: 'message_created'
  });

  assert.equal(config.maxApiUrl, 'https://synthetic.example/messages');
  assert.equal(config.maxBotToken, 'synthetic-bot-token');
  assert.equal(config.httpProxy, 'http://synthetic-proxy:3128');
  assert.equal(config.logLevel, 'debug');
  assert.equal(config.maxTransportMode, 'webhook');
  assert.equal(config.maxPollLimit, 7);
  assert.equal(config.maxPollTimeoutSeconds, 3);
  assert.deepEqual(config.maxPollTypes, ['message_created']);
});

test('createBotPlatformConfig rejects invalid transport modes', () => {
  assert.throws(
    () => createBotPlatformConfig({ MAX_TRANSPORT_MODE: 'poll' }),
    /Invalid MAX_TRANSPORT_MODE value: poll/
  );
});

test('createBotPlatformConfig rejects invalid poll values', () => {
  assert.throws(
    () => createBotPlatformConfig({ MAX_POLL_LIMIT: '0' }),
    /Invalid MAX_POLL_LIMIT value: 0/
  );
  assert.throws(
    () => createBotPlatformConfig({ MAX_POLL_TIMEOUT_SECONDS: '91' }),
    /Invalid MAX_POLL_TIMEOUT_SECONDS value: 91/
  );
});

test('createLiveRuntimeConfig returns a webhook not-implemented result', () => {
  const config = createLiveRuntimeConfig({
    MAX_TRANSPORT_MODE: 'webhook'
  });

  assert.equal(config.mode, 'webhook');
  assert.equal(config.error.code, TRANSPORT_NOT_IMPLEMENTED_ERROR_CODE);
  assert.equal(config.error.message, WEBHOOK_NOT_IMPLEMENTED_MESSAGE);
  assert.equal(config.error.details, undefined);
});

test('createLiveRuntimeConfig validates required live env values for long polling', () => {
  assert.throws(
    () => createLiveRuntimeConfig({
      MAX_TRANSPORT_MODE: 'long_polling',
      MAX_BOT_TOKEN: 'synthetic-bot-token'
    }),
    (error) => {
      assert.equal(error.code, CONFIG_VALIDATION_ERROR_CODE);
      assert.equal(error.message, 'Invalid MAX live runtime configuration');
      assert.deepEqual(error.details, { missing: ['MAX_API_URL'] });
      return true;
    }
  );
});

test('createLiveRuntimeConfig returns a validated long polling config', () => {
  const config = createLiveRuntimeConfig({
    MAX_TRANSPORT_MODE: 'long_polling',
    MAX_API_URL: 'https://synthetic.example/messages',
    MAX_BOT_TOKEN: 'synthetic-bot-token',
    MAX_HTTP_PROXY: 'http://synthetic-proxy:3128',
    MAX_LOG_LEVEL: 'debug',
    MAX_POLL_LIMIT: '7',
    MAX_POLL_TIMEOUT_SECONDS: '3',
    MAX_POLL_TYPES: 'message_created'
  });

  assert.equal(config.mode, 'long_polling');
  assert.equal(config.maxApiUrl, 'https://synthetic.example/messages');
  assert.equal(config.maxBotToken, 'synthetic-bot-token');
  assert.equal(config.httpProxy, 'http://synthetic-proxy:3128');
  assert.equal(config.logLevel, 'debug');
  assert.equal(config.maxTransportMode, 'long_polling');
  assert.equal(config.maxPollLimit, 7);
  assert.equal(config.maxPollTimeoutSeconds, 3);
  assert.deepEqual(config.maxPollTypes, ['message_created']);
});

test('env.example stays synthetic and secret-free', () => {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');

  assert.match(envExample, /MAX_API_URL=<synthetic-max-api-url>/);
  assert.match(envExample, /MAX_BOT_TOKEN=<synthetic-bot-token>/);
  assert.match(envExample, /MAX_LOG_LEVEL=info/);
  assert.match(envExample, /MAX_TRANSPORT_MODE=long_polling/);
  assert.doesNotMatch(envExample, /https?:\/\//i);
  assert.doesNotMatch(envExample, /Bearer\s+/i);
});
