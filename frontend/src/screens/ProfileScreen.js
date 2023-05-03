import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  TextInput,
  ToastAndroid,
  RefreshControl,
} from "react-native";
import { useFonts } from "expo-font";
import BottomSheet from "reanimated-bottom-sheet";
import Animated from "react-native-reanimated";
import IonIcon from "react-native-vector-icons/Ionicons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from 'lottie-react-native';
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const API_URL = "http://192.168.146.55:3000/api/v1";
import { useIsFocused } from '@react-navigation/native';
import i18n from "i18n-js";
import { fr, en } from "../assets/i18n/supportedLanguages";
import { launchCameraAsync } from "expo-image-picker";
const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};
const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("false");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  
  // This hook returns `true` if the screen is focused, `false` otherwise
  const isFocused = useIsFocused();
  const showToast = (message) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.TOP);
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length == 0 ) {
      setPasswordError('Email must not be empty'); 
    } else if (!emailRegex.test(email) ) {
        setEmailError('Invalid email format');
    }else {
      setEmailError('');
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (phoneNumber.length == 0 ) {
      setPasswordError('PhoneNumber must not be empty'); 
    } else if (phoneNumber.length !== 8 || isNaN(phoneNumber)) {
      setPhoneNumberError('Phone number must be exactly 8 digits long');
    } else {
      setPhoneNumberError('');
    }
  };

  const onRefresh = React.useCallback(async() => {
    setRefreshing(true);
   const lang = await AsyncStorage.getItem("user-language");
    i18n.locale = lang;
    onLoggedIn(token);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const updateLanguage = async (lang) => {
    setLanguage(lang);

    setTimeout(() => {
      onRefresh()
    }, 1000)
  };
  const onLoggedIn = async (token) => {
    await fetch(`${API_URL}/auth/me`, {
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
              phoneNumber: jsonRes.phoneNumber,
              id: jsonRes.id,
              language:jsonRes.language
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
  const onSubmitHandler = async () => {
    const payload = {
      email: email ? email : user.email,
      firstName: firstName ? firstName : user.firstName,
      lastName: lastName ? lastName : user.lastName,
      phoneNumber: phoneNumber ? phoneNumber : user.phoneNumber,
      language: language ? language: user.language,
    };
    await fetch(`${API_URL}/user/`, {
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
            showToast(message);
          } else {
            setUser(jsonRes.user);
            await AsyncStorage.setItem(
              "name",
              user.firstName + " " + user.lastName
            );
            setLanguage(user.language);
            await AsyncStorage.setItem("user-language", user.language);
            i18n.locale = user.language;
            showToast(i18n.t('toast.updateAccount'));
            setTimeout(() => {
              onRefresh()
            }, 1000)
            

          }
        } catch (err) {
          console.log(err);
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
    <View style={styles.headerpanel}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );
  useEffect(() => {
    const init = async()=>{
      i18n.fallbacks = true;
      i18n.translations = { en,fr };
      try {
        const language = await AsyncStorage.getItem("user-language");
        i18n.locale = language;
        const token = await AsyncStorage.getItem("accessToken");
        await onLoggedIn(token);
        setToken(token);
      } catch (e) {
        console.log(e);
      }
    }
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
    <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: "white" }}
    behavior="heigth"
  >
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: "center",
            height:"100%"
          }}
        >
        <BottomSheet
          ref={bs}
          snapPoints={[220, 0]}
          renderContent={renderInner}
          renderHeader={renderHeader}
          initialSnap={1}
          callbackNode={fall}
          enabledGestureInteraction={true}
        />
          <View style={styles.header}>
            <Image
              style={styles.backgroundImage}
              source={require("../assets/images/up-user-details-background.84295f2e.jpg")}
            />
            <TouchableOpacity onPress={()=>{}}>
              <Image  source={require("../assets/images/avatar.png")} style={styles.avatar} />
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon
                  name="camera"
                  size={20}
                  color="#fff"
                  style={{
                    opacity: 0.7,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#DCDCDC",
                    borderRadius: 20,
                    padding: 6,
                    height: 30,
                    width: 30,
                    marginBottom: 0,
                    marginTop: -40,
                    position: "relative",
                    right: -40,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <TextInput
                style={styles.input}
                placeholder={i18n.t('form.firstName')}
                defaultValue={user.firstName}
                keyboardType="default"
                onChangeText={setFirstName}
              />
              <TextInput
                style={styles.input}
                placeholder={i18n.t('form.lastName')}
                defaultValue={user.lastName}
                keyboardType="default"
                onChangeText={setLastName}
              />
              <TextInput
                style={styles.input}
                placeholder={i18n.t('form.email')}
                defaultValue={user.email}
                keyboardType="email-address"
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
              />
              {emailError ? <Text style={[styles.message, { color: "red" }]}>{emailError}</Text> : null}

              <TextInput
                style={styles.input}
                placeholder="+216"
                defaultValue={user.phoneNumber}
                keyboardType="phone-pad"
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  validatePhoneNumber(text);
                }}
                
              />
              {phoneNumberError ? <Text style={[styles.message, { color: "red" }]}>{phoneNumberError}</Text> : null}

             <View style={styles.containerPanel}>
            <IonIcon color={"#4A4A4A"} size={25} name={"language-outline"} />
            <Text style={styles.textPanel}>{i18n.t("settings.language")} </Text>
            <View
              style={{
                backgroundColor: "#F5F6FB",
                left: 270,
                borderRadius: 15,
                position: "absolute",
                paddingTop:5
              }}
            >
              <TouchableOpacity onPress={() => bs.current.snapTo(0)}>
                <Text
                  style={{
                    color: "#666671",
                    width: 50,
                    height: 30,
                    fontFamily: "Poppins-Light",
                    fontSize: 16,
                    textAlign: "center",
                    
                  }}
                >
                  {language == "fr" ? "fr" : "en"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
              <LinearGradient
                 colors={["#F8932D", "#FA793D", "#FD3D60"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <TouchableOpacity onPress={onSubmitHandler}>
                  <Text style={[styles.text, { color: "#FFF" }]}>{i18n.t('buttons.save')}</Text>
                </TouchableOpacity>
              </LinearGradient>
              <TouchableOpacity style={[styles.button, {borderColor: '#FD3D60', borderWidth: 2, borderStyle: "solid",}]}>
                <Text style={[styles.text, { color: "#FD3D60" }]}>{i18n.t('buttons.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.container}>
          <LottieView
            source={require('../assets/lottie/loader.json')}
            autoPlay
            loop
          />
        </View>
        </SafeAreaView>
        </ScrollView>
        </KeyboardAvoidingView>

  );
};
export default ProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    height:"100%"
  },
  lottie: {
    width: 400,
    height: 400,
  },
  headerpanel: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.5,
    elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    width: "100%",
    height: 220,
  },
  flag: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
    width: 27,
    height: 27,
  },
  backgroundImage: {
    resizeMode: "stretch",
    height: 200,
    width: "100%",
  },
  message: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "Poppins-Regular",
  },
  containerPanel: {
    flex: 0,
    flexDirection: "row",
    marginBottom: 30,
    marginTop:5,
    marginLeft:-200 
  },
  text: {
    width: 250,
    height: 24,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    textAlign: "center",
    color: "#292B50",
  },
  textPanel: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    color: "#4A4A4A",
    left:5,
    top:3
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: "#e9ecef",
    borderRadius: 20,
    fontFamily: "Poppins-Regular",
    borderStyle: "solid",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    color:"black",

  },
  button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    width: "100%",
    height: 47,
    borderRadius: 15,
    marginBottom: 15,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 3,
    borderColor: "white",
    marginBottom: 10,
    alignSelf: "center",
    marginTop: -60,
  },
  body: {
    marginTop: 30,
    height:"100%"
  },
  bodyContent: {
    alignItems: "center",
    top: 20,
    height:500

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
    marginBottom:10,
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
  panelButtonTitle: {
    fontSize: 17,
    color: "#000000",
    fontFamily: "Poppins-Regular",

  },
  panel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    width:"100%",
  },

});
