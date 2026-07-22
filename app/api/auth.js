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
