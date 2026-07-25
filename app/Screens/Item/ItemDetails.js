import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Swiper from 'react-native-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import LikeBtn from '../../components/LikeBtn';
import CardStyle1 from '../../components/Card/CardStyle1';
import ReportAdModal from '../../components/ReportAdModal';
import AdPhotoGallery from '../../components/AdPhotoGallery';
import BuyerContactModal from '../../components/BuyerContactModal';
import { getListing, getListingsPage } from '../../api/marketplace';
import { followSeller, getSeller, unfollowSeller } from '../../api/account';
import { createChatThread, sendChatOffer } from '../../api/chats';
import { formatDate, formatPrice, formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { recordRecentlyViewed } from '../../utils/recentlyViewed';
import { getComparisonAds, toggleComparisonAd } from '../../utils/compareAds';
import {
    distanceToListing,
    formatDistance,
    getStoredBuyerLocation,
} from '../../utils/nearbyAds';

const displayAttributeValue = (attribute) => {
    if (attribute.display_value !== null && attribute.display_value !== '') return attribute.display_value;
    if (attribute.value_text !== null && attribute.value_text !== '') return attribute.value_text;
    if (attribute.value_number !== null && attribute.value_number !== '') return attribute.value_number;
    if (attribute.value_boolean !== null && attribute.value_boolean !== undefined) {
        return attribute.value_boolean ? 'Yes' : 'No';
    }
    return '—';
};

const ItemDetails = ({ route, navigation }) => {
    const theme = useTheme();
    const { colors } = theme;
    const { user } = useAuth();
    const listingId = route.params?.listingId;
    const [listing, setListing] = useState(null);
    const [seller, setSeller] = useState(null);
    const [similarListings, setSimilarListings] = useState([]);
    const [following, setFollowing] = useState(false);
    const [updatingFollow, setUpdatingFollow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [startingChat, setStartingChat] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [compared, setCompared] = useState(false);
    const [distanceKm, setDistanceKm] = useState(null);

    const loadListing = useCallback(async () => {
        if (!listingId) {
            setError('This listing could not be opened.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const listingData = await getListing(listingId);
            setListing(listingData);
            const [sellerResult, similarResult] = await Promise.allSettled([
                getSeller(listingData.seller),
                getListingsPage({
                    category: listingData.category_name,
                    page_size: 8,
                    sort: 'newest',
                }),
            ]);
            if (sellerResult.status === 'fulfilled') {
                setSeller(sellerResult.value);
                setFollowing(Boolean(sellerResult.value.is_following));
            }
            if (similarResult.status === 'fulfilled') {
                setSimilarListings(similarResult.value.results.filter((item) => String(item.id) !== String(listingData.id)).slice(0, 8));
            }
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        loadListing();
    }, [loadListing]);

    useEffect(() => {
        if (!listing?.id) return;
        recordRecentlyViewed(listing).catch(() => {
            // Browsing history is optional and must never interrupt an ad page.
        });
        getComparisonAds().then((items) => setCompared(items.some((item) => String(item.id) === String(listing.id))));
        getStoredBuyerLocation().then(async (buyerLocation) => {
            if (!buyerLocation) return;
            const distance = await distanceToListing(listing, buyerLocation);
            setDistanceKm(distance);
        }).catch(() => {});
    }, [listing?.id]);

    const toggleCompare = async () => {
        if (!listing) return;
        const result = await toggleComparisonAd(listing);
        if (result.limitReached) {
            Alert.alert('Comparison is full', 'You can compare up to three ads. Open the comparison and remove one first.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'View comparison', onPress: () => navigation.navigate('CompareAds') },
            ]);
            return;
        }
        setCompared(result.isCompared);
    };

    const images = useMemo(() => {
        const remoteImages = (listing?.images || [])
            .map((item) => item.image_url || item.image)
            .filter(Boolean)
            .map((uri) => ({ uri }));
        return remoteImages.length ? remoteImages : [IMAGES.detail1];
    }, [listing]);

    const shareListing = async () => {
        if (!listing) return;
        await Share.share({
            message: `${listing.title} on QOT Uganda\nhttps://qot.ug/ads/${listing.id}`,
        });
    };

    const openContact = async (scheme) => {
        if (!listing?.seller_phone) return;
        const target = `${scheme}:${listing.seller_phone}`;
        if (await Linking.canOpenURL(target)) await Linking.openURL(target);
    };

    const contactSeller = async (initialMessage, offer = null) => {
        if (!listing?.id || startingChat) return;

        setStartingChat(true);
        try {
            const result = await createChatThread(
                listing.id,
                initialMessage,
            );
            const thread = result.thread || result;
            if (!thread?.id) throw new Error('The conversation could not be opened.');
            if (offer?.offerAmount) {
                await sendChatOffer(thread.id, offer.offerAmount);
            }
            setContactModalOpen(false);
            navigation.navigate('SingleChat', {
                threadId: thread.id,
                thread,
            });
        } catch (requestError) {
            throw requestError;
        } finally {
            setStartingChat(false);
        }
    };

    const toggleFollow = async () => {
        if (!seller || updatingFollow) return;
        setUpdatingFollow(true);
        try {
            const result = following ? await unfollowSeller(seller.id) : await followSeller(seller.id);
            setFollowing(Boolean(result.is_following));
            setSeller((current) => ({ ...current, followers_count: result.followers_count }));
        } catch (requestError) {
            Alert.alert('Could not update seller', requestError.message || 'Please try again.');
        } finally {
            setUpdatingFollow(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading ad...</Text>
            </SafeAreaView>
        );
    }

    if (!listing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={[GlobalStyleSheet.container, { flex: 1, alignItems: 'center', justifyContent: 'center' }] }>
                    <FeatherIcon name="alert-circle" size={38} color={COLORS.danger} />
                    <Text style={[FONTS.font, { color: colors.title, textAlign: 'center', marginVertical: 15 }] }>{error}</Text>
                    <TouchableOpacity onPress={loadListing} style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}>
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Try again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 15 }}>
                        <Text style={[FONTS.font, { color: COLORS.primary }]}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isOwner = String(user?.id) === String(listing.seller);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 95 }}>
                    <View style={{ height: Platform.OS === 'web' ? SIZES.height / 3.5 : SIZES.height / 2.8 }}>
                        <Swiper
                            loop={false}
                            showsPagination={images.length > 1}
                            onIndexChanged={setActiveImageIndex}
                            paginationStyle={{ bottom: 12 }}
                            dotStyle={{ height: 6, width: 6, backgroundColor: 'rgba(255,255,255,.45)' }}
                            activeDotStyle={{ height: 8, width: 8, backgroundColor: COLORS.white }}
                        >
                            {images.map((source, index) => (
                                <TouchableOpacity
                                    key={source.uri || index}
                                    activeOpacity={0.96}
                                    onPress={() => {
                                        setActiveImageIndex(index);
                                        setGalleryOpen(true);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    <Image style={{ height: '100%', width: '100%', resizeMode: 'cover' }} source={source} />
                                    <LinearGradient
                                        colors={['rgba(0,0,0,.5)', 'rgba(0,0,0,0)']}
                                        style={{ position: 'absolute', height: 100, width: '100%', top: 0 }}
                                    />
                                    <View style={{ position: 'absolute', right: 14, bottom: 15, borderRadius: 18, backgroundColor: 'rgba(15,23,42,.68)', paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
                                        <FeatherIcon name="maximize-2" size={14} color={COLORS.white} />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, marginLeft: 5 }]}>{index + 1}/{images.length}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Swiper>

                        <View
                            style={[
                                GlobalStyleSheet.container,
                                {
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    paddingVertical: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={{ height: 38, width: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,.28)', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FeatherIcon size={22} color={COLORS.white} name="chevron-left" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={shareListing} style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon size={21} color={COLORS.white} name="share-2" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleCompare} accessibilityLabel={compared ? 'Remove from comparison' : 'Compare this ad'} style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon size={21} color={compared ? COLORS.primary : COLORS.white} name={compared ? 'check-square' : 'columns'} />
                            </TouchableOpacity>
                            <View style={{ height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }}>
                                <LikeBtn listingId={listing.id} initialLiked={Boolean(listing.is_favorited)} />
                            </View>
                        </View>
                    </View>

                    <View style={GlobalStyleSheet.container}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
                            {listing.is_featured && (
                                <View style={{ backgroundColor: '#FF5A1F', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, marginRight: 8 }}>
                                    <Text style={{ ...FONTS.fontXs, fontSize: 9, color: COLORS.white, fontWeight: '700' }}>FEATURED</Text>
                                </View>
                            )}
                            <Text style={[FONTS.fontXs, { color: colors.text }] }>
                                {listing.category_parent_name || listing.category_name}
                            </Text>
                            {listing.status !== 'active' && (
                                <View style={{ backgroundColor: listing.status === 'rejected' ? '#FDECEC' : '#FFF3D6', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, marginLeft: 8 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: listing.status === 'rejected' ? '#B42318' : '#A15C00', fontSize: 9, textTransform: 'uppercase' }]}>{listing.status === 'pending' ? 'Pending approval' : listing.status}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[FONTS.h5, FONTS.fontMedium, { color: colors.title, marginBottom: 8 }] }>{listing.title}</Text>
                        <Text style={[FONTS.h4, { color: COLORS.primary, marginBottom: 14 }] }>
                            {formatPrice(listing.price, listing.currency)}
                        </Text>
                        {listing.is_negotiable && (
                            <View style={{ alignSelf: 'flex-start', borderRadius: 7, backgroundColor: `${COLORS.primary}10`, paddingHorizontal: 8, paddingVertical: 4, marginTop: -9, marginBottom: 14 }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary }]}>Price is negotiable</Text></View>
                        )}

                        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, paddingVertical: 13, marginBottom: 20 }}>
                            {[
                                ['tag', 'Condition', listing.condition ? `${listing.condition[0].toUpperCase()}${listing.condition.slice(1)}` : '—'],
                                ['map-pin', 'Location', listing.city_name || 'Uganda'],
                                ['eye', 'Views', String(listing.views_count || 0)],
                            ].map(([icon, label, value], index) => (
                                <View
                                    key={label}
                                    style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4, borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.borderColor }}
                                >
                                    <FeatherIcon name={icon} size={15} color={colors.text} />
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 5 }] }>{label}</Text>
                                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: colors.title, marginTop: 2 }] }>{value}</Text>
                                </View>
                            ))}
                        </View>

                        {Number.isFinite(distanceKm) && (
                            <View style={{ borderRadius: 11, backgroundColor: '#EAF8F0', paddingHorizontal: 11, paddingVertical: 9, marginTop: -11, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <FeatherIcon name="navigation" size={14} color="#18864B" />
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#18864B', marginLeft: 7 }]}>Approximately {formatDistance(distanceKm).toLowerCase()}</Text>
                                <Text style={[FONTS.fontXs, { color: '#397255', flex: 1, textAlign: 'right' }]}>Based on city</Text>
                            </View>
                        )}

                        {listing.status === 'rejected' && Boolean(listing.rejection_reason) && (
                            <View style={{ backgroundColor: '#FFF1F0', borderWidth: 1, borderColor: '#F8B4B4', borderRadius: 12, padding: 13, marginBottom: 20, flexDirection: 'row' }}>
                                <FeatherIcon name="alert-triangle" size={19} color="#B42318" />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318' }]}>Why your ad was rejected</Text>
                                    <Text style={[FONTS.fontSm, { color: '#9B2C2C', marginTop: 4, lineHeight: 20 }]}>{listing.rejection_reason}</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Sell', { listingId: listing.id })} style={{ alignSelf: 'flex-start', marginTop: 9 }}>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#B42318', textDecorationLine: 'underline' }]}>Edit and resubmit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <Text style={[FONTS.fontSm, FONTS.fontMedium, { color: colors.title, marginBottom: 8 }]}>Description</Text>
                        <View style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)', borderRadius: SIZES.radius, padding: 15 }}>
                            <Text style={[FONTS.fontSm, { color: colors.title, lineHeight: 21 }] }>
                                {listing.description || 'The seller has not added a description.'}
                            </Text>
                        </View>

                        {Boolean(listing.attributes?.length) && (
                            <View style={{ marginTop: 20 }}>
                                <Text style={[FONTS.fontSm, FONTS.fontMedium, { color: colors.title, marginBottom: 8 }]}>Details</Text>
                                <View style={{ borderWidth: 1, borderColor: colors.borderColor, borderRadius: SIZES.radius, overflow: 'hidden' }}>
                                    {listing.attributes.map((attribute, index) => (
                                        <View
                                            key={attribute.id}
                                            style={{
                                                flexDirection: 'row',
                                                paddingHorizontal: 14,
                                                paddingVertical: 11,
                                                backgroundColor: index % 2 ? colors.background : colors.card,
                                            }}
                                        >
                                            <Text style={[FONTS.fontSm, { color: colors.text, flex: 1 }] }>{attribute.filter_name}</Text>
                                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, flex: 1, textAlign: 'right' }] }>
                                                {displayAttributeValue(attribute)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={[GlobalStyleSheet.container, { paddingTop: 20 }]}>
                        <View style={{ borderWidth: 1, borderColor: '#F1D2A8', backgroundColor: '#FFF9EF', borderRadius: 16, padding: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ height: 39, width: 39, borderRadius: 12, backgroundColor: '#FFF0D5', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="shield" size={20} color="#B56700" /></View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: '#7A4500' }]}>Buyer safety</Text>
                                    <Text style={[FONTS.fontXs, { color: '#8A5A18', marginTop: 2 }]}>Stay alert when meeting or paying a seller.</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 11 }}>
                                {[
                                    'Meet in a safe public place and inspect the item first.',
                                    'Do not send advance payments for items you have not seen.',
                                    'Never share passwords, PINs or verification codes.',
                                ].map((tip) => (
                                    <View key={tip} style={{ flexDirection: 'row', marginTop: 6 }}><FeatherIcon name="check-circle" size={14} color="#B56700" style={{ marginTop: 2 }} /><Text style={[FONTS.fontXs, { color: '#704E21', flex: 1, lineHeight: 18, marginLeft: 7 }]}>{tip}</Text></View>
                                ))}
                            </View>
                            {!isOwner && (
                                <TouchableOpacity
                                    onPress={() => setReportModalOpen(true)}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1D2A8' }}
                                >
                                    <View style={{ height: 34, width: 34, borderRadius: 11, backgroundColor: '#FFE9E7', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name="flag" size={16} color={COLORS.danger} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 9 }}>
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: '#8C2520' }]}>Report this ad</Text>
                                        <Text style={[FONTS.fontXs, { color: '#8A5A18', marginTop: 1 }]}>Tell QOT about suspicious or prohibited content.</Text>
                                    </View>
                                    <FeatherIcon name="chevron-right" size={18} color="#8C2520" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={[FONTS.h6, { color: colors.title, marginTop: 22, marginBottom: 10 }]}>Seller information</Text>
                        <TouchableOpacity disabled={isOwner} onPress={() => navigation.navigate('Anotherprofile', { sellerId: listing.seller })} activeOpacity={0.84} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 16, overflow: 'hidden' }}>
                            <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={seller?.avatar ? { uri: seller.avatar } : IMAGES.user} style={{ height: 58, width: 58, borderRadius: 29, backgroundColor: colors.border }} resizeMode="cover" />
                                <View style={{ flex: 1, marginLeft: 11 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title, flexShrink: 1 }]}>{seller?.full_name || listing.seller_name || 'QOT seller'}</Text>
                                        {seller?.is_verified && <FeatherIcon name="check-circle" size={16} color={COLORS.primary} style={{ marginLeft: 6 }} />}
                                    </View>
                                    {seller?.business_name ? <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginTop: 2 }]}>{seller.business_name}</Text> : null}
                                    <TouchableOpacity
                                        onPress={(event) => {
                                            event.stopPropagation?.();
                                            navigation.navigate('SellerReviews', {
                                                sellerId: listing.seller,
                                                sellerName: seller?.full_name || listing.seller_name,
                                                listingId: listing.id,
                                                listingTitle: listing.title,
                                            });
                                        }}
                                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, alignSelf: 'flex-start' }}
                                    >
                                        <FeatherIcon name="star" size={13} color="#E89A00" />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 4 }]}>{Number(seller?.average_rating || 0).toFixed(1)} ({seller?.total_reviews || 0} reviews)</Text>
                                        <FeatherIcon name="chevron-right" size={13} color={COLORS.primary} style={{ marginLeft: 2 }} />
                                    </TouchableOpacity>
                                </View>
                                {!isOwner && <FeatherIcon name="chevron-right" size={20} color={colors.textLight} />}
                            </View>
                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
                                {[
                                    ['Ads', seller?.total_active_listings || 0],
                                    ['Followers', seller?.followers_count || 0],
                                    ['Joined', seller?.date_joined ? formatDate(seller.date_joined) : '—'],
                                ].map(([label, value], index) => (
                                    <View key={label} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4, paddingVertical: 11, borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.border }}><Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{value}</Text><Text style={[FONTS.fontXs, { color: colors.text, fontSize: 9, marginTop: 2 }]}>{label}</Text></View>
                                ))}
                            </View>
                            {!isOwner && (
                                <View style={{ padding: 11, borderTopWidth: 1, borderTopColor: colors.border }}>
                                    <TouchableOpacity disabled={updatingFollow} onPress={(event) => { event.stopPropagation?.(); toggleFollow(); }} style={{ height: 43, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, backgroundColor: following ? colors.card : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                                        {updatingFollow ? <ActivityIndicator size="small" color={following ? COLORS.primary : COLORS.white} /> : <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: following ? COLORS.primary : COLORS.white }]}>{following ? 'Following' : 'Follow seller'}</Text>}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <FeatherIcon name="clock" size={14} color={colors.text} />
                            <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 5 }]}>Posted {formatRelativeTime(listing.created_at)} · Ad ID {listing.id}</Text>
                        </View>
                    </View>

                    {Boolean(similarListings.length) && (
                        <View style={{ marginTop: 23 }}>
                            <View style={[GlobalStyleSheet.container, { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }]}>
                                <Text style={[FONTS.h6, { color: colors.title, flex: 1 }]}>Similar ads</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Items', { cat: listing.category_name, categorySlug: listing.category_name })} style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>View all</Text><FeatherIcon name="chevron-right" size={16} color={COLORS.primary} /></TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 15, paddingRight: 5, paddingBottom: 10 }}>
                                {similarListings.map((item) => <View key={item.id} style={{ width: 174, marginRight: 10 }}><CardStyle1 item={item} /></View>)}
                            </ScrollView>
                        </View>
                    )}
                </ScrollView>

                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        flexDirection: 'row',
                        gap: 10,
                        paddingHorizontal: 15,
                        paddingVertical: 12,
                        backgroundColor: colors.card,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderColor,
                    }}
                >
                    {isOwner ? (
                        <>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Sell', { listingId: listing.id })}
                                style={{ flex: 1, height: 48, borderWidth: 1, borderColor: COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                            >
                                <FeatherIcon name="edit-2" color={COLORS.primary} size={18} />
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 7 }]}>Edit ad</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('MyAds', { initialTab: 'ads' })}
                                style={{ flex: 1, height: 48, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                            >
                                <FeatherIcon name="settings" color={COLORS.white} size={18} />
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>My ads</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                disabled={startingChat}
                                onPress={() => setContactModalOpen(true)}
                                style={{ flex: 1, height: 48, borderWidth: 1, borderColor: COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                            >
                                {startingChat ? <ActivityIndicator color={COLORS.primary} size="small" /> : <FeatherIcon name="message-circle" color={COLORS.primary} size={18} />}
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 7 }]}>{startingChat ? 'Opening...' : 'Chat seller'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={!listing.seller_phone}
                                onPress={() => openContact('tel')}
                                style={{ flex: 1, height: 48, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: listing.seller_phone ? 1 : 0.5 }}
                            >
                                <FeatherIcon name="phone" color={COLORS.white} size={18} />
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>Call seller</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
            <ReportAdModal
                visible={reportModalOpen}
                listingId={listing.id}
                listingTitle={listing.title}
                user={user}
                onClose={() => setReportModalOpen(false)}
                onSignIn={() => navigation.navigate('SignIn')}
                onVerify={() => navigation.navigate('VerifyAccount')}
            />
            <BuyerContactModal
                visible={contactModalOpen}
                listing={listing}
                user={user}
                submitting={startingChat}
                onClose={() => setContactModalOpen(false)}
                onSubmit={contactSeller}
                onSignIn={() => navigation.navigate('SignIn')}
                onVerify={() => navigation.navigate('VerifyAccount')}
            />
            <AdPhotoGallery
                visible={galleryOpen}
                images={images}
                initialIndex={activeImageIndex}
                title={listing.title}
                onClose={() => setGalleryOpen(false)}
            />
        </SafeAreaView>
    );
};

export default ItemDetails;
