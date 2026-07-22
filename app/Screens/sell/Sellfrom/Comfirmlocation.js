import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import Header from '../../../layout/Header';
import { FONTS, IMAGES } from '../../../constants/theme';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import Button from '../../../components/Button/Button';

const Comfirmlocation = ({ navigation }) => {

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Confirm your location"
                leftIcon={'back'}
                titleLeft
            />
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={[GlobalStyleSheet.container, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }]}>
                    <View>
                        <Text style={[FONTS.fontLg, FONTS.fontMedium, { color: colors.title }]}>Location</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text }]}>RK puram, Kota</Text>
                    </View>
                    <Image
                        style={{ width: 18, height: 18,tintColor:colors.title }}
                        source={IMAGES.rightarrow}
                    />
                </TouchableOpacity>
            </View>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 20, paddingHorizontal: 20 }]}>
                <Button
                    onPress={() => navigation.navigate('Review')}
                    title="Next"
                />
            </View>
        </SafeAreaView>
    )
}

export default Comfirmlocation;