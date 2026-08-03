import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
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
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

const titleCase = (value) => String(value || 'Update')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const notificationTone = (type) => {
    if (type === 'message') return { icon: 'message-circle', background: '#FFF7ED', color: '#EA580C' };
    if (type === 'offer') return { icon: 'tag', background: '#FFF7ED', color: '#EA580C' };
    if (type === 'listing_approved') return { icon: 'check-circle', background: '#E9F8EF', color: '#176B44' };
    if (type === 'listing_rejected') return { icon: 'alert-triangle', background: '#FFF0F0', color: '#B42318' };
    if (type === 'listing_expired') return { icon: 'clock', background: '#FFF3DC', color: '#9A5B00' };
    if (type === 'favorite') return { icon: 'heart', background: '#FFF0F4', color: '#B42355' };
    if (type === 'follow') return { icon: 'user-plus', background: '#E9F2FF', color: '#2457C5' };
    if (type === 'review') return { icon: 'star', background: '#FFF8E1', color: '#A16207' };
    if (type === 'report') return { icon: 'shield', background: '#E9F2FF', color: '#2457C5' };
    if (type === 'announcement') return { icon: 'volume-2', background: '#FFF7ED', color: '#EA580C' };
    return { icon: 'bell', background: '#EEF1F5', color: '#586174' };
};

