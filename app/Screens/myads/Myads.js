import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
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
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import {
    clearListingDraft,
    deleteListing,
    getListingDraft,
    getMyListings,
    markListingSold,
    pauseListing,
    renewListing,
    resumeListing,
} from '../../api/marketplace';
import { formatExpiryRemaining, formatPrice, formatRelativeTime } from '../../utils/formatters';
import CachedImage from '../../components/CachedImage';
import { useAuth } from '../../context/AuthContext';
import { clearLocalListingDraft, getLocalListingDraft } from '../../cache/localDraft';

const STATUSES = [
    ['all', 'All'],
    ['active', 'Active'],
    ['featured', 'Featured'],
    ['pending', 'Pending approval'],
    ['draft', 'Drafts'],
    ['rejected', 'Rejected'],
    ['unavailable', 'Paused'],
    ['sold', 'Sold'],
    ['expired', 'Expired'],
];

const matchesStatus = (item, status) => {
    if (status === 'all') return true;
    if (status === 'featured') return Boolean(item.is_featured);
    return item.status === status;
};

const statusDetails = {
    active: { label: 'Active', color: '#18864B', background: '#EAF8F0' },
    featured: { label: 'Featured', color: '#C44F0A', background: '#FFF2E8' },
    pending: { label: 'Pending approval', color: '#A15C00', background: '#FFF3D6' },
    draft: { label: 'Draft', color: '#2457C5', background: '#EAF0FF' },
    rejected: { label: 'Rejected', color: '#B42318', background: '#FDECEC' },
    unavailable: { label: 'Paused', color: '#596273', background: '#EEF0F3' },
    sold: { label: 'Sold', color: '#6D3CC5', background: '#F2ECFD' },
    expired: { label: 'Expired', color: '#596273', background: '#EEF0F3' },
};

const lifecycleActions = (item) => {
    const remove = {
        key: 'remove',
        label: 'Remove',
        icon: 'trash-2',
        tone: COLORS.danger,
        title: 'Remove this ad?',
        description: 'The ad will be removed from QOT. Pause it instead if the item may become available again.',
        confirmLabel: 'Remove ad',
        destructive: true,
    };

    if (item.is_incomplete_draft) {
        return [{
            ...remove,
            title: 'Discard this draft?',
            description: 'The unfinished ad and its uploaded photos will be removed permanently.',
            confirmLabel: 'Discard draft',
        }];
    }

    if (item.status === 'active') {
        return [
            {
                key: 'sold', label: 'Mark as sold', icon: 'check-circle', tone: '#18864B', title: 'Mark this ad as sold?', description: 'Buyers will see that this item is no longer available.', confirmLabel: 'Mark as sold',
            },
            {
                key: 'pause', label: 'Pause', icon: 'pause-circle', tone: '#A15C00', title: 'Pause this ad?', description: 'The ad will be hidden from buyers until you resume it.', confirmLabel: 'Pause ad',
            },
            remove,
        ];
    }

    if (item.status === 'sold' || item.status === 'unavailable') {
        return [
            {
                key: 'resume', label: 'Resume', icon: 'play-circle', tone: '#2457C5', title: 'Make this ad available again?', description: 'The ad will return to the marketplace for buyers to view and contact you.', confirmLabel: 'Resume ad',
            },
            remove,
        ];
    }

    if (item.status === 'expired') {
        return [
            {
                key: 'renew', label: 'Renew', icon: 'refresh-cw', tone: '#6D3CC5', title: 'Renew this ad?', description: 'The ad duration will be extended and it will return to active status.', confirmLabel: 'Renew ad',
            },
            remove,
        ];
    }

    return [remove];
};

