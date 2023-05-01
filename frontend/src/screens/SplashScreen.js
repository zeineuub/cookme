import React from "react";
import { View, ImageBackground , StyleSheet, StatusBar } from "react-native";
import LOGOSVG from "../assets/images/logo.svg";
const SplashScreen = () => {
  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.backgroundImage}>
    <View style={styles.container}>
      <StatusBar animated={true} barStyle="dark-content" />
      <View style={styles.header}>
        <LOGOSVG style={styles.img} />
       
      </View>
    </View>
    </ImageBackground>
  );
};
export default SplashScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    width: 258,
    height: 258,
  },
  text: {
    width: 281,
    height: 58,
    fontFamily: "Roboto",
    fontSize: 16,
    lineHeight: 24,
    color: "#474747",
    textAlign: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  },
});
