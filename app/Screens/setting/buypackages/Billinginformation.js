import React from 'react';
import { View, Text, SafeAreaView, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { ScrollView } from 'react-native-gesture-handler';
import { FONTS } from '../../../constants/theme';
import Button from '../../../components/Button/Button';

const Billinginformation = () => {

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Billing Information"
                leftIcon={"back"}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { flex: 1, paddingHorizontal: 20 }]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ ...FONTS.fontMedium, color: colors.title }}>Customer Information</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Do you have a GST number? *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Email'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Customer Name *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Business Name *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='GST Number *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ ...FONTS.fontMedium, color: colors.title }}>Customer Address</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Address Line 1 *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Address Line 2'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                color: colors.title,
                                height:48,
                            }]}
                        />
                    </View>
                </ScrollView>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <Button
                    title="Save"
                />
            </View>
        </SafeAreaView>
    )
}

export default Billinginformation;