import React, { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation, useTheme } from '@react-navigation/native';
import { COLORS, FONTS } from '../../constants/theme';
import CategoryIcon from '../../components/CategoryIcon';

const CategoryList = ({ categories = [] }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [expandedId, setExpandedId] = useState(null);

    const expanded = useMemo(
        () => categories.find((category) => String(category.id) === String(expandedId)),
        [categories, expandedId],
    );

    const categoryItems = useMemo(() => [{
        id: 'all-categories',
        name: 'All categories',
        slug: 'all',
        isAllCategories: true,
        listings_count: categories.reduce((total, category) => total + Number(category.listings_count || 0), 0),
    }, ...categories], [categories]);

    const openCategory = (item) => navigation.navigate('Items', {
        cat: item.name,
        categorySlug: item.slug,
    });

    const selectParent = (item) => {
        if (item.isAllCategories) {
            navigation.navigate('Categories');
            return;
        }
        if (!item.children?.length) {
            openCategory(item);
            return;
        }
        setExpandedId((current) => String(current) === String(item.id) ? null : item.id);
    };

    return (
        <View style={{ marginHorizontal: -15 }}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categoryItems}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingLeft: 15, paddingRight: 8 }}
                renderItem={({ item }) => {
                    const selected = String(item.id) === String(expandedId);
                    return (
                        <TouchableOpacity onPress={() => selectParent(item)} activeOpacity={0.82} style={{ width: 76, alignItems: 'center', marginRight: 5 }}>
                            <CategoryIcon slug={item.slug} selected={selected} size={22} containerSize={54} borderRadius={17} />
                            <Text numberOfLines={2} style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.primary : colors.title, textAlign: 'center', fontSize: 9, lineHeight: 13, marginTop: 5 }]}>{item.name}</Text>
                            <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 8, marginTop: 1 }]}>{Number(item.listings_count || 0).toLocaleString()} ads</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {expanded?.children?.length ? (
                <View style={{ marginHorizontal: 15, marginTop: 13, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, borderRadius: 15, padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 9 }}>
                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flex: 1 }]}>{expanded.name}</Text>
                        <TouchableOpacity onPress={() => setExpandedId(null)} hitSlop={8}><FeatherIcon name="x" size={18} color={colors.text} /></TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                        {expanded.children.map((child) => (
                            <View key={child.id} style={{ width: '50%', paddingHorizontal: 4, marginBottom: 8 }}>
                                <TouchableOpacity onPress={() => openCategory(child)} style={{ minHeight: 43, borderRadius: 10, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <CategoryIcon slug={child.slug} size={12} containerSize={29} borderRadius={9} />
                                    <Text numberOfLines={2} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, flex: 1, lineHeight: 15, marginLeft: 8 }]}>{child.name}</Text>
                                    <FeatherIcon name="chevron-right" size={14} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity onPress={() => openCategory(expanded)} style={{ minHeight: 42, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>Browse all {expanded.name.toLowerCase()} ads</Text></TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
};

export default React.memo(CategoryList);
