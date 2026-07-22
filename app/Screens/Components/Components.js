import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Image, Platform } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import Ripple from 'react-native-material-ripple';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Header from '../../layout/Header';
import { GlobalStyleSheet } from '../../constants/StyleSheet';


const accordionIco = require('../../assets/images/icons/accordion.png');
const bottomSheet = require('../../assets/images/icons/bottomSheet.png');
const modal = require('../../assets/images/icons/modal.png');
const chart = require('../../assets/images/icons/chart.png');
const divider = require('../../assets/images/icons/divider.png');
const badge = require('../../assets/images/icons/badge.png');
const input = require('../../assets/images/icons/input.png');
const list = require('../../assets/images/icons/list.png');
const pricing = require('../../assets/images/icons/pricing.png');
const share = require('../../assets/images/icons/share.png');
const tabs = require('../../assets/images/icons/tabs.png');
const table = require('../../assets/images/icons/table.png');
const toggle = require('../../assets/images/icons/toggle.png');

const Components = (props) => {

    const {colors} = useTheme();

    const ComponentData = [
        {
            icon : accordionIco,
            title : "Accordions List",
            navigate : 'Accordion',
        },
        {
            icon : bottomSheet,
            title : "Bottom Sheets",
            navigate : 'BottomSheet',
        },
        {
            icon : modal,
            title : "Modal Box",
            navigate : 'ActionModals',
        },
        {
            icon : accordionIco,
            title : "Button Styles",
            navigate : 'Buttons',
        },
        {
            icon : badge,
            title : "Badges",
            navigate : 'Badges',
        },
        {
            icon : chart,
            title : "Charts",
            navigate : 'Charts',
        },
        {
            icon : accordionIco,
            title : "Header Styles",
            navigate : 'Headers',
        },
        {
            icon : accordionIco,
            title : "Footer Menu Styles",
            navigate : 'Footers',
        },
        {
            icon : input,
            title : "Inputs",
            navigate : 'Inputs',
        },
        {
            icon : list,
            title : "List Styles",
            navigate : 'lists',
        },
        {
            icon : pricing,
            title : "Pricing Pack",
            navigate : 'Pricings',
        },
        {
            icon : divider,
            title : "Seprators",
            navigate : 'DividerElements',
        },
        {
            icon : accordionIco,
            title : "Snackbars",
            navigate : 'Snackbars',
        },
        {
            icon : share,
            title : "Social",
            navigate : 'Socials',
        },
        {
            icon : accordionIco,
            title : "Swipeable",
            navigate : 'Swipeable',
        },
        {
            icon : tabs,
            title : "Tabs",
            navigate : 'Tabs',
        },
        {
            icon : table,
            title : "Table",
            navigate : 'Tables',
        },
        {
            icon : toggle,
            title : "Toggle",
            navigate : 'Toggles',
        },
    ]

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View
                style={{
                    flex:1,
                    backgroundColor:colors.background,
                }}
            >
                <Header
                    leftIcon={'back'}
                    titleLeft
                    title={'Components'}
                />
                <ScrollView
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={[GlobalStyleSheet.container,{padding:0, paddingBottom:15,paddingTop:15}]}
                >
                    {ComponentData.map((data,index) => {
                        return(
                            <View
                                key={index}
                                style={{
                                    marginBottom:6,
                                }}
                            >
                                <View
                                    style={[{
                                        shadowColor: COLORS.black,
                                        shadowOffset: {
                                            width: 0,
                                            height: 4,
                                        },
                                        shadowOpacity: .05,
                                        shadowRadius: 5,
                                    },Platform.OS === 'ios' && {
                                        backgroundColor:colors.card,
                                        borderRadius:SIZES.radius,
                                    }]}
                                >
                                    <Ripple
                                        onPress={() => props.navigation.navigate(data.navigate)}
                                        style={{
                                            flexDirection:'row',
                                            backgroundColor:colors.card,
                                            paddingHorizontal : 12,
                                            alignItems:'center',
                                            paddingVertical : 10,
                                            borderRadius:SIZES.radius,
                                        }}
                                    >
                                        <View style={{
                                            height:30,
                                            width:30,
                                            borderRadius:6,
                                            alignItems:'center',
                                            justifyContent:'center',
                                            marginRight:10,
                                        }}>
                                            <Image
                                                style={{
                                                    height:20,
                                                    width:20,
                                                    tintColor:COLORS.primary,
                                                    resizeMode:'contain',
                                                }}
                                                source={data.icon}
                                            />
                                        </View>
                                        <Text style={{...FONTS.font,...FONTS.fontTitle,color:colors.title,flex:1}}>{data.title}</Text>
                                        <FeatherIcon style={{opacity:.8}} color={colors.textLight} name={'chevron-right'} size={20}/>
                                    </Ripple>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};


export default Components;