import React from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, IMAGES } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../constants/StyleSheet';



const BottomTab = ({ state, descriptors, navigation }) => {

    const theme = useTheme();
    const { colors } = theme;

    return (
        <View
            style={[{
                backgroundColor:colors.card,
                shadowColor: 'rgba(0,0,0,1)',
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: .1,
                shadowRadius: 5,
                position: 'absolute',
                left: 0,
                bottom: 0,
                right: 0,
            }, Platform.OS === 'ios' && {
                backgroundColor: colors.card,
            }]}
        >
            <View
                style={[GlobalStyleSheet.container,{
                    padding:0,
                    // height: 60,
                    backgroundColor: colors.card,
                    flexDirection: 'row',
                }]}
            >
                {state.routes.map((route, index) => {

                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate({ name: route.name, merge: true });
                        }
                    }
                    if (label === 'CreateAd2') {
                        return (
                            <View
                                key={index}
                                style={{
                                    width: '20%',
                                    alignItems: 'center',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Sell')}
                                    activeOpacity={.8}
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: -20,
                                    }}
                                >
                                    <View
                                        style={[{
                                            shadowColor: 'rgb(18,9,46)',
                                            shadowOffset: {
                                                width: 0,
                                                height: 4,
                                            },
                                            shadowOpacity: .25,
                                            shadowRadius: 2,
                                            borderRadius: 30,
                                        },Platform.OS === 'ios' && {
                                            backgroundColor: colors.card,
                                            borderRadius:50,
                                        }]}
                                    >
                                        <View
                                            style={{
                                                height: 60,
                                                width: 60,
                                                borderRadius: 30,
                                                backgroundColor: COLORS.primary,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderWidth: 3,
                                                borderColor: colors.card,
                                            }}
                                        >
                                            <Image
                                                style={{
                                                    position: 'absolute',
                                                    height: 20,
                                                    width: 20,
                                                    resizeMode: 'contain',
                                                    tintColor: COLORS.white,
                                                }}
                                                source={IMAGES.plus}
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    } else {
                        return (
                            <View
                                key={index}
                                style={{
                                    width: '20%',
                                    alignItems: 'center',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={onPress}
                                    style={{
                                        alignItems: 'center',
                                        paddingVertical: 9,
                                    }}
                                >
                                    <Image
                                        style={{
                                            height: 20,
                                            width: 20,
                                            tintColor: isFocused ? COLORS.primary : colors.title,
                                            marginBottom: 3,
                                            marginTop: 1,
                                        }}
                                        source={
                                            label === 'Home' ? IMAGES.home :
                                                label === 'Chat' ? IMAGES.chat :
                                                    label === 'MyAds' ? IMAGES.ads :
                                                        label === 'Profile' ? IMAGES.profile : IMAGES.home
                                        }
                                    />
                                    <Text style={{ ...FONTS.fontSm, color: isFocused ? COLORS.primary : colors.title }}>{label}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    }
                })}
            </View>
        </View>
    );
};

export default BottomTab;