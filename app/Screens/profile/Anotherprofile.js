import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {
    followSeller,
    getSeller,
    getSellerListings,
    unfollowSeller,
} from '../../api/account';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatPrice, formatRelativeTime } from '../../utils/formatters';
import { hasPrimaryVerification } from '../../utils/verification';

const Anotherprofile = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const sellerId = route?.params?.sellerId;
    const [seller, setSeller] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [following, setFollowing] = useState(false);
    const [updatingFollow, setUpdatingFollow] = useState(false);
    const [error, setError] = useState('');

    const loadSeller = useCallback(async (refresh = false) => {
        if (!sellerId) {
            setError('Seller profile not found.');
            setLoading(false);
            return;
        }
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [sellerData, listingData] = await Promise.all([
                getSeller(sellerId),
                getSellerListings(sellerId),
            ]);
            setSeller(sellerData);
            setFollowing(Boolean(sellerData.is_following));
            setListings(listingData);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sellerId]);

    useEffect(() => {
        loadSeller();
    }, [loadSeller]);

    const toggleFollow = async () => {
        if (!seller || updatingFollow) return;
        if (!user) {
            navigation.navigate('SignIn');
            return;
        }
        if (!hasPrimaryVerification(user)) {
            navigation.navigate('VerifyAccount');
            return;
        }
        setUpdatingFollow(true);
        try {
            const result = following ? await unfollowSeller(seller.id) : await followSeller(seller.id);
            setFollowing(Boolean(result.is_following));
            setSeller((current) => ({ ...current, followers_count: result.followers_count }));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setUpdatingFollow(false);
        }
    };

    const shareProfile = () => Share.share({
        message: `View ${seller?.full_name || 'this seller'} on QOT: https://qot.ug/sellers/${sellerId}`,
    });

    if (loading) {
        return (
            <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
                <Header title="Seller profile" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const isOwnProfile = String(seller?.id) === String(user?.id);

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="Seller profile" leftIcon="back" titleLeft />
            <FlatList
                data={listings}
                keyExtractor={(item) => String(item.id)}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSeller(true)} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
                contentContainerStyle={{ padding: 15, paddingBottom: 35, flexGrow: 1 }}
                ListHeaderComponent={(
                    <>
                        {Boolean(error) && (
                            <TouchableOpacity onPress={() => loadSeller()} style={{ backgroundColor: '#FDECEC', borderRadius: 11, padding: 12, marginBottom: 12 }}>
                                <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text>
                            </TouchableOpacity>
                        )}
                        {seller && (
                            <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 18, overflow: 'hidden', marginBottom: 21 }}>
                                <View style={{ height: 134, backgroundColor: '#FFF3E8' }}>
                                    {seller.cover_photo ? <Image source={{ uri: seller.cover_photo }} style={{ height: '100%', width: '100%' }} resizeMode="cover" /> : null}
                                    <TouchableOpacity onPress={shareProfile} style={{ position: 'absolute', right: 10, top: 10, height: 38, width: 38, borderRadius: 19, backgroundColor: 'rgba(18,9,46,.72)', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="share-2" size={17} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ paddingHorizontal: 15, paddingBottom: 17 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: -39 }}>
                                        <View style={{ height: 86, width: 86, borderRadius: 43, padding: 4, backgroundColor: colors.card }}>
                                            <Image source={seller.avatar ? { uri: seller.avatar } : IMAGES.user} style={{ height: 78, width: 78, borderRadius: 39, backgroundColor: '#F1F2F5' }} />
                                        </View>
                                        {!isOwnProfile && (
                                            <TouchableOpacity disabled={updatingFollow} onPress={toggleFollow} style={{ marginLeft: 'auto', marginBottom: 4, minWidth: 96, height: 38, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: following ? colors.card : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                                                {updatingFollow ? <ActivityIndicator size="small" color={following ? COLORS.primary : COLORS.white} /> : <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: following ? COLORS.primary : COLORS.white }]}>{following ? 'Following' : 'Follow'}</Text>}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9 }}>
                                        <Text style={[FONTS.h5, { color: colors.title, flexShrink: 1 }]}>{seller.full_name}</Text>
                                        {seller.is_verified && <FeatherIcon name="check-circle" size={17} color={COLORS.primary} style={{ marginLeft: 7 }} />}
                                    </View>
                                    {seller.business_name ? <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary, marginTop: 2 }]}>{seller.business_name}</Text> : null}
                                    {seller.bio ? <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 8, lineHeight: 20 }]}>{seller.bio}</Text> : null}
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 11 }}>
                                        <Text style={[FONTS.fontXs, { color: colors.text }]}><FeatherIcon name="map-pin" size={12} /> {seller.area_name ? `${seller.area_name}, ${seller.city_name || ''}` : seller.city_name || 'Uganda'}</Text>
                                        <Text style={[FONTS.fontXs, { color: colors.text }]}><FeatherIcon name="calendar" size={12} /> Joined {formatDate(seller.date_joined)}</Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('SellerReviews', { sellerId: seller.id, sellerName: seller.full_name })} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <FeatherIcon name="star" size={12} color="#E89A00" />
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 4 }]}>{seller.average_rating || 0} ({seller.total_reviews || 0} reviews)</Text>
                                            <FeatherIcon name="chevron-right" size={13} color={COLORS.primary} style={{ marginLeft: 2 }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
                                    {[
                                        ['Ads', seller.total_active_listings || 0, null],
                                        ['Followers', seller.followers_count || 0, 'followers'],
                                        ['Following', seller.following_count || 0, 'following'],
                                    ].map(([label, value, networkTab], index) => (
                                        <TouchableOpacity
                                            key={label}
                                            disabled={!networkTab}
                                            onPress={() => navigation.navigate('FollowerFollowing', { userId: seller.id, initialTab: networkTab })}
                                            style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.border }}
                                        >
                                            <Text style={[FONTS.h6, { color: colors.title }]}>{value}</Text>
                                            <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                        {seller && (
                            <TouchableOpacity onPress={() => navigation.navigate('SellerReviews', { sellerId: seller.id, sellerName: seller.full_name })} style={{ minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.card, paddingHorizontal: 13, marginBottom: 18, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 35, width: 35, borderRadius: 11, backgroundColor: '#FFF3DC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="star" size={16} color="#B56700" /></View>
                                <View style={{ flex: 1, marginLeft: 10 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Seller reviews</Text><Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>Read feedback from QOT buyers</Text></View>
                                <FeatherIcon name="chevron-right" size={18} color={colors.textLight} />
                            </TouchableOpacity>
                        )}
                        <Text style={[FONTS.h6, { color: colors.title, marginBottom: 10 }]}>Seller’s ads</Text>
                    </>
                )}
                ListEmptyComponent={!error ? (
                    <View style={{ alignItems: 'center', paddingVertical: 45 }}>
                        <FeatherIcon name="tag" size={30} color={colors.textLight} />
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title, marginTop: 10 }]}>No active ads</Text>
                    </View>
                ) : null}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ItemDetails', { listingId: item.id })}
                        activeOpacity={0.82}
                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 10, marginBottom: 11, flexDirection: 'row' }}
                    >
                        <Image source={item.primary_image ? { uri: item.primary_image } : IMAGES.detail1} style={{ height: 82, width: 92, borderRadius: 9, backgroundColor: colors.border }} resizeMode="cover" />
                        <View style={{ flex: 1, marginLeft: 11 }}>
                            <Text numberOfLines={2} style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{item.title}</Text>
                            <Text style={[FONTS.h6, { color: COLORS.primary, marginTop: 4 }]}>{formatPrice(item.price, item.currency)}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <FeatherIcon name="map-pin" size={12} color={colors.text} />
                                <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, flex: 1, marginLeft: 3 }]}>{item.area_name || item.city_name || 'Uganda'}</Text>
                                <Text style={[FONTS.fontXs, { color: colors.text }]}>{formatRelativeTime(item.created_at)}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

export default Anotherprofile;
