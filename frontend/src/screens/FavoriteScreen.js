import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView,ToastAndroid } from "react-native";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import AnimatedLoader from "react-native-animated-loader";
import RecipeCard from '../components/RecipeCard';
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import INGREDIENTSSVG from '../assets/images/ingredients.svg'
const API_URL = "http://192.168.1.7:3000/api/v1";
import { v4 as uuidv4 } from 'uuid';

import { fr, en } from "../assets/i18n/supportedLanguages";

const FavoriteScreen = ({navigation}) => {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
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
  const getFavoriteRecipes = async() => {
    const token = await AsyncStorage.getItem("accessToken");
    await fetch(`${API_URL}/recipe/saved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",

      },
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        console.log('recipeeee ',jsonRes)
        if(res.status !==200) {
          setIsLoading(false);
          const { message } = jsonRes.errors[0];
          setMessage(message);
          showToastMsg(i18n.t('error.connexion'));
          
        } else {
          const recipes_complex_data = jsonRes.results;
          for (const recipe of recipes_complex_data) {
            const recipe_data = parseAPIRecipeDetails(recipe);
            recipe_results.push(recipe_data);
          }          
          setRecipes(recipe_results);     

        }
      }catch (error) {
        console.log(err);
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
    getFavoriteRecipes();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.recipeTxt}>{i18n.t('header.fav')}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {recipes.length > 0 ? (

          <View style={styles.cardContainer}>
            {recipes.map((recipe) => (

              <RecipeCard
                title={recipe.title}
                image={recipe.image}
                servings={recipe.servings}
                readyInMinutes={recipe.readyInMinutes}
                recipe={recipe}
                key={uuidv4()}
              />

            ))}

          </View>
        ) : (
          <View style={styles.noResults}>
            <INGREDIENTSSVG style={styles.noResultImg}/>
            <Text style={styles.subTitle}>
            {i18n.t("imagePicker.ingredientSubTitle")}
          </Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.lottie_container}>
        <AnimatedLoader
          visible={isLoading}
          overlayColor="rgba(255,255,255,255)"
          animationStyle={styles.lottie}
          speed={1}
          source={require("../assets/lottie/cooking.json")} // Add here
          onAnimationFinish={() => setIsLoading(false)}
        />
      
      </View>
    </View>
  );
}
export default FavoriteScreen;
const styles = StyleSheet.create({
  lottie_container:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  lottie: {
    width: 300,
    height: 300,
  },
  recipeTxt:{
    width: 250,
    height: 48,
    left: -50,
    fontFamily: "Poppins-SemiBold",
    fontStyle: "normal",
    fontSize: 32,   
    color: "#EA5753",
    marginTop:10,
  },
  noResultImg :{
    marginTop:100
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor:'#FFF'
  },
  scrollView: {
    width: '100%',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%",
  },
  cardContainer: {

    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 32,

  },
});