import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Header from '../../../layout/Header';
import { SIZES, FONTS, COLORS, IMAGES } from '../../../constants/theme';
import { GlobalStyleSheet } from '../../../constants/StyleSheet';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScrollView } from 'react-native-gesture-handler';
import SingleChat from '../../chat/SingleChat';
import ItemDetails from '../../Item/ItemDetails';
import Anotherprofile from '../../profile/Anotherprofile';


const ordersData = [
    {
        id: '1',
        date: "Apr 02,2023",
        time: "12:10",
        title: "Deepesh gour",
        location: "La Molina, Peru",
        item: "+2",
        totalitem: "7",
        price: "$2500",
        image: IMAGES.Small3

    },
    {
        id: '2',
        date: "Sep 09,2023",
        time: "10:10",
        title: "Yatin xarma",
        location: "La Molina, Peru",
        item: "+3",
        totalitem: "8",
        price: "$4200",
        image: IMAGES.Small4

    },
    {
        id: '3',
        date: "Dec 05,2023",
        time: "9:05",
        title: "Herry ",
        location: "La Molina, Peru",
        item: "+5",
        totalitem: "10",
        price: "$7000",
        image: IMAGES.Small7

    },
    {
        id: '4',
        date: "jun 08,2023",
        time: "01:14",
        title: "Alexa",
        location: "La Molina, Peru",
        item: "+1",
        totalitem: "6",
        price: "$2000",
        image: IMAGES.Small9

    },
]

const carData = [
    {
        id: '1',
        image: IMAGES.car1
    },
    {
        id: '2',
        image: IMAGES.car2
    },
    {
        id: '3',
        image: IMAGES.car3
    },
    {
        id: '4',
        image: IMAGES.car4
    },
    {
        id: '5',
        image: IMAGES.car5
    },
]

const Myorders = ({ navigation }) => {

    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="My Orders"
                leftIcon={"back"}
                titleLeft
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <View style={{ marginTop: 10, width: SIZES.width }}>
                    <ScrollView>
                        <View style={[GlobalStyleSheet.container, { paddingTop: 10 }]}>
                            {ordersData.map((data, index) => {
                                return (
                                    <View key={index}>
                                        <View
                                            style={[GlobalStyleSheet.shadow2, {
                                                borderColor: colors.border,
                                                padding: 10,
                                                backgroundColor: colors.card,
                                                marginBottom: 20
                                            }]}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 }}>
                                                <Text style={{ ...FONTS.font, ...FONTS.fontMedium, fontSize: 15, color: colors.text }}>{data.date}</Text>
                                                <Text style={{ ...FONTS.font, backgroundColor: COLORS.primary, padding: 5, borderRadius: 15, color: colors.card, paddingHorizontal: 20 }}>{data.time}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View style={{ marginTop: 20, flexDirection: 'row' }}>
                                                    <TouchableOpacity
                                                        onPress={() => navigation.navigate(Anotherprofile)}
                                                    >
                                                        <Image
                                                            style={{ height: 50, width: 50, borderRadius: 50 }}
                                                            source={data.image}
                                                        />
                                                    </TouchableOpacity>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <TouchableOpacity
                                                            onPress={() => navigation.navigate(Anotherprofile)}
                                                        >
                                                            <Text style={{ ...FONTS.fontTitle, color: colors.title, fontSize: 16 }}>{data.title}</Text>
                                                        </TouchableOpacity>
                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                            }}
                                                        >
                                                            <FeatherIcon size={12} color={colors.text} name={'map-pin'} />
                                                            <Text style={[FONTS.fontXs, { fontSize: 11, color: colors.text, marginLeft: 4 }]}>{data.location}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <TouchableOpacity style={{ backgroundColor: COLORS.primaryLight, paddingHorizontal: 25, padding: 10, borderRadius: 20 }}
                                                    onPress={() => navigation.navigate(SingleChat)}
                                                >
                                                    <Image
                                                        style={{ height: 20, width: 20, resizeMode: 'contain', tintColor: colors.title }}
                                                        source={IMAGES.chat}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                                {carData.map((item, index) => (
                                                    <TouchableOpacity key={index} style={{ marginRight: 5 }}
                                                        onPress={() => navigation.navigate(ItemDetails)}
                                                    >
                                                        <Image
                                                            style={{ height: 50, width: 50, borderRadius: 15 }}
                                                            source={item.image}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                                <View style={{ marginLeft: 5 }}>
                                                    <Text style={{ ...FONTS.fontSm, ...FONTS.fontSemiBold, fontSize: 15, color: colors.title }}>{data.item}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                                                <Text style={{ ...FONTS.font, color: colors.text }}>{data.totalitem} items</Text>
                                                <Text style={{ ...FONTS.font, color: colors.text }}>Total<Text style={{ ...FONTS.font, ...FONTS.fontSemiBold, fontSize: 15, color: colors.title }}> {data.price}</Text></Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
                <View style={{ marginTop: 10, width: SIZES.width }}>

                </View>
                <View style={{ marginTop: 10, width: SIZES.width }}>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Myorders