import { apiRequest } from './client';

const collection = (data) => Array.isArray(data) ? data : (data?.results || []);

export const getSellerDashboard = () => (
    apiRequest('/seller/dashboard/', { authenticated: true })
);

export const getSellerAnalytics = () => (
    apiRequest('/seller/analytics/', { authenticated: true })
);

export const getListingAnalytics = (listingId) => (
    apiRequest(`/seller/listings/${listingId}/analytics/`, { authenticated: true })
);

export const updateProfile = (body) => (
    apiRequest('/auth/me/', {
        method: 'PATCH',
        authenticated: true,
        body,
    })
);

export const getFollowers = async (userId) => (
    collection(await apiRequest(`/sellers/${userId}/followers/?page_size=100`))
);

export const getFollowing = async (userId) => (
    collection(await apiRequest(`/sellers/${userId}/following/?page_size=100`))
);

export const getFollowingFeed = async (userId) => {
    const sellers = await getFollowing(userId);
    if (!sellers.length) return { sellers: [], listings: [], partial: false };

    try {
        const feed = collection(await apiRequest('/sellers/following-feed/?page_size=100', { authenticated: true }));
        return { sellers, listings: feed, partial: false };
    } catch (error) {
        if (error?.status !== 404) throw error;
    }

    const responses = await Promise.allSettled(sellers.map(async (seller) => {
        const listings = await getSellerListings(seller.id);
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
};

export const getSeller = (userId) => (
    apiRequest(`/sellers/${userId}/`, { authenticated: true })
);

export const getSellerListings = async (userId) => (
    collection(await apiRequest(`/sellers/${userId}/listings/?page_size=100`))
);

export const followSeller = (userId) => (
    apiRequest(`/sellers/${userId}/follow/`, {
        method: 'POST',
        authenticated: true,
    })
);

export const unfollowSeller = (userId) => (
    apiRequest(`/sellers/${userId}/follow/`, {
        method: 'DELETE',
        authenticated: true,
    })
);

export const requestPasswordReset = (email) => (
    apiRequest('/auth/password-reset/request/', {
        method: 'POST',
        body: { email: String(email || '').trim() },
    })
);

export const getNotifications = async (params = '?page_size=100') => (
    collection(await apiRequest(`/notifications/${params}`, { authenticated: true }))
);

export const markNotificationRead = (notificationId) => (
    apiRequest(`/notifications/${notificationId}/read/`, {
        method: 'POST',
        authenticated: true,
    })
);

export const markAllNotificationsRead = () => (
    apiRequest('/notifications/read-all/', {
        method: 'POST',
        authenticated: true,
    })
);

export const getMyReviews = async () => (
    collection(await apiRequest('/reviews/me/?page_size=100', { authenticated: true }))
);

export const getSellerReviews = async (sellerId) => (
    collection(await apiRequest(`/reviews/sellers/${sellerId}/?page_size=100`))
);

export const getSellerReviewSummary = (sellerId) => (
    apiRequest(`/reviews/sellers/${sellerId}/summary/`)
);

export const createSellerReview = ({ sellerId, listingId, rating, comment }) => (
    apiRequest('/reviews/', {
        method: 'POST',
        authenticated: true,
        body: {
            seller: sellerId,
            listing: listingId,
            rating,
            comment: String(comment || '').trim(),
        },
    })
);
