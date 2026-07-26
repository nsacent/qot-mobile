import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/Home/Home';
import Chat from '../Screens/chat/Chat';
import BottomTab from '../layout/BottomTab';
import Profile from '../Screens/profile/Profile';
import Saved from '../Screens/saved/Saved';

const Tab = createBottomTabNavigator();

const CreateAd2 = () => { }

const BottomNavigation = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
            initialRouteName={'Home'}
            tabBar={props => <BottomTab {...props} />}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Messages" component={Chat} />
            <Tab.Screen name="CreateAd2" component={CreateAd2} />
            <Tab.Screen name="Saved" component={Saved} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
};

export default BottomNavigation;
