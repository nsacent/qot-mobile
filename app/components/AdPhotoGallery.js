import React, { useEffect, useState } from 'react';
import {
    Image,
    Modal,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Swiper from 'react-native-swiper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';

const ZoomablePhoto = ({ source, active }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    useEffect(() => {
        if (!active) {
            scale.value = withTiming(1, { duration: 160 });
            savedScale.value = 1;
        }
    }, [active, savedScale, scale]);

    const pinch = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = Math.max(1, Math.min(savedScale.value * event.scale, 4));
        })
        .onEnd(() => {
            if (scale.value < 1.08) {
                scale.value = withTiming(1);
                savedScale.value = 1;
                return;
            }
            savedScale.value = scale.value;
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd(() => {
            const nextScale = scale.value > 1.2 ? 1 : 2.5;
            scale.value = withTiming(nextScale, { duration: 180 });
            savedScale.value = nextScale;
        });

    const gesture = Gesture.Simultaneous(pinch, doubleTap);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
                <Image source={source} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
            </Animated.View>
        </GestureDetector>
    );
};

const AdPhotoGallery = ({ visible, images, initialIndex = 0, title, onClose }) => {
    const insets = useSafeAreaInsets();
    const safeImages = images?.length ? images : [];
    const safeInitialIndex = Math.min(Math.max(initialIndex, 0), Math.max(safeImages.length - 1, 0));
    const [activeIndex, setActiveIndex] = useState(safeInitialIndex);

    useEffect(() => {
        if (visible) setActiveIndex(safeInitialIndex);
    }, [safeInitialIndex, visible]);

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <View style={{ flex: 1 }}>
                    {safeImages.length > 0 && (
                        <Swiper
                            key={`${visible}-${safeInitialIndex}-${safeImages.length}`}
                            index={safeInitialIndex}
                            loop={false}
                            showsPagination={false}
                            onIndexChanged={setActiveIndex}
                        >
                            {safeImages.map((source, index) => (
                                <View key={source?.uri || index} style={{ flex: 1, overflow: 'hidden' }}>
                                    <ZoomablePhoto source={source} active={activeIndex === index} />
                                </View>
                            ))}
                        </Swiper>
                    )}

                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, minHeight: 58 + insets.top, paddingTop: Math.max(insets.top, 10), paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,.42)' }}>
                        <TouchableOpacity accessibilityLabel="Close photo gallery" onPress={onClose} style={{ height: 42, width: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatherIcon name="x" size={23} color={COLORS.white} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 10 }}>
                            <Text numberOfLines={1} style={[FONTS.fontSm, FONTS.fontTitle, { color: COLORS.white }]}>{title || 'Ad photos'}</Text>
                            <Text style={[FONTS.fontXs, { color: 'rgba(255,255,255,.78)', marginTop: 1 }]}>{activeIndex + 1} of {safeImages.length}</Text>
                        </View>
                        <View style={{ width: 42 }} />
                    </View>

                    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16), alignItems: 'center' }}>
                        <View style={{ borderRadius: 18, backgroundColor: 'rgba(0,0,0,.48)', paddingHorizontal: 13, paddingVertical: 7 }}>
                            <Text style={[FONTS.fontXs, { color: 'rgba(255,255,255,.84)' }]}>Pinch or double-tap to zoom</Text>
                        </View>
                    </View>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};

export default AdPhotoGallery;
