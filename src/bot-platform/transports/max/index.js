'use strict';

const { normalizeMaxEvent } = require('./event-normalizer');

const moduleName = 'max-transport';

function createMaxTransport() {
  return {
    moduleName,
    status: 'scaffold',
    capabilities: {
      inboundWebhook: 'pending',
      outboundClient: 'pending',
      eventNormalizer: 'available'
    },
    networkEnabled: false
  };
}

module.exports = {
  moduleName,
  createMaxTransport,
  normalizeMaxEvent
};
