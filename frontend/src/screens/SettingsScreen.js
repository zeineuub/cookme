import React, { useState, useContext, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
} from "react-native";
import { TouchableRipple, useTheme } from "react-native-paper";
import { AuthContext } from "../components/AuthContext";

import { useFonts } from "expo-font";
import IonIcon from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = "http://192.168.146.55:3000/api/v1";
import BottomSheet from "reanimated-bottom-sheet";
import Animated from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";

import i18n from "i18n-js";
import { fr, en } from "../assets/i18n/supportedLanguages";

const SettingsScreen = ({ navigation }) => {
  // This hook returns `true` if the screen is focused, `false` otherwise
  const isFocused = useIsFocused();
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("unknown");
  const paperTheme = useTheme();
  const showToast = (message) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.TOP);
  };

  const { signOut, toggleTheme } = useContext(AuthContext);
  const [value, setValue] = React.useState(paperTheme.dark);
  const updateLanguage = async (lang) => {
    let payload = {
      language: lang,
    };
    const token = await AsyncStorage.getItem("accessToken");

    fetch(`${API_URL}/user/language`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        try {
          const jsonRes = await res.json();
          if (res.status !== 200) {
            const { message } = jsonRes.errors[0];
            setMessage(message);
            showToast(message)
          } else {
            const user = jsonRes;
            await AsyncStorage.setItem("user-language", user.data.language);
            const lang = await AsyncStorage.getItem("user-language");
            setLanguage(lang);
            i18n.locale = language;
          }
        } catch (err) {
          showToast(i18n.t("error.update"))
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const renderInner = () => (
    <View style={styles.panel}>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.panelTitle}>{i18n.t("settings.language")}</Text>
        <Text style={styles.panelSubtitle}>
          {i18n.t("settings.languageSub")}
        </Text>
      </View>
      <TouchableOpacity
        style={{ flex: 0, flexDirection: "row" }}
        onPress={() => updateLanguage("fr")}
      >
        <Image
          source={require("../assets/images/france.png")}
          style={styles.flag}
        />
        <Text style={styles.panelButtonTitle}>{i18n.t("header.fr")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 0, flexDirection: "row" }}
        onPress={() => updateLanguage("en")}
      >
        <Image
          source={require("../assets/images/united-kingdom.png")}
          style={styles.flag}
        />
        <Text style={styles.panelButtonTitle}>{i18n.t("header.en")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );
  useEffect(() => {
    const init = async () => {
      i18n.fallbacks = true;
      i18n.translations = { en, fr };
      try {
        const language = await AsyncStorage.getItem("user-language");
        i18n.locale = language;
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
    "Poppins-Light": require("../../assets/fonts/Poppins-Light.otf"),
  });

  if (!loaded) {
    return null;
  }
  const bs = React.createRef();
  const fall = new Animated.Value(1);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "flex-start",
        bottom: 0,
      }}
    >
      <BottomSheet
        ref={bs}
        snapPoints={[330, 0]}
        renderContent={renderInner}
        renderHeader={renderHeader}
        initialSnap={1}
        callbackNode={fall}
        enabledGestureInteraction={true}
      />
      <View style={{ bottom: 0 }}>
        <Animated.View
          style={{
            margin: 20,
            opacity: Animated.add(0.1, Animated.multiply(fall, 1.0)),
          }}
        >
          <Text style={styles.title}>{i18n.t("header.general")} </Text>
          <View style={styles.container}>
            <IonIcon
              color={"#4A4A4A"}
              size={25}
              name={"person-circle-outline"}
            />
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Text style={styles.text}>{i18n.t("settings.personalInfo")}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{i18n.t("header.more")} </Text>
          <View style={styles.container}>
            <IonIcon color={"#4A4A4A"} size={25} name={"language-outline"} />
            <Text style={styles.text}>{i18n.t("settings.language")} </Text>
            <View
              style={{
                backgroundColor: "#F5F6FB",
                left: 280,
                borderRadius: 5,
                position: "absolute",
              }}
            >
              <TouchableOpacity onPress={() => bs.current.snapTo(0)}>
                <Text
                  style={{
                    color: "#666671",
                    width: 23,
                    height: 23,
                    fontFamily: "Poppins-Light",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  {language === "fr" ? "fr" : "en"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.container}>
            <IonIcon color={"#4A4A4A"} size={25} name={"log-out-outline"} />
            <TouchableOpacity
              onPress={() => {
                signOut();
              }}
            >
              <Text style={styles.text}>{i18n.t("settings.logout")} </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
export default SettingsScreen;
const styles = StyleSheet.create({
  btnModal: {
    width: "50%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    width: "90%",
    height: 47,
    borderRadius: 15,
  },
  flag: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    width: 27,
    height: 27,
  },
  panelButtonTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  btnTxt: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    height: "100%",
    textAlign: "center",
  },
  preference: {
    top: -10,
    bottom: 0,
    left: 120,
  },

  header: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    shadowOffset: {width: -1, height: -3},
    elevation: 9,
    // elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 10,
  },
  panelHeader: {
    alignItems: "center",
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00000040",
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "gray",
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#FF6347",
    alignItems: "center",
    marginVertical: 7,
  },
  container: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    left: 10,
    marginBottom: 30,
  },
  text: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#4A4A4A",
    left: 20,
  },
  title: {
    color: "#959595",
    fontFamily: "Poppins-Medium",
    left: 5,
    marginBottom: 30,
    fontSize: 18,
    top: 10,
  },
});
