import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Text,
    View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const fullNameFromCredential = (credential) => (
    [credential?.fullName?.givenName, credential?.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim()
);

const AppleSignInButton = ({ navigation, mode = 'sign-in', onBeforePress }) => {
    const { colors } = useTheme();
    const { signInWithApple } = useAuth();
    const [available, setAvailable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        if (Platform.OS !== 'ios') return undefined;

        AppleAuthentication.isAvailableAsync()
            .then((value) => active && setAvailable(Boolean(value)))
            .catch(() => active && setAvailable(false));

        return () => { active = false; };
    }, []);

    if (Platform.OS !== 'ios' || !available) return null;

    const handleAppleSignIn = async () => {
        if (loading) return;
        if (onBeforePress && !onBeforePress()) return;
        setLoading(true);
        setError('');

        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential?.identityToken) {
                throw new Error('Apple did not return a valid sign-in token.');
            }

            await signInWithApple(
                credential.identityToken,
                fullNameFromCredential(credential),
            );
            navigation.reset({
                index: 0,
                routes: [{ name: 'DrawerNavigation' }],
            });
        } catch (signInError) {
            if (signInError?.code === 'ERR_REQUEST_CANCELED') return;
            setError(
                signInError?.message
                || 'Apple sign-in could not be completed. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ marginBottom: 10 }}>
            <View style={{ opacity: loading ? 0.65 : 1 }} pointerEvents={loading ? 'none' : 'auto'}>
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={mode === 'sign-up'
                        ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                        : AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={25}
                    style={{ width: '100%', height: 50 }}
                    onPress={handleAppleSignIn}
                />
            </View>
            {loading && (
                <View pointerEvents="none" style={{ position: 'absolute', right: 18, top: 15 }}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                </View>
            )}
            {Boolean(error) && (
                <Text style={[FONTS.fontXs, { color: COLORS.danger, textAlign: 'center', lineHeight: 17, marginTop: 9 }] }>
                    {error}
                </Text>
            )}
            <Text style={[FONTS.fontXs, { color: colors.text, textAlign: 'center', lineHeight: 16, marginTop: 7 }] }>
                Apple can keep your email address private.
            </Text>
        </View>
    );
};

export default AppleSignInButton;
