import React, { useEffect, useState } from 'react';
import { Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS } from '../../../constants/theme';

const CONTENT = {
    privacy: {
        title: 'Privacy guide',
        intro: 'A clear overview of how QOT Uganda handles marketplace and account information.',
        sections: [
            ['Information QOT uses', 'Account details, verification information, profile content, ads, messages, saved activity, reports, reviews and technical usage data.'],
            ['Why it is used', 'To operate the marketplace, secure accounts, verify users, deliver messages and notifications, moderate content and improve QOT.'],
            ['Sharing and visibility', 'Public profile and ad information is visible to marketplace users. QOT may use service providers and respond to valid legal or safety requirements.'],
            ['Your choices', 'You can update profile details and notification preferences from Account settings, and contact QOT about privacy questions.'],
            ['Data safety', 'QOT uses safeguards designed to protect data, but no online service can guarantee absolute security. Protect your password and OTPs.'],
        ],
        url: 'https://qot.ug/privacy',
    },
    terms: {
        title: 'Terms guide',
        intro: 'The main responsibilities that apply when you buy, sell or communicate through QOT Uganda.',
        sections: [
            ['Your account', 'Provide accurate information, protect your login details and do not use another person’s account without permission.'],
            ['Ads and prohibited content', 'Post genuine items in the correct category with accurate photos, price, condition and location. Illegal, unsafe, misleading or duplicate ads may be removed.'],
            ['Transactions', 'Buyers and sellers are responsible for inspecting items, agreeing terms and completing transactions safely. QOT is a marketplace platform, not the seller of listed items.'],
            ['Messages, reviews and reports', 'Communications and reviews must be genuine and respectful. Reports must be made honestly and may be reviewed by moderation.'],
            ['Moderation', 'QOT may review, restrict, reject or remove content and accounts to enforce marketplace rules and protect users.'],
        ],
        url: 'https://qot.ug/terms',
    },
};

const LegalCenter = ({ route }) => {
    const { colors } = useTheme();
    const [tab, setTab] = useState(route.params?.tab === 'terms' ? 'terms' : 'privacy');

    useEffect(() => {
        if (route.params?.tab === 'privacy' || route.params?.tab === 'terms') setTab(route.params.tab);
    }, [route.params?.tab]);

    const content = CONTENT[tab];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Legal & privacy" leftIcon="back" titleLeft />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 38 }}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ flexDirection: 'row', borderRadius: 13, padding: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, marginTop: 8 }}>
                        {[['privacy', 'Privacy'], ['terms', 'Terms of use']].map(([key, label]) => <TouchableOpacity key={key} onPress={() => setTab(key)} style={{ flex: 1, minHeight: 40, borderRadius: 10, backgroundColor: tab === key ? COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: tab === key ? COLORS.white : colors.text }]}>{label}</Text></TouchableOpacity>)}
                    </View>

                    <View style={{ borderRadius: 18, backgroundColor: tab === 'privacy' ? '#EAF8F0' : '#FFF7ED', padding: 15, marginTop: 14, flexDirection: 'row' }}>
                        <View style={{ height: 43, width: 43, borderRadius: 14, backgroundColor: tab === 'privacy' ? '#18864B' : '#EA580C', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={tab === 'privacy' ? 'shield' : 'file-text'} size={20} color={COLORS.white} /></View>
                        <View style={{ flex: 1, marginLeft: 11 }}><Text style={[FONTS.font, FONTS.fontTitle, { color: tab === 'privacy' ? '#176B44' : '#9A3412' }]}>{content.title}</Text><Text style={[FONTS.fontXs, { color: tab === 'privacy' ? '#39805F' : '#C2410C', lineHeight: 18, marginTop: 3 }]}>{content.intro}</Text></View>
                    </View>

                    <View style={{ borderRadius: 17, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden', marginTop: 14 }}>
                        {content.sections.map(([title, detail], index) => (
                            <View key={title} style={{ padding: 14, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ height: 31, width: 31, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>{index + 1}</Text></View>
                                <View style={{ flex: 1, marginLeft: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{title}</Text><Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 19, marginTop: 4 }]}>{detail}</Text></View>
                            </View>
                        ))}
                    </View>

                    <View style={{ borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, padding: 13, marginTop: 14 }}><Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 18 }]}>This in-app guide is a readable summary. The complete published document on qot.ug is the official version.</Text></View>
                    <TouchableOpacity onPress={() => Linking.openURL(content.url)} style={{ height: 49, borderRadius: 12, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 13 }}><FeatherIcon name="external-link" size={16} color={COLORS.white} /><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>Read the full {tab === 'privacy' ? 'privacy policy' : 'terms'}</Text></TouchableOpacity>
                    <Text style={[FONTS.fontXs, { color: colors.textLight, textAlign: 'center', marginTop: 13 }]}>Questions? Email info@qot.ug or call 0200 911 678.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LegalCenter;
