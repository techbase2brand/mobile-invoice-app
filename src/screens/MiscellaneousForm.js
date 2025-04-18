import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';

const MiscellaneousForm = ({navigation, route}) => {
  const id = route?.params?.latterId;

  const [formData, setFormData] = useState({
    userName: '',
    refNo: '',
    letterHeadDate: '',
    letterHeadData: '',
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const richText = useRef();

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateRefNo = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `B2B/${currentYear}-${nextYear.toString().slice(-2)}/${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
  };

  const fetchCreditDetail = async id => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/letter-get/${id}`,
        {headers},
      );
      if (response.data.success) {
        const {userName, refNo, letterHeadDate, letterHeadData} =
          response?.data?.data;
        setFormData({
          userName: userName || '',
          refNo: refNo || generateRefNo(),
          letterHeadDate: letterHeadDate || '',
          letterHeadData: letterHeadData || '',
        });
      }
    } catch (error) {
      console.error('Error fetching letter data:', error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (id) {
        fetchCreditDetail(id);
      } else {
        setFormData({
          userName: '',
          refNo: generateRefNo(),
          letterHeadDate: '',
          letterHeadData: '',
        });

        try {
          const res = await fetch(`${REACT_APP_API_BASE_URL}/api/get-letter`, {
            headers,
          });
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              letterHeadData: data.data[0].letterHeadData,
            }));
          }
        } catch (error) {
          console.error('Error fetching template:', error);
        }
      }
    };

    fetchInitialData();
  }, [id]);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      if (id) {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/api/letter-update/${id}`,
          formData,
          {headers},
        );
      } else {
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/add-letter-data`,
          formData,
          {headers},
        );
      }
      setFormData({
        userName: '',
        refNo: generateRefNo(),
        letterHeadDate: '',
        letterHeadData: '',
      });
      navigation.navigate('Miscellaneous'); // change according to your navigation
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleConfirmDate = date => {
    setDatePickerVisibility(false);
    const formatted = moment(date).format('YYYY-MM-DD');
    handleChange('letterHeadDate', formatted);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Detail</Text>
      </View>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={formData.userName}
        placeholder="Name"
        onChangeText={value => handleChange('userName', value)}
      />

      <Text style={styles.label}>Ref. No</Text>
      <TextInput
        style={styles.input}
        value={formData.refNo}
        placeholder="Ref No"
        editable={false}
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        onPress={() => setDatePickerVisibility(true)}
        style={styles.input}>
        <Text>{formData.letterHeadDate || 'Select Date'}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <Text style={styles.label}>Miscellaneous Letter</Text>
      {/* <RichEditor
        ref={richTextRef}
        initialContentHTML={formData.letterHeadData}
        onChange={text => handleChange('letterHeadData', text)}
        style={styles.richEditor}
        placeholder="Enter your content here"
      />
      <RichToolbar
        editor={richTextRef}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
        ]}
        style={styles.richToolbar}
      /> */}

      <RichEditor
        ref={richText}
        style={styles.richEditor}
        initialContentHTML={formData.letterHeadData}
        onChange={data => handleChange('letterHeadData', data)}
      />
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.insertBulletsList,
        ]}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>{id ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  richEditor: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    minHeight: 150,
    marginTop: 8,
  },
  richToolbar: {
    marginVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});

export default MiscellaneousForm;
