import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import axios from 'axios';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExperienceLetterForm = ({navigation, route}) => {
  const id = route?.params?.experienceId;

  const [selectedLogo, setSelectedLogo] = useState('');
  const [companyLogos, setCompanyLogos] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const richText = useRef();

  const [formData, setFormData] = useState({
    userName: '',
    refNo: '',
    experienceDate: '',
    experienceData: '',
    companylogo: '',
  });

  const generateRefNo = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `B2B/${currentYear}-${nextYear.toString().slice(-2)}/${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = {Authorization: `Bearer ${token}`};

        if (id) {
          const response = await axios.get(
            `${REACT_APP_API_BASE_URL}/api/experience-get/${id}`,
            {headers},
          );
          const {userName, refNo, experienceDate, experienceData} =
            response?.data?.data;
          setFormData({
            userName: userName || '',
            refNo: refNo || generateRefNo(),
            experienceDate: experienceDate || '',
            experienceData: experienceData || '',
            companylogo: '',
          });
        } else {
          setFormData({
            userName: '',
            refNo: generateRefNo(),
            experienceDate: '',
            experienceData: '',
            companylogo: '',
          });

          const res = await axios.get(
            `${REACT_APP_API_BASE_URL}/api/get-experienceLetter`,
            {headers},
          );
          if (res?.data?.success && res?.data?.data?.length > 0) {
            setFormData(prev => ({
              ...prev,
              experienceData: res?.data?.data[0]?.experienceData,
            }));
          }
        }

        const logosRes = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/get-companyLogo`,
        );
        setCompanyLogos(logosRes.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {Authorization: `Bearer ${token}`};

    try {
      if (id) {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/api/experience-update/${id}`,
          formData,
          {headers},
        );
      } else {
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/add-experience-data`,
          formData,
          {headers},
        );
      }

      setFormData({
        userName: '',
        refNo: generateRefNo(),
        experienceDate: '',
        experienceData: '',
        companylogo: '',
      });

      navigation.navigate('ExperienceLetter');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
        onChangeText={text => setFormData({...formData, userName: text})}
        placeholder="Name"
      />

      <Text style={styles.label}>Ref. No</Text>
      <TextInput style={styles.input} value={formData.refNo} editable={false} />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        onPress={() => setDatePickerVisibility(true)}
        style={styles.input}>
        <Text>{formData.experienceDate || 'Select Date'}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={date => {
          setDatePickerVisibility(false);
          setFormData({
            ...formData,
            experienceDate: date.toISOString().split('T')[0],
          });
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <Text style={styles.label}>Select Company Logo</Text>
      <TouchableOpacity
        onPress={() => setLogoModalVisible(true)}
        style={styles.input}>
        <Text>{selectedLogo || 'Select Company Logo'}</Text>
      </TouchableOpacity>

      <Modal visible={logoModalVisible} transparent>
        <View style={styles.modalContainer}>
          <FlatList
            data={companyLogos}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedLogo(item.name);
                  setFormData({...formData, companylogo: item.companylogo});
                  setLogoModalVisible(false);
                }}
                style={styles.modalItem}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <Text style={styles.label}>Experience Letter</Text>
      <RichEditor
        ref={richText}
        initialContentHTML={formData.experienceData}
        onChange={html => setFormData({...formData, experienceData: html})}
        style={styles.richEditor}
      />
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.insertBulletsList,
          actions.insertOrderedList,
        ]}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>
          {' '}
          {id ? 'Update Client' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 40,
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  richEditor: {
    borderColor: '#ccc',
    borderWidth: 1,
    minHeight: 150,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 6,
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

export default ExperienceLetterForm;
