import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS } from '../constants/theme';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlobalStyleSheet } from '../constants/StyleSheet';
import { getChatThreads } from '../api/chats';



const BottomTab = ({ state, descriptors, navigation }) => {

    const theme = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setKeyboardVisible(true),
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardVisible(false),
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        let active = true;
        const refreshUnread = () => {
            getChatThreads({ folder: 'unread' })
                .then((data) => {
                    if (active) setUnreadMessages(Number(data.tabs?.unread || 0));
                })
                .catch(() => {});
        };

        refreshUnread();
        const timer = setInterval(refreshUnread, 30000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [state.index]);

    if (keyboardVisible) return null;

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
                paddingBottom: Math.max(insets.bottom, 4),
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
                                            <FeatherIcon name="plus" size={25} color={COLORS.white} />
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
                                    <FeatherIcon
                                        name={
                                            label === 'Home' ? 'home' :
                                            label === 'Messages' ? 'message-circle' :
                                            label === 'Saved' ? 'heart' :
                                            label === 'Profile' ? 'user' : 'home'
                                        }
                                        size={21}
                                        color={isFocused ? COLORS.primary : colors.text}
                                        style={{ marginBottom: 3, marginTop: 1 }}
                                    />
                                    {label === 'Messages' && unreadMessages > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 3,
                                                right: -7,
                                                minWidth: 17,
                                                height: 17,
                                                borderRadius: 9,
                                                paddingHorizontal: 4,
                                                backgroundColor: COLORS.danger,
                                                borderWidth: 2,
                                                borderColor: colors.card,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text style={{ color: COLORS.white, fontSize: 8, lineHeight: 10, fontFamily: 'PoppinsSemiBold' }}>
                                                {unreadMessages > 99 ? '99+' : unreadMessages}
                                            </Text>
                                        </View>
                                    )}
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
