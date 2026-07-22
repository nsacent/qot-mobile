import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/Header';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { getCategories } from '../../api/marketplace';
import { categoryIcon } from '../Home/CategoryList';

const Categories = ({ navigation }) => {
    const { colors } = useTheme();
    const [layout, setLayout] = useState('grid');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadCategories = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            setCategories(await getCategories());
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

    const openCategory = (item) => navigation.navigate('Items', {
        cat: item.name,
        categorySlug: item.slug,
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header
                leftIcon="back"
                title="Categories"
                titleLeft
                grid
                handleLayout={setLayout}
                layout={layout}
            />

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => String(item.id)}
                    key={layout}
                    numColumns={layout === 'grid' ? 3 : 1}
                    refreshControl={(
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadCategories(true)}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    )}
                    contentContainerStyle={[GlobalStyleSheet.container, { paddingVertical: 15, flexGrow: 1 }]}
                    ListHeaderComponent={error ? (
                        <TouchableOpacity
                            onPress={() => loadCategories()}
                            style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 14 }}
                        >
                            <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }] }>
                                {error} Tap to retry.
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                    ListEmptyComponent={!error ? (
                        <Text style={[FONTS.font, { color: colors.text, textAlign: 'center', marginTop: 40 }] }>
                            No categories are available.
                        </Text>
                    ) : null}
                    renderItem={({ item }) => (
                        <View
                            style={layout === 'grid'
                                ? { width: '33.33%', minHeight: 125, paddingHorizontal: 5, marginBottom: 10 }
                                : { width: '100%' }}
                        >
                            <TouchableOpacity
                                onPress={() => openCategory(item)}
                                activeOpacity={0.8}
                                style={layout === 'grid'
                                    ? {
                                        alignItems: 'center',
                                        backgroundColor: colors.card,
                                        flex: 1,
                                        borderRadius: SIZES.radius,
                                        padding: 10,
                                        borderWidth: 1,
                                        borderColor: colors.borderColor,
                                    }
                                    : {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 18,
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border,
                                    }}
                            >
                                <Image
                                    style={layout === 'grid'
                                        ? { height: 42, width: 42, resizeMode: 'contain', marginTop: 8, marginBottom: 8 }
                                        : { height: 28, width: 28, resizeMode: 'contain', marginRight: 13 }}
                                    source={categoryIcon(item.slug)}
                                />
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <Text
                                        numberOfLines={2}
                                        style={layout === 'grid'
                                            ? { ...FONTS.fontSm, color: colors.title, textAlign: 'center' }
                                            : { ...FONTS.font, fontSize: 16, color: colors.title }}
                                    >
                                        {item.name}
                                    </Text>
                                    {layout === 'list' && (
                                        <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }] }>
                                            {item.children?.length || 0} subcategories · {item.listings_count || 0} ads
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default Categories;
