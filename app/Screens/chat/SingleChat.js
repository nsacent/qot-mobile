import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    KeyboardAvoidingView,
    useKeyboardState,
} from 'react-native-keyboard-controller';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import {
    blockChatUser,
    buildChatSocketUrl,
    deleteChatMessage,
    deleteChatThread,
    getChatFileHeaders,
    getChatMessages,
    getChatSocketTicket,
    getChatThread,
    markChatRead,
    resolveChatFileUrl,
    sendChatAttachments,
    sendChatMessage,
    sendChatOffer,
    unblockChatUser,
    updateChatOffer,
    updateChatState,
} from '../../api/chats';
import { useAuth } from '../../context/AuthContext';
import { formatMessageTime, formatPrice, formatRelativeTime } from '../../utils/formatters';

const linkPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:\+?256|0)7\d{8})/gi;

const MessageText = ({ children, color }) => {
    const value = String(children || '');
    const segments = value.split(linkPattern);

    return (
        <Text style={[FONTS.font, { color, lineHeight: 21 }]}>
            {segments.map((segment, index) => {
                if (!segment) return null;
                const isUrl = /^(https?:\/\/|www\.)/i.test(segment);
                const isPhone = /^(?:\+?256|0)7\d{8}$/i.test(segment);

                if (!isUrl && !isPhone) return <Text key={`${segment}-${index}`}>{segment}</Text>;

                const target = isUrl
                    ? (segment.startsWith('www.') ? `https://${segment}` : segment)
                    : `tel:${segment}`;

                return (
                    <Text
                        key={`${segment}-${index}`}
                        onPress={() => Linking.openURL(target)}
                        style={{ color: color === COLORS.white ? '#DDEAFF' : COLORS.primary, textDecorationLine: 'underline' }}
                    >
                        {segment}
                    </Text>
                );
            })}
        </Text>
    );
};

const addOrReplaceMessage = (items, message) => {
    if (!message?.id) return items;
    const nextItems = items.some((item) => String(item.id) === String(message.id))
        ? items.map((item) => String(item.id) === String(message.id) ? message : item)
        : [...items, message];
    return nextItems.sort((first, second) => (
        new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
    ));
};

const OFFER_STATUS = {
    pending: { label: 'PENDING', color: '#B54708', background: '#FFF4E5', icon: 'clock' },
    accepted: { label: 'ACCEPTED', color: '#18864B', background: '#EAF8F0', icon: 'check-circle' },
    declined: { label: 'DECLINED', color: COLORS.danger, background: '#FFF0F0', icon: 'x-circle' },
    withdrawn: { label: 'WITHDRAWN', color: '#667085', background: '#F2F4F7', icon: 'slash' },
};

const listingImage = (thread) => (
    thread?.listing?.primary_image
    || thread?.listing?.card_image_url
    || thread?.listing?.images?.find((image) => image.is_primary)?.card_image_url
    || thread?.listing?.images?.[0]?.card_image_url
    || thread?.listing?.images?.[0]?.image_url
    || ''
);

