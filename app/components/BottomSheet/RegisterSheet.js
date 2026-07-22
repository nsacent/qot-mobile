import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import { useTheme } from '@react-navigation/native';
import { FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CustomInput from '../Input/CustomInput';
import CustomButton from '../CustomButton';

const RegisterSheet = ({sheetRef}) => {

    const {colors} = useTheme();

    return (
        <View style={GlobalStyleSheet.container}>
            <View
                style={{
                    flexDirection:'row',
                    alignItems:'center',
                    paddingBottom:15,
                    marginBottom:20,
                    borderBottomWidth:1,
                    borderBottomColor:colors.border,
                }}
            >
                <Text style={{flex:1,...FONTS.h6,color:colors.title}}>Register</Text>
                <TouchableOpacity
                    onPress={() => sheetRef.current.close()}
                    style={{
                        height:32,
                        width:32,
                        borderRadius:32,
                        backgroundColor:colors.background,
                        alignItems:'center',
                        justifyContent:'center',
                    }}
                >
                    <FeatherIcon size={20} color={colors.title} name="x"/>
                </TouchableOpacity>
            </View>
            <View style={{marginBottom:15}}>
                <Text style={{...FONTS.font,color:colors.title,marginBottom:4}}>Username</Text>
                <CustomInput
                    value={''}    
                    placeholder={'Type Username Here'}
                    onChangeText={(value)=> console.log(value)}
                />
            </View>
            <View style={{marginBottom:15}}>
                <Text style={{...FONTS.font,color:colors.title,marginBottom:4}}>Email</Text>
                <CustomInput
                    value={''}    
                    placeholder={'Type Email Here'}
                    onChangeText={(value)=> console.log(value)}
                />
            </View>
            <View style={{marginBottom:25}}>
                <Text style={{...FONTS.font,color:colors.title,marginBottom:4}}>Password</Text>
                <CustomInput
                    value={''}   
                    type="password" 
                    placeholder={'Type Password Here'}
                    onChangeText={(value)=> console.log(value)}
                />
            </View>
            <CustomButton 
                title={'Register'}
            />
        </View>
    );
};



export default RegisterSheet;