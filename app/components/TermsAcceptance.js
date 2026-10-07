import React from 'react';
import {
    Linking,
    Text,
    View,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { COLORS, FONTS } from '../constants/theme';

const TERMS_URL = 'https://qot.ug/terms';
const PRIVACY_URL = 'https://qot.ug/privacy';

const openUrl = (url) => {
    Linking.openURL(url).catch(() => undefined);
};

const TermsAcceptance = ({ accepted, colors, onToggle }) => (
    <View
        accessibilityLabel="Terms and safety agreement"
        style={{
            borderWidth: 1,
            borderColor: accepted ? COLORS.primary : colors.borderColor,
            backgroundColor: accepted ? '#FFF7ED' : colors.card,
            borderRadius: 13,
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 10,
            paddingHorizontal: 9,
            marginBottom: 16,
        }}
    >
        <Checkbox
            accessibilityLabel="Accept QOT Terms of Service and Privacy Policy"
            status={accepted ? 'checked' : 'unchecked'}
            onPress={onToggle}
            color={COLORS.primary}
            uncheckedColor={colors.textLight}
        />
        <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 18, flex: 1, paddingTop: 3 }] }>
            I agree to QOT's{' '}
            <Text
                accessibilityRole="link"
                onPress={() => openUrl(TERMS_URL)}
                style={[FONTS.fontTitle, { color: COLORS.primary }]}
            >
                Terms of Service
            </Text>
            {' '}and{' '}
            <Text
                accessibilityRole="link"
                onPress={() => openUrl(PRIVACY_URL)}
                style={[FONTS.fontTitle, { color: COLORS.primary }]}
            >
                Privacy Policy
            </Text>
            . QOT has zero tolerance for objectionable content or abusive users; violations may be removed and accounts suspended.
        </Text>
    </View>
);

export default TermsAcceptance;
