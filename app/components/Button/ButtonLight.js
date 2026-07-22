import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';

const ButtonLight = ({ title, color, onPress, style, size, badge }) => {

    const theme = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={.8}
            onPress={() => onPress && onPress()}
            style={[{
                height: 48,
            }, size === 'sm' && {
                height: 28,
            }, size === 'lg' && {
                height: 58,
            }, style && { ...style }]}
        >
            <View
                style={[{
                    position: 'absolute',
                    height: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: color ? color : COLORS.primary,
                    opacity: .2,
                    borderRadius: 6,
                }, theme.dark && color === COLORS.secondary && {
                    backgroundColor: 'rgba(255,255,255,.4)',
                }]}
            />
            <View
                style={[{
                    paddingHorizontal: 25,
                    paddingVertical: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, size === 'sm' && {
                    paddingHorizontal: 20,
                    paddingVertical: 5,
                }, size === 'lg' && {
                    paddingHorizontal: 35,
                    paddingVertical: 16,
                }]}
            >
                <Text style={[
                    {
                        ...FONTS.h6,
                        ...FONTS.fontTitle,
                        color: color ? color : COLORS.primary,
                        textAlign: 'center',
                    }, size === 'sm' && {
                        fontSize: 12,
                    }, size === 'lg' && {
                        fontSize: 18,
                    }, theme.dark && color === COLORS.secondary && {
                        color: COLORS.white,
                    }
                ]}>{title}</Text>
                {badge &&
                    <View style={{ marginVertical: -4, marginLeft: 8 }}>
                        {badge()}
                    </View>
                }
            </View>
        </TouchableOpacity>
    );
};


export default ButtonLight;