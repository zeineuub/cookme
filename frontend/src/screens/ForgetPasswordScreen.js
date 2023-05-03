import React, {useState} from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid
} from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import BGDOWNSVG from "../assets/images/sign_in_down.svg";
import BGUPSVG from "../assets/images/sign_in_up.svg";
const API_URL = "http://192.168.146.55:3000/api/v1";
import * as Localization from "expo-localization";
import i18n from "i18n-js";
import { fr, en } from "../assets/i18n/supportedLanguages";
import axios from "axios";
const ForgetPasswordScreen = ({navigation}) => {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const showToastMsg = (msg) => {
    try {
      ToastAndroid.showWithGravityAndOffset(
        msg,
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
        100,
        100,
      );
    } catch (err) {
      console.log(err);
    }
  };
  const forgetPassword = () => {
    const payload = {
      email,
    };
    fetch(`${API_URL}/user/forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        try {
          const jsonRes = await res.json();
          console.log(jsonRes)
          if (res.status !== 204) {
            const { message } = jsonRes.errors[0];
            setIsError(true);
            showToastMsg(message);
          } else {
            setIsError(false);
            showToastMsg('Enter code')
            navigation.navigate("Reset-Password");
          }
        } catch (err) {
          console.log(err);
        }
      })

  };
  const [loaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.otf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.otf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.otf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.otf"),
  });
  
  if (!loaded) {
    return null;
  }
  const handleEmail = async () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    const API_KEY = "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";

    const config = {
      headers: {
        "api-key": API_KEY,
        "content-type": "application/json",
      },
    };
  
    const data = {
      sender: { email: "gahda.malek12@gmail.com" },
      to: [{ email: email }],
      subject: "Code verification",
      htmlContent: `<p>Your verification code is: ${code}</p>`,
    };
  
    try {
      const response = await axios.post(
        "https://api.sendinblue.com/v3/smtp/email",
        data,
        config
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
    navigation.navigate('Reset-Password')
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <BGUPSVG style={styles.bg_up} />
      <View>
        <Text style={styles.textSignIn}>{i18n.t('header.forgetpwd')}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <Text style={[styles.message, { color: "red" }]}>
        {isError ? message : null}
      </Text>
      <LinearGradient
        colors={["#F16694", "#F16072", "#F69252"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <TouchableOpacity onPress={handleEmail}>
          <Text style={styles.text}>{i18n.t('buttons.send')}</Text>
        </TouchableOpacity>
      </LinearGradient>
      <BGDOWNSVG style={styles.bg_down} />

    </SafeAreaView>
  );
};
// define your styles
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5FCFF",
    },
    bg_up: {
      top: 30,
      left:80
    },
    bg_down: {
      top: 20,
    },
    lottie: {
      width: 300,
      height: 300,
    },
    bg: {
      top: 550,
    },
    textSignIn: {
      width: 250,
      height:100,
      left: -50,
      fontFamily: "Poppins-SemiBold",
      fontStyle: "normal",
      fontSize: 32,
      color: "#752A00",
    },
    text: {
      width: 250,
      height: 24,
      fontFamily: "Poppins-Regular",
      fontSize: 16,
      textAlign: "center",
      color: "#FFFFFF",
    },
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      borderColor: "#B1B1B1",
      borderRadius: 15,
      borderStyle: "solid",
      flexDirection: "row",
      width: "90%",
    },
    button: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 15,
      width: "90%",
      height: 47,
      borderRadius: 15,
      marginBottom: 20,
    },
    message: {
      fontSize: 14,
      marginBottom: 10,
      fontFamily: "Poppins-Regular",
    },
  });
export default ForgetPasswordScreen;
