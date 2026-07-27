import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {
    buildChatSocketUrl,
    getChatSocketTicket,
    getChatThreads,
    markChatRead,
    updateChatState,
} from '../../api/chats';
import { formatRelativeTime } from '../../utils/formatters';
import Header from '../../layout/Header';

const folders = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'read', label: 'Read' },
    { id: 'favourites', label: 'Favourites' },
    { id: 'archived', label: 'Archived' },
    { id: 'spam', label: 'Spam' },
];

const listingImage = (thread) => (
    thread?.listing?.primary_image
    || thread?.listing?.card_image_url
    || thread?.listing?.images?.find((image) => image.is_primary)?.card_image_url
    || thread?.listing?.images?.[0]?.card_image_url
    || thread?.listing?.images?.[0]?.image_url
    || ''
);

const Chat = ({ navigation }) => {
    const { colors } = useTheme();
    const [folder, setFolder] = useState('all');
    const [search, setSearch] = useState('');
    const [threads, setThreads] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [actionThread, setActionThread] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const socketRef = useRef(null);

    const loadThreads = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');

        try {
            const data = await getChatThreads({ folder, search });
            setThreads(data.threads);
            setCounts(data.tabs);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [folder, search]);

    useFocusEffect(useCallback(() => {
        const timer = setTimeout(() => loadThreads(), 250);
        return () => clearTimeout(timer);
    }, [loadThreads]));

    useEffect(() => {
        let active = true;
        let heartbeat;

        getChatSocketTicket().then(({ ticket }) => {
            if (!active || !ticket) return;

            const socket = new WebSocket(buildChatSocketUrl('/ws/chats/presence/', ticket));
            socketRef.current = socket;
            socket.onopen = () => {
                heartbeat = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: 'heartbeat' }));
                    }
                }, 30000);
            };
            socket.onmessage = ({ data }) => {
                try {
                    const event = JSON.parse(data);
                    if (event.type === 'presence') {
                        setThreads((current) => current.map((thread) => (
                            String(thread.other_user_id) === String(event.user_id)
                                ? {
                                    ...thread,
                                    other_user_online: Boolean(event.is_online),
                                    other_user_last_seen: event.last_seen_at || thread.other_user_last_seen,
                                }
                                : thread
                        )));
                    }
                    if (event.type === 'thread_updated') loadThreads(true);
                } catch {
                    // Ignore malformed socket events and keep the inbox usable.
                }
            };
        }).catch(() => {});

        return () => {
            active = false;
            if (heartbeat) clearInterval(heartbeat);
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [loadThreads]);

    const runStateAction = async (thread, changes) => {
        setActionLoading(true);
        setError('');
        try {
            await updateChatState(thread.id, changes);
            setActionThread(null);
            await loadThreads(true);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleFavourite = async (thread) => {
        try {
            const result = await updateChatState(thread.id, {
                is_favourite: !thread.is_favourite,
            });
            const updated = result.thread || { ...thread, is_favourite: !thread.is_favourite };
            setThreads((current) => current.map((item) => (
                item.id === thread.id ? updated : item
            )));
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    const markReadState = async (thread) => {
        setActionLoading(true);
        try {
            if (Number(thread.unread_count || 0) > 0 || thread.is_marked_unread) {
                await markChatRead(thread.id);
            } else {
                await updateChatState(thread.id, { is_marked_unread: true });
            }
            setActionThread(null);
            await loadThreads(true);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setActionLoading(false);
        }
    };

    const confirmSpam = (thread) => {
        if (thread.is_spam) {
            runStateAction(thread, { is_spam: false });
            return;
        }

        Alert.alert(
            'Report this chat as spam?',
            `The conversation with ${thread.other_user_name || 'this user'} will move to Spam and QOT moderation will be notified.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Report spam',
                    style: 'destructive',
                    onPress: () => runStateAction(thread, { is_spam: true }),
                },
            ],
        );
    };

    const renderThread = ({ item }) => {
        const unreadCount = Number(item.unread_count || 0);
        const unread = unreadCount > 0 || item.is_marked_unread;
        const image = listingImage(item);

        return (
            <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => navigation.navigate('SingleChat', {
                    threadId: item.id,
                    thread: item,
                })}
                style={{
                    marginHorizontal: 15,
                    marginBottom: 10,
                    padding: 11,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: unread ? `${COLORS.primary}55` : colors.borderColor,
                    backgroundColor: colors.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <View style={{ marginRight: 12 }}>
                    <View style={{ height: 58, width: 58, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.background }}>
                        {image ? (
                            <Image source={{ uri: image }} style={{ height: '100%', width: '100%' }} />
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="image" size={21} color={colors.textLight} />
                            </View>
                        )}
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            height: 18,
                            width: 18,
                            borderRadius: 9,
                            backgroundColor: item.other_user_online ? COLORS.success : '#A9AFB9',
                            borderWidth: 3,
                            borderColor: colors.card,
                        }}
                    />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title, flex: 1 }] }>
                            {item.other_user_name || 'QOT user'}
                        </Text>
                        <Text style={[FONTS.fontXs, { color: colors.textLight, marginLeft: 8 }] }>
                            {formatRelativeTime(item.last_message_at || item.created_at)}
                        </Text>
                    </View>
                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginTop: 2 }] }>
                        {item.listing?.title || 'Advert conversation'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <Text numberOfLines={1} style={[FONTS.fontSm, { color: unread ? colors.title : colors.text, flex: 1, fontFamily: unread ? 'PoppinsMedium' : 'PoppinsRegular' }] }>
                            {item.last_message || 'Start the conversation'}
                        </Text>
                        {unread && (
                            <View style={{ minWidth: 21, height: 21, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: 7 }}>
                                <Text style={{ color: COLORS.white, fontSize: 10, fontFamily: 'PoppinsSemiBold' }}>
                                    {unreadCount > 99 ? '99+' : unreadCount || '•'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ marginLeft: 5 }}>
                    <TouchableOpacity onPress={() => toggleFavourite(item)} style={{ padding: 8 }}>
                        <FeatherIcon name="star" size={18} color={item.is_favourite ? '#F2A900' : colors.textLight} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActionThread(item)} style={{ padding: 8 }}>
                        <FeatherIcon name="more-vertical" size={19} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header
                title="Messages"
                titleLeft
                leftIcon="back"
                backAction={() => (
                    navigation.canGoBack()
                        ? navigation.goBack()
                        : navigation.navigate('Home')
                )}
            />
            <View style={[GlobalStyleSheet.container, { paddingBottom: 8 }] }>
                <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 2 }]}>Your buyer and seller conversations</Text>

                <View style={{ marginTop: 14, height: 46, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }}>
                    <FeatherIcon name="search" size={18} color={colors.textLight} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search names, ads, phones or messages"
                        placeholderTextColor={colors.textLight}
                        style={[FONTS.fontSm, { flex: 1, color: colors.title, paddingHorizontal: 10 }]}
                    />
                    {Boolean(search) && (
                        <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 4 }}>
                            <FeatherIcon name="x" size={18} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 11 }} style={{ flexGrow: 0 }}>
                {folders.map((item) => {
                    const active = folder === item.id;
                    const count = Number(counts[item.id] || 0);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setFolder(item.id)}
                            style={{ height: 38, flexDirection: 'row', alignItems: 'center', borderRadius: 13, paddingHorizontal: 13, marginRight: 8, backgroundColor: active ? COLORS.primary : colors.card, borderWidth: active ? 0 : 1, borderColor: colors.borderColor }}
                        >
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: active ? COLORS.white : colors.title }] }>{item.label}</Text>
                            <View style={{ minWidth: 18, height: 18, borderRadius: 9, marginLeft: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, backgroundColor: active ? 'rgba(255,255,255,.18)' : colors.background }}>
                                <Text style={{ fontSize: 9, color: active ? COLORS.white : colors.text }}>{count > 99 ? '99+' : count}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {Boolean(error) && (
                <TouchableOpacity onPress={() => loadThreads()} style={{ marginHorizontal: 15, marginBottom: 10, borderRadius: 12, backgroundColor: '#FDECEC', padding: 12 }}>
                    <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text>
                </TouchableOpacity>
            )}

            {loading && !refreshing ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 10 }]}>Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    data={threads}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderThread}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingTop: 2, paddingBottom: 95 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadThreads(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    ListEmptyComponent={(
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 }}>
                            <View style={{ height: 62, width: 62, borderRadius: 20, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="message-circle" size={28} color={COLORS.primary} />
                            </View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 15 }]}>No conversations here</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 20, marginTop: 5 }] }>
                                {search ? 'Try a different name, advert, phone number, or message.' : 'When you contact a seller, the conversation will appear here.'}
                            </Text>
                        </View>
                    )}
                />
            )}

            <Modal transparent visible={Boolean(actionThread)} animationType="fade" onRequestClose={() => setActionThread(null)}>
                <TouchableOpacity activeOpacity={1} onPress={() => !actionLoading && setActionThread(null)} style={{ flex: 1, backgroundColor: 'rgba(15,23,42,.46)', justifyContent: 'flex-end' }}>
                    <TouchableOpacity activeOpacity={1} style={{ backgroundColor: colors.card, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 32 }}>
                        <View style={{ width: 42, height: 4, borderRadius: 2, backgroundColor: colors.borderColor, alignSelf: 'center', marginBottom: 15 }} />
                        <Text style={[FONTS.h6, { color: colors.title }]}>{actionThread?.other_user_name || 'Chat options'}</Text>
                        <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 2, marginBottom: 12 }]}>{actionThread?.listing?.title}</Text>

                        {[
                            {
                                icon: 'mail',
                                label: Number(actionThread?.unread_count || 0) > 0 || actionThread?.is_marked_unread ? 'Mark as read' : 'Mark as unread',
                                action: () => markReadState(actionThread),
                            },
                            {
                                icon: 'archive',
                                label: actionThread?.is_archived ? 'Unarchive chat' : 'Archive chat',
                                action: () => runStateAction(actionThread, { is_archived: !actionThread.is_archived }),
                            },
                            {
                                icon: 'shield',
                                label: actionThread?.is_spam ? 'Move out of spam' : 'Report as spam',
                                action: () => confirmSpam(actionThread),
                                danger: !actionThread?.is_spam,
                            },
                        ].map((option) => (
                            <TouchableOpacity key={option.label} disabled={actionLoading} onPress={option.action} style={{ minHeight: 50, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderColor }}>
                                <FeatherIcon name={option.icon} size={18} color={option.danger ? COLORS.danger : colors.text} />
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: option.danger ? COLORS.danger : colors.title, marginLeft: 12 }]}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        {actionLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

export default Chat;
