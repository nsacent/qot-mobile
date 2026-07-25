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
import Header from '../../layout/Header';
import CardStyle1 from '../../components/Card/CardStyle1';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { getFollowingFeed } from '../../api/account';
import { useAuth } from '../../context/AuthContext';

const FollowingFeed = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const [sellers, setSellers] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [partial, setPartial] = useState(false);
    const [error, setError] = useState('');

    const loadFeed = useCallback(async (refresh = false) => {
        if (!isAuthenticated || !user?.id) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const data = await getFollowingFeed(user.id);
            setSellers(data.sellers);
            setListings(data.listings);
            setPartial(Boolean(data.partial));
        } catch (requestError) {
            setError(requestError.message || 'Your following feed could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        loadFeed();
        return navigation.addListener('focus', () => loadFeed());
    }, [loadFeed, navigation]);

    const openSeller = (seller) => navigation.navigate('Anotherprofile', { sellerId: seller.id });

    const sellerRail = sellers.length > 0 ? (
        <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flex: 1 }]}>Sellers you follow</Text>
                <Text style={[FONTS.fontXs, { color: colors.text }]}>{sellers.length} seller{sellers.length === 1 ? '' : 's'}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
                {sellers.map((seller) => (
                    <TouchableOpacity key={seller.id} onPress={() => openSeller(seller)} activeOpacity={0.82} style={{ width: 76, marginRight: 9, alignItems: 'center' }}>
                        <View style={{ height: 56, width: 56, borderRadius: 19, padding: 2, borderWidth: 1, borderColor: `${COLORS.primary}66`, backgroundColor: colors.card }}>
                            <Image source={seller.avatar ? { uri: seller.avatar } : IMAGES.user} style={{ height: 50, width: 50, borderRadius: 17, backgroundColor: colors.border }} />
                        </View>
                        <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, fontSize: 9, marginTop: 5, width: '100%', textAlign: 'center' }]}>{seller.business_name || seller.full_name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    ) : null;

    const listHeader = (
        <View>
            <View style={{ minHeight: 86, borderRadius: 18, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', padding: 14, marginBottom: 17, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <FeatherIcon name="user-check" size={20} color={COLORS.white} />
                </View>
                <View style={{ flex: 1, marginLeft: 11 }}>
                    <Text style={[FONTS.h6, { color: colors.title }]}>Fresh from your sellers</Text>
                    <Text style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginTop: 3 }]}>The newest active ads from every seller you follow.</Text>
                </View>
            </View>

            {partial && (
                <TouchableOpacity onPress={() => loadFeed()} style={{ borderRadius: 12, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', padding: 11, marginBottom: 13, flexDirection: 'row', alignItems: 'center' }}>
                    <FeatherIcon name="alert-circle" size={15} color="#C2410C" />
                    <Text style={[FONTS.fontXs, { color: '#9A3412', flex: 1, marginLeft: 7 }]}>Some sellers could not be refreshed. Tap to try again.</Text>
                </TouchableOpacity>
            )}

            {Boolean(error) && listings.length > 0 && (
                <TouchableOpacity onPress={() => loadFeed()} style={{ borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', padding: 11, marginBottom: 13, flexDirection: 'row', alignItems: 'center' }}>
                    <FeatherIcon name="wifi-off" size={15} color={COLORS.danger} />
                    <Text style={[FONTS.fontXs, { color: COLORS.danger, flex: 1, marginLeft: 7 }]}>{error} Tap to try again.</Text>
                </TouchableOpacity>
            )}

            {sellerRail}
            {listings.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={[FONTS.h6, { color: colors.title, flex: 1 }]}>Latest ads</Text>
                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>{listings.length} ad{listings.length === 1 ? '' : 's'}</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <Header title="Following feed" leftIcon="back" titleLeft />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 11 }]}>Gathering new ads…</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Following feed" leftIcon="back" titleLeft />
            <FlatList
                data={listings}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFeed(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                contentContainerStyle={[GlobalStyleSheet.container, { paddingTop: 12, paddingBottom: 40, flexGrow: 1 }]}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={(
                    <View style={{ minHeight: 300, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 }}>
                        <View style={{ height: 70, width: 70, borderRadius: 23, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name={error ? 'wifi-off' : sellers.length ? 'inbox' : 'users'} size={28} color={COLORS.primary} />
                        </View>
                        <Text style={[FONTS.h6, { color: colors.title, textAlign: 'center', marginTop: 15 }]}>{!isAuthenticated ? 'Sign in to see your feed' : error ? 'Feed unavailable' : sellers.length ? 'No new seller ads' : 'Follow sellers to build your feed'}</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20, textAlign: 'center', marginTop: 6 }]}>{!isAuthenticated ? 'Your following feed is linked to your QOT account.' : error || (sellers.length ? 'The sellers you follow have no active ads right now. Pull down to check again.' : 'Follow sellers you trust and their latest active ads will appear here automatically.')}</Text>
                        <TouchableOpacity onPress={() => !isAuthenticated ? navigation.navigate('SignIn') : error ? loadFeed() : navigation.navigate('Sellers')} style={{ minHeight: 44, borderRadius: 13, backgroundColor: COLORS.primary, paddingHorizontal: 18, marginTop: 18, flexDirection: 'row', alignItems: 'center' }}>
                            <FeatherIcon name={!isAuthenticated ? 'log-in' : error ? 'refresh-cw' : 'search'} size={15} color={COLORS.white} />
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>{!isAuthenticated ? 'Sign in' : error ? 'Try again' : 'Find sellers'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                renderItem={({ item }) => {
                    const seller = item.feed_seller;
                    return (
                        <View style={{ marginBottom: 14 }}>
                            {seller && (
                                <TouchableOpacity onPress={() => openSeller(seller)} activeOpacity={0.8} style={{ minHeight: 42, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={seller.avatar ? { uri: seller.avatar } : IMAGES.user} style={{ height: 30, width: 30, borderRadius: 10, backgroundColor: colors.border }} />
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
                                        <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title }]}>{seller.business_name || seller.full_name}</Text>
                                        <Text style={[FONTS.fontXs, { color: colors.textLight, fontSize: 9 }]}>Following</Text>
                                    </View>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginRight: 3 }]}>View seller</Text>
                                    <FeatherIcon name="chevron-right" size={15} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                            <CardStyle1 item={item} list />
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default FollowingFeed;
