import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import Header from '../../layout/Header';
import PricingStyle1 from '../../components/Pricing/PricingStyle1';
import PricingStyle2 from '../../components/Pricing/PricingStyle2';

const Pricings = () => {

    const {colors} = useTheme();

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <View style={{flex:1,backgroundColor:colors.background}}>
                <Header title={'Pricings'} titleLeft leftIcon={'back'}/>
                <ScrollView>
                    <View style={{...GlobalStyleSheet.container,alignItems:'center',paddingVertical:30}}>
                        <View  style={{marginBottom:20}}>
                            <PricingStyle1/>
                        </View>
                        <View  style={{marginBottom:30}}>
                            <PricingStyle2/>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};



export default Pricings;