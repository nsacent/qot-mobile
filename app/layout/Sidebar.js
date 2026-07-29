import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, IMAGES } from '../constants/theme';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useTheme } from '@react-navigation/native';
import ThemeBtn from '../components/ThemeBtn';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ navigation }) => {

    const theme = useTheme();
    const { colors } = theme;
    const { user, isAuthenticated } = useAuth();

    const navItem = [
        {
            icon: "bar-chart-2",
            name: "Dashboard",
            navigate: "SellerDashboard",
            protected: true,
        },
        {
            icon: "trending-up",
            name: "Ad Analytics",
            navigate: "SellerAnalytics",
            protected: true,
        },
        {
            icon: "refresh-cw",
            name: "Renewals",
            navigate: "SellerRenewals",
            protected: true,
        },
        {
            icon: "clock",
            name: "Recently Viewed",
            navigate: "RecentlyViewed",
        },
        {
            icon: "activity",
            name: "Activity",
            navigate: "AccountActivity",
            protected: true,
        },
        {
            icon: "bell",
            name: "Notifications",
            navigate: "NotificationsCenter",
            protected: true,
        },
        {
            icon: "star",
            name: "My Reviews",
            navigate: "MyReviews",
            protected: true,
        },
        {
            icon: "grid",
            name: "Categories",
            navigate: "Categories",
        },
        {
            icon: "users",
            name: "Trusted Sellers",
            navigate: "Sellers",
        },
        {
            icon: "help-circle",
            name: "Help & Safety",
            navigate: "Help",
        },
        {
            icon: "tag",
            name: "My Ads",
            navigate: 'MyAds',
            protected: true,
        },
        {
            icon: "user",
            name: "Profile",
            navigate: "Profile",
            protected: true,
        },
    ]

    return (
        <>
            <View style={{ flex: 1, backgroundColor: colors.card }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View
                        style={{
                            paddingTop: 25,
                            paddingHorizontal: 20,
                            borderBottomWidth: 1,
                            borderColor: colors.borderColor,
                            paddingBottom: 20,
                            marginBottom: 15,
                            alignItems: 'flex-start',
                        }}
                    >
                        <View style={{
                            flexDirection: 'row',
                        }}>
                            <View style={{
                                alignItems: 'flex-start',
                                flex: 1,
                            }}>
                                <View>
                                    <Image
                                        style={{
                                            height: 70,
                                            width: 70,
                                            borderRadius: 65,
                                            marginBottom: 10,
                                        }}
                                        source={isAuthenticated && user?.profile?.avatar ? { uri: user.profile.avatar } : isAuthenticated ? IMAGES.Small5 : IMAGES.qotLogo}
                                        resizeMode={isAuthenticated ? 'cover' : 'contain'}
                                    />
                                    {isAuthenticated && <TouchableOpacity
                                        onPress={() => navigation.navigate('DrawerNavigation', {
                                            screen: 'BottomNavigation',
                                            params: { screen: 'Profile' },
                                        })}
                                        style={{
                                            height: 30,
                                            width: 30,
                                            borderRadius: 30,
                                            backgroundColor: COLORS.secondary,
                                            position: 'absolute',
                                            bottom: 6,
                                            right: -2,
                                            borderWidth: 2,
                                            borderColor: colors.card,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <FeatherIcon color={COLORS.white} name='edit' />
                                    </TouchableOpacity>}
                                </View>
                            </View>
                            <ThemeBtn />
                        </View>
                        <View>
                            <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 4 }}>{isAuthenticated ? user?.full_name || 'QOT user' : 'Welcome to QOT'}</Text>
                            <Text style={{ ...FONTS.font, color: colors.textLight, opacity: .9, marginBottom: 2 }}>{isAuthenticated ? user?.email || user?.phone || '' : 'Browse and discover ads for free'}</Text>
                            {!isAuthenticated && (
                                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={{ minHeight: 39, borderRadius: 10, backgroundColor: COLORS.primary, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ ...FONTS.fontSm, ...FONTS.fontTitle, color: COLORS.white }}>Sign in</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ minHeight: 39, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 15, marginLeft: 8, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ ...FONTS.fontSm, ...FONTS.fontTitle, color: COLORS.primary }}>Create account</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={{ flex: 1 }}>
                        {navItem.filter((data) => !data.protected || isAuthenticated).map((data, index) => {
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        data.navigate == "Account" ?
                                            navigation.navigate('BottomNavigation', { screen: data.navigate })
                                            :
                                            data.navigate === "Profile" || data.navigate === "MyAds" ? 
                                                navigation.navigate('DrawerNavigation', {
                                                    screen : 'BottomNavigation',
                                                    params:{
                                                        screen : data.navigate
                                                    }
                                                })
                                            :
                                            data.navigate && navigation.navigate(data.navigate);
                                    }}
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 20,
                                        paddingVertical: 14,
                                    }}
                                >
                                    <View style={{ marginRight: 15 }}>
                                        <FeatherIcon name={data.icon} color={colors.textLight} size={20} />
                                    </View>
                                    <Text style={{ ...FONTS.fontTitle, fontSize: 14, color: colors.title, flex: 1 }}>{data.name}</Text>
                                    <FeatherIcon size={16} color={colors.textLight} name='chevron-right' />
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    <View
                        style={{
                            paddingHorizontal: 20,
                            paddingVertical: 30,
                            marginTop: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title, marginBottom: 4 }}>QOT</Text>
                        <Text style={{ ...FONTS.fontSm, color: colors.textLight }}>App Version 1.0</Text>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default Sidebar;
