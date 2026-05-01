import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignIn from '../screen/auth/SignIn';
import { navigationRef } from '../../navigationRef';
import PassengerDeatail from '../screen/ride/user/PassengerDeatail';
import StopPage from '../screen/ride/user/StopPage';
import HomeLocation from '../screen/ride/user/HomeLocation';
import WorkLocation from '../screen/ride/user/WorkLocation';
import RideAccount from '../screen/ride/user/RideAccount';
import SideMenu from './SideNavigation';
import RideProfile from '../screen/ride/user/RideProfile';
import MyRides from '../screen/ride/user/MyRides';
import Language from '../screen/ride/user/Language';
import Driverform from '../screen/ride/driver/Driverform';
import { Drivertab } from './DriverTab';
import OtpVerify from '../screen/auth/OtpVerify';
import DriverRideDetail from '../screen/ride/driver/DriverRideDetail';
import RideAction from '../screen/ride/driver/RideAction';
import DriverProfile from '../screen/ride/driver/DriverProfile';
import Options from '../screen/auth/Options';
import Onboarding from '../screen/food/user/Onboarding';
import { Foodtab } from './FoodTab';
import SearchPage from '../screen/food/user/SearchPage';
import FoodAccount from '../screen/food/user/FoodAccount';
import PreView from '../screen/food/user/PreView';
import {FoodSellerTab } from './FoodSellerTab';
import SellerForm from '../screen/food/seller/SellerForm';
import FoodSellerProfile from '../screen/food/seller/Profile';
import FoodCategories from '../screen/food/user/Categories';
import Foods from '../screen/food/user/Foods';
import Shipping from '../screen/food/user/Shipping';
import FoodOrders from '../screen/food/user/Foodorders';
import { Ridertab } from './RiderTab';
import RiderForm from '../screen/deliveryrider/RiderForm';
import Map from '../screen/deliveryrider/Map';
import Withdraw from '../screen/food/seller/Withdraw';
import Transaction from '../screen/food/seller/Transaction';
import Track from '../screen/food/user/Track';
import TransactionHistory from '../screen/deliveryrider/TransactionHistory';
import DeliveryRiderProfile from '../screen/deliveryrider/RiderProfile';
import Reviews from '../screen/food/seller/Reviews';
import FoodUserNotification from '../screen/food/user/Notification';
import DeliveryRiderNotification from '../screen/deliveryrider/Notification';
import MostSellingFoods from '../screen/food/seller/MostSelling';
import VerifyDelivery from '../screen/food/seller/VerifyDelivery';
import FoodSellerOrder from '../screen/food/seller/FoodSellerOrder';
import { Grocerytab } from './GroceryTab';
import { GrocerySellerTab } from './GrocerySellerTab';
import GroceryProducts from '../screen/grocery/app/Products';
import GrocerySearchpage from '../screen/grocery/app/Searchpage';
import GroceryPreview from '../screen/grocery/app/Preview';
import Groceryprofile from '../screen/grocery/app/Profile';
import GroceryShipping from '../screen/grocery/app/Shipping';
import GrocerySellerForm from '../screen/grocery/seller/GrocerySellerForm';
import GroceryUserNotification from '../screen/grocery/app/Notification';
import GroceryOrders from '../screen/grocery/app/Myorder';
import TrackGrocery from '../screen/grocery/app/TrackDriver';
import VerifyDeliveryGrocery from '../screen/grocery/seller/VerifyDeliveryGrocery';
import MostSellingGrocery from '../screen/grocery/seller/MostSelling';
import GrocerySellerOrder from '../screen/grocery/seller/History';
import GroceryWithdraw from '../screen/grocery/seller/Withdraw';
import GroceryTransaction from '../screen/grocery/seller/Transaction';
import GrocerySellerProfile from '../screen/grocery/seller/Profile';
import GrocerySellerReviews from '../screen/grocery/seller/Reviews';
import FavoriteGroceries from '../screen/grocery/app/FavoriteGroceries';
import FavoriteShoppings from '../screen/shopping/user/FavoriteShoppings';
import ShoppingSellerReviews from '../screen/shopping/seller/Reviews';
import { Shoppingtab } from './ShoppingUserTab';
import { ShoppingSellerTab } from './ShoppingSellerTab';
import ShoppingSellerForm from '../screen/shopping/seller/ShoppingSellerForm';
import ShoppingProducts from '../screen/shopping/user/Products';
import ShoppingPreview from '../screen/shopping/user/Preview';
import ShoppingSearchpage from '../screen/shopping/user/Searchpage';
import ShoppingShipping from '../screen/shopping/user/Shipping';
import ShoppingOrders from '../screen/shopping/user/Myorder';
import ShoppingCategories from '../screen/shopping/user/Categories';
import TrackShopping from '../screen/shopping/user/TrackDriver';
import ShoppingUserNotification from '../screen/shopping/user/Notification';
import Shoppingprofile from '../screen/shopping/user/Profile';
import MostSellingShopping from '../screen/shopping/seller/MostSelling';
import ShoppingSellerProfile from '../screen/shopping/seller/Profile';
import ShoppingTransaction from '../screen/shopping/seller/Transaction';
import VerifyDeliveryShopping from '../screen/shopping/seller/VerifyDeliveryGrocery';
import ShoppingWithdraw from '../screen/shopping/seller/Withdraw';
import ShoppingSellerOrder from '../screen/shopping/seller/History';
import Subscription from '../screen/ride/driver/Subscription';
import DriverHistory from '../screen/ride/driver/DriverHistory';
import DeliveryRiderHistory from '../screen/deliveryrider/DeliveryRiderHistory';
import DeliveryRiderWithdraw from '../screen/deliveryrider/DeliveryRiderWithdraw';
import RideDriverTransactionHistory from '../screen/ride/driver/TransactionHistory';
import DriverWithdraw from '../screen/ride/driver/Withdraw';
import DriverReviews from '../screen/ride/driver/Review';
import FavoriteFoods from '../screen/food/user/FavoriteFoods';
import ShopDetail from '../screen/food/user/ShopDetail';
import GroceryShops from '../screen/grocery/app/GroceryShops';
import GroceryShopDetail from '../screen/grocery/app/ShopDetail';
import ShoppingShops from '../screen/shopping/user/ShoppingShops';
import ShoppingShopDetail from '../screen/shopping/user/ShopDetail';
import RideUserNotification from '../screen/ride/user/Notification';
import ProductWithCategoryForSeller from '../screen/grocery/app/ProductWithCategoryForSeller';
import ShoppingWithCategoryForSeller from '../screen/shopping/user/ShoppingWithCategoryForSeller';
import { Masjidtab } from './MasjidTab';
import { Shippingtab } from './ShippingTab';
import Parcel from '../screen/shipping/Parcel';
import Cart from '../screen/grocery/app/Cart';



