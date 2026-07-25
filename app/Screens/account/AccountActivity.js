import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import {
    getMyReviews,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from '../../api/account';
import { getFavorites, getMyListings } from '../../api/marketplace';
import { formatRelativeTime } from '../../utils/formatters';
import { getRecentlyViewed } from '../../utils/recentlyViewed';

const safeDate = (value) => {
    const time = new Date(value || 0).getTime();
    return Number.isNaN(time) ? 0 : time;
};

const titleCase = (value) => String(value || 'Ad')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const notificationTone = (type) => {
    if (type === 'message') return { icon: 'message-circle', background: '#FFF7ED', color: '#EA580C' };
    if (type === 'listing_approved') return { icon: 'check-circle', background: '#E9F8EF', color: '#176B44' };
    if (type === 'listing_rejected') return { icon: 'alert-triangle', background: '#FFF0F0', color: '#B42318' };
    if (type === 'listing_expired') return { icon: 'clock', background: '#FFF3DC', color: '#9A5B00' };
    if (type === 'favorite') return { icon: 'heart', background: '#FFF0F4', color: '#B42355' };
    if (type === 'follow') return { icon: 'user-plus', background: '#E9F2FF', color: '#2457C5' };
    return { icon: 'bell', background: '#EEF1F5', color: '#586174' };
};

const buildActivities = ({ notifications, listings, favorites, reviews, recentlyViewed }) => {
    const alertItems = notifications.map((item) => ({
        key: `alert-${item.id}`,
        group: 'alerts',
        source: 'notification',
        sourceId: item.id,
        type: item.notification_type,
        title: item.title || titleCase(item.notification_type),
        description: item.message || 'You have a new QOT update.',
        badge: titleCase(item.notification_type),
        date: item.created_at,
        unread: !item.is_read,
        listingId: item.listing,
        threadId: item.chat_thread,
        tone: notificationTone(item.notification_type),
    }));

    const listingItems = listings.map((item) => ({
        key: `listing-${item.id}`,
        group: 'ads',
        source: 'listing',
        title: item.title || 'Untitled ad',
        description: `Current status: ${titleCase(item.status)}`,
        badge: titleCase(item.status),
        date: item.updated_at || item.created_at || item.published_at,
        listingId: item.id,
        tone: item.status === 'rejected'
            ? { icon: 'alert-circle', background: '#FFF0F0', color: '#B42318' }
            : { icon: 'tag', background: '#E9F2FF', color: '#2457C5' },
    }));

    const savedItems = favorites.map((item) => ({
        key: `saved-${item.favorite_id || item.id}`,
        group: 'saved',
        source: 'favorite',
        title: `Saved: ${item.title || 'Untitled ad'}`,
        description: 'You added this ad to your saved items.',
        badge: 'Saved',
        date: item.favorite_created_at || item.updated_at || item.created_at,
        listingId: item.id,
        tone: { icon: 'heart', background: '#FFF0F4', color: '#B42355' },
    }));

    const reviewItems = reviews.map((item) => ({
        key: `review-${item.id}`,
        group: 'reviews',
        source: 'review',
        title: `Reviewed: ${item.seller_name || 'QOT seller'}`,
        description: item.comment || `You submitted a ${item.rating}/5 seller review.`,
        badge: `${item.rating}/5`,
        date: item.created_at || item.updated_at,
        listingId: item.listing,
        sellerId: item.seller,
        tone: { icon: 'star', background: '#FFF3DC', color: '#9A5B00' },
    }));

    const viewedItems = recentlyViewed.map((item) => ({
        key: `viewed-${item.id}`,
        group: 'viewed',
        source: 'recent',
        title: `Viewed: ${item.title || 'Untitled ad'}`,
        description: `${item.category_name || 'Ad'} · ${item.city_name || 'Uganda'}`,
        badge: 'Viewed',
        date: item.viewed_at,
        listingId: item.id,
        tone: { icon: 'clock', background: '#FFF7ED', color: '#EA580C' },
    }));

    return [...alertItems, ...listingItems, ...savedItems, ...reviewItems, ...viewedItems]
        .sort((first, second) => safeDate(second.date) - safeDate(first.date));
};

const SummaryItem = ({ icon, label, value, colors }) => (
    <View style={{ flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 3 }}>
        <FeatherIcon name={icon} size={14} color={COLORS.primary} />
        <Text style={[FONTS.h6, { color: colors.title, marginTop: 4 }]}>{value}</Text>
        <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.textLight, fontSize: 8, textTransform: 'uppercase', marginTop: 1 }]}>{label}</Text>
    </View>
);

