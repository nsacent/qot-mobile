import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, IMAGES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

let configuredClientKey = '';

const googleSignInErrorMessage = (error) => {
    const code = String(error?.code || '').trim();
    const message = String(error?.message || '').trim();
    const diagnostic = `${code} ${message}`;

    if (/native module|RNGoogleSignin|TurboModule|development build/i.test(diagnostic)) {
        return 'Google sign-in needs the installed QOT app. It is not available in Expo Go.';
    }
    if (code === 'IN_PROGRESS') {
        return 'Google sign-in is already open. Complete or close it, then try again.';
    }
    if (code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return 'Google Play Services is unavailable or needs updating on this phone.';
    }
    if (/DEVELOPER_ERROR|ApiException:\s*10|\bcode\s*[:=]?\s*10\b/i.test(diagnostic) || code === '10') {
        return 'Google sign-in is still activating for this QOT build. Please try again in a few minutes.';
    }
    if (/NETWORK_ERROR|network request failed|unable to resolve host|timeout/i.test(diagnostic)) {
        return 'Google sign-in could not reach the internet. Check your connection and try again.';
    }

    return 'Google sign-in could not be completed. Please try again.';
};

const GoogleSignInButton = ({ navigation, mode = 'sign-in' }) => {
    const { colors } = useTheme();
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const webClientId = String(
        Constants.expoConfig?.extra?.googleWebClientId
        || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
        || '',
    ).trim();
    const iosClientId = String(
        Constants.expoConfig?.extra?.googleIosClientId
        || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        || '',
    ).trim();

    if (!webClientId || (Platform.OS === 'ios' && !iosClientId)) return null;

    const handleGoogleSignIn = async () => {
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            // Loaded only when pressed so Expo Go can still run the rest of the app.
            // The native Google module is included in development and production builds.
            const { GoogleSignin } = require('@react-native-google-signin/google-signin');
            const clientKey = `${webClientId}:${iosClientId}`;
            if (configuredClientKey !== clientKey) {
                GoogleSignin.configure({
                    webClientId,
                    ...(iosClientId ? { iosClientId } : {}),
                    offlineAccess: false,
                });
                configuredClientKey = clientKey;
            }
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            }
            const response = await GoogleSignin.signIn();

            if (response?.type === 'cancelled') return;

            let credential = response?.data?.idToken || response?.idToken || '';
            if (!credential) {
                const tokens = await GoogleSignin.getTokens();
                credential = tokens?.idToken || '';
            }
            if (!credential) throw new Error('Google did not return a valid sign-in token.');

            await signInWithGoogle(credential);
            navigation.reset({
                index: 0,
                routes: [{ name: 'DrawerNavigation' }],
            });
        } catch (signInError) {
            const code = String(signInError?.code || '');
            if (code === 'SIGN_IN_CANCELLED' || code === '12501') return;
            setError(googleSignInErrorMessage(signInError));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
                activeOpacity={0.85}
                disabled={loading}
                onPress={handleGoogleSignIn}
                style={{
                    height: 50,
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    backgroundColor: colors.card,
                    opacity: loading ? 0.65 : 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                }}
            >
                <Image
                    source={IMAGES.google2}
                    style={{ position: 'absolute', left: 18, height: 23, width: 23, resizeMode: 'contain' }}
                />
                {loading && <ActivityIndicator color={COLORS.primary} size="small" style={{ marginRight: 8 }} />}
                <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }] }>
                    {loading
                        ? mode === 'sign-up' ? 'Creating your account...' : 'Signing you in...'
                        : mode === 'sign-up' ? 'Sign up with Google' : 'Continue with Google'}
                </Text>
            </TouchableOpacity>

            {Boolean(error) && (
                <Text style={[FONTS.fontXs, { color: COLORS.danger, textAlign: 'center', lineHeight: 17, marginTop: 9 }] }>
                    {error}
                </Text>
            )}
        </View>
    );
};

export default GoogleSignInButton;
