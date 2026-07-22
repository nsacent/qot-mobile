import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import CardStyle1 from '../../components/Card/CardStyle1';
import {
    deleteListing,
    getFavorites,
    getMyListings,
} from '../../api/marketplace';
import { formatPrice } from '../../utils/formatters';

const statusColor = (status) => ({
    active: COLORS.success,
    pending: '#E89A25',
    rejected: COLORS.danger,
    sold: '#6B7280',
    unavailable: '#6B7280',
}[status] || COLORS.primary);

const Myads = ({ navigation }) => {
    const { colors } = useTheme();
    const [tab, setTab] = useState('ads');
    const [ads, setAds] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [myAds, savedAds] = await Promise.all([getMyListings(), getFavorites()]);
            setAds(myAds);
            setFavorites(savedAds);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => loadData());
        return unsubscribe;
    }, [loadData, navigation]);

    const confirmDelete = (item) => {
        Alert.alert(
            'Delete this ad?',
            'This permanently removes the listing from QOT.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteListing(item.id);
                            setAds((current) => current.filter((ad) => ad.id !== item.id));
                        } catch (requestError) {
                            Alert.alert('Could not delete ad', requestError.message);
                        }
                    },
                },
            ],
        );
    };

    const data = tab === 'ads' ? ads : favorites;

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="My QOT" leftIcon="back" titleLeft />

            <View style={[GlobalStyleSheet.container, { paddingTop: 8, paddingBottom: 0 }] }>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderColor }}>
                    {[
                        ['ads', `My Ads (${ads.length})`],
                        ['favorites', `Saved (${favorites.length})`],
                    ].map(([value, label]) => (
                        <TouchableOpacity
                            key={value}
                            onPress={() => setTab(value)}
                            style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: tab === value ? COLORS.primary : 'transparent' }}
                        >
                            <Text style={[FONTS.font, FONTS.fontTitle, { color: tab === value ? COLORS.primary : colors.text }] }>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={(
                        <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />
                    )}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100, flexGrow: 1 }}
                    ListHeaderComponent={error ? (
                        <TouchableOpacity onPress={() => loadData()} style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                            <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }] }>{error} Tap to retry.</Text>
                        </TouchableOpacity>
                    ) : null}
                    ListEmptyComponent={!error ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 65 }}>
                            <FeatherIcon name={tab === 'ads' ? 'tag' : 'heart'} size={34} color={colors.textLight} />
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 14 }] }>
                                {tab === 'ads' ? 'You have not posted an ad yet' : 'No saved ads yet'}
                            </Text>
                            {tab === 'ads' && (
                                <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11, marginTop: 16 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Post your first ad</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null}
                    renderItem={({ item }) => tab === 'favorites' ? (
                        <View style={{ marginBottom: 12 }}>
                            <CardStyle1 item={item} list />
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ItemDetails', { listingId: item.id })}
                            activeOpacity={0.85}
                            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, marginBottom: 13, padding: 10 }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <Image
                                    source={item.primary_image ? { uri: item.primary_image } : IMAGES.detail1}
                                    style={{ width: 86, height: 76, borderRadius: 8, backgroundColor: colors.borderColor }}
                                />
                                <View style={{ flex: 1, marginLeft: 11 }}>
                                    <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title }] }>{item.title}</Text>
                                    <Text style={[FONTS.h6, { color: COLORS.primary, marginTop: 3 }] }>{formatPrice(item.price, item.currency)}</Text>
                                    <View style={{ alignSelf: 'flex-start', backgroundColor: `${statusColor(item.status)}18`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 5 }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: statusColor(item.status), textTransform: 'uppercase' }] }>{item.status}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={10} style={{ padding: 8 }}>
                                    <FeatherIcon name="trash-2" size={18} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10, paddingTop: 9 }}>
                                <Text style={[FONTS.fontXs, { color: colors.text, flex: 1 }]}>Views: {item.views_count || 0}</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text }]}>Favorites: {item.favorites_count || 0}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default Myads;
