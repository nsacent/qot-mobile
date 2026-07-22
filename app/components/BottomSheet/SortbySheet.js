import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, } from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Checkbox, List,RadioButton } from 'react-native-paper';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { GlobalStyleSheet } from '../../constants/StyleSheet';


const SortbySheet = (props, ref) => {

     
    const { colors } = useTheme();

     const sheetRef = useRef();

    // ref
    const bottomSheetRef = useRef(null);


    // variables
    const snapPoints = useMemo(() => ['35%'], []);


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

    const handleClosePress = () => {
        bottomSheetRef.current.close()
    }

     const [sortVal , setSortVal] = useState('');

    return (

        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            enablePanDownToClose={true}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            handleStyle={{ top: 0 }}
            handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.30)', width: 92 }}
            backgroundStyle={{ backgroundColor: colors.card }}
        >
            <BottomSheetScrollView style={{paddingBottom:0}}>
                <View
                    style={[GlobalStyleSheet.container,{
                        padding:0,
                        flexDirection:'row',
                        alignItems:'center',
                         marginTop:-10,
                    }]}
                >
                    <TouchableOpacity
                        onPress={() => handleClosePress()}
                        style={{
                            padding:10,
                            marginRight:3,
                        }}
                    >
                        <FeatherIcon color={colors.title} size={24} name='x'/>
                    </TouchableOpacity>
                    <Text style={{...FONTS.h6,top:1,color:colors.title}}>Filters</Text>
                </View>
                <ScrollView>
                     <View style={[GlobalStyleSheet.container,{padding:0}]}>
                        <RadioButton.Group onValueChange={value => {setSortVal(value); handleClosePress()}} value={sortVal}>
                            <RadioButton.Item labelStyle={{color:colors.title}} color={COLORS.primary} uncheckedColor={COLORS.label} style={{paddingVertical:2}} label="What's new" value="newest" />
                            <RadioButton.Item labelStyle={{color:colors.title}} color={COLORS.primary} uncheckedColor={COLORS.label} style={{paddingVertical:2}} label="Price - high to low" value="price-hightolow" />
                            <RadioButton.Item labelStyle={{color:colors.title}} color={COLORS.primary} uncheckedColor={COLORS.label} style={{paddingVertical:2}} label="Price - low to hight" value="price-lowtohigh" />
                            <RadioButton.Item labelStyle={{color:colors.title}} color={COLORS.primary} uncheckedColor={COLORS.label} style={{paddingVertical:2}} label="Popularity" value="popularity" />
                            <RadioButton.Item labelStyle={{color:colors.title}} color={COLORS.primary} uncheckedColor={COLORS.label} style={{paddingVertical:2}} label="Trending" value="Trending" />
                        </RadioButton.Group>
                    </View>
                </ScrollView>
            </BottomSheetScrollView>
        </BottomSheet>
    )
}


export default forwardRef(SortbySheet);