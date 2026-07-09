'use strict';

const {
  createSyntheticLongPollingSource,
  createLongPollingService,
  runLongPollingCycle
} = require('./long-polling');
const {
  createLiveBotPlatformService,
  createLiveServiceShutdownHandlers,
  createNativeFetchHttpClient
} = require('./live-service');
const {
  createConsoleRuntimeLogger,
  formatRuntimeLogLine
} = require('./log-format');

module.exports = {
  createSyntheticLongPollingSource,
  createLongPollingService,
  runLongPollingCycle,
  createLiveBotPlatformService,
  createLiveServiceShutdownHandlers,
  createNativeFetchHttpClient,
  createConsoleRuntimeLogger,
  formatRuntimeLogLine
};
