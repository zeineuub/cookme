import { View, Text, StyleSheet, Image,ScrollView } from 'react-native';
import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import { fr, en } from "../assets/i18n/supportedLanguages";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n from "i18n-js";
const ListIngredients = ({ amount, unit, name }) => {
  const isFocused = useIsFocused();
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
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
    "Damion-Regular": require("../../assets/fonts/Damion-Regular.ttf"),

    
  });

  if (!loaded) {
    return null;
  }
  return (
    <ScrollView >
        <View style={styles.container}>
        <View style={styles.iconContainer}>
        <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${name.split(" ")[name.split(" ").length - 1]}.jpg` }} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{amount} {unit} {name}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEDFBC',
    borderRadius: 12,
    marginBottom: 8,
    padding: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  image: {
    width: 24,
    height: 24,
  },
  text: {
    color: '#FF5C00',
    fontSize: 16,
  },
});

export default ListIngredients;