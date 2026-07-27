import React, { useEffect, useState } from 'react';
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
import { reportListing } from '../api/marketplace';
import { COLORS, FONTS } from '../constants/theme';
import { hasPrimaryVerification } from '../utils/verification';

export const REPORT_AD_REASONS = [
    { value: 'scam', label: 'Scam or fraud', icon: 'alert-octagon' },
    { value: 'fake', label: 'Fake or misleading ad', icon: 'eye-off' },
    { value: 'wrong_price', label: 'Wrong or misleading price', icon: 'dollar-sign' },
    { value: 'duplicate', label: 'Duplicate ad', icon: 'copy' },
    { value: 'wrong_category', label: 'Wrong category', icon: 'grid' },
    { value: 'prohibited', label: 'Prohibited item', icon: 'slash' },
    { value: 'sold_but_active', label: 'Already sold', icon: 'check-circle' },
    { value: 'suspicious_seller', label: 'Suspicious seller', icon: 'user-x' },
    { value: 'offensive', label: 'Offensive content', icon: 'flag' },
    { value: 'other', label: 'Something else', icon: 'more-horizontal' },
];

const ReportAdModal = ({
    visible,
    listingId,
    listingTitle,
    user,
    onClose,
    onSignIn,
    onVerify,
}) => {
    const { colors } = useTheme();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [reasonError, setReasonError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [requestError, setRequestError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setReason('');
        setDescription('');
        setReasonError('');
        setDescriptionError('');
        setRequestError('');
        setSubmitting(false);
        setSubmitted(false);
    }, [visible, listingId]);

    const close = () => {
        if (!submitting) onClose();
    };

    const chooseReason = (value) => {
        setReason(value);
        setReasonError('');
        setRequestError('');
        if (value !== 'other') setDescriptionError('');
    };

    const submit = async () => {
        const cleanDescription = description.trim();
        let invalid = false;

        if (!reason) {
            setReasonError('Choose the reason that best describes the problem.');
            invalid = true;
        }
        if (reason === 'other' && cleanDescription.length < 10) {
            setDescriptionError('Please add at least 10 characters so we can understand the issue.');
            invalid = true;
        } else if (cleanDescription && cleanDescription.length < 10) {
            setDescriptionError('Add a little more detail, or leave this field empty.');
            invalid = true;
        }
        if (invalid) return;

        setSubmitting(true);
        setRequestError('');
        try {
            await reportListing(listingId, { reason, description: cleanDescription });
            setSubmitted(true);
        } catch (error) {
            setRequestError(error.message || 'This report could not be sent. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const accessGate = !user
        ? {
            icon: 'log-in',
            title: 'Sign in to report this ad',
            message: 'Signing in helps us prevent false reports and lets our safety team follow up when needed.',
            action: 'Sign in',
            onPress: onSignIn,
        }
        : !hasPrimaryVerification(user)
            ? {
                icon: 'shield',
                title: 'Verify your account first',
                message: 'Only verified QOT members can report an ad. Verify your phone number, then come back here.',
                action: 'Verify account',
                onPress: onVerify,
            }
            : null;

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
                    style={{ flex: 1, backgroundColor: 'rgba(12,16,28,.62)', paddingHorizontal: 16, paddingVertical: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Pressable
                        accessibilityViewIsModal
                        onPress={() => {}}
                        style={{ width: '100%', maxWidth: 460, maxHeight: '94%', borderRadius: 22, backgroundColor: colors.card, overflow: 'hidden' }}
                    >
                        {accessGate ? (
                            <View style={{ padding: 22, alignItems: 'center' }}>
                                <View style={{ height: 64, width: 64, borderRadius: 21, backgroundColor: '#FFF1F0', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={accessGate.icon} size={27} color={COLORS.danger} />
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
                        ) : submitted ? (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <View style={{ height: 68, width: 68, borderRadius: 23, backgroundColor: '#EAF8F0', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="check" size={30} color="#18864B" />
                                </View>
                                <Text style={[FONTS.h6, { color: colors.title, textAlign: 'center', marginTop: 16 }]}>Report received</Text>
                                <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 21, marginTop: 7 }]}>Thanks for helping keep QOT safe. Our team will review this ad and take action if it breaks our rules.</Text>
                                <TouchableOpacity onPress={close} style={{ width: '100%', height: 49, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 21 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: '#FFF1F0', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="flag" size={21} color={COLORS.danger} />
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                        <Text style={[FONTS.h6, { color: colors.title }]}>Report this ad</Text>
                                        <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginTop: 3 }]}>Tell us what is wrong with “{listingTitle || 'this ad'}”.</Text>
                                    </View>
                                    <TouchableOpacity disabled={submitting} onPress={close} style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="x" size={18} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                {Boolean(requestError) && (
                                    <View style={{ borderRadius: 12, backgroundColor: '#FDECEC', borderWidth: 1, borderColor: '#F8B4B4', padding: 11, marginTop: 14, flexDirection: 'row' }}>
                                        <FeatherIcon name="alert-circle" size={16} color={COLORS.danger} style={{ marginTop: 1 }} />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger, flex: 1, marginLeft: 7 }]}>{requestError}</Text>
                                    </View>
                                )}

                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 18 }]}>What is the problem?</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                                    {REPORT_AD_REASONS.map((item) => {
                                        const selected = reason === item.value;
                                        return (
                                            <TouchableOpacity
                                                key={item.value}
                                                onPress={() => chooseReason(item.value)}
                                                style={{ width: '48.5%', minHeight: 58, borderRadius: 12, borderWidth: 1, borderColor: selected ? COLORS.primary : colors.borderColor, backgroundColor: selected ? `${COLORS.primary}10` : colors.background, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' }}
                                            >
                                                <FeatherIcon name={item.icon} size={15} color={selected ? COLORS.primary : colors.text} />
                                                <Text style={[FONTS.fontXs, selected ? FONTS.fontTitle : null, { color: selected ? COLORS.primary : colors.title, lineHeight: 17, flex: 1, marginLeft: 7 }]}>{item.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                {Boolean(reasonError) && <Text style={[FONTS.fontXs, { color: COLORS.danger, marginTop: 7 }]}>{reasonError}</Text>}

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 7 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flex: 1 }]}>More details</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.textLight }]}>{reason === 'other' ? 'Required' : 'Optional'}</Text>
                                </View>
                                <TextInput
                                    value={description}
                                    onChangeText={(value) => {
                                        setDescription(value);
                                        setDescriptionError('');
                                        setRequestError('');
                                    }}
                                    maxLength={1000}
                                    multiline
                                    textAlignVertical="top"
                                    placeholder="Add details that can help our safety team review this ad."
                                    placeholderTextColor={colors.textLight}
                                    style={[FONTS.font, { minHeight: 105, borderRadius: 13, borderWidth: 1, borderColor: descriptionError ? COLORS.danger : colors.borderColor, backgroundColor: colors.background, color: colors.title, padding: 13, paddingTop: 12 }]}
                                />
                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                    <Text style={[FONTS.fontXs, { color: COLORS.danger, flex: 1, paddingRight: 8 }]}>{descriptionError}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.textLight }]}>{description.length}/1000</Text>
                                </View>

                                <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 18, marginTop: 11 }]}>Reports are confidential. The seller will not see who submitted the report.</Text>

                                <View style={{ flexDirection: 'row', gap: 9, marginTop: 17 }}>
                                    <TouchableOpacity disabled={submitting} onPress={close} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={submitting} onPress={submit} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: COLORS.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: submitting ? 0.75 : 1 }}>
                                        {submitting ? <ActivityIndicator size="small" color={COLORS.white} /> : <FeatherIcon name="flag" size={15} color={COLORS.white} />}
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>{submitting ? 'Sending...' : 'Send report'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ReportAdModal;
