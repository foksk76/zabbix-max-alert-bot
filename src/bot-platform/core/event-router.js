'use strict';

function createEventRouter(routeHandlers = {}) {
  return {
    route(event, options = {}) {
      const routeName = options.route || 'identity';
      const handler = routeHandlers[routeName];

      if (typeof handler !== 'function') {
        throw new Error('No route handler available');
      }

      return handler(event);
    }
  };
}

module.exports = {
  createEventRouter
};
