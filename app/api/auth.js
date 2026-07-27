import { apiRequest } from './client';
import { ugandanPhoneE164 } from '../utils/phoneNumbers';

export const login = ({ identifier, password }) => (
    apiRequest('/auth/login/', {
        method: 'POST',
        body: {
            identifier: String(identifier).includes('@')
                ? String(identifier).trim().toLowerCase()
                : ugandanPhoneE164(identifier),
            password,
            keep_signed_in: true,
        },
    })
);

export const requestPhoneOTP = (phone) => (
    apiRequest('/auth/otp/send/', {
        method: 'POST',
        body: { phone: ugandanPhoneE164(phone) },
    })
);

export const confirmPhoneOTP = ({ phone, code }) => (
    apiRequest('/auth/otp/confirm/', {
        method: 'POST',
        body: {
            phone: ugandanPhoneE164(phone),
            code: String(code || '').replace(/\D/g, '').slice(0, 6),
        },
    })
);

export const register = ({ phone, email, fullName, password, passwordConfirm }) => (
    apiRequest('/auth/register/', {
        method: 'POST',
        body: {
            phone: ugandanPhoneE164(phone),
            email: email.trim() || null,
            full_name: fullName.trim(),
            password,
            password_confirm: passwordConfirm,
        },
    })
);

export const loginWithFacebook = ({ accessToken }) => (
    apiRequest('/auth/facebook/', {
        method: 'POST',
        body: {
            access_token: accessToken,
            keep_signed_in: true,
        },
    })
);

export const loginWithGoogle = ({ credential }) => (
    apiRequest('/auth/google/', {
        method: 'POST',
        body: {
            credential,
            keep_signed_in: true,
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
