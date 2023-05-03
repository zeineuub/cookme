import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AuthContext } from "./src/components/AuthContext";
import SplashScreen from "./src/screens/SplashScreen";
import { DrawerContent } from "./src/screens/DrawerContent";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileStack from "./src/navigation/ProfileStack";
import SettingsStack from "./src/navigation/SettingsStack";
import { StatusBar } from "react-native";
import AuthStack from "./src/navigation/AuthStack";
import TabNavigator from './src/navigation/TabNavigator';
import { LogBox } from "react-native";
import OnboardingScreen from './src/screens/OnboardingScreen';
const Drawer = createDrawerNavigator();
LogBox.ignoreAllLogs();

function App() {
  const initialLoginState = {
    isLoading: true,
    userToken: null,
  };
  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case "RETRIEVE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case "LOGIN":
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case "LOGOUT":
        return {
          ...prevState,
          userToken: null,
          isLoading: false,
        };
      case "REGISTER":
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
    }
  };
  const [loginState, dispatch] = useReducer(loginReducer, initialLoginState);
  const authContext = useMemo(
    () => ({
      signIn: async (token) => {
        const userToken = token;
        console.log(userToken);

        try {
          await AsyncStorage.setItem("accessToken", userToken);
        } catch (e) {
          console.log(e);
        }
        dispatch({ type: "LOGIN", token: userToken });
      },
      signOut: async () => {
        // setUserToken(null);
        // setIsLoading(false);
        try {
          await AsyncStorage.removeItem("accessToken");
        } catch (e) {
          console.log(e);
        }
        dispatch({ type: "LOGOUT" });
      },
      signUp: () => {
        // setUserToken('fgkj');
        // setIsLoading(false);
      },
    }),
    []
  );
  useEffect(() => {
    setTimeout(async () => {
      // setIsLoading(false);
      let userToken;
      userToken = null;
      try {
        userToken = await AsyncStorage.getItem("accessToken");
      } catch (e) {
        console.log(e);
      }
      // console.log('user token: ', userToken);
      dispatch({ type: "RETRIEVE_TOKEN", token: userToken });
    }, 1000);
  }, []);
  if (loginState.isLoading) {
    return <SplashScreen />;
  }
  return (
    <AuthContext.Provider value={authContext}>
      <StatusBar
        animated={true}
        barStyle="light-content"
      />
      <NavigationContainer>
        {loginState.userToken !== null ? (
          <Drawer.Navigator
          initialRouteName='Onboarding'
            screenOptions={{
              headerShadowVisible:false,
              headerShown:false,
              drawerActiveBackgroundColor:"#FFEB82",
              drawerActiveTintColor:"#fff",
              drawerInactiveTintColor:"white",
              drawerLabelStyle: {
                marginLeft: -25,
                fontFamily: "Poppins-Medium",
                fontSize: 15,
              },
              
            }}
            drawerContent={(props) => <DrawerContent {...props} />}
          >
            <Drawer.Screen
              name="Home"
              component={TabNavigator}
              options={{
                title: "",
                animationEnabled: false,

              }}
            />

            <Drawer.Screen
              name="ProfileStack"
              component={ProfileStack}
              options={{
                title: "",
                animationEnabled: false,
              }}
            />
            <Drawer.Screen
              name="SettingsStack"
              component={SettingsStack}
              options={{
                title: "",
                animationEnabled: false,
              }}
            />
          </Drawer.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
export default App;
