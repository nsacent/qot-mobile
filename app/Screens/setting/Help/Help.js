import React, { useMemo, useState } from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS } from '../../../constants/theme';

const FAQS = [
    {
        question: 'How do I post an ad?',
        answer: 'Tap the orange plus button, choose the correct category, upload clear photos, complete the details and submit the ad for review.',
        tags: 'post sell advert photos review',
    },
    {
        question: 'Why is my ad pending approval?',
        answer: 'QOT reviews new and edited ads for safety and quality. You can follow its status and any moderation message from My ads.',
        tags: 'pending approval moderation rejected',
    },
    {
        question: 'How do I contact a seller?',
        answer: 'Open the ad and use Chat seller. Keep important conversations inside QOT so you can refer back to them if a problem occurs.',
        tags: 'chat seller message contact',
    },
    {
        question: 'How do I report a suspicious ad?',
        answer: 'Open the ad, choose Report ad and select the reason that best describes the problem. Add useful details for the moderation team.',
        tags: 'report scam suspicious fake safety',
    },
    {
        question: 'How do I verify my account?',
        answer: 'Go to My Account and tap Verify your phone number. Enter the OTP sent to your Ugandan mobile number.',
        tags: 'verify otp phone account',
    },
    {
        question: 'How do saved searches work?',
        answer: 'Apply your preferred filters on Browse Ads, save the search, then find it later under Saved searches.',
        tags: 'saved search filters alerts',
    },
    {
        question: 'I forgot my password. What should I do?',
        answer: 'Use Forgot password on the sign-in screen. QOT will send reset instructions to the email connected to your account.',
        tags: 'forgot reset password login email',
    },
];

const QuickLink = ({ icon, title, detail, color, background, onPress }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={{ width: '48.4%', minHeight: 116, borderRadius: 17, padding: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor }}>
            <View style={{ height: 38, width: 38, borderRadius: 12, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={icon} size={18} color={color} /></View>
            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 12 }]}>{title}</Text>
            <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, fontSize: 9, lineHeight: 14, marginTop: 3 }]}>{detail}</Text>
        </TouchableOpacity>
    );
};

const Help = ({ navigation }) => {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [openQuestion, setOpenQuestion] = useState(null);

    const visibleFaqs = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return FAQS;
        return FAQS.filter((item) => `${item.question} ${item.answer} ${item.tags}`.toLowerCase().includes(search));
    }, [query]);

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Help & support" leftIcon="back" titleLeft />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 38 }}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ borderRadius: 19, backgroundColor: '#EEF3FF', padding: 16, marginTop: 8, overflow: 'hidden' }}>
                        <View style={{ position: 'absolute', height: 120, width: 120, borderRadius: 60, right: -37, top: -53, backgroundColor: '#DCE6FF' }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="help-circle" size={22} color={COLORS.white} /></View>
                            <View style={{ flex: 1, marginLeft: 11 }}><Text style={[FONTS.font, FONTS.fontTitle, { color: '#18336D' }]}>How can we help?</Text><Text style={[FONTS.fontXs, { color: '#49618F', lineHeight: 17, marginTop: 3 }]}>Find quick answers or contact QOT Uganda.</Text></View>
                        </View>
                        <View style={{ height: 48, borderRadius: 13, backgroundColor: COLORS.white, marginTop: 15, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center' }}>
                            <FeatherIcon name="search" size={17} color="#71809F" />
                            <TextInput value={query} onChangeText={setQuery} placeholder="Search help topics" placeholderTextColor="#8B97AE" autoCorrect={false} style={[FONTS.font, { color: '#18213A', flex: 1, height: '100%', marginLeft: 8 }]} />
                            {Boolean(query) && <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}><FeatherIcon name="x" size={17} color="#71809F" /></TouchableOpacity>}
                        </View>
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 22, marginBottom: 9 }]}>Quick help</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
                        <QuickLink icon="shield" title="Safety centre" detail="Buy, sell and meet more safely" color="#B56700" background="#FFF3DC" onPress={() => navigation.navigate('SafetyCenter')} />
                        <QuickLink icon="lock" title="Privacy" detail="How QOT uses your information" color="#176B44" background="#E9F8EF" onPress={() => navigation.navigate('LegalCenter', { tab: 'privacy' })} />
                        <QuickLink icon="file-text" title="Terms" detail="Rules for using QOT Uganda" color="#EA580C" background="#FFF7ED" onPress={() => navigation.navigate('LegalCenter', { tab: 'terms' })} />
                        <QuickLink icon="key" title="Password" detail="Recover access to your account" color="#2457C5" background="#E9F2FF" onPress={() => navigation.navigate('ResetPassword')} />
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 22, marginBottom: 9 }]}>Frequently asked questions</Text>
                    {visibleFaqs.length ? (
                        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                            {visibleFaqs.map((item, index) => {
                                const open = openQuestion === item.question;
                                return (
                                    <TouchableOpacity key={item.question} onPress={() => setOpenQuestion(open ? null : item.question)} activeOpacity={0.86} style={{ backgroundColor: colors.card, padding: 14, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flex: 1, paddingRight: 10 }]}>{item.question}</Text><FeatherIcon name={open ? 'minus' : 'plus'} size={17} color={COLORS.primary} /></View>
                                        {open && <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 19, marginTop: 9 }]}>{item.answer}</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={{ borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, padding: 24, alignItems: 'center' }}><FeatherIcon name="search" size={24} color={colors.textLight} /><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 9 }]}>No matching help topic</Text><Text style={[FONTS.fontXs, { color: colors.text, textAlign: 'center', marginTop: 4 }]}>Try fewer words or contact the QOT team below.</Text></View>
                    )}

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 22, marginBottom: 9 }]}>Contact QOT Uganda</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                        {[
                            ['mail', 'Email support', 'info@qot.ug', () => Linking.openURL('mailto:info@qot.ug?subject=QOT%20Uganda%20support')],
                            ['phone', 'Call support', '0200 911 678', () => Linking.openURL('tel:0200911678')],
                        ].map(([icon, title, detail, onPress], index) => (
                            <TouchableOpacity key={title} onPress={onPress} style={{ minHeight: 68, paddingHorizontal: 13, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 38, width: 38, borderRadius: 11, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={icon} size={17} color={COLORS.primary} /></View>
                                <View style={{ flex: 1, marginLeft: 11 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{title}</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{detail}</Text></View>
                                <FeatherIcon name="external-link" size={16} color={colors.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Help;
