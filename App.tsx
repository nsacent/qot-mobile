import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Routes from './app/Navigations/Route';
import { AuthProvider } from './app/context/AuthContext';
import { NotificationProvider } from './app/context/NotificationContext';
import ConnectionBanner from './app/components/ConnectionBanner';

const App = () =>{

		const [loaded] = useFonts({
        PoppinsRegular: require('./app/assets/fonts/Poppins-Regular.ttf'),
        PoppinsSemiBold : require('./app/assets/fonts/Poppins-SemiBold.ttf'),
        PoppinsMedium : require('./app/assets/fonts/Poppins-Medium.ttf'),
        PoppinsBold : require('./app/assets/fonts/Poppins-Bold.ttf'),
		Feather: require('react-native-vector-icons/Fonts/Feather.ttf'),
		FontAwesome: require('react-native-vector-icons/Fonts/FontAwesome.ttf'),
		Ionicons: require('react-native-vector-icons/Fonts/Ionicons.ttf'),
		'Material Icons': require('react-native-vector-icons/Fonts/MaterialIcons.ttf'),
		});  

		if(!loaded){
		  return null;
		}

    return (
        <SafeAreaProvider>
          <SafeAreaView
            style={{
                flex: 1,
              }}
            >
              <AuthProvider>
                <NotificationProvider>
                  <Routes/>
                  <ConnectionBanner/>
                </NotificationProvider>
              </AuthProvider>
          </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default App;
