const { expo: baseConfig } = require('./app.json');

const PRODUCTION_API_URL = 'https://api.jordannst.dev/api';
const DEVELOPMENT_PACKAGE = 'com.stackhorizon.siaga.dev';
const DEVELOPMENT_SCHEME = 'siaga-dev';

function resolveVariant() {
  if (process.env.APP_VARIANT) {
    return process.env.APP_VARIANT;
  }

  if (process.env.EAS_BUILD_PROFILE === 'development') {
    return 'development';
  }

  return 'production';
}

module.exports = () => {
  const variant = resolveVariant();
  const isDevelopment = variant === 'development';

  const extra = {
    ...baseConfig.extra,
    appVariant: variant,
  };

  if (isDevelopment) {
    delete extra.apiUrl;
  } else {
    extra.apiUrl = process.env.API_URL || PRODUCTION_API_URL;
  }

  return {
    ...baseConfig,
    name: isDevelopment ? 'SIAGA Dev' : baseConfig.name,
    scheme: isDevelopment ? DEVELOPMENT_SCHEME : baseConfig.scheme,
    android: {
      ...baseConfig.android,
      package: isDevelopment ? DEVELOPMENT_PACKAGE : baseConfig.android.package,
    },
    extra,
  };
};
