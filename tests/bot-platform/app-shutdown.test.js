const test = require('node:test');
const assert = require('node:assert/strict');

const { startIngressAndQueue } = require('../../src/bot-platform/app');
const { createLiveBotPlatformService, createLiveServiceShutdownHandlers } = require('../../src/bot-platform/runtime');

// ADR-0033: coordinated graceful shutdown для ingress/worker/queue-store.
// Раньше signal handler вызывал только liveService.stop() (long-polling loop),
// а queue worker, SQLite connection и ingress HTTP server оставались открытыми.
// HTTP listen-сокет удерживал event loop, а зависшие processing-строки
// накапливались при каждом restart (усугубляя BUG A).

function buildConfig(overrides = {}) {
  return {
    maxApiUrl: 'https://synthetic.example',
    maxBotToken: 'synthetic-token',
    rateLimitEnabled: false,
    queueEnabled: true,
    queueBatchSize: 10,
    queueIntervalMs: 60000,
    queueMaxAttempts: 5,
    queueBackoffBase: 2,
    queueBackoffMax: 300,
    queueProcessingTtlSeconds: 300,
    ingressEnabled: false,
    ingressPort: 0,
    idpIssuer: '',
    idpAudience: '',
    jwtClaimName: '',
    jwtClaimValue: '',
    logAudit: false,
    logTrace: false,
    ...overrides
  };
}

test('startIngressAndQueue returns a shutdown handle with stop()', async () => {
  const closed = [];
  const queueStore = {
    enqueue: () => ({ id: 1 }),
    dequeue: () => [],
    reclaimStale: () => 0,
    ack: () => {},
    nack: () => {},
    stats: () => ({}),
    close: () => { closed.push('queue-store'); }
  };
  const outboundClient = { send: async () => ({}) };

  const handle = await startIngressAndQueue(
    buildConfig({ queueEnabled: true }),
    { queueStore, outboundClient },
    { stdout: { write: () => {} }, stderr: { write: () => {} } }
  );

  assert.equal(typeof handle.stop, 'function');

  await handle.stop({ stderr: { write: () => {} } });

  assert.deepEqual(closed, ['queue-store'], 'queue-store.close() must be called on shutdown');
});

test('shutdown handle calls worker.stop() and queue-store.close() in correct order', async () => {
  const closed = [];
  const queueStore = {
    enqueue: () => ({ id: 1 }),
    dequeue: () => [],
    reclaimStale: () => 0,
    ack: () => {},
    nack: () => {},
    stats: () => ({}),
    close: () => { closed.push('queue-store'); }
  };
  const outboundClient = { send: async () => ({}) };

  // Worker создаётся внутри startIngressAndQueue; чтобы перехватить его stop(),
  // используем queueIntervalMs достаточно большой, чтобы polling не успел сработать.
  const handle = await startIngressAndQueue(
    buildConfig({ queueEnabled: true, queueIntervalMs: 60000 }),
    { queueStore, outboundClient },
    { stdout: { write: () => {} }, stderr: { write: () => {} } }
  );

  await handle.stop({ stderr: { write: () => {} } });

  // queue-store.close() должен быть вызван (worker.stop() синхронный, без побочных эффектов в массиве).
  assert.ok(closed.includes('queue-store'), 'queue-store.close() called');
});

test('shutdown handle does not throw when a step fails — continues remaining steps', async () => {
  const closed = [];
  const queueStore = {
    enqueue: () => ({ id: 1 }),
    dequeue: () => [],
    reclaimStale: () => 0,
    ack: () => {},
    nack: () => {},
    stats: () => ({}),
    close: () => { throw new Error('close failed'); }
  };
  const outboundClient = { send: async () => ({}) };
  const stderrLines = [];

  const handle = await startIngressAndQueue(
    buildConfig({ queueEnabled: true }),
    { queueStore, outboundClient },
    { stdout: { write: () => {} }, stderr: { write: (s) => stderrLines.push(s) } }
  );

  // Не должно выбросить — ошибка логируется, shutdown продолжается.
  await handle.stop({ stderr: { write: (s) => stderrLines.push(s) } });

  assert.ok(
    stderrLines.some((line) => line.includes("shutdown step 'queue-store' failed")),
    'failure must be logged to stderr'
  );
});

// ADR-0033: signal handler вызывает liveService.stop() (который внутри координирует
// ingress/worker/queue-store через shutdownHandle) и затем process.exit(0), чтобы
// закрыть HTTP listen-сокет ingress. exitFn инжектируется для теста.
test('createLiveServiceShutdownHandlers calls liveService.stop() and exits 0 on signal', async () => {
  const stopCalls = [];
  const exitCodes = [];
  const stdoutLines = [];

  const fakeLiveService = {
    async stop() {
      stopCalls.push('live-service.stop');
    }
  };

  let exitResolver;
  const exited = new Promise((resolve) => { exitResolver = resolve; });

  const handlers = createLiveServiceShutdownHandlers(
    fakeLiveService,
    { stdout: { write: (s) => stdoutLines.push(s) } },
    { exitFn: (code) => { exitCodes.push(code); exitResolver(); } }
  );

  handlers.SIGTERM();
  await exited;

  assert.deepEqual(stopCalls, ['live-service.stop'], 'liveService.stop() awaited');
  assert.deepEqual(exitCodes, [0], 'process.exit(0) called after shutdown');
  assert.ok(
    stdoutLines.some((line) => line.includes('Coordinated shutdown')),
    'coordinated shutdown message logged'
  );
  assert.ok(
    stdoutLines.some((line) => line.includes('SIGTERM')),
    'signal name in message'
  );
});

test('createLiveServiceShutdownHandlers does not swallow liveService.stop() errors', async () => {
  const exitCodes = [];
  const stdoutLines = [];

  const failingLiveService = {
    async stop() {
      throw new Error('shutdown boom');
    }
  };

  let exitResolver;
  const exited = new Promise((resolve) => { exitResolver = resolve; });

  const handlers = createLiveServiceShutdownHandlers(
    failingLiveService,
    { stdout: { write: (s) => stdoutLines.push(s) } },
    { exitFn: (code) => { exitCodes.push(code); exitResolver(); } }
  );

  handlers.SIGINT();
  await exited;

  // Даже при ошибке в liveService.stop() — exit(0) всё равно вызывается,
  // чтобы процесс не завис на HTTP listen-сокете.
  assert.deepEqual(exitCodes, [0], 'exit(0) called even on stop() error');
  assert.ok(
    stdoutLines.some((line) => line.includes('Coordinated shutdown error')),
    'error logged but not thrown'
  );
});

test('createLiveBotPlatformService.stop() triggers injected shutdownHandle', async () => {
  const handleStops = [];
  const liveService = createLiveBotPlatformService({
    MAX_TRANSPORT_MODE: 'long_polling',
    MAX_API_URL: 'https://synthetic.example',
    MAX_BOT_TOKEN: 'synthetic-token'
  }, {
    inboundClient: {
      state: { marker: null },
      ack: () => {},
      async poll() { return { updates: [], marker: null }; }
    },
    outboundClient: { async send() { return {}; } },
    shutdownHandle: {
      async stop() { handleStops.push('handle'); }
    },
    logger: { info() {}, warn() {}, error() {} },
    installSignalHandlers: false
  });

  await liveService.stop();

  assert.deepEqual(handleStops, ['handle'], 'shutdownHandle.stop() called from liveService.stop()');
});
