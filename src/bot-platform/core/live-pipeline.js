'use strict';

const { normalizeMaxEvent } = require('../transports/max/event-normalizer');
const { createEventRouter } = require('./event-router');
const { handleIdentityEvent } = require('../plugins/identity');
const { createMaxOutboundClient } = require('../transports/max/outbound-client');

function createIdentityUpdateProcessor(options = {}) {
  const router = options.router || createEventRouter({
    identity: handleIdentityEvent
  });
  const outboundClient = options.outboundClient || createMaxOutboundClient(options.outboundClientOptions);

  return async function processUpdate(maxPayload) {
    const event = normalizeMaxEvent(maxPayload);
    const response = router.route(event, { route: 'identity' });
    const outbound = await outboundClient.send(response);

    return {
      mode: outbound.mode === 'live' ? 'live' : 'dry-run',
      networkEnabled: outbound.networkEnabled,
      event,
      response,
      outbound
    };
  };
}

module.exports = {
  createIdentityUpdateProcessor
};
