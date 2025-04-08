// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
// import DetailsScreen from '../screens/DetailsScreen';

// const Stack = createNativeStackNavigator();

// export default function StackNavigator() {
//   return (
//     <Stack.Navigator initialRouteName="Home"  screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Home" component={HomeScreen}  />
//       <Stack.Screen name="Details" component={DetailsScreen} />
//     </Stack.Navigator>
//   );
// }

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import { useSelector } from 'react-redux';
import AddCompanyScreen from '../screens/AddCompanyScreen';
import BankDetails from '../screens/BankDetails';
import AddBankDetail from '../screens/AddBankDetail';
import ClientDetails from '../screens/ClientDetails';
import AddClientDetail from '../screens/AddClientDetail';
import InvoicesDetails from '../screens/InvoicesDetails';
import EmployeesScreen from '../screens/EmployeesScreen';
import AddEmployee from '../screens/AddEmployee';
const Stack = createNativeStackNavigator();

export default function StackNavigator() {
    const token = useSelector(state => state.auth.token);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    console.log("isAuthenticated>>",isAuthenticated);
    checkToken();
  }, []);
  if (isAuthenticated === null) {
    return null; // Or a splash/loading screen
  }

  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="AddCompany" component={AddCompanyScreen} />
            <Stack.Screen name="BankDetails" component={BankDetails} />
            <Stack.Screen name="AddBankDetail" component={AddBankDetail} />
            <Stack.Screen name="ClientDetails" component={ClientDetails} />
            <Stack.Screen name="AddClientDetail" component={AddClientDetail} />
            <Stack.Screen name="InvoicesDetails" component={InvoicesDetails} />
            <Stack.Screen name="Employees" component={EmployeesScreen} />
            <Stack.Screen name="AddEmployee" component={AddEmployee} />


          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
  );
}
