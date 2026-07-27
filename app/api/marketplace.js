import { apiRequest } from './client';
import { API_BASE_URL } from './client';
import { getSession } from './session';
import {
    CACHE_TIMES,
    cachedQuery,
    invalidateAdCaches,
    invalidateDraftCaches,
    invalidateSavedCaches,
    sessionScope,
} from '../cache/queryCache';

const collection = (data) => Array.isArray(data) ? data : (data?.results || []);

const queryString = (params = {}) => {
    const pairs = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return pairs.length ? `?${pairs.join('&')}` : '';
};

export const getHome = ({ force = false } = {}) => cachedQuery({
    key: ['marketplace', 'home', sessionScope()],
    queryFn: () => apiRequest('/home/'),
    staleTime: CACHE_TIMES.home,
    scope: 'session',
    force,
});

export const getCategories = ({ force = false } = {}) => cachedQuery({
    key: ['reference', 'categories'],
    queryFn: async () => collection(await apiRequest('/categories/?page_size=100')),
    staleTime: CACHE_TIMES.categories,
    persist: true,
    force,
});

export const getCategoryFilters = (categorySlug, { force = false } = {}) => cachedQuery({
    key: ['reference', 'category-filters', categorySlug],
    queryFn: async () => collection(await apiRequest(`/categories/${encodeURIComponent(categorySlug)}/filters/?page_size=100`)),
    staleTime: CACHE_TIMES.categoryFilters,
    persist: true,
    force,
});

export const getRegions = ({ force = false } = {}) => cachedQuery({
    key: ['reference', 'regions-with-areas-v2'],
    queryFn: async () => collection(await apiRequest('/locations/regions/?page_size=100')),
    staleTime: CACHE_TIMES.regions,
    persist: true,
    force,
});

export const getListingsPage = async (params = {}) => {
    const { force = false, ...requestParams } = params;
    return cachedQuery({
        key: ['marketplace', 'listings', sessionScope(), requestParams],
        staleTime: CACHE_TIMES.listings,
        scope: 'session',
        force,
        queryFn: async () => {
            const data = await apiRequest(`/listings/${queryString({ page_size: 20, ...requestParams })}`);
            const results = collection(data);
            return {
                results,
                count: Number(data?.count ?? results.length),
                next: data?.next || null,
                previous: data?.previous || null,
            };
        },
    });
};

export const getListings = async (params = {}) => (
    (await getListingsPage({ page_size: 100, ...params })).results
);

export const getListingFacets = (params = {}) => {
    const { force = false, ...requestParams } = params;
    return cachedQuery({
        key: ['marketplace', 'facets', requestParams],
        queryFn: () => apiRequest(`/listings/facets/${queryString(requestParams)}`),
        staleTime: CACHE_TIMES.listings,
        force,
    });
};

export const createSavedSearch = async (name, query, filters = {}) => {
    const result = await apiRequest('/searches/saved/', {
        method: 'POST',
        authenticated: true,
        body: {
            name,
            query,
            filters,
            notify_user: true,
        },
    });
    await invalidateSavedCaches();
    return result;
};

export const getSavedSearches = ({ force = false } = {}) => cachedQuery({
    key: ['marketplace', 'saved-searches', sessionScope()],
    queryFn: async () => collection(await apiRequest('/searches/saved/?page_size=100', { authenticated: true })),
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
});

