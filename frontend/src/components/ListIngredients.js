import React from 'react';
import { View, Text, StyleSheet, Image,ScrollView } from 'react-native';

const ListIngredients = ({ amount, unit, name }) => {
console.log(name.split(" ")[name.split(" ").length - 1])
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