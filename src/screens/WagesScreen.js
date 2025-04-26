import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';

const WagesScreen = ({navigation}) => {
  const [data, setData] = useState([]);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDays, setSelectedDays] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = data
    .filter(item => {
      if (!searchTerm) return true;
      return (
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.familyMember?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.empCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter(item => {
      if (!selectedDays) return true;
      const today = new Date();
      let cutoffDate = new Date(today);
      switch (selectedDays) {
        case '7':
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case '30':
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
        case '90':
          cutoffDate.setMonth(cutoffDate.getMonth() - 3);
          break;
        case '180':
          cutoffDate.setMonth(cutoffDate.getMonth() - 6);
          break;
        case '365':
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          break;
        default:
          return true;
      }
      const chooseDate = new Date(item.chooseDate);
      return chooseDate <= today && chooseDate >= cutoffDate;
    })
    .filter(item => {
      if (!startDate || !endDate) return true;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const chooseDate = new Date(item.chooseDate);
      return chooseDate >= start && chooseDate <= end;
    })
    .slice(indexOfFirstItem, indexOfLastItem);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const apiUrl = `${REACT_APP_API_BASE_URL}/api/get-wages`;

      try {
        const response = await axios.get(apiUrl, {headers});
        console.log('responseresponse', response?.data?.data);

        const isValidDate = date => {
          const parsed = new Date(date);
          return parsed instanceof Date && !isNaN(parsed);
        };

        // const wagesData = response?.data?.data.map(item => {
        //   return {
        //     ...item,
        //     chooseDate: item?.chooseDate
        //       ? new Date(item?.chooseDate).toISOString().split('T')[0]
        //       : 'Invalid Date',
        //     joinDate: item?.joinDate
        //       ? new Date(item?.joinDate).toISOString().split('T')[0]
        //       : 'Invalid Date',
        //     companylogo: item?.companylogo
        //       ? `${REACT_APP_API_BASE_URL}${item?.companylogo}`
        //       : '',
        //   };
        // });
        const wagesData = response?.data?.data.map(item => {
          return {
            ...item,
            chooseDate: isValidDate(item?.chooseDate)
              ? new Date(item?.chooseDate).toISOString().split('T')[0]
              : 'Invalid Date',
            joinDate: isValidDate(item?.joinDate)
              ? new Date(item?.joinDate).toISOString().split('T')[0]
              : 'Invalid Date',
            companylogo: item?.companylogo
              ? `${REACT_APP_API_BASE_URL}${item?.companylogo}`
              : '',
          };
        });
        setData(wagesData.reverse());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerText, {paddingLeft: 0}]}>DATE</Text>
      <Text style={[styles.headerText, {paddingLeft: 70}]}>EMP. NAME</Text>
      <Text style={[styles.headerText, {paddingLeft: 40}]}>F/H NAME</Text>
      <Text style={[styles.headerText, {paddingLeft: 50}]}>DEPT.</Text>
      <Text style={[styles.headerText, {paddingLeft: 60}]}>DESIGNATION</Text>
      <Text style={[styles.headerText, {paddingLeft: 30}]}>CODE</Text>
      <Text style={[styles.headerText, {paddingLeft: 60}]}>COMPANY</Text>
      <Text style={[styles.headerText, {paddingLeft: 80}]}>RS</Text>
      <Text style={[styles.headerText, {paddingLeft: 100}]}>CREATE</Text>
    </View>
  );
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
      await axios.delete(`${REACT_APP_API_BASE_URL}/api/delted-wages/${id}`, {
        headers,
      });
      setData(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = item => {
    navigation.navigate('AddWagesForm', {
      wagesId: item._id, // or item._id depending on your data structure
    });
  };
 const resetData =()=>{
  setEndDate(null)
  setStartDate(null)
 }
  const handleNavigate = item => {
    navigation.navigate('WagesPdf', {
      wagesPdfId: item._id, // or item._id depending on your data structure
    });
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.chooseDate || 'Invalid Date'}</Text>
      <Text style={styles.cell}>{item.employeeName}</Text>
      <Text style={styles.cell}>{item.familyMember || 'N/A'}</Text>
      <Text style={styles.cell}>{item.department || 'N/A'}</Text>
      <Text style={styles.cell}>{item.designation || 'N/A'}</Text>
      <Text style={styles.cell}>{item.empCode}</Text>
      <Text style={styles.cell}>{item.companyName}</Text>
      <Text style={styles.cell}>{item.netsalary}</Text>

      <TouchableOpacity onPress={() => handleEdit(item)}>
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

      <TouchableOpacity onPress={() => handleNavigate(item)}>
        <Text style={styles.pdfButton}>pdf</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={{marginTop: 20, padding: 16}}>
      <Header title="Wages" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddWagesForm')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Create Wages</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'row', gap: 20}}>
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.dropdown}>
          <Text>
            {selectedDays ? `Last ${selectedDays} days` : 'Select date range'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide">
          <View style={styles.modalView}>
            <TouchableOpacity
              onPress={() => {
                setSelectedDays(''); 
                setModalVisible(false);
              }}>
              <Text style={styles.modalItem}>Select Date Range</Text>
            </TouchableOpacity>
            {['7', '30', '90', '180', '365']?.map(days => (
              <TouchableOpacity
                key={days}
                onPress={() => {
                  setSelectedDays(days);
                  setModalVisible(false);
                }}>
                <Text style={styles.modalItem}>Last {days} days</Text>
              </TouchableOpacity>
            ))}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>

        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => setStartDatePickerVisibility(true)}>
            <Text style={styles.datePickerText}>
              {startDate ? startDate.toDateString() : 'Start Date'}
            </Text>
          </TouchableOpacity>
          <Text>to</Text>
          <TouchableOpacity onPress={() => setEndDatePickerVisibility(true)}>
            <Text style={styles.datePickerText}>
              {endDate ? endDate.toDateString() : 'End Date'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addButton, {width:"10%"}]}
          onPress={resetData}>
          <View style={styles.buttonContent}>
            <Text style={styles.addButtonText}> Reset</Text>
          </View>
        </TouchableOpacity>
      </View>
   
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={date => {
          setStartDate(date);
          setStartDatePickerVisibility(false);
        }}
        onCancel={() => setStartDatePickerVisibility(false)}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={date => {
          setEndDate(date);
          setEndDatePickerVisibility(false);
        }}
        onCancel={() => setEndDatePickerVisibility(false)}
      />
      {renderHeader()}
      <FlatList
        data={currentItems}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: 'gray'}}>
            Data not found
          </Text>
        }
      />

      {currentItems.length !== 0 && (
        <View style={styles.pagination}>
          {[...Array(totalPages)].map((_, index) => (
            <TouchableOpacity key={index} onPress={() => paginate(index + 1)}>
              <Text style={styles.pageButton}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10},
  heading: {fontSize: 24, fontWeight: 'bold', marginBottom: 10},
  headerRow: {flexDirection: 'row', backgroundColor: '#e5e7eb', padding: 10},
  headerText: {fontWeight: 'bold', color: '#111827', fontSize: 12},
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
  subHeading: {fontSize: 18, marginVertical: 10},
  input: {borderWidth: 1, padding: 8, marginBottom: 10, width: '20%'},
  dropdown: {borderWidth: 1, padding: 10, marginBottom: 10, width: '20%'},
  modalView: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 40,
    marginVertical: 100,
    borderRadius: 10,
  },
  modalItem: {padding: 10},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  datePickerText: {borderWidth: 1, padding: 10},
  itemContainer: {padding: 10, borderBottomWidth: 1, borderColor: '#ccc'},
  deleteText: {color: 'red', marginTop: 5},
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 5,
    color: '#555',
  },
  actionIcon: {
    marginHorizontal: 5,
    fontSize: 18,
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
    marginVertical: 10,
  },
  pageButton: {
    marginHorizontal: 6,
    fontSize: 16,
    color: 'blue',
  },
});

export default WagesScreen;
