import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'qot:v1:recent-searches';
const LEGACY_STORAGE_KEY = 'qot.recentSearches';
const MAX_SEARCHES = 12;

const cleanText = (value) => String(value || '').trim();

const searchKey = (item = {}) => [
    cleanText(item.query).toLowerCase(),
    cleanText(item.categorySlug).toLowerCase(),
    cleanText(item.cityId || item.citySlug).toLowerCase(),
].join('|');

const normaliseSearch = (search = {}) => ({
    id: search.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query: cleanText(search.query),
    categorySlug: cleanText(search.categorySlug),
    categoryName: cleanText(search.categoryName),
    cityId: search.cityId || '',
    citySlug: cleanText(search.citySlug),
    cityName: cleanText(search.cityName),
    filters: search.filters && typeof search.filters === 'object' ? search.filters : {},
    searchedAt: search.searchedAt || new Date().toISOString(),
});

export const getRecentSearches = async () => {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
            || await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        const searches = raw ? JSON.parse(raw) : [];
        if (raw && !await AsyncStorage.getItem(STORAGE_KEY)) {
            await AsyncStorage.setItem(STORAGE_KEY, raw);
            await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
        return Array.isArray(searches)
            ? searches.filter((item) => item && (item.query || item.categorySlug || item.cityId || item.citySlug))
            : [];
    } catch {
        return [];
    }
};

export const recordRecentSearch = async (search) => {
    const nextSearch = normaliseSearch(search);
    if (!nextSearch.query && !nextSearch.categorySlug && !nextSearch.cityId && !nextSearch.citySlug) return getRecentSearches();

    const searches = await getRecentSearches();
    const key = searchKey(nextSearch);
    const remaining = searches.filter((item) => searchKey(item) !== key);
    const next = [nextSearch, ...remaining].slice(0, MAX_SEARCHES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
};

export const removeRecentSearch = async (searchId) => {
    const searches = await getRecentSearches();
    const next = searches.filter((item) => String(item.id) !== String(searchId));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
};

export const clearRecentSearches = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, LEGACY_STORAGE_KEY]);
};

export const recentSearchLabel = (search) => (
    search?.query
    || search?.categoryName
    || search?.cityName
    || 'All ads'
);
