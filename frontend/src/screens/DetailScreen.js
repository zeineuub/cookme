import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import i18n from "i18n-js";
import { v4 as uuidv4 } from 'uuid';
const API_URL = "http://192.168.1.7:3000/api/v1";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fr, en } from "../assets/i18n/supportedLanguages";
import CustomSwitch from '../components/CustomSwitch';
import ListIngredients from '../components/ListIngredients';
import ListInstructions from '../components/ListInstructions'
import ListEquipments from "../components/ListEquipments";
import Icon from 'react-native-vector-icons/FontAwesome';
import LIKESVG from "../assets/images/like.svg";

const DetailScreen = ({ route }) => {
  const { recipe } = route.params;
  
  const { id, missing_ingredients, ingredients, title, image, instructions, servings, readyInMinutes, equipments } = recipe
  const isFocused = useIsFocused();
  const [recipeTab, setRecipeTab] = useState(1);

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
  const onSelectSwitch = value => {
    setRecipeTab(value);
  };


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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ height: 200 }}>
        <Image source={{ uri: image }} style={[styles.image, { opacity: 0.7 }]} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <TouchableOpacity>
            <LIKESVG/>
          </TouchableOpacity>
          <Text style={styles.txt}>Like</Text>
          </View>
        </View>
      </View>
      <Text>
      </Text>
      <View style={{ padding: 10 }}>
      <CustomSwitch
        selectionMode={1}
        option1="Ingredients"
        option2="Instrcutions"
        option3="Equipments"
        onSelectSwitch={onSelectSwitch}
      />
      </View>
      
      <ScrollView style={{ flex: 1 ,padding:10}}>
        {recipeTab == 1 &&
          ingredients.map((item) => (
            <ListIngredients
              key={item.id}
              amount={item.amount}
              name={item.name}
              unit={item.unit}
            />
          ))
        }
        {recipeTab == 2 &&
          instructions.map((item) => (
            <ListInstructions key={uuidv4()} instruction={item} />
          ))
        }
        {recipeTab == 3 &&
          Object.entries(equipments).map(([key, value]) => (
            <ListEquipments key={key} equipments={value} />
          ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

export default DetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 368,
    justifyContent: "center",

  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily:'Poppins-'
  },
  txt:{
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontFamily:'Damion-Regular',
    marginLeft:10,
    marginTop:5
  },
  image: {
    backgroundColor: '#FF3D00',
    width: "85%",
    height: 200,
    borderRadius: 20,
    position: 'absolute',
    alignSelf:'center'
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    marginTop:40
  },
});
