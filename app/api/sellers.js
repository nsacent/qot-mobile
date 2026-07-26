import { apiRequest } from './client';
import {
    CACHE_TIMES,
    cachedQuery,
    sessionScope,
} from '../cache/queryCache';

const queryString = (params = {}) => {
    const pairs = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return pairs.length ? `?${pairs.join('&')}` : '';
};

const collection = (data) => Array.isArray(data) ? data : (data?.results || []);

export const getSellersPage = ({ search = '', page = 1, pageSize = 18, force = false } = {}) => cachedQuery({
    key: ['account', 'sellers', sessionScope(), String(search || '').trim(), page, pageSize],
    staleTime: CACHE_TIMES.seller,
    scope: 'session',
    force,
    queryFn: async () => {
        const data = await apiRequest(`/sellers/${queryString({
            search: String(search || '').trim(),
            page,
            page_size: pageSize,
        })}`);
        const results = collection(data);

        return {
            results,
            count: Number(data?.count ?? results.length),
            next: data?.next || null,
            previous: data?.previous || null,
        };
    },
});
