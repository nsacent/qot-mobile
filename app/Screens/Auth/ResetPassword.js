import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import {
    confirmPasswordReset,
    requestPasswordReset,
} from '../../api/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const valueFromParam = (value) => {
    if (Array.isArray(value)) return String(value[0] || '').trim();
    return String(value || '').trim();
};

const fieldMessage = (data, field) => {
    const value = data?.[field];
    if (Array.isArray(value)) return String(value[0] || '');
    return typeof value === 'string' ? value : '';
};

const ResetPassword = ({ navigation, route }) => {
    const { colors } = useTheme();
    const uid = valueFromParam(route?.params?.uid);
    const token = valueFromParam(route?.params?.token);
    const hasResetCredentials = Boolean(uid && token);
    const hasIncompleteLink = Boolean(uid || token) && !hasResetCredentials;

    const [mode, setMode] = useState(hasResetCredentials || hasIncompleteLink ? 'confirm' : 'request');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const passwordChecks = useMemo(() => ({
        length: password.length >= 8,
        match: Boolean(password) && password === passwordConfirm,
    }), [password, passwordConfirm]);

    const clearFeedback = (field) => {
        setError('');
        setFieldErrors((current) => ({ ...current, [field]: '' }));
    };

    const showRequestForm = () => {
        setMode('request');
        setEmail('');
        setSuccess('');
        setError('');
        setFieldErrors({});
    };

    const submitRequest = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        const nextErrors = {};

        if (!normalizedEmail) nextErrors.email = 'Enter your email address.';
        else if (!emailPattern.test(normalizedEmail)) nextErrors.email = 'Enter a valid email address.';

        if (Object.keys(nextErrors).length) {
            setFieldErrors(nextErrors);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const result = await requestPasswordReset(normalizedEmail);
            setSuccess(result?.message || 'If that email belongs to a QOT account, a reset link has been sent.');
        } catch (requestError) {
            const emailError = fieldMessage(requestError.data, 'email');
            if (emailError) setFieldErrors({ email: emailError });
            else setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    const submitNewPassword = async () => {
        const nextErrors = {};

        if (!hasResetCredentials) {
            setError('This password reset link is incomplete. Request a new link below.');
            return;
        }
        if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
        if (!passwordConfirm) nextErrors.passwordConfirm = 'Confirm your new password.';
        else if (password !== passwordConfirm) nextErrors.passwordConfirm = 'Passwords do not match.';

        if (Object.keys(nextErrors).length) {
            setFieldErrors(nextErrors);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const result = await confirmPasswordReset({
                uid,
                token,
                password,
                passwordConfirm,
            });
            setSuccess(result?.message || 'Your password has been reset successfully.');
        } catch (requestError) {
            const passwordError = fieldMessage(requestError.data, 'new_password');
            const confirmError = fieldMessage(requestError.data, 'new_password_confirm');
            if (passwordError || confirmError) {
                setFieldErrors({
                    password: passwordError,
                    passwordConfirm: confirmError,
                });
            } else {
                setError(requestError.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const returnToSignIn = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
        });
    };

    const inputStyle = (invalid) => ({
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: invalid ? COLORS.danger : colors.border,
        backgroundColor: colors.input,
        color: colors.title,
        paddingHorizontal: 15,
    });

    const isComplete = mode === 'confirm' && Boolean(success);
    const requestSent = mode === 'request' && Boolean(success);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View style={[GlobalStyleSheet.container, { flex: 1, paddingTop: 18, paddingBottom: 30 }] }>
                        <TouchableOpacity
                            onPress={() => navigation.canGoBack() ? navigation.goBack() : returnToSignIn()}
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                                borderWidth: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.card,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FeatherIcon name="arrow-left" size={21} color={colors.title} />
                        </TouchableOpacity>

                        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 28 }}>
                            <View style={{
                                width: 68,
                                height: 68,
                                borderRadius: 22,
                                backgroundColor: `${COLORS.primary}12`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignSelf: 'center',
                            }}>
                                <FeatherIcon
                                    name={isComplete ? 'check-circle' : requestSent ? 'mail' : 'key'}
                                    size={30}
                                    color={isComplete ? COLORS.success : COLORS.primary}
                                />
                            </View>

                            <Text style={[FONTS.h3, { color: colors.title, textAlign: 'center', marginTop: 20 }] }>
                                {isComplete
                                    ? 'Password updated'
                                    : requestSent
                                        ? 'Check your email'
                                        : mode === 'confirm'
                                            ? 'Create a new password'
                                            : 'Reset your password'}
                            </Text>
                            <Text style={[FONTS.font, { color: colors.text, textAlign: 'center', lineHeight: 21, marginTop: 7, paddingHorizontal: 8 }] }>
                                {isComplete
                                    ? 'Your QOT account is secure again. Sign in with your new password.'
                                    : requestSent
                                        ? 'Open the secure link in the email we sent you. You can close this screen afterwards.'
                                        : mode === 'confirm'
                                            ? 'Choose a password you have not used before.'
                                            : 'Enter the email linked to your QOT account and we will send you a secure reset link.'}
                            </Text>

                            <View style={{
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 18,
                                padding: 18,
                                marginTop: 26,
                            }}>
                                {Boolean(error || (hasIncompleteLink && mode === 'confirm' && !success)) && (
                                    <View style={{
                                        flexDirection: 'row',
                                        backgroundColor: '#FDECEC',
                                        borderRadius: 11,
                                        padding: 12,
                                        marginBottom: 16,
                                    }}>
                                        <FeatherIcon name="alert-circle" size={18} color={COLORS.danger} />
                                        <Text style={[FONTS.fontSm, { color: COLORS.danger, flex: 1, lineHeight: 19, marginLeft: 8 }] }>
                                            {error || 'This password reset link is incomplete. Request a new one to continue.'}
                                        </Text>
                                    </View>
                                )}

                                {isComplete ? (
                                    <TouchableOpacity
                                        onPress={returnToSignIn}
                                        activeOpacity={0.85}
                                        style={{ height: 52, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                                    >
                                        <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }]}>Return to sign in</Text>
                                        <FeatherIcon name="arrow-right" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                                    </TouchableOpacity>
                                ) : requestSent ? (
                                    <>
                                        <View style={{ backgroundColor: '#EAF8F0', borderRadius: 11, padding: 12, flexDirection: 'row' }}>
                                            <FeatherIcon name="check-circle" size={18} color="#18864B" />
                                            <Text style={[FONTS.fontSm, { color: '#18864B', flex: 1, lineHeight: 19, marginLeft: 8 }] }>{success}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setSuccess('')}
                                            activeOpacity={0.8}
                                            style={{ height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}
                                        >
                                            <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Send another link</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={returnToSignIn} style={{ alignSelf: 'center', padding: 10, marginTop: 5 }}>
                                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Back to sign in</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : mode === 'request' ? (
                                    <>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 8 }]}>Email address</Text>
                                        <View>
                                            <FeatherIcon name="mail" size={18} color={colors.text} style={{ position: 'absolute', left: 15, top: 16, zIndex: 1 }} />
                                            <TextInput
                                                value={email}
                                                onChangeText={(value) => { setEmail(value); clearFeedback('email'); }}
                                                style={[inputStyle(Boolean(fieldErrors.email)), { paddingLeft: 44 }]}
                                                placeholder="you@example.com"
                                                placeholderTextColor={colors.textLight}
                                                keyboardType="email-address"
                                                textContentType="emailAddress"
                                                autoComplete="email"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                returnKeyType="send"
                                                onSubmitEditing={submitRequest}
                                            />
                                        </View>
                                        {Boolean(fieldErrors.email) && <Text style={[FONTS.fontXs, { color: COLORS.danger, marginTop: 6 }] }>{fieldErrors.email}</Text>}

                                        <TouchableOpacity
                                            disabled={submitting}
                                            onPress={submitRequest}
                                            activeOpacity={0.85}
                                            style={{ height: 52, borderRadius: 12, backgroundColor: submitting ? '#FDBA74' : COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 18 }}
                                        >
                                            {submitting && <ActivityIndicator color={COLORS.white} style={{ marginRight: 9 }} />}
                                            <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }]}>{submitting ? 'Sending link...' : 'Send reset link'}</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginBottom: 8 }]}>New password</Text>
                                        <View>
                                            <TextInput
                                                value={password}
                                                onChangeText={(value) => { setPassword(value); clearFeedback('password'); }}
                                                style={[inputStyle(Boolean(fieldErrors.password)), { paddingRight: 48 }]}
                                                placeholder="At least 8 characters"
                                                placeholderTextColor={colors.textLight}
                                                secureTextEntry={!showPassword}
                                                textContentType="newPassword"
                                                autoComplete="new-password"
                                                returnKeyType="next"
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowPassword((current) => !current)}
                                                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                                style={{ position: 'absolute', right: 0, width: 48, height: 50, alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <FeatherIcon name={showPassword ? 'eye' : 'eye-off'} size={18} color={colors.text} />
                                            </TouchableOpacity>
                                        </View>
                                        {Boolean(fieldErrors.password) && <Text style={[FONTS.fontXs, { color: COLORS.danger, marginTop: 6 }] }>{fieldErrors.password}</Text>}

                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 16, marginBottom: 8 }]}>Confirm new password</Text>
                                        <View>
                                            <TextInput
                                                value={passwordConfirm}
                                                onChangeText={(value) => { setPasswordConfirm(value); clearFeedback('passwordConfirm'); }}
                                                style={[inputStyle(Boolean(fieldErrors.passwordConfirm)), { paddingRight: 48 }]}
                                                placeholder="Type the password again"
                                                placeholderTextColor={colors.textLight}
                                                secureTextEntry={!showPasswordConfirm}
                                                textContentType="newPassword"
                                                autoComplete="new-password"
                                                returnKeyType="done"
                                                onSubmitEditing={submitNewPassword}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowPasswordConfirm((current) => !current)}
                                                accessibilityLabel={showPasswordConfirm ? 'Hide password confirmation' : 'Show password confirmation'}
                                                style={{ position: 'absolute', right: 0, width: 48, height: 50, alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <FeatherIcon name={showPasswordConfirm ? 'eye' : 'eye-off'} size={18} color={colors.text} />
                                            </TouchableOpacity>
                                        </View>
                                        {Boolean(fieldErrors.passwordConfirm) && <Text style={[FONTS.fontXs, { color: COLORS.danger, marginTop: 6 }] }>{fieldErrors.passwordConfirm}</Text>}

                                        <View style={{ flexDirection: 'row', marginTop: 14, gap: 16 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <FeatherIcon name={passwordChecks.length ? 'check-circle' : 'circle'} size={15} color={passwordChecks.length ? COLORS.success : colors.textLight} />
                                                <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 5 }]}>8+ characters</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <FeatherIcon name={passwordChecks.match ? 'check-circle' : 'circle'} size={15} color={passwordChecks.match ? COLORS.success : colors.textLight} />
                                                <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 5 }]}>Passwords match</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            disabled={submitting || !hasResetCredentials}
                                            onPress={submitNewPassword}
                                            activeOpacity={0.85}
                                            style={{ height: 52, borderRadius: 12, backgroundColor: submitting || !hasResetCredentials ? '#FDBA74' : COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}
                                        >
                                            {submitting && <ActivityIndicator color={COLORS.white} style={{ marginRight: 9 }} />}
                                            <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }]}>{submitting ? 'Updating password...' : 'Update password'}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={showRequestForm} style={{ alignSelf: 'center', padding: 10, marginTop: 6 }}>
                                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Request a new reset link</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ResetPassword;
