import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FONTS, IMAGES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';

const ChatoptionSheet = (props, ref) => {
    // ref
    const bottomSheetRef = useRef(null);

    // variables
    const snapPoints = useMemo(() => [150], []);

    // callbacks
    const handleSheetChanges = useCallback((index) => {
        console.log('handleSheetChanges', index);
    }, []);

    // renders
    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
    );


    useImperativeHandle(ref, () => ({
        // methods connected to `ref`
        openSheet: () => { openSheet() }
    }))
    // internal method
    const openSheet = () => {
        bottomSheetRef.current.snapToIndex(0)
    }

    const theme = useTheme();
    const { colors } = theme;


    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            handleStyle={{ top: 0 }}
            handleIndicatorStyle={{ backgroundColor: colors.border, width: 92 }}
            backgroundStyle={{ backgroundColor: colors.card }}
        >

            <BottomSheetScrollView style={GlobalStyleSheet.container}>
                <TouchableOpacity style={{ flexDirection: 'row' }}>
                    <Image
                        style={[GlobalStyleSheet.image, { tintColor: colors.title }]}
                        source={IMAGES.delete}
                    />
                    <Text style={[GlobalStyleSheet.text, { color: colors.title }]}>Delete chat</Text>
                </TouchableOpacity>
            </BottomSheetScrollView>

        </BottomSheet>
    );
};



export default forwardRef(ChatoptionSheet);