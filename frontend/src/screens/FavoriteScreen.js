import React, { useState, useEffect } from "react";
import { View, Text, RefreshControl, StyleSheet, ScrollView,ToastAndroid } from "react-native";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import AnimatedLoader from "react-native-animated-loader";
import RecipeCard from '../components/RecipeCard';
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18n-js";
import INGREDIENTSSVG from '../assets/images/image.svg'
const API_URL = "http://192.168.146.55:3000/api/v1";
import { v4 as uuidv4 } from 'uuid';
import { fr, en } from "../assets/i18n/supportedLanguages";
import * as Localization from "expo-localization";
const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};
const FavoriteScreen = ({navigation}) => {
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async() => {
    setRefreshing(true);
    getFavoriteRecipes();
    wait(1000).then(() => setRefreshing(false));
  }, [])// initialize useNavigation hook
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
    const recipe_results=[]
    const token = await AsyncStorage.getItem("accessToken");
    await fetch(`${API_URL}/recipes/saved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",

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
          jsonRes.forEach((recipe) => {

            const res ={
              title:recipe._id.title,
              image:recipe._id.image,
              servings:recipe._id.servings,
              recipeId:recipe._id.recipeId,
              readyInMinutes:recipe._id.readyInMinutes,
              equipments:recipe._id.equipments.map(({ _id, ...rest }) => rest),
              ingredients: recipe._id.ingredients.map(({ _id, ...rest }) => rest),
              missing_ingredients:recipe._id.missing_ingredients,
              instructions: recipe._id.instructions.map(({ step }) => step),

            }
            recipe_results.push(res)
          })       
          setRecipes(recipe_results);     

        }
      }catch (error) {
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
    setTimeout(() => {
      onRefresh()
    }, 1000)
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
    <View style={styles.container}>
      <View>
        <Text style={styles.recipeTxt}>{i18n.t('header.saved')}</Text>
      </View>
      <ScrollView   refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.scrollView}>
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
  subTitle:{
    marginTop:10,
    fontFamily:'Poppins-Regular',
    textAlign:'center',
    fontSize:16,
    lineHeight:24,
    width:"70%"
  }
});