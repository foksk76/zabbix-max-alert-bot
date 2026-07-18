'use strict';

const { normalizeIngestEvent } = require('./ingest');

function getNormalizer(sourceName) {
  return normalizeIngestEvent;
}

module.exports = {
  normalizeIngestEvent,
  getNormalizer
};
