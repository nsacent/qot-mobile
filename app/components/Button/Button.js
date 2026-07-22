import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const Button = ({title,color,onPress,style,size,badge}) => {
    return (
        <TouchableOpacity
            activeOpacity={.8}
            onPress={()=> onPress && onPress()}
            style={[{
                height:48,
                paddingHorizontal:25,
                paddingVertical:13,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'center',
                borderRadius:SIZES.radius,
                backgroundColor:color ? color :COLORS.primary,
            },size === 'sm' && {
                paddingHorizontal:25,
                paddingVertical:10,
                height:40,
            },size === 'lg' && {
                paddingHorizontal:35,
                paddingVertical:16,
                height:58,
            },style && {...style}]}
        >
            <Text style={[
                {
                    ...FONTS.h6,
                    ...FONTS.fontTitle,
                    textAlign:'center',
                    color:COLORS.white,
                },size === 'sm' && {
                    fontSize:14,
                },size === 'lg' && {
                    fontSize:18,
                }
            ]}>{title}</Text>
            {badge && 
                <View style={{marginVertical:-4,marginLeft:8}}>
                    {badge()}
                </View>
            }
        </TouchableOpacity>
    );
};


export default Button;