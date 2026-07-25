import React, { useState } from 'react';
import { Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS } from '../../../constants/theme';

const GUIDES = {
    buyers: {
        label: 'Buyers',
        icon: 'shopping-bag',
        tips: [
            ['Inspect before paying', 'Meet in a safe public place and check the item carefully before sending money.'],
            ['Compare the details', 'Very low prices, urgent pressure and inconsistent photos can be warning signs.'],
            ['Keep chat on QOT', 'Use QOT messages for important details so the conversation remains available.'],
            ['Protect your money', 'Avoid advance payments for items you have not inspected or sellers you cannot verify.'],
        ],
    },
    sellers: {
        label: 'Sellers',
        icon: 'tag',
        tips: [
            ['Use accurate information', 'Show the real item, price, condition and location. Remove or mark an ad sold when it is no longer available.'],
            ['Choose safe meetings', 'Meet during daylight in a public place and tell someone where you are going.'],
            ['Confirm payment yourself', 'Check your own mobile-money or bank balance. Do not trust screenshots or forwarded payment messages.'],
            ['Protect personal data', 'Never share passwords, PINs, OTPs or account recovery codes with a buyer.'],
        ],
    },
    account: {
        label: 'Account',
        icon: 'lock',
        tips: [
            ['Verify your phone', 'A verified number strengthens trust and helps protect marketplace access.'],
            ['Use a strong password', 'Choose a unique password and do not reuse it on other services.'],
            ['Watch for impersonation', 'QOT staff will never ask for your password, PIN or verification code.'],
            ['Report quickly', 'Report suspicious ads and chats as soon as possible, including useful details for moderation.'],
        ],
    },
};

const SafetyCenter = ({ navigation }) => {
    const { colors } = useTheme();
    const [tab, setTab] = useState('buyers');
    const guide = GUIDES[tab];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Safety centre" leftIcon="back" titleLeft />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 38 }}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ marginTop: 8, borderRadius: 20, backgroundColor: '#FFF7E8', borderWidth: 1, borderColor: '#F3DFB7', padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ height: 48, width: 48, borderRadius: 16, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="shield" size={23} color={COLORS.white} /></View>
                            <View style={{ flex: 1, marginLeft: 11 }}><Text style={[FONTS.font, FONTS.fontTitle, { color: '#754400' }]}>Trade with confidence</Text><Text style={[FONTS.fontXs, { color: '#8A5A18', lineHeight: 17, marginTop: 3 }]}>Pause when something feels wrong. A genuine deal should not require secrecy or pressure.</Text></View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', borderRadius: 13, padding: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, marginTop: 14 }}>
                        {Object.entries(GUIDES).map(([key, value]) => {
                            const selected = tab === key;
                            return (
                                <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ flex: 1, minHeight: 42, borderRadius: 10, backgroundColor: selected ? COLORS.primary : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={value.icon} size={14} color={selected ? COLORS.white : colors.text} />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.text, marginLeft: 5 }]}>{value.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 19, marginBottom: 10 }]}>{guide.label} safety checklist</Text>
                    <View style={{ borderRadius: 17, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                        {guide.tips.map(([title, detail], index) => (
                            <View key={title} style={{ minHeight: 86, padding: 13, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ height: 35, width: 35, borderRadius: 11, backgroundColor: '#EAF8F0', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="check" size={16} color="#18864B" /></View>
                                <View style={{ flex: 1, marginLeft: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{title}</Text><Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 18, marginTop: 3 }]}>{detail}</Text></View>
                            </View>
                        ))}
                    </View>

                    <View style={{ borderRadius: 17, backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F8B4B4', padding: 14, marginTop: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ height: 38, width: 38, borderRadius: 12, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="alert-triangle" size={18} color={COLORS.white} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>Common scam warning</Text><Text style={[FONTS.fontXs, { color: '#9B2C2C', lineHeight: 17, marginTop: 2 }]}>Never share an OTP, PIN or password—even if someone claims to work for QOT.</Text></View></View>
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 22, marginBottom: 9 }]}>Need help now?</Text>
                    <View style={{ flexDirection: 'row', gap: 9 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Items')} style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="flag" size={15} color={COLORS.white} /><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, marginLeft: 6 }]}>Find an ad to report</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:info@qot.ug?subject=QOT%20safety%20support')} style={{ flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="mail" size={15} color={COLORS.primary} /><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 6 }]}>Contact QOT</Text></TouchableOpacity>
                    </View>
                    <Text style={[FONTS.fontXs, { color: colors.textLight, textAlign: 'center', lineHeight: 17, marginTop: 14 }]}>If anyone is in immediate danger, stop the transaction and contact the appropriate local emergency service.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SafetyCenter;
