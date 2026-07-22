import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, } from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { Checkbox, List } from 'react-native-paper';
import { COLORS, FONTS, IMAGES } from '../../constants/theme';
import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ButtonOutline from '../../components/Button/ButtonOutline';
import Button from '../../components/Button/Button';



const BrandFilterData = [
    {
        selected: true,
        title: "Under 3 Years",
    },
    {
        selected: false,
        title: "Under 5 Years",
    },
    {
        selected: false,
        title: "Under 7 Years",
    },
    {
        selected: true,
        title: "7 Years and Above",
    },
];

const ShortfilterSheet = (props, ref) => {

     
    const { colors } = useTheme();

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

    const handleClosePress = () => {
        bottomSheetRef.current.close()
    }


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
                    <View
                        style={[GlobalStyleSheet.container,{
                            padding:0,
                            flexDirection:'row',
                            flexWrap:'wrap',
                        }]}
                    >
                        {BrandFilterData.map((data, index) => {
                            const [show, setshow] = useState(false)
                            return (
                                <View
                                    key={index}
                                    style={{
                                        width:'100%',
                                    }}
                                >   
                                    <Checkbox.Item
                                        position='leading'
                                        label={data.title}
                                        labelStyle={{
                                            ...FONTS.font,
                                            fontSize: 15,
                                            color: colors.title,
                                            textAlign: 'left',
                                            width: '100%',
                                        }}
                                        style={{paddingVertical:5,padding:0}}
                                        uncheckedColor={colors.text}
                                        color={COLORS.primary}
                                        status={show ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setshow(!show)
                                        }}
                                    />
                                </View>
                            )
                        })}  
                    </View>
                </ScrollView>
                <View style={[GlobalStyleSheet.container, { marginBottom: 70 }]}>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'center', gap: 10
                    }}>
                    <View style={{ flex: 1 }}>
                        <ButtonOutline
                            title="Clear all"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Button
                            title="Apply"
                        />
                    </View>
                    </View>
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    )
}


export default forwardRef(ShortfilterSheet);