import React,{ useEffect, useRef } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import FavoriteScreen from '../screens/FavoriteScreen';
import { View,StyleSheet, TouchableOpacity } from 'react-native'
import HomeScreen from "../screens/HomeScreen";
import MENUSVG from "../assets/images/menu.svg";
import AVATARSVG from "../assets/images/avatar.svg";
import BACKSVG from "../assets/images/back_btn.svg";
import LIKESVG from "../assets/images/like.svg";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import * as Animatable from 'react-native-animatable';
import ProfileStack from './ProfileStack';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
import Icon, { Icons } from '../components/Icon';
import DetailScreen from '../screens/DetailScreen';
const HomeStack = ({ navigation }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible:false,
        headerStyle: {
          backgroundColor: "white",
          elevation: 0, // Android
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title:"",
          headerLeft: () => (
            <View style={{ marginLeft: 10,maginTop:30 }}>
              <MENUSVG onPress={() => navigation.openDrawer()} />
            </View>
          ),
          headerRight: () => (
            
            <TouchableOpacity onPress={() => navigation.navigate('Profile1')} style={{ marginRight: 10 }}>
              <AVATARSVG />
            </TouchableOpacity>
          ),
          tabBarVisible: false ,
          animationEnabled: false,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title:"",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
              <BACKSVG />
            </TouchableOpacity>
          ),


          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
const FavoriteStack = ({navigation}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible:false,
        headerStyle: {
          backgroundColor: "white",
          elevation: 0, // Android
          color:"black"
        },
      }}
    >
      <Stack.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{
          title:"",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
              <BACKSVG />
            </TouchableOpacity>
          ),
          headerRight: () => ( 
            <TouchableOpacity style={{ marginRight: 10 }}>
              <LIKESVG />
            </TouchableOpacity>
          ),
          tabBarVisible: false ,
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
const TabArr = [
  { route: 'Home2', label: 'Home', type: Icons.Ionicons, activeIcon: 'grid', inActiveIcon: 'grid-outline', component: HomeStack },
  { route: 'Favorite2', label: 'Favorite', type: Icons.MaterialCommunityIcons, activeIcon: 'heart-plus', inActiveIcon: 'heart-plus-outline', component: FavoriteStack ,options: { tabBarVisible: false }},
  { route: 'Profile1', label: 'Profile', type: Icons.FontAwesome, activeIcon: 'user-circle', inActiveIcon: 'user-circle-o', component: ProfileStack,options: { tabBarVisible: false } },
];
const TabButton = (props) => {
  const { item, onPress, accessibilityState,  } = props;
  const focused = accessibilityState.selected;
  const viewRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate({0: {scale: .5, rotate: '0deg'}, 1: {scale: 1.5, rotate: '360deg'}});
    } else {
      viewRef.current.animate({0: {scale: 1.5, rotate: '360deg'}, 1: {scale: 1, rotate: '0deg'}});
    }
  }, [focused])

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}>
      <Animatable.View
        ref={viewRef}
        duration={1000}
        style={styles.container}>
        <Icon type={item.type} name={focused ? item.activeIcon : item.inActiveIcon} color={focused ? "#FF6433" : "#FFE8E0"} />
      </Animatable.View>
    </TouchableOpacity>
  )
}
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          position: 'absolute',
          bottom: 16,
          right: 16,
          left: 16,
          borderRadius: 16
        }
      }}
    >
    {TabArr.map((item, index) => {
      return (
        <Tab.Screen key={index} name={item.route} component={item.component}
        options={({route}) => ({
          tabBarStyle: {
            display: getTabBarVisibility(route),
          },
            tabBarButton: (props) => <TabButton {...props} item={item} />
          })}
        />
      )
    })}
      
    </Tab.Navigator>
  );
};
const getTabBarVisibility = route => {
  // console.log(route);
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
  // console.log(routeName);
  if( routeName == 'Detail' ) {
    return 'none';
  }
  return 'flex';
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
export default TabNavigator;
