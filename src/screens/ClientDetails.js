import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClientDetails = ({navigation}) => {
  const [data, setData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const apiUrl = `${REACT_APP_API_BASE_URL}/api/get-clients`;
      try {
        const response = await axios.get(apiUrl, {headers});
        setData(response.data.data.reverse());
      } catch (error) {
        console.error('Error fetching clients:', error);
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
      await axios.delete(`${REACT_APP_API_BASE_URL}/api/delete-client/${selectedId}`, {
        headers,
      });
      setData(data.filter(item => item._id !== selectedId));
      setDeleteModalVisible(false);
      setSelectedId(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };
  // Handle edit action
const handleEdit = item => {
    navigation.navigate('AddClientDetail', {
      ClientId: item._id, // or item._id depending on your data structure
    });
  };

  const openModal = project => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.clientName}</Text>
      <Text style={styles.cell}>{item.company}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>{item.mobileNo}</Text>

      <TouchableOpacity
        onPress={() => openModal(item)}
        style={styles.openButton}>
        <Text style={styles.openButtonText}>Open</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
         onPress={() => handleEdit(item)}>
          <Icon name="edit" size={20} color="blue" style={styles.icon} />
          
        </TouchableOpacity>
        <TouchableOpacity 
           onPress={() => confirmDelete(item?._id)}
        >
        <Icon name="trash" size={20} color="red" style={styles.icon} />
        </TouchableOpacity>
      </View>
        {/* Modal */}
        <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}>
                <View style={styles.modalOverlay1}>
                  <View style={styles.modalContainer1}>
                    <Text style={styles.modalText1}>
                      Are you sure you want to delete this Client?
                    </Text>
                    <View style={styles.modalButtonContainer1}>
                      <Pressable
                        style={[styles.button1, styles.cancelButton1]}
                        onPress={() => setDeleteModalVisible(false)}>
                        <Text style={styles.buttonText1}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.button, styles.deleteButton1]}
                        onPress={handleDelete}>
                        <Text style={styles.buttonText1}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Modal>
    </View>
  );

  return (
    <ScrollView style={{marginTop: 40}}>
      <Header title="Client Details" navigation={navigation} />

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddClientDetail')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Add Client Detail </Text>
          </View>
        </TouchableOpacity>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Client Name</Text>
        <Text style={[styles.headerCell,{marginLeft:100}]}>Company</Text>
        <Text style={[styles.headerCell,{marginLeft:140}]}>Email</Text>
        <Text style={[styles.headerCell,{marginLeft:140}]}>MobileNo</Text>
        <Text style={[styles.headerCell,{marginLeft:100}]}>Project Name</Text>
        <Text style={styles.headerCell}>Action</Text>
      </View>
      <FlatList
        data={currentItems}
        keyExtractor={item => item._id}
        renderItem={renderItem}
      />

      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage(currentPage - 1)}>
          <Text style={styles.pageBtn}>Previous</Text>
        </TouchableOpacity>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage(currentPage + 1)}>
          <Text style={styles.pageBtn}>Next</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeBtn}>Close</Text>
            </TouchableOpacity>
            {selectedProject?.project?.map((project, idx) => (
              <Text key={idx}>
                {idx + 1}. {project}
              </Text>
            ))}
          </View>
        </View>
      </Modal>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
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
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent:"space-between",
    // paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerCell: {
    // flex: 1,
    fontWeight: 'bold',
    // paddingHorizontal: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    color: '#4a4a4a',
  },
  openButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 20,
  },
  icon: {
    fontSize: 18,
    marginHorizontal: 6,
  },
  button: {
    color: '#000',
    backgroundColor: '#facc15',
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
  },
  edit: {
    color: 'blue',
    marginRight: 10,
  },
  delete: {
    color: 'red',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    alignItems: 'center',
  },
  pageBtn: {
    fontWeight: 'bold',
    color: 'blue',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  closeBtn: {
    color: 'red',
    textAlign: 'right',
    marginBottom: 10,
  },
  modalOverlay1: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    padding: 20,
  },
  modalContainer1: {
    width: '50%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 10,
  },
  modalText1: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer1: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button1: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton1: {
    backgroundColor: '#aaa',
  },
  deleteButton1: {
    backgroundColor: '#e53935',
  },
  buttonText1: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ClientDetails;
