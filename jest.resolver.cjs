const defaultResolver = require('jest-resolve').defaultResolver;

module.exports = {
  // Use default resolver but handle .js extensions for .ts files
  async resolve(request, options) {
    // If request is for a .js file but we're in TypeScript context
    if (request.endsWith('.js')) {
      const tsRequest = request.replace(/\.js$/, '.ts');
      try {
        return defaultResolver(tsRequest, options);
      } catch (e) {
        // If .ts file doesn't exist, try original .js request
        return defaultResolver(request, options);
      }
    }
    return defaultResolver(request, options);
  },
};
