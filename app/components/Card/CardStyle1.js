import React, { memo, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import LikeBtn from '../LikeBtn';
import { formatPrice, formatRelativeTime } from '../../utils/formatters';
import { getComparisonAds, toggleComparisonAd } from '../../utils/compareAds';
import { formatDistance } from '../../utils/nearbyAds';

const CardStyle1 = ({ item, list, onFavoriteChange, onFavoriteError, showCompare = false, onCompareChange, onCompareError }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [compared, setCompared] = useState(false);
    const imageSource = item.primary_image
        ? { uri: item.primary_image }
        : (item.image || IMAGES.detail1);

    useEffect(() => {
        if (!showCompare) return;
        getComparisonAds().then((items) => setCompared(items.some((saved) => String(saved.id) === String(item.id))));
    }, [item.id, showCompare]);

    const toggleCompare = async () => {
        const result = await toggleComparisonAd(item);
        if (result.limitReached) {
            onCompareError?.('You can compare up to three ads. Remove one before adding another.');
            return;
        }
        setCompared(result.isCompared);
        onCompareChange?.(result.items.length, result.isCompared, item);
    };

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
                    <Image
                        source={imageSource}
                        resizeMode="cover"
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
                                backgroundColor: '#FF5A1F',
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
                    {showCompare && (
                        <TouchableOpacity
                            onPress={toggleCompare}
                            accessibilityLabel={compared ? `Remove ${item.title} from comparison` : `Compare ${item.title}`}
                            style={{ position: 'absolute', left: 7, bottom: 7, height: 30, minWidth: 30, borderRadius: 10, backgroundColor: compared ? COLORS.primary : 'rgba(15,23,42,.7)', paddingHorizontal: compared ? 8 : 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <FeatherIcon name={compared ? 'check' : 'columns'} size={14} color={COLORS.white} />
                            {compared && <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.white, fontSize: 8, marginLeft: 4 }]}>COMPARE</Text>}
                        </TouchableOpacity>
                    )}
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
                    {list && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7 }}>
                            <FeatherIcon size={12} color={colors.text} name="eye" />
                            <Text style={[FONTS.fontXs, { fontSize: 10, color: colors.text, marginLeft: 4 }]}>{Number(item.views_count || 0).toLocaleString()} views</Text>
                            <View style={{ height: 3, width: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 7 }} />
                            <FeatherIcon size={11} color={colors.text} name="clock" />
                            <Text style={[FONTS.fontXs, { fontSize: 10, color: colors.text, marginLeft: 4 }]}>{formatRelativeTime(item.created_at)}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default memo(CardStyle1);
