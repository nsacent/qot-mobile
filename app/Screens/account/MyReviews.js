import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
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
import ReviewStars from '../../components/ReviewStars';
import { COLORS, FONTS } from '../../constants/theme';
import { getMyReviews } from '../../api/account';
import { formatDate } from '../../utils/formatters';

const MyReviews = ({ navigation }) => {
    const { colors } = useTheme();
    const [reviews, setReviews] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadReviews = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            setReviews(await getMyReviews());
        } catch (requestError) {
            setError(requestError.message || 'Your reviews could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadReviews();
        return navigation.addListener('focus', () => loadReviews());
    }, [loadReviews, navigation]);

    const visibleReviews = useMemo(() => (
        filter === 'all' ? reviews : reviews.filter((review) => Number(review.rating) === Number(filter))
    ), [filter, reviews]);
    const averageGiven = reviews.length
        ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
        : 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="My reviews" leftIcon="back" titleLeft />
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading your reviews...</Text>
                </View>
            ) : (
                <FlatList
                    data={visibleReviews}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadReviews(true)} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
                    contentContainerStyle={{ padding: 15, paddingBottom: 38, flexGrow: 1 }}
                    ListHeaderComponent={(
                        <>
                            <View style={{ borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, padding: 14 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: '#FFF3DC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="star" size={21} color="#B56700" /></View>
                                    <View style={{ flex: 1, marginLeft: 11 }}>
                                        <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Reviews you shared</Text>
                                        <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginTop: 3 }]}>Your feedback helps buyers identify trusted sellers.</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                                    <View style={{ flex: 1, borderRadius: 13, backgroundColor: colors.background, padding: 11 }}><Text style={[FONTS.h6, { color: colors.title }]}>{reviews.length}</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Reviews submitted</Text></View>
                                    <View style={{ flex: 1, borderRadius: 13, backgroundColor: colors.background, padding: 11 }}><Text style={[FONTS.h6, { color: colors.title }]}>{averageGiven.toFixed(1)}</Text><View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}><FeatherIcon name="star" size={11} color="#F59E0B" /><Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 4 }]}>Average given</Text></View></View>
                                </View>
                            </View>

                            {Boolean(error) && (
                                <TouchableOpacity onPress={() => loadReviews()} style={{ borderRadius: 13, backgroundColor: '#FDECEC', padding: 12, marginTop: 11 }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger }]}>{error} Tap to retry.</Text></TouchableOpacity>
                            )}

                            {reviews.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -15, marginTop: 13 }} contentContainerStyle={{ paddingHorizontal: 15 }}>
                                    {[['all', 'All'], ['5', '5 stars'], ['4', '4 stars'], ['3', '3 stars'], ['2', '2 stars'], ['1', '1 star']].map(([key, label]) => {
                                        const selected = filter === key;
                                        const count = key === 'all' ? reviews.length : reviews.filter((review) => Number(review.rating) === Number(key)).length;
                                        return (
                                            <TouchableOpacity key={key} onPress={() => setFilter(key)} style={{ minHeight: 38, borderRadius: 19, paddingHorizontal: 12, marginRight: 7, backgroundColor: selected ? COLORS.primary : colors.card, borderWidth: 1, borderColor: selected ? COLORS.primary : colors.borderColor, flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.text }]}>{label}</Text>
                                                <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: selected ? 'rgba(255,255,255,.2)' : colors.background, marginLeft: 6, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.textLight, fontSize: 8 }]}>{count}</Text></View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )}
                            {visibleReviews.length > 0 && <Text style={[FONTS.h6, { color: colors.title, marginTop: 15, marginBottom: 10 }]}>Review history</Text>}
                        </>
                    )}
                    ListEmptyComponent={!error ? (
                        <View style={{ minHeight: 300, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
                            <View style={{ height: 66, width: 66, borderRadius: 22, backgroundColor: '#FFF3DC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={reviews.length ? 'filter' : 'star'} size={28} color="#B56700" /></View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 15 }]}>{reviews.length ? 'No reviews in this filter' : 'No reviews submitted yet'}</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 20, marginTop: 5 }]}>{reviews.length ? 'Choose another rating to see more reviews.' : 'Open an ad and use Seller reviews to share your buying experience.'}</Text>
                            {!reviews.length && <TouchableOpacity onPress={() => navigation.navigate('Items')} style={{ height: 45, borderRadius: 12, backgroundColor: COLORS.primary, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 17 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>Browse ads</Text></TouchableOpacity>}
                        </View>
                    ) : null}
                    renderItem={({ item }) => (
                        <View style={{ borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, padding: 14, marginBottom: 11 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1, minWidth: 0 }}>
                                    <ReviewStars rating={item.rating} size={13} />
                                    <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title, marginTop: 8 }]}>{item.listing_title || 'Reviewed seller'}</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, marginTop: 3 }]}>Seller: {item.seller_name || 'QOT seller'} · {formatDate(item.created_at)}</Text>
                                </View>
                                <View style={{ borderRadius: 9, backgroundColor: item.is_visible ? '#EAF8F0' : '#FFF3DC', paddingHorizontal: 8, paddingVertical: 5 }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: item.is_visible ? '#176B44' : '#9A5B00', fontSize: 8 }]}>{item.is_visible ? 'Published' : 'Under review'}</Text></View>
                            </View>
                            <Text style={[FONTS.fontSm, { color: colors.title, lineHeight: 21, marginTop: 11 }]}>{item.comment || 'No written comment was added.'}</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 13 }}>
                                {item.listing && <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { listingId: item.listing })} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="tag" size={14} color={COLORS.white} /><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, marginLeft: 6 }]}>View ad</Text></TouchableOpacity>}
                                {item.seller && <TouchableOpacity onPress={() => navigation.navigate('Anotherprofile', { sellerId: item.seller })} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="user" size={14} color={COLORS.primary} /><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 6 }]}>View seller</Text></TouchableOpacity>}
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default MyReviews;
