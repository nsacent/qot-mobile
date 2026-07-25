import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import { getListing } from '../../api/marketplace';
import { formatPrice } from '../../utils/formatters';
import {
    clearComparisonAds,
    getComparisonAds,
    removeComparisonAd,
    saveComparisonAds,
} from '../../utils/compareAds';

const LABEL_WIDTH = 105;
const AD_WIDTH = 188;

const attributeValue = (attribute) => {
    if (attribute?.display_value !== null && attribute?.display_value !== undefined && attribute.display_value !== '') return String(attribute.display_value);
    if (attribute?.value_text !== null && attribute?.value_text !== undefined && attribute.value_text !== '') return String(attribute.value_text);
    if (attribute?.value_number !== null && attribute?.value_number !== undefined && attribute.value_number !== '') return String(attribute.value_number);
    if (attribute?.value_boolean !== null && attribute?.value_boolean !== undefined) return attribute.value_boolean ? 'Yes' : 'No';
    return '—';
};

const CompareAds = ({ navigation }) => {
    const { colors } = useTheme();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadComparison = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        const saved = await getComparisonAds();
        if (!saved.length) {
            setItems([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        const results = await Promise.allSettled(saved.map((item) => getListing(item.id)));
        const liveItems = results.map((result, index) => (
            result.status === 'fulfilled' ? { ...saved[index], ...result.value } : saved[index]
        ));
        setItems(liveItems);
        await saveComparisonAds(liveItems);
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadComparison();
        return navigation.addListener('focus', () => loadComparison());
    }, [loadComparison, navigation]);

    const attributeRows = useMemo(() => {
        const labels = new Map();
        items.forEach((item) => (item.attributes || []).forEach((attribute) => {
            const key = attribute.filter_name || attribute.name;
            if (key && !labels.has(key)) labels.set(key, key);
        }));
        return [...labels.keys()].slice(0, 16);
    }, [items]);

    const lowestPrice = useMemo(() => {
        const prices = items.map((item) => Number(item.price)).filter((price) => Number.isFinite(price));
        return prices.length ? Math.min(...prices) : null;
    }, [items]);

    const removeItem = async (listingId) => {
        setItems(await removeComparisonAd(listingId));
    };

    const clearAll = () => Alert.alert(
        'Clear comparison?',
        'All selected ads will be removed from this comparison.',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    await clearComparisonAds();
                    setItems([]);
                },
            },
        ],
    );

    const standardRows = [
        { label: 'Price', value: (item) => formatPrice(item.price, item.currency), price: true },
        { label: 'Condition', value: (item) => item.condition ? `${item.condition[0].toUpperCase()}${item.condition.slice(1)}` : '—' },
        { label: 'Location', value: (item) => item.city_name || item.location || 'Uganda' },
        { label: 'Negotiable', value: (item) => item.is_negotiable ? 'Yes' : 'No' },
        { label: 'Seller', value: (item) => item.seller_name || 'QOT seller' },
        { label: 'Category', value: (item) => item.category_name || '—' },
        { label: 'Views', value: (item) => Number(item.views_count || 0).toLocaleString() },
    ];

    const Cell = ({ children, header = false, highlight = false }) => (
        <View style={{ width: AD_WIDTH, minHeight: header ? 224 : 62, borderLeftWidth: 1, borderTopWidth: header ? 0 : 1, borderBottomWidth: header ? 1 : 0, borderColor: colors.borderColor, backgroundColor: highlight ? '#EAF8F0' : colors.card, padding: 10, justifyContent: header ? 'flex-start' : 'center' }}>
            {children}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Compare ads" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Compare ads" leftIcon="back" titleLeft />
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadComparison(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 35 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={[GlobalStyleSheet.container, { paddingTop: 11 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ height: 42, width: 42, borderRadius: 13, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="columns" size={19} color={COLORS.primary} /></View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{items.length}/3 ads selected</Text>
                            <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 1 }]}>Swipe sideways to compare every detail</Text>
                        </View>
                        {items.length > 0 && <TouchableOpacity onPress={clearAll} style={{ padding: 9 }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger }]}>Clear all</Text></TouchableOpacity>}
                    </View>
                </View>

                {items.length === 0 ? (
                    <View style={{ flex: 1, minHeight: 410, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 }}>
                        <View style={{ height: 72, width: 72, borderRadius: 24, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="columns" size={30} color={COLORS.primary} /></View>
                        <Text style={[FONTS.h5, { color: colors.title, textAlign: 'center', marginTop: 17 }]}>Choose ads to compare</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 20, marginTop: 7 }]}>Tap the compare icon on any ad. You can compare up to three at a time.</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Items', { cat: 'All ads' })} style={{ minHeight: 46, borderRadius: 13, backgroundColor: COLORS.primary, paddingHorizontal: 18, marginTop: 19, flexDirection: 'row', alignItems: 'center' }}><FeatherIcon name="search" size={16} color={COLORS.white} /><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>Browse ads</Text></TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 12 }}>
                        <View style={{ borderWidth: 1, borderColor: colors.borderColor, borderRadius: 16, overflow: 'hidden', flexDirection: 'row' }}>
                            <View style={{ width: LABEL_WIDTH, backgroundColor: colors.background }}>
                                <View style={{ minHeight: 224, padding: 10, justifyContent: 'flex-end', borderBottomWidth: 1, borderColor: colors.borderColor }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text }]}>AD DETAILS</Text></View>
                                {[...standardRows, ...attributeRows.map((label) => ({ label }))].map((row) => (
                                    <View key={row.label} style={{ minHeight: 62, paddingHorizontal: 9, justifyContent: 'center', borderTopWidth: 1, borderColor: colors.borderColor }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.text }]}>{row.label}</Text></View>
                                ))}
                            </View>

                            {items.map((item) => (
                                <View key={item.id} style={{ width: AD_WIDTH }}>
                                    <Cell header>
                                        <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId: item.id })} activeOpacity={0.86}>
                                            {item.primary_image ? <Image source={{ uri: item.primary_image }} style={{ width: '100%', height: 102, borderRadius: 11, backgroundColor: colors.borderColor }} resizeMode="cover" /> : <View style={{ width: '100%', height: 102, borderRadius: 11, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.textLight }]}>QOT</Text></View>}
                                            <Text numberOfLines={2} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, lineHeight: 18, marginTop: 8 }]}>{item.title}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeItem(item.id)} style={{ minHeight: 34, borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 8 }}><FeatherIcon name="x" size={13} color={COLORS.danger} /><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger, marginLeft: 5 }]}>Remove</Text></TouchableOpacity>
                                    </Cell>
                                    {standardRows.map((row) => {
                                        const value = row.value(item);
                                        const highlight = row.price && Number(item.price) === lowestPrice && items.length > 1;
                                        return <Cell key={row.label} highlight={highlight}><Text numberOfLines={2} style={[FONTS.fontSm, row.price && FONTS.fontTitle, { color: highlight ? '#18864B' : row.price ? COLORS.primary : colors.title, textAlign: 'center' }]}>{value}</Text>{highlight && <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#18864B', textAlign: 'center', fontSize: 8, marginTop: 2 }]}>LOWEST PRICE</Text>}</Cell>;
                                    })}
                                    {attributeRows.map((label) => {
                                        const attribute = (item.attributes || []).find((entry) => (entry.filter_name || entry.name) === label);
                                        return <Cell key={label}><Text numberOfLines={2} style={[FONTS.fontSm, { color: colors.title, textAlign: 'center' }]}>{attributeValue(attribute)}</Text></Cell>;
                                    })}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CompareAds;
