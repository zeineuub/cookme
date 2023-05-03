import React ,{useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedLoader from "react-native-animated-loader";
import { AuthContext } from "../components/AuthContext";

import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BGDOWNSVG from "../assets/images/sign_in_down.svg";
import BGUPSVG from "../assets/images/sign_in_up.svg";
const API_URL = "http://192.168.146.55:3000/api/v1";
import { useFonts } from "expo-font";
import * as Localization from "expo-localization";
import i18n from "i18n-js";
import { fr, en } from "../assets/i18n/supportedLanguages";
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [message, setMessage] =React. useState("");
  const { signIn } = React.useContext(AuthContext);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const forgetPassword = () => {
    setIsLoading(true);
    navigation.navigate("Forget-Password");
  };
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

  const validatePassword = (password) => {
    if (password == null ) {
      setPasswordError('Password must not be empty');

    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
    }
    else {
      setPasswordError('');
    }
  };
  const onSubmitHandler = () => {
    setIsLoading(true);
    const payload = {
      email,
      password,
    };
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        try {
          const jsonRes = await res.json();
          if (res.status !== 200) {
            const { message } = jsonRes.errors[0];
            setIsError(true);
            setMessage(message);
            setIsLoading(false);

            showToastMsg(message);

          } else {
            try {
              await AsyncStorage.setItem("accessToken", jsonRes.accessToken);
              await AsyncStorage.setItem("role", jsonRes.role);
              setIsError(false);
              const token = await AsyncStorage.getItem("accessToken");
              signIn(token);
              navigation.navigate("Home");
            } catch (error) {
              console.log(error);
              setIsLoading(false);
              showToastMsg(i18n.t('error.connexion'));
            
            }
          }
        } catch (err) {
          console.log(err);
          setIsLoading(false);
          showToastMsg(i18n.t('error.connexion'));
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        showToastMsg(err);

      });
  };
  const signup = () => {
    navigation.navigate("SignUp");
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
        <Text style={styles.textSignIn}>{i18n.t('form.welcomeTxt')}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={(text) => {
          setEmail(text);
          validateEmail(text);
        }}
      />
      {emailError ? <Text style={[styles.message, { color: "red" }]}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder={i18n.t('form.pwd')}
        secureTextEntry={true}
        onChangeText={(text) => {
          setPassword(text);
          validatePassword(text);
        }}
      />
       {passwordError ? <Text style={[styles.message, { color: "red" }]}>{passwordError}</Text> : null}
      <Text style={[styles.message, { color: "red" }]}>
        {isError ? message : null}
      </Text>
      <View>
        <TouchableOpacity onPress={forgetPassword}>
          <Text style={styles.psdTxt}>{i18n.t('form.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>
      <LinearGradient
        colors={["#F8932D", "#FA793D", "#FD3D60"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <TouchableOpacity onPress={onSubmitHandler}>
          <Text style={styles.text}>{i18n.t('buttons.connect')}</Text>
        </TouchableOpacity>
      </LinearGradient>
      <View>
        <TouchableOpacity onPress={signup}>
          <Text style={styles.psdTxt}>{i18n.t('buttons.createAccount') +" ? " +i18n.t('form.signUp')}</Text>
        </TouchableOpacity>
      </View>
      <BGDOWNSVG style={styles.bg_down} />
      <View style={styles.container}>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,255)"
          animationStyle={styles.lottie}
          speed={1}
          source={require("../assets/lottie/loader.json")} // Add here
        />
      </View>
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
  lottie: {
    width: 300,
    height: 300,
  },
  bg_up: {
    top: 20,
    left:90
  },
  bg_down: {
    top: 20,
  },
  textSignIn: {
    width: 250,
    height: 48,
    left: -50,
    fontFamily: "Poppins-SemiBold",
    fontStyle: "normal",
    fontSize: 32,
    color: "#9B4C20",
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
    textAlign:'left'
  },
  psdTxt: {
    color: "#9B4C20",
    textAlign: "right",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    marginRight: -170,
    marginBottom: 20,
    marginTop: -10,
  },
});
export default SignInScreen;