const ConfirmationModal = ({
    visible,
    title,
    description,
    confirmLabel,
    icon,
    loading,
    danger = false,
    colors,
    onCancel,
    onConfirm,
}) => (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
        <TouchableOpacity
            activeOpacity={1}
            disabled={loading}
            onPress={onCancel}
            style={{ flex: 1, padding: 22, backgroundColor: 'rgba(15,23,42,.58)', alignItems: 'center', justifyContent: 'center' }}
        >
            <TouchableOpacity
                activeOpacity={1}
                style={{ width: '100%', maxWidth: 390, borderRadius: 24, backgroundColor: colors.card, padding: 20, borderWidth: 1, borderColor: colors.borderColor }}
            >
                <View style={{ height: 48, width: 48, borderRadius: 16, backgroundColor: danger ? `${COLORS.danger}12` : COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                    <FeatherIcon name={icon} size={21} color={danger ? COLORS.danger : COLORS.primary} />
                </View>
                <Text style={[FONTS.h6, { color: colors.title, marginTop: 15 }]}>{title}</Text>
                <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 21, marginTop: 6 }]}>{description}</Text>
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                    <TouchableOpacity
                        disabled={loading}
                        onPress={onCancel}
                        style={{ flex: 1, minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
                    >
                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={loading}
                        onPress={onConfirm}
                        style={{ flex: 1, minHeight: 46, borderRadius: 15, backgroundColor: danger ? COLORS.danger : COLORS.primary, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading
                            ? <ActivityIndicator size="small" color={COLORS.white} />
                            : <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>{confirmLabel}</Text>}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    </Modal>
);

const SingleChat = ({ route, navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSafeInset = Platform.OS === 'android'
        ? Math.max(insets.bottom, 32)
        : Math.max(insets.bottom, 8);
    const keyboardVisible = useKeyboardState((state) => state.isVisible);
    const { user } = useAuth();
    const threadId = route.params?.threadId || route.params?.thread?.id;
    const [thread, setThread] = useState(route.params?.thread || null);
    const [messages, setMessages] = useState([]);
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerNote, setOfferNote] = useState('');
    const [offerError, setOfferError] = useState('');
    const [offerLoading, setOfferLoading] = useState(false);
    const [offerActionId, setOfferActionId] = useState('');
    const [blockedByMe, setBlockedByMe] = useState(Boolean(
        route.params?.thread?.is_blocked || route.params?.thread?.blocked_by_me,
    ));
    const listRef = useRef(null);
    const composerRef = useRef(null);
    const socketRef = useRef(null);

    const typingTimerRef = useRef(null);

    const loadChat = useCallback(async () => {
        if (!threadId) {
            setError('This conversation could not be opened.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const [threadData, messageData] = await Promise.all([
                getChatThread(threadId),
                getChatMessages(threadId),
            ]);
            setThread(threadData);
            if (threadData?.is_blocked !== undefined || threadData?.blocked_by_me !== undefined) {
                setBlockedByMe(Boolean(threadData.is_blocked || threadData.blocked_by_me));
            }
            setMessages(messageData);
            await markChatRead(threadId).catch(() => {});
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        loadChat();
    }, [loadChat]);

    useEffect(() => {
        if (!threadId) return undefined;

        let active = true;
        let heartbeat;

        getChatSocketTicket().then(({ ticket }) => {
            if (!active || !ticket) return;

            const socket = new WebSocket(buildChatSocketUrl(`/ws/chats/threads/${threadId}/`, ticket));
            socketRef.current = socket;
            socket.onopen = () => {
                setSocketConnected(true);
                heartbeat = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: 'heartbeat' }));
                    }
                }, 30000);
            };
            socket.onclose = () => setSocketConnected(false);
            socket.onerror = () => setSocketConnected(false);
            socket.onmessage = ({ data }) => {
                try {
                    const event = JSON.parse(data);
                    if (event.type === 'chat_message') {
                        setMessages((current) => addOrReplaceMessage(current, event.message));
                        if (String(event.message?.sender) !== String(user?.id)) {
                            markChatRead(threadId).catch(() => {});
                        }
                    }
                    if (event.type === 'message_deleted' && event.message_id) {
                        const deletedId = String(event.message_id);
                        setMessages((current) => current.filter((message) => String(message.id) !== deletedId));
                        setReplyingTo((current) => (
                            String(current?.id) === deletedId ? null : current
                        ));
                    }
                    if (event.type === 'typing' && String(event.user_id) !== String(user?.id)) {
                        setOtherUserTyping(Boolean(event.is_typing));
                    }
                    if (event.type === 'presence' && String(event.user_id) === String(thread?.other_user_id)) {
                        setThread((current) => ({
                            ...current,
                            other_user_online: Boolean(event.is_online),
                            other_user_last_seen: event.last_seen_at || current?.other_user_last_seen,
                        }));
                    }
                    if (event.type === 'error') setError(event.message || 'The message could not be sent.');
                } catch {
                    // Ignore malformed socket messages; REST remains available.
                }
            };
        }).catch(() => setSocketConnected(false));

        return () => {
            active = false;
            if (heartbeat) clearInterval(heartbeat);
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [threadId, thread?.other_user_id, user?.id]);

    useEffect(() => {
        if (!messages.length) return;
        const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
        return () => clearTimeout(timer);
    }, [messages, otherUserTyping]);

    const sendTyping = (isTyping) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
        }
    };

    const updateBody = (value) => {
        setBody(value.slice(0, 1000));
        sendTyping(Boolean(value.trim()));
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => sendTyping(false), 1200);
    };

    const chooseAttachments = async () => {
        setError('');
        const result = await DocumentPicker.getDocumentAsync({
            type: [
                'image/*',
                'application/pdf',
                'text/plain',
                'text/csv',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
            multiple: true,
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const selected = result.assets || [];
        if (attachments.length + selected.length > 5) {
            setError('You can attach up to 5 files at a time.');
            return;
        }

        const oversized = selected.find((asset) => Number(asset.size || 0) > 10 * 1024 * 1024);
        if (oversized) {
            setError(`${oversized.name} is larger than 10 MB.`);
            return;
        }

        setAttachments((current) => [...current, ...selected]);
    };

    const submitMessage = async () => {
        const cleanBody = body.trim();
        if ((!cleanBody && !attachments.length) || sending) return;

        setSending(true);
        setError('');
        sendTyping(false);

        try {
            let sentMessage;
            if (attachments.length) {
                const result = await sendChatAttachments(
                    threadId,
                    attachments,
                    cleanBody,
                    replyingTo?.id,
                );
                sentMessage = result.chat_message;
            } else {
                sentMessage = await sendChatMessage(threadId, cleanBody, replyingTo?.id);
            }

            setMessages((current) => addOrReplaceMessage(current, sentMessage));
            setBody('');
            setAttachments([]);
            setReplyingTo(null);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSending(false);
        }
    };

    const closeOfferModal = () => {
        if (offerLoading) return;
        setOfferModalOpen(false);
        setOfferAmount('');
        setOfferNote('');
        setOfferError('');
    };

    const submitOffer = async () => {
        const numericOffer = Number(offerAmount);
        if (!Number.isFinite(numericOffer) || numericOffer <= 0) {
            setOfferError('Enter a valid offer amount in UGX.');
            return;
        }
        if (offerLoading) return;

        setOfferLoading(true);
        setOfferError('');
        try {
            const sentOffer = await sendChatOffer(threadId, numericOffer, offerNote);
            setMessages((current) => addOrReplaceMessage(current, sentOffer));
            setOfferModalOpen(false);
            setOfferAmount('');
            setOfferNote('');
        } catch (requestError) {
            setOfferError(requestError.message || 'The offer could not be sent.');
        } finally {
            setOfferLoading(false);
        }
    };

    const changeOfferStatus = async (message, action) => {
        const actionKey = `${message.id}:${action}`;
        if (offerActionId) return;

        setOfferActionId(actionKey);
        setError('');
        try {
            const updatedOffer = await updateChatOffer(threadId, message.id, action);
            setMessages((current) => addOrReplaceMessage(current, updatedOffer));
        } catch (requestError) {
            setError(requestError.message || 'The offer could not be updated.');
        } finally {
            setOfferActionId('');
        }
    };

    const openAttachment = async (attachment) => {
        if (attachment.file_type === 'image') {
            setPreviewAttachment(attachment);
            return;
        }

        try {
            const available = await Sharing.isAvailableAsync();
            if (!available) throw new Error('File preview is not available on this device.');

            const safeName = String(attachment.original_name || `qot-attachment-${attachment.id}`)
                .replace(/[^a-zA-Z0-9._-]/g, '-');
            const target = new File(Paths.cache, `${attachment.id}-${safeName}`);
            const downloaded = await File.downloadFileAsync(
                resolveChatFileUrl(attachment.file_url),
                target,
                { headers: getChatFileHeaders(), idempotent: true },
            );
            await Sharing.shareAsync(downloaded.uri, {
                dialogTitle: attachment.original_name || 'Open attachment',
            });
        } catch (attachmentError) {
            setError(attachmentError.message || 'The attachment could not be opened.');
        }
    };

    const updateThread = async (changes) => {
        setActionLoading(true);
        setError('');
        try {
            const result = await updateChatState(threadId, changes);
            setThread((current) => result.thread || ({ ...current, ...changes }));
            setOptionsOpen(false);
            if (changes.is_archived === true || changes.is_spam === true) navigation.goBack();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setActionLoading(false);
        }
    };

    const requestSpam = () => {
        setOptionsOpen(false);
        if (thread?.is_spam) {
            updateThread({ is_spam: false });
            return;
        }
        Alert.alert(
            'Report chat as spam?',
            'This moves the conversation to Spam and notifies QOT moderation.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Report spam', style: 'destructive', onPress: () => updateThread({ is_spam: true }) },
            ],
        );
    };

    const startReply = (message) => {
        setReplyingTo(message);
        setOptionsOpen(false);
        setTimeout(() => composerRef.current?.focus(), 60);
    };

    const runConfirmation = async () => {
        if (!confirmation || actionLoading) return;

        setActionLoading(true);
        setError('');
        try {
            if (confirmation.type === 'delete_message') {
                const deletedId = String(confirmation.message.id);
                await deleteChatMessage(threadId, confirmation.message.id);
                setMessages((current) => current.filter((message) => String(message.id) !== deletedId));
                setReplyingTo((current) => (
                    String(current?.id) === deletedId ? null : current
                ));
                setConfirmation(null);
                return;
            }

            if (confirmation.type === 'delete_thread') {
                await deleteChatThread(threadId);
                setConfirmation(null);
                navigation.goBack();
                return;
            }

            if (confirmation.type === 'block_user') {
                await blockChatUser(threadId, 'Blocked from the conversation');
                setBlockedByMe(true);
                setReplyingTo(null);
                setBody('');
                setAttachments([]);
                setConfirmation(null);
                return;
            }

            if (confirmation.type === 'unblock_user') {
                await unblockChatUser(threadId);
                setBlockedByMe(false);
                setConfirmation(null);
            }
        } catch (requestError) {
            setError(requestError.message);
            setConfirmation(null);
        } finally {
            setActionLoading(false);
        }
    };

    const confirmationDetails = confirmation?.type === 'delete_message'
        ? {
            title: 'Delete this message?',
            description: 'This message will be removed for everyone in the conversation. This cannot be undone.',
            confirmLabel: 'Delete message',
            icon: 'trash-2',
            danger: true,
        }
        : confirmation?.type === 'delete_thread'
            ? {
                title: 'Delete conversation?',
                description: 'This conversation will be removed from your inbox. The other person will keep their copy.',
                confirmLabel: 'Delete chat',
                icon: 'message-square',
                danger: true,
            }
            : confirmation?.type === 'block_user'
                ? {
                    title: `Block ${thread?.other_user_name || 'this user'}?`,
                    description: 'You will stop messaging this person in this conversation. You can unblock them later.',
                    confirmLabel: 'Block user',
                    icon: 'slash',
                    danger: true,
                }
                : {
                    title: `Unblock ${thread?.other_user_name || 'this user'}?`,
                    description: 'You will be able to send messages to this person again.',
                    confirmLabel: 'Unblock',
                    icon: 'shield',
                    danger: false,
                };

    const image = listingImage(thread);
    const isBuyer = String(thread?.buyer) === String(user?.id);
    const askingPrice = Number(thread?.listing?.price || 0);
    const offerSuggestions = Number.isFinite(askingPrice) && askingPrice > 0
        ? [0.85, 0.9, 0.95]
            .map((ratio) => Math.round((askingPrice * ratio) / 1000) * 1000)
            .filter((amount, index, values) => amount > 0 && values.indexOf(amount) === index)
        : [];
    const statusText = otherUserTyping
        ? 'is typing…'
        : thread?.other_user_online
            ? 'Online'
            : thread?.other_user_last_seen
                ? `Last seen ${formatRelativeTime(thread.other_user_last_seen).toLowerCase()}`
                : socketConnected ? 'Connected' : 'Updating status…';

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 10 }]}>Loading conversation...</Text>
            </SafeAreaView>
        );
    }

    if (!thread) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ flex: 1, padding: 25, alignItems: 'center', justifyContent: 'center' }}>
                    <FeatherIcon name="alert-circle" size={38} color={COLORS.danger} />
                    <Text style={[FONTS.font, { color: colors.title, textAlign: 'center', marginTop: 12 }]}>{error || 'Conversation not found.'}</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 15 }}>
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary }]}>Back to messages</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const renderMessage = ({ item }) => {
        const own = String(item.sender) === String(user?.id);
        const messageAttachments = Array.isArray(item.attachments) ? item.attachments : [];
        const isOffer = item.message_type === 'offer';
        const offerStatus = OFFER_STATUS[item.offer_status] || OFFER_STATUS.pending;
        const pendingOffer = isOffer && item.offer_status === 'pending';
        const canRespondToOffer = pendingOffer && String(thread.seller) === String(user?.id);
        const canWithdrawOffer = pendingOffer && own && String(thread.buyer) === String(user?.id);
        const updatingOffer = offerActionId.startsWith(`${item.id}:`);

        return (
            <View style={{ width: isOffer ? '90%' : '82%', alignSelf: own ? 'flex-end' : 'flex-start', alignItems: own ? 'flex-end' : 'flex-start', marginBottom: 11 }}>
                <View style={{ width: isOffer ? '100%' : undefined, backgroundColor: isOffer ? colors.card : own ? COLORS.primary : colors.card, borderRadius: 16, borderBottomRightRadius: own ? 5 : 16, borderBottomLeftRadius: own ? 16 : 5, padding: isOffer ? 13 : item.body ? 11 : 5, borderWidth: isOffer || !own ? 1 : 0, borderColor: isOffer ? offerStatus.color : colors.borderColor }}>
                    {Boolean(item.reply_to_message) && (
                        <View style={{ maxWidth: 245, borderLeftWidth: 3, borderLeftColor: own ? COLORS.white : COLORS.primary, borderRadius: 10, backgroundColor: own ? 'rgba(255,255,255,.14)' : COLORS.light, paddingHorizontal: 9, paddingVertical: 7, marginBottom: item.body || messageAttachments.length ? 8 : 0 }}>
                            <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { fontSize: 10, color: own ? COLORS.white : COLORS.primary }]}>
                                Reply to {String(item.reply_to_message.sender) === String(user?.id) ? 'you' : item.reply_to_message.sender_name || thread.other_user_name}
                            </Text>
                            <Text numberOfLines={2} style={[FONTS.fontXs, { color: own ? COLORS.white : COLORS.secondary, marginTop: 2, opacity: own ? 0.86 : 1 }]}>
                                {item.reply_to_message.body || 'Attachment'}
                            </Text>
                        </View>
                    )}

                    {isOffer ? (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 34, width: 34, borderRadius: 11, backgroundColor: `${COLORS.primary}14`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="tag" size={16} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 9 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text }]}>PRICE OFFER</Text>
                                    <Text style={[FONTS.h5, { color: colors.title, fontSize: 19, marginTop: 1 }]}>{formatPrice(item.offer_amount, 'UGX')}</Text>
                                </View>
                                <View style={{ borderRadius: 8, backgroundColor: offerStatus.background, paddingHorizontal: 7, paddingVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
                                    <FeatherIcon name={offerStatus.icon} size={11} color={offerStatus.color} />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: offerStatus.color, fontSize: 8, marginLeft: 4 }]}>{offerStatus.label}</Text>
                                </View>
                            </View>
                            {Boolean(item.body) && (
                                <View style={{ borderRadius: 10, backgroundColor: colors.background, paddingHorizontal: 10, paddingVertical: 8, marginTop: 10 }}>
                                    <MessageText color={colors.title}>{item.body}</MessageText>
                                </View>
                            )}
                            {canRespondToOffer && (
                                <View style={{ flexDirection: 'row', marginTop: 11 }}>
                                    <TouchableOpacity disabled={updatingOffer} onPress={() => changeOfferStatus(item, 'decline')} style={{ flex: 1, minHeight: 40, borderRadius: 11, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 7, opacity: updatingOffer ? 0.55 : 1 }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger }]}>Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={updatingOffer} onPress={() => changeOfferStatus(item, 'accept')} style={{ flex: 1, minHeight: 40, borderRadius: 11, backgroundColor: '#18864B', alignItems: 'center', justifyContent: 'center', opacity: updatingOffer ? 0.55 : 1 }}>
                                        {updatingOffer ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white }]}>Accept offer</Text>}
                                    </TouchableOpacity>
                                </View>
                            )}
                            {canWithdrawOffer && (
                                <TouchableOpacity disabled={updatingOffer} onPress={() => changeOfferStatus(item, 'withdraw')} style={{ minHeight: 38, borderRadius: 11, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center', marginTop: 10, opacity: updatingOffer ? 0.55 : 1 }}>
                                    {updatingOffer ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text }]}>Withdraw offer</Text>}
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : Boolean(item.body) && <MessageText color={own ? COLORS.white : colors.title}>{item.body}</MessageText>}

                    {!isOffer && messageAttachments.map((attachment) => {
                        const fileUrl = resolveChatFileUrl(attachment.file_url);
                        if (attachment.file_type === 'image') {
                            return (
                                <TouchableOpacity key={attachment.id} onPress={() => openAttachment(attachment)} style={{ marginTop: item.body ? 9 : 0 }}>
                                    <Image
                                        source={{ uri: fileUrl, headers: getChatFileHeaders() }}
                                        style={{ width: 220, height: 170, borderRadius: 12, backgroundColor: colors.background }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity key={attachment.id} onPress={() => openAttachment(attachment)} style={{ minHeight: 48, maxWidth: 240, flexDirection: 'row', alignItems: 'center', marginTop: item.body ? 8 : 0, paddingHorizontal: 7 }}>
                                <FeatherIcon name="file-text" size={20} color={own ? COLORS.white : COLORS.primary} />
                                <View style={{ flex: 1, marginLeft: 9 }}>
                                    <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: own ? COLORS.white : colors.title }]}>{attachment.original_name || 'Attachment'}</Text>
                                    <Text style={[FONTS.fontXs, { color: own ? 'rgba(255,255,255,.72)' : colors.text }]}>{Math.max(1, Math.round(Number(attachment.size || 0) / 1024))} KB</Text>
                                </View>
                                <FeatherIcon name="external-link" size={15} color={own ? COLORS.white : colors.text} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, paddingHorizontal: 3 }}>
                    <Text style={[FONTS.fontXs, { fontSize: 10, color: colors.textLight }]}>{formatMessageTime(item.created_at)}</Text>
                    {own && <FeatherIcon name={item.is_read ? 'check-circle' : 'check'} size={11} color={item.is_read ? COLORS.success : colors.textLight} style={{ marginLeft: 4 }} />}
                    {!blockedByMe && (
                        <TouchableOpacity onPress={() => startReply(item)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 7, marginLeft: 3 }}>
                            <FeatherIcon name="corner-up-left" size={12} color={colors.textLight} />
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { fontSize: 10, color: colors.textLight, marginLeft: 3 }]}>Reply</Text>
                        </TouchableOpacity>
                    )}
                    {own && (
                        <TouchableOpacity onPress={() => setConfirmation({ type: 'delete_message', message: item })} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6 }}>
                            <FeatherIcon name="trash-2" size={12} color={COLORS.danger} />
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { fontSize: 10, color: COLORS.danger, marginLeft: 3 }]}>Delete</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View style={{ minHeight: 68, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.borderColor, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ height: 44, width: 38, alignItems: 'center', justifyContent: 'center' }}>
                        <FeatherIcon name="chevron-left" size={25} color={colors.title} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId: thread.listing?.id })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ marginHorizontal: 7 }}>
                            <View style={{ height: 47, width: 47, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.background }}>
                                {image ? <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} /> : <Image source={IMAGES.detail1} style={{ width: '100%', height: '100%' }} />}
                            </View>
                            <View style={{ position: 'absolute', right: -5, bottom: -5, height: 22, width: 22, borderRadius: 11, overflow: 'hidden', borderWidth: 2, borderColor: colors.card, backgroundColor: colors.background }}>
                                {thread.other_user_avatar ? (
                                    <Image source={{ uri: thread.other_user_avatar }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="user" size={12} color={colors.text} /></View>
                                )}
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 7 }}>
                            <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{thread.other_user_name || 'QOT user'}</Text>
                            <Text numberOfLines={1} style={[FONTS.fontXs, { color: otherUserTyping || thread.other_user_online ? COLORS.success : colors.text, marginTop: 1 }]}>{statusText}</Text>
                            <Text numberOfLines={1} style={[FONTS.fontXs, { color: COLORS.primary, marginTop: 1 }]}>{thread.listing?.title || 'Advert conversation'}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setOptionsOpen(true)} style={{ height: 44, width: 42, alignItems: 'center', justifyContent: 'center' }}>
                        <FeatherIcon name="more-vertical" size={21} color={colors.title} />
                    </TouchableOpacity>
                </View>

                {Boolean(error) && (
                    <TouchableOpacity onPress={() => setError('')} style={{ marginHorizontal: 12, marginTop: 8, padding: 10, borderRadius: 11, backgroundColor: '#FDECEC', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[FONTS.fontXs, { color: COLORS.danger, flex: 1 }]}>{error}</Text>
                        <FeatherIcon name="x" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                )}

                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderMessage}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: messages.length ? 'flex-end' : 'center', paddingHorizontal: 13, paddingVertical: 15 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    ListEmptyComponent={(
                        <View style={{ alignItems: 'center', padding: 30 }}>
                            <FeatherIcon name="message-circle" size={33} color={COLORS.primary} />
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 12 }]}>Start the conversation</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', marginTop: 4 }]}>Ask about availability, condition, location, or make an offer.</Text>
                        </View>
                    )}
                    ListFooterComponent={otherUserTyping ? (
                        <View style={{ alignSelf: 'flex-start', borderRadius: 15, borderBottomLeftRadius: 5, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 11, gap: 4 }}>
                            {[0, 1, 2].map((dot) => <View key={dot} style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: COLORS.primary, opacity: 1 - (dot * 0.22) }} />)}
                        </View>
                    ) : null}
                />

                {replyingTo && !blockedByMe && (
                    <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderColor, paddingHorizontal: 13, paddingTop: 9 }}>
                        <View style={{ borderLeftWidth: 3, borderLeftColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderRadius: 12, paddingVertical: 8, paddingLeft: 11, paddingRight: 42 }}>
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>Replying to {String(replyingTo.sender) === String(user?.id) ? 'yourself' : replyingTo.sender_name || thread.other_user_name}</Text>
                            <Text numberOfLines={1} style={[FONTS.fontXs, { color: COLORS.secondary, marginTop: 2 }]}>
                                {replyingTo.body || replyingTo.attachments?.[0]?.original_name || 'Attachment'}
                            </Text>
                            <TouchableOpacity onPress={() => setReplyingTo(null)} accessibilityLabel="Cancel reply" style={{ position: 'absolute', right: 5, top: 5, height: 32, width: 32, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="x" size={17} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {attachments.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 7 }} style={{ flexGrow: 0, backgroundColor: colors.card }}>
                        {attachments.map((attachment, index) => (
                            <View key={`${attachment.uri}-${index}`} style={{ maxWidth: 190, height: 38, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center', paddingLeft: 10, marginRight: 7 }}>
                                <FeatherIcon name="paperclip" size={14} color={COLORS.primary} />
                                <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.title, flex: 1, marginLeft: 6 }]}>{attachment.name}</Text>
                                <TouchableOpacity onPress={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={{ padding: 9 }}>
                                    <FeatherIcon name="x" size={14} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {blockedByMe ? (
                    <View style={{ minHeight: 70, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderColor, paddingHorizontal: 14, paddingTop: 10, paddingBottom: keyboardVisible ? 10 : bottomSafeInset, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ height: 38, width: 38, borderRadius: 13, backgroundColor: `${COLORS.danger}12`, alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="slash" size={17} color={COLORS.danger} />
                        </View>
                        <Text style={[FONTS.fontXs, { color: colors.text, flex: 1, marginHorizontal: 10 }]}>You blocked {thread.other_user_name || 'this user'}.</Text>
                        <TouchableOpacity onPress={() => setConfirmation({ type: 'unblock_user' })} style={{ minHeight: 38, borderRadius: 13, backgroundColor: COLORS.primary, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white }]}>Unblock</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ minHeight: 64, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderColor, paddingHorizontal: 10, paddingTop: 8, paddingBottom: keyboardVisible ? 8 : bottomSafeInset, flexDirection: 'row', alignItems: 'flex-end' }}>
                        <TouchableOpacity disabled={sending || attachments.length >= 5} onPress={chooseAttachments} style={{ height: 45, width: 42, alignItems: 'center', justifyContent: 'center', opacity: sending || attachments.length >= 5 ? 0.4 : 1 }}>
                            <FeatherIcon name="paperclip" size={21} color={colors.text} />
                        </TouchableOpacity>
                        {isBuyer && (
                            <TouchableOpacity
                                disabled={sending}
                                onPress={() => {
                                    setOfferError('');
                                    setOfferModalOpen(true);
                                }}
                                accessibilityLabel="Make a price offer"
                                style={{ height: 45, width: 39, alignItems: 'center', justifyContent: 'center', opacity: sending ? 0.4 : 1 }}
                            >
                                <FeatherIcon name="tag" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                        <TextInput
                            ref={composerRef}
                            value={body}
                            onChangeText={updateBody}
                            placeholder="Write a message..."
                            placeholderTextColor={colors.textLight}
                            multiline
                            maxLength={1000}
                            style={[FONTS.font, { flex: 1, minHeight: 45, maxHeight: 110, borderRadius: 17, backgroundColor: colors.background, color: colors.title, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 10 }]}
                        />
                        <TouchableOpacity disabled={sending || (!body.trim() && !attachments.length)} onPress={submitMessage} style={{ height: 45, width: 45, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 7, opacity: sending || (!body.trim() && !attachments.length) ? 0.45 : 1 }}>
                            {sending ? <ActivityIndicator size="small" color={COLORS.white} /> : <FeatherIcon name="send" size={18} color={COLORS.white} />}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>

            <Modal transparent visible={offerModalOpen} animationType="fade" onRequestClose={closeOfferModal}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableOpacity activeOpacity={1} disabled={offerLoading} onPress={closeOfferModal} style={{ flex: 1, padding: 20, backgroundColor: 'rgba(15,23,42,.62)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity activeOpacity={1} style={{ width: '100%', maxWidth: 410, borderRadius: 23, backgroundColor: colors.card, padding: 19 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: `${COLORS.primary}14`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="tag" size={21} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                    <Text style={[FONTS.h6, { color: colors.title }]}>Make an offer</Text>
                                    <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginTop: 2 }]}>{thread.listing?.title}</Text>
                                </View>
                                <TouchableOpacity disabled={offerLoading} onPress={closeOfferModal} style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="x" size={18} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {askingPrice > 0 && (
                                <View style={{ borderRadius: 11, backgroundColor: colors.background, paddingHorizontal: 11, paddingVertical: 9, marginTop: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[FONTS.fontXs, { color: colors.text, flex: 1 }]}>Seller's price</Text>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{formatPrice(askingPrice, thread.listing?.currency || 'UGX')}</Text>
                                </View>
                            )}

                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginTop: 15, marginBottom: 7 }]}>Your offer in UGX</Text>
                            <View style={{ height: 52, borderRadius: 13, borderWidth: 1, borderColor: offerError ? COLORS.danger : colors.borderColor, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginRight: 9 }]}>UGX</Text>
                                <TextInput
                                    value={offerAmount}
                                    onChangeText={(value) => {
                                        setOfferAmount(value.replace(/[^0-9]/g, ''));
                                        setOfferError('');
                                    }}
                                    keyboardType="number-pad"
                                    placeholder="Enter amount"
                                    placeholderTextColor={colors.textLight}
                                    style={[FONTS.font, FONTS.fontTitle, { flex: 1, height: '100%', color: colors.title }]}
                                />
                            </View>

                            {offerSuggestions.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 9 }}>
                                    {offerSuggestions.map((amount) => (
                                        <TouchableOpacity key={amount} onPress={() => { setOfferAmount(String(amount)); setOfferError(''); }} style={{ borderRadius: 18, borderWidth: 1, borderColor: String(amount) === offerAmount ? COLORS.primary : colors.borderColor, backgroundColor: String(amount) === offerAmount ? `${COLORS.primary}10` : colors.card, paddingHorizontal: 10, paddingVertical: 7, marginRight: 7 }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: String(amount) === offerAmount ? COLORS.primary : colors.title }]}>{formatPrice(amount, 'UGX')}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginTop: 13, marginBottom: 7 }]}>Note <Text style={{ color: colors.text, fontFamily: 'PoppinsRegular' }}>(optional)</Text></Text>
                            <TextInput
                                value={offerNote}
                                onChangeText={(value) => setOfferNote(value.slice(0, 300))}
                                multiline
                                maxLength={300}
                                textAlignVertical="top"
                                placeholder="Add a short message to the seller"
                                placeholderTextColor={colors.textLight}
                                style={[FONTS.fontSm, { minHeight: 72, borderRadius: 13, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.background, color: colors.title, padding: 11, paddingTop: 10 }]}
                            />

                            {Boolean(offerError) && (
                                <View style={{ borderRadius: 10, backgroundColor: '#FFF1F0', padding: 9, flexDirection: 'row', marginTop: 10 }}>
                                    <FeatherIcon name="alert-circle" size={15} color={COLORS.danger} />
                                    <Text style={[FONTS.fontXs, { color: COLORS.danger, flex: 1, marginLeft: 7 }]}>{offerError}</Text>
                                </View>
                            )}

                            <View style={{ borderRadius: 11, backgroundColor: '#FFF7F2', padding: 10, flexDirection: 'row', marginTop: 11 }}>
                                <FeatherIcon name="shield" size={15} color={COLORS.primary} style={{ marginTop: 1 }} />
                                <Text style={[FONTS.fontXs, { color: colors.text, flex: 1, lineHeight: 18, marginLeft: 7 }]}>An accepted offer is not a payment. Inspect the item before paying.</Text>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                <TouchableOpacity disabled={offerLoading} onPress={closeOfferModal} style={{ flex: 1, minHeight: 47, borderRadius: 13, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity disabled={offerLoading} onPress={submitOffer} style={{ flex: 1.2, minHeight: 47, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: offerLoading ? 0.7 : 1 }}>
                                    {offerLoading ? <ActivityIndicator size="small" color={COLORS.white} /> : <FeatherIcon name="send" size={16} color={COLORS.white} />}
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>{offerLoading ? 'Sending...' : 'Send offer'}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            <Modal transparent visible={Boolean(previewAttachment)} animationType="fade" onRequestClose={() => setPreviewAttachment(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.94)', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => setPreviewAttachment(null)} style={{ position: 'absolute', right: 15, top: 48, height: 44, width: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <FeatherIcon name="x" size={23} color={COLORS.white} />
                    </TouchableOpacity>
                    {previewAttachment && (
                        <Image source={{ uri: resolveChatFileUrl(previewAttachment.file_url), headers: getChatFileHeaders() }} style={{ width: '100%', height: '82%' }} resizeMode="contain" />
                    )}
                    <Text numberOfLines={1} style={[FONTS.fontSm, { color: COLORS.white, marginTop: 10, paddingHorizontal: 25 }]}>{previewAttachment?.original_name}</Text>
                </View>
            </Modal>

            <Modal transparent visible={optionsOpen} animationType="fade" onRequestClose={() => setOptionsOpen(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => !actionLoading && setOptionsOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(15,23,42,.46)', justifyContent: 'flex-end' }}>
                    <TouchableOpacity activeOpacity={1} style={{ backgroundColor: colors.card, borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 18, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 32) }}>
                        <View style={{ width: 42, height: 4, borderRadius: 2, backgroundColor: colors.borderColor, alignSelf: 'center', marginBottom: 16 }} />
                        <Text style={[FONTS.h6, { color: colors.title, marginBottom: 10 }]}>Conversation options</Text>
                        {[
                            { icon: 'star', label: thread.is_favourite ? 'Remove from favourites' : 'Add to favourites', action: () => updateThread({ is_favourite: !thread.is_favourite }) },
                            { icon: 'archive', label: thread.is_archived ? 'Unarchive chat' : 'Archive chat', action: () => updateThread({ is_archived: !thread.is_archived }) },
                            { icon: 'mail', label: 'Mark as unread', action: () => updateThread({ is_marked_unread: true }) },
                            { icon: 'shield', label: thread.is_spam ? 'Move out of spam' : 'Report as spam', action: requestSpam, danger: !thread.is_spam },
                            {
                                icon: blockedByMe ? 'shield' : 'user-x',
                                label: blockedByMe ? `Unblock ${thread.other_user_name || 'user'}` : `Block ${thread.other_user_name || 'user'}`,
                                action: () => {
                                    setOptionsOpen(false);
                                    setConfirmation({ type: blockedByMe ? 'unblock_user' : 'block_user' });
                                },
                                danger: !blockedByMe,
                            },
                            {
                                icon: 'trash-2',
                                label: 'Delete conversation',
                                action: () => {
                                    setOptionsOpen(false);
                                    setConfirmation({ type: 'delete_thread' });
                                },
                                danger: true,
                            },
                        ].map((option) => (
                            <TouchableOpacity key={option.label} disabled={actionLoading} onPress={option.action} style={{ minHeight: 51, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderColor }}>
                                <FeatherIcon name={option.icon} size={18} color={option.danger ? COLORS.danger : colors.text} />
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: option.danger ? COLORS.danger : colors.title, marginLeft: 12 }]}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                        {actionLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <ConfirmationModal
                visible={Boolean(confirmation)}
                title={confirmationDetails.title}
                description={confirmationDetails.description}
                confirmLabel={confirmationDetails.confirmLabel}
                icon={confirmationDetails.icon}
                danger={confirmationDetails.danger}
                loading={actionLoading}
                colors={colors}
                onCancel={() => !actionLoading && setConfirmation(null)}
                onConfirm={runConfirmation}
            />
        </SafeAreaView>
    );
};

export default SingleChat;
