import { apiRequest } from './client';
import {
    CACHE_TIMES,
    cachedQuery,
    invalidateSellerCaches,
    queryClient,
    cacheKey,
    sessionScope,
} from '../cache/queryCache';

const collection = (data) => Array.isArray(data) ? data : (data?.results || []);

export const getSellerDashboard = ({ force = false } = {}) => cachedQuery({
    key: ['account', 'dashboard', sessionScope()],
    queryFn: () => apiRequest('/seller/dashboard/', { authenticated: true }),
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
});

export const getSellerAnalytics = ({ force = false } = {}) => cachedQuery({
    key: ['account', 'analytics', sessionScope()],
    queryFn: () => apiRequest('/seller/analytics/', { authenticated: true }),
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
});

export const getListingAnalytics = (listingId, { force = false } = {}) => cachedQuery({
    key: ['account', 'listing-analytics', sessionScope(), listingId],
    queryFn: () => apiRequest(`/seller/listings/${listingId}/analytics/`, { authenticated: true }),
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
});

export const updateProfile = async (body) => {
    const result = await apiRequest('/auth/me/', {
        method: 'PATCH',
        authenticated: true,
        body,
    });
    await invalidateSellerCaches(result?.id);
    queryClient.invalidateQueries({ queryKey: cacheKey('account') });
    return result;
};

export const getFollowers = (userId, { force = false } = {}) => cachedQuery({
    key: ['account', 'followers', sessionScope(), userId],
    queryFn: async () => collection(await apiRequest(`/sellers/${userId}/followers/?page_size=100`)),
    staleTime: CACHE_TIMES.seller,
    scope: 'session',
    force,
});

export const getFollowing = (userId, { force = false } = {}) => cachedQuery({
    key: ['account', 'following', sessionScope(), userId],
    queryFn: async () => collection(await apiRequest(`/sellers/${userId}/following/?page_size=100`)),
    staleTime: CACHE_TIMES.seller,
    scope: 'session',
    force,
});

export const getFollowingFeed = (userId, { force = false } = {}) => cachedQuery({
    key: ['account', 'following-feed', sessionScope(), userId],
    staleTime: CACHE_TIMES.listings,
    scope: 'session',
    force,
    queryFn: async () => {
        const sellers = await getFollowing(userId, { force });
        if (!sellers.length) return { sellers: [], listings: [], partial: false };

        try {
            const feed = collection(await apiRequest('/sellers/following-feed/?page_size=100', { authenticated: true }));
            return { sellers, listings: feed, partial: false };
        } catch (error) {
            if (error?.status !== 404) throw error;
        }

        const responses = await Promise.allSettled(sellers.map(async (seller) => {
            const listings = await getSellerListings(seller.id, { force });
            return listings.map((listing) => ({ ...listing, feed_seller: seller }));
        }));
        const listings = responses
            .filter((response) => response.status === 'fulfilled')
            .flatMap((response) => response.value)
            .filter((listing, index, all) => all.findIndex((item) => String(item.id) === String(listing.id)) === index)
            .sort((first, second) => new Date(second.created_at || 0).getTime() - new Date(first.created_at || 0).getTime());
        const failedCount = responses.filter((response) => response.status === 'rejected').length;

        if (failedCount === responses.length) throw responses[0].reason;
        return { sellers, listings, partial: failedCount > 0 };
    },
});

export const getSeller = (userId, { force = false } = {}) => cachedQuery({
    key: ['account', 'seller', sessionScope(), userId],
    queryFn: () => apiRequest(`/sellers/${userId}/`, { authenticated: true }),
    staleTime: CACHE_TIMES.seller,
    scope: 'session',
    force,
});

export const getSellerListings = (userId, { force = false } = {}) => cachedQuery({
    key: ['account', 'seller-listings', sessionScope(), userId],
    queryFn: async () => collection(await apiRequest(`/sellers/${userId}/listings/?page_size=100`)),
    staleTime: CACHE_TIMES.listings,
    scope: 'session',
    force,
});

export const followSeller = async (userId) => {
    const result = await apiRequest(`/sellers/${userId}/follow/`, {
        method: 'POST',
        authenticated: true,
    });
    await invalidateSellerCaches(userId);
    return result;
};

export const unfollowSeller = async (userId) => {
    const result = await apiRequest(`/sellers/${userId}/follow/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateSellerCaches(userId);
    return result;
};

export const requestPasswordReset = (email) => (
    apiRequest('/auth/password-reset/request/', {
        method: 'POST',
        body: { email: String(email || '').trim() },
    })
);

export const getNotifications = (params = '?page_size=100', options = {}) => {
    const requestParams = typeof params === 'string' ? params : '?page_size=100';
    const { force = false } = typeof params === 'object' ? params : options;
    return cachedQuery({
        key: ['account', 'notifications', sessionScope(), requestParams],
        queryFn: async () => collection(await apiRequest(`/notifications/${requestParams}`, { authenticated: true })),
        staleTime: 10 * 1000,
        scope: 'session',
        force,
    });
};

export const markNotificationRead = async (notificationId) => {
    const result = await apiRequest(`/notifications/${notificationId}/read/`, {
        method: 'POST',
        authenticated: true,
    });
    await queryClient.invalidateQueries({ queryKey: cacheKey('account', 'notifications') });
    return result;
};

export const markAllNotificationsRead = async () => {
    const result = await apiRequest('/notifications/read-all/', {
        method: 'POST',
        authenticated: true,
    });
    await queryClient.invalidateQueries({ queryKey: cacheKey('account', 'notifications') });
    return result;
};

export const getMyReviews = ({ force = false } = {}) => cachedQuery({
    key: ['account', 'reviews', sessionScope(), 'mine'],
    queryFn: async () => collection(await apiRequest('/reviews/me/?page_size=100', { authenticated: true })),
    staleTime: CACHE_TIMES.account,
    scope: 'session',
    force,
});

export const getSellerReviews = (sellerId, { force = false } = {}) => cachedQuery({
    key: ['account', 'reviews', 'seller', sellerId],
    queryFn: async () => collection(await apiRequest(`/reviews/sellers/${sellerId}/?page_size=100`)),
    staleTime: CACHE_TIMES.seller,
    force,
});

export const getSellerReviewSummary = (sellerId, { force = false } = {}) => cachedQuery({
    key: ['account', 'reviews', 'summary', sellerId],
    queryFn: () => apiRequest(`/reviews/sellers/${sellerId}/summary/`),
    staleTime: CACHE_TIMES.seller,
    force,
});

export const createSellerReview = async ({ sellerId, listingId, rating, comment }) => {
    const result = await apiRequest('/reviews/', {
        method: 'POST',
        authenticated: true,
        body: {
            seller: sellerId,
            listing: listingId,
            rating,
            comment: String(comment || '').trim(),
        },
    });
    await invalidateSellerCaches(sellerId);
    return result;
};
