import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import ItemsPerPageSelector from '../components/ItemsPerPageSelector';

const AppointMent = () => {
  const [data, setData] = useState([]);
  const [itemsPerPage,setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/get-appointment`,
        {headers},
      );
      if (response.data.success) {
        setData(response.data.data.reverse());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await axios.delete(
        `${REACT_APP_API_BASE_URL}/api/delete-appointment/${id}`,
        {headers},
      );
      setData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.userName}</Text>
      <Text style={styles.cell}>{item.refNo}</Text>
      <Text style={styles.cell}>{item.appointmentDate}</Text>
      <View style={[styles.cell, styles.actionCell]}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AppointMentForm', {appointmentId: item._id})
          }>
          <Icon name="edit" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <FAIcon name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AppointMentPdf', {appointmentId: item._id})
        }>
        <Text style={styles.pdfButton}>PDF</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{marginTop: 20}}>
      <Header title="Appointment Letter" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AppointMentForm')}>
          <View style={styles.buttonContent}>
            <FAIcon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Add</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Name</Text>
          <Text style={styles.header}>Ref. No</Text>
          <Text style={styles.header}>Date</Text>
          <Text style={styles.header}>Action</Text>
          <Text style={styles.header}>Create</Text>
        </View>
        <FlatList
          data={paginatedData}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
            <Text style={styles.pageButton}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }>
            <Text style={styles.pageButton}>Next</Text>
          </TouchableOpacity>
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </View>
      </View>
    </View>
  );
};

export default AppointMent;
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: '#eee',
    justifyContent: 'space-between',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 13,
  },
  actionCell: {
    flexDirection: 'row',
    gap: 10,
  },
  pdfButton: {
    backgroundColor: 'green',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
    alignItems: 'center',
  },
  pageButton: {
    color: '#007bff',
  },
  pageText: {
    fontSize: 14,
  },
  addButton: {
    display: 'flex',
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end', // aligns left
    width: '10%',
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
});
