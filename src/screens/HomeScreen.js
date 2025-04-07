import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import Header from '../components/Header';

export default function HomeScreen({navigation}) {
  return (
    <View style={{flex: 1 , marginTop:20,}}>
      <Header title="Home" navigation={navigation} />
      <View style={styles.container}>
        <Text style={styles.title}>Home Screenfgfdgd</Text>
        <Button
          title="Go to Details"
          onPress={() => navigation.navigate('Details')}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
