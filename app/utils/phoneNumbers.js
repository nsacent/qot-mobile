export const ugandanNationalDigits = (value = '') => {
    let digits = String(value).replace(/\D/g, '');

    if (digits.startsWith('256')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);

    return digits.slice(0, 9);
};

export const isValidUgandanMobile = (value = '') => /^7\d{8}$/.test(
    ugandanNationalDigits(value),
);

export const ugandanPhoneE164 = (value = '') => {
    const national = ugandanNationalDigits(value);
    return isValidUgandanMobile(national) ? `+256${national}` : '';
};

export const formatUgandanNational = (value = '') => {
    const digits = ugandanNationalDigits(value);
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
        .filter(Boolean)
        .join(' ');
};
