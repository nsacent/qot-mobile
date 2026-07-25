import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import Header from '../../layout/Header';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {
    confirmVerificationCode,
    sendVerificationCode,
} from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const channelOptions = [
    {
        value: 'phone',
        title: 'Phone number',
        description: 'Recommended',
        icon: 'smartphone',
    },
    {
        value: 'email',
        title: 'Email address',
        description: 'Use email instead',
        icon: 'mail',
    },
];

const VerifyAccount = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, refreshUser } = useAuth();
    const [channel, setChannel] = useState('phone');
    const [sentChannel, setSentChannel] = useState(null);
    const [destination, setDestination] = useState('');
    const [code, setCode] = useState('');
    const [sending, setSending] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (cooldown <= 0) return undefined;

        const timer = setInterval(() => {
            setCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const selectedOption = useMemo(
        () => channelOptions.find((option) => option.value === channel),
        [channel],
    );
    const hasDestination = channel === 'phone' ? Boolean(user?.phone) : Boolean(user?.email);
    const isAlreadyVerified = channel === 'phone'
        ? Boolean(user?.phone_verified)
        : Boolean(user?.email_verified);
    const displayDestination = channel === 'phone'
        ? (user?.phone || 'your phone number')
        : (user?.email || 'your email address');

    const chooseChannel = (nextChannel) => {
        if (nextChannel === channel) return;
        setChannel(nextChannel);
        setSentChannel(null);
        setDestination('');
        setCode('');
        setCooldown(0);
        setMessage('');
        setError('');
    };

    const sendCode = async () => {
        if (!hasDestination) {
            setError(
                channel === 'phone'
                    ? 'Add a Ugandan phone number to your QOT profile first.'
                    : 'Add an email address to your QOT profile first.',
            );
            return;
        }

        if (isAlreadyVerified) {
            setMessage(`${selectedOption.title} is already verified.`);
            return;
        }

        setSending(true);
        setError('');
        setMessage('');

        try {
            const result = await sendVerificationCode(channel);
            setSentChannel(channel);
            setDestination(result.destination || displayDestination);
            setCooldown(Number(result.resend_after) || 60);
            setMessage(
                result.message
                || `A verification code was sent to ${result.destination || displayDestination}.`,
            );
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSending(false);
        }
    };

    const confirmCode = async () => {
        if (sentChannel !== channel) {
            setError(`Send a ${channel} verification code first.`);
            return;
        }

        if (!/^\d{6}$/.test(code.trim())) {
            setError('Enter the 6-digit verification code.');
            return;
        }

        setConfirming(true);
        setError('');

        try {
            await confirmVerificationCode(code.trim(), channel);
            await refreshUser();
            Alert.alert(
                'Account verified',
                channel === 'phone'
                    ? 'Your phone number is verified. You can now use all QOT features.'
                    : 'Your email address is verified. You can now use all QOT features.',
                [{
                    text: 'Continue',
                    onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'DrawerNavigation' }],
                    }),
                }],
            );
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setConfirming(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Verify your account" leftIcon="back" titleLeft />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[GlobalStyleSheet.container, { flex: 1, paddingTop: 24, paddingBottom: 32 }] }>
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: '#F4B8B8',
                                backgroundColor: '#FFF1F1',
                                borderRadius: 18,
                                padding: 18,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: '#D93636', alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="shield" size={23} color={COLORS.white} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: '#8F1D1D' }]}>Verification required</Text>
                                <Text style={[FONTS.fontSm, { color: '#9F3434', lineHeight: 19, marginTop: 3 }] }>
                                    Verify your identity before posting ads or contacting sellers.
                                </Text>
                            </View>
                        </View>

                        <Text style={[FONTS.h5, { color: colors.title, marginTop: 26 }]}>Choose how to verify</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20, marginTop: 5 }] }>
                            Phone verification is the fastest and recommended option for QOT Uganda.
                        </Text>

                        <View style={{ gap: 10, marginTop: 18 }}>
                            {channelOptions.map((option) => {
                                const selected = option.value === channel;
                                const verified = option.value === 'phone'
                                    ? Boolean(user?.phone_verified)
                                    : Boolean(user?.email_verified);

                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => chooseChannel(option.value)}
                                        activeOpacity={0.8}
                                        style={{
                                            minHeight: 66,
                                            borderWidth: 1.5,
                                            borderColor: selected ? COLORS.primary : colors.borderColor,
                                            backgroundColor: selected ? `${COLORS.primary}0D` : colors.card,
                                            borderRadius: SIZES.radius,
                                            paddingHorizontal: 15,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View style={{ height: 38, width: 38, borderRadius: 19, backgroundColor: selected ? COLORS.primary : colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                            <FeatherIcon name={option.icon} size={18} color={selected ? COLORS.white : colors.text} />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }] }>{option.title}</Text>
                                            <Text style={[FONTS.fontXs, { color: verified ? COLORS.success : colors.text, marginTop: 2 }] }>
                                                {verified ? 'Verified' : option.description}
                                            </Text>
                                        </View>
                                        <FeatherIcon
                                            name={selected ? 'check-circle' : 'circle'}
                                            size={20}
                                            color={selected ? COLORS.primary : colors.textLight}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={{ marginTop: 24, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, borderRadius: 18, padding: 18 }}>
                            <Text style={[FONTS.fontSm, { color: colors.text }]}>Code will be sent to</Text>
                            <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: colors.title, marginTop: 4 }] }>{displayDestination}</Text>

                            {Boolean(message) && (
                                <View style={{ backgroundColor: '#ECF9F1', borderRadius: 10, padding: 11, marginTop: 14 }}>
                                    <Text style={[FONTS.fontSm, { color: '#1D7A46', lineHeight: 19 }] }>{message}</Text>
                                </View>
                            )}

                            {Boolean(error) && (
                                <View style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 11, marginTop: 14 }}>
                                    <Text style={[FONTS.fontSm, { color: COLORS.danger, lineHeight: 19 }] }>{error}</Text>
                                </View>
                            )}

                            {sentChannel === channel && !isAlreadyVerified && (
                                <>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 18, marginBottom: 8 }]}>6-digit code</Text>
                                    <TextInput
                                        value={code}
                                        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholder="000000"
                                        placeholderTextColor={colors.textLight}
                                        textContentType="oneTimeCode"
                                        style={{
                                            height: 56,
                                            borderWidth: 1,
                                            borderColor: colors.borderColor,
                                            borderRadius: SIZES.radius,
                                            backgroundColor: colors.background,
                                            color: colors.title,
                                            paddingHorizontal: 16,
                                            textAlign: 'center',
                                            fontSize: 21,
                                            letterSpacing: 7,
                                        }}
                                    />

                                    <TouchableOpacity
                                        disabled={confirming}
                                        onPress={confirmCode}
                                        style={{ height: 52, backgroundColor: confirming ? '#AAB8D4' : COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 14 }}
                                    >
                                        {confirming && <ActivityIndicator color={COLORS.white} style={{ marginRight: 8 }} />}
                                        <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }] }>
                                            {confirming ? 'Verifying...' : `Verify ${channel}`}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {!isAlreadyVerified && (
                                <TouchableOpacity
                                    disabled={sending || cooldown > 0}
                                    onPress={sendCode}
                                    style={{ paddingVertical: 15, alignSelf: 'center', marginTop: sentChannel === channel ? 2 : 8 }}
                                >
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: sending || cooldown > 0 ? colors.textLight : COLORS.primary }] }>
                                        {sending
                                            ? 'Sending code...'
                                            : cooldown > 0
                                                ? `Send again in ${cooldown}s`
                                                : sentChannel === channel
                                                    ? 'Send a new code'
                                                    : `Send ${channel} code`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default VerifyAccount;
