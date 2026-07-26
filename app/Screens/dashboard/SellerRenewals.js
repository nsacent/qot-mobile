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
import { getMyListings, relistListing, renewListing } from '../../api/marketplace';
import {
    canRenewListing,
    formatExpiryRemaining,
    formatPrice,
    getExpiryTime,
} from '../../utils/formatters';

const DAY = 24 * 60 * 60 * 1000;

const statusFor = (listing) => String(listing?.status || 'draft').toLowerCase();

const imageFor = (listing) => (
    listing?.primary_image
    || listing?.image
    || listing?.cover_image
    || listing?.images?.[0]?.card_image_url
    || listing?.images?.[0]?.image_url
    || listing?.images?.[0]?.image
    || ''
);

const toneFor = (status) => {
    if (status === 'active') return { background: '#EAF8F0', text: '#157347' };
    if (status === 'expired') return { background: '#FFF0E8', text: '#C2410C' };
    if (status === 'sold') return { background: '#EEF1F5', text: '#586174' };
    if (status === 'unavailable') return { background: '#FFF0F0', text: '#B42318' };
    return { background: '#FFF6DC', text: '#A15C00' };
};

const StatTile = ({ icon, label, value, helper, background, color }) => (
    <View style={{ width: '48.4%', minHeight: 118, borderRadius: 18, padding: 14, backgroundColor: background, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.45 }]}>{label}</Text>
            <View style={{ height: 30, width: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.48)', alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name={icon} size={14} color={color} />
            </View>
        </View>
        <Text style={[FONTS.h3, { color, marginTop: 7 }]}>{value}</Text>
        <Text style={[FONTS.fontXs, { color, opacity: 0.74, fontSize: 9 }]}>{helper}</Text>
    </View>
);

