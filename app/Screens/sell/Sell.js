import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../layout/Header';
import { FONTS, IMAGES, SIZES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

const categoryData = [
    {
        id: '1',
        icon: IMAGES.cat1,
        name: 'Cars',
        navigate: "Location"
    },
    {
        id: '2',
        icon: IMAGES.cat2,
        name: 'Mobiles',
        navigate: "Mobile"
    },
    {
        id: '3',
        icon: IMAGES.cat3,
        name: 'Properties',
        navigate: "Properties"
    },
    {
        id: '4',
        icon: IMAGES.cat4,
        name: 'Jobs',
        navigate: "Jobs"
    },
    {
        id: '5',
        icon: IMAGES.cat5,
        name: 'Bikes',
        navigate: "Bike"
    },
    {
        id: '6',
        icon: IMAGES.cat6,
        name: 'Electornics & Appliances',
        navigate: "Electornics"
    },
    {
        id: '7',
        icon: IMAGES.cat7,
        name: 'Furniture',
        navigate: "Furniture"
    },
    {
        id: '8',
        icon: IMAGES.cat8,
        name: 'Fashion',
        navigate: "Fashion"
    },
    {
        id: '9',
        icon: IMAGES.cat9,
        name: 'Pets',
        navigate: "Pets"
    },
    {
        id: '10',
        icon: IMAGES.cat10,
        name: 'Books, Sports & Hobbies',
        navigate: "Books"
    },
    {
        id: '11',
        icon: IMAGES.cat11,
        name: 'Services',
        navigate: "Service"
    },
]


const Sell = ({ navigation }) => {

    const { colors } = useTheme();

    const [layout, setLayout] = useState('grid');

    const handleLayout = (val) => {
        setLayout(val);
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
        >
            <Header
                title={'What are you offering ?'}
                leftIcon={'back'}
                titleLeft
            />

            <FlatList
                data={categoryData}
                keyExtractor={(item) => item.id}
                key={layout}
                contentContainerStyle={[GlobalStyleSheet.container,{
                    paddingHorizontal: 15,
                    paddingVertical: 15,
                }]}
                numColumns={layout === 'grid' ? 3 : 1}
                renderItem={({ item }) => (
                    <View
                        style={[layout === 'grid' && {
                            width: '33.33%',
                            height: 110,
                            paddingHorizontal: 5,
                            marginBottom: 10,
                        }]}
                    >
                        <TouchableOpacity
                            onPress={() => item.navigate === 'Location' ? navigation.navigate('Location') : navigation.navigate('Selllist', { cat: item.navigate })}
                            activeOpacity={.8}
                            style={[layout === 'grid' ?
                                {
                                    alignItems: 'center',
                                    backgroundColor: colors.card,
                                    flex: 1,
                                    borderRadius: SIZES.radius,
                                    paddingHorizontal: 10,
                                    shadowColor: "rgba(0,0,0,.5)",
                                    shadowOffset: {
                                        width: 0,
                                        height: 5,
                                    },
                                    shadowOpacity: 0.34,
                                    shadowRadius: 6.27,

                                    elevation: 10,
                                }
                                :
                                {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 18,
                                    borderBottomWidth: 1,
                                    borderBottomColor: colors.border,
                                }
                            ]}
                        >
                            <Image
                                style={[layout === 'grid' ? {
                                    height: 42,
                                    width: 42,
                                    resizeMode: 'contain',
                                    marginTop: 15,
                                } : {
                                    height: 24,
                                    width: 24,
                                    resizeMode: 'contain',
                                    marginRight: 13,
                                }]}
                                source={item.icon}
                            />
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text style={[layout === 'grid' ?
                                    {
                                        ...FONTS.fontSm,
                                        color: colors.title,
                                        textAlign: 'center',
                                    }
                                    :
                                    {
                                        ...FONTS.font,
                                        fontSize: 16,
                                        color: colors.title,
                                    }
                                ]}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            />

        </SafeAreaView>
    )
}

export default Sell;