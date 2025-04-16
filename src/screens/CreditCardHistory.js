import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
// import DocumentPicker from '@react-native-documents/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreditCardHistory = () => {
  const [file, setFile] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [bankOptions, setBankOptions] = useState([]);
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState('');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pickerMode, setPickerMode] = useState('start');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const pickCSVFile = async () => {
    // try {
    //   const res = await DocumentPicker.pick({
    //     type: ['text/csv'],
    //   });
    //   setFile(res[0]);
    // } catch (err) {
    //   if (!DocumentPicker.isCancel(err)) {
    //     Alert.alert('Error picking file', err.message);
    //   }
    // }
  };

  const handleUpload = async () => {
    if (!file || !selectedAccount)
      return Alert.alert('Missing data', 'Please select file and account');
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'text/csv',
    });
    formData.append('accountId', selectedAccount);
    formData.append('created_at', new Date().toISOString().split('T')[0]);

    try {
      await axios.post(`${REACT_APP_API_BASE_URL}/api/importUser`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      fetchData();
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    }
  };

  const fetchData = async () => {
    try {
      const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/credit-history`,
        {headers},
      );
      if (response.data.success) {
        const fetchedData = response.data.data.reverse();
        const options = fetchedData.map(item => ({
          value: item._id,
          label: `${item.bankName} (${item.accNo})`,
        }));
        setBankOptions(options);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGo = async () => {
    try {
      const res = await axios.get(`${REACT_APP_API_BASE_URL}/api/csv-history`);
      let filtered = res.data.data;

      if (filterData) {
        filtered = filtered.filter(i => i.accountId === filterData);
      }

      if (searchText) {
        filtered = filtered.filter(item =>
          item.csvData?.some(entry =>
            Object.values(entry).some(val =>
              String(val).toLowerCase().includes(searchText.toLowerCase()),
            ),
          ),
        );
      }

      if (startDate && endDate) {
        filtered = filtered.filter(item => {
          const date = new Date(item.created_at);
          return date >= startDate && date <= endDate;
        });
      }
      setData(filtered);
    } catch (err) {
      Alert.alert('Filter Error', err.message);
    }
  };

  const handleDateConfirm = date => {
    if (pickerMode === 'start') setStartDate(date);
    else setEndDate(date);
    setDatePickerVisibility(false);
  };

  useEffect(() => {
    fetchData();
  }, [modalVisible, filterModalVisible]);

  return (
    <ScrollView contentContainerStyle={{padding: 20}}>
      <Text style={{fontWeight: 'bold', fontSize: 18}}>Upload CSV</Text>

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={{color: 'blue', marginVertical: 10}}>
          {selectedAccount
            ? bankOptions?.find(opt => opt.value === selectedAccount)?.label
            : 'Select Bank Account'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#000000aa',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              margin: 20,
              padding: 20,
              borderRadius: 10,
            }}>
            {bankOptions.map((option, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  setSelectedAccount(option.value);
                  setModalVisible(false);
                }}>
                <Text style={{padding: 10}}>{option.label}</Text>
              </Pressable>
            ))}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <TouchableOpacity onPress={pickCSVFile}>
        <Text style={{color: 'blue', marginBottom: 10}}>
          {file ? `Selected: ${file.name}` : 'Pick CSV File'}
        </Text>
      </TouchableOpacity>

      <Button title="Upload CSV" onPress={handleUpload} />

      <View style={{marginTop: 30}}>
        <Text style={{fontWeight: 'bold', fontSize: 16}}>
          Filter by Bank ID & Date
        </Text>

        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Text style={{color: 'blue', marginVertical: 10}}>
            {filterData
              ? bankOptions.find(opt => opt.value === filterData)?.label
              : 'Select Filter Bank'}
          </Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={filterModalVisible}
          animationType="slide"
          onRequestClose={() => setFilterModalVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: '#000000aa',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                margin: 20,
                padding: 20,
                borderRadius: 10,
              }}>
              {bankOptions?.map((option, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setFilterData(option.value);
                    setFilterModalVisible(false);
                  }}>
                  <Text style={{padding: 10}}>{option.label}</Text>
                </Pressable>
              ))}
              <Button
                title="Close"
                onPress={() => setFilterModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

        <TextInput
          placeholder="Search Text"
          value={searchText}
          onChangeText={setSearchText}
          style={{borderBottomWidth: 1, marginBottom: 10}}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <Button
            title="Start Date"
            onPress={() => {
              setPickerMode('start');
              setDatePickerVisibility(true);
            }}
          />
          <Button
            title="End Date"
            onPress={() => {
              setPickerMode('end');
              setDatePickerVisibility(true);
            }}
          />
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <Button title="Go" onPress={handleGo} />
      </View>

      <FlatList
        style={{marginTop: 20}}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text>No Data Found</Text>}
        renderItem={({item}) => {
          const total = item.csvData
            .reduce((sum, row) => sum + parseFloat(row.Total || 0), 0)
            .toFixed(2);
          return (
            <View style={{padding: 10, borderBottomWidth: 1, marginBottom: 10}}>
              <Text style={{fontWeight: 'bold'}}>Date: {item.created_at}</Text>
              <Text style={{fontWeight: 'bold'}}>Total: ₹{total}</Text>
              {item.csvData.map((row, i) => (
                <View
                  key={i}
                  style={{paddingVertical: 5, borderBottomWidth: 0.5}}>
                  <Text>Date: {row.Date}</Text>
                  <Text>Description: {row.Description}</Text>
                  <Text>Debit: {row.Debit}</Text>
                  <Text>Credit: {row.Credit}</Text>
                  <Text>Amount: {row.Total}</Text>
                </View>
              ))}
            </View>
          );
        }}
      />
    </ScrollView>
  );
};

export default CreditCardHistory;
