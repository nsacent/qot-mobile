import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../Screens/Home/Home';
import Chat from '../Screens/chat/Chat';
import Profile from '../Screens/profile/Profile';
import Saved from '../Screens/saved/Saved';
import { getChatThreads } from '../api/chats';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const CreateAd2 = () => { }

const BottomNavigation = () => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        let active = true;

        if (!isAuthenticated) {
            setUnreadMessages(0);
            return () => { active = false; };
        }

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
    }, [isAuthenticated]);

    const protectedTabListeners = ({ navigation }) => ({
        tabPress: (event) => {
            if (isAuthenticated) return;
            event.preventDefault();
            navigation.getParent()?.getParent()?.navigate('SignIn');
        },
    });

    return (
        <Tab.Navigator
            backBehavior="history"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: colors.text,
                tabBarLabelStyle: {
                    ...FONTS.fontXs,
                    fontSize: 10,
                    fontFamily: 'PoppinsMedium',
                    marginTop: -2,
                    marginBottom: 1,
                },
                tabBarIcon: ({ color, focused }) => (
                    <FeatherIcon
                        name={
                            route.name === 'Home' ? 'home'
                                : route.name === 'Messages' ? 'message-circle'
                                    : route.name === 'Saved' ? 'heart'
                                        : route.name === 'Profile' ? 'user'
                                            : 'plus'
                        }
                        size={route.name === 'CreateAd2' ? 25 : 21}
                        color={focused ? COLORS.primary : color}
                    />
                ),
                tabBarStyle: {
                    position: 'relative',
                    height: 58 + Math.max(insets.bottom, 4),
                    paddingTop: 5,
                    paddingBottom: Math.max(insets.bottom, 4),
                    backgroundColor: colors.card,
                    borderTopWidth: 0,
                    elevation: 14,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                },
            })}
            initialRouteName={'Home'}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen
                name="Messages"
                component={Chat}
                options={{
                    tabBarBadge: unreadMessages > 0 ? (unreadMessages > 99 ? '99+' : unreadMessages) : undefined,
                    tabBarBadgeStyle: {
                        minWidth: 17,
                        height: 17,
                        fontSize: 8,
                        lineHeight: 15,
                        backgroundColor: COLORS.danger,
                        color: COLORS.white,
                    },
                }}
                listeners={protectedTabListeners}
            />
            <Tab.Screen
                name="CreateAd2"
                component={CreateAd2}
                listeners={({ navigation }) => ({
                    tabPress: (event) => {
                        event.preventDefault();
                        if (!isAuthenticated) {
                            navigation.getParent()?.getParent()?.navigate('SignIn');
                            return;
                        }
                        navigation.navigate('Sell');
                    },
                })}
                options={{
                    tabBarIcon: () => (
                        <View
                            style={{
                                height: 54,
                                width: 54,
                                borderRadius: 27,
                                marginTop: -18,
                                backgroundColor: COLORS.primary,
                                borderWidth: 3,
                                borderColor: colors.card,
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#12092E',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                        >
                            <FeatherIcon name="plus" size={24} color={COLORS.white} />
                        </View>
                    ),
                    tabBarLabel: ({ color }) => (
                        <Text style={[FONTS.fontXs, { color, fontSize: 10, fontFamily: 'PoppinsMedium', marginBottom: 1 }]}>Post</Text>
                    ),
                }}
            />
            <Tab.Screen name="Saved" component={Saved} listeners={protectedTabListeners} />
            <Tab.Screen name="Profile" component={Profile} listeners={protectedTabListeners} />
        </Tab.Navigator>
    );
};

export default BottomNavigation;
