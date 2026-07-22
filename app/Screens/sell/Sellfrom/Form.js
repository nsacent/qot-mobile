import React from 'react'
import { View, Text, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { FONTS, SIZES } from '../../../constants/theme';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import Button from '../../../components/Button/Button';



const Form = ({ navigation }) => {

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Include some details"
                leftIcon={'back'}
                titleLeft
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <View style={[GlobalStyleSheet.container, { marginTop: 10, flex: 1, paddingHorizontal: 20 }]}>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Brand *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48

                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Year *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='Fuel *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48
                            }]}
                        />
                    </View>
                    <View>
                        <Text style={[FONTS.font, { color: colors.title, fontSize: 15 }]}>Transmission</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                <ButtonOutline
                                    title="Automatic"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ButtonOutline
                                    title="Manual"
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='KM driven'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <TextInput
                            placeholder='No. of Owners'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48
                            }]}
                        />
                    </View>
                    <View style={{ marginBottom: 10 }}>
                        <TextInput
                            placeholder='Ad title *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48
                            }]}
                        />
                    </View>
                    <Text style={[FONTS.font, { color: colors.title, marginBottom: 20 }]}>Mention the key features of your item (e.g.brand, model, age, type)</Text>

                    <View style={{ marginBottom: 10 }}>
                        <TextInput
                            placeholder='Describe what you are selling *'
                            placeholderTextColor={colors.text}
                            style={[GlobalStyleSheet.shadow2, {

                                borderColor: colors.border,
                                padding: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                backgroundColor: colors.card,
                                height: 48
                            }]}
                        />
                    </View>
                    <Text style={[FONTS.font, { color: colors.title }]}>Include condition, features and reason for selling </Text>
                    <Text style={[FONTS.font, { color: colors.text }]}>* Required Fields</Text>
                </View>
            </ScrollView>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 20, paddingHorizontal: 20 }]}>
                <Button
                    onPress={() => navigation.navigate('Uploadphoto')}
                    title="Next"
                />
            </View>
        </SafeAreaView>
    )
}

export default Form;