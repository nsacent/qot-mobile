import React from "react";
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";

import DrawerNavigation from "./DrawerNavigation";
import SignUp from "../Screens/Auth/SignUp";
import SignIn from "../Screens/Auth/SignIn";
import VerifyAccount from "../Screens/Auth/VerifyAccount";
import ResetPassword from "../Screens/Auth/ResetPassword";
import Categories from "../Screens/Categories/Categories";
import CarHome from "../Screens/Item/CarHome";
import Items from "../Screens/Item/Items";
import ItemDetails from "../Screens/Item/ItemDetails";
import Components from "../Screens/Components/Components";
import AccordionScreen from "../Screens/Components/Accordion";
import BottomSheet from "../Screens/Components/BottomSheet";
import ActionModals from "../Screens/Components/ActionModals";
import Buttons from "../Screens/Components/Buttons";
import Charts from "../Screens/Components/Charts";
import Badges from "../Screens/Components/Badges";
import DividerElements from "../Screens/Components/DividerElements";
import Inputs from "../Screens/Components/Inputs";
import Headers from "../Screens/Components/Headers";
import Footers from "../Screens/Components/Footers";
import TabStyle1 from "../components/Footers/FooterStyle1";
import TabStyle2 from "../components/Footers/FooterStyle2";
import TabStyle3 from "../components/Footers/FooterStyle3";
import TabStyle4 from "../components/Footers/FooterStyle4";
import ListScreen from "../Screens/Components/Lists";
import Pricings from "../Screens/Components/Pricings";
import Snackbars from "../Screens/Components/Snakbars";
import Socials from "../Screens/Components/Socials";
import SwipeableScreen from "../Screens/Components/Swipeable";
import Tabs from "../Screens/Components/Tabs";
import Tables from "../Screens/Components/Tables";
import Toggles from "../Screens/Components/Toggles";
import SingleChat from "../Screens/chat/SingleChat";
import Call from "../Screens/chat/Call";
import Sell from "../Screens/sell/Sell";
import Location from "../Screens/sell/Sellfrom/Location";
import Uploadphoto from "../Screens/sell/Sellfrom/Uploadphoto";
import Setprice from "../Screens/sell/Sellfrom/Setprice";
import Comfirmlocation from "../Screens/sell/Sellfrom/Comfirmlocation";
import Review from "../Screens/sell/Sellfrom/Review";
import FollowerFollowing from "../Screens/profile/Follower&Following";
import Editprofile from "../Screens/profile/Editprofile";
import Setting from "../Screens/setting/Setting";
import Notification from "../Screens/setting/Notification";
import Privacy from "../Screens/setting/privacy/Privacy";
import Changepassword from "../Screens/setting/privacy/Changepassword";
import BuyPackages from "../Screens/setting/buypackages/BuyPackages";
import Myorders from "../Screens/setting/buypackages/Myorders";
import Language from "../Screens/setting/language/Language";
import Help from "../Screens/setting/Help/Help";
import SafetyCenter from "../Screens/setting/Help/SafetyCenter";
import LegalCenter from "../Screens/setting/Help/LegalCenter";
import Billinginformation from "../Screens/setting/buypackages/Billinginformation";
import Anotherprofile from "../Screens/profile/Anotherprofile";
import Selllist from "../Screens/sell/Selllist/Selllist";
import Form from "../Screens/sell/Sellfrom/Form";
import Myads from "../Screens/myads/Myads";
import SellerDashboard from "../Screens/dashboard/SellerDashboard";
import SellerAnalytics from "../Screens/dashboard/SellerAnalytics";
import ListingAnalytics from "../Screens/dashboard/ListingAnalytics";
import SellerRenewals from "../Screens/dashboard/SellerRenewals";
import RecentlyViewed from "../Screens/account/RecentlyViewed";
import AccountActivity from "../Screens/account/AccountActivity";
import NotificationsCenter from "../Screens/account/NotificationsCenter";
import SellerReviews from "../Screens/account/SellerReviews";
import MyReviews from "../Screens/account/MyReviews";
import Sellers from "../Screens/sellers/Sellers";
import FollowingFeed from "../Screens/account/FollowingFeed";


const StackComponent = createStackNavigator();

