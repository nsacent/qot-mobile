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
    const { user, signOut } = useAuth();

    const navItem = [
        {
            icon: "grid",
            name: "Categories",
            navigate: "Categories",
        },
        {
            icon: "tag",
            name: "My Ads",
            navigate: 'MyAds',
        },
        {
            icon: "user",
            name: "Profile",
            navigate: "Profile",
        },
        {
            icon: "log-out",
            name: "Logout",
            action: 'logout',
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
                                        source={user?.profile?.avatar ? { uri: user.profile.avatar } : IMAGES.Small5}
                                    />
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Editprofile')}
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
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <ThemeBtn />
                        </View>
                        <View>
                            <Text style={{ ...FONTS.h5, color: colors.title, marginBottom: 4 }}>{user?.full_name || 'QOT user'}</Text>
                            <Text style={{ ...FONTS.font, color: colors.textLight, opacity: .9, marginBottom: 2 }}>{user?.email || user?.phone || ''}</Text>
                        </View>
                    </View>

                    <View style={{ flex: 1 }}>
                        {navItem.map((data, index) => {
                            return (
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (data.action === 'logout') {
                                            await signOut();
                                            const rootNavigation = navigation.getParent();
                                            rootNavigation?.reset({ index: 0, routes: [{ name: 'SignIn' }] });
                                            return;
                                        }
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
                        <Text style={{ ...FONTS.h6, ...FONTS.fontTitle, color: colors.title, marginBottom: 4 }}>QOT Uganda</Text>
                        <Text style={{ ...FONTS.fontSm, color: colors.textLight }}>App Version 1.0</Text>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default Sidebar;
