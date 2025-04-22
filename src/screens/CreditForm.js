import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreditForm = ({navigation, route}) => {
  const id = route?.params?.CreditCardId;
  const [formData, setFormData] = useState({
    accNo: '',
    bankName: '',
    stateMentDate: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [stateMentDate, setStateMentDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showStatementPicker, setShowStatementPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

  const fetchCreditDetail = async id => {
    const token = await AsyncStorage.getItem('token'); // You may use SecureStore instead
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/update-credit-data/${id}`,
        {headers},
      );
      const bankDetailData = response.data.data;

      if (bankDetailData.stateMentDate) {
        const date = new Date(bankDetailData.stateMentDate);
        setStateMentDate(date);
        formData.stateMentDate = date.toISOString();
      }
      if (bankDetailData.dueDate) {
        const date = new Date(bankDetailData.dueDate);
        setDueDate(date);
        formData.dueDate = date.toISOString();
      }

      setFormData({
        accNo: bankDetailData.accNo || '',
        bankName: bankDetailData.bankName || '',
        stateMentDate: bankDetailData.stateMentDate || '',
        dueDate: bankDetailData.dueDate || '',
      });
    } catch (error) {
      console.error('Error fetching bank detail:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCreditDetail(id);
    }
  }, [id]);

  const handleChange = (key, value) => {
    setFormData({...formData, [key]: value});
    setErrors({...errors, [key]: ''});
  };

  const handleDateConfirm = (date, type) => {
    const adjustedDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    );
    const isoDate = adjustedDate.toISOString();
    if (type === 'statement') {
      setStateMentDate(date);
      setFormData({...formData, stateMentDate: isoDate});
      setShowStatementPicker(false);
    } else {
      setDueDate(date);
      setFormData({...formData, dueDate: isoDate});
      setShowDuePicker(false);
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const newErrors = {};
    if (!formData.accNo) newErrors.accNo = 'Acc. No is required';
    if (!formData.bankName) newErrors.bankName = 'Bank Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (id) {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/api/update-detail/${id}`,
          formData,
          {headers},
        );
      } else {
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/add-bank-data`,
          formData,
          {headers},
        );
      }
      navigation.navigate('CreditCard');
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>
          {id ? 'Update Details' : 'Add Details'}
        </Text>
      </View>
      <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 10}}>
        Acc. No
      </Text>
      <TextInput
        placeholder="Acc. No"
        value={formData.accNo}
        onChangeText={val => handleChange('accNo', val)}
        style={styles.input}
      />
      {errors.accNo && <Text style={styles.error}>{errors.accNo}</Text>}
      <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 10}}>
        Bank Name
      </Text>
      <TextInput
        placeholder="Bank Name"
        value={formData.bankName}
        onChangeText={val => handleChange('bankName', val)}
        style={styles.input}
      />
      {errors.bankName && <Text style={styles.error}>{errors.bankName}</Text>}
      <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 10}}>
        Statement Date
      </Text>
      <TouchableOpacity
        onPress={() => setShowStatementPicker(true)}
        style={styles.dateBtn}>
        <Text>
          {stateMentDate
            ? stateMentDate.toDateString()
            : 'Select Statement Date'}
        </Text>
      </TouchableOpacity>

      <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 10}}>
      Due Date
      </Text>
      <TouchableOpacity
        onPress={() => setShowDuePicker(true)}
        style={styles.dateBtn}>
        <Text>{dueDate ? dueDate.toDateString() : 'Select Due Date'}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showStatementPicker}
        mode="date"
        onConfirm={date => handleDateConfirm(date, 'statement')}
        onCancel={() => setShowStatementPicker(false)}
      />
      <DateTimePickerModal
        isVisible={showDuePicker}
        mode="date"
        onConfirm={date => handleDateConfirm(date, 'due')}
        onCancel={() => setShowDuePicker(false)}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{id ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreditForm;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 20,
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
  section: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    margin: 16,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
