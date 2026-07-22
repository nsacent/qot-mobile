import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { getListing } from '../../api/marketplace';
import { formatDate, formatPrice } from '../../utils/formatters';

const displayAttributeValue = (attribute) => {
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
    const listingId = route.params?.listingId;
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadListing = useCallback(async () => {
        if (!listingId) {
            setError('This listing could not be opened.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            setListing(await getListing(listingId));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        loadListing();
    }, [loadListing]);

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
            message: `${listing.title} on QOT Uganda\nhttps://qot.ug/listings/${listing.id}`,
        });
    };

    const openContact = async (scheme) => {
        if (!listing?.seller_phone) return;
        const target = `${scheme}:${listing.seller_phone}`;
        if (await Linking.canOpenURL(target)) await Linking.openURL(target);
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading listing...</Text>
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <View style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 95 }}>
                    <View style={{ height: Platform.OS === 'web' ? SIZES.height / 3.5 : SIZES.height / 2.8 }}>
                        <Swiper
                            loop={false}
                            showsPagination={images.length > 1}
                            paginationStyle={{ bottom: 12 }}
                            dotStyle={{ height: 6, width: 6, backgroundColor: 'rgba(255,255,255,.45)' }}
                            activeDotStyle={{ height: 8, width: 8, backgroundColor: COLORS.white }}
                        >
                            {images.map((source, index) => (
                                <View key={source.uri || index} style={{ flex: 1 }}>
                                    <Image style={{ height: '100%', width: '100%', resizeMode: 'cover' }} source={source} />
                                    <LinearGradient
                                        colors={['rgba(0,0,0,.5)', 'rgba(0,0,0,0)']}
                                        style={{ position: 'absolute', height: 100, width: '100%', top: 0 }}
                                    />
                                </View>
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
                        </View>
                        <Text style={[FONTS.h5, FONTS.fontMedium, { color: colors.title, marginBottom: 8 }] }>{listing.title}</Text>
                        <Text style={[FONTS.h4, { color: COLORS.primary, marginBottom: 14 }] }>
                            {formatPrice(listing.price, listing.currency)}
                        </Text>

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

                    <View style={[GlobalStyleSheet.container, { paddingTop: 5 }] }>
                        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 18 }}>
                            <Text style={[FONTS.fontXs, { color: colors.text }]}>Posted by</Text>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 3 }] }>{listing.seller_name || 'QOT seller'}</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, marginTop: 5 }] }>
                                Posted {formatDate(listing.created_at)} · Ad ID {listing.id}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                <FeatherIcon name="map-pin" size={16} color={COLORS.primary} />
                                <Text style={[FONTS.fontSm, { color: colors.title, marginLeft: 7 }] }>{listing.city_name || 'Uganda'}</Text>
                            </View>
                        </View>
                    </View>
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
                    <TouchableOpacity
                        disabled={!listing.seller_phone}
                        onPress={() => openContact('sms')}
                        style={{ flex: 1, height: 48, borderWidth: 1, borderColor: COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
                    >
                        <FeatherIcon name="message-circle" color={COLORS.primary} size={18} />
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 7 }]}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={!listing.seller_phone}
                        onPress={() => openContact('tel')}
                        style={{ flex: 1, height: 48, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', opacity: listing.seller_phone ? 1 : 0.5 }}
                    >
                        <FeatherIcon name="phone" color={COLORS.white} size={18} />
                        <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>Call seller</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ItemDetails;
