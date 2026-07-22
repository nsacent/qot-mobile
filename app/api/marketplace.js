import { apiRequest } from './client';

const collection = (data) => Array.isArray(data) ? data : (data?.results || []);

const queryString = (params = {}) => {
    const pairs = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return pairs.length ? `?${pairs.join('&')}` : '';
};

export const getHome = () => apiRequest('/home/');

export const getCategories = async () => (
    collection(await apiRequest('/categories/?page_size=100'))
);

export const getRegions = async () => (
    collection(await apiRequest('/locations/regions/?page_size=100'))
);

export const getListings = async (params = {}) => (
    collection(await apiRequest(`/listings/${queryString({ page_size: 100, ...params })}`))
);

export const getListing = (id) => apiRequest(`/listings/${id}/`, { authenticated: true });

export const getMyListings = async () => (
    collection(await apiRequest('/listings/?mine=true&page_size=100', { authenticated: true }))
);

export const getFavorites = async () => {
    const favorites = collection(await apiRequest('/favorites/?page_size=100', { authenticated: true }));
    return favorites.map((favorite) => ({
        ...favorite.listing,
        favorite_id: favorite.id,
        is_favorited: true,
    }));
};

export const addFavorite = (listingId) => (
    apiRequest(`/favorites/listings/${listingId}/toggle/`, {
        method: 'POST',
        authenticated: true,
    })
);

export const removeFavorite = (listingId) => (
    apiRequest(`/favorites/listings/${listingId}/toggle/`, {
        method: 'DELETE',
        authenticated: true,
    })
);

export const createListing = (formData) => (
    apiRequest('/listings/', {
        method: 'POST',
        authenticated: true,
        body: formData,
    })
);

export const deleteListing = (listingId) => (
    apiRequest(`/listings/${listingId}/`, {
        method: 'DELETE',
        authenticated: true,
    })
);
