import React, { useEffect, useState } from 'react';
import {
    Image,
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
import CustomButton from '../../components/CustomButton';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import UgandanPhoneInput from '../../components/UgandanPhoneInput';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { isValidUgandanMobile, ugandanPhoneE164 } from '../../utils/phoneNumbers';

const SignIn = ({ navigation }) => {
    const theme = useTheme();
    const { colors } = theme;
    const { signIn, requestPhoneOTP, signInWithPhoneOTP } = useAuth();
    const [mode, setMode] = useState('otp');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [useEmail, setUseEmail] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const finishSignIn = () => navigation.reset({
        index: 0,
        routes: [{ name: 'DrawerNavigation' }],
    });

    const validatePhone = () => {
        if (isValidUgandanMobile(phone)) return true;
        setError('Enter a valid Ugandan mobile number beginning with +2567.');
        return false;
    };

    const sendCode = async () => {
        if (!validatePhone()) return;
        setError('');
        setMessage('');
        setIsSubmitting(true);
        try {
            const result = await requestPhoneOTP(phone);
            setOtpSent(true);
            setCooldown(Number(result.resend_after || 60));
            setMessage(`A 6-digit code was sent to ${result.destination || ugandanPhoneE164(phone)}.`);
        } catch (requestError) {
            setError(requestError.message);
            if (requestError.data?.retry_after) setCooldown(Number(requestError.data.retry_after));
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyCode = async () => {
        if (!validatePhone()) return;
        if (!/^\d{6}$/.test(code)) {
            setError('Enter the complete 6-digit code sent to your phone.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await signInWithPhoneOTP(phone, code);
            finishSignIn();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordSignIn = async () => {
        if (!password) {
            setError('Enter your password.');
            return;
        }
        if (!useEmail && !validatePhone()) return;
        if (useEmail && !email.trim().includes('@')) {
            setError('Enter a valid email address.');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            await signIn({ identifier: useEmail ? email : ugandanPhoneE164(phone), password });
            finishSignIn();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setError('');
        setMessage('');
    };

    const inputStyle = {
        backgroundColor: colors.input,
        color: colors.title,
        borderColor: colors.border,
        paddingLeft: 16,
        height: 50,
        borderWidth: 1,
        borderRadius: 11,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                <View style={{ ...GlobalStyleSheet.container, flex: 1 }}>
                    <View style={{ marginBottom: 24, alignItems: 'center', marginTop: 24 }}>
                        <Image accessibilityLabel="QOT" style={{ height: 54, width: 160, resizeMode: 'contain', marginBottom: 17 }} source={IMAGES.qotLogo} />
                        <Text style={{ ...FONTS.h3, color: colors.title, marginBottom: 6 }}>Welcome back</Text>
                        <Text style={{ ...FONTS.font, color: colors.text, textAlign: 'center' }}>Sign in to buy and sell with QOT.</Text>
                    </View>

                    <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 13, padding: 4, marginBottom: 18 }}>
                        {[
                            ['otp', 'Phone OTP', 'smartphone'],
                            ['password', 'Password', 'lock'],
                        ].map(([value, label, icon]) => {
                            const active = mode === value;
                            return (
                                <TouchableOpacity key={value} onPress={() => switchMode(value)} style={{ flex: 1, height: 42, borderRadius: 10, backgroundColor: active ? COLORS.primary : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={icon} size={15} color={active ? COLORS.white : colors.text} />
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: active ? COLORS.white : colors.title, marginLeft: 7 }]}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {Boolean(error) && <View style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 15 }}><Text style={{ ...FONTS.fontSm, color: COLORS.danger }}>{error}</Text></View>}
                    {Boolean(message) && <View style={{ backgroundColor: '#EAF8F0', borderRadius: 10, padding: 12, marginBottom: 15 }}><Text style={{ ...FONTS.fontSm, color: '#176B44' }}>{message}</Text></View>}

                    {mode === 'otp' ? (
                        <>
                            <View style={GlobalStyleSheet.inputGroup}>
                                <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Ugandan phone number</Text>
                                <UgandanPhoneInput
                                    value={phone}
                                    onChangeText={(value) => {
                                        setPhone(value);
                                        if (otpSent) {
                                            setOtpSent(false);
                                            setCode('');
                                            setMessage('');
                                        }
                                    }}
                                    returnKeyType={otpSent ? 'next' : 'done'}
                                    onSubmitEditing={otpSent ? undefined : sendCode}
                                />
                                <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 6 }]}>Only +2567 mobile numbers are accepted.</Text>
                            </View>

                            {otpSent ? (
                                <>
                                    <View style={GlobalStyleSheet.inputGroup}>
                                        <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>6-digit sign-in code</Text>
                                        <TextInput
                                            value={code}
                                            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                                            keyboardType="number-pad"
                                            textContentType="oneTimeCode"
                                            autoComplete="sms-otp"
                                            maxLength={6}
                                            placeholder="000000"
                                            placeholderTextColor={colors.textLight}
                                            style={[inputStyle, { textAlign: 'center', fontSize: 21, letterSpacing: 7, paddingLeft: 23 }]}
                                            onSubmitEditing={verifyCode}
                                        />
                                    </View>
                                    <CustomButton onPress={verifyCode} disabled={isSubmitting} color={COLORS.primary} title={isSubmitting ? 'Verifying...' : 'Verify and sign in'} />
                                    <TouchableOpacity disabled={isSubmitting || cooldown > 0} onPress={sendCode} style={{ alignSelf: 'center', padding: 12, marginTop: 3 }}>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: cooldown > 0 ? colors.textLight : COLORS.primary }]}>{cooldown > 0 ? `Send again in ${cooldown}s` : 'Send a new code'}</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <CustomButton onPress={sendCode} disabled={isSubmitting} color={COLORS.primary} title={isSubmitting ? 'Sending code...' : 'Send sign-in code'} />
                            )}
                        </>
                    ) : (
                        <>
                            <View style={GlobalStyleSheet.inputGroup}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>{useEmail ? 'Email address' : 'Ugandan phone number'}</Text>
                                    <TouchableOpacity onPress={() => { setUseEmail((value) => !value); setError(''); }} style={{ paddingVertical: 4, paddingLeft: 10 }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>{useEmail ? 'Use phone instead' : 'Use email instead'}</Text></TouchableOpacity>
                                </View>
                                {useEmail ? (
                                    <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={colors.textLight} style={inputStyle} />
                                ) : <UgandanPhoneInput value={phone} onChangeText={setPhone} returnKeyType="next" />}
                            </View>

                            <View style={GlobalStyleSheet.inputGroup}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={[GlobalStyleSheet.label, { color: colors.title }]}>Password</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={{ paddingVertical: 5, paddingLeft: 12, marginTop: -5 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Forgot password?</Text></TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity onPress={() => setShowPassword((value) => !value)} style={{ position: 'absolute', zIndex: 1, height: 50, width: 48, alignItems: 'center', justifyContent: 'center', right: 0 }}><FeatherIcon name={showPassword ? 'eye' : 'eye-off'} color={colors.title} size={18} /></TouchableOpacity>
                                    <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholder="Enter your password" placeholderTextColor={colors.textLight} returnKeyType="done" onSubmitEditing={handlePasswordSignIn} style={[inputStyle, { paddingRight: 48 }]} />
                                </View>
                            </View>
                            <CustomButton onPress={handlePasswordSignIn} disabled={isSubmitting} color={COLORS.primary} title={isSubmitting ? 'Signing in...' : 'Sign in with password'} />
                        </>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18 }}><View style={{ flex: 1, height: 1, backgroundColor: colors.border }} /><Text style={[FONTS.fontSm, { color: colors.text, marginHorizontal: 12 }]}>or continue with</Text><View style={{ flex: 1, height: 1, backgroundColor: colors.border }} /></View>
                    <GoogleSignInButton navigation={navigation} />

                    <View style={{ backgroundColor: colors.card, borderRadius: 11, padding: 11, flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                        <FeatherIcon name="shield" size={16} color={COLORS.primary} />
                        <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, flex: 1, marginLeft: 8 }]}>This phone stays signed in securely for up to one year unless you sign out.</Text>
                    </View>

                    <View style={{ marginTop: 20, marginBottom: 25 }}>
                        <Text style={{ ...FONTS.font, color: colors.title, textAlign: 'center', marginBottom: 11 }}>New to QOT?</Text>
                        <CustomButton onPress={() => navigation.navigate('SignUp')} outline color={COLORS.secondary} title="Create an account" />
                        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'DrawerNavigation' }] })} style={{ minHeight: 44, marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Browse QOT without signing in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;
