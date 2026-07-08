'use strict';

const { createCore, runMaxIdentityDryRun } = require('./core');
const { createMaxTransport } = require('./transports/max');
const { createIdentityPlugin } = require('./plugins/identity');

function createBotPlatformApp() {
  return {
    name: 'max-identity-bot-platform',
    status: 'scaffold',
    core: createCore(),
    transports: {
      max: createMaxTransport()
    },
    plugins: {
      identity: createIdentityPlugin()
    },
    pipeline: {
      dryRun: 'available'
    }
  };
}

module.exports = {
  createBotPlatformApp,
  runMaxIdentityDryRun
};
