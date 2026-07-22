import React from 'react'
import { View, Text, SafeAreaView, Image, TouchableOpacity, Share } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ScrollView } from 'react-native-gesture-handler';

const profileData = [
    {
        id: "1",
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        image: IMAGES.car1,
        location: "La Molina, Peru",
        date: "17 Oct"
    },
    {
        id: "2",
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        image: IMAGES.car2,
        location: "La Molina, Peru",
        date: "17 Oct"
    },
    {
        id: "3",
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        image: IMAGES.car3,
        location: "La Molina, Peru",
        date: "17 Oct"
    },
    {
        id: "4",
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        image: IMAGES.car4,
        location: "La Molina, Peru",
        date: "17 Oct"
    },
    {
        id: "5",
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        image: IMAGES.car5,
        location: "La Molina, Peru",
        date: "17 Oct"
    },
    {
        id: "6",
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        image: IMAGES.car6,
        location: "La Molina, Peru",
        date: "17 Oct"
    },
]


const Anotherprofile = ({ navigation }) => {

    const theme = useTheme();
    const { colors } = theme;

    const onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    'Share your profile link here.',
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (

        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[GlobalStyleSheet.container, { paddingBottom: 80 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ padding: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <Image
                                style={{ width: 18, height: 18, tintColor: colors.title }}
                                source={IMAGES.arrowleft}
                            />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TouchableOpacity style={{ padding: 10, }}
                                onPress={onShare}
                            >
                                <Image
                                    style={{ width: 18, height: 18, tintColor: colors.title }}
                                    source={IMAGES.share}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[GlobalStyleSheet.shadow2, { borderWidth: 0, backgroundColor: COLORS.primary, marginTop: 20, borderRadius: 20 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, margin: 10, marginBottom: 10 }}>
                            <Image
                                style={{ height: 18, width: 18, resizeMode: 'contain', tintColor: '#fff' }}
                                source={IMAGES.calendar}
                            />
                            <Text style={{ ...FONTS.fontRegular, fontSize: 13, color: COLORS.white }}>Member Since Oct 2023</Text>
                        </View>
                        <View style={{ backgroundColor: COLORS.secondary, flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width: 85, height: 85, borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    style={{ height: 80, width: 80, borderRadius: 50 }}
                                    source={IMAGES.Small5}
                                />
                            </View>
                            <Text style={[FONTS.fontLg, FONTS.fontSemiBold, { color: COLORS.white, fontSize: 18, marginTop: 10 }]}>Deepesh Gour</Text>
                            <Text style={[FONTS.font, { color: COLORS.white, marginTop: 5, opacity: .7 }]}>deepeshgour756@gmail.com</Text>
                            <View style={{ backgroundColor: COLORS.white, paddingTop: 5, borderRadius: 9, marginTop: 15, flexDirection: 'row', gap: 20, paddingHorizontal: 20 }}>
                                <TouchableOpacity style={{ alignItems: 'center' }}
                                    onPress={() => navigation.navigate('FollowerFollowing')}
                                >
                                    <Text style={{ ...FONTS.h6, ...FONTS.fontMedium, color: COLORS.title, }}>1520</Text>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.title, opacity: .7, lineHeight: 14 }}>Followers</Text>
                                </TouchableOpacity>
                                <LinearGradient colors={['rgba(0, 0, 0, 0.0)', 'rgba(18, 9, 46, 0.20)', 'rgba(0, 0, 0, 0.0)']}
                                    style={{ width: 2, height: 50 }}
                                ></LinearGradient>
                                <TouchableOpacity style={{ alignItems: 'center' }}
                                    onPress={() => navigation.navigate('FollowerFollowing')}
                                >
                                    <Text style={{ ...FONTS.h6, ...FONTS.fontMedium, color: COLORS.title }}>360</Text>
                                    <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: COLORS.title, opacity: .7, lineHeight: 14 }}>Following</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ paddingVertical: 10 }}>
                        <Text style={{ ...FONTS.fontMedium, color: colors.title, fontSize: 16 }}>All Post</Text>
                    </View>
                    <View>
                        {profileData.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    GlobalStyleSheet.shadow2,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.card,
                                        padding: 10,
                                        marginBottom: 20
                                    }
                                ]}
                                onPress={() => navigation.navigate('ItemDetails')}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <Image
                                        style={{ width: 70, height: 70, borderRadius: 6 }}
                                        source={item.image}
                                    />
                                    <View style={{ marginLeft: 10, flex: 1, paddingRight: 20 }}>
                                        <Text style={{ ...FONTS.font, ...FONTS.fontMedium, color: colors.title, fontSize: 16 }}>{item.price}</Text>
                                        <Text numberOfLines={1} style={{ ...FONTS.fontSm, ...FONTS.fontSemiBold, color: colors.title, marginTop: 2, }}>{item.title}</Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                marginTop: 5,
                                            }}
                                        >
                                            <FeatherIcon size={12} color={colors.text} name={'map-pin'} />
                                            <Text style={[FONTS.fontXs, { fontSize: 11, color: colors.text, marginLeft: 4 }]}>{item.location}</Text>
                                        </View>
                                    </View>
                                    <View style={{ bottom: 0, justifyContent: 'flex-end' }}>
                                        <Text style={{ ...FONTS.fontRegular, fontSize: 12, color: colors.title, opacity: .7 }}>{item.date}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Anotherprofile;