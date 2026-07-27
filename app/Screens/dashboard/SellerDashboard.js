import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
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
import { COLORS, FONTS } from '../../constants/theme';
import { getSellerDashboard } from '../../api/account';
import {
    getMyListings,
    relistListing,
    renewListing,
} from '../../api/marketplace';
import {
    canRenewListing,
    formatExpiryRemaining,
    formatPrice,
    getExpiryTime,
} from '../../utils/formatters';

const numberValue = (...values) => {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '') {
            return Number(value) || 0;
        }
    }
    return 0;
};

const listingImage = (listing) => (
    listing?.primary_image
    || listing?.image
    || listing?.cover_image
    || listing?.images?.[0]?.card_image_url
    || listing?.images?.[0]?.image_url
    || listing?.images?.[0]?.image
    || ''
);

const listingStatus = (listing) => String(listing?.status || 'draft').toLowerCase();

const statusTone = (status) => {
    if (status === 'active') return { background: '#EAF8F0', text: '#157347' };
    if (status === 'expired') return { background: '#FFF0E8', text: '#C2410C' };
    if (status === 'rejected') return { background: '#FFF0F0', text: '#B42318' };
    if (status === 'pending') return { background: '#FFF6DC', text: '#A15C00' };
    return { background: '#EEF1F5', text: '#586174' };
};

const enrichListing = (listing, allListings) => {
    const match = allListings.find((item) => String(item.id) === String(listing?.id));
    return match ? { ...listing, ...match } : listing;
};

const StatTile = ({ icon, label, value, detail, background, color }) => (
    <View
        style={{
            width: '48.4%',
            minHeight: 126,
            borderRadius: 18,
            padding: 14,
            backgroundColor: background,
            justifyContent: 'space-between',
        }}
    >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{label}</Text>
            <View style={{ height: 30, width: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.48)', alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name={icon} size={14} color={color} />
            </View>
        </View>
        <Text style={[FONTS.h3, { color, marginTop: 9 }]}>{Number(value || 0).toLocaleString()}</Text>
        <Text style={[FONTS.fontXs, { color, opacity: 0.74, fontSize: 9 }]}>{detail}</Text>
    </View>
);

const CompactListing = ({ listing, navigation, now, showExpiry = false }) => {
    const colors = useTheme().colors;
    const image = listingImage(listing);
    const status = listingStatus(listing);
    const tone = statusTone(status);

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('ItemDetails', { listingId: listing.id, item: listing })}
            activeOpacity={0.84}
            style={{ flexDirection: 'row', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 15, padding: 10, backgroundColor: colors.card, marginTop: 10 }}
        >
            <View style={{ height: 78, width: 86, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.border }}>
                {image ? (
                    <Image source={{ uri: image }} style={{ height: '100%', width: '100%' }} resizeMode="cover" />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.textLight }]}>QOT</Text>
                    </View>
                )}
            </View>
            <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ borderRadius: 7, backgroundColor: tone.background, paddingHorizontal: 7, paddingVertical: 3 }}>
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: tone.text, fontSize: 8, textTransform: 'uppercase' }]}>{status === 'pending' ? 'Pending approval' : status}</Text>
                    </View>
                    {listing.is_featured && (
                        <View style={{ borderRadius: 7, backgroundColor: '#FFF2C6', paddingHorizontal: 7, paddingVertical: 3, marginLeft: 5 }}>
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#8A5700', fontSize: 8 }]}>FEATURED</Text>
                        </View>
                    )}
                </View>
                <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 6 }]}>{listing.title || 'Untitled ad'}</Text>
                <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginTop: 3 }]}>{formatPrice(listing.price, listing.currency)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <FeatherIcon name="eye" size={12} color={colors.textLight} />
                    <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 4 }]}>{numberValue(listing.views_count, listing.views)} views</Text>
                    <FeatherIcon name="heart" size={12} color={colors.textLight} style={{ marginLeft: 11 }} />
                    <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 4 }]}>{numberValue(listing.favorites_count)} saves</Text>
                </View>
                {showExpiry && listing.expires_at ? (
                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: getExpiryTime(listing.expires_at) <= now ? COLORS.primary : colors.text, marginTop: 5 }]}>
                        {formatExpiryRemaining(listing.expires_at, now)}
                    </Text>
                ) : null}
            </View>
            <FeatherIcon name="chevron-right" size={18} color={colors.textLight} style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
    );
};

