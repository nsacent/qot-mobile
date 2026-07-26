import { apiRequest } from './client';

const normalizeUgandanPhone = (value) => {
    const trimmed = String(value || '').trim();
    const digits = trimmed.replace(/\D/g, '');

    if (!digits || /[a-z@]/i.test(trimmed)) return trimmed;
    if (digits.startsWith('256')) return `+${digits}`;
    if (digits.startsWith('0')) return `+256${digits.slice(1)}`;
    if (digits.length === 9 && digits.startsWith('7')) return `+256${digits}`;
    return trimmed;
};

export const login = ({ identifier, password, keepSignedIn = true }) => (
    apiRequest('/auth/login/', {
        method: 'POST',
        body: {
            identifier: normalizeUgandanPhone(identifier),
            password,
            keep_signed_in: keepSignedIn,
        },
    })
);

export const register = ({ phone, email, fullName, password, passwordConfirm }) => (
    apiRequest('/auth/register/', {
        method: 'POST',
        body: {
            phone: normalizeUgandanPhone(phone),
            email: email.trim() || null,
            full_name: fullName.trim(),
            password,
            password_confirm: passwordConfirm,
        },
    })
);

export const loginWithFacebook = ({ accessToken, keepSignedIn = true }) => (
    apiRequest('/auth/facebook/', {
        method: 'POST',
        body: {
            access_token: accessToken,
            keep_signed_in: keepSignedIn,
        },
    })
);

export const loginWithGoogle = ({ credential, keepSignedIn = true }) => (
    apiRequest('/auth/google/', {
        method: 'POST',
        body: {
            credential,
            keep_signed_in: keepSignedIn,
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
