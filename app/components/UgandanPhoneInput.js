import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';
import { ugandanNationalDigits } from '../utils/phoneNumbers';

const UgandanPhoneInput = ({ value, onChangeText, returnKeyType = 'done', onSubmitEditing }) => {
    const { colors } = useTheme();

    return (
        <View style={{ height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.input, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
            <View style={{ alignSelf: 'stretch', minWidth: 72, paddingHorizontal: 13, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: `${COLORS.primary}0D`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary }]}>+256</Text>
            </View>
            <TextInput
                value={ugandanNationalDigits(value)}
                onChangeText={(text) => onChangeText(ugandanNationalDigits(text))}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                maxLength={9}
                placeholder="7XX XXX XXX"
                placeholderTextColor={colors.textLight}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                style={[FONTS.font, { color: colors.title, flex: 1, height: '100%', paddingHorizontal: 14, letterSpacing: 0.6 }]}
            />
        </View>
    );
};

export default UgandanPhoneInput;
