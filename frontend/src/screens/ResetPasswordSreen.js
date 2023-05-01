import React, { useEffect,useState  } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFonts } from "expo-font";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
const API_URL = "http://192.168.1.7:3000/api/v1";
const ResetPasswordScreen = ({ navigation }) => {
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onLoggedIn = (token) => {
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
            setEmail(jsonRes.email);
          }
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    setTimeout(async () => {
      // setIsLoading(false);
      try {
        const token = await AsyncStorage.getItem("accessToken");
        await onLoggedIn(token);
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  }, []);
  const resetPassword = () => {
    setIsLoading(true);
    const payload = {
      code,
      password,
      email,
    };
    fetch(`${API_URL}/user/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        try {
          const jsonRes = await res.json();
          if (res.status !== 204) {
            const { message } = jsonRes.errors[0];
            setIsError(true);
            setMessage(message);
            setIsLoading(false);
          } else {
            setIsError(false);
            setTimeout(() => setIsLoading(false), 3000);
            navigation.navigate("SingIn");
          }
        } catch (err) {
          console.log(err);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
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
        marginTop: -500,
      }}
    >
      <View>
        <Text style={styles.textSignIn}>{email}</Text>
        <Text
          style={[
            styles.textSignIn,
            { fontSize: 15, fontFamily: "Poppins-Regular" },
          ]}
        >
          Nous vous avons envoyé le code sur cette adresse!
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Code"
        keyboardType="numeric"
        onChangeText={setCode}
      />

      <TextInput
        style={styles.input}
        placeholder="mot de passe"
        secureTextEntry={true}
        onChangeText={setPassword}
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
        <TouchableOpacity onPress={resetPassword}>
          <Text style={styles.text}>Envoyer</Text>
        </TouchableOpacity>
      </LinearGradient>
      <View style={styles.container}>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,255)"
          animationStyle={styles.lottie}
          speed={1}
          source={require("../assets/lottie/loader-colors.json")} // Add here
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
  bg: {
    top: 550,
  },
  textSignIn: {
    width: 250,
    height: 48,
    left: -50,
    fontFamily: "Poppins-SemiBold",
    fontStyle: "normal",
    fontSize: 32,
    color: "#002B7F",
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
export default ResetPasswordScreen;
