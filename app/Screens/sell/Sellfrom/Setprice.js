import React from 'react';
import { View, Text, SafeAreaView, TextInput, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../../layout/Header';
import { COLORS, FONTS, IMAGES, SIZES } from '../../../constants/theme';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import Button from '../../../components/Button/Button';

const Setprice = ({ navigation }) => {

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Include some details"
                leftIcon={'back'}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container, { flex: 1 }]}>
                <Text style={[FONTS.fontMedium, { color: colors.title, marginBottom: 5 }]}>Price</Text>
                <TextInput
                    placeholder='Enter your price...'
                    placeholderTextColor={colors.text}
                    keyboardType={'number-pad'}
                    style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 10,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        backgroundColor: colors.card,
                        borderRadius: SIZES.radius,
                        shadowColor: "rgba(0,0,0,.5)",
                        shadowOffset: {
                            width: 0,
                            height: 5,
                        },
                        shadowOpacity: 0.34,
                        shadowRadius: 6.27,
                        elevation: 10,
                        paddingLeft: 40,
                        height:48
                    }}
                />
                <View style={{ position: 'absolute', top: 58, left: 27, alignItems: 'center' }}>
                    <Image
                        style={{ width: 20, height: 20,tintColor:colors.title }}
                        source={IMAGES.dollar}
                    />
                </View>
            </View>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 20, paddingHorizontal: 20 }]}>
                <Button
                    onPress={() => navigation.navigate('Comfirmlocation')}
                    title="Next"
                />
            </View>
        </SafeAreaView>
    )
}

export default Setprice;