import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { getSellerAnalytics } from '../../api/account';
import { getMyListings } from '../../api/marketplace';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';

const numberValue = (...values) => {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '') return Number(value) || 0;
    }
    return 0;
};

const imageFor = (listing) => (
    listing?.primary_image
    || listing?.image
    || listing?.images?.[0]?.card_image_url
    || listing?.images?.[0]?.image_url
    || listing?.images?.[0]?.image
    || ''
);

const StatTile = ({ icon, label, value, helper, background, color }) => (
    <View style={{ width: '48.4%', minHeight: 122, borderRadius: 18, padding: 14, backgroundColor: background, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{label}</Text>
            <View style={{ height: 30, width: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,.48)', alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name={icon} size={14} color={color} />
            </View>
        </View>
        <Text style={[FONTS.h3, { color, marginTop: 8 }]}>{Number(value || 0).toLocaleString()}</Text>
        <Text style={[FONTS.fontXs, { color, opacity: 0.74, fontSize: 9 }]}>{helper}</Text>
    </View>
);

const Metric = ({ icon, label, value, colors }) => (
    <View style={{ flex: 1, minWidth: 0, borderRadius: 10, backgroundColor: colors.background, paddingHorizontal: 7, paddingVertical: 7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FeatherIcon name={icon} size={11} color={colors.textLight} />
            <Text style={[FONTS.fontXs, { color: colors.text, fontSize: 8, marginLeft: 4 }]}>{label}</Text>
        </View>
        <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 3 }]}>{Number(value || 0).toLocaleString()}</Text>
    </View>
);

const SellerAnalytics = ({ navigation }) => {
    const { colors } = useTheme();
    const [summary, setSummary] = useState(null);
    const [listings, setListings] = useState([]);
    const [sort, setSort] = useState('views');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadAnalytics = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [analyticsData, sellerListings] = await Promise.all([
                getSellerAnalytics({ force: refresh }),
                getMyListings({ force: refresh }),
            ]);
            setSummary(analyticsData);
            setListings(sellerListings);
        } catch (requestError) {
            setError(requestError.message || 'Seller analytics could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics();
        return navigation.addListener('focus', () => loadAnalytics());
    }, [loadAnalytics, navigation]);

    const totalViews = numberValue(
        summary?.total_views,
        listings.reduce((total, listing) => total + numberValue(listing.views_count), 0),
    );
    const totalSaves = numberValue(
        summary?.total_favorites,
        listings.reduce((total, listing) => total + numberValue(listing.favorites_count), 0),
    );
    const totalChats = numberValue(summary?.total_chat_threads);
    const engagement = totalViews > 0 ? (((totalSaves + totalChats) / totalViews) * 100).toFixed(1) : '0.0';

    const sortedListings = useMemo(() => [...listings].sort((first, second) => {
        if (sort === 'saves') return numberValue(second.favorites_count) - numberValue(first.favorites_count);
        if (sort === 'newest') return new Date(second.created_at || 0).getTime() - new Date(first.created_at || 0).getTime();
        return numberValue(second.views_count) - numberValue(first.views_count);
    }), [listings, sort]);

    const maxViews = Math.max(1, ...listings.map((listing) => numberValue(listing.views_count)));
    const stats = [
        { icon: 'tag', label: 'Total ads', value: numberValue(summary?.total_listings, listings.length), helper: 'All your adverts', background: COLORS.primary, color: '#FFFFFF' },
        { icon: 'eye', label: 'Views', value: totalViews, helper: 'Buyer visits', background: '#E9F2FF', color: '#2457C5' },
        { icon: 'heart', label: 'Saves', value: totalSaves, helper: 'Buyer interest', background: '#FFF0F4', color: '#B42355' },
        { icon: 'message-circle', label: 'Chats', value: totalChats, helper: 'Buyer conversations', background: '#FFF7ED', color: '#EA580C' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Ad analytics" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading analytics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Ad analytics" leftIcon="back" titleLeft />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAnalytics(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ paddingBottom: 35 }}
            >
                <View style={GlobalStyleSheet.container}>
                    {Boolean(error) && (
                        <TouchableOpacity onPress={() => loadAnalytics()} style={{ marginTop: 8, marginBottom: 12, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', borderRadius: 13, padding: 13 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>{error}</Text>
                            <Text style={[FONTS.fontXs, { color: '#9B2C2C', marginTop: 3 }]}>Tap to try again.</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11, marginTop: 8 }}>
                        {stats.map((stat) => <StatTile key={stat.label} {...stat} />)}
                    </View>

                    <View style={{ marginTop: 14, borderRadius: 16, padding: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ height: 42, width: 42, borderRadius: 13, backgroundColor: '#EAF8F0', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="activity" size={20} color="#178454" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 11 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Buyer engagement</Text>
                            <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Saves and chats compared with total views</Text>
                        </View>
                        <Text style={[FONTS.h5, { color: '#178454' }]}>{engagement}%</Text>
                    </View>

                    <View style={{ marginTop: 23 }}>
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 }]}>Ad performance</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                            <Text style={[FONTS.h6, { color: colors.title, flex: 1 }]}>Compare your ads</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyAds')}>
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>My ads</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -15, marginTop: 10 }} contentContainerStyle={{ paddingHorizontal: 15 }}>
                        {[
                            ['views', 'Most viewed'],
                            ['saves', 'Most saved'],
                            ['newest', 'Newest'],
                        ].map(([value, label]) => {
                            const active = sort === value;
                            return (
                                <TouchableOpacity key={value} onPress={() => setSort(value)} style={{ height: 36, borderRadius: 18, paddingHorizontal: 13, marginRight: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: active ? COLORS.primary : colors.card, borderWidth: 1, borderColor: active ? COLORS.primary : colors.borderColor }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: active ? COLORS.white : colors.text }]}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {sortedListings.length === 0 ? (
                        <View style={{ marginTop: 12, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderColor, padding: 28, alignItems: 'center' }}>
                            <FeatherIcon name="bar-chart-2" size={30} color={colors.textLight} />
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 10 }]}>No ad performance yet</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={{ marginTop: 8 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Post an ad</Text></TouchableOpacity>
                        </View>
                    ) : sortedListings.map((listing, index) => {
                        const image = imageFor(listing);
                        const views = numberValue(listing.views_count);
                        const performanceWidth = Math.max(4, Math.round((views / maxViews) * 100));

                        return (
                            <TouchableOpacity
                                key={listing.id}
                                onPress={() => navigation.navigate('ListingAnalytics', { listingId: listing.id, listing })}
                                activeOpacity={0.84}
                                style={{ borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, borderRadius: 16, padding: 11, marginTop: 11 }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ height: 82, width: 90, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.border }}>
                                        {image ? <Image source={{ uri: image }} style={{ height: '100%', width: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.textLight }]}>QOT</Text></View>}
                                        <View style={{ position: 'absolute', left: 5, top: 5, minWidth: 24, height: 22, borderRadius: 8, paddingHorizontal: 5, backgroundColor: 'rgba(15,23,42,.78)', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, fontSize: 8 }]}>#{index + 1}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                        <Text numberOfLines={2} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, lineHeight: 18 }]}>{listing.title || 'Untitled ad'}</Text>
                                        <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginTop: 4 }]}>{formatPrice(listing.price, listing.currency)}</Text>
                                        <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 5, textTransform: 'capitalize' }]}>{String(listing.status || 'draft').replaceAll('_', ' ')} · {formatRelativeTime(listing.created_at)}</Text>
                                    </View>
                                    <FeatherIcon name="chevron-right" size={18} color={colors.textLight} style={{ alignSelf: 'center' }} />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
                                    <Metric icon="eye" label="Views" value={views} colors={colors} />
                                    <Metric icon="heart" label="Saves" value={listing.favorites_count} colors={colors} />
                                    <Metric icon="image" label="Photos" value={listing.image_count} colors={colors} />
                                </View>

                                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.background, overflow: 'hidden', marginTop: 10 }}>
                                    <View style={{ height: '100%', width: `${performanceWidth}%`, borderRadius: 3, backgroundColor: COLORS.primary }} />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SellerAnalytics;
