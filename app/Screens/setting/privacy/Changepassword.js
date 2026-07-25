import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS } from '../../../constants/theme';
import { requestPasswordReset } from '../../../api/account';
import { useAuth } from '../../../context/AuthContext';

const Changepassword = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const sendLink = async () => {
        if (!user?.email) {
            setError('Add an email address to your QOT account before resetting your password.');
            return;
        }
        setSending(true);
        setError('');
        setSuccess('');
        try {
            const result = await requestPasswordReset(user.email);
            setSuccess(result?.message || 'A password reset link has been sent to your email.');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Reset password" leftIcon="back" titleLeft />
            <View style={[GlobalStyleSheet.container, { flex: 1, justifyContent: 'center', paddingBottom: 70 }]}>
                <View style={{ height: 72, width: 72, borderRadius: 36, alignSelf: 'center', backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                    <FeatherIcon name="key" size={31} color={COLORS.primary} />
                </View>
                <Text style={[FONTS.h4, { color: colors.title, textAlign: 'center', marginTop: 19 }]}>Create a new password</Text>
                <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', marginTop: 8, lineHeight: 21, paddingHorizontal: 10 }]}>For your security, QOT will send a password reset link to your registered email address.</Text>

                <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginTop: 22 }}>
                    <FeatherIcon name="mail" size={18} color={COLORS.primary} />
                    <Text numberOfLines={1} style={[FONTS.font, { color: user?.email ? colors.title : colors.text, flex: 1, marginLeft: 10 }]}>{user?.email || 'No email address on this account'}</Text>
                    <FeatherIcon name="lock" size={15} color={colors.textLight} />
                </View>

                {Boolean(error || success) && (
                    <View style={{ backgroundColor: error ? '#FDECEC' : '#EAF8F0', borderRadius: 11, padding: 12, marginTop: 14, flexDirection: 'row' }}>
                        <FeatherIcon name={error ? 'alert-circle' : 'check-circle'} size={18} color={error ? COLORS.danger : '#18864B'} />
                        <Text style={[FONTS.fontSm, { color: error ? COLORS.danger : '#18864B', flex: 1, marginLeft: 8, lineHeight: 19 }]}>{error || success}</Text>
                    </View>
                )}

                <TouchableOpacity disabled={sending || Boolean(success)} onPress={sendLink} style={{ height: 52, borderRadius: 11, backgroundColor: sending || success ? '#FDBA74' : COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 18 }}>
                    {sending && <ActivityIndicator color={COLORS.white} style={{ marginRight: 9 }} />}
                    <Text style={[FONTS.fontLg, FONTS.fontTitle, { color: COLORS.white }]}>{sending ? 'Sending link...' : success ? 'Reset link sent' : 'Send reset link'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Changepassword;
