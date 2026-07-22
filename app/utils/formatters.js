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
