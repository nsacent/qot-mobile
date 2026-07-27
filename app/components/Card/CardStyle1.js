import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import LikeBtn from '../LikeBtn';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import { formatDistance } from '../../utils/nearbyAds';
import CachedImage from '../CachedImage';

const CardStyle1 = ({ item, list, onFavoriteChange, onFavoriteError }) => {
    const { colors, dark } = useTheme();
    const navigation = useNavigation();
    const isNearbyAd = Number.isFinite(item.distance_km);
    const imageSource = item.primary_image
        ? { uri: item.primary_image }
        : (item.image || IMAGES.detail1);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ItemDetails', { listingId: item.id })}
        >
            <View style={{
                borderRadius: SIZES.radius,
                backgroundColor: dark ? colors.card : COLORS.white,
                shadowColor: dark ? '#000000' : '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: dark ? 0.28 : 0.12,
                shadowRadius: 8,
                elevation: 4,
            }}>
                <View
                    style={[
                        {
                            backgroundColor: dark ? colors.card : COLORS.white,
                            borderWidth: 1,
                            borderColor: dark ? colors.borderColor : '#EEF2F7',
                            borderRadius: SIZES.radius,
                            overflow: 'hidden',
                        },
                        list && { flexDirection: 'row' },
                    ]}
                >
                <View style={list ? { width: 140 } : undefined}>
                    <CachedImage
                        source={imageSource}
                        resizeMode="cover"
                        cacheVersion={item.images_updated_at || item.updated_at}
                        recyclingKey={`ad-card-${item.id}-${item.primary_image || item.image || 'placeholder'}`}
                        style={[
                            {
                                width: '100%',
                                aspectRatio: 1.5,
                                backgroundColor: colors.borderColor,
                            },
                            list && { aspectRatio: 1.4 },
                        ]}
                    />
                    {item.is_featured && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                borderRadius: 5,
                                paddingHorizontal: 7,
                                paddingVertical: 3,
                                backgroundColor: COLORS.primary,
                            }}
                        >
                            <Text style={{ ...FONTS.fontXs, fontSize: 9, color: COLORS.white, fontWeight: '700' }}>
                                FEATURED
                            </Text>
                        </View>
                    )}
                    <View style={{ position: 'absolute', top: -5, right: -5 }}>
                        <LikeBtn
                            listingId={item.id}
                            initialLiked={Boolean(item.is_favorited)}
                            onChange={(isLiked, result) => onFavoriteChange?.(isLiked, result, item)}
                            onError={onFavoriteError}
                        />
                    </View>
                </View>

                <View style={[{ paddingHorizontal: 9, paddingVertical: 9 }, list && { flex: 1, paddingHorizontal: 14 }] }>
                    <View style={list ? { flex: 1 } : undefined}>
                        <Text
                            numberOfLines={1}
                            style={[FONTS.font, FONTS.fontTitle, { color: colors.title, marginBottom: 3 }]}
                        >
                            {item.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'nowrap', minWidth: 0 }}>
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.72}
                                maxFontSizeMultiplier={1.15}
                                style={[FONTS.h5, { flex: 1, minWidth: 0, fontSize: 15, color: COLORS.primary }]}
                            >
                                {formatPrice(item.price, item.currency)}
                            </Text>
                            {item.is_negotiable && (
                                <Text
                                    numberOfLines={1}
                                    maxFontSizeMultiplier={1.1}
                                    style={[FONTS.fontXs, FONTS.fontTitle, {
                                        flexShrink: 0,
                                        fontSize: 7,
                                        color: COLORS.primary,
                                        backgroundColor: `${COLORS.primary}10`,
                                        borderRadius: 5,
                                        paddingHorizontal: 4,
                                        paddingVertical: 2,
                                        marginLeft: 4,
                                    }]}
                                >
                                    NEGOTIABLE
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7, minWidth: 0 }}>
                        <FeatherIcon size={11} color={colors.textLight} name="map-pin" />
                        <Text
                            numberOfLines={1}
                            style={[FONTS.fontXs, { fontSize: 9, color: colors.text, marginLeft: 3, flex: 1 }]}
                        >
                            {item.area_name || item.city_name || item.location || 'Uganda'}{isNearbyAd ? ` · ${formatDistance(item.distance_km)}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6, flexShrink: 0 }}>
                            <FeatherIcon size={9} color={colors.textLight} name="clock" />
                            <Text numberOfLines={1} style={[FONTS.fontXs, { fontSize: 8, color: colors.text, marginLeft: 3 }]}>{formatRelativeTime(item.created_at || item.published_at)}</Text>
                        </View>
                        <View accessibilityLabel={`${Number(item.views_count || item.views || 0).toLocaleString()} views`} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6, flexShrink: 0 }}>
                            <FeatherIcon size={10} color={colors.textLight} name="eye" />
                            <Text numberOfLines={1} style={[FONTS.fontXs, { fontSize: 8, color: colors.text, marginLeft: 3 }]}>{Number(item.views_count || item.views || 0).toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default memo(CardStyle1);
