import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ListEquipments = ({ equipments }) => {

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image source={{ uri: `https://spoonacular.com/cdn/equipment_100x100/${equipments.split(" ")[equipments.split(" ").length - 1]}.jpg` }} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>{equipments}</Text>
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

export default ListEquipments;