import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,ToastAndroid ,TextInput} from "react-native";
import { useFonts } from "expo-font";
import { useIsFocused } from '@react-navigation/native';
import i18n from "i18n-js";
import StarRating from 'react-native-star-rating';
import { v4 as uuidv4 } from 'uuid';
import { LinearGradient } from "expo-linear-gradient";
let  transformedData;
const API_URL = "http://192.168.146.55:3000/api/v1";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fr, en } from "../assets/i18n/supportedLanguages";
import CustomSwitch from '../components/CustomSwitch';
import ListIngredients from '../components/ListIngredients';
import ListInstructions from '../components/ListInstructions';
import ListEquipments from "../components/ListEquipments";
import LIKEFULLSVG from "../assets/images/like-full.svg";
import LIKEUNFULLSVG from "../assets/images/like-unfull.svg";
import ListComment from "../components/ListComment";
import * as Localization from "expo-localization";

const DetailScreen = ({ route }) => {
  i18n.fallbacks = true;
  i18n.translations = { en,fr };
  i18n.locale = Localization.locale;
  const { recipe, save } = route.params;
  const { missing_ingredients, ingredients, title, image, instructions, servings, readyInMinutes, equipments, recipeId  } = recipe
  const isFocused = useIsFocused();
  const [recipeTab, setRecipeTab] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const [rating, setRating] = useState(1);
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
    checkSavedRecipe(recipeId);
    getComments(recipeId)
  }, [isFocused]);
  const getComments = async(recipeId) => {
    console.log('ehe')
    const token = await AsyncStorage.getItem("accessToken");
    await fetch(`${API_URL}/recipes/comments/${recipeId}`, {
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
          if(jsonRes==[]) {
            showToastMsg('No recipe saved ');

          } else {
           transformedData = jsonRes.flatMap((item, index) =>
          item.comment.map((comment, commentIndex) => ({
            id: `${index + 1}.${commentIndex + 1}`,
            image: 'https://bootdey.com/img/Content/avatar/avatar6.png',
            name: `${item.user.firstName} ${item.user.lastName}`,
            comment: comment.text,
            createdTime: comment.createdAt
          }))
        );
          setComments(transformedData);
        }
        }    
      }catch (err) {
        showToastMsg(i18n.t('error.connexion'));
      }
    })
    .catch((err) => {
      showToastMsg(i18n.t('error.connexion'));
    });
  }
  const checkSavedRecipe = async() => {
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
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
          setFavorite(jsonRes[0].favorite);
          setRating(jsonRes[0].rating);
        }
      }catch (err) {
        console.log(err);
        showToastMsg(i18n.t('error.connexion'));
      }
    })
    .catch((err) => {
      console.log(err);
      showToastMsg(i18n.t('error.connexion'));
    });
  }
  
  const onSelectSwitch = value => {
    setRecipeTab(value);
  };
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
  const updateComment = async(com) => {
    console.log(com)
    const token = await AsyncStorage.getItem("accessToken");
    const payload = {
      comment:com
    }
    console.log(recipeId)
    await fetch(`${API_URL}/recipes/comment/${recipeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",

      },
      body: JSON.stringify(payload)
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        if(res.status !==200) {
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
          showToastMsg('The comment was added succesfully !');
          getComments(recipeId);
        }
      }catch (error) {
        showToastMsg(i18n.t('error.connexion'));
      }
    })
  }
  const updateFavorite = async(fav) => {
    const token = await AsyncStorage.getItem("accessToken");
    const payload = {
      favorite:fav
    }
    await fetch(`${API_URL}/recipes/favorite/${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",

      },
      body: JSON.stringify(payload)
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        if(res.status !==200) {
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
          if(jsonRes.favorite == true){
            showToastMsg('This recipe is one of your favorite now !');
          } else {
            showToastMsg('This recipe not one of your favorite anymore !');
          }
          setFavorite(jsonRes.favorite);
        }
      }catch (error) {
        console.log(error);
        showToastMsg(i18n.t('error.connexion'));
      }
    })
  }
  const updateRating = async(rate) => {
    setRating(rate)
    const token = await AsyncStorage.getItem("accessToken");
    const payload = {
      rating:rate
    }
    console.log(payload)

    await fetch(`${API_URL}/recipes/rating/${recipeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: token ? `Bearer ${token}` : "",

      },
      body: JSON.stringify(payload)
    })
    .then(async (res)=>{
      try{
        const jsonRes = await res.json();
        if(res.status !==200) {
          const { message } = jsonRes.errors[0];
          showToastMsg(message);
          
        } else {
          showToastMsg('Rating updated');

          setRating(jsonRes.rating);
        }
      }catch (error) {
        showToastMsg(i18n.t('error.connexion'));
      }
    })
  }
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
      <View>
        <Text style={styles.recipeTxt}>{i18n.t('header.detail')}</Text>
      </View>
      <View style={{ height: 200 }}>
        <Image source={{ uri: image }} style={[styles.image, { opacity: 0.7 }]} />
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        {save && 
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <TouchableOpacity onPress={()=>updateFavorite(!favorite)}>
            {favorite == true ? <LIKEFULLSVG /> : <LIKEUNFULLSVG />}
          </TouchableOpacity>
          <Text style={styles.txt}>Like</Text>
          </View>}
        </View>
        
        {save && 
        <View style={{flex:1, flexDirection:'column'}}>
          <StarRating 
            style={{alignSelf:"center"}}
            disabled={false}
            maxStars={5}
            rating={rating}
            selectedStar={(rating) => updateRating(rating)}
            fullStarColor={'#FFD700'}
            emptyStarColor={'#FFFBFF'}
            starSize={25}
            containerStyle={{ width: '40%', alignSelf:"center", top:-10 }}
          />
        
          <View style={styles.commentContainer}>
            <TextInput
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
              style={styles.commentInput}
            />
            <LinearGradient
              colors={["#F8972B", "#FA773E","#FD3664"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 10  }}
            >
            <TouchableOpacity onPress={()=>updateComment(comment)}>
              <Text style={styles.commentBtn}>{i18n.t('buttons.save')}</Text>
            </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
        }
      </View>
      <Text>
      </Text>
      <View style={{ padding: 10, marginTop:50 }}>
      <CustomSwitch
        selectionMode={1}
        option1={i18n.t('header.ingredients')}
        option2={i18n.t('header.instructions')}
        option3={i18n.t('header.comments')}
        onSelectSwitch={onSelectSwitch}
      />
      </View>
      
      <ScrollView style={{ flex: 1 ,padding:10, height:"100%"}}>
        {recipeTab == 1 &&
          ingredients.map((item) => (
            <ListIngredients
              key={uuidv4()}
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
        transformedData.map((item) => (
          <ListComment com={item}/>
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
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width:"80%",
    alignSelf:"center",
    top:25 ,
    height:50  
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 5,
    marginRight: 15,
    fontFamily:"Poppins-Regular"
  },
  commentBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontFamily:"Poppins-Regular",
    color:'white'
  },
  recipeTxt:{
    width: 250,
    height: 48,
    left: 50,
    fontFamily: "Poppins-SemiBold",
    fontStyle: "normal",
    fontSize: 32,   
    color: "#EA5753",
    marginTop:10,
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily:'Poppins-Regular'
  },
  txt:{
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    fontFamily:'Damion-Regular',
    marginTop:15
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
