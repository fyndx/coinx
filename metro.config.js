const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withUniwindConfig } = require('uniwind/metro'); 

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);
// Add wasm asset support
config.resolver.assetExts.push('wasm');

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

// Add sql asset support
config.resolver.sourceExts.push("sql");

// Ensure 'web' is in platforms so Metro resolves .web.ts / .web.js files
if (!config.resolver.platforms) {
  config.resolver.platforms = [];
}
if (!config.resolver.platforms.includes('web')) {
  config.resolver.platforms.push('web');
}

// Fix: tslib/modules/index.js is an ESM re-export that Metro loads in a CJS
// context, causing `tslib.default` to be undefined. Force all `tslib` imports
// to the plain CJS entry point instead.
const _originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return { filePath: require.resolve('tslib/tslib.js'), type: 'sourceFile' };
  }
  if (_originalResolveRequest) {
    return _originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withUniwindConfig(config, { 
  cssEntryFile: './global.css',
  dtsFile: './src/uniwind-types.d.ts',
  polyfills: { 
    rem: 14,
  },
});

