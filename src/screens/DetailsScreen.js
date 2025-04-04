import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function DetailsScreen({ navigation }) {
  return (
    <View style={{flex: 1 , marginTop:10,}}>
         <Header title="Details"  navigation={navigation}/>
    <View style={styles.container}>
    <Text style={styles.title}>Details Screen</Text>
    <Button title="Go Back" onPress={() => navigation.goBack()} />
  </View>
  </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    title: {
      fontSize: 24, fontWeight: 'bold', marginBottom: 20,
    },
  });