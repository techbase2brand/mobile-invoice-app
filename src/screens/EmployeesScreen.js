import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';

const EmployeesScreen = () => {
  const [data, setData] = useState([]);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const navigation = useNavigation();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = pageNumber => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/get-empData`,
          {headers},
        );
        setData(response.data.data.reverse());
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchData();
  }, []);

  const confirmDelete = id => {
    setSelectedId(id);
    setDeleteModalVisible(true);
  };
  const handleDelete = async id => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      await axios.delete(
        `${REACT_APP_API_BASE_URL}/api/delete-emp/${selectedId}`,
        {
          headers,
        },
      );
      setData(data?.filter(item => item._id !== selectedId));
      setDeleteModalVisible(false);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };
  // Handle edit action
  const handleEdit = item => {
    navigation.navigate('AddEmployee', {
      empId: item._id, // or item._id depending on your data structure
    });
  };
  const renderHeader = () => (
    <View style={styles.headerRow}>
      {[
        'Emp. Name',
        'F/H Name',
        'Joining',
        'Leaving',
        'Dept.',
        'Designation',
        'Code',
        'Company',
        'Action',
      ].map((title, index) => (
        <Text key={index} style={styles.headerText}>
          {title}
        </Text>
      ))}
    </View>
  );

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.empName || 'N/A'}</Text>
      <Text style={styles.cell}>{item.familyMember || 'N/A'}</Text>
      <Text style={styles.cell}>{item?.joinDate?.split('T')[0] || 'N/A'}</Text>
      <Text style={styles.cell}>
        {item?.leavingDate?.split('T')[0] || 'N/A'}
      </Text>
      <Text style={styles.cell}>{item.department || 'N/A'}</Text>
      <Text style={styles.cell}>{item.designation || 'N/A'}</Text>
      <Text style={styles.cell}>{item.empCode || 'N/A'}</Text>
      <Text style={styles.cell}>{item.companyName || 'N/A'}</Text>
      <View style={styles.actionCell}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Icon name="edit" size={20} color="blue" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item._id)}>
          <Icon name="trash" size={20} color="red" style={styles.icon} />
        </TouchableOpacity>
      </View>
      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this company?
            </Text>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={{marginTop: 20}}>
      <Header title="Employees" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEmployee')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Add Employee</Text>
          </View>
        </TouchableOpacity>
      </View>
      {renderHeader()}
      <FlatList
        data={currentItems}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}>
          <Text style={styles.paginateBtn}>Previous</Text>
        </TouchableOpacity>
        <Text style={{marginTop:6}}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          onPress={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <Text style={styles.paginateBtn}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10},
  addButton: {
    display: 'flex',
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end', // aligns left
    width: '20%',
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
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRow: {flexDirection: 'row', backgroundColor: '#e5e7eb', padding: 10},
  headerText: {flex: 1, fontWeight: 'bold', color: '#111827', fontSize: 12},
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    padding: 10,
  },
  cell: {flex: 1, fontSize: 12},
  actionCell: {flexDirection: 'row', gap: 10, width: 100},
  edit: {color: 'blue', marginRight: 10},
  delete: {color: 'red'},
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  paginateBtn: {padding: 5, backgroundColor: '#f3f4f6', borderRadius: 5},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    padding: 20,
  },
  modalContainer: {
    width: '50%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  deleteButton: {
    backgroundColor: '#e53935',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmployeesScreen;
