import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome';;
import { REACT_APP_API_BASE_URL } from '../constans/Constants';
import Header from '../components/Header';

const BankDetails = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Set how many items per page you want
  const totalPages = Math.ceil(data.length / itemsPerPage);
console.log("datadata",data);
  // Function to paginate data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const apiUrl = `${REACT_APP_API_BASE_URL}/api/bank-data`;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        const response = await axios.get(apiUrl, { headers });
        setData(response.data.data.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      await axios.delete(`${REACT_APP_API_BASE_URL}/api/delete-detail/${id}`, { headers });
      setData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

 

  return (
    <View style={{ marginTop: 40 }}>
      <Header title="Bank Detail" navigation={navigation} />
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Icon name="trash" size={20} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButton}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageText}>{`Page ${currentPage} of ${totalPages}`}</Text>
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageButton}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
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
  });
  
  export default BankDetails;
  
