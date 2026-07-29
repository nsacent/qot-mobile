module.exports = ({ config }) => {
    const googleIosClientId = String(
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        || config.extra?.googleIosClientId
        || '',
    ).trim();
    const plugins = [...(config.plugins || [])];

    if (
        googleIosClientId
        && !plugins.some((plugin) => (
            Array.isArray(plugin)
                ? plugin[0] === '@react-native-google-signin/google-signin'
                : plugin === '@react-native-google-signin/google-signin'
        ))
    ) {
        const iosUrlScheme = `com.googleusercontent.apps.${googleIosClientId.replace(/\.apps\.googleusercontent\.com$/, '')}`;
        plugins.push([
            '@react-native-google-signin/google-signin',
            { iosUrlScheme },
        ]);
    }

    const resolvedConfig = {
        ...config,
        plugins,
        extra: {
            ...config.extra,
            ...(googleIosClientId ? { googleIosClientId } : {}),
        },
    };

    // Expo Go can run anonymously during local development. Release and EAS
    // builds keep the project ID from app.json unless this local-only flag is set.
    if (process.env.QOT_LOCAL_EXPO === '1') {
        delete resolvedConfig.extra.eas;
    }

    return resolvedConfig;
};
