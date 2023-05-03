import React from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MENUSVG from "../assets/images/menu.svg";
import ProfileScreen from "../screens/ProfileScreen";
const Stack = createNativeStackNavigator();
const ProfileStack = ({ navigation }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "white",
          elevation: 0, // Android
        },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "",
          headerLeft: () => (
            <View style={{ marginLeft: 10 }}>
              <MENUSVG onPress={() => navigation.openDrawer()} />
            </View>
          ),
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
export default ProfileStack;
