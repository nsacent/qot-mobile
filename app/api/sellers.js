import { apiRequest } from './client';

const queryString = (params = {}) => {
    const pairs = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

    return pairs.length ? `?${pairs.join('&')}` : '';
};

const collection = (data) => Array.isArray(data) ? data : (data?.results || []);

export const getSellersPage = async ({ search = '', page = 1, pageSize = 18 } = {}) => {
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
};
