import React from 'react';
import { View, Text, StyleSheet, } from 'react-native';

const ListIngredients = ({ instruction }) => {

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{instruction}</Text>
      </View>
    </View>
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
  textContainer: {
    flex: 1,
  },
  text: {
    color: '#FF5C00',
    fontSize: 16,
  },
});

export default ListIngredients;