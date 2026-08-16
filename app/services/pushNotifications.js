import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiRequest } from '../api/client';
import { getDeviceId } from '../utils/deviceIdentity';

const PUSH_TOKEN_KEY = 'qot.expoPushToken';
const registrationPromises = new Map();
const registeredSessions = new Set();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const setAndroidChannel = async () => {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync('qot-updates', {
        name: 'QOT updates',
        description: 'Messages, ad updates, saved searches and account alerts.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 200, 250],
        lightColor: '#F97316',
        sound: 'default',
    });
};

export const configurePushNotifications = async () => {
    await setAndroidChannel();
};

const syncPushTokenWithQOT = async (expoPushToken, userId) => {
    const deviceId = await getDeviceId();
    const registrationKey = [
        String(userId || 'signed-in-user'),
        Platform.OS,
        deviceId,
        expoPushToken,
    ].join(':');

    // Deduplicate callbacks only for this running app session. Persistently
    // skipping the request can leave Android tied to an old account or a
    // server record that no longer exists after a reinstall/restore.
    if (registeredSessions.has(registrationKey)) return false;

    await apiRequest('/notifications/devices/', {
        method: 'POST',
        authenticated: true,
        body: {
            expo_push_token: expoPushToken,
            platform: Platform.OS,
            device_id: deviceId,
        },
    });
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, expoPushToken);
    registeredSessions.add(registrationKey);
    return true;
};

const performPushRegistration = async (userId) => {
    if (Platform.OS === 'web') return { status: 'unsupported' };
    if (!Device.isDevice) return { status: 'physical_device_required' };

    await configurePushNotifications();

    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
        return { status: 'development_build_required' };
    }

    const existing = await Notifications.getPermissionsAsync();
    let permissionStatus = existing.status;
    if (permissionStatus !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        permissionStatus = requested.status;
    }
    if (permissionStatus !== 'granted') return { status: 'permission_denied' };

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
        || Constants.easConfig?.projectId;
    if (!projectId) return { status: 'project_not_configured' };

    const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const synced = await syncPushTokenWithQOT(expoPushToken, userId);
    return { status: synced ? 'registered' : 'already_registered', token: expoPushToken };
};

export const registerForPushNotifications = async ({ userId } = {}) => {
    // Both Android and iOS can emit several token callbacks together. Share
    // one registration per account so they cannot create an API request burst.
    const promiseKey = String(userId || 'signed-in-user');
    if (!registrationPromises.has(promiseKey)) {
        const registrationPromise = performPushRegistration(userId).finally(() => {
            registrationPromises.delete(promiseKey);
        });
        registrationPromises.set(promiseKey, registrationPromise);
    }

    return registrationPromises.get(promiseKey);
};

export const unregisterPushNotifications = async () => {
    const expoPushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (!expoPushToken) return;
    try {
        await apiRequest('/notifications/devices/', {
            method: 'DELETE',
            authenticated: true,
            body: { expo_push_token: expoPushToken },
        });
    } finally {
        await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
        registeredSessions.clear();
        registrationPromises.clear();
    }
};
