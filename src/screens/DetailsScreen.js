// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import Header from '../components/Header';

// export default function DetailsScreen({ navigation }) {
//   return (
//     <View style={{flex: 1 , marginTop:20,}}>
//          <Header title="Details"  navigation={navigation}/>
//     <View style={styles.container}>
//     <Text style={styles.title}>Details Screen</Text>
//     <Button title="Go Back" onPress={() => navigation.goBack()} />
//   </View>
//   </View>
//   );
// }
// const styles = StyleSheet.create({
//     container: {
//       flex: 1, justifyContent: 'center', alignItems: 'center',
//     },
//     title: {
//       fontSize: 24, fontWeight: 'bold', marginBottom: 20,
//     },
//   });

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import axios from 'axios';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemsPerPageSelector from '../components/ItemsPerPageSelector';

const DetailsScreen = ({navigation}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [tokenData, setTokenData] = useState('');

  // const itemsPerPage = 15; // Set how many items per page you want
  const totalPages = Math.ceil(data.length / itemsPerPage);
  // Function to paginate data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };
  useEffect(() => {
    const fetchCompanyData = async () => {
      const token = await AsyncStorage.getItem('token');
      setTokenData(token);
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      const apiUrl = `${REACT_APP_API_BASE_URL}/api/get-companyData`;
      axios
        .get(apiUrl, {headers})
        .then(response => {
          const updatedCompanyData = response.data.data.map(item => {
            // Prepend base URL to signature field
            return {
              ...item,
              signature: `${REACT_APP_API_BASE_URL}${item.signature}`,
            };
          });
          setData(updatedCompanyData.reverse());
        })
        .catch(error => {
          console.error('Error fetching invoices:', error);
        });
    };
    fetchCompanyData();
  }, []);

  const confirmDelete = id => {
    setSelectedId(id);
    setDeleteModalVisible(true);
  };
  const handleDelete = async id => {
    const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${tokenData}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    try {
      await axios.delete(
        `${REACT_APP_API_BASE_URL}/api/delte-companyData/${selectedId}`,
        {headers},
      );
      setData(data?.filter(item => item._id !== selectedId));
      setDeleteModalVisible(false);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting company detail:', error);
    }
  };

  // Handle edit action
  const handleEdit = item => {
    navigation.navigate('AddCompany', {
      companyId: item._id, // or item._id depending on your data structure
    });
  };

  //   // Handle delete action
  //   const handleDelete = item => {
  //     alert(`Deleting ${item.tradeName}`);
  //   };

  return (
    <View style={{flex: 1, marginTop: 20}}>
      <Header title="Invoices" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCompany')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Add Company Data </Text>
          </View>
        </TouchableOpacity>
        {/* <Text style={styles.title}>Invoices</Text> */}
        {/* Table Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText]}>Trade Name</Text>
          <Text style={[styles.headerText, {paddingLeft: 140}]}>IFSC</Text>
          <Text style={[styles.headerText, {paddingLeft: 150}]}>PAN No</Text>
          <Text style={[styles.headerText, {paddingLeft: 140}]}>GST</Text>
          <Text
            style={[styles.headerText, {paddingLeft: 120, textAlign: 'right'}]}>
            Action
          </Text>
        </View>
        <FlatList
          data={getPaginatedData()}
          keyExtractor={item => item?.id}
          renderItem={({item}) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item?.trade}</Text>
              <Text style={styles.itemText}>{item?.ifsc}</Text>
              <Text style={styles.itemText}>{item?.panNo}</Text>
              <Text style={styles.itemText}>{item?.gst}</Text>

              {/* Edit and Delete Buttons */}
              <View style={styles.actionContainer}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Icon
                    name="edit"
                    size={20}
                    color="blue"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(item?._id)}
                  //  onPress={() => handleDelete(item?.id)}
                >
                  <Icon
                    name="trash"
                    size={20}
                    color="red"
                    style={styles.icon}
                  />
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
        {/* Pagination */}
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
            onPress={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}>
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
  headerContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  icon: {
    marginHorizontal: 2,
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

export default DetailsScreen;
