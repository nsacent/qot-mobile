import React from 'react';
import { Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { COLORS, FONTS } from '../../../constants/theme';

const Privacy = ({ navigation }) => {
    const { colors } = useTheme();
    const items = [
        { icon: 'key', title: 'Reset password', detail: 'Receive a secure reset link by email', onPress: () => navigation.navigate('Changepassword') },
        { icon: 'shield', title: 'Privacy policy', detail: 'How QOT handles your information', onPress: () => navigation.navigate('LegalCenter', { tab: 'privacy' }) },
        { icon: 'file-text', title: 'Terms of use', detail: 'Rules for using QOT Uganda', onPress: () => navigation.navigate('LegalCenter', { tab: 'terms' }) },
        { icon: 'alert-triangle', title: 'Safety centre', detail: 'Tips for buying and selling safely', onPress: () => navigation.navigate('SafetyCenter') },
    ];

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Privacy & security" leftIcon="back" titleLeft />
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ backgroundColor: `${COLORS.primary}10`, borderRadius: 14, padding: 15, marginTop: 8, marginBottom: 18, flexDirection: 'row' }}>
                        <FeatherIcon name="lock" size={21} color={COLORS.primary} />
                        <View style={{ flex: 1, marginLeft: 11 }}>
                            <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Your security matters</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 3, lineHeight: 19 }]}>Never share verification codes or passwords with buyers, sellers, or QOT staff.</Text>
                        </View>
                    </View>

                    <View style={{ borderWidth: 1, borderColor: colors.borderColor, borderRadius: 15, overflow: 'hidden' }}>
                        {items.map((item, index) => (
                            <TouchableOpacity key={item.title} onPress={item.onPress} style={{ minHeight: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}>
                                <View style={{ height: 39, width: 39, borderRadius: 10, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={item.icon} size={18} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 11 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{item.title}</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{item.detail}</Text>
                                </View>
                                <FeatherIcon name="chevron-right" size={19} color={colors.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Privacy;
