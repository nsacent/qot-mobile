import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import SearchBar from '../../components/SearchBar';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES, FONTS, COLORS } from '../../constants/theme';
import CategoryList from './CategoryList';
import LatestAds from './LatestAds';
import { getCategories, getHome, getListingsPage } from '../../api/marketplace';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
    clearRecentSearches,
    getRecentSearches,
    recentSearchLabel,
    recordRecentSearch,
    removeRecentSearch,
} from '../../utils/recentSearches';
import useBottomTabContentPadding from '../../utils/useBottomTabContentPadding';

const emptyHome = {
    featured_listings: [],
    latest_listings: [],
    popular_categories: [],
};

const HOME_AD_PAGE_SIZE = 20;
const HOME_AD_LIMIT = 200;

const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const bottomContentPadding = useBottomTabContentPadding(80);
    const { unreadCount, refreshNotifications } = useNotifications();
    const { isAuthenticated } = useAuth();
    const [home, setHome] = useState(emptyHome);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [latestAds, setLatestAds] = useState([]);
    const [loadingMoreAds, setLoadingMoreAds] = useState(false);
    const [hasMoreAds, setHasMoreAds] = useState(true);
    const [loadMoreError, setLoadMoreError] = useState('');
    const latestAdsRef = useRef([]);
    const latestPageRef = useRef(1);
    const loadingMoreAdsRef = useRef(false);
    const hasMoreAdsRef = useRef(true);

    const loadHome = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [homeData, categoryData, latestPage] = await Promise.all([
                getHome({ force: refresh }),
                getCategories({ force: refresh }),
                getListingsPage({ sort: 'newest', page: 1, page_size: HOME_AD_PAGE_SIZE, force: refresh }),
            ]);
            setHome(homeData);
            const firstLatestAds = latestPage.results.slice(0, HOME_AD_LIMIT);
            latestAdsRef.current = firstLatestAds;
            latestPageRef.current = 1;
            hasMoreAdsRef.current = Boolean(latestPage.next) && firstLatestAds.length < HOME_AD_LIMIT;
            setLatestAds(firstLatestAds);
            setHasMoreAds(hasMoreAdsRef.current);
            setLoadMoreError('');
            const popularOrder = new Map((homeData.popular_categories || []).map((category, index) => [category.id, index]));
            setCategories([...categoryData].sort((a, b) => (
                (popularOrder.get(a.id) ?? 999) - (popularOrder.get(b.id) ?? 999)
            )));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const loadMoreLatestAds = useCallback(async () => {
        if (loadingMoreAdsRef.current || !hasMoreAdsRef.current || latestAdsRef.current.length >= HOME_AD_LIMIT) return;

        loadingMoreAdsRef.current = true;
        setLoadingMoreAds(true);
        setLoadMoreError('');
        try {
            const nextPage = latestPageRef.current + 1;
            const result = await getListingsPage({
                sort: 'newest',
                page: nextPage,
                page_size: HOME_AD_PAGE_SIZE,
            });
            const knownIds = new Set(latestAdsRef.current.map((item) => String(item.id)));
            const newAds = result.results.filter((item) => !knownIds.has(String(item.id)));
            const merged = [...latestAdsRef.current, ...newAds].slice(0, HOME_AD_LIMIT);

            latestAdsRef.current = merged;
            latestPageRef.current = nextPage;
            hasMoreAdsRef.current = Boolean(result.next) && merged.length < HOME_AD_LIMIT;
            setLatestAds(merged);
            setHasMoreAds(hasMoreAdsRef.current);
        } catch (requestError) {
            setLoadMoreError(requestError.message || 'Could not load more ads.');
        } finally {
            loadingMoreAdsRef.current = false;
            setLoadingMoreAds(false);
        }
    }, []);

    const handleHomeScroll = useCallback(({ nativeEvent }) => {
        const distanceFromBottom = nativeEvent.contentSize.height
            - nativeEvent.layoutMeasurement.height
            - nativeEvent.contentOffset.y;
        if (distanceFromBottom < 700) loadMoreLatestAds();
    }, [loadMoreLatestAds]);

    useEffect(() => {
        loadHome();
    }, [loadHome]);

    useEffect(() => (
        navigation.addListener('focus', () => {
            refreshNotifications().catch(() => {});
            getRecentSearches().then(setRecentSearches);
        })
    ), [navigation, refreshNotifications]);

    useEffect(() => {
        getRecentSearches().then(setRecentSearches);
    }, []);

    const refreshHome = async () => {
        await Promise.allSettled([loadHome(true), refreshNotifications()]);
    };

    const submitSearch = async () => {
        const query = search.trim();
        if (!query) return;
        setRecentSearches(await recordRecentSearch({ query }));
        navigation.navigate('Items', { cat: `Results for “${query}”`, searchQuery: query });
    };

    const openRecentSearch = (item) => {
        setSearch(item.query || '');
        navigation.navigate('Items', {
            cat: item.categoryName || (item.query ? `Results for “${item.query}”` : 'All ads'),
            categorySlug: item.categorySlug || undefined,
            searchQuery: item.query || '',
            savedFilters: {
                ...(item.filters || {}),
                city: item.cityId || item.citySlug || undefined,
            },
        });
    };

    const removeSearch = async (searchId) => {
        setRecentSearches(await removeRecentSearch(searchId));
    };

    const clearSearchHistory = async () => {
        await clearRecentSearches();
        setRecentSearches([]);
    };

    const openNearbyAds = () => {
        navigation.navigate('Items', {
            cat: 'Ads near you',
            nearby: true,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 5, backgroundColor: colors.card }] }>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <SearchBar
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={submitSearch}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ height: 46, width: 42, alignItems: 'center', justifyContent: 'center', marginLeft: 2 }}
                        onPress={() => navigation.navigate('NotificationsCenter')}
                        accessibilityLabel="Open notifications"
                    >
                        <FeatherIcon name="bell" size={21} color={colors.title} />
                        {unreadCount > 0 && (
                            <View style={{ position: 'absolute', top: 3, right: 1, minWidth: 17, height: 17, borderRadius: 9, paddingHorizontal: 4, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: COLORS.white, fontSize: 8, lineHeight: 10, fontFamily: 'PoppinsSemiBold' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ padding: 12, marginLeft: 1 }}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image
                            style={{ height: 20, width: 20, resizeMode: 'contain', tintColor: colors.title }}
                            source={IMAGES.hamburger}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading QOT...</Text>
                </View>
            ) : (
                <ScrollView
                    style={{ backgroundColor: colors.background }}
                    onScroll={handleHomeScroll}
                    scrollEventThrottle={200}
                    refreshControl={(
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refreshHome}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    )}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomContentPadding }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[GlobalStyleSheet.container, { paddingTop: 10, flex: 1 }] }>
                        {Boolean(error) && (
                            <TouchableOpacity
                                onPress={() => loadHome()}
                                style={{ backgroundColor: '#FDECEC', borderRadius: 12, padding: 14, marginBottom: 15 }}
                            >
                                <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }] }>
                                    {error} Tap to retry.
                                </Text>
                            </TouchableOpacity>
                        )}

                        {recentSearches.length > 0 && (
                            <View style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 9 }}>
                                    <FeatherIcon name="clock" size={15} color={COLORS.primary} />
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flex: 1, marginLeft: 7 }]}>Recent searches</Text>
                                    <TouchableOpacity onPress={clearSearchHistory} hitSlop={8}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>Clear all</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 10 }}>
                                    {recentSearches.map((item) => (
                                        <View key={item.id} style={{ minHeight: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, marginRight: 8, flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => openRecentSearch(item)} style={{ minHeight: 38, paddingLeft: 12, paddingRight: 7, flexDirection: 'row', alignItems: 'center' }}>
                                                <FeatherIcon name="search" size={13} color={COLORS.primary} />
                                                <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, maxWidth: 145, marginLeft: 6 }]}>{recentSearchLabel(item)}</Text>
                                                {item.cityName ? <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9, marginLeft: 5 }]}>· {item.cityName}</Text> : null}
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => removeSearch(item.id)} hitSlop={5} accessibilityLabel={`Remove ${recentSearchLabel(item)} from recent searches`} style={{ height: 38, width: 30, alignItems: 'center', justifyContent: 'center' }}>
                                                <FeatherIcon name="x" size={14} color={colors.textLight} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                            <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.title, flex: 1 }}>
                                Browse categories
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Categories')}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Text style={[FONTS.fontSm, { color: COLORS.primary }]}>View all</Text>
                                <FeatherIcon size={16} color={COLORS.primary} name="chevron-right" />
                            </TouchableOpacity>
                        </View>
                        <CategoryList categories={categories.length ? categories : (home.popular_categories || [])} />

                        <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                            <TouchableOpacity
                                onPress={openNearbyAds}
                                activeOpacity={0.84}
                                style={{ flex: 1, minHeight: 72, borderRadius: 14, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View style={{ height: 32, width: 32, borderRadius: 10, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="map-pin" size={15} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title }]}>Ads near me</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, fontSize: 8, marginTop: 2 }]}>Use current location</Text>
                                </View>
                                <FeatherIcon name="chevron-right" size={15} color={colors.textLight} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => isAuthenticated ? navigation.navigate('FollowingFeed') : navigation.navigate('SignIn')}
                                activeOpacity={0.84}
                                style={{ flex: 1, minHeight: 72, borderRadius: 14, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' }}
                            >
                                <View style={{ height: 32, width: 32, borderRadius: 10, backgroundColor: '#FFF2E8', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="user-check" size={15} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
                                <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title }]}>For You</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, fontSize: 8, marginTop: 2 }]}>Sellers you follow</Text>
                                </View>
                                <FeatherIcon name="chevron-right" size={15} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginHorizontal: -15, marginTop: 18, flex: 1 }}>
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderTopLeftRadius: 25,
                                    borderTopRightRadius: 25,
                                    flex: 1,
                                    paddingHorizontal: 15,
                                    paddingVertical: 15,
                                }}
                            >
                                {Boolean(home.featured_listings?.length) && (
                                    <>
                                        <Text style={[FONTS.h6, { color: colors.title }]}>Featured Ads</Text>
                                        <LatestAds items={home.featured_listings} horizontal />
                                    </>
                                )}

                                <Text style={[FONTS.h6, { color: colors.title, marginTop: 4 }]}>Latest Ads</Text>
                                <LatestAds items={latestAds} />

                                {!latestAds.length && !error && (
                                    <Text style={[FONTS.font, { color: colors.text, textAlign: 'center', paddingVertical: 30 }] }>
                                        No active listings yet.
                                    </Text>
                                )}
                                {loadingMoreAds && (
                                    <View style={{ alignItems: 'center', paddingVertical: 18 }}>
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                        <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 7 }]}>Loading more ads…</Text>
                                    </View>
                                )}
                                {Boolean(loadMoreError) && (
                                    <TouchableOpacity onPress={loadMoreLatestAds} style={{ alignSelf: 'center', borderRadius: 18, borderWidth: 1, borderColor: `${COLORS.primary}45`, backgroundColor: `${COLORS.primary}0D`, paddingHorizontal: 15, paddingVertical: 9, marginVertical: 10 }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>{loadMoreError} Tap to retry.</Text>
                                    </TouchableOpacity>
                                )}
                                {!hasMoreAds && latestAds.length > HOME_AD_PAGE_SIZE && (
                                    <Text style={[FONTS.fontXs, { color: colors.textLight, textAlign: 'center', paddingVertical: 14 }]}>Showing the latest {latestAds.length} ads</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default HomeScreen;
