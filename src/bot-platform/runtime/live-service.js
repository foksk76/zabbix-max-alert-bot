'use strict';

const { spawnSync } = require('node:child_process');

const { createSafeLogger } = require('../core');
const { createLongPollingService } = require('./long-polling');
const { formatRuntimeLogLine } = require('./log-format');
const { createLiveRuntimeConfig } = require('../core/config');
const { createIdentityUpdateProcessor } = require('../core/live-pipeline');
const { createMaxInboundUpdatesClient, createMaxOutboundClient } = require('../transports/max');

const moduleName = 'live-service';

function createLiveBotPlatformService(environment = process.env, options = {}) {
  const runtimeConfig = createLiveRuntimeConfig(environment);

  if (runtimeConfig.mode === 'webhook') {
    throw runtimeConfig.error;
  }

  const logger = createLiveLogger(options.logger, runtimeConfig);
  const httpClient = options.httpClient || createNativeFetchHttpClient({
    fetchBinary: options.fetchBinary
  });
  const outboundApiUrl = buildLiveMessagesApiUrl(runtimeConfig.maxApiUrl);
  const inboundClient = options.inboundClient || createMaxInboundUpdatesClient({
    apiUrl: runtimeConfig.maxApiUrl,
    token: runtimeConfig.maxBotToken,
    httpClient,
    networkEnabled: true,
    limit: runtimeConfig.maxPollLimit,
    timeoutSeconds: runtimeConfig.maxPollTimeoutSeconds,
    types: runtimeConfig.maxPollTypes,
    logger
  });
  let pendingMarker = null;
  const outboundClient = options.outboundClient || createMaxOutboundClient({
    apiUrl: outboundApiUrl,
    token: runtimeConfig.maxBotToken,
    httpClient,
    networkEnabled: true,
    logger
  });
  const processUpdate = typeof options.processUpdate === 'function'
    ? options.processUpdate
    : createIdentityUpdateProcessor({ outboundClient });
  const pollUpdates = typeof options.pollUpdates === 'function'
    ? options.pollUpdates
    : async () => {
        const result = await inboundClient.poll();
        pendingMarker = result.marker;
        return result.updates;
      };
  const service = createLongPollingService({
    autoStart: false,
    pollUpdates,
    processUpdate,
    intervalMs: options.intervalMs,
    maxCycles: options.maxCycles,
    sleep: options.sleep,
    onCycleSuccess() {
      if (pendingMarker !== null && inboundClient && typeof inboundClient.ack === 'function') {
        inboundClient.ack(pendingMarker);
        pendingMarker = null;
      }
    },
    logger
  });
  const liveService = {
    moduleName,
    status: 'available',
    mode: 'long_polling',
    runtimeMode: 'live',
    networkEnabled: true,
    runtimeConfig,
    inboundClient,
    outboundClient,
    service,
    start() {
      logger.info('live MAX Identity Bot service starting', {
        mode: 'long_polling',
        networkEnabled: true
      });
      service.start();
      logger.info('live MAX Identity Bot service started', {
        mode: 'long_polling',
        networkEnabled: true,
        intervalMs: service.intervalMs
      });
      return liveService;
    },
    stop() {
      const state = service.stop();
      logger.info('live MAX Identity Bot service stopped', {
        mode: 'long_polling',
        polls: state.polls,
        updates: state.updates,
        results: state.results.length
      });
      return state;
    },
    get loopPromise() {
      return service.loopPromise;
    },
    get state() {
      return service.state;
    }
  };

  return liveService;
}

function createLiveLogger(logger, runtimeConfig) {
  return createSafeLogger({
    config: runtimeConfig,
    write(entry) {
      const target = logger && typeof logger === 'object' ? logger : console;
      const method = typeof target[entry.level] === 'function'
        ? entry.level
        : 'log';

      if (target === console) {
        target[method](formatRuntimeLogLine(entry.message, entry.context));
        return;
      }

      target[method](entry.message, entry.context);
    }
  });
}

function createNativeFetchHttpClient(options = {}) {
  const fetchBinary = typeof options.fetchBinary === 'string' && options.fetchBinary.trim()
    ? options.fetchBinary.trim()
    : process.execPath;

  return {
    get(request) {
      return runFetchRequest(fetchBinary, request);
    },
    post(request) {
      return runFetchRequest(fetchBinary, request);
    }
  };
}

