import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { REACT_APP_API_BASE_URL } from '../constans/Constants';
import CryptoJS from 'react-native-crypto-js';
import { useDispatch } from 'react-redux';

const LoginScreen = ({navigation}) => {
const dispatch = useDispatch();
  const [login, setLogin] = useState({
    email: '',
    password: ''
  });


  const handleChange = (name, value) => {
    setLogin({ ...login, [name]: value });
  };

  const handleLogin = async () => {
    const encryptedPassword = CryptoJS.AES.encrypt(login.password, 'your-secret-key').toString();
    try {
      const response = await axios.post(`${REACT_APP_API_BASE_URL}/api/login`, {
        email: login.email,
        password: encryptedPassword,
      },);
// ramnishbase2brand@gmail.com
// Ramnish@123
      const token = response.data.token;
      dispatch({ type: 'SET_TOKEN', payload: token }); // save token in Redux
    console.log("login.password>>",token);

      await AsyncStorage.setItem('token', token);
      navigation.navigate('Home'); // change route as needed
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert("Invalid email or password"); 
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://www.base2brand.com/wp-content/uploads/2021/01/logo-svg-01.png' }}
        style={styles.logo}
      />
      <Text style={styles.title}>INVOICE</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sign in to your account</Text>

        <TextInput
          placeholder="Your email"
          keyboardType="email-address"
          style={styles.input}
          value={login.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={login.password}
          onChangeText={(text) => handleChange('password', text)}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>
            Don’t have an account yet? <Text style={styles.link}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color: '#111827',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  link: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
