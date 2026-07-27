import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants/theme';
import { addFavorite, removeFavorite } from '../api/marketplace';
import { useAuth } from '../context/AuthContext';
import { hasPrimaryVerification } from '../utils/verification';

const LikeBtn = ({ listingId, initialLiked = false, onChange, onError }) => {
    const navigation = useNavigation();
    const { user, isAuthenticated } = useAuth();
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        setIsLiked(initialLiked);
    }, [initialLiked]);

    const toggle = async (event) => {
        event?.stopPropagation?.();

        if (!listingId || pending) return;
        if (!isAuthenticated) {
            navigation.navigate('SignIn');
            return;
        }
        if (!hasPrimaryVerification(user)) {
            navigation.navigate('VerifyAccount');
            return;
        }
        setPending(true);
        try {
            const result = isLiked
                ? await removeFavorite(listingId)
                : await addFavorite(listingId);
            const nextValue = Boolean(result?.is_favorited);
            setIsLiked(nextValue);
            onChange?.(nextValue, result);
        } catch (requestError) {
            onError?.(requestError);
        } finally {
            setPending(false);
        }
    };

    return (
        <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel={isLiked ? 'Remove from saved ads' : 'Save this ad'}
            onPress={toggle}
            disabled={pending || !listingId}
            hitSlop={8}
            style={{ height: 50, width: 50, alignItems: 'center', justifyContent: 'center', opacity: pending ? 0.6 : 1 }}
        >
            <FontAwesome
                size={20}
                color={isLiked ? COLORS.primary : COLORS.white}
                name={isLiked ? 'heart' : 'heart-o'}
            />
        </Pressable>
    );
};

export default LikeBtn;