const Myads = ({ navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    const loadData = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [myAds, draft] = await Promise.all([
                getMyListings({ force: refresh }),
                getListingDraft({ force: refresh })
                    .then(async (draft) => draft || await getLocalListingDraft(user?.id))
                    .catch(() => getLocalListingDraft(user?.id)),
            ]);
            const draftData = draft?.data || {};
            const draftPhoto = draft?.staged_images?.[0];
            const draftAd = draft ? {
                id: 'incomplete-draft',
                is_incomplete_draft: true,
                title: draftData.title || 'Unfinished ad',
                price: draftData.price || '',
                currency: 'UGX',
                city_name: 'Continue where you stopped',
                status: 'draft',
                primary_image: draftPhoto?.card_image_url || draftPhoto?.image_url || null,
                views_count: 0,
                favorites_count: 0,
                updated_at: draft.updated_at,
            } : null;
            setAds(draftAd ? [draftAd, ...myAds] : myAds);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
        return navigation.addListener('focus', () => loadData());
    }, [loadData, navigation]);

    const counts = useMemo(() => Object.fromEntries(STATUSES.map(([status]) => [
        status,
        ads.filter((item) => matchesStatus(item, status)).length,
    ])), [ads]);

    const filteredAds = useMemo(
        () => ads.filter((item) => matchesStatus(item, selectedStatus)),
        [ads, selectedStatus],
    );

    const runAction = async () => {
        if (!pendingAction || actionLoading) return;
        setActionLoading(true);
        setActionError('');
        try {
            const { item, key } = pendingAction;
            if (key === 'remove' && item.is_incomplete_draft) {
                await clearListingDraft();
                await clearLocalListingDraft(user?.id);
            }
            else if (key === 'remove') await deleteListing(item.id);
            if (key === 'sold') await markListingSold(item.id);
            if (key === 'pause') await pauseListing(item.id);
            if (key === 'resume') await resumeListing(item.id);
            if (key === 'renew') await renewListing(item.id);
            setPendingAction(null);
            await loadData(true);
        } catch (requestError) {
            setActionError(requestError.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="My ads" leftIcon="back" titleLeft />

            <View style={[GlobalStyleSheet.container, { paddingTop: 7, paddingBottom: 0 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -15 }} contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 12 }}>
                        {STATUSES.map(([value, label]) => {
                            const selected = selectedStatus === value;
                            return (
                                <TouchableOpacity
                                    key={value}
                                    onPress={() => setSelectedStatus(value)}
                                    style={{ height: 38, paddingHorizontal: 13, borderRadius: 19, borderWidth: 1, borderColor: selected ? COLORS.primary : colors.borderColor, backgroundColor: selected ? `${COLORS.primary}12` : colors.card, flexDirection: 'row', alignItems: 'center', marginRight: 8 }}
                                >
                                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: selected ? COLORS.primary : colors.text }]}>{label}</Text>
                                    <View style={{ minWidth: 19, height: 19, borderRadius: 10, marginLeft: 6, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? COLORS.primary : colors.background }}>
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: selected ? COLORS.white : colors.text, fontSize: 10 }]}>{counts[value]}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                </ScrollView>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredAds}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    contentContainerStyle={{ padding: 15, paddingTop: 2, paddingBottom: 105, flexGrow: 1 }}
                    ListHeaderComponent={error ? (
                        <TouchableOpacity onPress={() => loadData()} style={{ backgroundColor: '#FDECEC', borderRadius: 11, padding: 12, marginBottom: 14 }}>
                            <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text>
                        </TouchableOpacity>
                    ) : null}
                    ListEmptyComponent={!error ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 65 }}>
                            <View style={{ height: 60, width: 60, borderRadius: 30, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="tag" size={29} color={COLORS.primary} />
                            </View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 14 }]}>
                                {selectedStatus === 'all' ? 'You have not posted an ad yet' : `No ${statusDetails[selectedStatus]?.label.toLowerCase() || selectedStatus} ads`}
                            </Text>
                            {selectedStatus === 'all' && (
                                <TouchableOpacity onPress={() => navigation.navigate('Sell')} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11, marginTop: 16 }}>
                                    <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Post your first ad</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null}
                    renderItem={({ item }) => (
                        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 15, marginBottom: 13, overflow: 'hidden' }}>
                            <TouchableOpacity onPress={() => item.is_incomplete_draft ? navigation.navigate('Sell') : navigation.navigate('ItemDetails', { listingId: item.id })} activeOpacity={0.84} style={{ padding: 11 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <CachedImage source={item.primary_image ? { uri: item.primary_image } : IMAGES.detail1} style={{ width: 96, height: 90, borderRadius: 10, backgroundColor: colors.borderColor }} resizeMode="cover" cacheVersion={item.images_updated_at || item.updated_at} recyclingKey={`my-ad-${item.id}-${item.primary_image || 'placeholder'}`} />
                                    <View style={{ flex: 1, marginLeft: 11 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                            <Text numberOfLines={2} style={[FONTS.font, FONTS.fontTitle, { color: colors.title, flex: 1, lineHeight: 19 }]}>{item.title}</Text>
                                            <View style={{ backgroundColor: (statusDetails[item.status] || statusDetails.unavailable).background, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginLeft: 7 }}>
                                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: (statusDetails[item.status] || statusDetails.unavailable).color, fontSize: 9, textTransform: 'uppercase' }]}>{(statusDetails[item.status] || statusDetails.unavailable).label}</Text>
                                            </View>
                                        </View>
                                        {item.is_featured && (
                                            <View style={{ alignSelf: 'flex-start', borderRadius: 6, backgroundColor: '#FFF2E8', paddingHorizontal: 7, paddingVertical: 3, marginTop: 5, flexDirection: 'row', alignItems: 'center' }}>
                                                <FeatherIcon name="award" size={11} color={COLORS.primary} />
                                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, fontSize: 8, marginLeft: 4 }]}>FEATURED</Text>
                                            </View>
                                        )}
                                        <Text style={[FONTS.h6, { color: COLORS.primary, marginTop: 5 }]}>{item.is_incomplete_draft && !item.price ? 'Add price' : formatPrice(item.price, item.currency)}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7 }}>
                                            <FeatherIcon name="map-pin" size={12} color={colors.text} />
                                            <Text numberOfLines={1} style={[FONTS.fontXs, { color: colors.text, flex: 1, marginLeft: 4 }]}>{item.area_name || item.city_name || 'Uganda'}</Text>
                                            <Text style={[FONTS.fontXs, { color: colors.text }]}>{formatRelativeTime(item.updated_at || item.created_at)}</Text>
                                        </View>
                                    </View>
                                </View>

                                {item.status === 'rejected' && Boolean(item.rejection_reason) && (
                                    <View style={{ backgroundColor: '#FFF1F0', borderRadius: 10, padding: 10, marginTop: 10, flexDirection: 'row' }}>
                                        <FeatherIcon name="alert-triangle" size={16} color="#B42318" />
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#B42318' }]}>Why your ad was rejected</Text>
                                            <Text numberOfLines={3} style={[FONTS.fontXs, { color: '#9B2C2C', marginTop: 2, lineHeight: 17 }]}>{item.rejection_reason}</Text>
                                        </View>
                                    </View>
                                )}

                                {(Boolean(item.expires_at) || Boolean(item.is_featured)) && (
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 }}>
                                        {item.status === 'active' && Boolean(item.expires_at) && (
                                            <View style={{ minHeight: 28, borderRadius: 9, backgroundColor: '#EEF0F3', paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
                                                <FeatherIcon name="clock" size={12} color="#596273" />
                                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#596273', fontSize: 9, marginLeft: 5 }]}>Ad: {formatExpiryRemaining(item.expires_at, now)}</Text>
                                            </View>
                                        )}
                                        {item.is_featured && (
                                            <View style={{ minHeight: 28, borderRadius: 9, backgroundColor: '#FFF2E8', paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center' }}>
                                                <FeatherIcon name="zap" size={12} color={COLORS.primary} />
                                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, fontSize: 9, marginLeft: 5 }]}>{item.featured_until ? `Featured: ${formatExpiryRemaining(item.featured_until, now)}` : 'Featured placement active'}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: colors.border }}>
                                    <FeatherIcon name="eye" size={13} color={colors.text} />
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 4 }]}>{item.views_count || 0} views</Text>
                                    <FeatherIcon name="heart" size={13} color={colors.text} style={{ marginLeft: 15 }} />
                                    <Text style={[FONTS.fontXs, { color: colors.text, marginLeft: 4 }]}>{item.favorites_count || 0} saved</Text>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 'auto' }]}>{item.is_incomplete_draft ? 'Continue' : 'View ad'}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                                {!item.is_incomplete_draft && (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ListingAnalytics', { listingId: item.id, listing: item })}
                                        style={{ width: '48.8%', minHeight: 42, borderRadius: 10, backgroundColor: '#E9F2FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}
                                    >
                                        <FeatherIcon name="bar-chart-2" size={15} color="#2457C5" />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#2457C5', marginLeft: 6 }]}>Performance</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Sell', item.is_incomplete_draft ? undefined : { listingId: item.id })}
                                    style={{ width: '48.8%', minHeight: 42, borderRadius: 10, backgroundColor: `${COLORS.primary}10`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}
                                >
                                    <FeatherIcon name="edit-2" size={15} color={COLORS.primary} />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, marginLeft: 6 }]}>{item.is_incomplete_draft ? 'Continue draft' : 'Edit'}</Text>
                                </TouchableOpacity>
                                {lifecycleActions(item).map((action) => (
                                    <TouchableOpacity
                                        key={action.key}
                                        onPress={() => {
                                            setActionError('');
                                            setPendingAction({ ...action, item });
                                        }}
                                        style={{ width: '48.8%', minHeight: 42, borderRadius: 10, backgroundColor: `${action.tone}10`, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}
                                    >
                                        <FeatherIcon name={action.icon} size={15} color={action.tone} />
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: action.tone, marginLeft: 6, textAlign: 'center' }]}>{action.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                />
            )}

            <Modal visible={Boolean(pendingAction)} transparent animationType="fade" onRequestClose={() => !actionLoading && setPendingAction(null)}>
                <Pressable onPress={() => !actionLoading && setPendingAction(null)} style={{ flex: 1, backgroundColor: 'rgba(12,16,28,.55)', padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 430, backgroundColor: colors.card, borderRadius: 20, padding: 19 }}>
                        <View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: pendingAction?.destructive ? '#FDECEC' : `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name={pendingAction?.icon || 'help-circle'} size={22} color={pendingAction?.destructive ? COLORS.danger : COLORS.primary} />
                        </View>
                        <Text style={[FONTS.h5, { color: colors.title, marginTop: 14 }]}>{pendingAction?.title}</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20, marginTop: 6 }]}>{pendingAction?.description}</Text>
                        {Boolean(actionError) && (
                            <View style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 10, marginTop: 12 }}>
                                <Text style={[FONTS.fontSm, { color: COLORS.danger }]}>{actionError}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', gap: 9, marginTop: 20 }}>
                            <TouchableOpacity disabled={actionLoading} onPress={() => setPendingAction(null)} style={{ flex: 1, height: 48, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={actionLoading} onPress={runAction} style={{ flex: 1, height: 48, borderRadius: 11, backgroundColor: pendingAction?.destructive ? COLORS.danger : COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                {actionLoading && <ActivityIndicator color={COLORS.white} size="small" style={{ marginRight: 7 }} />}
                                <Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>{actionLoading ? 'Updating...' : pendingAction?.confirmLabel}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default Myads;
