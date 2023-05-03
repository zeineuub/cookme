const API_URL = "http://192.168.146.55:3000/api/v1";
import { Title, Caption, Drawer } from "react-native-paper";
import { View, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { AuthContext } from "../components/AuthContext";
import AVATARSVG from "../assets/images/profilPic.svg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useFonts } from "expo-font";
import * as Localization from "expo-localization";
import i18n from "i18n-js";
import { fr, en } from "../assets/i18n/supportedLanguages";
import { useIsFocused } from '@react-navigation/native';

export function DrawerContent(props) {
  const { signOut } = React.useContext(AuthContext);
  const [user, setUser] = React.useState({});
  const isFocused = useIsFocused();

  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const onLoggedIn = async (token) => {
    fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        try {
          const jsonRes = await res.json();
          if (res.status === 200) {
            const user = {
              firstName: jsonRes.firstName,
              lastName: jsonRes.lastName,
              email: jsonRes.email,
            };
            setUser(user);
          }
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  React.useEffect(() => {
    const init = async () => {
      i18n.fallbacks = true;
      i18n.translations = { en, fr };
      try {
        const language = await AsyncStorage.getItem("user-language");
        i18n.locale = language;
        const token = await AsyncStorage.getItem("accessToken");
        await onLoggedIn(token);
      } catch (e) {
        console.log(e);
      }
    };
    init();
  }, [isFocused]);
  const [loaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.otf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.otf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.otf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.otf"),
  });

  if (!loaded) {
    return null;
  }
  return (
    <DrawerContentScrollView {...props}>

    <View style={{marginTop:-5, height: "100%" ,width:"100%"}}>
        <LinearGradient
          colors={["#F8932D", "#FA783E", "#FC5851"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 900, width:"100%" ,}}
        >
          <View style={styles.drawerContent}>
            <View style={styles.userInfoSection}>
              <View
                style={{
                  flexDirection: "column",
                  marginTop: 15,
                  alignItems: "center",
                }}
              >
                <AVATARSVG width={127} height={86} />
                <View style={{ marginLeft: 15, flexDirection: "column" }}>
                  <Title style={styles.title}>
                    {user.firstName} {user.lastName}
                  </Title>
                  <Caption style={styles.caption}>{user.email}</Caption>
                </View>
                <View
                  style={{
                    borderBottomColor: "white",
                    borderBottomWidth: 2,
                  }}
                />
              </View>
            </View>

            <Drawer.Section style={styles.drawerSection}>
              <DrawerItem
                icon={({ color, size, focused }) => (
                  <Icon color={color} size={size} name={focused ? 'home' : 'home-outline'}  />
                )}
                activeBackgroundColor="white"
                activeTintColor="black"
                inactiveTintColor="white"
                label={i18n.t("drawer.home")}
                onPress={() => {
                  props.navigation.navigate("Home");
                }}
              />
              <DrawerItem 
                icon={({ color, size, focused }) => (
                  <Icon name={focused ? 'account' : 'account-outline'} color={color} size={size} />
                )}
                label={i18n.t("drawer.profile")}
                activeBackgroundColor="white"
                activeTintColor="black"
                inactiveTintColor="white"
                onPress={() => {
                  props.navigation.navigate("ProfileStack");
                }}
              />
              <DrawerItem
                icon={({ color, size,focused }) => (
                  <Icon  name={focused ? 'cog' : 'cog-outline'} color={color} size={size} />
                )}
                activeBackgroundColor="white"
                activeTintColor="black"
                inactiveTintColor="white"
                label={i18n.t("drawer.params")}
                onPress={() => {
                  props.navigation.navigate("SettingsStack");
                }}
                options={{
                  animationEnabled: false,
                }}
              />

              <DrawerItem
                icon={({ color, size }) => (
                  <Icon name="exit-to-app" color={color} size={size} />
                )}
                label={i18n.t("drawer.logout")}
                activeBackgroundColor="white"
                activeTintColor="black"
                inactiveTintColor="white"
                onPress={() => {
                  signOut();
                }}
              />
            </Drawer.Section>
          </View>
        </LinearGradient>
    </View>
    </DrawerContentScrollView>

  );
}
const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    top:-10,
    height: "100%" 
  },
  userInfoSection: {
    paddingLeft: 0,
  },
  title: {
    fontSize: 14,
    marginTop: 3,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  caption: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    backgroundColor: "#",
  },
});
