import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Animated, Platform, } from 'react-native'
import { useNavigation, useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../../layout/Header';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import Sharebtn from '../../components/Button/Sharebtn';
import Followbtn from '../../components/Button/Followbtn';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Anotherprofile from './Anotherprofile';


const followerData = [
    {
        id: "1",
        title: "Alex Techie",
        image: IMAGES.Small1
    },
    {
        id: "2",
        title: 'Lily Learns',
        image: IMAGES.Small2
    },
    {
        id: "3",
        title: "Herry Techie",
        image: IMAGES.Small3
    },
    {
        id: "4",
        title: 'Mia Maven',
        image: IMAGES.Small4
    },
    {
        id: "4",
        title: 'Lily Learns',
        image: IMAGES.Small5
    },
    {
        id: "5",
        title: 'Sophia James',
        image: IMAGES.Small6
    },
    {
        id: "6",
        title: "Alex Techie",
        image: IMAGES.Small7
    },
    {
        id: "7",
        title: "yatin Xarma",
        image: IMAGES.Small8
    },
    {
        id: "8",
        title: "Almash Learns",
        image: IMAGES.Small9
    },
    {
        id: "9",
        title: "Shipara Techie",
        image: IMAGES.Small10
    },
    {
        id: "1",
        title: "Alex Techie",
        image: IMAGES.Small1
    },
    {
        id: "2",
        title: 'Lily Learns',
        image: IMAGES.Small2
    },
    {
        id: "3",
        title: "Herry Techie",
        image: IMAGES.Small3
    },
    {
        id: "4",
        title: 'Mia Maven',
        image: IMAGES.Small4
    },
    {
        id: "4",
        title: 'Lily Learns',
        image: IMAGES.Small5
    },
    {
        id: "5",
        title: 'Sophia James',
        image: IMAGES.Small6
    },
    {
        id: "6",
        title: "Alex Techie",
        image: IMAGES.Small7
    },
    {
        id: "7",
        title: "yatin Xarma",
        image: IMAGES.Small8
    },
    {
        id: "8",
        title: "Almash Learns",
        image: IMAGES.Small9
    },
    {
        id: "9",
        title: "Shipara Techie",
        image: IMAGES.Small10
    },
]

const followingData = [
    {
        id: "1",
        title: "Alex Techie",
        image: IMAGES.Small1
    },
    {
        id: "2",
        title: 'Lily Learns',
        image: IMAGES.Small2
    },
    {
        id: "3",
        title: "Herry Techie",
        image: IMAGES.Small3
    },
    {
        id: "4",
        title: 'Mia Maven',
        image: IMAGES.Small4
    },
    {
        id: "4",
        title: 'Lily Learns',
        image: IMAGES.Small5
    },
    {
        id: "5",
        title: 'Sophia James',
        image: IMAGES.Small6
    },
    {
        id: "6",
        title: "Alex Techie",
        image: IMAGES.Small7
    },
    {
        id: "7",
        title: "yatin Xarma",
        image: IMAGES.Small8
    },
    {
        id: "8",
        title: "Almash Learns",
        image: IMAGES.Small9
    },
    {
        id: "9",
        title: "Shipara Techie",
        image: IMAGES.Small10
    },
    {
        id: "1",
        title: "Alex Techie",
        image: IMAGES.Small1
    },
    {
        id: "2",
        title: 'Lily Learns',
        image: IMAGES.Small2
    },
    {
        id: "3",
        title: "Herry Techie",
        image: IMAGES.Small3
    },
    {
        id: "4",
        title: 'Mia Maven',
        image: IMAGES.Small4
    },
    {
        id: "4",
        title: 'Lily Learns',
        image: IMAGES.Small5
    },
    {
        id: "5",
        title: 'Sophia James',
        image: IMAGES.Small6
    },
    {
        id: "6",
        title: "Alex Techie",
        image: IMAGES.Small7
    },
    {
        id: "7",
        title: "yatin Xarma",
        image: IMAGES.Small8
    },
    {
        id: "8",
        title: "Almash Learns",
        image: IMAGES.Small9
    },
    {
        id: "9",
        title: "Shipara Techie",
        image: IMAGES.Small10
    },
]


const FollowerFollowing = ({navigation}) => {

    const { colors } = useTheme();

    const scrollRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const slideIndicator = scrollX.interpolate({
        inputRange: [0, SIZES.width > SIZES.container ? SIZES.container : SIZES.width],
        outputRange: [0, (SIZES.width - 30) / 2 > SIZES.container ? (SIZES.container - 30) / 2 : (SIZES.width - 30) / 2],
        extrapolate: 'clamp',
    });

    const onPressTouch = (val) => {
        setCurrentIndex(val)
        scrollRef.current?.scrollTo({
            x: SIZES.width > SIZES.container ? SIZES.container : SIZES.width * val,
            animated: true,
        });
    }

    return (
        <SafeAreaView style={{ backgroundColor: colors.card, flex: 1 }}>
            <Header
                title="My network"
                leftIcon={'back'}
                titleLeft
            />
            <View style={[GlobalStyleSheet.container,{padding:0,  paddingTop: 5, paddingHorizontal: 10 }]}>
                <View style={{ flexDirection: 'row', marginTop: 0, marginBottom: 0, }}>
                    <TouchableOpacity
                        onPress={() => onPressTouch(0)}
                        style={GlobalStyleSheet.TouchableOpacity2}>
                        <Text style={[{ ...FONTS.fontMedium, fontSize: 14, color: '#475A77' }, currentIndex == 0 && { color: COLORS.primary }]}>1520 follower</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onPressTouch(1)}
                        style={GlobalStyleSheet.TouchableOpacity2}>
                        <Text style={[{ ...FONTS.fontMedium, fontSize: 14, color: '#475A77' }, currentIndex == 1 && { color: COLORS.primary }]}>360 following</Text>
                    </TouchableOpacity>
                    <Animated.View
                        style={{
                            backgroundColor: COLORS.primary,
                            width: '50%',
                            height: 3,
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            transform: [{ translateX: slideIndicator }]
                        }}>
                    </Animated.View>
                </View>
            </View>
            <View style={[Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}>
                <ScrollView
                    horizontal
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    ref={scrollRef}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={(e) => {
                        if (e.nativeEvent.contentOffset.x.toFixed(0) == SIZES.width.toFixed(0) > SIZES.container ? SIZES.container.toFixed(0) : SIZES.width.toFixed(0)) {
                            setCurrentIndex(1)
                        } else if (e.nativeEvent.contentOffset.x.toFixed(0) == 0) {
                            setCurrentIndex(0)
                        } else {
                            setCurrentIndex(0)
                        }
                    }}
                >
                    <View style={{ marginTop: 10, width: SIZES.width > SIZES.container ? SIZES.container : SIZES.width, flex:1 }}>
                        <ScrollView showsHorizontalScrollIndicator={false}>
                            {followerData.map((data, index) => {

                                const navigation = useNavigation();

                                const [show, setshow] = React.useState(true);

                                return (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate(Anotherprofile)}
                                            >
                                                <Image
                                                    style={{ width: 50, height: 50, borderRadius: 50 }}
                                                    source={data.image}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ marginLeft: 10 }}
                                                onPress={() => navigation.navigate(Anotherprofile)}
                                            >
                                                <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, color: colors.title }}>{data.title}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            {show ?

                                                <Sharebtn
                                                    title='Remove'
                                                    onPress={() => setshow(!show)}
                                                />
                                                :
                                                <Followbtn
                                                    title="Follow"
                                                    onPress={() => setshow(!show)}
                                                />
                                            }
                                        </View>
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>
                    <View style={{ marginTop: 10, width: SIZES.width > SIZES.container ? SIZES.container : SIZES.width, flex:1 }}>
                        <ScrollView showsHorizontalScrollIndicator={false}>
                            {followingData.map((data, index2) => {

                                const navigation = useNavigation();

                                const [show, setshow] = React.useState(true);

                                return (
                                    <View key={index2} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate(Anotherprofile)}
                                            >
                                                <Image
                                                    style={{ width: 50, height: 50, borderRadius: 50 }}
                                                    source={data.image}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ marginLeft: 10 }}
                                                onPress={() => navigation.navigate(Anotherprofile)}
                                            >
                                                <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, color: colors.title }}>{data.title}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View>
                                            {show ?

                                                <Sharebtn
                                                    title='Following'
                                                    onPress={() => setshow(!show)}
                                                />
                                                :
                                                <Followbtn
                                                    title="Follow"
                                                    onPress={() => setshow(!show)}
                                                />
                                            }
                                        </View>
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default FollowerFollowing;