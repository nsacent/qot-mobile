import React from 'react';
import {
    Linking,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS } from '../constants/theme';

const TERMS_URL = 'https://qot.ug/terms';
const PRIVACY_URL = 'https://qot.ug/privacy';

const openUrl = (url) => {
    Linking.openURL(url).catch(() => undefined);
};

const TermsAcceptance = ({ accepted, colors, onToggle }) => {
    const { dark } = useTheme();
    const accentColor = dark ? '#FDBA74' : '#9A3412';

    return (
        <View
            style={{
                borderWidth: 1,
                borderColor: accepted ? accentColor : (dark ? '#7C4A25' : '#FDBA74'),
                backgroundColor: dark ? '#292019' : '#FFF7ED',
                borderRadius: 13,
                marginBottom: 16,
            }}
        >
            <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityLabel="Accept QOT Terms of Service and Privacy Policy"
                accessibilityState={{ checked: accepted }}
                onPress={onToggle}
                activeOpacity={0.75}
                style={{
                    minHeight: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                }}
            >
                <View
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{
                        width: 26,
                        height: 26,
                        borderWidth: 2,
                        borderRadius: 6,
                        borderColor: accepted ? accentColor : (dark ? '#CBD5E1' : '#475569'),
                        backgroundColor: accepted ? accentColor : colors.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        flexShrink: 0,
                    }}
                >
                    {accepted && <FeatherIcon name="check" size={18} color={dark ? '#0F172A' : '#FFFFFF'} />}
                </View>
                <Text style={[FONTS.fontTitle, { color: colors.title, fontSize: 15, lineHeight: 22, flex: 1 }]}>
                    I agree to QOT's Terms of Service and Privacy Policy.
                </Text>
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18 }}>
                    <TouchableOpacity
                        accessibilityRole="link"
                        onPress={() => openUrl(TERMS_URL)}
                        style={{ minHeight: 44, justifyContent: 'center' }}
                    >
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: accentColor, textDecorationLine: 'underline' }]}>
                            Terms of Service
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="link"
                        onPress={() => openUrl(PRIVACY_URL)}
                        style={{ minHeight: 44, justifyContent: 'center' }}
                    >
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: accentColor, textDecorationLine: 'underline' }]}>
                            Privacy Policy
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 19, marginTop: 2 }]}>
                    QOT has zero tolerance for objectionable content or abusive users; violations may be removed and accounts suspended.
                </Text>
            </View>
        </View>
    );
};

export default TermsAcceptance;
