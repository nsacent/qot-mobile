import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'qot.comparisonAds';
export const MAX_COMPARE_ADS = 3;

const imageFor = (listing) => (
    listing?.card_image_url
    || listing?.primary_image
    || listing?.images?.find?.((image) => image?.is_primary)?.card_image_url
    || listing?.images?.[0]?.card_image_url
    || listing?.images?.find?.((image) => image?.is_primary)?.image_url
    || listing?.images?.[0]?.image_url
    || ''
);

const snapshot = (listing) => ({
    ...listing,
    id: listing?.id,
    title: listing?.title || 'Untitled ad',
    primary_image: imageFor(listing),
    category_name: listing?.category?.name || listing?.category_name || '',
    city_name: listing?.city?.name || listing?.city_name || listing?.location || 'Uganda',
    compared_at: new Date().toISOString(),
});

export const getComparisonAds = async () => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        return Array.isArray(items) ? items.filter((item) => item?.id).slice(0, MAX_COMPARE_ADS) : [];
    } catch {
        return [];
    }
};

export const saveComparisonAds = async (items) => {
    const nextItems = items.filter((item) => item?.id).slice(0, MAX_COMPARE_ADS).map(snapshot);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    return nextItems;
};

export const toggleComparisonAd = async (listing) => {
    if (!listing?.id) return { items: await getComparisonAds(), isCompared: false };

    const items = await getComparisonAds();
    const exists = items.some((item) => String(item.id) === String(listing.id));
    if (exists) {
        const nextItems = items.filter((item) => String(item.id) !== String(listing.id));
        await saveComparisonAds(nextItems);
        return { items: nextItems, isCompared: false, limitReached: false };
    }

    if (items.length >= MAX_COMPARE_ADS) {
        return { items, isCompared: false, limitReached: true };
    }

    const nextItems = await saveComparisonAds([...items, listing]);
    return { items: nextItems, isCompared: true, limitReached: false };
};

export const removeComparisonAd = async (listingId) => {
    const items = await getComparisonAds();
    return saveComparisonAds(items.filter((item) => String(item.id) !== String(listingId)));
};

export const clearComparisonAds = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
};
