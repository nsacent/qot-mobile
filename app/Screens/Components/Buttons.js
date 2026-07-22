import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import Button from '../../components/Button/Button';
import ButtonLight from '../../components/Button/ButtonLight';
import ButtonOutline from '../../components/Button/ButtonOutline';
import Badge from '../../components/Badge/Badge';

const Buttons = () => {

    const {colors} = useTheme();

    return (
        <>
            <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
                <View
                    style={{
                        flex:1,
                        backgroundColor:colors.background,
                    }}
                >
                    <Header 
                        titleLeft
                        title={'Buttons'} 
                        leftIcon={'back'}
                    />
                    <ScrollView>
                        <View style={GlobalStyleSheet.container}>
                            <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                                <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                    <Text style={{...FONTS.h6,color:colors.title}}>Classic Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={GlobalStyleSheet.row}>
                                        <Button 
                                            title={'Primary'}
                                            style={{marginRight:8,marginBottom:8}}
                                            />  
                                        <Button 
                                            color={COLORS.secondary}
                                            title={'Secondary'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <Button 
                                            color={COLORS.danger}
                                            title={'Danger'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <Button 
                                            color={COLORS.success}
                                            title={'Success'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                                <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                    <Text style={{...FONTS.h6,color:colors.title}}>Button Light</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={GlobalStyleSheet.row}>
                                        <ButtonLight
                                            title={'Primary'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonLight 
                                            color={COLORS.secondary}
                                            title={'Secondary'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonLight 
                                            color={COLORS.danger}
                                            title={'Danger'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonLight 
                                            color={COLORS.success}
                                            title={'Success'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                                <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                    <Text style={{...FONTS.h6,color:colors.title}}>Button Outline</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={GlobalStyleSheet.row}>
                                        <ButtonOutline
                                            title={'Primary'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonOutline 
                                            color={COLORS.secondary}
                                            title={'Secondary'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonOutline 
                                            color={COLORS.danger}
                                            title={'Danger'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonOutline 
                                            color={COLORS.success}
                                            title={'Success'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                                <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.borderColor}]}>
                                    <Text style={{...FONTS.h6,color:colors.title}}>Badge Button</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={GlobalStyleSheet.row}>
                                        <Button 
                                            title={'Notification'}
                                            badge={() => <Badge rounded color={COLORS.white} title={'8'}/>}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <ButtonOutline 
                                            title={'Cart'}
                                            color={COLORS.secondary}
                                            badge={() => <Badge rounded color={COLORS.secondary} title={'2'}/>}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                    </View>
                                </View>
                            </View>
                            <View style={[GlobalStyleSheet.card,GlobalStyleSheet.shadow,{backgroundColor:colors.card}]}>
                                <View style={[GlobalStyleSheet.cardHeader,{borderBottomColor:colors.border}]}>
                                    <Text style={{...FONTS.h6,color:colors.title}}>Button Size</Text>
                                </View>
                                <View
                                    style={GlobalStyleSheet.cardBody}
                                >
                                    <View style={GlobalStyleSheet.row}>
                                        <Button 
                                            size={'sm'}
                                            title={'Small'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <Button 
                                            title={'Medium'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                        <Button 
                                            size={'lg'}
                                            title={'Large'}
                                            style={{marginRight:8,marginBottom:8}}
                                        />  
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    );
};

export default Buttons;