import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import Routes from './app/Navigations/Route';
import { AuthProvider } from './app/context/AuthContext';
import { NotificationProvider } from './app/context/NotificationContext';
import ConnectionBanner from './app/components/ConnectionBanner';
import { QueryCacheProvider } from './app/cache/queryCache';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { COLORS } from './app/constants/theme';
import { configurePushNotifications } from './app/services/pushNotifications';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(COLORS.background).catch(() => {});
configurePushNotifications().catch(() => {});

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

		useEffect(() => {
			if (!loaded) return undefined;

			SplashScreen.hideAsync().catch(() => {});
			return undefined;
		}, [loaded]);

		if(!loaded){
		  return null;
		}

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <KeyboardProvider preload={false}>
            <SafeAreaProvider style={{ backgroundColor: COLORS.background }}>
              <QueryCacheProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <Routes/>
                    <ConnectionBanner/>
                  </NotificationProvider>
                </AuthProvider>
              </QueryCacheProvider>
            </SafeAreaProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
    );
};

export default App;
