export const formatPrice = (price, currency = 'UGX') => {
    const amount = Number(price);
    if (!Number.isFinite(amount)) return `${currency} ${price || '0'}`;

    return `${currency} ${Math.round(amount).toLocaleString('en-US')}`;
};

export const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatRelativeTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 45) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'short',
    });
};

export const formatMessageTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString('en-UG', {
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const getExpiryTime = (value) => {
    if (!value) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
};

export const formatExpiryRemaining = (value, now = Date.now()) => {
    const expiryTime = getExpiryTime(value);
    if (expiryTime === null) return 'Expiry time not set';

    const remaining = expiryTime - now;
    if (remaining <= 0) return 'Expired — renewal available';

    const totalMinutes = Math.max(1, Math.ceil(remaining / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d${hours ? ` ${hours}h` : ''} remaining`;
    if (hours > 0) return `${hours}h${minutes ? ` ${minutes}m` : ''} remaining`;
    return `${minutes}m remaining`;
};

export const canRenewListing = (listing, now = Date.now()) => {
    const status = String(listing?.status || '').toLowerCase();
    if (status === 'expired') return true;
    if (status !== 'active') return false;

    const expiryTime = getExpiryTime(listing?.expires_at);
    return expiryTime !== null && expiryTime <= now;
};
