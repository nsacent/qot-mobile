import {
    clearSession,
    getSession,
    updateTokens,
} from './session';
import { getDeviceId } from '../utils/deviceIdentity';
import { Platform } from 'react-native';

export const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.qot.ug/api/v1'
).replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

const firstErrorMessage = (data) => {
    if (!data) return 'Something went wrong. Please try again.';
    if (typeof data === 'string') return data;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;

    for (const value of Object.values(data)) {
        if (typeof value === 'string') return value;
        if (Array.isArray(value) && value.length) return String(value[0]);
        if (value && typeof value === 'object') {
            const nested = firstErrorMessage(value);
            if (nested) return nested;
        }
    }

    return 'Something went wrong. Please try again.';
};

const parseResponse = async (response) => {
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();

    const text = await response.text();
    return text || null;
};

let refreshPromise = null;

const refreshAccessToken = async () => {
    const refresh = getSession()?.tokens?.refresh;
    if (!refresh) return null;

    if (!refreshPromise) {
        refreshPromise = (async () => {
            const deviceId = await getDeviceId().catch(() => '');
            const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-QOT-Platform': Platform.OS,
                    ...(deviceId ? { 'X-QOT-Device-ID': deviceId } : {}),
                },
                body: JSON.stringify({ refresh }),
            });
            const data = await parseResponse(response);

            if (!response.ok || !data?.access) {
                await clearSession();
                return null;
            }

            await updateTokens({
                access: data.access,
                refresh: data.refresh || refresh,
            });
            return data.access;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

export const apiRequest = async (path, options = {}) => {
    const {
        body,
        headers = {},
        authenticated = false,
        retry = true,
        ...requestOptions
    } = options;

    const session = getSession();
    const deviceId = await getDeviceId().catch(() => '');
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const requestHeaders = {
        Accept: 'application/json',
        'X-QOT-Platform': Platform.OS,
        ...(deviceId ? { 'X-QOT-Device-ID': deviceId } : {}),
        ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
    };

    if (authenticated && session?.tokens?.access) {
        requestHeaders.Authorization = `Bearer ${session.tokens.access}`;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${cleanPath}`, {
            ...requestOptions,
            headers: requestHeaders,
            body: body === undefined || isFormData || typeof body === 'string'
                ? body
                : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(
            'Could not reach QOT. Check your internet connection and try again.',
            0,
            null,
        );
    }

    if (response.status === 401 && authenticated && retry) {
        const access = await refreshAccessToken();
        if (access) {
            return apiRequest(path, { ...options, retry: false });
        }
    }

    const data = await parseResponse(response);
    if (!response.ok) {
        throw new ApiError(firstErrorMessage(data), response.status, data);
    }

    return data;
};