const NotificationsCenter = ({ navigation }) => {
    const { colors } = useTheme();
    const {
        notifications,
        unreadCount,
        loading,
        error,
        liveConnected,
        pushStatus,
        refreshNotifications,
        markRead,
        markAllRead,
        enablePushNotifications,
    } = useNotifications();
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [actionError, setActionError] = useState('');

    const pushDetails = useMemo(() => {
        if (pushStatus === 'registered') return { icon: 'smartphone', title: 'Device alerts enabled', detail: 'QOT updates can reach you when the app is closed.', color: '#176B44', background: '#E9F8EF' };
        if (pushStatus === 'registering') return { icon: 'loader', title: 'Enabling device alerts…', detail: 'Connecting this phone securely.', color: COLORS.primary, background: '#FFF7ED' };
        if (pushStatus === 'development_build_required') return { icon: 'tool', title: 'Ready for the installed app', detail: 'Remote push starts automatically in the development or release build.', color: '#9A5B00', background: '#FFF3DC' };
        if (pushStatus === 'permission_denied') return { icon: 'bell-off', title: 'Device alerts are disabled', detail: 'Open phone settings to allow QOT notifications.', color: COLORS.danger, background: '#FEF2F2' };
        if (pushStatus === 'physical_device_required') return { icon: 'smartphone', title: 'Physical phone required', detail: 'Push alerts cannot register on this simulator.', color: '#9A5B00', background: '#FFF3DC' };
        if (pushStatus === 'project_not_configured') return { icon: 'alert-circle', title: 'Push setup is incomplete', detail: 'The app build is missing its QOT project ID.', color: COLORS.danger, background: '#FEF2F2' };
        if (pushStatus === 'error') return { icon: 'refresh-cw', title: 'Device alerts need attention', detail: 'Tap to try registering this phone again.', color: COLORS.danger, background: '#FEF2F2' };
        return { icon: 'bell', title: 'Device alerts', detail: 'Checking this phone…', color: colors.text, background: colors.background };
    }, [colors.background, colors.text, pushStatus]);

    useEffect(() => (
        navigation.addListener('focus', () => refreshNotifications().catch(() => {}))
    ), [navigation, refreshNotifications]);

    const visibleNotifications = useMemo(() => (
        filter === 'unread' ? notifications.filter((item) => !item.is_read) : notifications
    ), [filter, notifications]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        setActionError('');
        try {
            await refreshNotifications();
        } catch (requestError) {
            setActionError(requestError.message || 'Notifications could not be refreshed.');
        } finally {
            setRefreshing(false);
        }
    }, [refreshNotifications]);

    const openNotification = async (item) => {
        setActionError('');
        if (!item.is_read) {
            try {
                await markRead(item.id);
            } catch (requestError) {
                setActionError(requestError.message || 'This notification could not be updated.');
            }
        }

        if (item.chat_thread) {
            navigation.navigate('SingleChat', { threadId: item.chat_thread });
        } else if (item.listing) {
            navigation.navigate('ItemDetails', { listingId: item.listing });
        } else if (typeof item.action_url === 'string' && item.action_url.startsWith('qot://')) {
            try {
                await Linking.openURL(item.action_url);
            } catch {
                // The notification remains readable even if its optional link is unavailable.
            }
        }
    };

    const readAll = async () => {
        if (!unreadCount || markingAll) return;
        setMarkingAll(true);
        setActionError('');
        try {
            await markAllRead();
        } catch (requestError) {
            setActionError(requestError.message || 'Notifications could not be marked as read.');
        } finally {
            setMarkingAll(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Notifications" leftIcon="back" titleLeft />
            {loading && notifications.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading notifications...</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    contentContainerStyle={{ paddingBottom: 38 }}
                >
                    <View style={GlobalStyleSheet.container}>
                        <View style={{ marginTop: 8, borderRadius: 18, padding: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 45, width: 45, borderRadius: 15, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="bell" size={20} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Your QOT updates</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                                        <View style={{ height: 7, width: 7, borderRadius: 4, backgroundColor: liveConnected ? '#1A9B56' : colors.textLight }} />
                                        <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 5 }]}>{liveConnected ? 'Live updates connected' : 'Updates refresh automatically'}</Text>
                                    </View>
                                </View>
                                {unreadCount > 0 && (
                                    <TouchableOpacity disabled={markingAll} onPress={readAll} style={{ minHeight: 35, borderRadius: 10, paddingHorizontal: 10, backgroundColor: `${COLORS.primary}10`, flexDirection: 'row', alignItems: 'center' }}>
                                        {markingAll ? <ActivityIndicator size="small" color={COLORS.primary} /> : <FeatherIcon name="check" size={13} color={COLORS.primary} />}
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 5 }]}>Read all</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 14, gap: 9 }}>
                                <View style={{ flex: 1, borderRadius: 13, padding: 11, backgroundColor: colors.background }}>
                                    <Text style={[FONTS.h6, { color: colors.title }]}>{notifications.length}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>All updates</Text>
                                </View>
                                <View style={{ flex: 1, borderRadius: 13, padding: 11, backgroundColor: unreadCount ? '#FFF0F0' : colors.background }}>
                                    <Text style={[FONTS.h6, { color: unreadCount ? '#B42318' : colors.title }]}>{unreadCount}</Text>
                                    <Text style={[FONTS.fontXs, { color: unreadCount ? '#9B2C2C' : colors.text, marginTop: 2 }]}>Unread</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                disabled={pushStatus === 'registered' || pushStatus === 'registering' || pushStatus === 'development_build_required'}
                                onPress={() => {
                                    if (pushStatus === 'permission_denied') Linking.openSettings();
                                    else enablePushNotifications().catch((requestError) => setActionError(requestError.message || 'Device alerts could not be enabled.'));
                                }}
                                style={{ minHeight: 62, borderRadius: 13, padding: 11, backgroundColor: pushDetails.background, marginTop: 9, flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
                                    {pushStatus === 'registering' ? <ActivityIndicator size="small" color={pushDetails.color} /> : <FeatherIcon name={pushDetails.icon} size={16} color={pushDetails.color} />}
                                </View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{pushDetails.title}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 16, marginTop: 2 }]}>{pushDetails.detail}</Text>
                                </View>
                                {!['registered', 'registering', 'development_build_required'].includes(pushStatus) && <FeatherIcon name="chevron-right" size={17} color={pushDetails.color} />}
                            </TouchableOpacity>
                        </View>

                        {Boolean(actionError || error) && (
                            <TouchableOpacity onPress={refresh} style={{ marginTop: 11, borderRadius: 13, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', padding: 12 }}>
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318' }]}>{actionError || error} Tap to retry.</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ flexDirection: 'row', borderRadius: 13, padding: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, marginTop: 13 }}>
                            {[
                                ['all', 'All', notifications.length],
                                ['unread', 'Unread', unreadCount],
                            ].map(([key, label, count]) => {
                                const selected = filter === key;
                                return (
                                    <TouchableOpacity key={key} onPress={() => setFilter(key)} style={{ flex: 1, minHeight: 38, borderRadius: 10, backgroundColor: selected ? COLORS.primary : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: selected ? COLORS.white : colors.text }]}>{label}</Text>
                                        <View style={{ minWidth: 19, height: 19, borderRadius: 10, paddingHorizontal: 4, marginLeft: 6, backgroundColor: selected ? 'rgba(255,255,255,.2)' : colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.textLight, fontSize: 8 }]}>{count}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {visibleNotifications.length === 0 ? (
                            <View style={{ minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
                                <View style={{ height: 68, width: 68, borderRadius: 22, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name={filter === 'unread' ? 'check-circle' : 'bell-off'} size={28} color={COLORS.primary} />
                                </View>
                                <Text style={[FONTS.h6, { color: colors.title, textAlign: 'center', marginTop: 15 }]}>{filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text, textAlign: 'center', lineHeight: 18, marginTop: 5 }]}>{filter === 'unread' ? 'New QOT updates will appear here as they arrive.' : 'Ad, account and message updates will appear here.'}</Text>
                            </View>
                        ) : (
                            <View style={{ marginTop: 12, borderRadius: 17, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
                                {visibleNotifications.map((item, index) => {
                                    const tone = notificationTone(item.notification_type);
                                    return (
                                        <TouchableOpacity key={item.id} onPress={() => openNotification(item)} activeOpacity={0.82} style={{ minHeight: 96, padding: 13, backgroundColor: item.is_read ? colors.card : `${COLORS.primary}08`, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ height: 43, width: 43, borderRadius: 14, backgroundColor: tone.background, alignItems: 'center', justifyContent: 'center' }}>
                                                <FeatherIcon name={tone.icon} size={18} color={tone.color} />
                                            </View>
                                            <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: tone.color, fontSize: 8, textTransform: 'uppercase' }]}>{titleCase(item.notification_type)}</Text>
                                                    <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 8, marginLeft: 7 }]}>{formatRelativeTime(item.created_at)}</Text>
                                                    {!item.is_read && <View style={{ height: 7, width: 7, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 7 }} />}
                                                </View>
                                                <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 5 }]}>{item.title || titleCase(item.notification_type)}</Text>
                                                <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, lineHeight: 16, marginTop: 2 }]}>{item.message || item.listing_title || 'You have a new QOT update.'}</Text>
                                            </View>
                                            {(item.listing || item.chat_thread) && <FeatherIcon name="chevron-right" size={18} color={colors.textLight} style={{ marginLeft: 7 }} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default NotificationsCenter;
