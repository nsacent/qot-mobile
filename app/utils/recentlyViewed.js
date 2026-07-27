import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'qot:v1:recently-viewed';
const LEGACY_STORAGE_KEY = 'qot.recentlyViewed';
const MAX_ITEMS = 20;

const imageFor = (listing) => (
    listing?.card_image_url
    || listing?.images?.find?.((image) => image?.is_primary)?.card_image_url
    || listing?.images?.[0]?.card_image_url
    || listing?.primary_image
    || listing?.images?.find?.((image) => image?.is_primary)?.image_url
    || listing?.images?.[0]?.image_url
    || listing?.images?.[0]?.image
    || listing?.cover_image
    || listing?.image
    || ''
);

const snapshot = (listing) => ({
    id: listing?.id,
    title: listing?.title || 'Untitled ad',
    description: listing?.description || '',
    price: listing?.price || '',
    currency: listing?.currency || 'UGX',
    primary_image: imageFor(listing),
    category_name: listing?.category?.name || listing?.category_name || '',
    city_name: listing?.city?.name || listing?.city_name || listing?.location || 'Uganda',
    area_name: listing?.area?.name || listing?.area_name || '',
    region_name: listing?.city?.region?.name || listing?.region_name || '',
    condition: listing?.condition || '',
    is_negotiable: Boolean(listing?.is_negotiable),
    is_featured: Boolean(listing?.is_featured),
    views_count: Number(listing?.views_count || listing?.views || 0),
    image_count: Number(listing?.image_count || listing?.images?.length || 0),
    created_at: listing?.created_at || null,
    updated_at: listing?.updated_at || null,
    viewed_at: new Date().toISOString(),
});

export const getRecentlyViewed = async () => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
            || await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];
        if (raw && !await AsyncStorage.getItem(STORAGE_KEY)) {
            await AsyncStorage.setItem(STORAGE_KEY, raw);
            await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
        return Array.isArray(items) ? items.filter((item) => item?.id) : [];
    } catch {
        return [];
    }
};

export const recordRecentlyViewed = async (listing) => {
    if (!listing?.id) return;

    const items = await getRecentlyViewed();
    const remaining = items.filter((item) => String(item.id) !== String(listing.id));
    await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([snapshot(listing), ...remaining].slice(0, MAX_ITEMS)),
    );
};

export const removeRecentlyViewed = async (listingId) => {
    const items = await getRecentlyViewed();
    const nextItems = items.filter((item) => String(item.id) !== String(listingId));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    return nextItems;
};

export const clearRecentlyViewed = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
};
