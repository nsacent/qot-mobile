import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
    focusManager,
    onlineManager,
    QueryClient,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { getSession } from '../api/session';

export const CACHE_VERSION = 'qot:v1';

export const CACHE_TIMES = {
    home: 45 * 1000,
    listings: 60 * 1000,
    listing: 2 * 60 * 1000,
    seller: 5 * 60 * 1000,
    account: 30 * 1000,
    chat: 5 * 1000,
    categories: 30 * 60 * 1000,
    regions: 12 * 60 * 60 * 1000,
    categoryFilters: 6 * 60 * 60 * 1000,
};

const DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: CACHE_TIMES.listings,
            gcTime: DAY,
            retry: (failureCount, error) => (
                Number(error?.status || 0) >= 500 && failureCount < 2
            ),
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
});

const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: `${CACHE_VERSION}:query-cache`,
    throttleTime: 1000,
});

export const sessionScope = () => {
    const userId = getSession()?.user?.id;
    return userId ? `user:${userId}` : 'guest';
};

export const cacheKey = (...parts) => [CACHE_VERSION, ...parts];

export const cachedQuery = async ({
    key,
    queryFn,
    staleTime,
    persist = false,
    scope = 'public',
    force = false,
    fallback = true,
}) => {
    const queryKey = cacheKey(...key);
    try {
        return await queryClient.fetchQuery({
            queryKey,
            queryFn,
            staleTime: force ? 0 : staleTime,
            meta: { persist, scope },
        });
    } catch (error) {
        const cached = queryClient.getQueryData(queryKey);
        if (fallback && cached !== undefined) return cached;
        throw error;
    }
};

const invalidateKinds = (domain, kinds) => queryClient.invalidateQueries({
    predicate: (query) => (
        query.queryKey[0] === CACHE_VERSION
        && query.queryKey[1] === domain
        && kinds.includes(query.queryKey[2])
    ),
});

export const invalidateAdCaches = (listingId = null) => {
    const invalidations = [
        invalidateKinds('marketplace', ['home', 'listings', 'listing', 'owned-listing', 'my-listings', 'favorites']),
        invalidateKinds('account', ['dashboard', 'analytics', 'listing-analytics', 'seller', 'seller-listings', 'following-feed']),
    ];
    if (listingId !== null && listingId !== undefined) {
        invalidations.push(queryClient.invalidateQueries({
            queryKey: cacheKey('marketplace', 'listing'),
            predicate: (query) => String(query.queryKey[query.queryKey.length - 1]) === String(listingId),
        }));
    } else {
        invalidations.push(invalidateKinds('marketplace', ['listing', 'owned-listing']));
    }
    return Promise.all(invalidations);
};

export const invalidateDraftCaches = () => (
    invalidateKinds('marketplace', ['draft', 'my-listings'])
);

export const invalidateSavedCaches = () => (
    invalidateKinds('marketplace', ['favorites', 'saved-searches', 'home', 'listings', 'listing'])
);

export const invalidateSellerCaches = (sellerId = null) => Promise.all([
    invalidateKinds('account', ['seller', 'seller-listings', 'followers', 'following', 'following-feed', 'reviews', 'dashboard', 'analytics', 'listing-analytics']),
    invalidateKinds('marketplace', ['home', 'listings', 'listing']),
    sellerId === null ? Promise.resolve() : queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some((value) => String(value) === String(sellerId)),
    }),
]);

export const invalidateChatCaches = () => (
    queryClient.invalidateQueries({ queryKey: cacheKey('chat') })
);

export const clearSessionCache = () => {
    queryClient.removeQueries({
        predicate: (query) => query.meta?.scope === 'session',
    });
};

export const clearQueryCache = async () => {
    queryClient.clear();
    await persister.removeClient();
};

export const QueryCacheProvider = ({ children }) => {
    useEffect(() => {
        const unsubscribeNetwork = onlineManager.setEventListener((setOnline) => (
            NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected)))
        ));
        const appStateSubscription = AppState.addEventListener('change', (state) => {
            focusManager.setFocused(state === 'active');
        });

        return () => {
            unsubscribeNetwork?.();
            appStateSubscription.remove();
        };
    }, []);

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister,
                maxAge: 7 * DAY,
                buster: CACHE_VERSION,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => (
                        query.meta?.persist === true
                        && query.meta?.scope === 'public'
                        && query.state.status === 'success'
                    ),
                },
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
};
