import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';
import { formatPrice } from '../utils/formatters';
import { hasPrimaryVerification } from '../utils/verification';

export const DEFAULT_BUYER_MESSAGE = 'Hi, is this ad still available?';

const BUYER_QUESTIONS = [
    {
        icon: 'check-circle',
        label: 'Is it available?',
        message: DEFAULT_BUYER_MESSAGE,
    },
    {
        icon: 'tag',
        label: 'Best price?',
        message: 'Hi, what is your best price for this ad?',
    },
    {
        icon: 'search',
        label: 'Can I inspect it?',
        message: 'Hi, can I inspect this item before buying?',
    },
    {
        icon: 'map-pin',
        label: 'Where can we meet?',
        message: 'Hi, where can we meet so I can see this item?',
    },
];

const BuyerContactModal = ({
    visible,
    listing,
    user,
    submitting,
    onClose,
    onSubmit,
    onSignIn,
    onVerify,
}) => {
    const { colors, dark } = useTheme();
    const [mode, setMode] = useState('question');
    const [message, setMessage] = useState(DEFAULT_BUYER_MESSAGE);
    const [offerAmount, setOfferAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!visible) return;
        setMode('question');
        setMessage(DEFAULT_BUYER_MESSAGE);
        setOfferAmount('');
        setError('');
    }, [listing?.id, visible]);

    const offerSuggestions = useMemo(() => {
        const price = Number(listing?.price);
        if (!Number.isFinite(price) || price <= 0) return [];

        return [0.85, 0.9, 0.95]
            .map((ratio) => Math.round((price * ratio) / 1000) * 1000)
            .filter((amount, index, values) => amount > 0 && values.indexOf(amount) === index);
    }, [listing?.price]);

    const accessGate = !user
        ? {
            icon: 'log-in',
            title: 'Sign in to chat with the seller',
            message: 'Your QOT account keeps your conversations together and helps sellers know who they are speaking with.',
            action: 'Sign in',
            onPress: onSignIn,
        }
        : !hasPrimaryVerification(user)
            ? {
                icon: 'shield',
                title: 'Verify your phone first',
                message: 'Phone verification is required before you can contact a seller on QOT.',
                action: 'Verify account',
                onPress: onVerify,
            }
            : null;

    const chooseQuestion = (question) => {
        setMode('question');
        setMessage(question.message);
        setError('');
    };

    const submit = async () => {
        if (!user) {
            setError('Sign in before contacting this seller.');
            return;
        }
        if (!hasPrimaryVerification(user)) {
            setError('Verify your phone number before contacting this seller.');
            return;
        }

        let outgoingMessage = message.trim();
        let offer = null;
        if (mode === 'offer') {
            const numericOffer = Number(offerAmount);
            if (!Number.isFinite(numericOffer) || numericOffer <= 0) {
                setError('Enter a valid offer amount in UGX.');
                return;
            }
            outgoingMessage = '';
            offer = { offerAmount: numericOffer };
        } else if (outgoingMessage.length < 3) {
            setError('Write a short question for the seller.');
            return;
        }

        setError('');
        try {
            await onSubmit(outgoingMessage, offer);
        } catch (requestError) {
            setError(requestError.message || 'The chat could not be opened. Please try again.');
        }
    };

    const close = () => {
        if (!submitting) onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={close}
        >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <Pressable
                    onPress={close}
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 28, backgroundColor: 'rgba(15,23,42,.7)', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Pressable
                        accessibilityViewIsModal
                        onPress={() => {}}
                        style={{ width: '100%', maxWidth: 470, maxHeight: '92%', borderRadius: 22, backgroundColor: colors.card, overflow: 'hidden' }}
                    >
                        {accessGate ? (
                            <View style={{ padding: 22, alignItems: 'center' }}>
                                <View style={{ height: 64, width: 64, borderRadius: 21, backgroundColor: dark ? colors.background : COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={accessGate.icon} size={27} color={COLORS.primary} />
                                </View>
                                <Text style={[FONTS.h6, { color: colors.title, textAlign: 'center', marginTop: 15 }]}>{accessGate.title}</Text>
                                <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 21, marginTop: 7 }]}>{accessGate.message}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        onClose();
                                        accessGate.onPress?.();
                                    }}
                                    style={{ width: '100%', height: 49, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}
                                >
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>{accessGate.action}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={close} style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 2 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.text }]}>Not now</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: dark ? colors.background : COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="message-circle" size={21} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                        <Text style={[FONTS.h6, { color: colors.title }]}>Message seller</Text>
                                        <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginTop: 3 }]}>{listing?.title || 'Ask about this ad'}</Text>
                                    </View>
                                    <TouchableOpacity disabled={submitting} onPress={close} style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="x" size={18} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', borderRadius: 12, backgroundColor: colors.background, padding: 4, marginTop: 18 }}>
                                    {[
                                        ['question', 'Quick question', 'message-square'],
                                        ['offer', 'Make an offer', 'tag'],
                                    ].map(([value, label, icon]) => {
                                        const active = mode === value;
                                        return (
                                            <TouchableOpacity
                                                key={value}
                                                onPress={() => {
                                                    setMode(value);
                                                    setError('');
                                                }}
                                                style={{ flex: 1, height: 42, borderRadius: 9, backgroundColor: active ? COLORS.white : 'transparent', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: active ? 1 : 0, borderColor: active ? colors.borderColor : 'transparent' }}
                                            >
                                                <FeatherIcon name={icon} size={15} color={active ? COLORS.primary : colors.text} />
                                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: active ? COLORS.secondary : colors.text, marginLeft: 6 }]}>{label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {mode === 'question' ? (
                                    <View style={{ marginTop: 17 }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginBottom: 9 }]}>Choose a useful question</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                                            {BUYER_QUESTIONS.map((question) => {
                                                const active = message === question.message;
                                                return (
                                                    <TouchableOpacity
                                                        key={question.label}
                                                        onPress={() => chooseQuestion(question)}
                                                        style={{ width: '50%', paddingHorizontal: 4, marginBottom: 8 }}
                                                    >
                                                        <View style={{ minHeight: 60, borderRadius: 12, borderWidth: 1, borderColor: active ? COLORS.primary : colors.borderColor, backgroundColor: active ? COLORS.primaryLight : colors.card, padding: 10, justifyContent: 'center' }}>
                                                            <FeatherIcon name={question.icon} size={16} color={active ? COLORS.primary : colors.text} />
                                                            <Text numberOfLines={2} style={[FONTS.fontXs, FONTS.fontTitle, { color: active ? COLORS.secondary : colors.title, marginTop: 5 }]}>{question.label}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginTop: 7, marginBottom: 7 }]}>Your message</Text>
                                        <TextInput
                                            value={message}
                                            onChangeText={(value) => {
                                                setMessage(value);
                                                setError('');
                                            }}
                                            maxLength={1000}
                                            multiline
                                            textAlignVertical="top"
                                            placeholder="Write a question for the seller"
                                            placeholderTextColor={colors.textLight}
                                            style={[FONTS.fontSm, { minHeight: 82, borderRadius: 12, borderWidth: 1, borderColor: error ? COLORS.danger : colors.borderColor, backgroundColor: colors.background, color: colors.title, padding: 12, paddingTop: 11 }]}
                                        />
                                    </View>
                                ) : (
                                    <View style={{ marginTop: 17 }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginBottom: 7 }]}>Your offer in UGX</Text>
                                        <View style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: error ? COLORS.danger : colors.borderColor, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }}>
                                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginRight: 9 }]}>UGX</Text>
                                            <TextInput
                                                value={offerAmount}
                                                onChangeText={(value) => {
                                                    setOfferAmount(value.replace(/[^0-9]/g, ''));
                                                    setError('');
                                                }}
                                                keyboardType="number-pad"
                                                placeholder="Enter amount"
                                                placeholderTextColor={colors.textLight}
                                                style={[FONTS.font, FONTS.fontTitle, { flex: 1, height: '100%', color: colors.title }]}
                                            />
                                        </View>
                                        {offerSuggestions.length > 0 && (
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 }}>
                                                {offerSuggestions.map((amount) => (
                                                    <TouchableOpacity key={amount} onPress={() => { setOfferAmount(String(amount)); setError(''); }} style={{ borderRadius: 20, borderWidth: 1, borderColor: String(amount) === offerAmount ? COLORS.primary : colors.borderColor, backgroundColor: String(amount) === offerAmount ? COLORS.primaryLight : colors.card, paddingHorizontal: 11, paddingVertical: 7, marginRight: 7, marginBottom: 7 }}>
                                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: String(amount) === offerAmount ? COLORS.primary : colors.title }]}>{formatPrice(amount, 'UGX')}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                        <View style={{ borderRadius: 12, backgroundColor: dark ? colors.background : '#FFF7F2', padding: 11, flexDirection: 'row', marginTop: 7 }}>
                                            <FeatherIcon name="info" size={15} color={COLORS.primary} style={{ marginTop: 1 }} />
                                            <Text style={[FONTS.fontXs, { color: colors.text, flex: 1, lineHeight: 18, marginLeft: 7 }]}>The seller can accept, decline or discuss your offer in chat. Never pay before inspecting the item.</Text>
                                        </View>
                                    </View>
                                )}

                                {Boolean(error) && (
                                    <View style={{ borderRadius: 10, backgroundColor: '#FFF1F0', paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', marginTop: 11 }}>
                                        <FeatherIcon name="alert-circle" size={16} color={COLORS.danger} style={{ marginTop: 1 }} />
                                        <Text style={[FONTS.fontXs, { color: COLORS.danger, flex: 1, lineHeight: 18, marginLeft: 7 }]}>{error}</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    disabled={submitting}
                                    onPress={submit}
                                    style={{ height: 50, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 15, opacity: submitting ? 0.72 : 1 }}
                                >
                                    {submitting ? <ActivityIndicator size="small" color={COLORS.white} /> : <FeatherIcon name={mode === 'offer' ? 'tag' : 'send'} size={17} color={COLORS.white} />}
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 8 }]}>{submitting ? 'Opening chat...' : mode === 'offer' ? 'Send offer' : 'Start chat'}</Text>
                                </TouchableOpacity>
                                <Text style={[FONTS.fontXs, { color: colors.textLight, textAlign: 'center', lineHeight: 17, marginTop: 9 }]}>Your question or offer will appear in the conversation.</Text>
                            </ScrollView>
                        )}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default BuyerContactModal;
