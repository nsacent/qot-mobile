import React, { useState } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, IMAGES, SIZES } from '../../../constants/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@react-navigation/native';
import Header from '../../../layout/Header';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import Button from '../../../components/Button/Button';

const postimage = [
    {
        id: "1",
        image: IMAGES.car1
    },
    {
        id: "2",
        image: IMAGES.car2
    },
    {
        id: "3",
        image: IMAGES.car3
    },
    {
        id: "4",
        image: IMAGES.car4
    },
    {
        id: "5",
        image: IMAGES.car5
    },
    {
        id: "6",
        image: IMAGES.car6
    },
    {
        id: "7",
        image: IMAGES.car1
    },
    {
        id: "8",
        image: IMAGES.car2
    },
    {
        id: "9",
        image: IMAGES.car3
    },
    {
        id: "10",
        image: IMAGES.car4
    },
    {
        id: "11",
        image: IMAGES.car5
    },
    {
        id: "12",
        image: IMAGES.car6
    },
];

const Uploadphoto = ({ navigation }) => {

    const [imageurl, setimageurl] = React.useState(IMAGES.car5);

    const theme = useTheme();
    const { colors } = theme;

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="Upload your photos"
                leftIcon={'back'}
                titleLeft

            />
            <View>
                <View style={{ paddingVertical: 30, backgroundColor: 'rgba(71,90,119,.25)' }}>
                    <Image
                        style={{
                            height: SIZES.width > SIZES.container ? SIZES.container : SIZES.width - (SIZES.width * (20 / 100) > SIZES.container ? SIZES.container * (20 / 100) : SIZES.width * (20 / 100)),
                            width: '100%',
                            resizeMode: 'contain'
                        }}
                        source={imageurl}
                    />
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 }}>
                <Text style={{ flex: 1, ...FONTS.fontMedium, ...FONTS.h5, color: colors.title }}>Gallery</Text>
                <TouchableOpacity
                    style={{ padding: 10 }}
                >
                    <Image
                        style={{ height: 24, width: 24, tintColor: colors.title }}
                        source={IMAGES.camera}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
            >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {postimage.map((item, index) => {
                        return (
                            <View
                                key={index}
                                style={{ width: '25%', height: SIZES.width / 4 > SIZES.container ? SIZES.container / 4 : SIZES.width / 4, padding: 1 }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setimageurl(item.image)
                                    }}
                                >
                                    <Image
                                        style={{ width: '100%', height: '100%' }}
                                        source={item.image}
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 20, paddingHorizontal: 20 }]}>
                <Button
                    onPress={() => navigation.navigate('Setprice')}
                    title="Next"
                />
            </View>
        </SafeAreaView>
    )
}

export default Uploadphoto;