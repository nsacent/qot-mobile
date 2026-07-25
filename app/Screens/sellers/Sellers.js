import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    RefreshControl,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { getSellersPage } from '../../api/sellers';

const compactNumber = (value) => {
    const number = Number(value || 0);
    if (number < 1000) return String(number);
    if (number < 1000000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
    return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
};

const sellerName = (seller) => seller?.business_name || seller?.full_name || 'QOT seller';

const sellerLocation = (seller) => {
    if (seller?.city_name && seller?.region_name) return `${seller.city_name}, ${seller.region_name}`;
    return seller?.city_name || seller?.region_name || 'Uganda';
};

const Sellers = ({ navigation }) => {
    const { colors } = useTheme();
    const requestId = useRef(0);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [sellers, setSellers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const loadSellers = useCallback(async ({ searchTerm = query, pageNumber = 1, append = false, refresh = false } = {}) => {
        const currentRequest = ++requestId.current;
        if (refresh) setRefreshing(true);
        else if (append) setLoadingMore(true);
        else {
            setLoading(true);
            setSellers([]);
        }
        setError('');

        try {
            const data = await getSellersPage({ search: searchTerm, page: pageNumber });
            if (currentRequest !== requestId.current) return;

            // The API owns the directory rules and ranking. This guard prevents stale
            // or cached responses from displaying sellers outside those rules.
            const eligible = data.results.filter((seller) => (
                Boolean(seller.is_verified) && Number(seller.average_rating || 0) >= 3.5
            ));
            setSellers((current) => {
                if (!append) return eligible;
                const ids = new Set(current.map((seller) => String(seller.id)));
                return [...current, ...eligible.filter((seller) => !ids.has(String(seller.id)))];
            });
            setTotal(data.count);
            setPage(pageNumber);
            setNextPage(data.next);
        } catch (requestError) {
            if (currentRequest === requestId.current) {
                setError(requestError.message || 'Sellers could not be loaded.');
            }
        } finally {
            if (currentRequest === requestId.current) {
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
            }
        }
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => setQuery(search.trim()), 450);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        loadSellers({ searchTerm: query });
    }, [loadSellers, query]);

    const submitSearch = () => {
        const cleanSearch = search.trim();
        Keyboard.dismiss();
        if (cleanSearch === query) loadSellers({ searchTerm: cleanSearch });
        else setQuery(cleanSearch);
    };

    const clearSearch = () => {
        setSearch('');
        setQuery('');
        Keyboard.dismiss();
    };

    const loadMore = () => {
        if (!nextPage || loading || refreshing || loadingMore || error) return;
        loadSellers({ searchTerm: query, pageNumber: page + 1, append: true });
    };

    const renderSeller = ({ item }) => {
        const rating = Number(item.average_rating || 0);
        const reviews = Number(item.total_reviews || 0);
        const name = sellerName(item);

        return (
            <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => navigation.navigate('Anotherprofile', { sellerId: item.id })}
                style={{
                    marginHorizontal: 15,
                    marginBottom: 14,
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    backgroundColor: colors.card,
                }}
            >
                <View style={{ height: 88, backgroundColor: '#0F172A', overflow: 'hidden' }}>
                    {item.cover_photo ? (
                        <Image source={{ uri: item.cover_photo }} resizeMode="cover" style={{ width: '100%', height: '100%', opacity: 0.82 }} />
                    ) : (
                        <View style={{ flex: 1, backgroundColor: '#1E293B' }}>
                            <View style={{ position: 'absolute', height: 110, width: 110, borderRadius: 55, backgroundColor: '#F9731640', right: -18, top: -54 }} />
                            <View style={{ position: 'absolute', height: 82, width: 82, borderRadius: 41, backgroundColor: '#F28C282C', left: 45, bottom: -48 }} />
                        </View>
                    )}
                    <View style={{ position: 'absolute', left: 14, top: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 9, height: 27, backgroundColor: 'rgba(18,9,46,.76)' }}>
                        <FeatherIcon name="shield" size={12} color="#B8F3D0" />
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#D6FBE5', fontSize: 9, marginLeft: 5 }]}>VERIFIED SELLER</Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 48 }}>
                        <View style={{ height: 68, width: 68, borderRadius: 22, padding: 3, backgroundColor: colors.card, marginTop: -28 }}>
                            <Image
                                source={item.avatar ? { uri: item.avatar } : IMAGES.user}
                                resizeMode="cover"
                                style={{ width: 62, height: 62, borderRadius: 19, backgroundColor: colors.background }}
                            />
                        </View>
                        <View style={{ flex: 1, minWidth: 0, marginLeft: 10, paddingBottom: 3 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text numberOfLines={1} style={[FONTS.h6, { color: colors.title, flexShrink: 1 }]}>{name}</Text>
                                <FeatherIcon name="check-circle" size={15} color={COLORS.primary} style={{ marginLeft: 5 }} />
                            </View>
                            {item.business_name && item.full_name && item.business_name !== item.full_name ? (
                                <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 1 }]}>{item.full_name}</Text>
                            ) : null}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 11, backgroundColor: '#FFF4D9', paddingHorizontal: 8, height: 29, marginBottom: 2 }}>
                            <FeatherIcon name="star" size={13} color="#D18A00" />
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#825600', marginLeft: 4 }]}>{rating.toFixed(1)}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9 }}>
                        <FeatherIcon name="map-pin" size={13} color={COLORS.primary} />
                        <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, flex: 1, marginLeft: 5 }]}>{sellerLocation(item)}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', borderRadius: 14, backgroundColor: colors.background, marginTop: 12, overflow: 'hidden' }}>
                        {[
                            ['Ads', compactNumber(item.total_active_listings)],
                            ['Followers', compactNumber(item.followers_count)],
                            ['Reviews', compactNumber(reviews)],
                        ].map(([label, value], index) => (
                            <View key={label} style={{ flex: 1, minHeight: 55, alignItems: 'center', justifyContent: 'center', borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.border }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{value}</Text>
                                <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9, marginTop: 1 }]}>{label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 42, borderRadius: 12, backgroundColor: '#0F172A', marginTop: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>View seller profile</Text>
                        <FeatherIcon name="arrow-right" size={16} color={COLORS.white} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Sellers" leftIcon="back" titleLeft />
            <FlatList
                data={sellers}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderSeller}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.35}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSellers({ searchTerm: query, refresh: true })} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ paddingBottom: 35, flexGrow: 1 }}
                ListHeaderComponent={(
                    <View style={{ paddingHorizontal: 15, paddingTop: 13, paddingBottom: 14 }}>
                        <View style={{ borderRadius: 19, padding: 14, backgroundColor: '#0F172A', overflow: 'hidden' }}>
                            <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, right: -40, top: -58, backgroundColor: '#F9731640' }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 40, width: 40, borderRadius: 13, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="users" size={19} color="#FED7AA" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[FONTS.h6, { color: COLORS.white }]}>Meet trusted sellers</Text>
                                    <Text style={[FONTS.fontXs, { color: '#CBD5E1', marginTop: 2 }]}>Verified, rated 3.5+ and ranked by ad views</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ minHeight: 49, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center', paddingLeft: 13, paddingRight: 5, marginTop: 11 }}>
                            <FeatherIcon name="search" size={18} color={colors.textLight} />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                onSubmitEditing={submitSearch}
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholder="Search seller, shop or location"
                                placeholderTextColor={colors.textLight}
                                style={[FONTS.fontSm, { flex: 1, color: colors.title, height: 48, paddingHorizontal: 10 }]}
                            />
                            {Boolean(search) && (
                                <TouchableOpacity onPress={clearSearch} style={{ height: 36, width: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                                    <FeatherIcon name="x" size={17} color={colors.text} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={submitSearch} style={{ height: 38, borderRadius: 11, backgroundColor: COLORS.primary, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white }]}>Search</Text>
                            </TouchableOpacity>
                        </View>

                        {!loading && !error && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, paddingHorizontal: 2 }}>
                                <View>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{query ? `Results for “${query}”` : 'Sellers with live ads'}</Text>
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Most viewed sellers appear first</Text>
                                </View>
                                <View style={{ borderRadius: 10, backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 9, paddingVertical: 6 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>{compactNumber(total)} {total === 1 ? 'seller' : 'sellers'}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
                ListEmptyComponent={loading ? (
                    <View style={{ flex: 1, minHeight: 330, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 11 }]}>Finding trusted sellers...</Text>
                    </View>
                ) : error ? (
                    <View style={{ flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                        <View style={{ height: 64, width: 64, borderRadius: 21, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="wifi-off" size={26} color="#B42318" />
                        </View>
                        <Text style={[FONTS.h6, { color: colors.title, marginTop: 14, textAlign: 'center' }]}>Sellers are unavailable</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 18, marginTop: 5, textAlign: 'center' }]}>{error}</Text>
                        <TouchableOpacity onPress={() => loadSellers({ searchTerm: query })} style={{ height: 42, borderRadius: 12, backgroundColor: COLORS.primary, marginTop: 15, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>Try again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
                        <View style={{ height: 64, width: 64, borderRadius: 21, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="users" size={26} color={COLORS.primary} />
                        </View>
                        <Text style={[FONTS.h6, { color: colors.title, marginTop: 14, textAlign: 'center' }]}>No sellers found</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 18, marginTop: 5, textAlign: 'center' }]}>Try another seller name, shop or location.</Text>
                        {Boolean(query) && (
                            <TouchableOpacity onPress={clearSearch} style={{ height: 42, borderRadius: 12, backgroundColor: COLORS.primary, marginTop: 15, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>View all sellers</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListFooterComponent={loadingMore ? (
                    <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                        <ActivityIndicator color={COLORS.primary} />
                    </View>
                ) : (error && sellers.length > 0) ? (
                    <TouchableOpacity onPress={() => loadSellers({ searchTerm: query, pageNumber: page + 1, append: true })} style={{ marginHorizontal: 15, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: '#F8B4B4', backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 }}>
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318', textAlign: 'center' }]}>{error} Tap to retry.</Text>
                    </TouchableOpacity>
                ) : null}
            />
        </SafeAreaView>
    );
};

export default Sellers;
