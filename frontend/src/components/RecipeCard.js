import React , {useState,useEffect}from 'react';
import { View, StyleSheet, Image, Text, Dimensions,TouchableOpacity,ToastAndroid } from 'react-native';
import i18n from "i18n-js";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import * as Localization from "expo-localization";
import { useNavigation } from "@react-navigation/native"; // import useNavigation hook
import { fr, en } from "../assets/i18n/supportedLanguages";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = "http://192.168.146.55:3000/api/v1";
import ARROWSVG from '../assets/images/arrow-right.svg';

const RecipeCard = ({ image, title, servings, readyInMinutes, recipe }) => {
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const [saved, setSaved] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation(); 

  const checkSavedRecipe = async() => {
    const token = await AsyncStorage.getItem("accessToken");
    await fetch(`${API_URL}/recipes/saved/${recipe.recipeId}`, {
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
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
         setSaved(jsonRes.saved);
        }
      }catch (error) {
        console.log(error);
      }
    })
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
    checkSavedRecipe();
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

const saveRecipe = async(save) => {
  const token = await AsyncStorage.getItem("accessToken");
  if(save== true ){
    setSaved(true);
    await fetch(`${API_URL}/recipes/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",
  
      },
      body: JSON.stringify(recipe)
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        if(res.status !==200) {
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
          showToastMsg("Recipe saved with success");

        }
      }catch (error) {
        showToastMsg(i18n.t('error.connexion'));
      }
    })
  } else {
    setSaved(false);
    console.log(recipe.recipeId)
    await fetch(`${API_URL}/recipes/${recipe.recipeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",
      },
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        console.log('json  ', jsonRes)
        if(res.status !==200) {
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
          showToastMsg("Recipe removed with success");

        }
      }catch (error) {
        showToastMsg(i18n.t('error.connexion'));
      }
    })
  }
  
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
  <View style={styles.card}>

    <View style={styles.container}>
    <TouchableOpacity style={styles.bookmarkContainer} onPress={()=>saveRecipe(!saved)} >
      <Icon name={saved ? 'bookmark' : 'bookmark-o'} size={30} color={saved ? 'green' : 'black'} />
    </TouchableOpacity>
      <Image style={styles.image} source={{ uri: image }} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>{servings} Serving - </Text>
        <Text style={styles.info}>Ready in {readyInMinutes} min</Text>
      </View>
      <TouchableOpacity  style={{flew:1, flexDirection:'row',justifyContent:'space-between' }} onPress={() => navigation.navigate("Detail",{recipe: recipe, save: saved} )} >
      <Text style={styles.text}>Click </Text>
      <ARROWSVG/>
    </TouchableOpacity>
    </View>

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
  bookmarkContainer: {
    position: 'relative',
    left: 115,

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
    padding: 12,
    flex: 1,
    justifyContent: 'center',
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
  text:{
    fontSize: 16,
    color: '#404040',
    fontFamily: 'Poppins-Regular',
    top:5
  }
});

export default RecipeCard;
