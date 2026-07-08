'use strict';

const moduleName = 'max-outbound-client';

function createMaxOutboundClient(options = {}) {
  const logger = createLogger(options.logger);
  const apiUrl = typeof options.apiUrl === 'string' && options.apiUrl.trim()
    ? options.apiUrl.trim()
    : '<synthetic-max-api-url>';

  return {
    moduleName,
    status: 'available',
    networkEnabled: false,
    send(response) {
      const payload = buildMaxOutboundPayload(response);
      const request = {
        method: 'POST',
        url: apiUrl,
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      };

      logger.info('prepared MAX outbound dry-run request', {
        apiUrl,
        recipientType: payload.recipientType,
        to: payload.to
      });

      return {
        mode: 'dry-run',
        networkEnabled: false,
        request,
        payload
      };
    }
  };
}

function buildMaxOutboundPayload(response) {
  const identityResponse = response && response.kind === 'identity' ? response : null;

  if (!identityResponse || !identityResponse.zabbix) {
    throw new Error('Invalid identity response');
  }

  const recipientType = identityResponse.zabbix.recipientType;
  const to = identityResponse.zabbix.to;

  if (!recipientType || !to) {
    throw new Error('Missing MAX outbound payload fields');
  }

  return {
    recipientType,
    to,
    text: typeof identityResponse.text === 'string' ? identityResponse.text : ''
  };
}

function createLogger(logger) {
  if (!logger || typeof logger.info !== 'function') {
    return {
      info() {}
    };
  }

  return logger;
}

module.exports = {
  moduleName,
  createMaxOutboundClient,
  buildMaxOutboundPayload
};
