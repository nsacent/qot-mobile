import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    SafeAreaView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import CardStyle1 from '../../components/Card/CardStyle1';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import {
    deleteSavedSearch,
    getFavorites,
    getSavedSearches,
    updateSavedSearch,
} from '../../api/marketplace';

const filterLabels = {
    category: 'Category',
    city: 'Location',
    region: 'Region',
    min_price: 'Min price',
    max_price: 'Max price',
    condition: 'Condition',
    is_negotiable: 'Negotiable',
    verified_seller: 'Verified seller',
    posted_within: 'Posted within',
};

const formatFilterValue = (key, value) => {
    if (value === true || value === 'true') return 'Yes';
    if (key === 'posted_within') return `${value} days`;
    if (key === 'min_price' || key === 'max_price') return `UGX ${Number(value).toLocaleString('en-US')}`;
    return String(value).replace(/-/g, ' ');
};

const Saved = ({ navigation, route }) => {
    const { colors } = useTheme();
    const [tab, setTab] = useState('ads');
    const [favorites, setFavorites] = useState([]);
    const [savedSearches, setSavedSearches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [updatingAlertId, setUpdatingAlertId] = useState(null);

    const loadData = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [ads, searches] = await Promise.all([
                getFavorites({ force: refresh }),
                getSavedSearches({ force: refresh }),
            ]);
            setFavorites(ads);
            setSavedSearches(searches);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        return navigation.addListener('focus', () => loadData());
    }, [loadData, navigation]);

    useEffect(() => {
        const requestedTab = route?.params?.initialTab;
        if (requestedTab === 'ads' || requestedTab === 'searches') setTab(requestedTab);
    }, [route?.params?.initialTab]);

    const openSearch = (item) => navigation.navigate('Items', {
        cat: item.name || 'Saved search',
        searchQuery: item.query || '',
        categorySlug: item.filters?.category,
        savedFilters: item.filters || {},
    });

    const removeSearch = async () => {
        if (!pendingDelete || deleting) return;
        setDeleting(true);
        try {
            await deleteSavedSearch(pendingDelete.id);
            setSavedSearches((current) => current.filter((item) => item.id !== pendingDelete.id));
            setPendingDelete(null);
        } catch (requestError) {
            setError(requestError.message);
            setPendingDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    const toggleSearchAlerts = async (item) => {
        if (updatingAlertId) return;
        setUpdatingAlertId(item.id);
        setError('');
        try {
            const updated = await updateSavedSearch(item.id, {
                notify_user: !item.notify_user,
            });
            setSavedSearches((current) => current.map((search) => (
                search.id === item.id ? { ...search, ...updated } : search
            )));
        } catch (requestError) {
            setError(requestError.message || 'The saved-search alert could not be updated.');
        } finally {
            setUpdatingAlertId(null);
        }
    };

    const empty = tab === 'ads' ? favorites.length === 0 : savedSearches.length === 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header
                title="Saved"
                titleLeft
                leftIcon="back"
                backAction={() => (
                    navigation.canGoBack()
                        ? navigation.goBack()
                        : navigation.navigate('Home')
                )}
            />
            <View style={[GlobalStyleSheet.container, { paddingTop: 7, paddingBottom: 10 }]}>
                <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 13, padding: 4 }}>
                    {[
                        ['ads', `Saved ads (${favorites.length})`],
                        ['searches', `Saved searches (${savedSearches.length})`],
                    ].map(([value, label]) => (
                        <TouchableOpacity key={value} onPress={() => setTab(value)} style={{ flex: 1, height: 43, borderRadius: 10, backgroundColor: tab === value ? COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                            <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: tab === value ? COLORS.white : colors.text, fontSize: 11 }]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <FlatList
                    key={tab}
                    data={tab === 'ads' ? favorites : savedSearches}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    contentContainerStyle={{ padding: 15, paddingTop: 3, paddingBottom: 105, flexGrow: 1 }}
                    ListHeaderComponent={error ? <TouchableOpacity onPress={() => loadData()} style={{ backgroundColor: '#FDECEC', borderRadius: 11, padding: 12, marginBottom: 13 }}><Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text></TouchableOpacity> : null}
                    ListEmptyComponent={empty && !error ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
                            <View style={{ height: 64, width: 64, borderRadius: 32, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name={tab === 'ads' ? 'heart' : 'bookmark'} size={29} color={COLORS.primary} /></View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 14 }]}>{tab === 'ads' ? 'No saved ads yet' : 'No saved searches yet'}</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 20, marginTop: 6 }]}>{tab === 'ads' ? 'Tap the heart on any ad to find it here later.' : 'Search and filter ads, then tap the bookmark to receive alerts for new matches.'}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Items')} style={{ height: 45, borderRadius: 11, backgroundColor: COLORS.primary, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 17 }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>Browse ads</Text></TouchableOpacity>
                        </View>
                    ) : null}
                    renderItem={({ item }) => tab === 'ads' ? (
                        <View style={{ marginBottom: 12 }}>
                            <CardStyle1
                                item={item}
                                list
                                onFavoriteChange={(isLiked) => {
                                    if (!isLiked) setFavorites((current) => current.filter((favorite) => favorite.id !== item.id));
                                }}
                                onFavoriteError={(requestError) => setError(requestError.message || 'The saved ad could not be updated.')}
                            />
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => openSearch(item)} activeOpacity={0.84} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 15, padding: 14, marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <View style={{ height: 42, width: 42, borderRadius: 12, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="search" size={19} color={COLORS.primary} /></View>
                                <View style={{ flex: 1, marginLeft: 11 }}>
                                    <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{item.name || item.query || 'Saved search'}</Text>
                                    <Text style={[FONTS.fontXs, { color: item.notify_user ? '#15803D' : colors.text, marginTop: 3 }]}>{item.notify_user ? 'Alerts are on' : 'Alerts are off'}</Text>
                                </View>
                                <Switch
                                    accessibilityLabel={`${item.notify_user ? 'Disable' : 'Enable'} alerts for ${item.name || 'saved search'}`}
                                    value={Boolean(item.notify_user)}
                                    disabled={Boolean(updatingAlertId)}
                                    onValueChange={() => toggleSearchAlerts(item)}
                                    trackColor={{ false: colors.borderColor, true: '#FDBA74' }}
                                    thumbColor={item.notify_user ? COLORS.primary : '#F8FAFC'}
                                    ios_backgroundColor={colors.borderColor}
                                    style={{ marginRight: 8, opacity: updatingAlertId === item.id ? 0.55 : 1 }}
                                />
                                <TouchableOpacity onPress={(event) => { event.stopPropagation?.(); setPendingDelete(item); }} hitSlop={8} style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="trash-2" size={15} color={COLORS.danger} /></TouchableOpacity>
                            </View>
                            {Boolean(item.query) && <Text style={[FONTS.fontSm, { color: colors.title, marginTop: 11 }]}>“{item.query}”</Text>}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 }}>
                                {Object.entries(item.filters || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined).map(([key, value]) => (
                                    <View key={key} style={{ borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderColor, paddingHorizontal: 8, paddingVertical: 5, marginRight: 6, marginBottom: 6 }}><Text style={[FONTS.fontXs, { color: colors.text }]}>{filterLabels[key] || key.replace(/_/g, ' ')}: <Text style={FONTS.fontTitle}>{formatFilterValue(key, value)}</Text></Text></View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <Modal visible={Boolean(pendingDelete)} transparent animationType="fade" onRequestClose={() => !deleting && setPendingDelete(null)}>
                <Pressable onPress={() => !deleting && setPendingDelete(null)} style={{ flex: 1, backgroundColor: 'rgba(12,16,28,.55)', padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 420, borderRadius: 20, padding: 19, backgroundColor: colors.card }}>
                        <View style={{ height: 48, width: 48, borderRadius: 24, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="trash-2" size={21} color={COLORS.danger} /></View>
                        <Text style={[FONTS.h5, { color: colors.title, marginTop: 14 }]}>Remove saved search?</Text>
                        <Text style={[FONTS.fontSm, { color: colors.text, lineHeight: 20, marginTop: 6 }]}>You will stop receiving alerts for “{pendingDelete?.name || 'this search'}”.</Text>
                        <View style={{ flexDirection: 'row', gap: 9, marginTop: 20 }}>
                            <TouchableOpacity disabled={deleting} onPress={() => setPendingDelete(null)} style={{ flex: 1, height: 48, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity disabled={deleting} onPress={removeSearch} style={{ flex: 1, height: 48, borderRadius: 11, backgroundColor: COLORS.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>{deleting && <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 7 }} />}<Text style={[FONTS.font, FONTS.fontTitle, { color: COLORS.white }]}>Remove</Text></TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

export default Saved;
