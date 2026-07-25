import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Header from '../../layout/Header';
import ReviewStars from '../../components/ReviewStars';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { COLORS, FONTS } from '../../constants/theme';
import {
    createSellerReview,
    getSellerReviews,
    getSellerReviewSummary,
} from '../../api/account';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const ratingLabels = ['', 'Very poor', 'Poor', 'Average', 'Good', 'Excellent'];

const initials = (name) => String(name || 'QOT user')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const SellerReviews = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const sellerId = route.params?.sellerId;
    const listingId = route.params?.listingId;
    const sellerName = route.params?.sellerName || 'QOT seller';
    const listingTitle = route.params?.listingTitle || 'this ad';
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    const loadReviews = useCallback(async (refresh = false) => {
        if (!sellerId) {
            setError('Seller reviews could not be opened.');
            setLoading(false);
            return;
        }
        refresh ? setRefreshing(true) : setLoading(true);
        setError('');
        try {
            const [reviewData, summaryData] = await Promise.all([
                getSellerReviews(sellerId),
                getSellerReviewSummary(sellerId),
            ]);
            setReviews(reviewData);
            setSummary(summaryData);
        } catch (requestError) {
            setError(requestError.message || 'Seller reviews could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sellerId]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const existingReview = useMemo(() => reviews.find((review) => (
        String(review.reviewer) === String(user?.id)
        && String(review.listing || '') === String(listingId || '')
    )), [listingId, reviews, user?.id]);

    const distribution = useMemo(() => [5, 4, 3, 2, 1].map((value) => ({
        value,
        count: reviews.filter((review) => Number(review.rating) === value).length,
    })), [reviews]);

    const canReview = Boolean(listingId && String(user?.id) !== String(sellerId));

    const openReviewForm = () => {
        if (!user?.is_verified) {
            navigation.navigate('VerifyAccount');
            return;
        }
        setFormError('');
        setFormOpen(true);
    };

    const submitReview = async () => {
        const cleanComment = comment.trim();
        if (cleanComment.length < 5) {
            setFormError('Tell other buyers a little about your experience.');
            return;
        }

        setSubmitting(true);
        setFormError('');
        try {
            await createSellerReview({ sellerId, listingId, rating, comment: cleanComment });
            setSuccess(`Your review of ${sellerName} was published.`);
            setComment('');
            setRating(5);
            setFormOpen(false);
            await loadReviews();
        } catch (requestError) {
            setFormError(requestError.message || 'Your review could not be submitted.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderReview = ({ item }) => (
        <View style={{ borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, padding: 14, marginBottom: 11 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ height: 42, width: 42, borderRadius: 14, backgroundColor: `${COLORS.primary}12`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.primary }]}>{initials(item.reviewer_name)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                    <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>{item.reviewer_name || 'QOT buyer'}</Text>
                    <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 2 }]}>{formatDate(item.created_at)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <ReviewStars rating={item.rating} size={12} />
                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#A86500', marginTop: 3 }]}>{item.rating}/5</Text>
                </View>
            </View>
            {item.listing_title ? (
                <TouchableOpacity disabled={!item.listing} onPress={() => navigation.navigate('ItemDetails', { listingId: item.listing })} style={{ marginTop: 11, flexDirection: 'row', alignItems: 'center' }}>
                    <FeatherIcon name="tag" size={13} color={COLORS.primary} />
                    <Text numberOfLines={1} style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.primary, flex: 1, marginLeft: 5 }]}>{item.listing_title}</Text>
                    {item.listing && <FeatherIcon name="chevron-right" size={14} color={COLORS.primary} />}
                </TouchableOpacity>
            ) : null}
            <Text style={[FONTS.fontSm, { color: colors.title, lineHeight: 21, marginTop: 10 }]}>{item.comment || 'No written comment was added.'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Header title="Seller reviews" leftIcon="back" titleLeft />
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[FONTS.font, { color: colors.text, marginTop: 12 }]}>Loading seller reviews...</Text>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderReview}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadReviews(true)} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
                    contentContainerStyle={{ padding: 15, paddingBottom: 38, flexGrow: 1 }}
                    ListHeaderComponent={(
                        <>
                            <View style={{ borderRadius: 18, padding: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderColor, marginBottom: 13 }}>
                                <Text numberOfLines={1} style={[FONTS.font, FONTS.fontTitle, { color: colors.title }]}>{summary?.seller_name || sellerName}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                    <View style={{ width: 100, alignItems: 'center', paddingRight: 12, borderRightWidth: 1, borderRightColor: colors.border }}>
                                        <Text style={[FONTS.h3, { color: colors.title }]}>{Number(summary?.average_rating || 0).toFixed(1)}</Text>
                                        <ReviewStars rating={Math.round(Number(summary?.average_rating || 0))} size={13} />
                                        <Text style={[FONTS.fontXs, { color: colors.text, marginTop: 5 }]}>{summary?.total_reviews || 0} reviews</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        {distribution.map((item) => {
                                            const total = reviews.length || 1;
                                            return (
                                                <View key={item.value} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
                                                    <Text style={[FONTS.fontXs, { color: colors.text, width: 10 }]}>{item.value}</Text>
                                                    <FeatherIcon name="star" size={10} color="#F59E0B" style={{ marginLeft: 3 }} />
                                                    <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.background, marginLeft: 6, overflow: 'hidden' }}>
                                                        <View style={{ height: '100%', width: `${(item.count / total) * 100}%`, backgroundColor: '#F59E0B' }} />
                                                    </View>
                                                    <Text style={[FONTS.fontXs, { color: colors.textLight, width: 20, textAlign: 'right' }]}>{item.count}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                                {canReview && (
                                    <TouchableOpacity disabled={Boolean(existingReview)} onPress={openReviewForm} style={{ height: 46, borderRadius: 12, marginTop: 15, backgroundColor: existingReview ? colors.background : COLORS.primary, borderWidth: existingReview ? 1 : 0, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon name={existingReview ? 'check-circle' : 'edit-3'} size={16} color={existingReview ? '#18864B' : COLORS.white} />
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: existingReview ? '#18864B' : COLORS.white, marginLeft: 7 }]}>{existingReview ? 'You reviewed this seller' : 'Review this seller'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {Boolean(success) && (
                                <TouchableOpacity onPress={() => setSuccess('')} style={{ borderRadius: 13, borderWidth: 1, borderColor: '#BEE6D0', backgroundColor: '#EAF8F0', padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                                    <FeatherIcon name="check-circle" size={17} color="#18864B" />
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#176B44', flex: 1, marginLeft: 8 }]}>{success}</Text>
                                    <FeatherIcon name="x" size={15} color="#39805F" />
                                </TouchableOpacity>
                            )}
                            {Boolean(error) && (
                                <TouchableOpacity onPress={() => loadReviews()} style={{ borderRadius: 13, backgroundColor: '#FDECEC', padding: 12, marginBottom: 12 }}>
                                    <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger }]}>{error} Tap to retry.</Text>
                                </TouchableOpacity>
                            )}
                            {reviews.length > 0 && <Text style={[FONTS.h6, { color: colors.title, marginBottom: 10 }]}>Buyer feedback</Text>}
                        </>
                    )}
                    ListEmptyComponent={!error ? (
                        <View style={{ minHeight: 270, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
                            <View style={{ height: 64, width: 64, borderRadius: 21, backgroundColor: '#FFF3DC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="star" size={27} color="#B56700" /></View>
                            <Text style={[FONTS.h6, { color: colors.title, marginTop: 14 }]}>No reviews yet</Text>
                            <Text style={[FONTS.fontSm, { color: colors.text, textAlign: 'center', lineHeight: 20, marginTop: 5 }]}>{canReview ? 'Be the first buyer to share an honest experience with this seller.' : 'Buyer feedback for this seller will appear here.'}</Text>
                        </View>
                    ) : null}
                />
            )}

            <Modal visible={formOpen} transparent animationType="fade" onRequestClose={() => !submitting && setFormOpen(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <Pressable onPress={() => !submitting && setFormOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(12,16,28,.58)', padding: 18, alignItems: 'center', justifyContent: 'center' }}>
                        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 430, maxHeight: '92%', borderRadius: 22, backgroundColor: colors.card, overflow: 'hidden' }}>
                            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{ height: 46, width: 46, borderRadius: 15, backgroundColor: '#FFF3DC', alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="star" size={21} color="#B56700" /></View>
                                    <View style={{ flex: 1, minWidth: 0, marginLeft: 11 }}>
                                        <Text style={[FONTS.h6, { color: colors.title }]}>Review {sellerName}</Text>
                                        <Text numberOfLines={2} style={[FONTS.fontXs, { color: colors.text, lineHeight: 17, marginTop: 3 }]}>Share your experience for “{listingTitle}”.</Text>
                                    </View>
                                    <TouchableOpacity disabled={submitting} onPress={() => setFormOpen(false)} style={{ height: 36, width: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><FeatherIcon name="x" size={18} color={colors.text} /></TouchableOpacity>
                                </View>

                                {Boolean(formError) && <View style={{ borderRadius: 12, backgroundColor: '#FDECEC', padding: 11, marginTop: 14 }}><Text style={[FONTS.fontXs, FONTS.fontTitle, { color: COLORS.danger }]}>{formError}</Text></View>}

                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 18 }]}>Your rating</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <TouchableOpacity key={value} onPress={() => setRating(value)} style={{ flex: 1, aspectRatio: 1, maxHeight: 52, borderRadius: 13, backgroundColor: rating >= value ? '#F59E0B' : colors.background, alignItems: 'center', justifyContent: 'center' }}>
                                            <FontAwesomeIcon name="star" size={18} color={rating >= value ? COLORS.white : colors.textLight} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={[FONTS.fontXs, FONTS.fontTitle, { color: '#A86500', marginTop: 8 }]}>{ratingLabels[rating]}</Text>

                                <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title, marginTop: 18, marginBottom: 7 }]}>Your experience</Text>
                                <TextInput value={comment} onChangeText={setComment} maxLength={1000} multiline textAlignVertical="top" placeholder="Example: Good seller. The item was as described." placeholderTextColor={colors.textLight} style={[FONTS.font, { minHeight: 115, borderRadius: 13, borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.background, color: colors.title, padding: 13, paddingTop: 12 }]} />
                                <Text style={[FONTS.fontXs, { color: colors.textLight, textAlign: 'right', marginTop: 5 }]}>{comment.length}/1000</Text>

                                <View style={{ flexDirection: 'row', gap: 9, marginTop: 17 }}>
                                    <TouchableOpacity disabled={submitting} onPress={() => setFormOpen(false)} style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.borderColor, alignItems: 'center', justifyContent: 'center' }}><Text style={[FONTS.fontSm, FONTS.fontTitle, { color: colors.title }]}>Cancel</Text></TouchableOpacity>
                                    <TouchableOpacity disabled={submitting} onPress={submitReview} style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        {submitting ? <ActivityIndicator size="small" color={COLORS.white} /> : <FeatherIcon name="send" size={15} color={COLORS.white} />}
                                        <Text style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white, marginLeft: 7 }]}>{submitting ? 'Submitting' : 'Submit review'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default SellerReviews;
