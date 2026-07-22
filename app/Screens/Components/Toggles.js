import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Header from '../../layout/Header';
import { COLORS, FONTS } from '../../constants/theme';
import ToggleStyle1 from '../../components/Toggles/ToggleStyle1';
import ToggleStyle2 from '../../components/Toggles/ToggleStyle2';
import ToggleStyle3 from '../../components/Toggles/ToggleStyle3';

const Toggles = () => {

    const {colors} = useTheme();

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View style={{flex:1,backgroundColor:colors.background}}>
                <Header title={'Toggles'} titleLeft leftIcon={'back'}/>
                <ScrollView>
                    <View style={{...GlobalStyleSheet.container}}>
                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={GlobalStyleSheet.cardBody}>
                                <View
                                    style={{
                                        paddingVertical:14,
                                        borderBottomWidth:1,
                                        borderBottomColor:colors.border,
                                        flexDirection:"row",
                                        alignItems:'center',
                                        justifyContent:'space-between',
                                    }}
                                >
                                    <Text style={{...FONTS.font,color:colors.title,...FONTS.fontTitle}}>Classic toggle</Text>
                                    
                                    <ToggleStyle1/>
                                    
                                </View>
                                <View
                                    style={{
                                        paddingVertical:14,
                                        borderBottomWidth:1,
                                        borderBottomColor:colors.border,
                                        flexDirection:"row",
                                        alignItems:'center',
                                        justifyContent:'space-between',
                                    }}
                                >
                                    <Text style={{...FONTS.font,color:colors.title,...FONTS.fontTitle}}>Toggle with Icon</Text>
                                    
                                    <ToggleStyle2/>
                                    
                                </View>
                                <View
                                    style={{
                                        paddingVertical:14,
                                        borderBottomWidth:1,
                                        borderBottomColor:colors.border,
                                        flexDirection:"row",
                                        alignItems:'center',
                                        justifyContent:'space-between',
                                    }}
                                >
                                    <Text style={{...FONTS.font,color:colors.title,...FONTS.fontTitle}}>Toggle with text</Text>
                                    
                                    <ToggleStyle3/>
                                    
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default Toggles;