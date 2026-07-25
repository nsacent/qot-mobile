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
import { getListingAnalytics } from '../../api/account';
import { getOwnedListing } from '../../api/marketplace';
import { useAuth } from '../../context/AuthContext';
import {
    formatDate,
    formatExpiryRemaining,
    formatPrice,
    formatRelativeTime,
} from '../../utils/formatters';

const numberValue = (...values) => {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '') return Number(value) || 0;
    }
    return 0;
};

const listingImage = (listing) => (
    listing?.primary_image
    || listing?.card_image
    || listing?.images?.find((image) => image.is_primary)?.card_image_url
    || listing?.images?.find((image) => image.is_primary)?.image_url
    || listing?.images?.[0]?.card_image_url
    || listing?.images?.[0]?.image_url
    || listing?.images?.[0]?.image
    || ''
);

const statusTone = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'active') return { color: '#18864B', background: '#EAF8F0' };
    if (value === 'rejected') return { color: '#B42318', background: '#FDECEC' };
    if (value === 'pending') return { color: '#A15C00', background: '#FFF3D6' };
    return { color: '#596273', background: '#EEF0F3' };
};

const StatCard = ({ icon, label, value, helper, color, background }) => {
    const { colors } = useTheme();
    return (
        <View style={{ width: '48.4%', minHeight: 124, borderRadius: 17, padding: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor }}>
            <View style={{ height: 37, width: 37, borderRadius: 12, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name={icon} size={17} color={color} />
            </View>
            <Text style={[FONTS.h4, { color: colors.title, marginTop: 10 }]}>{Number(value || 0).toLocaleString()}</Text>
            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginTop: 1 }]}>{label}</Text>
            <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, fontSize: 9, marginTop: 2 }]}>{helper}</Text>
        </View>
    );
};

