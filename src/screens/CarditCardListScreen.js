import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import Header from '../components/Header';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const CreditCardListScreen = ({navigation}) => {
  const [data, setData] = useState([]);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/credit-history`,
          {headers},
        );
        if (response.data.success) {
          setData(response.data.data.reverse());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const filteredItems = currentItems.filter(
    item =>
      item.accNo.includes(searchTerm) ||
      item.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stateMentDate.includes(searchTerm) ||
      item.dueDate.includes(searchTerm),
  );

  const handleDelete = async id => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      await axios.delete(
        `${REACT_APP_API_BASE_URL}/api/delete-credit-data/${id}`,
        {headers},
      );
      setData(data.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  const handleEdit = item => {
    navigation.navigate('CreditForm', {
      CreditCardId: item, // or item._id depending on your data structure
    });
  };
  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item?.accNo}</Text>
      <Text style={styles.cell}>{item?.bankName}</Text>
      <Text style={styles.cell}>{item?.stateMentDate?.split('T')[0]}</Text>
      <Text style={styles.cell}>{item?.dueDate?.split('T')[0]}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
         onPress={() => handleEdit(item?._id)}>
          <Icon name="edit" size={20} color="blue" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <Icon
            name="trash"
            size={20}
            color="red"
            style={{marginHorizontal: 20}}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{marginTop: 20, padding: 16}}>
      <Header title="Credit Card" navigation={navigation} />

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreditForm')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Add Card</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder="Search"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Table Headings */}
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Acc. No</Text>
        <Text style={styles.headerCell}>Bank Name</Text>
        <Text style={styles.headerCell}>Statement Date</Text>
        <Text style={styles.headerCell}>Due Date</Text>
        <Text style={styles.headerCell}>Action</Text>
      </View>

      {/* FlatList for table rows */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item._id}
        renderItem={renderItem}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage(prev => prev - 1)}>
          <Text style={styles.pageButton}>Previous</Text>
        </TouchableOpacity>
        <Text>Page {currentPage}</Text>
        <TouchableOpacity
          disabled={currentPage >= Math.ceil(data.length / itemsPerPage)}
          onPress={() => setCurrentPage(prev => prev + 1)}>
          <Text style={styles.pageButton}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    borderRadius: 5,
    marginVertical: 10,
    width: '40%',
  },
  addButton: {
    display: 'flex',
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end', // aligns left
    width: '15%',
    marginVertical: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    padding: 20,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  pageButton: {
    color: 'blue',
  },
});

export default CreditCardListScreen;
