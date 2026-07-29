import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'qot.deviceId';
let deviceIdPromise = null;

const createDeviceId = () => (
    `qot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
);

export const getDeviceId = async () => {
    if (!deviceIdPromise) {
        deviceIdPromise = (async () => {
            let existing = '';
            try {
                existing = Platform.OS === 'web' && globalThis.localStorage
                    ? globalThis.localStorage.getItem(DEVICE_ID_KEY) || ''
                    : await SecureStore.getItemAsync(DEVICE_ID_KEY) || '';
            } catch {
                // A generated identifier still supports the current sign-in.
            }
            if (existing) return existing;
            const created = createDeviceId();
            try {
                if (Platform.OS === 'web' && globalThis.localStorage) {
                    globalThis.localStorage.setItem(DEVICE_ID_KEY, created);
                } else {
                    await SecureStore.setItemAsync(DEVICE_ID_KEY, created);
                }
            } catch {
                // Storage-restricted devices can still authenticate.
            }
            return created;
        })().catch((error) => {
            deviceIdPromise = null;
            throw error;
        });
    }
    return deviceIdPromise;
};

export const getDeviceMetadata = async () => ({
    id: await getDeviceId(),
    platform: Platform.OS,
    device_name: Device.deviceName || '',
    device_model: Device.modelName || Device.modelId || '',
    os_name: Device.osName || Platform.OS,
    os_version: Device.osVersion || String(Platform.Version || ''),
    app_version: Constants.expoConfig?.version || '',
});
