import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';

const ButtonOutline = ({ title, color, onPress, style, size, badge }) => {

    const theme = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={.8}
            onPress={() => onPress && onPress()}
            style={[{
                height: 48,
            }, size === 'sm' && {
                height: 35,
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
                    borderWidth: 1,
                    borderColor: color ? color : theme.dark ? 'rgba(255,255,255,255)' : COLORS.secondary,
                    opacity: .5,
                    borderRadius: 6
                }, theme.dark && color === COLORS.primary && {
                    borderColor: 'rgba(255,255,255,.5)',
                }]}
            />
            <View
                style={[{
                    paddingHorizontal: 25,
                    paddingVertical: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
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
                        textAlign: 'center',
                        color: color ? color : theme.dark ? COLORS.primary : COLORS.secondary,
                    }, size === 'sm' && {
                        fontSize: 16,
                    }, size === 'lg' && {
                        fontSize: 18,
                    }, theme.dark && color === COLORS.primary && {
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


export default ButtonOutline;