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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import Header from '../components/Header';

const BankDetails = ({navigation}) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const itemsPerPage = 3; // Set how many items per page you want
  const totalPages = Math.ceil(data.length / itemsPerPage);
  console.log('datadata', data);
  // Function to paginate data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const paginate = pageNumber => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const apiUrl = `${REACT_APP_API_BASE_URL}/api/bank-data`;
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        const response = await axios.get(apiUrl, {headers});
        setData(response.data.data.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const confirmDelete = id => {
    setSelectedId(id);
    setDeleteModalVisible(true);
  };
  const handleDelete = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await axios.delete(`${REACT_APP_API_BASE_URL}/api/delete-detail/${selectedId}`, {
        headers,
      });
      setData(prev => prev.filter(item => item._id !== selectedId));
      setDeleteModalVisible(false);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
// Handle edit action
const handleEdit = item => {
    navigation.navigate('AddBankDetail', {
      BankId: item._id, // or item._id depending on your data structure
    });
  };
  return (
    <View style={{marginTop: 40}}>
      <Header title="Bank Detail" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBankDetail')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Add Bank Detail </Text>
          </View>
        </TouchableOpacity>
        </View>
      {/* Header Row */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Bank Name</Text>
        <Text style={styles.headerText}>Acc. No.</Text>
        <Text style={styles.headerText}>Acc. Type</Text>
        <Text style={styles.headerText}>Branch Name</Text>
        <Text style={styles.headerText}>IFSC Code</Text>
        <Text style={styles.headerText}>Swift Code</Text>
        <Text style={styles.headerText}>Acc. Name</Text>
        <Text style={styles.headerText}>Trade Name</Text>
        <Text style={styles.headerText}>Action</Text>
      </View>

      {/* FlatList to display data */}
      <FlatList
        data={getPaginatedData()}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.bankName}</Text>
            <Text style={styles.itemText}>{item.accNo}</Text>
            <Text style={styles.itemText}>{item.accType}</Text>
            <Text style={styles.itemText}>{item.BranchName}</Text>
            <Text style={styles.itemText}>{item.ifscCode}</Text>
            <Text style={styles.itemText}>{item.swiftCode}</Text>
            <Text style={styles.itemText}>{item.accName}</Text>
            <Text style={styles.itemText}>{item.tradeName}</Text>

            {/* Edit and Delete Icons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Icon name="edit" size={20} color="blue" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity
               onPress={() => confirmDelete(item?._id)}>
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
        )}
      />
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}>
          <Text style={styles.pageButton}>Previous</Text>
        </TouchableOpacity>
        <Text
          style={
            styles.pageText
          }>{`Page ${currentPage} of ${totalPages}`}</Text>
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}>
          <Text style={styles.pageButton}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
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
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 60,
  },
  icon: {
    marginHorizontal: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pageButton: {
    fontSize: 16,
    color: 'blue',
    paddingHorizontal: 10,
  },
  pageText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
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

export default BankDetails;