const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigate = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="SignIn" component={SignIn} />
      <AuthStack.Screen name="OtpVerify" component={OtpVerify} />
      
    </AuthStack.Navigator>
  );
};

export default function Navigation(props) {
  return (
      <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={props.initial}
       >
        
        <Stack.Screen name="Auth" component={AuthNavigate} />
        <Stack.Screen name="SideMenu" component={SideMenu} />
        {/* <Stack.Screen name="Home" component={Home} /> */}
        {/* <Stack.Screen name="SelectRide" component={SelectRide} /> */}
        {/* <Stack.Screen name="RideDetail" component={RideDetail} /> */}
        <Stack.Screen name="Drivertab" component={Drivertab} />
        <Stack.Screen name="PassengerDeatail" component={PassengerDeatail} />
        <Stack.Screen name="Driverform" component={Driverform} />
        <Stack.Screen name="Language" component={Language} />
        <Stack.Screen name="MyRides" component={MyRides} />
        <Stack.Screen name="HomeLocation" component={HomeLocation} />
        <Stack.Screen name="WorkLocation" component={WorkLocation} />
        <Stack.Screen name="RideAccount" component={RideAccount} />
        <Stack.Screen name="RideProfile" component={RideProfile} />
        <Stack.Screen name="DriverRideDetail" component={DriverRideDetail} />
        <Stack.Screen name="StopPage" component={StopPage} />
        <Stack.Screen name="RideAction" component={RideAction} />
        <Stack.Screen name="DriverProfile" component={DriverProfile} />
        <Stack.Screen name="Options" component={Options} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Foodtab" component={Foodtab} />
        <Stack.Screen name="SearchPage" component={SearchPage} />
        <Stack.Screen name="FoodAccount" component={FoodAccount} />
        <Stack.Screen name="PreView" component={PreView} />
        <Stack.Screen name="FoodSellerTab" component={FoodSellerTab} />
        <Stack.Screen name="ShopDetail" component={ShopDetail} />
        <Stack.Screen name="SellerForm" component={SellerForm} />
        <Stack.Screen name="FoodSellerProfile" component={FoodSellerProfile} />
        <Stack.Screen name="FoodCategories" component={FoodCategories} />
        <Stack.Screen name="Foods" component={Foods} />
        <Stack.Screen name="FavoriteFoods" component={FavoriteFoods} />
        <Stack.Screen name="Shipping" component={Shipping} />
        <Stack.Screen name="FoodOrders" component={FoodOrders} />
        <Stack.Screen name="Ridertab" component={Ridertab} />
        <Stack.Screen name="RiderForm" component={RiderForm} />
        <Stack.Screen name="Map" component={Map} />
        <Stack.Screen name="Withdraw" component={Withdraw} />
        <Stack.Screen name="Transaction" component={Transaction} />
        <Stack.Screen name="Track" component={Track} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
        <Stack.Screen name="RideDriverTransactionHistory" component={RideDriverTransactionHistory} />
        <Stack.Screen name="DeliveryRiderWithdraw" component={DeliveryRiderWithdraw} />
        <Stack.Screen name="DriverWithdraw" component={DriverWithdraw} />
        <Stack.Screen name="DeliveryRiderHistory" component={DeliveryRiderHistory} />
        <Stack.Screen name="DriverHistory" component={DriverHistory} />
        <Stack.Screen name="DeliveryRiderProfile" component={DeliveryRiderProfile} />
        <Stack.Screen name="Reviews" component={Reviews} />
        <Stack.Screen name="FoodUserNotification" component={FoodUserNotification} />
        <Stack.Screen name="DeliveryRiderNotification" component={DeliveryRiderNotification} />
        <Stack.Screen name="MostSellingFoods" component={MostSellingFoods} />
        <Stack.Screen name="VerifyDelivery" component={VerifyDelivery} />
        <Stack.Screen name="FoodSellerOrder" component={FoodSellerOrder} />
        <Stack.Screen name="Grocerytab" component={Grocerytab} />
        <Stack.Screen name="GrocerySellerTab" component={GrocerySellerTab} />
        <Stack.Screen name="GroceryProducts" component={GroceryProducts} />
        <Stack.Screen name="GrocerySearchpage" component={GrocerySearchpage} />
        <Stack.Screen name="GroceryPreview" component={GroceryPreview} />
        <Stack.Screen name="GroceryShops" component={GroceryShops} />
        <Stack.Screen name="GroceryShopDetail" component={GroceryShopDetail} />
        <Stack.Screen name="Groceryprofile" component={Groceryprofile} />
        <Stack.Screen name="GroceryShipping" component={GroceryShipping} />
        <Stack.Screen name="GrocerySellerForm" component={GrocerySellerForm} />
        <Stack.Screen name="GroceryUserNotification" component={GroceryUserNotification} />
        <Stack.Screen name="GroceryOrders" component={GroceryOrders} />
        <Stack.Screen name="TrackGrocery" component={TrackGrocery} />
        <Stack.Screen name="VerifyDeliveryGrocery" component={VerifyDeliveryGrocery} />
        <Stack.Screen name="MostSellingGrocery" component={MostSellingGrocery} />
        <Stack.Screen name="GrocerySellerOrder" component={GrocerySellerOrder} />
        <Stack.Screen name="GroceryWithdraw" component={GroceryWithdraw} />
        <Stack.Screen name="GroceryTransaction" component={GroceryTransaction} />
        <Stack.Screen name="GrocerySellerProfile" component={GrocerySellerProfile} />
        <Stack.Screen name="GrocerySellerReviews" component={GrocerySellerReviews} />
        <Stack.Screen name="FavoriteGroceries" component={FavoriteGroceries} />
        <Stack.Screen name="FavoriteShoppings" component={FavoriteShoppings} />
        <Stack.Screen name="ShoppingSellerReviews" component={ShoppingSellerReviews} />
        <Stack.Screen name="Shoppingtab" component={Shoppingtab} />

        <Stack.Screen name="ShoppingSellerTab" component={ShoppingSellerTab} />
        <Stack.Screen name="ShoppingSellerForm" component={ShoppingSellerForm} />
        <Stack.Screen name="ShoppingProducts" component={ShoppingProducts} />
        <Stack.Screen name="ShoppingPreview" component={ShoppingPreview} />
        <Stack.Screen name="ShoppingSearchpage" component={ShoppingSearchpage} />
        <Stack.Screen name="ShoppingShipping" component={ShoppingShipping} />
        <Stack.Screen name="ShoppingOrders" component={ShoppingOrders} />
        <Stack.Screen name="ShoppingCategories" component={ShoppingCategories} />
        <Stack.Screen name="TrackShopping" component={TrackShopping} />
        <Stack.Screen name="ShoppingUserNotification" component={ShoppingUserNotification} />
        <Stack.Screen name="Shoppingprofile" component={Shoppingprofile} />
        <Stack.Screen name="ShoppingShops" component={ShoppingShops} />
        <Stack.Screen name="ShoppingShopDetail" component={ShoppingShopDetail} />
        <Stack.Screen name="MostSellingShopping" component={MostSellingShopping} />
        <Stack.Screen name="ShoppingSellerProfile" component={ShoppingSellerProfile} />
        <Stack.Screen name="ShoppingTransaction" component={ShoppingTransaction} />
        <Stack.Screen name="VerifyDeliveryShopping" component={VerifyDeliveryShopping} />
        <Stack.Screen name="ShoppingWithdraw" component={ShoppingWithdraw} />
        <Stack.Screen name="ShoppingSellerOrder" component={ShoppingSellerOrder} />
        <Stack.Screen name="Subscription" component={Subscription} />
        <Stack.Screen name="DriverReviews" component={DriverReviews} />
        <Stack.Screen name="RideUserNotification" component={RideUserNotification} />
        <Stack.Screen name="ProductWithCategoryForSeller" component={ProductWithCategoryForSeller} />
        <Stack.Screen name="ShoppingWithCategoryForSeller" component={ShoppingWithCategoryForSeller} />
        <Stack.Screen name="Masjidtab" component={Masjidtab} />
        <Stack.Screen name="Shippingtab" component={Shippingtab} />
        <Stack.Screen name="Parcel" component={Parcel} />
        <Stack.Screen name="GroceryCart" component={Cart} />

      </Stack.Navigator>
      

    </NavigationContainer>
  );
}
