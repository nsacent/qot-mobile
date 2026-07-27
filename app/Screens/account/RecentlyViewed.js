import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
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
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import {
    clearRecentlyViewed,
    getRecentlyViewed,
    removeRecentlyViewed,
} from '../../utils/recentlyViewed';
import CachedImage from '../../components/CachedImage';

const locationFor = (item) => {
    const city = item?.area_name || item?.city_name || 'Uganda';
    const region = item?.region_name || '';
    return region && region !== city ? `${city}, ${region}` : city;
};

const RecentlyViewed = ({ navigation }) => {
    const { colors } = useTheme();
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        setItems(await getRecentlyViewed());
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadHistory();
        return navigation.addListener('focus', () => loadHistory());
    }, [loadHistory, navigation]);

    const visibleItems = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return items;
        return items.filter((item) => [
            item.title,
            item.category_name,
            item.city_name,
            item.area_name,
            item.region_name,
            item.description,
        ].filter(Boolean).join(' ').toLowerCase().includes(search));
    }, [items, query]);

    const removeItem = async (listingId) => {
        setItems(await removeRecentlyViewed(listingId));
    };

    const clearHistory = () => {
        Alert.alert(
            'Clear browsing history?',
            'All recently viewed ads will be removed from this device.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear history',
                    style: 'destructive',
                    onPress: async () => {
                        await clearRecentlyViewed();
                        setItems([]);
                        setQuery('');
                    },
                },
            ],
        );
    };

    const pageHeader = (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10 }}>
                <View style={{ height: 42, width: 42, borderRadius: 13, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                    <FeatherIcon name="clock" size={19} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{items.length} recently viewed ad{items.length === 1 ? '' : 's'}</Text>
                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 1 }]}>Your history stays on this device</Text>
                </View>
                {items.length > 0 && (
                    <TouchableOpacity onPress={clearHistory} hitSlop={6} style={{ minHeight: 38, borderRadius: 11, borderWidth: 1, borderColor: '#F7C7C4', backgroundColor: '#FFF5F4', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
                        <FeatherIcon name="trash-2" size={13} color="#B42318" />
                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318', marginLeft: 5 }]}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            {items.length > 0 && (
                <View style={{ height: 45, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginTop: 14, marginBottom: 2 }}>
                    <FeatherIcon name="search" size={17} color={colors.textLight} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search recently viewed ads"
                        placeholderTextColor={colors.textLight}
                        style={[FONTS.fontSm, { flex: 1, color: colors.title, marginLeft: 8, paddingVertical: 0 }]}
                        returnKeyType="search"
                    />
                    {Boolean(query) && (
                        <TouchableOpacity onPress={() => setQuery('')} style={{ height: 30, width: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="x-circle" size={17} color={colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    const emptyHistory = items.length === 0 ? (
        <View style={{ minHeight: 390, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <View style={{ height: 72, width: 72, borderRadius: 24, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                <FeatherIcon name="clock" size={30} color={COLORS.primary} />
            </View>
            <Text style={[FONTS.h5, { color: colors.title, marginTop: 18, textAlign: 'center' }]}>Nothing viewed yet</Text>
            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 7, lineHeight: 20, textAlign: 'center' }]}>Open an ad and it will appear here, ready for you to find again.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Items', { cat: 'All ads' })} style={{ minHeight: 45, borderRadius: 13, backgroundColor: COLORS.primary, paddingHorizontal: 18, marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                <FeatherIcon name="search" size={15} color={COLORS.white} />
                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>Browse ads</Text>
            </TouchableOpacity>
        </View>
    ) : (
        <View style={{ marginTop: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderColor, borderRadius: 16, padding: 28, alignItems: 'center' }}>
            <FeatherIcon name="search" size={27} color={colors.textLight} />
            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 9 }]}>No matching ads</Text>
            <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 4, textAlign: 'center' }]}>Try another title, category or location.</Text>
            <TouchableOpacity onPress={() => setQuery('')} style={{ marginTop: 11 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Clear search</Text></TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={{ marginTop: 11, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' }}>
            <TouchableOpacity
                onPress={() => navigation.navigate('ItemDetails', { listingId: item.id })}
                activeOpacity={0.86}
                style={{ height: 124, flexDirection: 'row' }}
            >
                <View style={{ width: 148, height: 124, backgroundColor: colors.borderColor, alignItems: 'center', justifyContent: 'center' }}>
                    {item.primary_image ? (
                        <CachedImage source={{ uri: item.primary_image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" cacheVersion={item.updated_at} recyclingKey={`recent-${item.id}-${item.primary_image}`} />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.textLight }]}>QOT</Text>
                        </View>
                    )}
                    {item.is_featured && (
                        <View style={{ position: 'absolute', left: 7, top: 7, borderRadius: 5, backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 3 }}>
                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, fontSize: 7 }]}>FEATURED</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => removeItem(item.id)}
                        accessibilityLabel={`Remove ${item.title} from recently viewed`}
                        hitSlop={7}
                        style={{ position: 'absolute', right: 8, top: 8, height: 30, width: 30, borderRadius: 15, backgroundColor: 'rgba(15,23,42,.64)', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FeatherIcon name="x" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, minWidth: 0, paddingHorizontal: 11, paddingVertical: 9 }}>
                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, textTransform: 'uppercase', fontSize: 8 }]}>{item.category_name || 'AD'}</Text>
                    <Text numberOfLines={2} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, lineHeight: 18, marginTop: 2 }]}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, flexShrink: 1 }]}>{formatPrice(item.price, item.currency)}</Text>
                        {item.is_negotiable && <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, backgroundColor: `${COLORS.primary}10`, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 5, fontSize: 7 }]}>NEGOTIABLE</Text>}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <FeatherIcon name="map-pin" size={11} color={colors.textLight} />
                        <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginLeft: 4, flex: 1 }]}>{locationFor(item)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <FeatherIcon name="eye" size={11} color={colors.textLight} />
                        <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 4 }]}>{Number(item.views_count || 0).toLocaleString()}</Text>
                        <View style={{ height: 3, width: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 7 }} />
                        <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.textLight }]}>Viewed {formatRelativeTime(item.viewed_at)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Recently viewed" leftIcon="back" titleLeft />
            <FlatList
                data={visibleItems}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                ListHeaderComponent={pageHeader}
                ListEmptyComponent={emptyHistory}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[GlobalStyleSheet.container, { paddingBottom: 38, flexGrow: 1 }]}
            />
        </SafeAreaView>
    );
};

export default RecentlyViewed;
