import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import moment from 'moment';

const AppointMentForm = ({navigation, route}) => {
  //   const route = useRoute();
  //   const navigation = useNavigation();
  const id = route?.params?.appointmentId;
  console.log('idapppp,', id);
  const richText = useRef();
  const [formData, setFormData] = useState({
    userName: '',
    refNo: '',
    appointmentDate: '',
    appointMentData: '',
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const generateRefNo = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `B2B/${currentYear}-${nextYear.toString().slice(-2)}/${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
  };

  const fetchCreditDetail = async id => {
    const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/appointment-get/${id}`,
        {headers},
      );
      if (response.data.success) {
        const {userName, refNo, appointmentDate, appointMentData} =
          response.data.data;
        setFormData({
          userName: userName || '',
          refNo: refNo || generateRefNo(),
          appointmentDate: appointmentDate || '',
          appointMentData: appointMentData || '',
        });
      }
    } catch (error) {
      console.error('Error fetching appointment detail:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCreditDetail(id);
    } else {
      setFormData({
        userName: '',
        refNo: generateRefNo(),
        appointmentDate: '',
        appointMentData: '',
      });

      fetch(`${REACT_APP_API_BASE_URL}/api/get-appointmentLetter`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.length > 0) {
            setFormData(prev => ({
              ...prev,
              appointMentData: data.data[0].appointMentData,
            }));
          }
        })
        .catch(console.error);
    }
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
          `${REACT_APP_API_BASE_URL}/api/appointment-update/${id}`,
          formData,
          {headers},
        );
      } else {
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/add-appointment-data`,
          formData,
          {headers},
        );
      }
      setFormData({
        userName: '',
        refNo: generateRefNo(),
        appointmentDate: '',
        appointMentData: '',
      });
      navigation.navigate('Appointment');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
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
          onChangeText={text => handleChange('userName', text)}
          placeholder="Name"
        />
        <Text style={styles.label}>Ref. No</Text>
        <TextInput
          style={styles.input}
          value={formData.refNo}
          editable={false}
          placeholder="Ref. No"
        />
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={{border: 1, borderColor: 'black'}}
          onPress={() => setDatePickerVisibility(true)}>
          {/* <TextInput
            style={styles.input}
            value={formData.appointmentDate}
            placeholder="Select Date"
            editable={false}
          /> */}
          <Text>
            Select date{' '}
            {formData?.appointmentDate
              ? moment(formData?.appointmentDate).format('YYYY-MM-DD')
              : 'Select'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Appointment Letter</Text>
        <RichEditor
          ref={richText}
          style={styles.richEditor}
          initialContentHTML={formData.appointMentData}
          onChange={data => handleChange('appointMentData', data)}
        />
        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
          ]}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {id ? 'Update Client' : 'Submit'}
          </Text>
        </TouchableOpacity>
        {/* 
        <View style={styles.buttonContainer}>
          <Button title={id ? 'Update' : 'Submit'} onPress={handleSubmit} />
        </View> */}
      </ScrollView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={date => {
          setDatePickerVisibility(false);
          handleChange('appointmentDate', date.toISOString().split('T')[0]);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
};

export default AppointMentForm;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginTop: 4,
  },
  richEditor: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    minHeight: 150,
    marginTop: 8,
  },
  buttonContainer: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // balance for the arrow
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
