import { apiRequest, API_BASE_URL } from './client';
import { getSession } from './session';

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
    const data = await apiRequest(`/chats/threads/${queryString({
        filter: folder,
        search: search.trim(),
        page_size: 100,
    })}`, { authenticated: true });

    return {
        threads: collection(data),
        tabs: data?.tabs || {},
    };
};

export const getChatThread = (threadId) => (
    apiRequest(`/chats/threads/${threadId}/`, { authenticated: true })
);

export const createChatThread = (listingId, initialMessage = 'Hi, is this ad still available?') => (
    apiRequest('/chats/threads/', {
        method: 'POST',
        authenticated: true,
        body: {
            listing_id: listingId,
            ...(initialMessage?.trim() ? { initial_message: initialMessage.trim() } : {}),
        },
    })
);

export const getChatMessages = async (threadId) => (
    collection(await apiRequest(`/chats/threads/${threadId}/messages/?page_size=100`, {
        authenticated: true,
    }))
);

export const sendChatMessage = (threadId, body, replyToId = null) => (
    apiRequest(`/chats/threads/${threadId}/messages/`, {
        method: 'POST',
        authenticated: true,
        body: {
            message_type: 'text',
            body: body.trim(),
            ...(replyToId ? { reply_to: replyToId } : {}),
        },
    })
);

export const sendChatOffer = (threadId, amount, note = '') => (
    apiRequest(`/chats/threads/${threadId}/messages/`, {
        method: 'POST',
        authenticated: true,
        body: {
            message_type: 'offer',
            offer_amount: amount,
            ...(note.trim() ? { body: note.trim() } : {}),
        },
    })
);

export const updateChatOffer = (threadId, messageId, action) => (
    apiRequest(`/chats/threads/${threadId}/messages/${messageId}/offer/`, {
        method: 'POST',
        authenticated: true,
        body: { action },
    })
);

export const sendChatAttachments = (threadId, assets, message = '', replyToId = null) => {
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

    return apiRequest(`/chats/threads/${threadId}/attachments/`, {
        method: 'POST',
        authenticated: true,
        body: formData,
    });
};

export const deleteChatMessage = (threadId, messageId) => (
    apiRequest(`/chats/threads/${threadId}/messages/${messageId}/`, {
        method: 'DELETE',
        authenticated: true,
    })
);

export const deleteChatThread = (threadId) => (
    apiRequest(`/chats/threads/${threadId}/`, {
        method: 'DELETE',
        authenticated: true,
    })
);

export const blockChatUser = (threadId, reason = '') => (
    apiRequest(`/chats/threads/${threadId}/block/`, {
        method: 'POST',
        authenticated: true,
        body: reason ? { reason } : {},
    })
);

export const unblockChatUser = (threadId) => (
    apiRequest(`/chats/threads/${threadId}/unblock/`, {
        method: 'POST',
        authenticated: true,
        body: {},
    })
);

export const markChatRead = (threadId) => (
    apiRequest(`/chats/threads/${threadId}/mark-read/`, {
        method: 'POST',
        authenticated: true,
    })
);

export const updateChatState = (threadId, changes) => (
    apiRequest(`/chats/threads/${threadId}/state/`, {
        method: 'PATCH',
        authenticated: true,
        body: changes,
    })
);

export const reportChat = (threadId, reason = 'spam', description = '') => (
    apiRequest(`/chats/threads/${threadId}/report/`, {
        method: 'POST',
        authenticated: true,
        body: { reason, description },
    })
);

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
