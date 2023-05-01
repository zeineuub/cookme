import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ForgetPasswordScreen from "../screens/ForgetPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordSreen";
import HomeScreen from "../screens/HomeScreen";
import TabNavigator from "./TabNavigator";
const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>

    <Stack.Screen
      name="SignIn"
      component={SignInScreen}
      options={{
        animationEnabled: false,
      }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUpScreen}
      options={{
        animationEnabled: false,
      }}
    />
        
    <Stack.Screen
      name="Forget-Password"
      component={ForgetPasswordScreen}
      options={{
        animationEnabled: false,
      }}
    />
    <Stack.Screen
      name="Reset-Password"
      component={ResetPasswordScreen}
      options={{
        animationEnabled: false,
      }}
    />
    <Stack.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{
        animationEnabled: false,
      }}
    />
  </Stack.Navigator>
);

export default AuthStack;
