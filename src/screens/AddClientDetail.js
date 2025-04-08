import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_API_BASE_URL } from '../constans/Constants';

const AddClientDetail = ({navigation,route}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    clientAddress: '',
    clientAddress1: '',
    clientAddress2: '',
    email: '',
    mobileNo: '',
    project: [''],
    invoiceDate: new Date(),
  });
  const [error, setError] = useState({});

  const  id  = route?.params?.ClientId || {};
  
  useEffect(() => {
    if (id) {
      fetchClientDetail(id);
    }
  }, [id]);

  const fetchClientDetail = async (clientId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/get-client-data/${clientId}`,
        { headers }
      );
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching client detail:', error);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: '' }));
  };

  const handleProjectChange = (value, index) => {
    const updatedProjects = [...formData.project];
    updatedProjects[index] = value;
    setFormData({ ...formData, project: updatedProjects });
  };

  const handleAddProject = () => {
    setFormData({ ...formData, project: [...formData.project, ''] });
  };

  const handleRemoveProject = (index) => {
    const updatedProjects = [...formData.project];
    updatedProjects.splice(index, 1);
    setFormData({ ...formData, project: updatedProjects });
  };

  const handleSubmit = async () => {
    const formErrors = {};
    if (!formData.clientName.trim()) {
      formErrors.clientName = 'Please add client name';
    }

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
          `${REACT_APP_API_BASE_URL}/api/update-client/${id}`,
          formData,
          { headers }
        );
      } else {
        response = await axios.post(
          `${REACT_APP_API_BASE_URL}/api/client-detail`,
          formData,
          { headers }
        );
      }

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Client data saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('ClientDetails') },
        ]);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Client Detail</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Client Name</Text>
        <TextInput
          style={[styles.input, error.clientName && styles.inputError]}
          value={formData.clientName}
          onChangeText={(value) => handleChange('clientName', value)}
          placeholder="Client Name"
        />
        {error.clientName && (
          <Text style={styles.errorText}>{error.clientName}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Company</Text>
        <TextInput
          style={styles.input}
          value={formData.company}
          onChangeText={(value) => handleChange('company', value)}
          placeholder="Company"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Client Address</Text>
        <TextInput
          style={styles.input}
          value={formData.clientAddress}
          onChangeText={(value) => handleChange('clientAddress', value)}
          placeholder="Address Line 1"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Client Address 1</Text>
        <TextInput
          style={styles.input}
          value={formData.clientAddress1}
          onChangeText={(value) => handleChange('clientAddress1', value)}
          placeholder="Address Line 2"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Client Address 2</Text>
        <TextInput
          style={styles.input}
          value={formData.clientAddress2}
          onChangeText={(value) => handleChange('clientAddress2', value)}
          placeholder="Address Line 3"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Mobile No</Text>
        <TextInput
          style={styles.input}
          value={formData.mobileNo}
          onChangeText={(value) => handleChange('mobileNo', value)}
          placeholder="Mobile No"
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.sectionTitle}>Tasks</Text>
      {formData.project.map((proj, index) => (
        <View key={index} style={styles.formGroup}>
          <TextInput
            style={styles.input}
            value={proj}
            onChangeText={(value) => handleProjectChange(value, index)}
            placeholder={`Task ${index + 1}`}
          />
          {index !== 0 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveProject(index)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {id ? 'Update Client' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddClientDetail;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    width:'20%',
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  removeButton: {
    width:'20%',
    backgroundColor: '#dc3545',
    marginTop: 5,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
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
