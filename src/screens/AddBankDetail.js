import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';

const AddBankDetail = ({navigation, route}) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accNo: '',
    accType: '',
    BranchName: '',
    ifscCode: '',
    swiftCode: '',
    accName: '',
    tradeName: '',
  });

  const [error, setError] = useState({});
  const id = route?.params?.BankId;

  useEffect(() => {
    if (id) fetchBankDetail(id);
  }, [id]);

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
    setError(prev => ({...prev, [name]: ''}));
  };

  const fetchBankDetail = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/get-bank-data/${id}`,
        {headers},
      );
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching bank detail:', error);
    }
  };

  const handleSubmit = async () => {
    const formErrors = {};
    const requiredFields = [
      'bankName',
      'accNo',
      'accType',
      'BranchName',
      'ifscCode',
    ];

    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        formErrors[field] = `Please add ${field}`;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      let response;
      if (id) {
        response = await axios.put(
          `${REACT_APP_API_BASE_URL}/api/update-bank-data/${id}`,
          formData,
          {headers},
        );
      } else {
        response = await axios.post(
          `${REACT_APP_API_BASE_URL}/api/bank-detail`,
          formData,
          {headers},
        );
      }

      if (response.status === 201 || response.status === 200) {
        navigation.navigate('BankDetails'); // Ensure this matches your route name
      }
    } catch (error) {
      console.error('Submission Error:', error);
      Alert.alert('Error', 'Failed to submit bank details');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Company Detail</Text>
      </View>

      <InputField
        label="Bank Name"
        value={formData.bankName}
        onChange={val => handleChange('bankName', val)}
        error={error.bankName}
      />
      <InputField
        label="Acc. Name"
        value={formData.accName}
        onChange={val => handleChange('accName', val)}
      />
      <InputField
        label="Acc. No"
        value={formData.accNo}
        onChange={val => handleChange('accNo', val)}
        error={error.accNo}
      />
      <InputField
        label="IFSC Code"
        value={formData.ifscCode}
        onChange={val => handleChange('ifscCode', val)}
        error={error.ifscCode}
      />
      <InputField
        label="Acc. Type"
        value={formData.accType}
        onChange={val => handleChange('accType', val)}
        error={error.accType}
      />
      <InputField
        label="Branch Name"
        value={formData.BranchName}
        onChange={val => handleChange('BranchName', val)}
        error={error.BranchName}
      />
      <InputField
        label="Swift Code"
        value={formData.swiftCode}
        onChange={val => handleChange('swiftCode', val)}
      />
      <InputField
        label="Trade Name"
        value={formData.tradeName}
        onChange={val => handleChange('tradeName', val)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{id ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InputField = ({label, value, onChange, error}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.errorInput]}
      placeholder={label}
      value={value}
      onChangeText={onChange}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    marginTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // balance for the arrow
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    marginTop: 4,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#4c8bf5',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddBankDetail;
