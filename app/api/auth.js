import { apiRequest } from './client';
import { ugandanPhoneE164 } from '../utils/phoneNumbers';
import { getDeviceMetadata } from '../utils/deviceIdentity';

export const login = async ({ identifier, password }) => (
    apiRequest('/auth/login/', {
        method: 'POST',
        body: {
            identifier: String(identifier).includes('@')
                ? String(identifier).trim().toLowerCase()
                : ugandanPhoneE164(identifier),
            password,
            keep_signed_in: true,
            device: await getDeviceMetadata(),
        },
    })
);

export const requestPhoneOTP = (phone) => (
    apiRequest('/auth/otp/send/', {
        method: 'POST',
        body: { phone: ugandanPhoneE164(phone) },
    })
);

export const confirmPhoneOTP = async ({ phone, code }) => (
    apiRequest('/auth/otp/confirm/', {
        method: 'POST',
        body: {
            phone: ugandanPhoneE164(phone),
            code: String(code || '').replace(/\D/g, '').slice(0, 6),
            device: await getDeviceMetadata(),
        },
    })
);

export const register = async ({ phone, email, fullName, password, passwordConfirm }) => (
    apiRequest('/auth/register/', {
        method: 'POST',
        body: {
            phone: ugandanPhoneE164(phone),
            email: email.trim() || null,
            full_name: fullName.trim(),
            password,
            password_confirm: passwordConfirm,
            device: await getDeviceMetadata(),
        },
    })
);

export const loginWithGoogle = async ({ credential }) => (
    apiRequest('/auth/google/', {
        method: 'POST',
        body: {
            credential,
            keep_signed_in: true,
            device: await getDeviceMetadata(),
        },
    })
);

export const getCurrentUser = () => (
    apiRequest('/auth/me/', { authenticated: true })
);

export const logout = (refresh) => (
    apiRequest('/auth/logout/', {
        method: 'POST',
        authenticated: true,
        body: { refresh },
    })
);

export const freezeAccount = () => (
    apiRequest('/auth/account/freeze/', {
        method: 'POST',
        authenticated: true,
        body: { confirmation: true },
    })
);

export const sendVerificationCode = (channel = 'phone') => (
    apiRequest('/auth/verification/send/', {
        method: 'POST',
        authenticated: true,
        body: { channel },
    })
);

export const confirmVerificationCode = (code, channel = 'phone') => (
    apiRequest('/auth/verification/confirm/', {
        method: 'POST',
        authenticated: true,
        body: { code, channel },
    })
);

export const requestPasswordReset = (email) => (
    apiRequest('/auth/password-reset/request/', {
        method: 'POST',
        body: { email: String(email || '').trim().toLowerCase() },
    })
);

export const confirmPasswordReset = ({ uid, token, password, passwordConfirm }) => (
    apiRequest('/auth/password-reset/confirm/', {
        method: 'POST',
        body: {
            uid,
            token,
            new_password: password,
            new_password_confirm: passwordConfirm,
        },
    })
);
