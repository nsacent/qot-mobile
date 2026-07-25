import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const FACEBOOK_GRAPH_VERSION = 'v25.0';

const FacebookSignInButton = ({ navigation, mode = 'sign-in' }) => {
    const { colors } = useTheme();
    const { signInWithFacebook } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const appId = String(
        Constants.expoConfig?.extra?.facebookAppId
        || process.env.EXPO_PUBLIC_FACEBOOK_APP_ID
        || '',
    ).trim();
    const facebookScheme = appId ? `fb${appId}` : 'qot';
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: facebookScheme,
        native: `${facebookScheme}://authorize`,
        path: 'authorize',
    });
    const discovery = useMemo(() => ({
        authorizationEndpoint: `https://www.facebook.com/${FACEBOOK_GRAPH_VERSION}/dialog/oauth`,
    }), []);
    const [request, , promptAsync] = AuthSession.useAuthRequest({
        clientId: appId || 'facebook-app-id-not-configured',
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        scopes: ['public_profile', 'email'],
        usePKCE: false,
        extraParams: {
            display: 'touch',
            auth_type: 'rerequest',
        },
    }, discovery);

    if (!appId) return null;

    const handleFacebookSignIn = async () => {
        if (!request || loading) return;

        setLoading(true);
        setError('');

        try {
            const result = await promptAsync();

            if (result.type === 'cancel' || result.type === 'dismiss') return;
            if (result.type !== 'success') {
                throw new Error(
                    result.error?.message
                    || 'Facebook sign-in did not complete. Please try again.',
                );
            }

            const accessToken = result.authentication?.accessToken
                || result.params?.access_token
                || '';

            if (!accessToken) {
                throw new Error('Facebook did not return a valid sign-in token.');
            }

            await signInWithFacebook(accessToken);
            navigation.reset({
                index: 0,
                routes: [{ name: 'DrawerNavigation' }],
            });
        } catch (signInError) {
            setError(
                signInError?.message
                || 'Facebook sign-in failed. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.85}
                disabled={!request || loading}
                onPress={handleFacebookSignIn}
                style={{
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#1877F2',
                    opacity: !request || loading ? 0.65 : 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        left: 18,
                        height: 25,
                        width: 25,
                        borderRadius: 13,
                        backgroundColor: COLORS.white,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Text style={{ color: '#1877F2', fontSize: 21, fontWeight: '900', lineHeight: 25 }}>f</Text>
                </View>
                {loading && <ActivityIndicator color={COLORS.white} size="small" style={{ marginRight: 8 }} />}
                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }] }>
                    {loading
                        ? mode === 'sign-up' ? 'Creating your account...' : 'Signing you in...'
                        : mode === 'sign-up' ? 'Sign up with Facebook' : 'Continue with Facebook'}
                </Text>
            </TouchableOpacity>

            {Boolean(error) && (
                <Text style={[FONTS.fontXs, { color: COLORS.danger, textAlign: 'center', marginTop: 9 }] }>
                    {error}
                </Text>
            )}
        </View>
    );
};

export default FacebookSignInButton;
