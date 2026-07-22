import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import { IMAGES } from '../../../constants/theme';
import Button from '../../../components/Button/Button';

const Changepassword = () => {

    const { colors } = useTheme();

    const [show, setshow] = React.useState(true);
    const [show2, setshow2] = React.useState(true);
    const [show3, setshow3] = React.useState(true);

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Change Password"
                leftIcon={"back"}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { marginTop: 10, flex: 1 }]}>
                <View style={{ marginBottom: 20 }}>
                    <TextInput
                        placeholder='Current Password'
                        placeholderTextColor={colors.text}
                        secureTextEntry={show}

                        style={[GlobalStyleSheet.shadow2, {

                            borderColor: colors.border,
                            padding: 10,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: colors.card,
                            paddingRight: 50,
                            color: colors.title,
                            height:48,
                        }]}
                    />
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            position: 'absolute',
                            right: 15,
                            top: 12

                        }}
                        onPress={() => {
                            setshow(!show)
                        }}
                    >
                        <Image
                            style={[GlobalStyleSheet.inputSecureIcon, {
                                tintColor: colors.text,
                            }]}
                            source={
                                show
                                    ?
                                    IMAGES.eyeClose
                                    :
                                    IMAGES.eye
                            }
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 20 }}>
                    <TextInput
                        placeholder='New Password'
                        placeholderTextColor={colors.text}
                        secureTextEntry={show2}

                        style={[GlobalStyleSheet.shadow2, {

                            borderColor: colors.border,
                            padding: 10,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: colors.card,
                            paddingRight: 50,
                            color: colors.title,
                            height:48,

                        }]}
                    />
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            position: 'absolute',
                            right: 15,
                            top: 12

                        }}
                        onPress={() => {
                            setshow2(!show2)
                        }}
                    >
                        <Image
                            style={[GlobalStyleSheet.inputSecureIcon, {
                                tintColor: colors.text,
                            }]}
                            source={
                                show2
                                    ?
                                    IMAGES.eyeClose
                                    :
                                    IMAGES.eye
                            }
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 20 }}>
                    <TextInput
                        placeholder='Confirm new Password'
                        placeholderTextColor={colors.text}
                        secureTextEntry={show3}

                        style={[GlobalStyleSheet.shadow2, {

                            borderColor: colors.border,
                            padding: 10,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: colors.card,
                            paddingRight: 50,
                            color: colors.title,
                            height:48,

                        }]}
                    />
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            position: 'absolute',
                            right: 15,
                            top: 12

                        }}
                        onPress={() => {
                            setshow3(!show3)
                        }}
                    >
                        <Image
                            style={[GlobalStyleSheet.inputSecureIcon, {
                                tintColor: colors.text,
                            }]}
                            source={
                                show3
                                    ?
                                    IMAGES.eyeClose
                                    :
                                    IMAGES.eye
                            }
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingHorizontal: 15, paddingBottom: 15 }}>
                <Button
                    title="Save"
                />
            </View>
        </SafeAreaView>
    )
}

export default Changepassword