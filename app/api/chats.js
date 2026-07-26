import { apiRequest, API_BASE_URL } from './client';
import { getSession } from './session';
import {
    CACHE_TIMES,
    cachedQuery,
    invalidateChatCaches,
    sessionScope,
} from '../cache/queryCache';

const collection = (data) => (
    Array.isArray(data) ? data : (data?.results || data?.messages || data?.threads || [])
);

const apiOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const websocketOrigin = apiOrigin.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

const queryString = (params = {}) => {
    const query = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return query ? `?${query}` : '';
};

export const getChatThreads = async ({ folder = 'all', search = '' } = {}) => {
    return cachedQuery({
        key: ['chat', 'threads', sessionScope(), folder, search.trim()],
        staleTime: CACHE_TIMES.chat,
        scope: 'session',
        queryFn: async () => {
            const data = await apiRequest(`/chats/threads/${queryString({
                filter: folder,
                search: search.trim(),
                page_size: 100,
            })}`, { authenticated: true });

            return {
                threads: collection(data),
                tabs: data?.tabs || {},
            };
        },
    });
};

export const getChatThread = (threadId) => cachedQuery({
    key: ['chat', 'thread', sessionScope(), threadId],
    queryFn: () => apiRequest(`/chats/threads/${threadId}/`, { authenticated: true }),
    staleTime: CACHE_TIMES.chat,
    scope: 'session',
});

export const createChatThread = async (listingId, initialMessage = 'Hi, is this ad still available?') => {
    const result = await apiRequest('/chats/threads/', {
        method: 'POST',
        authenticated: true,
        body: {
            listing_id: listingId,
            ...(initialMessage?.trim() ? { initial_message: initialMessage.trim() } : {}),
        },
    });
    await invalidateChatCaches();
    return result;
};

export const getChatMessages = (threadId) => cachedQuery({
    key: ['chat', 'messages', sessionScope(), threadId],
    queryFn: async () => collection(await apiRequest(`/chats/threads/${threadId}/messages/?page_size=100`, {
        authenticated: true,
    })),
    staleTime: CACHE_TIMES.chat,
    scope: 'session',
});

export const sendChatMessage = async (threadId, body, replyToId = null) => {
    const result = await apiRequest(`/chats/threads/${threadId}/messages/`, {
        method: 'POST',
        authenticated: true,
        body: {
            message_type: 'text',
            body: body.trim(),
            ...(replyToId ? { reply_to: replyToId } : {}),
        },
    });
    await invalidateChatCaches();
    return result;
};

export const sendChatOffer = async (threadId, amount, note = '') => {
    const result = await apiRequest(`/chats/threads/${threadId}/messages/`, {
        method: 'POST',
        authenticated: true,
        body: {
            message_type: 'offer',
            offer_amount: amount,
            ...(note.trim() ? { body: note.trim() } : {}),
        },
    });
    await invalidateChatCaches();
    return result;
};

export const updateChatOffer = async (threadId, messageId, action) => {
    const result = await apiRequest(`/chats/threads/${threadId}/messages/${messageId}/offer/`, {
        method: 'POST',
        authenticated: true,
        body: { action },
    });
    await invalidateChatCaches();
    return result;
};

export const sendChatAttachments = async (threadId, assets, message = '', replyToId = null) => {
    const formData = new FormData();
    formData.append('message', message.trim());
    if (replyToId) formData.append('reply_to', String(replyToId));

    assets.forEach((asset) => {
        formData.append('files', {
            uri: asset.uri,
            name: asset.name || `attachment-${Date.now()}`,
            type: asset.mimeType || 'application/octet-stream',
        });
    });

    const result = await apiRequest(`/chats/threads/${threadId}/attachments/`, {
        method: 'POST',
        authenticated: true,
        body: formData,
    });
    await invalidateChatCaches();
    return result;
};

export const deleteChatMessage = async (threadId, messageId) => {
    const result = await apiRequest(`/chats/threads/${threadId}/messages/${messageId}/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateChatCaches();
    return result;
};

export const deleteChatThread = async (threadId) => {
    const result = await apiRequest(`/chats/threads/${threadId}/`, {
        method: 'DELETE',
        authenticated: true,
    });
    await invalidateChatCaches();
    return result;
};

export const blockChatUser = async (threadId, reason = '') => {
    const result = await apiRequest(`/chats/threads/${threadId}/block/`, {
        method: 'POST',
        authenticated: true,
        body: reason ? { reason } : {},
    });
    await invalidateChatCaches();
    return result;
};

export const unblockChatUser = async (threadId) => {
    const result = await apiRequest(`/chats/threads/${threadId}/unblock/`, {
        method: 'POST',
        authenticated: true,
        body: {},
    });
    await invalidateChatCaches();
    return result;
};

export const markChatRead = async (threadId) => {
    const result = await apiRequest(`/chats/threads/${threadId}/mark-read/`, {
        method: 'POST',
        authenticated: true,
    });
    await invalidateChatCaches();
    return result;
};

export const updateChatState = async (threadId, changes) => {
    const result = await apiRequest(`/chats/threads/${threadId}/state/`, {
        method: 'PATCH',
        authenticated: true,
        body: changes,
    });
    await invalidateChatCaches();
    return result;
};

export const reportChat = async (threadId, reason = 'spam', description = '') => {
    const result = await apiRequest(`/chats/threads/${threadId}/report/`, {
        method: 'POST',
        authenticated: true,
        body: { reason, description },
    });
    await invalidateChatCaches();
    return result;
};

export const getChatSocketTicket = () => (
    apiRequest('/chats/socket-ticket/', { authenticated: true })
);

export const buildChatSocketUrl = (path, ticket) => (
    `${websocketOrigin}${path}?ticket=${encodeURIComponent(ticket)}`
);

export const resolveChatFileUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getChatFileHeaders = () => {
    const access = getSession()?.tokens?.access;
    return access ? { Authorization: `Bearer ${access}` } : {};
};
