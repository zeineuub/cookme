
  import React, { useState } from 'react'
  import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native'
  
  const ListComments = ({com}) => {
  console.log(com)
    return (
  
      <View style={styles.container}>
        <TouchableOpacity onPress={() => {}}>
          <Image style={styles.image} source={{ uri: com.image }} />
        </TouchableOpacity>
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={styles.name}>{com.name}</Text>
            <Text style={styles.time}>{com.createdTime}</Text>
          </View>
          <Text rkType="primary3 mediumLine">{com.comment}</Text>
        </View>
      </View>
    )
  
  }
  export default ListComments;
  const styles = StyleSheet.create({
    root: {
      backgroundColor: '#ffffff',
      marginTop: 10,
    },
    container: {
      paddingLeft: 5,
      paddingRight: 25,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    content: {
      marginLeft: 16,
      flex: 1,
    },
    contentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    separator: {
      height: 1,
      backgroundColor: '#CCCCCC',
    },
    image: {
      width: 45,
      height: 45,
      borderRadius: 22,
      marginLeft: 20,
    },
    time: {
      fontSize: 11,
      color: '#808080',
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  })
  