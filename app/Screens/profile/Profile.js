import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Share,
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
import { getMyListings } from '../../api/marketplace';
import { formatDate } from '../../utils/formatters';
import useBottomTabContentPadding from '../../utils/useBottomTabContentPadding';

const Profile = ({ navigation }) => {
    const { colors } = useTheme();
    const bottomContentPadding = useBottomTabContentPadding(105);
    const { user, refreshUser } = useAuth();
    const [ads, setAds] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadProfile = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const [, myAds] = await Promise.all([refreshUser(), getMyListings({ force: showRefresh })]);
            setAds(myAds);
        } catch {
            // Keep the last usable profile visible when a refresh fails.
        } finally {
            setRefreshing(false);
        }
    }, [refreshUser]);

    useEffect(() => {
        loadProfile();
        return navigation.addListener('focus', () => loadProfile());
    }, [loadProfile, navigation]);

    const activeAds = useMemo(
        () => ads.filter((ad) => ad.status === 'active').length,
        [ads],
    );

    const profileProgress = useMemo(() => {
        const checks = [
            { complete: Boolean(user?.full_name?.trim()), label: 'Add your full name', action: 'edit' },
            { complete: Boolean(user?.phone_verified || user?.phone_verified_at), label: 'Verify your phone number', action: 'verify' },
            { complete: Boolean(user?.profile?.avatar), label: 'Add a profile picture', action: 'edit' },
            { complete: Boolean(user?.profile?.cover_photo), label: 'Add a cover photo', action: 'edit' },
            { complete: Boolean(user?.profile?.bio?.trim()), label: 'Write a short seller bio', action: 'edit' },
            { complete: Boolean(user?.profile?.default_city), label: 'Choose your default location', action: 'edit' },
        ];
        const completed = checks.filter((item) => item.complete).length;
        return {
            completed,
            total: checks.length,
            percent: Math.round((completed / checks.length) * 100),
            next: checks.find((item) => !item.complete),
        };
    }, [user]);

    const openNetwork = (initialTab) => navigation.navigate('FollowerFollowing', {
        userId: user?.id,
        initialTab,
    });

    const shareProfile = () => {
        if (!user?.id) return;
        Share.share({
            message: `View ${user.full_name || 'my seller profile'} on QOT: https://qot.ug/sellers/${user.id}`,
        }).catch(() => {});
    };

    const continueProfile = () => navigation.navigate(
        profileProgress.next?.action === 'verify' ? 'VerifyAccount' : 'Editprofile',
    );

    const actions = [
        {
            icon: 'bar-chart-2',
            label: 'Dashboard',
            detail: 'Performance, expiry and renewal overview',
            color: '#2563EB',
            background: '#EFF6FF',
            onPress: () => navigation.navigate('SellerDashboard'),
        },
        {
            icon: 'trending-up',
            label: 'Ad analytics',
            detail: 'Views, saves and buyer conversations',
            color: '#7C3AED',
            background: '#F5F3FF',
            onPress: () => navigation.navigate('SellerAnalytics'),
        },
        {
            icon: 'refresh-cw',
            label: 'Renewals',
            detail: 'Expiry dates and ads that need attention',
            color: '#D97706',
            background: '#FFFBEB',
            onPress: () => navigation.navigate('SellerRenewals'),
        },
        {
            icon: 'tag',
            label: 'My ads',
            detail: 'Manage active, pending and draft ads',
            color: COLORS.primary,
            background: '#FFF7ED',
            onPress: () => navigation.navigate('MyAds', { initialTab: 'ads' }),
        },
        {
            icon: 'users',
            label: 'Trusted sellers',
            detail: 'Browse verified and highly rated sellers',
            color: '#168554',
            background: '#ECFDF5',
            onPress: () => navigation.navigate('Sellers'),
        },
        {
            icon: 'heart',
            label: 'Saved ads',
            detail: 'Return to ads you want to see again',
            color: '#EA580C',
            background: '#FFF7ED',
            onPress: () => navigation.navigate('Saved', { initialTab: 'ads' }),
        },
        {
            icon: 'bookmark',
            label: 'Saved searches',
            detail: 'Manage searches and matching-ad alerts',
            color: '#0F766E',
            background: '#F0FDFA',
            onPress: () => navigation.navigate('Saved', { initialTab: 'searches' }),
        },
        {
            icon: 'clock',
            label: 'Recently viewed',
            detail: 'Return to ads you opened recently',
            color: '#4F46E5',
            background: '#EEF2FF',
            onPress: () => navigation.navigate('RecentlyViewed'),
        },
        {
            icon: 'activity',
            label: 'Activity',
            detail: 'Your alerts, ads, saves and reviews',
            color: '#0284C7',
            background: '#F0F9FF',
            onPress: () => navigation.navigate('AccountActivity'),
        },
        {
            icon: 'bell',
            label: 'Notifications',
            detail: 'Read your latest ad, account and message updates',
            color: COLORS.primary,
            background: '#FFF7ED',
            onPress: () => navigation.navigate('NotificationsCenter'),
        },
        {
            icon: 'sliders',
            label: 'Notification preferences',
            detail: 'Choose message, offer, ad and account alerts',
            color: '#C2410C',
            background: '#FFF7ED',
            onPress: () => navigation.navigate('Notification'),
        },
        {
            icon: 'star',
            label: 'My reviews',
            detail: 'See reviews you have submitted for sellers',
            color: '#CA8A04',
            background: '#FEFCE8',
            onPress: () => navigation.navigate('MyReviews'),
        },
        {
            icon: 'message-circle',
            label: 'Messages',
            detail: 'Continue conversations with buyers and sellers',
            color: '#2563EB',
            background: '#EFF6FF',
            onPress: () => navigation.navigate('AccountMessages'),
        },
        {
            icon: 'settings',
            label: 'Account settings',
            detail: 'Profile, notifications, privacy and security',
            color: '#475569',
            background: '#F1F5F9',
            onPress: () => navigation.navigate('Setting'),
        },
    ];

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header
                title="My account"
                titleLeft
                leftIcon="back"
                backAction={() => (
                    navigation.canGoBack()
                        ? navigation.goBack()
                        : navigation.navigate('Home')
                )}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={(
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadProfile(true)}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                )}
                contentContainerStyle={{ paddingBottom: bottomContentPadding }}
            >
                <View style={GlobalStyleSheet.container}>
                    {!user?.phone_verified && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('VerifyAccount')}
                            activeOpacity={0.85}
                            style={{ backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F8B4B4', borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}
                        >
                            <View style={{ height: 38, width: 38, borderRadius: 19, backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="alert-triangle" size={19} color={COLORS.white} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 11 }}>
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: '#B42318' }]}>Verify your phone number</Text>
                                <Text style={[FONTS.fontXs, { color: '#9B2C2C', marginTop: 2, lineHeight: 17 }]}>Verification protects your account and is required before posting ads.</Text>
                            </View>
                            <FeatherIcon name="chevron-right" size={20} color="#B42318" />
                        </TouchableOpacity>
                    )}

                    {profileProgress.percent < 100 && (
                        <TouchableOpacity onPress={continueProfile} activeOpacity={0.84} style={{ borderRadius: 15, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, padding: 13, marginBottom: 15 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 38, width: 38, borderRadius: 12, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="user-check" size={18} color={COLORS.primary} /></View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Complete your seller profile</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Next: {profileProgress.next?.label}</Text>
                                </View>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>{profileProgress.percent}%</Text>
                                <FeatherIcon name="chevron-right" size={18} color={COLORS.primary} style={{ marginLeft: 4 }} />
                            </View>
                            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.background, overflow: 'hidden', marginTop: 11 }}>
                                <View style={{ height: '100%', width: `${profileProgress.percent}%`, borderRadius: 3, backgroundColor: COLORS.primary }} />
                            </View>
                            <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9, marginTop: 6 }]}>{profileProgress.completed} of {profileProgress.total} profile steps complete</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 18, overflow: 'hidden' }}>
                        <View style={{ height: 142, backgroundColor: '#FFF3E8' }}>
                            {user?.profile?.cover_photo ? (
                                <Image source={{ uri: user.profile.cover_photo }} style={{ height: '100%', width: '100%' }} resizeMode="cover" />
                            ) : (
                                <View style={{ flex: 1, overflow: 'hidden', justifyContent: 'flex-end' }}>
                                    <View style={{ position: 'absolute', height: 180, width: 180, borderRadius: 90, backgroundColor: '#FED7AA', right: -32, top: -82 }} />
                                    <View style={{ position: 'absolute', height: 120, width: 120, borderRadius: 60, backgroundColor: '#FDBA74', left: -28, bottom: -64 }} />
                                </View>
                            )}
                        </View>

                        <View style={{ paddingHorizontal: 16, paddingBottom: 18 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: -40 }}>
                                <View style={{ height: 88, width: 88, borderRadius: 44, padding: 4, backgroundColor: colors.card }}>
                                    <Image
                                        source={user?.profile?.avatar ? { uri: user.profile.avatar } : IMAGES.user}
                                        style={{ height: 80, width: 80, borderRadius: 40, backgroundColor: '#F1F2F5' }}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={{ marginLeft: 'auto', marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                                    <TouchableOpacity onPress={shareProfile} accessibilityLabel="Share seller profile" style={{ height: 38, width: 38, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="share-2" size={15} color={colors.title} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Editprofile')}
                                        style={{ height: 38, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center' }}
                                    >
                                        <FeatherIcon name="edit-2" size={13} color={COLORS.primary} />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 5 }]}>Edit profile</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                <Text style={[FONTS.h5, { color: colors.title, flexShrink: 1 }]}>{user?.full_name || 'QOT user'}</Text>
                                {user?.is_verified && <FeatherIcon name="check-circle" size={17} color={COLORS.primary} style={{ marginLeft: 7 }} />}
                            </View>
                            {user?.profile?.business_name ? (
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginTop: 2 }]}>{user.profile.business_name}</Text>
                            ) : null}
                            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 4 }]}>{user?.phone || user?.email || 'Complete your contact details'}</Text>
                            {user?.profile?.bio ? (
                                <Text style={[FONTS.fontSm, { color: colors.title, marginTop: 10, lineHeight: 20 }]}>{user.profile.bio}</Text>
                            ) : null}

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FeatherIcon name="map-pin" size={14} color={colors.text} />
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 5 }]}>
                                        {user?.profile?.default_area_name
                                            ? `${user.profile.default_area_name}, ${user.profile.default_city_name || ''}`
                                            : user?.profile?.default_city_name || 'Location not set'}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FeatherIcon name="calendar" size={14} color={colors.text} />
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 5 }]}>Joined {formatDate(user?.date_joined)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
                            {[
                                ['Active ads', activeAds, () => navigation.navigate('MyAds', { initialTab: 'ads' })],
                                ['Followers', user?.followers_count || 0, () => openNetwork('followers')],
                                ['Following', user?.following_count || 0, () => openNetwork('following')],
                            ].map(([label, value, onPress], index) => (
                                <TouchableOpacity
                                    key={label}
                                    onPress={onPress}
                                    style={{ flex: 1, alignItems: 'center', paddingVertical: 13, borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.border }}
                                >
                                    <Text style={[FONTS.h6, { color: colors.title }]}>{value}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 23, marginBottom: 10 }]}>Your QOT</Text>
                    <View style={{ borderWidth: 1, borderColor: colors.borderColor, borderRadius: 16, overflow: 'hidden' }}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={action.label}
                                onPress={action.onPress}
                                style={{ flexDirection: 'row', alignItems: 'center', minHeight: 70, paddingHorizontal: 15, backgroundColor: colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}
                            >
                                <View style={{ height: 42, width: 42, borderRadius: 13, borderWidth: 1, borderColor: `${action.color}22`, backgroundColor: action.background, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={action.icon} size={19} color={action.color} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{action.label}</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{action.detail}</Text>
                                </View>
                                <FeatherIcon name="chevron-right" size={19} color={colors.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
