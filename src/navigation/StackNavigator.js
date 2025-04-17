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

import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import {useSelector} from 'react-redux';
import AddCompanyScreen from '../screens/AddCompanyScreen';
import BankDetails from '../screens/BankDetails';
import AddBankDetail from '../screens/AddBankDetail';
import ClientDetails from '../screens/ClientDetails';
import AddClientDetail from '../screens/AddClientDetail';
import InvoicesDetails from '../screens/InvoicesDetails';
import EmployeesScreen from '../screens/EmployeesScreen';
import AddEmployee from '../screens/AddEmployee';
import WagesScreen from '../screens/WagesScreen';
import AddWagesForm from '../screens/AddWagesForm';
// import FinalWagesScreen from '../screens/FinalWagesScreen';
import WagesPdf from '../screens/WagesPdf';
import CreditCardListScreen from '../screens/CarditCardListScreen';
import CreditForm from '../screens/CreditForm';
import CreditCardHistory from '../screens/CreditCardHistory';
import CreateInvoice from '../screens/CreateInvoice';
import Invoice from '../screens/Invoice';
import Appointment from '../screens/AppointMent';
import AppointMentForm from '../screens/AppointMentForm';
import ExperienceLetter from '../screens/ExperienceLetter';
import ExperienceLetterForm from '../screens/ExperienceLetterForm';
import ExperienceLetterPdf from '../screens/ExperienceLetterPdf';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  const token = useSelector(state => state.auth.token);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    console.log('isAuthenticated>>', isAuthenticated);
    checkToken();
  }, []);
  if (isAuthenticated === null) {
    return null; // Or a splash/loading screen
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
          <Stack.Screen name="Wages" component={WagesScreen} />
          <Stack.Screen name="AddWagesForm" component={AddWagesForm} />
          <Stack.Screen name="WagesPdf" component={WagesPdf} />
          <Stack.Screen name="CreditCard" component={CreditCardListScreen} />
          <Stack.Screen name="CreditForm" component={CreditForm} />
          <Stack.Screen
            name="CreditCardHistory"
            component={CreditCardHistory}
          />
          <Stack.Screen name="CreateInvoice" component={CreateInvoice} />
          <Stack.Screen name="Invoice" component={Invoice} />
          <Stack.Screen name="Appointment" component={Appointment} />
          <Stack.Screen name="AppointMentForm" component={AppointMentForm} />
          <Stack.Screen name="ExperienceLetter" component={ExperienceLetter} />
          <Stack.Screen name="ExperienceLetterForm" component={ExperienceLetterForm} />
          <Stack.Screen name="ExperienceLetterPdf" component={ExperienceLetterPdf} />

        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
