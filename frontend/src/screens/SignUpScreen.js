import React, { useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AnimatedLoader from "react-native-animated-loader";
import { AuthContext } from "../components/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import * as Localization from "expo-localization";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView, 
  ToastAndroid
} from "react-native";
import BGDOWNSVG from "../assets/images/bg-down.svg";
import BGUPSVG from "../assets/images/bg-up.svg";
import Toast from 'react-native-toast-message';
const API_URL = "http://192.168.1.7:3000/api/v1";
import i18n from "i18n-js";
import { fr, en } from "../assets/i18n/supportedLanguages";
const SignUpScreen = ({navigation}) => {
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastNme] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const { signUp } = useContext(AuthContext);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
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
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
    } else {
      setPasswordError('');
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (phoneNumber.length !== 8 || isNaN(phoneNumber)) {
      setPhoneNumberError('Phone number must be exactly 8 digits long');
    } else {
      setPhoneNumberError('');
    }
  };
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
            await AsyncStorage.setItem("currentId", jsonRes.id);
            await AsyncStorage.setItem(
              "name",
              jsonRes.firstName + " " + jsonRes.lastName
            );
            await AsyncStorage.setItem("email", jsonRes.email);
            await AsyncStorage.setItem("user-language", jsonRes.language)
          }
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const haveAccount = () => {
    navigation.navigate("SignIn");
  };
  const onSubmitHandler = async()=>{
    setIsLoading(true);
    const language = i18n.locale.split('-')[0];
    console.log('lang ',language)
    let phone = "+216"+phoneNumber;
    const payload = {
      email,
      password,
      phoneNumber:phone,
      language,
      firstName,
      lastName
    };

    await fetch(`${API_URL}/auth/register`,{
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        console.log(jsonRes);

        if(res.status !==200) {
          const { message } = jsonRes.errors[0];
          console.log('msg ',message)
          setIsError(true);
          setMessage(message);

          setIsLoading(false);
          
        } else {
            await onLoggedIn(jsonRes.accessToken);
            signUp(jsonRes.accessToken);
            setIsError(false);
            setIsLoading(false);
            navigation.navigate("HomeStack");

        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        showToastMsg(i18n.t('error.connexion'));

      }
    })
    .catch((err) => {
      console.log(err);
      setIsLoading(false);
      showToastMsg(i18n.t('error.connexion'));
    });
  }

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
    <KeyboardAvoidingView style={{flex:1, backgroundColor:"white"}} behavior="heigth">
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <BGUPSVG style={styles.bg_up} />
      <View>
        <Text style={styles.textSignIn}>{i18n.t('form.signUp')}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={i18n.t('form.firstName')}
        keyboardType="default"
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder={i18n.t('form.lastName')}
        keyboardType="default"
        onChangeText={setLastNme}
      />
      
      <TextInput
        style={styles.input}
        placeholder={i18n.t('form.phoneNumber')}
        keyboardType="number-pad"
        onChangeText={(text) => {
          setPhoneNumber(text);
          validatePhoneNumber(text);
        }}
      />
      {phoneNumberError ? <Text style={[styles.message, { color: "red" }]}>{phoneNumberError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder={i18n.t('form.email')}
        keyboardType="email-address"
        onChangeText={(text) => {
          setEmail(text);
          validateEmail(text);
        }}
      />
      {emailError ? <Text style={[styles.message, { color: "red" }]}>{emailError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder={i18n.t('form.password')}
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
        <TouchableOpacity onPress={haveAccount}>
          <Text style={styles.psdTxt}>{i18n.t('buttons.doHaveAccount') +" ? " +i18n.t('form.signIn')}</Text>
        </TouchableOpacity>
      </View>
      <LinearGradient
         colors={["#F8932D", "#FA793D", "#FD3D60"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
      <TouchableOpacity onPress={onSubmitHandler}>
        <Text style={styles.text}>{i18n.t('buttons.next')}</Text>
      </TouchableOpacity>
      </LinearGradient>

      <TouchableOpacity
        style={[
          styles.button,
          { borderColor: "#FD3B61", borderWidth: 2, borderStyle: "solid" },
        ]}
        onPress={() => navigation.navigate("Onboarding")}
      >
        <Text style={[styles.text, { color: "#FD3B61" }]}>
        {i18n.t('buttons.goBack')}
        </Text>
      </TouchableOpacity>
      <BGDOWNSVG style={styles.bg_down} />

      <View style={styles.container}>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,255)"
          animationStyle={styles.lottie}
          speed={1}
          source={require("../assets/lottie/loader.json")} // Add here
          onAnimationFinish={() => setIsLoading(false)}
        />
      
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
// define your styles
const styles = StyleSheet.create({
  btnTxt: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    height: "100%",
  },
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
    top: 30,
    left:50
  },
  bg_down: {
    top: -20,
  },
  textSignIn: {
    width: 250,
    height: 48,
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
  imgModal: {
    height: 150,
    width: 150,
    marginVertical: 10,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 20,
    height: "50%",
    elevation: 20,
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
  psdTxt: {
    color: "#4E607D",
    textAlign: "right",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    marginRight: -120,
    marginBottom: 20,
    marginTop: -10,
  },
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
});
export default SignUpScreen;
