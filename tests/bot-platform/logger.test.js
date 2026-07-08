const test = require('node:test');
const assert = require('node:assert/strict');

const { createSafeLogger } = require('../../src/bot-platform/core/logger');

test('createSafeLogger masks explicit secret values in text and nested objects', () => {
  const entries = [];
  const logger = createSafeLogger({
    secrets: ['super-secret-token'],
    write: (entry) => entries.push(entry)
  });

  logger.info('using super-secret-token', {
    token: 'super-secret-token',
    nested: {
      password: 'super-secret-token'
    },
    list: ['public', 'super-secret-token'],
    public: 'visible'
  });

  assert.equal(entries.length, 1);
  assert.equal(entries[0].moduleName, 'logger');
  assert.equal(entries[0].status, 'available');
  assert.equal(entries[0].level, 'info');
  assert.equal(entries[0].message, 'using [redacted]');
  assert.equal(entries[0].context.token, '[redacted]');
  assert.equal(entries[0].context.nested.password, '[redacted]');
  assert.equal(entries[0].context.list[1], '[redacted]');
  assert.equal(entries[0].context.public, 'visible');
});

test('createSafeLogger masks sensitive keys even without explicit secret values', () => {
  const entries = [];
  const logger = createSafeLogger({
    write: (entry) => entries.push(entry)
  });

  logger.error('request failed', {
    authorization: 'Bearer synthetic-token',
    apiKey: 'synthetic-api-key',
    public: 'visible'
  });

  assert.equal(entries[0].level, 'error');
  assert.equal(entries[0].context.authorization, '[redacted]');
  assert.equal(entries[0].context.apiKey, '[redacted]');
  assert.equal(entries[0].context.public, 'visible');
});

test('createSafeLogger extracts secrets from config values', () => {
  const entries = [];
  const logger = createSafeLogger({
    config: {
      maxBotToken: 'config-token'
    },
    write: (entry) => entries.push(entry)
  });

  logger.warn('sending config-token to transport', {
    token: 'config-token',
    public: 'visible'
  });

  assert.equal(entries[0].level, 'warn');
  assert.equal(entries[0].message, 'sending [redacted] to transport');
  assert.equal(entries[0].context.token, '[redacted]');
  assert.equal(entries[0].context.public, 'visible');
});
