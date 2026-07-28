import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import SearchBar from '../../components/SearchBar';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import CardStyle1 from '../../components/Card/CardStyle1';
import MarketplaceSelectionModal from '../../components/MarketplaceSelectionModal';
import {
    createSavedSearch,
    getCategories,
    getCategoryFilters,
    getListingFacets,
    getListingsPage,
    getRegions,
} from '../../api/marketplace';
import { useAuth } from '../../context/AuthContext';
import { recordRecentSearch } from '../../utils/recentSearches';
import {
    addDistancesToListings,
    getStoredBuyerLocation,
    requestBuyerLocation,
} from '../../utils/nearbyAds';

const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Lowest price', value: 'price_low' },
    { label: 'Highest price', value: 'price_high' },
    { label: 'Most viewed', value: 'most_viewed' },
];

const emptyFilters = () => ({
    minPrice: '',
    maxPrice: '',
    condition: '',
    negotiable: false,
    verified: false,
    postedWithin: '',
    fields: {},
});

const standardFilterKeys = new Set([
    'category', 'city', 'area', 'region', 'min_price', 'max_price', 'condition',
    'is_negotiable', 'negotiable', 'verified_seller', 'posted_within',
    'search', 'q', 'sort', 'page', 'page_size',
]);

const truthyFilter = (value) => value === true || value === 'true' || value === 1 || value === '1';

const restoredFilters = (saved = {}) => ({
    minPrice: String(saved.min_price || ''),
    maxPrice: String(saved.max_price || ''),
    condition: String(saved.condition || ''),
    negotiable: truthyFilter(saved.is_negotiable ?? saved.negotiable),
    verified: truthyFilter(saved.verified_seller),
    postedWithin: String(saved.posted_within || ''),
    fields: Object.fromEntries(Object.entries(saved).filter(([key, value]) => !standardFilterKeys.has(key) && value !== '' && value !== undefined && value !== null)),
});

const flattenCategories = (categories) => categories.flatMap((category) => (
    category.children?.length ? [category, ...category.children] : [category]
));

