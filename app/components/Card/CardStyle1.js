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
    const { colors } = useTheme();
    const navigation = useNavigation();
    const imageSource = item.primary_image
        ? { uri: item.primary_image }
        : (item.image || IMAGES.detail1);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ItemDetails', { listingId: item.id })}
        >
            <View
                style={[
                    {
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.borderColor,
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Text style={[FONTS.h5, { fontSize: 15, color: COLORS.primary }]}>{formatPrice(item.price, item.currency)}</Text>
                            {item.is_negotiable && <Text style={[FONTS.fontXs, FONTS.fontTitle, { fontSize: 8, color: COLORS.primary, backgroundColor: `${COLORS.primary}10`, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 5 }]}>NEGOTIABLE</Text>}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <FeatherIcon size={12} color={colors.text} name="map-pin" />
                        <Text
                            numberOfLines={1}
                            style={[FONTS.fontXs, { fontSize: 11, color: colors.text, marginLeft: 4, flex: 1 }]}
                        >
                            {item.city_name || item.location || 'Uganda'}{Number.isFinite(item.distance_km) ? ` · ${formatDistance(item.distance_km)}` : ''}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7, minWidth: 0 }}>
                        <FeatherIcon size={11} color={colors.textLight} name="eye" />
                        <Text numberOfLines={1} style={[FONTS.fontXs, { fontSize: 9, color: colors.text, marginLeft: 4 }]}>{Number(item.views_count || item.views || 0).toLocaleString()} views</Text>
                        <View style={{ height: 3, width: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: list ? 7 : 5 }} />
                        <FeatherIcon size={10} color={colors.textLight} name="clock" />
                        <Text numberOfLines={1} style={[FONTS.fontXs, { fontSize: 9, color: colors.text, marginLeft: 4, flexShrink: 1 }]}>{formatRelativeTime(item.created_at || item.published_at)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default memo(CardStyle1);
