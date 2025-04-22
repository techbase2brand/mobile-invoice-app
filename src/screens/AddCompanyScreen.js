import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';

const AddCompanyScreen = ({navigation, route}) => {
  const [formData, setFormData] = useState({
    trade: '',
    companyAddress: '',
    ifsc: '',
    panNo: '',
    gstNo: '',
    signature: '',
    companylogo: '',
  });

  const [logo, setLogo] = useState({
    name: '',
    companylogo: '',
  });
  const [error, setError] = useState({});
  const [enableGST, setEnableGST] = useState(false);
  const [img, setImg] = useState(false);
  const id = route?.params?.companyId || {};
console.log("logologologo",logo);
  useEffect(() => {
    if (id) {
      fetchCompanyDetail(id);
      setImg(false);
    }
  }, [id]);

  const fetchCompanyDetail = async id => {
    const token = await AsyncStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/get-company/${id}`,
        {headers},
      );
      const bankDetailData = response.data.data;
      console.log('bankDetailDatabankDetailData', bankDetailData);
      setFormData(bankDetailData);
    } catch (error) {
      console.error('Error fetching bank detail:', error);
    }
  };

  const handleCheckboxChange = value => {
    setEnableGST(value);
  };

  const handleLogoUpload = async () => {
    setImg(true);
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        setImg(false);
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        setImg(false);
      } else {
        const file = {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName,
        };

        const formData = new FormData();
        formData.append('image', file);

        try {
          const uploadResponse = await axios.post(
            `${REACT_APP_API_BASE_URL}/api/upload-companylogo`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );
          const imageUrl = uploadResponse.data.imageUrl;
          setLogo({
            name: 'Base2Brand-logo',
            companylogo: imageUrl,
          });
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    });
  };

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
    setError(prevErrors => ({...prevErrors, [name]: ''}));
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const formErrors = {};
    if (!formData.trade.trim()) {
      formErrors.trade = 'Please add trade name';
    }
    console.log("response.statusresponse.status",logo,formData);

    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
    } else {
      try {
        let response;
        if (id) {
          response = await axios.put(
            `${REACT_APP_API_BASE_URL}/api/update-comp-data/${id}`,
            formData,
            {headers},
          );
        } else {
          response = await axios.post(
            `${REACT_APP_API_BASE_URL}/api/add-companyLogo`,
            logo,
            {headers},
          );
        }
        if (response.status === 201 || response.status === 200) {
          navigation.navigate('Details');
        }
      } catch (error) {
        console.error('Error in Axios request:', error);
      }
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
      {/* <Text style={styles.title}>Add Company Detail</Text> */}

      <Text style={styles.label}>Trade Name</Text>
      <TextInput
        placeholder="Trade Name"
        value={formData.trade}
        style={[styles.input, error.trade && styles.inputError]}
        onChangeText={value => handleChange('trade', value)}
      />
      {error.trade && <Text style={styles.errorText}>{error.trade}</Text>}

      <Text style={styles.label}>Company Address</Text>
      <TextInput
        placeholder="Company Address"
        value={formData.companyAddress}
        style={styles.input}
        onChangeText={value => handleChange('companyAddress', value)}
      />

      <Text style={styles.label}>IFSC</Text>
      <TextInput
        placeholder="IFSC Code"
        value={formData.ifsc}
        style={styles.input}
        onChangeText={value => handleChange('ifsc', value)}
      />

      <Text style={styles.label}>PAN No</Text>
      <TextInput
        placeholder="PAN Number"
        value={formData.panNo}
        style={styles.input}
        onChangeText={value => handleChange('panNo', value)}
      />
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Enable GST</Text>
        <Switch value={enableGST} onValueChange={handleCheckboxChange} />
      </View>
      {enableGST && (
        <View>
          <Text style={styles.label}>GST No</Text>
          <TextInput
            placeholder="GST Number"
            value={formData.gstNo}
            style={styles.input}
            onChangeText={value => handleChange('gstNo', value)}
          />
        </View>
      )}
      <TouchableOpacity style={styles.uploadButton} onPress={handleLogoUpload}>
        <Text style={styles.uploadButtonText}>Upload Logo</Text>
      </TouchableOpacity>

      {/* {logo.companylogo && (
        <Image source={{uri: logo.companylogo}} style={styles.logoPreview} />
      )} */}
       {logo?.name && (
       <Text>{logo?.companylogo}</Text>
      )}

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    // paddingHorizontal: 10,
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
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoPreview: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: 'center',
  },
});

export default AddCompanyScreen;
