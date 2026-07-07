'use strict';

const moduleName = 'core';

function createCore() {
  return {
    moduleName,
    status: 'scaffold',
    components: {
      config: 'pending',
      logger: 'pending',
      eventRouter: 'pending',
      pluginLoader: 'pending'
    }
  };
}

module.exports = {
  moduleName,
  createCore
};
