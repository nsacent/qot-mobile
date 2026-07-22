import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import CustomButton from '../CustomButton';

const OptionBar = ({close}) => {

    const {colors} = useTheme();

    return (
        <>
            <View style={{
                alignItems:'center',
                paddingHorizontal:30,
                paddingVertical:30,
                paddingBottom:30,
                backgroundColor:colors.card,
                marginHorizontal:30,
                maxWidth:340,
                borderRadius:SIZES.radius,
            }}>
                <Ionicons name='information-circle-sharp' style={{marginBottom:8}} color={COLORS.primary} size={60}/>
                <Text style={{...FONTS.h5,color:colors.title,marginBottom:5}}>Are You Confirm?</Text>
                <Text style={{...FONTS.font,color:colors.text,textAlign:'center'}}>You want to cancel the order of T-shirt.</Text>
                <View style={{flexDirection:'row',marginTop:25}}>
                    <CustomButton 
                        onPress={() => close(false)}
                        style={{marginRight:10}} outline color={COLORS.secondary} btnSm title="Cancel"/>
                    <CustomButton 
                        onPress={() => close(false)}
                        btnSm title="Confirm"/>
                </View>
            </View>
        </>
    );
};


export default OptionBar;