function buildLiveMessagesApiUrl(apiUrl) {
  const baseUrl = typeof apiUrl === 'string' && apiUrl.trim()
    ? apiUrl.trim()
    : 'https://platform-api2.max.ru';

  return new URL('/messages', ensureTrailingSlash(baseUrl)).toString();
}

function runFetchRequest(fetchBinary, request) {
  const childScript = [
    "const fs = require('node:fs');",
    '(async () => {',
    "  const request = JSON.parse(fs.readFileSync(0, 'utf8'));",
    '  const response = await fetch(request.url, {',
    '    method: request.method,',
    '    headers: request.headers,',
    '    body: request.body === undefined ? undefined : JSON.stringify(request.body)',
    '  });',
    '  const rawBody = await response.text();',
    '  let body = null;',
    '  if (rawBody) {',
    '    try {',
    '      body = JSON.parse(rawBody);',
    '    } catch (error) {',
    '      body = rawBody;',
    '    }',
    '  }',
    '  process.stdout.write(JSON.stringify({',
    '    statusCode: response.status,',
    '    body',
    '  }));',
    '})().catch((error) => {',
    '  const payload = {',
    "    message: error && error.message ? error.message : 'fetch failure'",
    '  };',
    "  if (error && error.cause && typeof error.cause === 'object') {",
    '    payload.cause = {',
    "      code: typeof error.cause.code === 'string' ? error.cause.code : undefined,",
    "      message: typeof error.cause.message === 'string' ? error.cause.message : undefined,",
    "      hostname: typeof error.cause.hostname === 'string' ? error.cause.hostname : undefined",
    '    };',
    '  }',
    '  process.stderr.write(JSON.stringify(payload));',
    '  process.exit(1);',
    '});'
  ].join('\n');

  const result = spawnSync(fetchBinary, ['-e', childScript], {
    input: JSON.stringify(request),
    encoding: 'utf8'
  });

  if (result.error) {
    const error = new Error(`Live HTTP request failed: ${result.error.message}`);
    error.cause = {
      code: result.error.code,
      message: result.error.message
    };
    throw error;
  }

  if (result.status !== 0) {
    throw createFetchTransportError(result.stderr);
  }

  if (typeof result.stdout !== 'string' || result.stdout.trim() === '') {
    throw new Error('Live HTTP request returned an empty response');
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error('Live HTTP request returned invalid JSON');
  }
}

function createFetchTransportError(stderr) {
  const raw = typeof stderr === 'string' && stderr.trim()
    ? stderr.trim()
    : '';

  if (!raw) {
    return new Error('Live HTTP request failed');
  }

  try {
    const payload = JSON.parse(raw);
    const error = new Error(typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim()
      : 'Live HTTP request failed');

    if (payload.cause && typeof payload.cause === 'object') {
      error.cause = {
        code: typeof payload.cause.code === 'string' ? payload.cause.code : undefined,
        message: typeof payload.cause.message === 'string' ? payload.cause.message : undefined,
        hostname: typeof payload.cause.hostname === 'string' ? payload.cause.hostname : undefined
      };
    }

    return error;
  } catch (error) {
    return new Error(raw);
  }
}

function ensureTrailingSlash(apiUrl) {
  return apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
}

function createLiveServiceShutdownHandlers(liveService, io = { stdout: process.stdout }) {
  const stop = () => {
    liveService.stop();
  };

  const handlers = {
    SIGINT() {
      io.stdout.write('Stopping live MAX Identity Bot after SIGINT\n');
      stop();
    },
    SIGTERM() {
      io.stdout.write('Stopping live MAX Identity Bot after SIGTERM\n');
      stop();
    }
  };

  process.once('SIGINT', handlers.SIGINT);
  process.once('SIGTERM', handlers.SIGTERM);

  return handlers;
}

module.exports = {
  moduleName,
  createLiveBotPlatformService,
  createLiveServiceShutdownHandlers,
  createNativeFetchHttpClient,
  buildLiveMessagesApiUrl
};