const SellerRenewals = ({ navigation }) => {
    const { colors } = useTheme();
    const [listings, setListings] = useState([]);
    const [filter, setFilter] = useState('attention');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState('');
    const [now, setNow] = useState(Date.now());

    const loadListings = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            setListings(await getMyListings({ force: refresh }));
        } catch (requestError) {
            setError(requestError.message || 'Your renewals could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadListings();
        const unsubscribe = navigation.addListener('focus', () => loadListings());
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [loadListings, navigation]);

    const groups = useMemo(() => {
        const active = listings.filter((listing) => statusFor(listing) === 'active');
        const expiring = active.filter((listing) => {
            const expiry = getExpiryTime(listing.expires_at);
            return expiry !== null && expiry > now && expiry - now <= 7 * DAY;
        });
        const actionReady = listings.filter((listing) => {
            const status = statusFor(listing);
            return ['expired', 'unavailable', 'sold'].includes(status) || canRenewListing(listing, now);
        });
        const attentionIds = new Set([...expiring, ...actionReady].map((listing) => String(listing.id)));
        const attention = listings
            .filter((listing) => attentionIds.has(String(listing.id)))
            .sort((first, second) => (getExpiryTime(first.expires_at) || 0) - (getExpiryTime(second.expires_at) || 0));

        return { active, expiring, actionReady, attention };
    }, [listings, now]);

    const visibleListings = filter === 'active' ? groups.active : groups.attention;

    const runAction = (listing) => {
        const status = statusFor(listing);
        const shouldRelist = ['unavailable', 'sold'].includes(status);
        const shouldRenew = canRenewListing(listing, now);
        if (!shouldRelist && !shouldRenew) return;

        const verb = shouldRelist ? 'Relist' : 'Renew';
        Alert.alert(
            `${verb} this ad?`,
            `${listing.title || 'This ad'} will be submitted for active marketplace placement.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: verb,
                    onPress: async () => {
                        setActionId(listing.id);
                        try {
                            if (shouldRelist) await relistListing(listing.id);
                            else await renewListing(listing.id);
                            await loadListings(true);
                        } catch (requestError) {
                            Alert.alert(`${verb} failed`, requestError.message || 'Please try again.');
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
                <Header title="Ad renewals" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Checking ad expiry dates...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Ad renewals" leftIcon="back" titleLeft />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadListings(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ paddingBottom: 36 }}
            >
                <View style={GlobalStyleSheet.container}>
                    {Boolean(error) && (
                        <TouchableOpacity onPress={() => loadListings()} style={{ marginTop: 8, marginBottom: 12, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', borderRadius: 13, padding: 13 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>{error}</Text>
                            <Text style={[FONTS.fontXs, { color: '#9B2C2C', marginTop: 3 }]}>Tap to try again.</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ marginTop: 7, borderRadius: 17, padding: 15, backgroundColor: '#FFF5E8', flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ height: 42, width: 42, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="clock" size={20} color="#C45B0A" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 11 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#7B3B0C' }]}>Renew only when an ad expires</Text>
                            <Text style={[FONTS.fontXs, { color: '#95561F', marginTop: 3, lineHeight: 16 }]}>We show the exact time left and unlock renewal automatically.</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11, marginTop: 13 }}>
                        <StatTile icon="tag" label="Total ads" value={listings.length} helper="All your adverts" background={COLORS.primary} color="#FFFFFF" />
                        <StatTile icon="check-circle" label="Active" value={groups.active.length} helper="Visible to buyers" background="#E9F8EF" color="#176B44" />
                        <StatTile icon="clock" label="Expiring soon" value={groups.expiring.length} helper="Within seven days" background="#FFF3DC" color="#9A5B00" />
                        <StatTile icon="refresh-cw" label="Action ready" value={groups.actionReady.length} helper="Can renew or relist" background="#FFF7ED" color="#EA580C" />
                    </View>

                    <View style={{ marginTop: 23 }}>
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 }]}>Expiry manager</Text>
                        <Text style={[FONTS.h6, { color: colors.title, marginTop: 3 }]}>Keep your ads visible</Text>
                    </View>

                    <View style={{ flexDirection: 'row', borderRadius: 13, padding: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, marginTop: 11 }}>
                        {[
                            ['attention', `Needs attention (${groups.attention.length})`],
                            ['active', `Active (${groups.active.length})`],
                        ].map(([value, label]) => {
                            const selected = filter === value;
                            return (
                                <TouchableOpacity key={value} onPress={() => setFilter(value)} style={{ flex: 1, minHeight: 37, borderRadius: 10, backgroundColor: selected ? COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.text, fontSize: 9 }]}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {visibleListings.length === 0 ? (
                        <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderColor, padding: 27, alignItems: 'center' }}>
                            <FeatherIcon name={filter === 'attention' ? 'check-circle' : 'tag'} size={30} color={filter === 'attention' ? '#178454' : colors.textLight} />
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 10 }]}>{filter === 'attention' ? 'Nothing needs attention' : 'No active ads'}</Text>
                            <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 4, textAlign: 'center' }]}>{filter === 'attention' ? 'Your current ads are in good shape.' : 'Post an ad to start selling on QOT.'}</Text>
                        </View>
                    ) : visibleListings.map((listing) => {
                        const status = statusFor(listing);
                        const tone = toneFor(status);
                        const image = imageFor(listing);
                        const shouldRelist = ['unavailable', 'sold'].includes(status);
                        const renewalReady = canRenewListing(listing, now);
                        const canAct = shouldRelist || renewalReady;
                        const expiry = getExpiryTime(listing.expires_at);
                        const isExpiring = status === 'active' && expiry !== null && expiry > now && expiry - now <= 7 * DAY;

                        return (
                            <View key={listing.id} style={{ marginTop: 11, padding: 11, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor }}>
                                <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId: listing.id, item: listing })} activeOpacity={0.84} style={{ flexDirection: 'row' }}>
                                    <View style={{ height: 82, width: 90, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.border }}>
                                        {image ? <Image source={{ uri: image }} style={{ height: '100%', width: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.textLight }]}>QOT</Text></View>}
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                        <View style={{ alignSelf: 'flex-start', borderRadius: 7, backgroundColor: tone.background, paddingHorizontal: 7, paddingVertical: 3 }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: tone.text, fontSize: 8, textTransform: 'uppercase' }]}>{status.replaceAll('_', ' ')}</Text>
                                        </View>
                                        <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 6 }]}>{listing.title || 'Untitled ad'}</Text>
                                        <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginTop: 3 }]}>{formatPrice(listing.price, listing.currency)}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                            <FeatherIcon name="clock" size={12} color={isExpiring || renewalReady ? '#C45B0A' : colors.textLight} />
                                            <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: isExpiring || renewalReady ? '#C45B0A' : colors.text, marginLeft: 4, flex: 1 }]}>
                                                {listing.expires_at ? formatExpiryRemaining(listing.expires_at, now) : 'Expiry time not set'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 11 }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId: listing.id, item: listing })} style={{ flex: 1, minHeight: 41, borderRadius: 11, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title }]}>View ad</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={!canAct || actionId === listing.id} onPress={() => runAction(listing)} style={{ flex: 1.2, minHeight: 41, borderRadius: 11, backgroundColor: canAct ? COLORS.primary : colors.background, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                                        {actionId === listing.id ? <ActivityIndicator size="small" color={COLORS.white} /> : <>
                                            <FeatherIcon name="refresh-cw" size={13} color={canAct ? COLORS.white : colors.textLight} />
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: canAct ? COLORS.white : colors.textLight, marginLeft: 6 }]}>{shouldRelist ? 'Relist ad' : renewalReady ? 'Renew ad' : 'Not due yet'}</Text>
                                        </>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SellerRenewals;
