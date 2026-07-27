import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { COLORS, FONTS } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { getCategories } from '../../api/marketplace';
import CategoryIcon from '../../components/CategoryIcon';

const Categories = ({ navigation }) => {
    const { colors } = useTheme();
    const [categories, setCategories] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadCategories = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            setCategories(await getCategories({ force: refresh }));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filteredCategories = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        const allCategories = {
            id: 'all-categories',
            name: 'All categories',
            slug: 'all',
            isAllCategories: true,
            children: [],
            listings_count: categories.reduce((total, category) => total + Number(category.listings_count || 0), 0),
        };
        if (!normalized) return [allCategories, ...categories];
        const matches = categories.flatMap((category) => {
            const parentMatches = category.name.toLowerCase().includes(normalized);
            const matchingChildren = (category.children || []).filter((child) => child.name.toLowerCase().includes(normalized));
            if (!parentMatches && !matchingChildren.length) return [];
            return [{ ...category, children: parentMatches ? category.children : matchingChildren }];
        });
        return 'all categories'.includes(normalized) ? [allCategories, ...matches] : matches;
    }, [categories, query]);

    const openCategory = (item) => navigation.navigate('Items', {
        cat: item.name,
        categorySlug: item.slug,
    });

    const renderCategory = ({ item }) => {
        if (item.isAllCategories) {
            return (
                <TouchableOpacity onPress={() => navigation.navigate('Items', { cat: 'All ads' })} activeOpacity={0.84} style={{ minHeight: 76, backgroundColor: `${COLORS.primary}0D`, borderWidth: 1, borderColor: `${COLORS.primary}45`, borderRadius: 16, marginBottom: 12, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <CategoryIcon slug="all" selected size={20} containerSize={50} borderRadius={15} />
                    <View style={{ flex: 1, marginLeft: 12 }}><Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>All categories</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 3 }]}>{Number(item.listings_count || 0).toLocaleString()} active ads across QOT</Text></View>
                    <FeatherIcon name="arrow-right" size={19} color={COLORS.primary} />
                </TouchableOpacity>
            );
        }
        const expanded = Boolean(query.trim()) || String(expandedId) === String(item.id);
        return (
            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: expanded ? `${COLORS.primary}55` : colors.borderColor, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => setExpandedId((current) => String(current) === String(item.id) ? null : item.id)} activeOpacity={0.84} style={{ minHeight: 76, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <CategoryIcon slug={item.slug} selected={expanded} size={20} containerSize={50} borderRadius={15} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{item.name}</Text>
                        <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 3 }]}>{item.children?.length || 0} subcategories · {Number(item.listings_count || 0).toLocaleString()} active ads</Text>
                    </View>
                    <FeatherIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={expanded ? COLORS.primary : colors.text} />
                </TouchableOpacity>

                {expanded && (
                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: 11 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                            {(item.children || []).map((child) => (
                                <View key={child.id} style={{ width: '50%', paddingHorizontal: 4, marginBottom: 8 }}>
                                    <TouchableOpacity onPress={() => openCategory(child)} style={{ minHeight: 48, borderRadius: 11, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderColor, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center' }}>
                                        <CategoryIcon slug={child.slug} size={13} containerSize={31} borderRadius={10} />
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text numberOfLines={2} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, lineHeight: 15 }]}>{child.name}</Text>
                                            <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9, marginTop: 2 }]}>{Number(child.listings_count || 0).toLocaleString()} ads</Text>
                                        </View>
                                        <FeatherIcon name="chevron-right" size={14} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={() => openCategory(item)} style={{ height: 44, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>Browse all {item.name.toLowerCase()}</Text>
                            <FeatherIcon name="arrow-right" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header leftIcon="back" title="Categories" titleLeft />
            <View style={[GlobalStyleSheet.container, { paddingTop: 8, paddingBottom: 10 }]}>
                <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20, marginBottom: 12 }]}>Choose a department, then select the closest subcategory for better results.</Text>
                <View style={{ height: 48, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 }}>
                    <FeatherIcon name="search" size={18} color={colors.text} />
                    <TextInput value={query} onChangeText={setQuery} placeholder="Search categories" placeholderTextColor={colors.textLight} autoCorrect={false} style={[FONTS.font, { color: colors.title, flex: 1, height: '100%', paddingHorizontal: 10 }]} />
                    {Boolean(query) && <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}><FeatherIcon name="x-circle" size={18} color={colors.text} /></TouchableOpacity>}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <FlatList
                    data={filteredCategories}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderCategory}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadCategories(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[GlobalStyleSheet.container, { paddingTop: 4, paddingBottom: 40, flexGrow: 1 }]}
                    ListHeaderComponent={error ? <TouchableOpacity onPress={() => loadCategories()} style={{ backgroundColor: '#FDECEC', borderRadius: 11, padding: 12, marginBottom: 13 }}><Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text></TouchableOpacity> : null}
                    ListEmptyComponent={!error ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 35 }}><FeatherIcon name="grid" size={31} color={colors.textLight} /><Text style={[FONTS.font, { color: colors.text, textAlign: 'center', marginTop: 11 }]}>No categories match “{query}”.</Text></View> : null}
                />
            )}
        </SafeAreaView>
    );
};

export default Categories;
