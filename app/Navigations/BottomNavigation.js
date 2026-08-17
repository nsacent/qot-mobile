import React from 'react';
import { Platform, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HomeScreen from '../Screens/Home/Home';
import Chat from '../Screens/chat/Chat';
import Profile from '../Screens/profile/Profile';
import Saved from '../Screens/saved/Saved';
import { COLORS, FONTS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Tab = createBottomTabNavigator();

const CreateAd2 = () => { }

const BottomNavigation = () => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    // The Android system navigation bar already owns its space in relative
    // mode. Some older OEM builds report that space again as a safe-area inset.
    const tabBarBottomInset = Platform.OS === 'android' ? 4 : Math.max(insets.bottom, 4);
    const { isAuthenticated } = useAuth();
    const { unreadMessageCount } = useNotifications();

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
                    height: 58 + tabBarBottomInset,
                    paddingTop: 5,
                    paddingBottom: tabBarBottomInset,
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
                    tabBarBadge: unreadMessageCount > 0 ? (unreadMessageCount > 99 ? '99+' : unreadMessageCount) : undefined,
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
