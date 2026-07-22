import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useTheme } from '@react-navigation/native'
import Header from '../../../layout/Header'
import { GlobalStyleSheet } from '../../../constants/StyleSheet'
import { IMAGES, FONTS, SIZES } from '../../../constants/theme';

const Privacy = ({ navigation }) => {

    const { colors } = useTheme()
    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Privacy"
                leftIcon={"back"}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
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
                    onPress={() => navigation.navigate('Changepassword')}
                >
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, fontSize: 15, color: colors.title }}>Change Password</Text>
                    </View>
                    <Image
                        style={{ height: 15, width: 15, resizeMode: 'contain', tintColor: colors.title }}
                        source={IMAGES.rightarrow}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Privacy