import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';


export const Sharebtn = (props) => {

    const { title, onPress, white } = props;

    const theme = useTheme();
    const { colors } = theme;

    return (
        <TouchableOpacity
            onPress={onPress}
        >
            <View
                style={[GlobalStyleSheet.followbtn, { backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : white === true ? '#fff' : '#EFF3FA' }]}
            >
                <Text style={[GlobalStyleSheet.sharebtnTxt, { color: colors.title }]}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}


export default Sharebtn

