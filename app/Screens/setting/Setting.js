import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { Image as ExpoImage } from 'expo-image';
import Constants from 'expo-constants';
import { clearQueryCache } from '../../cache/queryCache';

const QuickTile = ({ icon, title, detail, color, background, onPress }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.84}
            style={{ width: '48.4%', minHeight: 125, borderRadius: 17, padding: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, justifyContent: 'space-between' }}
        >
            <View style={{ height: 38, width: 38, borderRadius: 12, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name={icon} size={18} color={color} />
            </View>
            <View style={{ marginTop: 13 }}>
                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{title}</Text>
                <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, fontSize: 9, lineHeight: 14, marginTop: 3 }]}>{detail}</Text>
            </View>
        </TouchableOpacity>
    );
};

const SettingRow = ({ icon, title, detail, badge, danger, onPress, first = false }) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            style={{ minHeight: 67, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, backgroundColor: colors.card, borderTopWidth: first ? 0 : 1, borderTopColor: colors.border }}
        >
            <View style={{ height: 37, width: 37, borderRadius: 11, backgroundColor: danger ? '#FFF0F0' : `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name={icon} size={17} color={danger ? '#B42318' : COLORS.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: danger ? '#B42318' : colors.title }]}>{title}</Text>
                {detail ? <Text numberOfLines={1} style={[FONTS.fontXs, { color: danger ? '#9B2C2C' : colors.text, marginTop: 2 }]}>{detail}</Text> : null}
            </View>
            {badge ? (
                <View style={{ borderRadius: 8, backgroundColor: badge.background, paddingHorizontal: 7, paddingVertical: 4, marginRight: 5 }}>
                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: badge.color, fontSize: 8 }]}>{badge.label}</Text>
                </View>
            ) : null}
            <FeatherIcon name="chevron-right" size={18} color={danger ? '#B42318' : colors.textLight} />
        </TouchableOpacity>
    );
};

const Setting = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, signOut, freezeAccount } = useAuth();
    const [freezeOpen, setFreezeOpen] = useState(false);
    const [freezing, setFreezing] = useState(false);
    const [freezeError, setFreezeError] = useState('');
    const phoneVerified = Boolean(user?.phone_verified || user?.phone_verified_at);
    const emailVerified = Boolean(user?.email_verified || user?.email_verified_at);
    const location = user?.profile?.default_area_name || user?.profile?.default_city_name
        ? `${user.profile.default_area_name ? `${user.profile.default_area_name}, ` : ''}${user.profile.default_city_name || ''}${user.profile.default_region_name ? `, ${user.profile.default_region_name}` : ''}`
        : 'Not selected';
    const timezone = user?.profile?.timezone || 'Africa/Kampala';

    const openBottomTab = (screen) => navigation.navigate('DrawerNavigation', {
        screen: 'BottomNavigation',
        params: { screen },
    });

    const confirmSignOut = () => {
        Alert.alert(
            'Sign out of QOT?',
            'You can sign back in with your phone number or email address.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
                    },
                },
            ],
        );
    };

    const confirmClearCache = () => {
        Alert.alert(
            'Clear cached data?',
            'Temporary ads, categories and images will be downloaded again when needed. Your account, drafts, saved ads and browsing history will remain.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear cache',
                    onPress: async () => {
                        await Promise.all([
                            clearQueryCache(),
                            ExpoImage.clearMemoryCache(),
                            ExpoImage.clearDiskCache(),
                        ]);
                        Alert.alert('Cache cleared', 'QOT temporary data has been removed from this device.');
                    },
                },
            ],
        );
    };

    const handleFreezeAccount = async () => {
        setFreezing(true);
        setFreezeError('');

        try {
            await freezeAccount();
            setFreezeOpen(false);
            navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        } catch (requestError) {
            setFreezeError(requestError.message || 'Your account could not be frozen. Please try again.');
        } finally {
            setFreezing(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Account settings" leftIcon="back" titleLeft />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 38 }}>
                <View style={GlobalStyleSheet.container}>
                    <View style={{ marginTop: 8, padding: 14, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={user?.profile?.avatar ? { uri: user.profile.avatar } : IMAGES.user}
                            style={{ height: 54, width: 54, borderRadius: 18, backgroundColor: colors.border }}
                            resizeMode="cover"
                        />
                        <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title, flexShrink: 1 }]}>{user?.full_name || 'QOT user'}</Text>
                                {phoneVerified && <FeatherIcon name="check-circle" size={14} color="#18864B" style={{ marginLeft: 6 }} />}
                            </View>
                            <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 3 }]}>{user?.phone || user?.email || 'Complete your details'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Editprofile')} style={{ minHeight: 36, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center' }}>
                            <FeatherIcon name="edit-2" size={13} color={COLORS.primary} />
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 5 }]}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {!phoneVerified && (
                        <TouchableOpacity onPress={() => navigation.navigate('VerifyAccount')} activeOpacity={0.85} style={{ marginTop: 11, borderRadius: 16, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', padding: 13, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ height: 39, width: 39, borderRadius: 12, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="alert-triangle" size={18} color={COLORS.white} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>Verify your phone number</Text>
                                <Text style={[FONTS.fontXs, { color: '#9B2C2C', marginTop: 2 }]}>Required for safer buying and selling.</Text>
                            </View>
                            <FeatherIcon name="chevron-right" size={18} color="#B42318" />
                        </TouchableOpacity>
                    )}

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Quick settings</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11 }}>
                        <QuickTile icon="user" title="Profile" detail="Photo, bio and contact details" color="#2457C5" background="#E9F2FF" onPress={() => navigation.navigate('Editprofile')} />
                        <QuickTile icon="bell" title="Notifications" detail="Choose the updates you receive" color="#EA580C" background="#FFF7ED" onPress={() => navigation.navigate('Notification')} />
                        <QuickTile icon="lock" title="Password" detail="Update your account password" color="#9A5B00" background="#FFF3DC" onPress={() => navigation.navigate('Changepassword')} />
                        <QuickTile icon="shield" title="Privacy" detail="Security, privacy and legal pages" color="#176B44" background="#E9F8EF" onPress={() => navigation.navigate('Privacy')} />
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Verification status</Text>
                    <View style={{ flexDirection: 'row', gap: 9 }}>
                        {[
                            { icon: 'smartphone', title: 'Phone', verified: phoneVerified, detail: phoneVerified ? 'Verified' : 'Action needed' },
                            { icon: 'mail', title: 'Email', verified: emailVerified, detail: emailVerified ? 'Verified' : 'Not verified' },
                        ].map((item) => (
                            <TouchableOpacity key={item.title} onPress={() => navigation.navigate('VerifyAccount')} style={{ flex: 1, minHeight: 88, borderRadius: 15, padding: 12, backgroundColor: item.verified ? '#EAF8F0' : '#FFF5E8', borderWidth: 1, borderColor: item.verified ? '#C7EBD7' : '#F5DEC3' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <FeatherIcon name={item.icon} size={17} color={item.verified ? '#18864B' : '#C45B0A'} />
                                    <FeatherIcon name={item.verified ? 'check-circle' : 'alert-circle'} size={15} color={item.verified ? '#18864B' : '#C45B0A'} />
                                </View>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: item.verified ? '#176B44' : '#8B490F', marginTop: 9 }]}>{item.title}</Text>
                                <Text style={[FONTS.fontXs, { color: item.verified ? '#39805F' : '#A26735', marginTop: 2 }]}>{item.detail}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Selling preferences</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                        <SettingRow first icon="map-pin" title="Default ad location" detail={location} onPress={() => navigation.navigate('Editprofile')} />
                        <SettingRow icon="clock" title="Timezone" detail={timezone.replaceAll('_', ' ')} onPress={() => navigation.navigate('Editprofile')} />
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Your QOT activity</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                        <SettingRow first icon="bell" title="Notification inbox" detail="Ad, account and message updates" onPress={() => navigation.navigate('NotificationsCenter')} />
                        <SettingRow icon="activity" title="Activity" detail="Alerts, ads, saves and reviews" onPress={() => navigation.navigate('AccountActivity')} />
                        <SettingRow icon="star" title="My reviews" detail="Reviews you submitted for sellers" onPress={() => navigation.navigate('MyReviews')} />
                        <SettingRow icon="tag" title="My ads" detail="Manage and review your adverts" onPress={() => navigation.navigate('MyAds')} />
                        <SettingRow icon="heart" title="Saved" detail="Saved ads and saved searches" onPress={() => openBottomTab('Saved')} />
                        <SettingRow icon="clock" title="Recently viewed" detail="Return to ads you opened" onPress={() => navigation.navigate('RecentlyViewed')} />
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Storage & data</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                        <SettingRow first icon="database" title="Clear cached data" detail="Free space without deleting drafts or account data" onPress={confirmClearCache} />
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Help & support</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                        <SettingRow first icon="help-circle" title="Help centre" detail="FAQs, legal information and support" onPress={() => navigation.navigate('Help')} />
                        <SettingRow icon="shield" title="Safety centre" detail="Safer buying, selling and account tips" onPress={() => navigation.navigate('SafetyCenter')} />
                        <SettingRow icon="mail" title="Email QOT" detail="info@qot.ug" onPress={() => Linking.openURL('mailto:info@qot.ug')} />
                        <SettingRow icon="phone" title="Call QOT" detail="0200 911 678" onPress={() => Linking.openURL('tel:0200911678')} />
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.65, marginTop: 23, marginBottom: 9 }]}>Account access</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#F3B4B4', overflow: 'hidden' }}>
                        <SettingRow
                            first
                            icon="pause-circle"
                            title="Freeze account"
                            detail="Temporarily hide your profile and ads"
                            danger
                            onPress={() => {
                                setFreezeError('');
                                setFreezeOpen(true);
                            }}
                        />
                    </View>

                    <TouchableOpacity onPress={confirmSignOut} style={{ minHeight: 50, borderRadius: 13, borderWidth: 1, borderColor: '#F3B4B4', backgroundColor: '#FFF7F7', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 24 }}>
                        <FeatherIcon name="log-out" size={17} color="#B42318" />
                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318', marginLeft: 8 }]}>Sign out</Text>
                    </TouchableOpacity>
                    <Text style={[FONTS.fontXs, { color: colors.textLight, textAlign: 'center', marginTop: 14 }]}>QOT · Version {Constants.expoConfig?.version || '1.0.3'}</Text>
                </View>
            </ScrollView>

            <Modal transparent visible={freezeOpen} animationType="fade" statusBarTranslucent onRequestClose={() => !freezing && setFreezeOpen(false)}>
                <Pressable onPress={() => !freezing && setFreezeOpen(false)} style={{ flex: 1, padding: 20, backgroundColor: 'rgba(15,23,42,.62)', alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 410, borderRadius: 22, backgroundColor: colors.card, padding: 19 }}>
                        <View style={{ height: 54, width: 54, borderRadius: 18, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="pause-circle" size={24} color="#B42318" />
                        </View>
                        <Text style={[FONTS.h5, { color: colors.title, marginTop: 15 }]}>Freeze your QOT account?</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 21, marginTop: 7 }]}>Your profile and ads will be hidden, notifications will stop, and you will be signed out on all devices.</Text>
                        <View style={{ borderRadius: 12, backgroundColor: `${COLORS.primary}0D`, padding: 11, marginTop: 13, flexDirection: 'row' }}>
                            <FeatherIcon name="refresh-cw" size={16} color={COLORS.primary} style={{ marginTop: 1 }} />
                            <Text style={[FONTS.fontXs, { color: colors.title, lineHeight: 18, flex: 1, marginLeft: 8 }]}>This is reversible. Sign in with your phone OTP whenever you want to reactivate the account.</Text>
                        </View>
                        {Boolean(freezeError) && (
                            <View style={{ borderRadius: 11, backgroundColor: '#FDECEC', padding: 10, marginTop: 12 }}>
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger }]}>{freezeError}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}>
                            <TouchableOpacity disabled={freezing} onPress={() => setFreezeOpen(false)} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Keep account</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={freezing} onPress={handleFreezeAccount} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#B42318', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: freezing ? 0.7 : 1 }}>
                                {freezing && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 7 }} />}
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>Freeze account</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default Setting;
