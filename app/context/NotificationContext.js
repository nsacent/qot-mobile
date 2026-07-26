import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as Notifications from 'expo-notifications';
import {
    getNotifications,
    markAllNotificationsRead as markAllReadRequest,
    markNotificationRead as markReadRequest,
} from '../api/account';
import { buildChatSocketUrl, getChatSocketTicket } from '../api/chats';
import { useAuth } from './AuthContext';
import { registerForPushNotifications } from '../services/pushNotifications';

const NotificationContext = createContext(null);

const newestFirst = (items) => [...items].sort((first, second) => (
    new Date(second.created_at || 0).getTime() - new Date(first.created_at || 0).getTime()
));

const addOrReplaceNotification = (items, notification) => {
    if (!notification?.id) return items;
    const next = items.filter((item) => String(item.id) !== String(notification.id));
    return newestFirst([{ ...notification, is_read: Boolean(notification.is_read) }, ...next]);
};

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [liveConnected, setLiveConnected] = useState(false);
    const [pushStatus, setPushStatus] = useState('idle');
    const mounted = useRef(true);

    const refreshNotifications = useCallback(async (showLoading = false) => {
        if (!isAuthenticated) {
            setNotifications([]);
            return [];
        }

        if (showLoading) setLoading(true);
        try {
            const items = await getNotifications({ force: showLoading });
            if (mounted.current) {
                setNotifications(newestFirst(items));
                setError('');
            }
            return items;
        } catch (requestError) {
            if (mounted.current) setError(requestError.message || 'Notifications could not be loaded.');
            throw requestError;
        } finally {
            if (mounted.current && showLoading) setLoading(false);
        }
    }, [isAuthenticated]);

    const markRead = useCallback(async (notificationId) => {
        setNotifications((items) => items.map((item) => (
            String(item.id) === String(notificationId) ? { ...item, is_read: true } : item
        )));

        try {
            await markReadRequest(notificationId);
        } catch (requestError) {
            if (mounted.current) {
                setNotifications((items) => items.map((item) => (
                    String(item.id) === String(notificationId) ? { ...item, is_read: false } : item
                )));
                setError(requestError.message || 'Notification could not be marked as read.');
            }
            throw requestError;
        }
    }, []);

    const markAllRead = useCallback(async () => {
        const unreadIds = new Set(notifications.filter((item) => !item.is_read).map((item) => String(item.id)));
        setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));

        try {
            await markAllReadRequest();
        } catch (requestError) {
            if (mounted.current) {
                setNotifications((items) => items.map((item) => (
                    unreadIds.has(String(item.id)) ? { ...item, is_read: false } : item
                )));
                setError(requestError.message || 'Notifications could not be marked as read.');
            }
            throw requestError;
        }
    }, [notifications]);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        const unreadCount = notifications.filter((item) => !item.is_read).length;
        Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
    }, [notifications]);

    useEffect(() => {
        if (!isAuthenticated) return undefined;

        const readOpenedNotification = (response) => {
            const notificationId = response?.notification?.request?.content?.data?.notification_id;
            if (notificationId) markRead(notificationId).catch(() => {});
        };

        readOpenedNotification(Notifications.getLastNotificationResponse());
        const subscription = Notifications.addNotificationResponseReceivedListener(readOpenedNotification);
        return () => subscription.remove();
    }, [isAuthenticated, markRead]);

    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            setError('');
            return undefined;
        }

        refreshNotifications(true).catch(() => {});
        const timer = setInterval(() => refreshNotifications().catch(() => {}), 30000);
        return () => clearInterval(timer);
    }, [isAuthenticated, refreshNotifications]);

    const enablePushNotifications = useCallback(async () => {
        if (!isAuthenticated) return { status: 'signed_out' };
        setPushStatus('registering');
        try {
            const result = await registerForPushNotifications();
            if (mounted.current) setPushStatus(result.status);
            return result;
        } catch (requestError) {
            if (mounted.current) setPushStatus('error');
            throw requestError;
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setPushStatus('idle');
            return;
        }
        enablePushNotifications().catch(() => {});
    }, [enablePushNotifications, isAuthenticated, user?.id]);

    useEffect(() => {
        if (!isAuthenticated || !user?.is_verified) {
            setLiveConnected(false);
            return undefined;
        }

        let active = true;
        let socket;
        let reconnectTimer;

        const connect = async () => {
            try {
                const response = await getChatSocketTicket();
                if (!active || !response?.ticket) return;

                socket = new WebSocket(buildChatSocketUrl('/ws/notifications/', response.ticket));
                socket.onopen = () => {
                    if (active) setLiveConnected(true);
                };
                socket.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        if (payload.type === 'notification' && payload.notification && active) {
                            setNotifications((items) => addOrReplaceNotification(items, payload.notification));
                        }
                    } catch {
                        // Ignore malformed socket messages and keep the connection alive.
                    }
                };
                socket.onerror = () => {
                    if (active) setLiveConnected(false);
                };
                socket.onclose = () => {
                    if (!active) return;
                    setLiveConnected(false);
                    reconnectTimer = setTimeout(connect, 6000);
                };
            } catch {
                if (!active) return;
                setLiveConnected(false);
                reconnectTimer = setTimeout(connect, 10000);
            }
        };

        connect();
        return () => {
            active = false;
            clearTimeout(reconnectTimer);
            socket?.close();
            setLiveConnected(false);
        };
    }, [isAuthenticated, user?.id, user?.is_verified]);

    const value = useMemo(() => ({
        notifications,
        unreadCount: notifications.filter((item) => !item.is_read).length,
        loading,
        error,
        liveConnected,
        pushStatus,
        refreshNotifications,
        markRead,
        markAllRead,
        enablePushNotifications,
    }), [
        notifications,
        loading,
        error,
        liveConnected,
        pushStatus,
        refreshNotifications,
        markRead,
        markAllRead,
        enablePushNotifications,
    ]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used inside NotificationProvider.');
    return context;
};
