import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Routes from './app/Navigations/Route';
import { AuthProvider } from './app/context/AuthContext';
import { NotificationProvider } from './app/context/NotificationContext';
import ConnectionBanner from './app/components/ConnectionBanner';
import { QueryCacheProvider } from './app/cache/queryCache';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync().catch(() => {});

const SPLASH_BACKGROUND = '#FFFDF9';

const App = () =>{
		const [showStartupSplash, setShowStartupSplash] = useState(true);
		const splashOpacity = useRef(new Animated.Value(1)).current;

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
			const holdTimer = setTimeout(() => {
				Animated.timing(splashOpacity, {
					toValue: 0,
					duration: 240,
					useNativeDriver: true,
				}).start(() => setShowStartupSplash(false));
			}, 950);

			return () => clearTimeout(holdTimer);
		}, [loaded, splashOpacity]);

		if(!loaded){
		  return null;
		}

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <QueryCacheProvider>
              <AuthProvider>
                <NotificationProvider>
                  <Routes/>
                  <ConnectionBanner/>
                </NotificationProvider>
              </AuthProvider>
            </QueryCacheProvider>
          </SafeAreaProvider>
		  {showStartupSplash ? (
			<Animated.View
				pointerEvents="none"
				style={[styles.startupSplash, { opacity: splashOpacity }]}
			>
				<StatusBar backgroundColor={SPLASH_BACKGROUND} barStyle="dark-content" translucent={false} />
				<Image
					source={require('./app/assets/images/qot-logo.png')}
					style={styles.startupLogo}
					resizeMode="contain"
				/>
			</Animated.View>
		  ) : null}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
	startupSplash: {
		...StyleSheet.absoluteFillObject,
		zIndex: 10000,
		backgroundColor: SPLASH_BACKGROUND,
		alignItems: 'center',
		justifyContent: 'center',
	},
	startupLogo: {
		width: 220,
		height: 96,
	},
});

export default App;
