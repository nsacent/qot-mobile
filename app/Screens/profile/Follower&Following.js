import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { followSeller, getFollowers, getFollowing, unfollowSeller } from '../../api/account';
import { useAuth } from '../../context/AuthContext';

const FollowerFollowing = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const userId = route?.params?.userId || user?.id;
    const [tab, setTab] = useState(route?.params?.initialTab === 'following' ? 'following' : 'followers');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const viewingOwnNetwork = String(userId || '') === String(user?.id || '');

    const loadNetwork = useCallback(async (refresh = false) => {
        if (!userId) return;
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [followerData, followingData] = await Promise.all([
                getFollowers(userId, { force: refresh }),
                getFollowing(userId, { force: refresh }),
            ]);
            setFollowers(followerData);
            setFollowing(followingData);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        loadNetwork();
    }, [loadNetwork]);

    const data = tab === 'followers' ? followers : following;
    const visibleData = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return data;
        return data.filter((person) => (
            String(person.full_name || '').toLowerCase().includes(search)
            || String(person.business_name || '').toLowerCase().includes(search)
        ));
    }, [data, query]);

    const toggleFollowing = async (person) => {
        if (!viewingOwnNetwork || updatingId) return;
        const currentlyFollowing = tab === 'following' || Boolean(person.is_following);
        setUpdatingId(person.id);
        setError('');
        try {
            if (currentlyFollowing) {
                await unfollowSeller(person.id);
                setFollowing((items) => items.filter((item) => String(item.id) !== String(person.id)));
                setFollowers((items) => items.map((item) => String(item.id) === String(person.id) ? { ...item, is_following: false } : item));
            } else {
                await followSeller(person.id);
                const followedPerson = { ...person, is_following: true };
                setFollowers((items) => items.map((item) => String(item.id) === String(person.id) ? followedPerson : item));
                setFollowing((items) => items.some((item) => String(item.id) === String(person.id)) ? items : [followedPerson, ...items]);
            }
        } catch (requestError) {
            setError(requestError.message || 'The following list could not be updated.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.background, flex: 1 }}>
            <Header title="My network" leftIcon="back" titleLeft />
            <View style={[GlobalStyleSheet.container, { paddingTop: 10, paddingBottom: 0 }]}>
                <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, padding: 4 }}>
                    {[
                        ['followers', `Followers ${followers.length}`],
                        ['following', `Following ${following.length}`],
                    ].map(([value, label]) => (
                        <TouchableOpacity
                            key={value}
                            onPress={() => setTab(value)}
                            style={{ flex: 1, height: 42, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === value ? COLORS.primary : 'transparent' }}
                        >
                            <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: tab === value ? COLORS.white : colors.text }]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 48, justifyContent: 'center', marginTop: 13, marginBottom: 5 }}>
                    <FeatherIcon name="search" size={18} color={colors.text} style={{ position: 'absolute', left: 14, zIndex: 1 }} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder={`Search ${tab}`}
                        placeholderTextColor={colors.textLight}
                        autoCorrect={false}
                        style={{ height: 48, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 12, paddingLeft: 43, paddingRight: 14, color: colors.title, backgroundColor: colors.card }}
                    />
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={visibleData}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={(
                        <RefreshControl refreshing={refreshing} onRefresh={() => loadNetwork(true)} colors={[COLORS.primary]} tintColor={COLORS.primary} />
                    )}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ padding: 15, paddingTop: 9, paddingBottom: 35, flexGrow: 1 }}
                    ListHeaderComponent={error ? (
                        <TouchableOpacity onPress={() => loadNetwork()} style={{ backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                            <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }]}>{error} Tap to retry.</Text>
                        </TouchableOpacity>
                    ) : null}
                    ListEmptyComponent={!error ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 75 }}>
                            <View style={{ height: 58, width: 58, borderRadius: 29, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                                <FeatherIcon name="users" size={27} color={COLORS.primary} />
                            </View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 15 }]}>{query ? 'No matching people' : `No ${tab} yet`}</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', marginTop: 5 }]}>
                                {query ? 'Try a different name.' : tab === 'followers' ? 'People who follow you will appear here.' : 'Sellers you follow will appear here.'}
                            </Text>
                        </View>
                    ) : null}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Anotherprofile', { sellerId: item.id })}
                            activeOpacity={0.78}
                            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Image
                                source={item.avatar ? { uri: item.avatar } : IMAGES.user}
                                style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: '#F1F2F5' }}
                            />
                            <View style={{ flex: 1, marginLeft: 11 }}>
                                <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{item.full_name || 'QOT user'}</Text>
                                <Text numberOfLines={1} style={[FONTS.fontXs, { color: item.business_name ? COLORS.primary : colors.text, marginTop: 2 }]}>
                                    {item.business_name || 'View seller profile'}
                                </Text>
                            </View>
                            {viewingOwnNetwork && String(item.id) !== String(user?.id) && (
                                <TouchableOpacity
                                    disabled={Boolean(updatingId)}
                                    onPress={(event) => {
                                        event.stopPropagation();
                                        toggleFollowing(item);
                                    }}
                                    style={{ minWidth: 84, height: 36, borderRadius: 10, paddingHorizontal: 10, marginRight: 5, backgroundColor: tab === 'following' || item.is_following ? colors.background : COLORS.primary, borderWidth: 1, borderColor: tab === 'following' || item.is_following ? colors.borderColor : COLORS.primary, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {String(updatingId) === String(item.id) ? (
                                        <ActivityIndicator size="small" color={tab === 'following' || item.is_following ? COLORS.primary : COLORS.white} />
                                    ) : (
                                        <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: tab === 'following' || item.is_following ? colors.text : COLORS.white }]}>{tab === 'following' || item.is_following ? 'Following' : 'Follow back'}</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            <FeatherIcon name="chevron-right" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default FollowerFollowing;