const StackNavigator = () => {

  const theme = useTheme();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{width:'100%', flex: 1 }}>
      <StackComponent.Navigator
        initialRouteName={isAuthenticated ? "DrawerNavigation" : "SignIn"}
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "transparent",flex:1 },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <StackComponent.Screen name={"SignIn"} component={SignIn} />
        <StackComponent.Screen name={"SignUp"} component={SignUp} />
        <StackComponent.Screen name={"VerifyAccount"} component={VerifyAccount} />
        <StackComponent.Screen name={"ResetPassword"} component={ResetPassword} />
        <StackComponent.Screen name={"DrawerNavigation"} component={DrawerNavigation} />
        <StackComponent.Screen name={"Categories"} component={Categories} />
        <StackComponent.Screen name={"CarHome"} component={CarHome} />
        <StackComponent.Screen name={"Items"} component={Items} />
        <StackComponent.Screen name={"ItemDetails"} component={ItemDetails} />
        <StackComponent.Screen name={"Components"} component={Components} />
        <StackComponent.Screen name={"Accordion"} component={AccordionScreen} />
        <StackComponent.Screen name={"BottomSheet"} component={BottomSheet} />
        <StackComponent.Screen name={"ActionModals"} component={ActionModals} />
        <StackComponent.Screen name={"Buttons"} component={Buttons} />
        <StackComponent.Screen name={"Charts"} component={Charts} />
        <StackComponent.Screen name={"Badges"} component={Badges} />
        <StackComponent.Screen name={"DividerElements"} component={DividerElements} />
        <StackComponent.Screen name={"Inputs"} component={Inputs} />
        <StackComponent.Screen name={"Headers"} component={Headers} />
        <StackComponent.Screen name={"Footers"} component={Footers} />
        <StackComponent.Screen name={"TabStyle1"} component={TabStyle1} />
        <StackComponent.Screen name={"TabStyle2"} component={TabStyle2} />
        <StackComponent.Screen name={"TabStyle3"} component={TabStyle3} />
        <StackComponent.Screen name={"TabStyle4"} component={TabStyle4} />
        <StackComponent.Screen name={"lists"} component={ListScreen} />
        <StackComponent.Screen name={"Pricings"} component={Pricings} />
        <StackComponent.Screen name={"Snackbars"} component={Snackbars} />
        <StackComponent.Screen name={"Socials"} component={Socials} />
        <StackComponent.Screen name={"Swipeable"} component={SwipeableScreen} />
        <StackComponent.Screen name={"Tabs"} component={Tabs} />
        <StackComponent.Screen name={"Tables"} component={Tables} />
        <StackComponent.Screen name={"Toggles"} component={Toggles} />
        <StackComponent.Screen name={"SingleChat"} component={SingleChat} />
        <StackComponent.Screen name={"Call"} component={Call} />
        <StackComponent.Screen name={"Sell"} component={Sell} />
        <StackComponent.Screen name={"MyAds"} component={Myads} />
        <StackComponent.Screen name={"SellerDashboard"} component={SellerDashboard} />
        <StackComponent.Screen name={"SellerAnalytics"} component={SellerAnalytics} />
        <StackComponent.Screen name={"ListingAnalytics"} component={ListingAnalytics} />
        <StackComponent.Screen name={"SellerRenewals"} component={SellerRenewals} />
        <StackComponent.Screen name={"RecentlyViewed"} component={RecentlyViewed} />
        <StackComponent.Screen name={"AccountActivity"} component={AccountActivity} />
        <StackComponent.Screen name={"NotificationsCenter"} component={NotificationsCenter} />
        <StackComponent.Screen name={"SellerReviews"} component={SellerReviews} />
        <StackComponent.Screen name={"MyReviews"} component={MyReviews} />
        <StackComponent.Screen name={"Sellers"} component={Sellers} />
        <StackComponent.Screen name={"FollowingFeed"} component={FollowingFeed} />
        <StackComponent.Screen name={"Location"} component={Location} />
        <StackComponent.Screen name={"Uploadphoto"} component={Uploadphoto} />
        <StackComponent.Screen name={"Setprice"} component={Setprice} />
        <StackComponent.Screen name={"Comfirmlocation"} component={Comfirmlocation} />
        <StackComponent.Screen name={"Review"} component={Review} />
        <StackComponent.Screen name={"FollowerFollowing"} component={FollowerFollowing} />
        <StackComponent.Screen name={"Editprofile"} component={Editprofile} />
        <StackComponent.Screen name={"Setting"} component={Setting} />
        <StackComponent.Screen name={"Notification"} component={Notification} />
        <StackComponent.Screen name={"Privacy"} component={Privacy} />
        <StackComponent.Screen name={"Changepassword"} component={Changepassword} />
        <StackComponent.Screen name={"BuyPackages"} component={BuyPackages} />
        <StackComponent.Screen name={"Myorders"} component={Myorders} />
        <StackComponent.Screen name={"Language"} component={Language} />
        <StackComponent.Screen name={"Help"} component={Help} />
        <StackComponent.Screen name={"SafetyCenter"} component={SafetyCenter} />
        <StackComponent.Screen name={"LegalCenter"} component={LegalCenter} />
        <StackComponent.Screen name={"Billinginformation"} component={Billinginformation} />
        <StackComponent.Screen name={"Anotherprofile"} component={Anotherprofile} />
        <StackComponent.Screen name={"Selllist"} component={Selllist} />
        <StackComponent.Screen name={"Form"} component={Form} />



      </StackComponent.Navigator>
    </View>
  );
};
export default StackNavigator;
