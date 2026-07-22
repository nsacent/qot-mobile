import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { IMAGES, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';

const LanguageData = [
    {
        id: "1",
        text: "Indian",
    },
    {
        id: "2",
        text: "English",
    },
    {
        id: "3",
        text: "German",
    },
    {
        id: "4",
        text: "Italian",
    },
    {
        id: "5",
        text: "Spanish"
    },
]


const LanguageSheet = (props, ref) => {
    // ref
    const bottomSheetRef = useRef(null);

    // variables
    const snapPoints = useMemo(() => ['40%'], []);

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


    const { colors } = useTheme();

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

            <BottomSheetScrollView style={[GlobalStyleSheet.container, { marginTop: 10 }]}>
                {LanguageData.map((data, index) => {
                    return (
                        <View key={index} style={{ marginHorizontal: -15 }}>
                            <TouchableOpacity
                                onPress={() => { props.setLanguage(data.text); bottomSheetRef.current.snapToIndex(-1) }}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: 15 }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ ...FONTS.fontSm, ...FONTS.fontMedium, color: colors.title, fontSize: 15, marginLeft: 10, }}>{data.text}</Text>
                                </View>
                                <Image
                                    style={{ height: 12, width: 12, resizeMode: 'contain', tintColor: colors.title }}
                                    source={IMAGES.rightarrow}
                                />
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </BottomSheetScrollView>
        </BottomSheet>
    );
};



export default forwardRef(LanguageSheet);