const Items = ({ route, navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSafeInset = Platform.OS === 'android'
        ? Math.max(insets.bottom, 32)
        : Math.max(insets.bottom, 15);
    const { isAuthenticated } = useAuth();
    const { cat = 'All ads', categorySlug, searchQuery = '', savedFilters = {}, nearby = false } = route.params || {};
    const [layout, setLayout] = useState('grid');
    const [search, setSearch] = useState(searchQuery);
    const [activeQuery, setActiveQuery] = useState(searchQuery);
    const [sort, setSort] = useState(savedFilters.sort || 'newest');
    const [categories, setCategories] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(
        categorySlug ? { name: cat, slug: categorySlug } : null,
    );
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [categoryFilters, setCategoryFilters] = useState([]);
    const [filters, setFilters] = useState(() => restoredFilters(savedFilters));
    const [draftFilters, setDraftFilters] = useState(() => restoredFilters(savedFilters));
    const [facets, setFacets] = useState({});
    const [categoryModal, setCategoryModal] = useState(false);
    const [locationModal, setLocationModal] = useState(false);
    const [filterModal, setFilterModal] = useState(false);
    const [listings, setListings] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [savingSearch, setSavingSearch] = useState(false);
    const [locationMode, setLocationMode] = useState(Boolean(nearby));
    const [buyerLocation, setBuyerLocation] = useState(null);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        Promise.all([getCategories(), getRegions()])
            .then(([categoryData, regionData]) => {
                setCategories(categoryData);
                setRegions(regionData);
                if (savedFilters.city) {
                    const city = regionData.flatMap((region) => region.cities || []).find((item) => (
                        String(item.id) === String(savedFilters.city)
                        || item.slug === savedFilters.city
                        || item.name === savedFilters.city
                    ));
                    if (city) {
                        setSelectedCity(city);
                        const area = (city.areas || []).find((item) => (
                            String(item.id) === String(savedFilters.area)
                            || item.slug === savedFilters.area
                            || item.name === savedFilters.area
                        ));
                        setSelectedArea(area || null);
                    }
                }
                if (categorySlug) {
                    const match = flattenCategories(categoryData).find((item) => item.slug === categorySlug);
                    if (match) setSelectedCategory(match);
                }
            })
            .catch(() => {});
    }, [categorySlug]);

    useEffect(() => {
        if (!selectedCategory?.slug) {
            setCategoryFilters([]);
            return;
        }
        getCategoryFilters(selectedCategory.slug).then(setCategoryFilters).catch(() => setCategoryFilters([]));
    }, [selectedCategory?.slug]);

    const requestParams = useMemo(() => ({
        page_size: locationMode ? 100 : 20,
        category: selectedCategory?.slug,
        search: activeQuery,
        sort,
        city: selectedCity?.slug || selectedCity?.id,
        area: selectedArea?.slug || selectedArea?.id,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        condition: filters.condition,
        is_negotiable: filters.negotiable ? true : '',
        verified_seller: filters.verified ? true : '',
        posted_within: filters.postedWithin,
        ...filters.fields,
    }), [activeQuery, filters, locationMode, selectedArea, selectedCategory?.slug, selectedCity, sort]);

    const loadListings = useCallback(async ({ requestedPage = 1, append = false, refresh = false } = {}) => {
        if (append) setLoadingMore(true);
        else if (refresh) setRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const data = await getListingsPage({ ...requestParams, page: requestedPage, force: refresh });
            const nextResults = locationMode && buyerLocation
                ? await addDistancesToListings(data.results, buyerLocation)
                : data.results;
            setListings((current) => append ? [...current, ...nextResults] : nextResults);
            setTotal(data.count);
            setPage(requestedPage);
            setHasMore(!locationMode && Boolean(data.next));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [buyerLocation, locationMode, requestParams]);

    const enableNearby = useCallback(async () => {
        if (locating) return;
        setLocating(true);
        setNotice('');
        try {
            const location = await getStoredBuyerLocation() || await requestBuyerLocation();
            setSelectedCity(null);
            setSelectedArea(null);
            setBuyerLocation(location);
            setLocationMode(true);
        } catch (locationError) {
            setLocationMode(false);
            setBuyerLocation(null);
            setNotice(locationError.message || 'Your location could not be found.');
        } finally {
            setLocating(false);
        }
    }, [locating]);

    useEffect(() => {
        if (nearby) enableNearby();
    }, [nearby]);

    const disableNearby = () => {
        setLocationMode(false);
        setBuyerLocation(null);
    };

    useEffect(() => {
        loadListings();
        getListingFacets(requestParams).then(setFacets).catch(() => setFacets({}));
    }, [loadListings, requestParams]);

    const draftFacetParams = useMemo(() => ({
        category: selectedCategory?.slug,
        search: activeQuery,
        city: selectedCity?.slug || selectedCity?.id,
        area: selectedArea?.slug || selectedArea?.id,
        min_price: draftFilters.minPrice,
        max_price: draftFilters.maxPrice,
        condition: draftFilters.condition,
        is_negotiable: draftFilters.negotiable ? true : '',
        verified_seller: draftFilters.verified ? true : '',
        posted_within: draftFilters.postedWithin,
        ...draftFilters.fields,
    }), [activeQuery, draftFilters, selectedArea, selectedCategory?.slug, selectedCity]);

    useEffect(() => {
        if (!filterModal) return undefined;
        const timeout = setTimeout(() => {
            getListingFacets(draftFacetParams).then(setFacets).catch(() => {});
        }, 350);
        return () => clearTimeout(timeout);
    }, [draftFacetParams, filterModal]);

    const categoryGroups = useMemo(() => [
        { title: 'All categories', items: [{ id: 'all', name: 'All categories', slug: '' }] },
        ...categories.map((category) => ({
            title: category.name,
            items: category.children?.length ? [category, ...category.children] : [category],
        })),
    ], [categories]);

    const locationGroups = useMemo(() => [
        { title: 'Anywhere', items: [{ id: 'all', name: 'All Uganda', selection_type: 'all' }] },
        ...regions.flatMap((region) => {
            const cities = [];
            const areas = [];
            for (const city of region.cities || []) {
                if ((city.areas || []).length) {
                    areas.push({
                        title: `${city.name}, ${region.name}`,
                        items: city.areas.map((area) => ({
                            ...area,
                            id: `area-${area.id}`,
                            area_id: area.id,
                            city_id: city.id,
                            city_name: city.name,
                            region_name: region.name,
                            selection_type: 'area',
                        })),
                    });
                } else {
                    cities.push({
                        ...city,
                        id: `city-${city.id}`,
                        city_id: city.id,
                        region_name: city.region_name || region.name,
                        selection_type: 'city',
                    });
                }
            }
            return [
                ...(cities.length ? [{ title: region.name, items: cities }] : []),
                ...areas,
            ];
        }),
    ], [regions]);
    const selectedLocationId = selectedArea ? `area-${selectedArea.id}` : selectedCity ? `city-${selectedCity.id}` : 'all';
    const selectedLocationName = selectedArea?.name || selectedCity?.name || '';

    const activeFilterCount = useMemo(() => [
        filters.minPrice || filters.maxPrice,
        filters.condition,
        filters.negotiable,
        filters.verified,
        filters.postedWithin,
        ...Object.values(filters.fields),
    ].filter(Boolean).length, [filters]);

    const submitSearch = async () => {
        const query = search.trim();
        setActiveQuery(query);
        if (!query && !selectedCategory && !selectedCity && !selectedArea) return;

        const historyFilters = Object.fromEntries(Object.entries(requestParams).filter(([key, value]) => (
            !['search', 'category', 'city', 'area'].includes(key)
            && value !== ''
            && value !== undefined
            && value !== null
        )));
        await recordRecentSearch({
            query,
            categorySlug: selectedCategory?.slug,
            categoryName: selectedCategory?.name,
            cityId: selectedCity?.id,
            citySlug: selectedCity?.slug,
            cityName: selectedCity?.name,
            areaId: selectedArea?.id,
            areaSlug: selectedArea?.slug,
            areaName: selectedArea?.name,
            filters: historyFilters,
        });
    };

    const chooseCategory = (item) => {
        setSelectedCategory(item.id === 'all' ? null : item);
        setFilters((current) => ({ ...current, fields: {} }));
        setNotice('');
    };

    const chooseLocation = (item) => {
        disableNearby();
        if (item.selection_type === 'all' || item.id === 'all') {
            setSelectedCity(null);
            setSelectedArea(null);
            return;
        }
        if (item.selection_type === 'area') {
            const city = regions.flatMap((region) => region.cities || []).find((candidate) => String(candidate.id) === String(item.city_id));
            setSelectedCity(city || { id: item.city_id, name: item.city_name, region_name: item.region_name });
            setSelectedArea({ id: item.area_id, name: item.name, slug: item.slug });
            return;
        }
        const city = regions.flatMap((region) => region.cities || []).find((candidate) => String(candidate.id) === String(item.city_id));
        setSelectedCity(city || { ...item, id: item.city_id });
        setSelectedArea(null);
    };

    const openFilters = () => {
        setDraftFilters({ ...filters, fields: { ...filters.fields } });
        setFilterModal(true);
    };

    const updateDraft = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value }));
    const updateDraftField = (key, value) => setDraftFilters((current) => ({
        ...current,
        fields: { ...current.fields, [key]: value },
    }));

    const saveSearch = async () => {
        if (!isAuthenticated) {
            navigation.navigate('SignIn');
            return;
        }
        setSavingSearch(true);
        setNotice('');
        try {
            const filterPayload = Object.fromEntries(Object.entries(requestParams).filter(([, value]) => value !== '' && value !== undefined && value !== null && value !== 'newest'));
            delete filterPayload.search;
            delete filterPayload.sort;
            const nameParts = [activeQuery || selectedCategory?.name || 'All ads', selectedArea?.name || selectedCity?.name].filter(Boolean);
            await createSavedSearch(nameParts.join(' · '), activeQuery, filterPayload);
            setNotice('Search saved. QOT will notify you about new matching ads.');
        } catch (requestError) {
            setNotice(requestError.message);
        } finally {
            setSavingSearch(false);
        }
    };

    const Chip = ({ label, selected, onPress, count }) => (
        <TouchableOpacity
            onPress={onPress}
            style={{
                minHeight: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selected ? COLORS.primary : colors.borderColor,
                backgroundColor: selected ? `${COLORS.primary}12` : colors.card,
                paddingHorizontal: 13,
                marginRight: 8,
                marginBottom: 9,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: selected ? COLORS.primary : colors.title }]}>
                {label}{count !== undefined ? ` (${count})` : ''}
            </Text>
        </TouchableOpacity>
    );

    const renderFilterModal = () => (
        <Modal visible={filterModal} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setFilterModal(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: colors.borderColor }}>
                    <TouchableOpacity onPress={() => setFilterModal(false)} style={{ height: 42, width: 42, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="x" size={24} color={colors.title} /></TouchableOpacity>
                    <Text style={[FONTS.h5, { color: colors.title, flex: 1, marginLeft: 5 }]}>Filter ads</Text>
                    <TouchableOpacity onPress={() => setDraftFilters(emptyFilters())} style={{ padding: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.danger }]}>Reset</Text></TouchableOpacity>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[GlobalStyleSheet.container, { paddingTop: 18, paddingBottom: 120 + bottomSafeInset }]}>
                    <Text style={[FONTS.h6, { color: colors.title, marginBottom: 11 }]}>Price range</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[['minPrice', 'Minimum price'], ['maxPrice', 'Maximum price']].map(([key, placeholder]) => (
                            <TextInput key={key} value={draftFilters[key]} onChangeText={(value) => updateDraft(key, value.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholder={placeholder} placeholderTextColor={colors.textLight} style={[FONTS.font, { flex: 1, height: 49, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, color: colors.title, borderRadius: 11, paddingHorizontal: 12 }]} />
                        ))}
                    </View>
                    {Boolean(facets.price_presets?.length) && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 11 }}>
                            {facets.price_presets.map((preset) => (
                                <Chip key={preset.label} label={preset.label} count={preset.count} selected={String(draftFilters.minPrice) === String(preset.min_price || '') && String(draftFilters.maxPrice) === String(preset.max_price || '')} onPress={() => setDraftFilters((current) => ({ ...current, minPrice: preset.min_price ? String(preset.min_price) : '', maxPrice: preset.max_price ? String(preset.max_price) : '' }))} />
                            ))}
                        </ScrollView>
                    )}

                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 17, marginBottom: 11 }]}>Condition</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {[['new', 'New'], ['used', 'Used']].map(([value, label]) => <Chip key={value} label={label} count={facets.condition_counts?.[value]} selected={draftFilters.condition === value} onPress={() => updateDraft('condition', draftFilters.condition === value ? '' : value)} />)}
                    </View>

                    <Text style={[FONTS.h6, { color: colors.title, marginTop: 8, marginBottom: 11 }]}>Seller and timing</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Chip label="Negotiable" selected={draftFilters.negotiable} onPress={() => updateDraft('negotiable', !draftFilters.negotiable)} />
                        <Chip label="Verified sellers" selected={draftFilters.verified} onPress={() => updateDraft('verified', !draftFilters.verified)} />
                        {[['1', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days']].map(([value, label]) => <Chip key={value} label={label} selected={draftFilters.postedWithin === value} onPress={() => updateDraft('postedWithin', draftFilters.postedWithin === value ? '' : value)} />)}
                    </View>

                    {categoryFilters.map((filter) => {
                        const value = String(draftFilters.fields[filter.key] || '');
                        const facetOptions = facets.filters?.[filter.key]?.options || filter.options || [];
                        return (
                            <View key={filter.id} style={{ marginTop: 13 }}>
                                <Text style={[FONTS.h6, { color: colors.title, marginBottom: 11 }]}>{filter.name}</Text>
                                {filter.filter_type === 'boolean' ? (
                                    <View style={{ flexDirection: 'row' }}>
                                        {[['true', 'Yes'], ['false', 'No']].map(([optionValue, label]) => <Chip key={optionValue} label={label} selected={value === optionValue} onPress={() => updateDraftField(filter.key, value === optionValue ? '' : optionValue)} />)}
                                    </View>
                                ) : facetOptions.length ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {facetOptions.map((option) => <Chip key={option.value} label={option.label} count={option.count} selected={value === String(option.value)} onPress={() => updateDraftField(filter.key, value === String(option.value) ? '' : String(option.value))} />)}
                                    </ScrollView>
                                ) : ['number', 'range'].includes(filter.filter_type) ? (
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        {[`${filter.key}_min`, `${filter.key}_max`].map((fieldKey, index) => (
                                            <TextInput key={fieldKey} value={String(draftFilters.fields[fieldKey] || '')} onChangeText={(text) => updateDraftField(fieldKey, text.replace(/[^0-9.]/g, ''))} keyboardType="numeric" placeholder={index === 0 ? 'Minimum' : 'Maximum'} placeholderTextColor={colors.textLight} style={[FONTS.font, { flex: 1, height: 49, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, color: colors.title, borderRadius: 11, paddingHorizontal: 12 }]} />
                                        ))}
                                    </View>
                                ) : (
                                    <TextInput value={value} onChangeText={(text) => updateDraftField(filter.key, text)} placeholder={`Enter ${filter.name.toLowerCase()}`} placeholderTextColor={colors.textLight} style={[FONTS.font, { height: 49, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, color: colors.title, borderRadius: 11, paddingHorizontal: 12 }]} />
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 15, paddingTop: 15, paddingBottom: bottomSafeInset, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderColor }}>
                    <TouchableOpacity onPress={() => { setFilters(draftFilters); setFilterModal(false); }} style={{ height: 52, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Show {Number(facets.total_count ?? total).toLocaleString()} ads</Text></TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 5 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ height: 48, width: 38, justifyContent: 'center' }}><FeatherIcon name="chevron-left" color={colors.title} size={25} /></TouchableOpacity>
                    <View style={{ flex: 1 }}><SearchBar value={search} onChangeText={setSearch} onSubmitEditing={submitSearch} placeholder="What are you looking for?" /></View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 13 }}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[FONTS.h6, { color: colors.title }]}>{locationMode ? 'Ads near you' : selectedCategory?.name || (activeQuery ? `Results for “${activeQuery}”` : selectedLocationName ? `Ads in ${selectedLocationName}` : 'Browse all ads')}</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text }]}>{locating ? 'Finding your location...' : loading ? 'Finding ads...' : locationMode ? `${total.toLocaleString()} ads · nearest first` : `${total.toLocaleString()} ${total === 1 ? 'ad' : 'ads'} found`}</Text>
                    </View>
                    <TouchableOpacity disabled={savingSearch} onPress={saveSearch} style={{ height: 39, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' }}>{savingSearch ? <ActivityIndicator size="small" color={COLORS.primary} /> : <FeatherIcon name="bookmark" size={20} color={COLORS.primary} />}</TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayout('grid')} style={{ padding: 8 }}><Image style={{ height: 21, width: 21, resizeMode: 'contain', tintColor: layout === 'grid' ? COLORS.primary : '#BEB9CD' }} source={IMAGES.grid} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayout('list')} style={{ padding: 8 }}><Image style={{ height: 21, width: 21, resizeMode: 'contain', tintColor: layout === 'list' ? COLORS.primary : '#BEB9CD' }} source={IMAGES.grid2} /></TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 5 }}>
                    <Chip label={locating ? 'Locating…' : 'Near me'} selected={locationMode} onPress={locationMode ? disableNearby : enableNearby} />
                    <Chip label={selectedCategory?.name || 'Category'} selected={Boolean(selectedCategory)} onPress={() => setCategoryModal(true)} />
                    <Chip label={selectedLocationName || 'All Uganda'} selected={Boolean(selectedCity || selectedArea)} onPress={() => setLocationModal(true)} />
                    <Chip label={`Filters${activeFilterCount ? ` · ${activeFilterCount}` : ''}`} selected={Boolean(activeFilterCount)} onPress={openFilters} />
                    {!locationMode && sortOptions.map((option) => <Chip key={option.value} label={option.label} selected={sort === option.value} onPress={() => setSort(option.value)} />)}
                </ScrollView>

                {Boolean(notice) && (
                    <Pressable onPress={() => setNotice('')} style={{ borderRadius: 10, padding: 10, marginTop: 6, backgroundColor: notice.startsWith('Search saved') ? '#E8F7EE' : '#FDECEC', flexDirection: 'row', alignItems: 'center' }}><FeatherIcon name={notice.startsWith('Search saved') ? 'check-circle' : 'alert-circle'} size={16} color={notice.startsWith('Search saved') ? '#15803D' : COLORS.danger} /><Text style={[FONTS.fontXs, { color: notice.startsWith('Search saved') ? '#15803D' : COLORS.danger, flex: 1, marginLeft: 7 }]}>{notice}</Text></Pressable>
                )}
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <FlatList
                    key={layout}
                    data={listings}
                    numColumns={layout === 'grid' ? 2 : 1}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadListings({ refresh: true })} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    onEndReached={() => hasMore && !loadingMore && loadListings({ requestedPage: page + 1, append: true })}
                    onEndReachedThreshold={0.35}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 90, flexGrow: 1 }}
                    ListHeaderComponent={error ? <TouchableOpacity onPress={() => loadListings()} style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, margin: 5 }}><Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text></TouchableOpacity> : null}
                    ListEmptyComponent={!error ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 35 }}><FeatherIcon name="search" size={32} color={colors.textLight} /><Text style={[FONTS.font, { color: colors.text, textAlign: 'center', marginTop: 12 }]}>No matching ads were found. Try removing a filter or searching another area.</Text></View> : null}
                    ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 20 }} /> : null}
                    renderItem={({ item }) => <View style={layout === 'grid' ? { width: '50%', padding: 5 } : { width: '100%', padding: 5 }}><CardStyle1 list={layout === 'list'} item={item} /></View>}
                />
            )}

            <MarketplaceSelectionModal visible={categoryModal} title="Choose a category" groups={categoryGroups} selectedId={selectedCategory?.id || 'all'} onSelect={chooseCategory} onClose={() => setCategoryModal(false)} searchPlaceholder="Search categories" />
            <MarketplaceSelectionModal visible={locationModal} title="Choose a location" groups={locationGroups} selectedId={selectedLocationId} onSelect={chooseLocation} onClose={() => setLocationModal(false)} searchPlaceholder="Search areas, cities and districts" />
            {renderFilterModal()}
        </SafeAreaView>
    );
};

export default Items;
