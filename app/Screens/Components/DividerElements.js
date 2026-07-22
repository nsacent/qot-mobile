import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Divider from '../../components/Dividers/Divider';
import DividerIcon from '../../components/Dividers/DividerIcon';

const DividerElements = () => {

    const {colors} = useTheme();

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header 
                    titleLeft
                    title={'Seprators'}
                    leftIcon={'back'}
                />
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Simple Dividers</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <Divider/>
                                <Divider color={COLORS.danger}/>
                                <Divider color={COLORS.primary}/>
                                <Divider color={COLORS.secondary}/>
                                <Divider color={COLORS.info}/>
                                <Divider color={colors.title}/>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Dashed Dividers</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <Divider dashed/>
                                <Divider dashed color={COLORS.danger}/>
                                <Divider dashed color={COLORS.primary}/>
                                <Divider dashed color={COLORS.secondary}/>
                                <Divider dashed color={COLORS.info}/>
                                <Divider dashed color={colors.title}/>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Dividers with icon</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <DividerIcon icon={<FeatherIcon name={'x'} color={colors.text} size={18}/>}/>
                                <DividerIcon color={COLORS.danger} icon={<FeatherIcon name={'alert-circle'} color={COLORS.danger} size={18}/>}/>
                                <DividerIcon color={COLORS.primary} icon={<FeatherIcon name={'alert-triangle'} color={COLORS.primary} size={18}/>}/>
                                <DividerIcon color={COLORS.secondary} icon={<FeatherIcon name={'sun'} color={COLORS.secondary} size={18}/>}/>
                                <DividerIcon color={COLORS.info} icon={<FeatherIcon name={'truck'} color={COLORS.info} size={18}/>}/>
                                <DividerIcon color={colors.title} icon={<FeatherIcon name={'settings'} color={colors.title} size={18}/>}/>
                            </View>
                        </View>

                        <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                            <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                <Text style={{...FONTS.h6,color:colors.title}}>Dividers with icon</Text>
                            </View>
                            <View style={GlobalStyleSheet.cardBody}>
                                <DividerIcon dashed icon={<FeatherIcon name={'x'} color={colors.text} size={18}/>}/>
                                <DividerIcon dashed color={COLORS.danger} icon={<FeatherIcon name={'alert-circle'} color={COLORS.danger} size={18}/>}/>
                                <DividerIcon dashed color={COLORS.primary} icon={<FeatherIcon name={'alert-triangle'} color={COLORS.primary} size={18}/>}/>
                                <DividerIcon dashed color={COLORS.secondary} icon={<FeatherIcon name={'sun'} color={COLORS.secondary} size={18}/>}/>
                                <DividerIcon dashed color={COLORS.info} icon={<FeatherIcon name={'truck'} color={COLORS.info} size={18}/>}/>
                                <DividerIcon dashed color={colors.title} icon={<FeatherIcon name={'settings'} color={colors.title} size={18}/>}/>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default DividerElements;