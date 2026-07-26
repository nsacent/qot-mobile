import React, { useState } from "react";
import { Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { 
  NavigationContainer, 
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme
} from '@react-navigation/native';
import StackNavigator from "./StackNavigator";
import themeContext from "../constants/themeContext";
import { COLORS } from "../constants/theme";

const linking = {
  prefixes: ['qot://', 'https://qot.ug'],
  config: {
    screens: {
      ItemDetails: 'ads/:listingId',
      Anotherprofile: 'sellers/:sellerId',
      Sellers: 'sellers',
      ResetPassword: 'reset-password',
      SingleChat: 'messages/:threadId',
      NotificationsCenter: 'notifications',
      ListingAnalytics: 'account/analytics/:listingId',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;
    const response = Notifications.getLastNotificationResponse();
    const notificationUrl = response?.notification?.request?.content?.data?.url;
    return typeof notificationUrl === 'string' ? notificationUrl : null;
  },
  subscribe(listener) {
    const linkSubscription = Linking.addEventListener('url', ({ url }) => listener(url));
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const notificationUrl = response.notification.request.content.data?.url;
      if (typeof notificationUrl === 'string') listener(notificationUrl);
    });

    return () => {
      linkSubscription.remove();
      notificationSubscription.remove();
    };
  },
};


const Routes = () => {
  
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const authContext = React.useMemo(() => ({
    setDarkTheme: () => {
      setIsDarkTheme(true);
    },
    setLightTheme: () => {
      setIsDarkTheme(false);
    }
  }), []);

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: COLORS.background,
      title : COLORS.title,
      card : COLORS.card,
      text : COLORS.text,
      textLight : COLORS.textLight,
      input : COLORS.input,
      borderColor : COLORS.borderColor,
      border : "rgba(15,23,42,.1)",
    }
  }
  
  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      background: COLORS.darkBackground,
      title : COLORS.darkTitle,
      card : COLORS.darkCard,
      text : COLORS.darkText,
      textLight : COLORS.darkTextLight,
      input : COLORS.darkInput,
      borderColor : COLORS.darkBorder,
      border : "rgba(255,255,255,.1)",
    }
  }
  
  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme; 

  return (
    <themeContext.Provider value={authContext}>
      <NavigationContainer theme={theme} linking={linking}>
        <StackNavigator/>
      </NavigationContainer>
    </themeContext.Provider>
  );
  
};
export default Routes;