const SellerDashboard = ({ navigation }) => {
    const { colors } = useTheme();
    const [dashboard, setDashboard] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);
    const [now, setNow] = useState(Date.now());

    const loadDashboard = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [summary, sellerListings] = await Promise.all([
                getSellerDashboard({ force: refresh }),
                getMyListings({ force: refresh }),
            ]);
            setDashboard(summary);
            setListings(sellerListings);
        } catch (requestError) {
            setError(requestError.message || 'The dashboard could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
        const unsubscribe = navigation.addListener('focus', () => loadDashboard());
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [loadDashboard, navigation]);

    const recentListings = useMemo(() => {
        const source = Array.isArray(dashboard?.recent_listings)
            ? dashboard.recent_listings
            : listings.slice(0, 5);
        return source.map((listing) => enrichListing(listing, listings));
    }, [dashboard, listings]);

    const bestListing = useMemo(() => {
        if (dashboard?.best_listing) return enrichListing(dashboard.best_listing, listings);
        return [...listings].sort((first, second) => numberValue(second.views_count) - numberValue(first.views_count))[0] || null;
    }, [dashboard, listings]);

    const attentionListings = useMemo(() => listings
        .filter((listing) => {
            const status = listingStatus(listing);
            if (['expired', 'unavailable', 'sold'].includes(status)) return true;
            if (status !== 'active') return false;
            const expiry = getExpiryTime(listing.expires_at);
            return expiry !== null && expiry - now <= 7 * 24 * 60 * 60 * 1000;
        })
        .sort((first, second) => (getExpiryTime(first.expires_at) || 0) - (getExpiryTime(second.expires_at) || 0)), [listings, now]);

    const stats = [
        { icon: 'tag', label: 'Total ads', value: numberValue(dashboard?.total_listings, listings.length), detail: 'All your adverts', background: COLORS.primary, color: '#FFFFFF' },
        { icon: 'check-circle', label: 'Active', value: numberValue(dashboard?.active_listings, listings.filter((item) => listingStatus(item) === 'active').length), detail: 'Visible to buyers', background: '#E9F8EF', color: '#176B44' },
        { icon: 'zap', label: 'Featured', value: numberValue(dashboard?.active_featured_listings, listings.filter((item) => item.is_featured).length), detail: 'Currently promoted', background: '#FFF7ED', color: '#EA580C' },
        { icon: 'clock', label: 'Need action', value: attentionListings.length, detail: 'Expiry and renewals', background: '#FFF3DC', color: '#9A5B00' },
    ];

    const runListingAction = (listing) => {
        const status = listingStatus(listing);
        const renew = canRenewListing(listing, now);
        const relist = ['unavailable', 'sold'].includes(status);
        if (!renew && !relist) return;

        const actionLabel = relist ? 'relist' : 'renew';
        Alert.alert(
            `${relist ? 'Relist' : 'Renew'} ad?`,
            `${listing.title || 'This ad'} will return to active marketplace placement.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: relist ? 'Relist' : 'Renew',
                    onPress: async () => {
                        setActionId(listing.id);
                        try {
                            if (relist) await relistListing(listing.id);
                            else await renewListing(listing.id);
                            await loadDashboard(true);
                        } catch (requestError) {
                            Alert.alert(`Could not ${actionLabel} ad`, requestError.message || 'Please try again.');
                        } finally {
                            setActionId(null);
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Dashboard" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading your dashboard...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Dashboard" leftIcon="back" titleLeft />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ paddingBottom: 35 }}
            >
                <View style={GlobalStyleSheet.container}>
                    {Boolean(error) && (
                        <TouchableOpacity onPress={() => loadDashboard()} style={{ marginTop: 8, marginBottom: 12, borderRadius: 13, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', padding: 13 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>{error}</Text>
                            <Text style={[FONTS.fontXs, { color: '#9B2C2C', marginTop: 3 }]}>Tap to try again.</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11, marginTop: 8 }}>
                        {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
                    </View>

                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 23, marginBottom: 10 }]}>Quick actions</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 9 }}>
                        {[
                            ['plus-circle', 'Post an ad', 'Sell'],
                            ['list', 'My ads', 'MyAds'],
                            ['bar-chart-2', 'Analytics', 'SellerAnalytics'],
                            ['refresh-cw', 'Renewals', 'SellerRenewals'],
                            ['message-circle', 'Messages', 'Messages'],
                            ['settings', 'Settings', 'Setting'],
                        ].map(([icon, label, route]) => (
                            <TouchableOpacity
                                key={label}
                                onPress={() => {
                                    if (route === 'Messages') {
                                        navigation.navigate('DrawerNavigation', { screen: 'BottomNavigation', params: { screen: 'Messages' } });
                                        return;
                                    }
                                    navigation.navigate(route);
                                }}
                                style={{ width: '48.6%', minHeight: 50, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 14, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }}
                            >
                                <View style={{ height: 32, width: 32, borderRadius: 10, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={icon} size={16} color={COLORS.primary} />
                                </View>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginLeft: 9, flex: 1 }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {bestListing && (
                        <View style={{ marginTop: 23 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#178454', textTransform: 'uppercase', letterSpacing: 0.5 }]}>Top performer</Text>
                                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 2 }]}>Your most-viewed ad</Text>
                                </View>
                                <FeatherIcon name="trending-up" size={20} color="#178454" />
                            </View>
                            <CompactListing listing={bestListing} navigation={navigation} now={now} showExpiry />
                        </View>
                    )}

                    <View style={{ marginTop: 23 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#A15C00', textTransform: 'uppercase', letterSpacing: 0.5 }]}>Needs attention</Text>
                                <Text style={[FONTS.h6, { color: colors.title, marginTop: 2 }]}>Expiry and renewal</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('MyAds')}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>My ads</Text></TouchableOpacity>
                        </View>

                        {attentionListings.length === 0 ? (
                            <View style={{ borderRadius: 15, backgroundColor: '#EAF8F0', padding: 15, marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <FeatherIcon name="check-circle" size={20} color="#178454" />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#176B44' }]}>Everything looks good</Text>
                                    <Text style={[FONTS.fontXs, { color: '#35775A', marginTop: 2 }]}>No ads need renewal right now.</Text>
                                </View>
                            </View>
                        ) : attentionListings.slice(0, 4).map((listing) => {
                            const status = listingStatus(listing);
                            const renewable = canRenewListing(listing, now);
                            const relistable = ['unavailable', 'sold'].includes(status);
                            const buttonEnabled = renewable || relistable;

                            return (
                                <View key={listing.id} style={{ borderWidth: 1, borderColor: colors.borderColor, borderRadius: 15, backgroundColor: colors.card, padding: 12, marginTop: 10 }}>
                                    <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{listing.title || 'Untitled ad'}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                        <FeatherIcon name="clock" size={13} color={buttonEnabled ? COLORS.primary : colors.text} />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: buttonEnabled ? COLORS.primary : colors.text, marginLeft: 5, flex: 1 }]}>
                                            {listing.expires_at ? formatExpiryRemaining(listing.expires_at, now) : status.replaceAll('_', ' ')}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId: listing.id, item: listing })} style={{ flex: 1, height: 39, borderRadius: 11, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title }]}>View ad</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            disabled={!buttonEnabled || actionId === listing.id}
                                            onPress={() => runListingAction(listing)}
                                            style={{ flex: 1.35, height: 39, borderRadius: 11, backgroundColor: buttonEnabled ? COLORS.primary : '#E8EAF0', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                                        >
                                            {actionId === listing.id ? (
                                                <ActivityIndicator size="small" color={COLORS.white} />
                                            ) : (
                                                <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: buttonEnabled ? COLORS.white : '#71798A' }]}>
                                                    {relistable ? 'Relist ad' : renewable ? 'Renew ad' : 'Available after expiry'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ marginTop: 23 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[FONTS.h6, { color: colors.title, flex: 1 }]}>Recent ads</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyAds')}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>View all</Text></TouchableOpacity>
                        </View>
                        {recentListings.length ? recentListings.map((listing) => (
                            <CompactListing key={listing.id} listing={listing} navigation={navigation} now={now} showExpiry />
                        )) : (
                            <View style={{ borderRadius: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderColor, padding: 22, marginTop: 10, alignItems: 'center' }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>No ads yet</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={{ marginTop: 7 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Post your first ad</Text></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SellerDashboard;
