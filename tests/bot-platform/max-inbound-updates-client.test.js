const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createMaxInboundUpdatesClient,
  buildMaxInboundUpdatesRequest,
  MAX_API_ERROR_CODE
} = require('../../src/bot-platform/transports/max');

function createSyntheticUpdate() {
  return {
    update_type: 'message_created',
    marker: 1,
    chat: {
      type: 'dialog',
      id: '<synthetic-chat-id>'
    },
    sender: {
      id: '<synthetic-user-id>'
    },
    message: {
      id: '<synthetic-message-id>',
      text: 'show my recipient id'
    }
  };
}

test('buildMaxInboundUpdatesRequest creates a live GET request with marker and types', () => {
  const request = buildMaxInboundUpdatesRequest({
    apiUrl: 'https://platform-api2.max.ru',
    token: 'synthetic-secret-token',
    limit: 100,
    timeoutSeconds: 30,
    marker: 99,
    types: ['message_created', 'bot_started']
  });

  assert.equal(request.method, 'GET');
  assert.equal(request.url, 'https://platform-api2.max.ru/updates?limit=100&timeout=30&types=message_created%2Cbot_started&marker=99');
  assert.equal(request.headers.Authorization, 'synthetic-secret-token');
});

test('createMaxInboundUpdatesClient polls live updates and advances marker only after ack', async () => {
  const requests = [];
  const client = createMaxInboundUpdatesClient({
    apiUrl: 'https://platform-api2.max.ru',
    token: 'synthetic-secret-token',
    httpClient: {
      get(request) {
        requests.push(request);

        if (requests.length === 1) {
          return {
            statusCode: 200,
            body: {
              updates: [createSyntheticUpdate()],
              marker: 42
            }
          };
        }

        return {
          statusCode: 200,
          body: {
            updates: [],
            marker: null
          }
        };
      }
    }
  });

  const first = await client.poll();

  assert.equal(first.mode, 'live');
  assert.equal(first.networkEnabled, true);
  assert.equal(first.updates.length, 1);
  assert.equal(first.marker, 42);
  assert.equal(client.state.marker, null);
  assert.equal(client.ack(first.marker), 42);
  assert.equal(client.state.marker, 42);
  assert.equal(requests[0].url, 'https://platform-api2.max.ru/updates?limit=100&timeout=30&types=message_created%2Cbot_started%2Cbot_added');
  assert.equal(requests[0].headers.Authorization, 'synthetic-secret-token');

  const second = await client.poll();

  assert.equal(requests[1].url, 'https://platform-api2.max.ru/updates?limit=100&timeout=30&types=message_created%2Cbot_started%2Cbot_added&marker=42');

  assert.equal(second.mode, 'live');
  assert.equal(second.updates.length, 0);
  assert.equal(second.marker, null);
  assert.equal(client.ack(second.marker), null);
  assert.equal(client.state.marker, null);
});

test('createMaxInboundUpdatesClient accepts empty update response', async () => {
  const client = createMaxInboundUpdatesClient({
    apiUrl: 'https://platform-api2.max.ru',
    token: 'synthetic-secret-token',
    httpClient: {
      get() {
        return {
          statusCode: 200,
          body: {
            updates: [],
            marker: null
          }
        };
      }
    }
  });

  const result = await client.poll();

  assert.equal(result.mode, 'live');
  assert.equal(result.updates.length, 0);
  assert.equal(result.marker, null);
  assert.equal(client.state.marker, null);
});

test('createMaxInboundUpdatesClient normalizes API failures safely', async () => {
  const client = createMaxInboundUpdatesClient({
    apiUrl: 'https://platform-api2.max.ru',
    token: 'synthetic-secret-token',
    httpClient: {
      get() {
        return {
          statusCode: 503,
          body: {
            error: 'synthetic failure'
          }
        };
      }
    }
  });

  await assert.rejects(
    client.poll(),
    (error) => {
      assert.equal(error.code, MAX_API_ERROR_CODE);
      assert.equal(error.message, 'MAX API request failed');
      assert.deepEqual(error.details, { statusCode: 503 });
      return true;
    }
  );
});

test('createMaxInboundUpdatesClient keeps safe transport failure diagnostics', async () => {
  const transportError = new Error('fetch failed');
  transportError.cause = {
    code: 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
    message: 'unable to get local issuer certificate',
    hostname: 'platform-api2.max.ru'
  };
  const client = createMaxInboundUpdatesClient({
    apiUrl: 'https://platform-api2.max.ru',
    token: 'synthetic-secret-token',
    httpClient: {
      get() {
        throw transportError;
      }
    }
  });

  await assert.rejects(
    client.poll(),
    (error) => {
      assert.equal(error.code, MAX_API_ERROR_CODE);
      assert.equal(error.message, 'MAX API request failed');
      assert.deepEqual(error.details, {
        causeCode: 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
        causeMessage: 'unable to get local issuer certificate',
        causeHost: 'platform-api2.max.ru',
        reason: 'transport failure'
      });
      return true;
    }
  );
});

test('createMaxInboundUpdatesClient rejects invalid update payloads safely', async () => {
  const client = createMaxInboundUpdatesClient({
    apiUrl: 'https://platform-api2.max.ru',
    token: 'synthetic-secret-token',
    httpClient: {
      get() {
        return {
          statusCode: 200,
          body: {
            updates: [null],
            marker: 1
          }
        };
      }
    }
  });

  await assert.rejects(
    client.poll(),
    (error) => {
      assert.equal(error.code, MAX_API_ERROR_CODE);
      assert.equal(error.message, 'MAX API request failed');
      assert.equal(error.details.reason, 'invalid updates response');
      return true;
    }
  );
});
