import React from 'react';
import { View, StyleSheet, Image, Text, Dimensions,TouchableOpacity } from 'react-native';
import i18n from "i18n-js";
import { useFonts } from "expo-font";
import * as Localization from "expo-localization";
import { useNavigation } from "@react-navigation/native"; // import useNavigation hook
import { fr, en } from "../assets/i18n/supportedLanguages";

const RecipeCard = ({ image, title, servings, readyInMinutes, recipe }) => {
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const [loaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.otf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.otf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.otf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.otf"),
  });
  const navigation = useNavigation(); // initialize useNavigation hook
  if (!loaded) {
    return null;
  }
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.container}  onPress={() => navigation.navigate("Detail",{recipe} )} >
        <Image style={styles.image} source={{ uri: image }} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.info}>{servings} Serving - </Text>
          <Text style={styles.info}>Ready in {readyInMinutes} min</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 21,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  image: {
    height: 100,
    width: '100%',
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign:'left'
  },
  info: {
    fontSize: 10,
    color: '#404040',
    fontFamily: 'Poppins-Regular',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default RecipeCard;
