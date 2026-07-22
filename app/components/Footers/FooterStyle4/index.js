import React from 'react';
import { SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import Header from '../../../layout/Header';
import CustomNavigation from './CustomNavigation';


const Home = () => {
    return(
        <>
        </>
    )
}
const Market = () => {
    return(
        <>
        </>
    )
}
const Change = () => {
    return(
        <>
        </>
    )
}
const Wallet = () => {
    return(
        <>
        </>
    )
}
const Profile = () => {
    return(
        <>
        </>
    )
}

const Tab = createBottomTabNavigator();

const TabStyle4 = () => {

    const {colors} = useTheme();

    return (
        <SafeAreaView style={{flex:1,backgroundColor:colors.card}}>
            <Header title={'Footer Style 4'} titleLeft leftIcon={'back'}/>
            <Tab.Navigator
                 tabBar={props => <CustomNavigation {...props} />}
                 screenOptions={{
                     headerShown:false,
                 }}
                 initialRouteName="Post"
            >
                <Tab.Screen 
                    name="Home"
                    component={Home}

                />
                <Tab.Screen 
                    name="Search"
                    component={Market}
                />
                <Tab.Screen 
                    name="Post"
                    component={Change}
                />
                <Tab.Screen 
                    name="Chat"
                    component={Wallet}
                />
                <Tab.Screen 
                    name="Profile"
                    component={Profile}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};



export default TabStyle4;