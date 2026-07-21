const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { createMonitorHttpServer } = require('../../src/queue-monitor/http-server');

function get(url, port) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${url}`, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

test('createMonitorHttpServer returns object with start/stop/registerRoute', () => {
  const server = createMonitorHttpServer({ port: 19001 });

  assert.equal(typeof server.start, 'function');
  assert.equal(typeof server.stop, 'function');
  assert.equal(typeof server.registerRoute, 'function');
});

test('server returns 404 for unknown routes', async () => {
  const server = createMonitorHttpServer({ port: 19002 });
  await server.start();

  const res = await get('/unknown', 19002);
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');

  await server.stop();
});

test('server handles registered GET route', async () => {
  const server = createMonitorHttpServer({ port: 19003 });
  server.registerRoute('GET', '/test', () => ({ statusCode: 200, body: { ok: true } }));
  await server.start();

  const res = await get('/test', 19003);
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);

  await server.stop();
});

test('server passes query params to handler', async () => {
  const server = createMonitorHttpServer({ port: 19004 });
  let receivedQuery;
  server.registerRoute('GET', '/query', (ctx) => {
    receivedQuery = ctx.query;
    return { statusCode: 200, body: { query: ctx.query } };
  });
  await server.start();

  const res = await get('/query?window=1h&limit=5', 19004);
  assert.equal(res.status, 200);
  assert.equal(receivedQuery.window, '1h');
  assert.equal(receivedQuery.limit, '5');

  await server.stop();
});

test('server handles handler errors gracefully', async () => {
  const server = createMonitorHttpServer({ port: 19005 });
  server.registerRoute('GET', '/error', () => {
    throw new Error('boom');
  });
  await server.start();

  const res = await get('/error', 19005);
  assert.equal(res.status, 500);
  assert.equal(res.body.error, 'Internal server error');

  await server.stop();
});

test('server returns early when handler returns undefined', async () => {
  const server = createMonitorHttpServer({ port: 19006 });
  let resRef;
  server.registerRoute('GET', '/noop', (ctx) => {
    resRef = ctx.res;
    ctx.res.writeHead(204);
    ctx.res.end();
  });
  await server.start();

  const result = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:19006/noop', (res) => {
      resolve({ status: res.statusCode });
    }).on('error', reject);
  });
  assert.equal(result.status, 204);

  await server.stop();
});

test('stop resolves when server was never started', async () => {
  const server = createMonitorHttpServer({ port: 19007 });
  await server.stop();
});

test('start and stop lifecycle works', async () => {
  const server = createMonitorHttpServer({ port: 19008 });
  await server.start();
  const res = await get('/test', 19008);
  assert.equal(res.status, 404);
  await server.stop();
});

test('server provides reqId in context', async () => {
  const server = createMonitorHttpServer({ port: 19009 });
  let capturedReqId;
  server.registerRoute('GET', '/reqid', (ctx) => {
    capturedReqId = ctx.reqId;
    return { statusCode: 200, body: { reqId: ctx.reqId } };
  });
  await server.start();

  const res = await get('/reqid', 19009);
  assert.equal(res.status, 200);
  assert.equal(typeof capturedReqId, 'string');
  assert.ok(capturedReqId.length > 0);

  await server.stop();
});