const ListingAnalytics = ({ route, navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const listingId = route?.params?.listingId;
    const [listing, setListing] = useState(route?.params?.listing || null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async (refresh = false) => {
        if (!listingId) {
            setError('This ad could not be opened.');
            setLoading(false);
            return;
        }

        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [listingData, analyticsData] = await Promise.all([
                getOwnedListing(listingId),
                getListingAnalytics(listingId),
            ]);
            setListing(listingData);
            setAnalytics(analyticsData);
        } catch (requestError) {
            setError(requestError.message || 'Ad analytics could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [listingId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const views = numberValue(analytics?.views_count, listing?.views_count);
    const saves = numberValue(analytics?.favorites_count, listing?.favorites_count);
    const chats = numberValue(analytics?.chat_threads_count, listing?.chat_threads_count);
    const saveRate = views ? (saves / views) * 100 : 0;
    const chatRate = views ? (chats / views) * 100 : 0;
    const interestRate = views ? ((saves + chats) / views) * 100 : 0;
    const image = listingImage(listing);
    const tone = statusTone(listing?.status || analytics?.status);

    const insight = useMemo(() => {
        if (!views) return { icon: 'share-2', title: 'Help buyers discover this ad', detail: 'Share the ad and check that its main photo and title are clear.' };
        if (!chats && saves) return { icon: 'message-circle', title: 'Buyers are interested', detail: 'People are saving this ad. A clearer description or negotiable price may encourage messages.' };
        if (chatRate >= 5) return { icon: 'trending-up', title: 'Strong buyer response', detail: 'This ad is turning views into conversations well. Reply quickly to keep buyers interested.' };
        if (saveRate >= 8) return { icon: 'heart', title: 'Good saving activity', detail: 'Buyers want to return to this ad. Keep the details and availability up to date.' };
        return { icon: 'camera', title: 'Improve the first impression', detail: 'Try a brighter main photo, a specific title, and complete category details.' };
    }, [chatRate, chats, saveRate, saves, views]);

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Ad performance" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading ad performance...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user?.is_verified) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Ad performance" leftIcon="back" titleLeft />
                <View style={[GlobalStyleSheet.container, { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }]}>
                    <View style={{ height: 66, width: 66, borderRadius: 22, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' }}>
                        <FeatherIcon name="shield" size={29} color={COLORS.danger} />
                    </View>
                    <Text style={[FONTS.h5, { color: colors.title, textAlign: 'center', marginTop: 16 }]}>Verify your account first</Text>
                    <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 21, textAlign: 'center', marginTop: 7 }]}>Phone verification protects your selling account and unlocks detailed ad performance.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('VerifyAccount')} style={{ height: 49, borderRadius: 12, backgroundColor: COLORS.primary, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', marginTop: 19 }}>
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Verify phone number</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Ad performance" leftIcon="back" titleLeft />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ paddingBottom: 38 }}
            >
                <View style={GlobalStyleSheet.container}>
                    {Boolean(error) && (
                        <TouchableOpacity onPress={() => loadData()} style={{ marginTop: 8, borderRadius: 13, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', padding: 13 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>Performance unavailable</Text>
                            <Text style={[FONTS.fontXs, { color: '#9B2C2C', lineHeight: 17, marginTop: 3 }]}>{error} Tap to retry.</Text>
                        </TouchableOpacity>
                    )}

                    {listing && (
                        <View style={{ marginTop: 8, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                            <View style={{ flexDirection: 'row', padding: 11 }}>
                                <View style={{ height: 99, width: 108, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.border }}>
                                    {image ? <Image source={{ uri: image }} style={{ height: '100%', width: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontTitle, { color: colors.textLight }]}>QOT</Text></View>}
                                </View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ borderRadius: 7, backgroundColor: tone.background, paddingHorizontal: 7, paddingVertical: 3 }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: tone.color, fontSize: 8, textTransform: 'uppercase' }]}>{String(listing.status || 'ad').replaceAll('_', ' ')}</Text>
                                        </View>
                                        {Boolean(analytics?.is_featured || listing.is_featured) && <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, fontSize: 8, marginLeft: 7 }]}>FEATURED</Text>}
                                    </View>
                                    <Text numberOfLines={2} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, lineHeight: 19, marginTop: 7 }]}>{listing.title}</Text>
                                    <Text numberOfLines={1} style={[FONTS.h6, { color: COLORS.primary, marginTop: 4 }]}>{formatPrice(listing.price, listing.currency)}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 4 }]}>{listing.city_name || 'Uganda'} · {formatRelativeTime(listing.created_at)}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
                                <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId })} style={{ flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.border }}>
                                    <FeatherIcon name="external-link" size={14} color={colors.title} />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginLeft: 6 }]}>View ad</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Sell', { listingId })} style={{ flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="edit-2" size={14} color={COLORS.primary} />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 6 }]}>Edit ad</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11, marginTop: 14 }}>
                        <StatCard icon="eye" label="Views" value={views} helper="People who opened it" color="#2457C5" background="#E9F2FF" />
                        <StatCard icon="heart" label="Saves" value={saves} helper="Buyers returning later" color="#B42355" background="#FFF0F4" />
                        <StatCard icon="message-circle" label="Buyer chats" value={chats} helper="Conversations started" color="#7C3AED" background="#F2ECFD" />
                        <StatCard icon="activity" label="Interest" value={interestRate.toFixed(1)} helper="Saves + chats per 100 views" color="#18864B" background="#EAF8F0" />
                    </View>

                    <View style={{ marginTop: 14, borderRadius: 17, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', padding: 14, flexDirection: 'row' }}>
                        <View style={{ height: 42, width: 42, borderRadius: 13, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name={insight.icon} size={19} color="#C2410C" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 11 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#8B3A0A' }]}>{insight.title}</Text>
                            <Text style={[FONTS.fontXs, { color: '#9A551D', lineHeight: 18, marginTop: 3 }]}>{insight.detail}</Text>
                        </View>
                    </View>

                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 24, marginBottom: 9 }]}>Conversion details</Text>
                    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, overflow: 'hidden' }}>
                        {[
                            ['bookmark', 'Save rate', `${saveRate.toFixed(1)}%`, 'Saves compared with views'],
                            ['message-square', 'Chat rate', `${chatRate.toFixed(1)}%`, 'Buyer chats compared with views'],
                            ['calendar', 'Posted', formatDate(analytics?.created_at || listing?.created_at) || 'Not available', 'When this ad went live'],
                            ['clock', 'Expiry', formatExpiryRemaining(analytics?.expires_at || listing?.expires_at), 'Time before renewal'],
                        ].map(([icon, label, value, detail], index) => (
                            <View key={label} style={{ minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}>
                                <View style={{ height: 35, width: 35, borderRadius: 11, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={icon} size={16} color={COLORS.primary} /></View>
                                <View style={{ flex: 1, marginLeft: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{label}</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 1 }]}>{detail}</Text></View>
                                <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, maxWidth: '42%', textAlign: 'right' }]}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ListingAnalytics;
