const appJson = require('./app.json');

module.exports = () => {
    const config = {
        ...appJson.expo,
        extra: {
            ...appJson.expo.extra,
        },
    };

    // Expo Go can run anonymously during local development. Release and EAS
    // builds keep the project ID from app.json unless this local-only flag is set.
    if (process.env.QOT_LOCAL_EXPO === '1') {
        delete config.extra.eas;
    }

    return config;
};
