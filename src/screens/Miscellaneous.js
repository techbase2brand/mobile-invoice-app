import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';

const Miscellaneous = () => {
  const [data, setData] = useState([]);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const navigation = useNavigation();

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
      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/api/get-letter`,
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

  const paginate = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async id => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      await axios.delete(`${REACT_APP_API_BASE_URL}/api/delete-letter/${id}`, {
        headers,
      });
      setData(data.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.userName}</Text>
      <Text style={styles.cell}>{item.refNo}</Text>
      <Text style={styles.cell}>{item.letterHeadDate}</Text>
      <View style={[styles.cell, styles.actionCell]}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('MiscellaneousForm', {latterId: item._id})
          }>
          <Icon name="edit" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <FAIcon name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('LetterPdf', {latterId: item._id})
        }>
        <Text style={styles.pdfButton}>PDF</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={{marginTop: 20}}>
      <Header title="Letter Head Title" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MiscellaneousForm')}>
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
          data={currentItems}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => paginate(currentPage - 1)}>
            <Text style={styles.paginationButton}>Previous</Text>
          </TouchableOpacity>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() => paginate(currentPage + 1)}>
            <Text style={styles.paginationButton}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  //   row: {
  //     flexDirection: 'row',
  //     paddingVertical: 12,
  //     borderBottomWidth: 1,
  //     borderBottomColor: '#ccc',
  //     alignItems: 'center',
  //   },
  //   cell: {
  //     flex: 1,
  //     fontSize: 14,
  //   },
  //   actionRow: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-between',
  //   },
  //   actionText: {
  //     color: 'blue',
  //     marginHorizontal: 8,
  //   },
  //   pdfButton: {
  //     color: 'green',
  //     fontWeight: 'bold',
  //   },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 10,
  },
  paginationButton: {
    color: '#007AFF',
    fontWeight: '600',
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
    color: 'green',
    fontWeight: 'bold',
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

export default Miscellaneous;
