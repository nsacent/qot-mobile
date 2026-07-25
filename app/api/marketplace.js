import { apiRequest } from './client';
import { API_BASE_URL } from './client';
import { getSession } from './session';

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

export const getCategoryFilters = async (categorySlug) => (
    collection(await apiRequest(`/categories/${encodeURIComponent(categorySlug)}/filters/?page_size=100`))
);

export const getRegions = async () => (
    collection(await apiRequest('/locations/regions/?page_size=100'))
);

export const getListingsPage = async (params = {}) => {
    const data = await apiRequest(`/listings/${queryString({ page_size: 20, ...params })}`);
    const results = collection(data);
    return {
        results,
        count: Number(data?.count ?? results.length),
        next: data?.next || null,
        previous: data?.previous || null,
    };
};

export const getListings = async (params = {}) => (
    (await getListingsPage({ page_size: 100, ...params })).results
);

export const getListingFacets = (params = {}) => (
    apiRequest(`/listings/facets/${queryString(params)}`)
);

export const createSavedSearch = (name, query, filters = {}) => (
    apiRequest('/searches/saved/', {
        method: 'POST',
        authenticated: true,
        body: {
            name,
            query,
            filters,
            notify_user: true,
        },
    })
);

export const getSavedSearches = async () => (
    collection(await apiRequest('/searches/saved/?page_size=100', { authenticated: true }))
);

export const deleteSavedSearch = (savedSearchId) => (
    apiRequest(`/searches/saved/${savedSearchId}/`, {
        method: 'DELETE',
        authenticated: true,
    })
);

export const updateSavedSearch = (savedSearchId, changes) => (
    apiRequest(`/searches/saved/${savedSearchId}/`, {
        method: 'PATCH',
        authenticated: true,
        body: changes,
    })
);

export const getListing = (id) => apiRequest(`/listings/${id}/`, { authenticated: true });

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

export const getMyListings = async () => {
    try {
        return collection(await apiRequest('/seller/listings/?page_size=100', { authenticated: true }));
    } catch (error) {
        if (error?.status !== 403) throw error;
        return collection(await apiRequest('/listings/?mine=true&page_size=100', { authenticated: true }));
    }
};

export const getOwnedListing = (listingId) => (
    apiRequest(`/seller/listings/${listingId}/`, { authenticated: true })
);

export const getFavorites = async () => {
    const favorites = collection(await apiRequest('/favorites/?page_size=100', { authenticated: true }));
    return favorites.map((favorite) => ({
        ...favorite.listing,
        favorite_id: favorite.id,
        favorite_created_at: favorite.created_at,
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

export const getListingDraft = async () => {
    const result = await apiRequest('/listings/draft/', { authenticated: true });
    return result?.draft || null;
};

export const saveListingDraft = (data, stagedImageIds = []) => (
    apiRequest('/listings/draft/', {
        method: 'PUT',
        authenticated: true,
        body: {
            data,
            staged_image_ids: stagedImageIds,
        },
    })
);

export const clearListingDraft = () => (
    apiRequest('/listings/draft/', {
        method: 'DELETE',
        authenticated: true,
    })
);

export const deleteStagedListingImage = (imageId) => (
    apiRequest(`/listings/images/stage/${imageId}/`, {
        method: 'DELETE',
        authenticated: true,
    })
);

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

export const updateListing = (listingId, formData) => (
    apiRequest(`/seller/listings/${listingId}/`, {
        method: 'PATCH',
        authenticated: true,
        body: formData,
    })
);

export const reorderListingImages = (listingId, imageIds) => (
    apiRequest(`/listings/${listingId}/images/reorder/`, {
        method: 'POST',
        authenticated: true,
        body: { image_ids: imageIds },
    })
);

const listingAction = (listingId, action) => (
    apiRequest(`/listings/${listingId}/${action}/`, {
        method: 'POST',
        authenticated: true,
    })
);

export const markListingSold = (listingId) => listingAction(listingId, 'mark-sold');
export const pauseListing = (listingId) => listingAction(listingId, 'mark-unavailable');
export const resumeListing = (listingId) => listingAction(listingId, 'mark-available');
export const renewListing = (listingId) => listingAction(listingId, 'renew');
export const relistListing = (listingId) => listingAction(listingId, 'relist');

export const deleteListing = (listingId) => (
    apiRequest(`/listings/${listingId}/`, {
        method: 'DELETE',
        authenticated: true,
    })
);
