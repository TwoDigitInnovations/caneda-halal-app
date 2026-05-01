import {createDrawerNavigator} from '@react-navigation/drawer';
import DrawerContent from '../Assets/Component/DrawerContent';
import Home from '../screen/ride/user/Home';
import SelectRide from '../screen/ride/user/SelectRide';
import RideDetail from '../screen/ride/user/RideDetail';
import Constants from '../Assets/Helpers/constant';
import useModuleStatusBar from '../Assets/Helpers/useModuleStatusBar';
const Drawer = createDrawerNavigator();

export default function SideMenu() {
  useModuleStatusBar({bg: Constants.dark_green, barStyle: 'light-content'});
  return (
    <Drawer.Navigator
      // initialRouteName="SideMenu"
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        gestureEnabled: true,
        // drawerStyle: {backgroundColor: 'transparent'},
      }}>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="SelectRide" component={SelectRide} />
      <Drawer.Screen name="RideDetail" component={RideDetail} />
    </Drawer.Navigator>
  );
}