export const deleteSavedSearch = async (savedSearchId) => {
    const result = await apiRequest(`/searches/saved/${savedSearchId}/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateSavedCaches();
    return result;
};

export const updateSavedSearch = async (savedSearchId, changes) => {
    const result = await apiRequest(`/searches/saved/${savedSearchId}/`, {
        method: 'PATCH',
        authenticated: true,
        body: changes,
    });
    await invalidateSavedCaches();
    return result;
};

export const getListing = (id, { force = false } = {}) => cachedQuery({
    key: ['marketplace', 'listing', sessionScope(), id],
    queryFn: () => apiRequest(`/listings/${id}/`, { authenticated: true }),
    staleTime: CACHE_TIMES.listing,
    scope: 'session',
    force,
});

export const trackListingShare = (listingId) => apiRequest(
    `/listings/${listingId}/share/`,
    { method: 'POST' },
);

export const reportListing = (listingId, { reason, description = '' }) => (
    apiRequest(`/listings/${listingId}/report/`, {
        method: 'POST',
        authenticated: true,
        body: {
            reason,
            description,
        },
    })
);

export const getMyListings = ({ force = false } = {}) => cachedQuery({
    key: ['marketplace', 'my-listings', sessionScope()],
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
    queryFn: async () => {
        try {
            return collection(await apiRequest('/seller/listings/?page_size=100', { authenticated: true }));
        } catch (error) {
            if (error?.status !== 403) throw error;
            return collection(await apiRequest('/listings/?mine=true&page_size=100', { authenticated: true }));
        }
    },
});

export const getOwnedListing = (listingId, { force = false } = {}) => cachedQuery({
    key: ['marketplace', 'owned-listing', sessionScope(), listingId],
    queryFn: () => apiRequest(`/seller/listings/${listingId}/`, { authenticated: true }),
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
});

export const getFavorites = ({ force = false } = {}) => cachedQuery({
    key: ['marketplace', 'favorites', sessionScope()],
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
    queryFn: async () => {
        const favorites = collection(await apiRequest('/favorites/?page_size=100', { authenticated: true }));
        return favorites.map((favorite) => ({
            ...favorite.listing,
            favorite_id: favorite.id,
            favorite_created_at: favorite.created_at,
            is_favorited: true,
        }));
    },
});

export const addFavorite = async (listingId) => {
    const result = await apiRequest(`/favorites/listings/${listingId}/toggle/`, {
        method: 'POST',
        authenticated: true,
    });
    await invalidateSavedCaches();
    return result;
};

export const removeFavorite = async (listingId) => {
    const result = await apiRequest(`/favorites/listings/${listingId}/toggle/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateSavedCaches();
    return result;
};

export const createListing = async (formData) => {
    const result = await apiRequest('/listings/', {
        method: 'POST',
        authenticated: true,
        body: formData,
    });
    await invalidateAdCaches();
    await invalidateDraftCaches();
    return result;
};

export const getListingDraft = ({ force = false } = {}) => cachedQuery({
    key: ['marketplace', 'draft', sessionScope()],
    staleTime: 5 * 1000,
    scope: 'session',
    force,
    fallback: false,
    queryFn: async () => {
        const result = await apiRequest('/listings/draft/', { authenticated: true });
        return result?.draft || null;
    },
});

export const saveListingDraft = async (data, stagedImageIds = []) => {
    const result = await apiRequest('/listings/draft/', {
        method: 'PUT',
        authenticated: true,
        body: {
            data,
            staged_image_ids: stagedImageIds,
        },
    });
    await invalidateDraftCaches();
    return result;
};

export const clearListingDraft = async () => {
    const result = await apiRequest('/listings/draft/', {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateDraftCaches();
    return result;
};

export const deleteStagedListingImage = async (imageId) => {
    const result = await apiRequest(`/listings/images/stage/${imageId}/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateDraftCaches();
    return result;
};

const uploadErrorMessage = (data) => {
    if (!data) return 'The photo could not be uploaded.';
    if (typeof data.detail === 'string') return data.detail;
    for (const value of Object.values(data)) {
        if (typeof value === 'string') return value;
        if (Array.isArray(value) && value.length) return String(value[0]);
    }
    return 'The photo could not be uploaded.';
};

export const stageListingImage = (asset, onProgress = () => {}) => new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('image', {
        uri: asset.uri,
        name: asset.fileName || 'qot-photo.jpg',
        type: asset.mimeType || 'image/jpeg',
    });

    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}/listings/images/stage/`);
    request.setRequestHeader('Accept', 'application/json');
    const access = getSession()?.tokens?.access;
    if (access) request.setRequestHeader('Authorization', `Bearer ${access}`);

    request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress(Math.max(1, Math.min(99, Math.round((event.loaded / event.total) * 100))));
    };
    request.onerror = () => reject(new Error('Could not reach QOT. Check your internet connection and try again.'));
    request.onload = () => {
        let data = null;
        try {
            data = request.responseText ? JSON.parse(request.responseText) : null;
        } catch {
            data = null;
        }
        if (request.status >= 200 && request.status < 300) {
            onProgress(100);
            resolve(data);
            return;
        }
        reject(new Error(uploadErrorMessage(data)));
    };
    request.send(formData);
});

export const updateListing = async (listingId, formData) => {
    const result = await apiRequest(`/seller/listings/${listingId}/`, {
        method: 'PATCH',
        authenticated: true,
        body: formData,
    });
    await invalidateAdCaches(listingId);
    return result;
};

export const reorderListingImages = async (listingId, imageIds) => {
    const result = await apiRequest(`/listings/${listingId}/images/reorder/`, {
        method: 'POST',
        authenticated: true,
        body: { image_ids: imageIds },
    });
    await invalidateAdCaches(listingId);
    return result;
};

const listingAction = async (listingId, action) => {
    const result = await apiRequest(`/listings/${listingId}/${action}/`, {
        method: 'POST',
        authenticated: true,
    });
    await invalidateAdCaches(listingId);
    return result;
};

export const markListingSold = (listingId) => listingAction(listingId, 'mark-sold');
export const pauseListing = (listingId) => listingAction(listingId, 'mark-unavailable');
export const resumeListing = (listingId) => listingAction(listingId, 'mark-available');
export const renewListing = (listingId) => listingAction(listingId, 'renew');
export const relistListing = (listingId) => listingAction(listingId, 'relist');

export const deleteListing = async (listingId) => {
    const result = await apiRequest(`/listings/${listingId}/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateAdCaches(listingId);
    return result;
};
