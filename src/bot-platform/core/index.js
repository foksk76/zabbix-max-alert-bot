'use strict';

const { createEventRouter } = require('./event-router');
const { runMaxIdentityDryRun } = require('./dry-run-pipeline');
const { createBotPlatformConfig } = require('./config');
const { createSafeLogger } = require('./logger');

const moduleName = 'core';

function createCore() {
  return {
    moduleName,
    status: 'scaffold',
    components: {
      config: 'available',
      logger: 'available',
      eventRouter: 'available',
      pluginLoader: 'pending',
      dryRunPipeline: 'available'
    }
  };
}

module.exports = {
  moduleName,
  createCore,
  createBotPlatformConfig,
  createSafeLogger,
  createEventRouter,
  runMaxIdentityDryRun
};
