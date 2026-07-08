'use strict';

const { normalizeMaxEvent } = require('./event-normalizer');
const { createMaxOutboundClient, buildMaxOutboundPayload } = require('./outbound-client');
const { createMaxInboundWebhookHandler } = require('./inbound-webhook');

const moduleName = 'max-transport';

function createMaxTransport() {
  return {
    moduleName,
    status: 'scaffold',
    capabilities: {
      inboundWebhook: 'available',
      outboundClient: 'available',
      eventNormalizer: 'available'
    },
    networkEnabled: false
  };
}

module.exports = {
  moduleName,
  createMaxTransport,
  normalizeMaxEvent,
  createMaxInboundWebhookHandler,
  createMaxOutboundClient,
  buildMaxOutboundPayload
};
