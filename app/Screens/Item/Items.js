import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
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
import Octicons from 'react-native-vector-icons/Octicons';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import SearchBar from '../../components/SearchBar';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import CardStyle1 from '../../components/Card/CardStyle1';
import { getListings } from '../../api/marketplace';

const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low', value: 'price_low' },
    { label: 'Price: High', value: 'price_high' },
    { label: 'Popular', value: 'popular' },
];

const Items = ({ route, navigation }) => {
    const { colors } = useTheme();
    const { cat = 'All listings', categorySlug, searchQuery = '' } = route.params || {};
    const [layout, setLayout] = useState('grid');
    const [search, setSearch] = useState(searchQuery);
    const [activeQuery, setActiveQuery] = useState(searchQuery);
    const [sort, setSort] = useState('newest');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadListings = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const data = await getListings({
                category: categorySlug,
                search: activeQuery,
                sort,
            });
            setListings(data);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeQuery, categorySlug, sort]);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    const submitSearch = () => setActiveQuery(search.trim());

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 5 }] }>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ height: 48, width: 38, justifyContent: 'center' }}
                    >
                        <FeatherIcon name="chevron-left" color={colors.title} size={25} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <SearchBar
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={submitSearch}
                            placeholder={`Search ${cat}`}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 13 }}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[FONTS.h6, { color: colors.title }] }>{cat}</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text }] }>
                            {loading ? 'Loading...' : `${listings.length} ${listings.length === 1 ? 'ad' : 'ads'}`}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setLayout('grid')} style={{ padding: 8 }}>
                        <Image
                            style={{ height: 22, width: 22, resizeMode: 'contain', tintColor: layout === 'grid' ? COLORS.primary : '#BEB9CD' }}
                            source={IMAGES.grid}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setLayout('list')} style={{ padding: 8 }}>
                        <Image
                            style={{ height: 22, width: 22, resizeMode: 'contain', tintColor: layout === 'list' ? COLORS.primary : '#BEB9CD' }}
                            source={IMAGES.grid2}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 4 }}
                >
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => setSort(option.value)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: sort === option.value ? COLORS.primary : colors.borderColor,
                                backgroundColor: sort === option.value ? `${COLORS.primary}12` : colors.card,
                                borderRadius: SIZES.radius,
                                paddingHorizontal: 12,
                                paddingVertical: 7,
                                marginRight: 8,
                            }}
                        >
                            {option.value === 'newest' && (
                                <Octicons size={14} color={sort === option.value ? COLORS.primary : colors.text} style={{ marginRight: 6 }} name="sort-desc" />
                            )}
                            <Text style={[FONTS.fontSm, { color: sort === option.value ? COLORS.primary : colors.title }] }>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    key={layout}
                    data={listings}
                    numColumns={layout === 'grid' ? 2 : 1}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    refreshControl={(
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadListings(true)}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    )}
                    contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 90, flexGrow: 1 }}
                    ListHeaderComponent={error ? (
                        <TouchableOpacity
                            onPress={() => loadListings()}
                            style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, margin: 5 }}
                        >
                            <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }] }>
                                {error} Tap to retry.
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                    ListEmptyComponent={!error ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 35 }}>
                            <FeatherIcon name="search" size={32} color={colors.textLight} />
                            <Text style={[FONTS.font, { color: colors.text, textAlign: 'center', marginTop: 12 }] }>
                                No matching ads were found.
                            </Text>
                        </View>
                    ) : null}
                    renderItem={({ item }) => (
                        <View style={layout === 'grid' ? { width: '50%', padding: 5 } : { width: '100%', padding: 5 }}>
                            <CardStyle1 list={layout === 'list'} item={item} />
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default Items;
