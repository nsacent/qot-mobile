import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import SearchBar from '../../components/SearchBar';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import LatestAds from '../Home/LatestAds';
import CardStyle1 from '../../components/Card/CardStyle1';
import CustomButton from '../../components/CustomButton';
import FilterSheet from '../../components/BottomSheet/FilterSheet';

const RecommendationsData = [
    {
        id: '1',
        image: IMAGES.car6,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '2',
        image: IMAGES.car5,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '3',
        image: IMAGES.car4,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '4',
        image: IMAGES.car3,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
]

const budgetData = [
    {
        title: "Below 1 lakh",
    },
    {
        title: "1 lakh - 2 lakh",
    },
    {
        title: "2 lakh - 3 lakh",
    },
    {
        title: "3 lakh - 5 lakh",
    },
    {
        title: "5 lakh and above",
    },
]
const yearData = [
    {
        title: "Under 2 years",
    },
    {
        title: "Under 4 years",
    },
    {
        title: "Under 6 years",
    },
    {
        title: "Under 8 years",
    },
    {
        title: "Below 10 years",
    },
    {
        title: "Above 10 years",
    },
]
const brandData = [
    {
        image: IMAGES.brand1,
    },
    {
        image: IMAGES.brand2,
    },
    {
        image: IMAGES.brand3,
    },
    {
        image: IMAGES.brand4,
    },
    {
        image: IMAGES.brand5,
    },
    {
        image: IMAGES.brand6,
    },
]

const CarHome = ({ navigation }) => {


    const theme = useTheme();
    const { colors } = theme;

    const sheetRef = useRef();

    const [activeTab, setActiveTab] = useState('budget');

    const translate = useRef(new Animated.Value(0)).current;

    const handleActiveTab = (val, index) => {
        Animated.timing(translate, {
            toValue: ((SIZES.width - 38) / 3 > SIZES.container ? (SIZES.container - 38) / 3 : (SIZES.width - 38) / 3) * index,
            duration: 100,
            useNativeDriver: true,
        }).start();

        setActiveTab(val);
    }



    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
        >
            <View
                style={[GlobalStyleSheet.container, { paddingBottom: 5 }]}
            >
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <SearchBar />
                    </View>
                    <TouchableOpacity
                        style={{
                            padding: 14,
                            marginLeft: 5,
                        }}
                        onPress={() => sheetRef.current.openSheet()}
                    >
                        <Image
                            style={{
                                height: 20,
                                width: 20,
                                resizeMode: 'contain',
                                tintColor: colors.title,
                            }}
                            source={IMAGES.filter}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView>
                <View style={[GlobalStyleSheet.container, { paddingTop: 10 }]}>

                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor:theme.dark ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,.05)',
                            borderRadius: SIZES.radius,
                            height: 48,
                            marginBottom: 12,
                        }}
                    >
                        <Animated.View
                            style={{
                                height: 40,
                                width: (SIZES.width - 38) / 3,
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                borderRadius: SIZES.radius,
                                backgroundColor: colors.card,
                                transform: [{ translateX: translate }]
                            }}
                        >
                        </Animated.View>
                        <TouchableOpacity
                            onPress={() => handleActiveTab('budget', 0)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                            }}
                        >
                            <Image
                                style={{
                                    height: 24,
                                    width: 24,
                                    marginRight: 6,
                                    resizeMode: 'contain',
                                }}
                                source={IMAGES.budget}
                            />
                            <Text style={[FONTS.fontSm, { color: colors.title }]}>Budget</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleActiveTab('brand', 1)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                            }}
                        >
                            <Image
                                style={{
                                    height: 24,
                                    width: 24,
                                    marginRight: 6,
                                    resizeMode: 'contain',
                                }}
                                source={IMAGES.brand}
                            />
                            <Text style={[FONTS.fontSm, { color: colors.title }]}>Brand</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleActiveTab('year', 2)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                            }}
                        >
                            <Image
                                style={{
                                    height: 24,
                                    width: 24,
                                    marginRight: 6,
                                    resizeMode: 'contain',
                                }}
                                source={IMAGES.watch}
                            />
                            <Text style={[FONTS.fontSm, { color: colors.title }]}>Year</Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={{
                            marginBottom: 10,
                        }}
                    >
                        {activeTab === 'budget' ?
                            <View
                                style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {budgetData.map((data, index) => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Items',{cat:'car'})}
                                        key={index}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: colors.borderColor,
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            borderRadius: 20,
                                            marginRight: 8,
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text style={[FONTS.fontSm, { color: colors.title }]}>{data.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            :
                            activeTab === 'year' ?
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {yearData.map((data, index) => (
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('Items',{cat:'car'})}
                                            key={index}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: colors.borderColor,
                                                paddingHorizontal: 10,
                                                paddingVertical: 4,
                                                borderRadius: 20,
                                                marginRight: 8,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <Text style={[FONTS.fontSm, { color: colors.title }]}>{data.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                :
                                activeTab === 'brand' ?
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {brandData.map((data, index) => (
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('Items',{cat:'car'})}
                                                key={index}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: colors.borderColor,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 20,
                                                    marginRight: 8,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <Image
                                                    style={{
                                                        height: 24,
                                                        width: 120,
                                                        resizeMode: 'contain',
                                                    }}
                                                    source={data.image}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    :
                                    <></>
                        }
                    </View>

                    <Text style={[FONTS.h6, { color: colors.title }]}>Latest Ads</Text>

                    <LatestAds />

                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 8, marginBottom: 10 }]}>Recommendations</Text>

                    <View style={[GlobalStyleSheet.row]}>
                        {RecommendationsData.map((data, index) => (
                            <View
                                key={index}
                                style={[GlobalStyleSheet.col50, { marginBottom: 15 }]}
                            >
                                <CardStyle1
                                    item={data}
                                />
                            </View>
                        ))}
                    </View>
                    <CustomButton
                        title={'View all'}
                        onPress={() => navigation.navigate('Items',{cat:'car'})}
                    />
                </View>
            </ScrollView>
            <FilterSheet
                ref={sheetRef}
                height={false}
            />
        </SafeAreaView>
    )
}

export default CarHome;