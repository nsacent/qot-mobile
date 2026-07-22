import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

export const Followbtn = (props) => {

    const { title, onPress, color } = props;

    const theme = useTheme();
    const { colors } = theme;

    return (
        <TouchableOpacity
            onPress={onPress}
        >
            <View style={[GlobalStyleSheet.followbtn, { backgroundColor: COLORS.primary, borderRadius: 4 }]}>
                <Text style={GlobalStyleSheet.followbtnTxt}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}


export default Followbtn