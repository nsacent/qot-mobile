import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { SIZES, FONTS, IMAGES, COLORS } from '../../constants/theme';
import Button from '../../components/Button/Button';

const Editprofile = ({ navigation }) => {

    const theme = useTheme();
    const { colors } = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Edit Profile"
                leftIcon={'back'}
                titleLeft
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                <View>
                    <View style={{}}>
                        <Image
                            style={{ width: 100, height: 100, borderRadius: 100 }}
                            source={IMAGES.Small5}
                        />
                    </View>
                    <TouchableOpacity
                        //onPress={handleImageSelect}
                        style={{ position: 'absolute', bottom: 0, right: 0 }}
                    >
                        <View style={{ backgroundColor: colors.card, width: 36, height: 36, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    style={{ width: 18, height: 18, resizeMode: 'contain', tintColor: '#fff' }}
                                    source={IMAGES.camera}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[GlobalStyleSheet.container, { marginTop: 10, flex: 1, paddingHorizontal: 20 }]}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ ...FONTS.fontSm, color: colors.title, opacity: .6, marginBottom: 8 }}>Name</Text>
                    <TextInput
                        defaultValue='Deepesh Gour'
                        style={[GlobalStyleSheet.shadow2, {

                            borderColor: colors.border,
                            padding: 10,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: colors.card,
                            color: colors.title,
                            height:48
                        }]}
                    />
                </View>
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ ...FONTS.fontSm, color: colors.title, opacity: .6, marginBottom: 8 }}>Email</Text>
                    <TextInput
                        defaultValue='deepeshgour756@gmail.com'
                        style={[GlobalStyleSheet.shadow2, {

                            borderColor: colors.border,
                            padding: 10,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            backgroundColor: colors.card,
                            color: colors.title,
                            height:48
                        }]}
                    />
                </View>
                <View style={{ marginTop: 10 }}>
                    <Button
                        onPress={() => navigation.goBack()}
                        title="Save"
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Editprofile;