import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import SearchBar from '../../components/SearchBar';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES, FONTS, COLORS } from '../../constants/theme';
import CategoryList from './CategoryList';
import LatestAds from './LatestAds';
import CardStyle1 from '../../components/Card/CardStyle1';
import { getHome } from '../../api/marketplace';

const emptyHome = {
    featured_listings: [],
    latest_listings: [],
    popular_listings: [],
    popular_categories: [],
};

const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [home, setHome] = useState(emptyHome);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadHome = useCallback(async (refresh = false) => {
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            setHome(await getHome());
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadHome();
    }, [loadHome]);

    const submitSearch = () => {
        const query = search.trim();
        if (!query) return;
        navigation.navigate('Items', { cat: `Results for “${query}”`, searchQuery: query });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[GlobalStyleSheet.container, { paddingBottom: 5 }] }>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <SearchBar
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={submitSearch}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ padding: 14, marginLeft: 5 }}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image
                            style={{ height: 20, width: 20, resizeMode: 'contain', tintColor: colors.title }}
                            source={IMAGES.hamburger}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading QOT Uganda...</Text>
                </View>
            ) : (
                <ScrollView
                    refreshControl={(
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadHome(true)}
                            tintColor={COLORS.primary}
                            colors={[COLORS.primary]}
                        />
                    )}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[GlobalStyleSheet.container, { paddingTop: 10, flex: 1 }] }>
                        {Boolean(error) && (
                            <TouchableOpacity
                                onPress={() => loadHome()}
                                style={{ backgroundColor: '#FDECEC', borderRadius: 12, padding: 14, marginBottom: 15 }}
                            >
                                <Text style={[FONTS.fontSm, { color: COLORS.danger, textAlign: 'center' }] }>
                                    {error} Tap to retry.
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                            <Text style={{ ...FONTS.font, ...FONTS.fontTitle, color: colors.title, flex: 1 }}>
                                Browse categories
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Categories')}
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Text style={[FONTS.fontSm, { color: COLORS.primary }]}>View all</Text>
                                <FeatherIcon size={16} color={COLORS.primary} name="chevron-right" />
                            </TouchableOpacity>
                        </View>
                        <CategoryList categories={home.popular_categories || []} />

                        <View style={{ marginHorizontal: -15, marginTop: 20, flex: 1 }}>
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderTopLeftRadius: 25,
                                    borderTopRightRadius: 25,
                                    flex: 1,
                                    paddingHorizontal: 15,
                                    paddingVertical: 15,
                                }}
                            >
                                {Boolean(home.featured_listings?.length) && (
                                    <>
                                        <Text style={[FONTS.h6, { color: colors.title }]}>Featured Ads</Text>
                                        <LatestAds items={home.featured_listings} />
                                    </>
                                )}

                                <Text style={[FONTS.h6, { color: colors.title, marginTop: 4 }]}>Latest Ads</Text>
                                <LatestAds items={home.latest_listings || []} />

                                <Text style={[FONTS.h6, { color: colors.title, marginTop: 8, marginBottom: 10 }] }>
                                    Popular on QOT
                                </Text>
                                <View style={GlobalStyleSheet.row}>
                                    {(home.popular_listings || []).map((item) => (
                                        <View key={item.id} style={[GlobalStyleSheet.col50, { marginBottom: 15 }] }>
                                            <CardStyle1 item={item} />
                                        </View>
                                    ))}
                                </View>

                                {!home.latest_listings?.length && !error && (
                                    <Text style={[FONTS.font, { color: colors.text, textAlign: 'center', paddingVertical: 30 }] }>
                                        No active listings yet.
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default HomeScreen;
