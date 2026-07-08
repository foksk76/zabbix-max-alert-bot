'use strict';

const moduleName = 'config';
const DEFAULT_LOG_LEVEL = 'info';

function createBotPlatformConfig(environment = process.env) {
  return {
    moduleName,
    status: 'available',
    maxApiUrl: readEnvValue(environment, 'MAX_API_URL'),
    maxBotToken: readEnvValue(environment, 'MAX_BOT_TOKEN'),
    httpProxy: readEnvValue(environment, 'MAX_HTTP_PROXY'),
    logLevel: readEnvValue(environment, 'MAX_LOG_LEVEL', DEFAULT_LOG_LEVEL)
  };
}

function readEnvValue(environment, key, fallback = '') {
  const value = environment && typeof environment[key] === 'string'
    ? environment[key].trim()
    : '';

  return value || fallback;
}

module.exports = {
  moduleName,
  createBotPlatformConfig
};
