// Note: This is a React Native version of your form using custom modal and native components
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_API_BASE_URL } from '../constans/Constants';

const departments = [
  'Web Development & Design',
  'Graphic Design',
  'Digital Marketing',
  'Business Development',
  'HR & Admin',
];

const companies = ['KS NETWORKING SOLUTIONS', 'SAI LEGAL'];

export default function AddEmployee() {
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.empId || {};

  const [formData, setFormData] = useState({
    empName: '',
    email: '',
    mobileNo: '',
    familyMember: '',
    joinDate: '',
    leavingDate: '',
    tenure: '',
    department: '',
    designation: '',
    empCode: '',
    companyName: '',
    companylogo: '',
  });

  const [error, setError] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLeavingDate, setSelectedLeavingDate] = useState(null);
  const [tenure1, setTenure] = useState(null);
  const [showJoinPicker, setShowJoinPicker] = useState(false);
  const [showLeavePicker, setShowLeavePicker] = useState(false);
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);

  useEffect(() => {
    
    if (id) fetchBankDetail(id);
  }, [id]);

  const fetchBankDetail = async id => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/get-emp-data/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = response.data.data;
      const joinDate = data.joinDate ? new Date(data.joinDate) : null;
      const leaveDate = data.leavingDate ? new Date(data.leavingDate) : null;
      setSelectedDate(joinDate);
      setSelectedLeavingDate(leaveDate);
      setFormData({...data, joinDate, leavingDate: leaveDate});
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedLeavingDate) {
      const days = Math.ceil(
        Math.abs(new Date(selectedLeavingDate) - new Date(selectedDate)) /
          (1000 * 3600 * 24),
      );
      setFormData(prev => ({...prev, tenure: days}));
    }
  }, [selectedDate, selectedLeavingDate]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({...prev, [name]: value}));
    // setError(prev => ({...prev, [name]: ''}));
  };

  const handleSubmit = async () => {
    console.log("workifn");
    const token = await AsyncStorage.getItem('token');
    const fieldsToValidate = ['empName', 'empCode'];
    const formErrors = {};

    fieldsToValidate.forEach(field => {
      if (!formData[field]) formErrors[field] = `Please add ${field}`;
    });

    try {
      const updatedData = {
        ...formData,
        joinDate: moment(selectedDate).format('YYYY-MM-DD'),
        leavingDate: moment(selectedLeavingDate).format('YYYY-MM-DD'),
        tenure: tenure1,
      };
      const url = id
        ? `${REACT_APP_API_BASE_URL}/api/update-emp-data/${id}`
        : `${REACT_APP_API_BASE_URL}/api/add-emp-data`;
      const method = id ? 'put' : 'post';

      const res = await axios[method](url, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 200 || res.status === 201)
        navigation.navigate('Employees');
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Employee</Text>
      </View>

      <TextInput
        placeholder="Emp. Name"
        value={formData.empName}
        onChangeText={v => handleInputChange('empName', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={v => handleInputChange('email', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Mobile No"
        value={formData.mobileNo}
        keyboardType="numeric"
        onChangeText={v => handleInputChange('mobileNo', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="F/H Name"
        value={formData.familyMember}
        onChangeText={v => handleInputChange('familyMember', v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Designation"
        value={formData.designation}
        onChangeText={v => handleInputChange('designation', v)}
        style={styles.input}
      />

      <TouchableOpacity onPress={() => setShowJoinPicker(true)}>
        <Text style={styles.dateButton}>
          Joining Date:{' '}
          {selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : 'Select'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowLeavePicker(true)}>
        <Text style={styles.dateButton}>
          Leaving Date:{' '}
          {selectedLeavingDate
            ? moment(selectedLeavingDate).format('YYYY-MM-DD')
            : 'Select'}
        </Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Tenure"
        value={formData.tenure?.toString()}
        editable={false}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={() => setDeptModalVisible(true)}
        style={styles.select}>
        <Text>{formData.department || 'Select Department'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setCompanyModalVisible(true)}
        style={styles.select}>
        <Text>{formData.companyName || 'Select Company'}</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Employee Code"
        value={formData.empCode}
        onChangeText={v => handleInputChange('empCode', v)}
        style={styles.input}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {id ? 'Update Client' : 'Submit'}
        </Text>
      </TouchableOpacity>
      {/* <Button title="Submit" onPress={handleSubmit} /> */}

      {/* Join Date Picker */}
      <DateTimePickerModal
        isVisible={showJoinPicker}
        mode="date"
        onConfirm={date => {
          setSelectedDate(date);
          handleInputChange('joinDate', date);
          setShowJoinPicker(false);
        }}
        onCancel={() => setShowJoinPicker(false)}
      />

      {/* Leave Date Picker */}
      <DateTimePickerModal
        isVisible={showLeavePicker}
        mode="date"
        onConfirm={date => {
          setSelectedLeavingDate(date);
          handleInputChange('leavingDate', date);
          setShowLeavePicker(false);
        }}
        onCancel={() => setShowLeavePicker(false)}
      />

      {/* Department Modal */}
      <Modal visible={deptModalVisible} animationType="slide" transparent>
        <View style={styles.modalView}>
          <FlatList
            data={departments}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  handleInputChange('department', item);
                  setDeptModalVisible(false);
                }}>
                <Text style={styles.modalItem}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, idx) => idx.toString()}
          />
        </View>
      </Modal>

      {/* Company Modal */}
      <Modal visible={companyModalVisible} animationType="slide" transparent>
        <View style={styles.modalView}>
          <FlatList
            data={companies}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  handleInputChange('companyName', item);
                  setCompanyModalVisible(false);
                }}>
                <Text style={styles.modalItem}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, idx) => idx.toString()}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16},
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
  header: {fontSize: 18, fontWeight: 'bold', marginBottom: 16},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#eee',
    marginBottom: 12,
    borderRadius: 8,
  },
  select: {
    padding: 10,
    backgroundColor: '#ddd',
    marginBottom: 12,
    borderRadius: 8,
  },
  modalView: {
    marginTop: 'auto',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalItem: {padding: 15, borderBottomWidth: 1, borderColor: '#eee'},
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
