module.exports = ({ config }) => {
  const extra = { ...(config.extra || {}) };

  // Expo Go asks EAS-linked projects for a signed development manifest. Local
  // development can use an anonymous manifest without affecting real EAS builds.
  if (process.env.QOT_UNSIGNED_EXPO_GO === '1') {
    delete extra.eas;
  }

  return {
    ...config,
    extra,
  };
};