const AccountActivity = ({ navigation }) => {
    const { colors } = useTheme();
    const [data, setData] = useState({ notifications: [], listings: [], favorites: [], reviews: [], recentlyViewed: [] });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [error, setError] = useState('');

    const loadActivity = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');

        const recent = await getRecentlyViewed();
        const results = await Promise.allSettled([
            getNotifications(),
            getMyListings(),
            getFavorites(),
            getMyReviews(),
        ]);
        const failed = results.filter((result) => result.status === 'rejected');

        setData((current) => ({
            notifications: results[0].status === 'fulfilled' ? results[0].value : current.notifications,
            listings: results[1].status === 'fulfilled' ? results[1].value : current.listings,
            favorites: results[2].status === 'fulfilled' ? results[2].value : current.favorites,
            reviews: results[3].status === 'fulfilled' ? results[3].value : current.reviews,
            recentlyViewed: recent,
        }));

        if (failed.length === results.length) {
            setError(failed[0]?.reason?.message || 'Your activity could not be loaded.');
        } else if (failed.length) {
            setError('Some activity could not be refreshed. Pull down to try again.');
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadActivity();
        return navigation.addListener('focus', () => loadActivity());
    }, [loadActivity, navigation]);

    const activities = useMemo(() => buildActivities(data), [data]);
    const visibleActivities = filter === 'all' ? activities : activities.filter((item) => item.group === filter);
    const unreadCount = data.notifications.filter((item) => !item.is_read).length;
    const filters = [
        ['all', 'All', activities.length],
        ['alerts', 'Alerts', data.notifications.length],
        ['ads', 'My ads', data.listings.length],
        ['saved', 'Saved', data.favorites.length],
        ['viewed', 'Viewed', data.recentlyViewed.length],
        ['reviews', 'Reviews', data.reviews.length],
    ];

    const openActivity = async (item) => {
        if (item.source === 'notification' && item.unread) {
            setData((current) => ({
                ...current,
                notifications: current.notifications.map((notification) => (
                    notification.id === item.sourceId ? { ...notification, is_read: true } : notification
                )),
            }));
            markNotificationRead(item.sourceId).catch(() => {});
        }

        if (item.threadId) {
            navigation.navigate('SingleChat', { threadId: item.threadId });
        } else if (item.listingId) {
            navigation.navigate('ItemDetails', { listingId: item.listingId });
        } else if (item.sellerId) {
            navigation.navigate('Anotherprofile', { sellerId: item.sellerId });
        } else if (item.group === 'viewed') {
            navigation.navigate('RecentlyViewed');
        }
    };

    const markAllRead = async () => {
        if (!unreadCount || markingAll) return;
        setMarkingAll(true);
        try {
            await markAllNotificationsRead();
            setData((current) => ({
                ...current,
                notifications: current.notifications.map((item) => ({ ...item, is_read: true })),
            }));
        } catch (requestError) {
            setError(requestError.message || 'Alerts could not be marked as read.');
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Activity" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading your activity...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Activity" leftIcon="back" titleLeft />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadActivity(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ paddingBottom: 36 }}
            >
                <View style={GlobalStyleSheet.container}>
                    <View style={{ marginTop: 8, borderRadius: 17, padding: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Your QOT activity</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Marketplace updates in one timeline</Text>
                            </View>
                            {unreadCount > 0 && (
                                <TouchableOpacity disabled={markingAll} onPress={markAllRead} style={{ minHeight: 34, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    {markingAll ? <ActivityIndicator size="small" color={COLORS.primary} /> : <FeatherIcon name="check" size={13} color={COLORS.primary} />}
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 5 }]}>Read all</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 14, borderRadius: 13, backgroundColor: colors.background, paddingVertical: 10 }}>
                            <SummaryItem icon="clock" label="Viewed" value={data.recentlyViewed.length} colors={colors} />
                            <SummaryItem icon="heart" label="Saved" value={data.favorites.length} colors={colors} />
                            <SummaryItem icon="tag" label="My ads" value={data.listings.length} colors={colors} />
                            <SummaryItem icon="bell" label="Unread" value={unreadCount} colors={colors} />
                        </View>
                    </View>

                    {Boolean(error) && (
                        <TouchableOpacity onPress={() => loadActivity()} style={{ marginTop: 11, borderRadius: 13, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', padding: 12 }}>
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318' }]}>{error}</Text>
                        </TouchableOpacity>
                    )}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -15, marginTop: 14 }} contentContainerStyle={{ paddingHorizontal: 15 }}>
                        {filters.map(([key, label, count]) => {
                            const selected = filter === key;
                            return (
                                <TouchableOpacity key={key} onPress={() => setFilter(key)} style={{ minHeight: 38, borderRadius: 19, paddingHorizontal: 12, marginRight: 7, backgroundColor: selected ? COLORS.primary : colors.card, borderWidth: 1, borderColor: selected ? COLORS.primary : colors.borderColor, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.text }]}>{label}</Text>
                                    <View style={{ minWidth: 19, height: 19, borderRadius: 10, marginLeft: 6, paddingHorizontal: 4, backgroundColor: selected ? 'rgba(255,255,255,.18)' : colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.textLight, fontSize: 8 }]}>{count}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {visibleActivities.length === 0 ? (
                        <View style={{ minHeight: 310, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 }}>
                            <View style={{ height: 64, width: 64, borderRadius: 21, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="activity" size={27} color={COLORS.primary} />
                            </View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 15 }]}>No activity here yet</Text>
                            <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 5, textAlign: 'center', lineHeight: 18 }]}>Browse, save, review or manage ads to build your QOT activity.</Text>
                        </View>
                    ) : (
                        <View style={{ marginTop: 11, borderRadius: 17, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                            {visibleActivities.map((item, index) => (
                                <TouchableOpacity key={item.key} onPress={() => openActivity(item)} activeOpacity={0.82} style={{ minHeight: 91, padding: 13, backgroundColor: item.unread ? `${COLORS.primary}08` : colors.card, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ height: 42, width: 42, borderRadius: 14, backgroundColor: item.tone.background, alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name={item.tone.icon} size={18} color={item.tone.color} />
                                    </View>
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ borderRadius: 7, backgroundColor: item.tone.background, paddingHorizontal: 6, paddingVertical: 3 }}>
                                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: item.tone.color, fontSize: 7, textTransform: 'uppercase' }]}>{item.badge}</Text>
                                            </View>
                                            <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 8, marginLeft: 7 }]}>{formatRelativeTime(item.date)}</Text>
                                            {item.unread && <View style={{ height: 7, width: 7, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 7 }} />}
                                        </View>
                                        <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 5 }]}>{item.title}</Text>
                                        <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, lineHeight: 16, marginTop: 2 }]}>{item.description}</Text>
                                    </View>
                                    <FeatherIcon name="chevron-right" size={18} color={colors.textLight} style={{ marginLeft: 7 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AccountActivity;
