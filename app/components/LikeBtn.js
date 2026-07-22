import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants/theme';
import { addFavorite, removeFavorite } from '../api/marketplace';

const LikeBtn = ({ listingId, initialLiked = false, onChange }) => {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        setIsLiked(initialLiked);
    }, [initialLiked]);

    const toggle = async (event) => {
        event?.stopPropagation?.();

        if (!listingId || pending) return;
        setPending(true);
        try {
            const result = isLiked
                ? await removeFavorite(listingId)
                : await addFavorite(listingId);
            const nextValue = Boolean(result?.is_favorited);
            setIsLiked(nextValue);
            onChange?.(nextValue, result);
        } catch {
            // Keep the current state; authenticated API errors are surfaced elsewhere.
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
                color={isLiked ? COLORS.danger : COLORS.white}
                name={isLiked ? 'heart' : 'heart-o'}
            />
        </Pressable>
    );
};

export default LikeBtn;
