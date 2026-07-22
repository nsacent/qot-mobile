import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES, FONTS, SIZES } from '../../constants/theme';


const SettingData = [
    {
        id: "1",
        image: IMAGES.bell,
        title: "Notification",
        navigate: 'Notification'
    },
    {
        id: "2",
        image: IMAGES.verified,
        title: "Privacy",
        navigate: 'Privacy'
    },
    {
        id: "3",
        image: IMAGES.wallet,
        title: "Buy Packages & My Orders",
        navigate: 'BuyPackages'
    },
    {
        id: "4",
        image: IMAGES.earth,
        title: "Select Language",
        navigate: 'Language'
    },
    {
        id: "5",
        image: IMAGES.help,
        title: "Help & Support",
        navigate: 'Help'
    },
    {
        id: "7",
        image: IMAGES.logout,
        title: "Logout",
        navigate: 'SignIn'
    },
]


const Setting = ({ navigation }) => {

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Setting"
                leftIcon={'back'}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
                {SettingData.map((data, index) => {
                    return (
                        <View key={index}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                    paddingBottom: 10,
                                    marginBottom: 20,
                                }}
                                onPress={() => navigation.navigate(data.navigate)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image
                                        style={{ width: 22, height: 22, resizeMode: 'contain', tintColor: colors.title }}
                                        source={data.image}
                                    />
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, fontSize: 15, color: colors.title }}>{data.title}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Image
                                        style={{ height: 15, width: 15, resizeMode: 'contain', tintColor: colors.title }}
                                        source={IMAGES.rightarrow}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </View>
        </SafeAreaView>
    )
}

export default Setting