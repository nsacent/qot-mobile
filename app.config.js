module.exports = ({ config }) => {
    const resolvedConfig = {
        ...config,
        extra: {
            ...config.extra,
        },
    };

    // Expo Go can run anonymously during local development. Release and EAS
    // builds keep the project ID from app.json unless this local-only flag is set.
    if (process.env.QOT_LOCAL_EXPO === '1') {
        delete resolvedConfig.extra.eas;
    }

    return resolvedConfig;
};
