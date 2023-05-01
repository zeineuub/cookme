import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView,ToastAndroid } from "react-native";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import AnimatedLoader from "react-native-animated-loader";
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from "expo-linear-gradient";
import RecipeCard from '../components/RecipeCard';
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import Toast from 'react-native-toast-message';
const recipe_results = [];
import INGREDIENTSSVG from '../assets/images/ingredients.svg'
const API_URL = "http://192.168.1.7:3000/api/v1";
import { v4 as uuidv4 } from 'uuid';

import { fr, en } from "../assets/i18n/supportedLanguages";
const HomeScreen = ({ navigation }) => {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const isFocused = useIsFocused();

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
  function parseAPIRecipeDetails(complexData) {
    const recipeData = {};
    recipeData.id = complexData.id;
    recipeData.title = complexData.title;
    recipeData.servings = complexData.servings;
    recipeData.sourceUrl = complexData.sourceUrl;
    recipeData.image = complexData.image;
    recipeData.readyInMinutes = complexData.readyInMinutes || 0;
    console.log('r ',recipeData.summary)

    const ingredients = [];
    for (const ingredient of complexData.extendedIngredients) {
      const ingredientDict = {};
      ingredientDict.id = ingredient.id;
      ingredientDict.name = ingredient.name;
      ingredientDict.amount = Math.round(ingredient.amount * 100) / 100;
      ingredientDict.unit = ingredient.measures.us.unitShort;
      ingredients.push(ingredientDict);
    }
    recipeData.ingredients = ingredients;

    const instructions = complexData.analyzedInstructions[0].steps.map(
      (step) => `${step.number}. ${step.step}`
    );
    recipeData.instructions = instructions;

    const equipment = complexData.analyzedInstructions[0].steps.reduce(
      (acc, step) => {
        for (const equipment of step.equipment) {
          acc[equipment.name] = equipment.name;
        }
        return acc;
      },
      {}
    );
    recipeData.equipments = equipment;

    const missedIngredients = complexData.missedIngredients.map(
      (ingredient) => {
        const ingredientDict = {};
        ingredientDict.name = ingredient.name;
        ingredientDict.amount = Math.round(ingredient.amount * 100) / 100;
        ingredientDict.unit = ingredient.unitShort;
        return ingredientDict;
      }
    );
    recipeData.missing_ingredients = missedIngredients;

    return recipeData;
  }
  const searchRecipes = async () => {
    console.log('here')
    setIsLoading(true);
    console.log("ingre ",ingredients)
    const apiKey = '69808e0f62e54841a4cf9a114059a719'; // Replace with your own API key
    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&includeIngredients=${ingredients}&addRecipeInformation=true&sort=max-used-ingredients&instructionsRequired=true&fillIngredients=true&number=5`;
    await fetch(`${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json'
      },
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
      
        if(res.status !==200) {
          setIsLoading(false);
          const { message } = jsonRes.errors[0];
          setMessage(message);
          showToastMsg(message);
          
        } else {
          const recipes_complex_data = jsonRes.results;
          for (const recipe of recipes_complex_data) {
            const recipe_data = parseAPIRecipeDetails(recipe);
            recipe_results.push(recipe_data);
          }          
          setRecipes(recipe_results);     
          setIsLoading(false);

        }
      }catch (error) {
        setIsLoading(false)
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.iconContainer}>
          <Icon name="search" size={18} color="#B2B2B2" />
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Enter ingredients"
          value={ingredients}
          onChangeText={(text) => setIngredients(text)}
          onSubmitEditing={searchRecipes}
        />
      </View>
      <View>
        <Text style={styles.recipeTxt}>{i18n.t('header.recipe')}</Text>
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
          source={require("../assets/lottie/loader.json")} // Add here
          onAnimationFinish={() => setIsLoading(false)}
        />
      
      </View>
    </View>
  );
};

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
  searchContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginLeft: 5,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft:10
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
  subTitle:{
    marginTop:10,
    fontFamily:'Poppins-Regular',
    textAlign:'center',
    fontSize:20,
    lineHeight:24,
    width:"70%"
  }
});

export default HomeScreen;