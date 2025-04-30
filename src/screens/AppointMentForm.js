import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
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
  const [companyLogos, setCompanyLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState("");
  const [isLogoModalVisible, setLogoModalVisible] = useState(false);

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


  useEffect(() => {
    fetchCompanyLogos();
  }, []);

  

  const fetchCompanyLogos = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/get-companyLogo`);
      const data = await response.json();
        if (data.success) {
          setCompanyLogos(data.data);
        } else {
          console.error("Failed to fetch company logos:", data.message);
        }
    } catch (error) {
      console.error("Error fetching company logos:", error);
    }
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
    const updatedFormData = {
      ...formData,
      companyLogo: selectedLogo, // ✅ Add logo here
    };
    try {
      if (id) {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/api/appointment-update/${id}`,
          updatedFormData,
          {headers},
        );
      } else {
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/add-appointment-data`,
          updatedFormData,
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
  const renderModalItem = (item, onPress) => (
    <TouchableOpacity style={styles.modalItem} onPress={onPress}>
      <Text style={styles.modalItemText}>{item.name || item.empName}</Text>
    </TouchableOpacity>
  );
  // Logo Selection Modal
  const LogoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLogoModalVisible}
      onRequestClose={() => setLogoModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Company Logo</Text>
          <FlatList
            data={companyLogos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderModalItem(item, () => {
              setSelectedLogo(item.companylogo);
              setLogoModalVisible(false);
            })}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setLogoModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


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

<View style={styles.inputContainer}>
            <Text style={styles.label}>Select Company Logo</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setLogoModalVisible(true)}
            >
              <Text>
                {companyLogos.find(item => item.companylogo === selectedLogo)?.name || "Select Company Logo"}
              </Text>
            </TouchableOpacity>
          </View>

        
        <Text style={[styles.label, {marginVertical:0}]}>Date</Text>
        <TouchableOpacity
          style={{border: 1, borderColor: 'black',marginBottom:20}}
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
              : ''}
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

      <LogoModal />
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

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#4a90e2",
    borderRadius: 4,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
});
