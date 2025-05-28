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
  Alert,
} from 'react-native';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import Papa from 'papaparse';
import RNFS from 'react-native-fs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CheckBox from '@react-native-community/checkbox';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import ItemsPerPageSelector from '../components/ItemsPerPageSelector';
import {useFocusEffect} from '@react-navigation/native';

const WagesScreen = ({navigation}) => {
  const [data, setData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(15);
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
  const [currentItems, setCurrentItems] = useState([]);
  const [selectedEmployeesData, setSelectedEmployeesData] = useState([]);
  console.log('selectedEmployeesData>>', selectedEmployeesData);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  console.log('currentItemscurrentItems>>', currentItems, refreshKey);
  const currentItems1 = data
    .filter(item => {
      if (!searchTerm) return true;
      return (
        item.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  console.log('currentItemscurrentItems111111>>', currentItems1);

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

        const isValidDate = date => {
          const parsed = new Date(date);
          return parsed instanceof Date && !isNaN(parsed);
        };

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

    if (refreshKey == 1) {
      removeData();
    }
  }, [refreshKey]);
  const removeData = async key => {
    try {
      await AsyncStorage.removeItem('csvData');
      console.log(`Data with key '${key}' removed successfully.`);
    } catch (error) {
      console.log('Error removing data:', error);
    }
  };
  // const handleCSVUpload = async () => {
  //   try {
  //     const res = await DocumentPicker.pickSingle({
  //       type: [DocumentPicker.types.plainText],
  //     });

  //     const originalPath = res.uri.replace('file://', '');

  //     // Copy file to DocumentDirectory for safe access
  //     const destPath = `${RNFS.DocumentDirectoryPath}/uploaded.csv`;

  //     await RNFS.copyFile(originalPath, destPath);

  //     const fileContent = await RNFS.readFile(destPath, 'utf8');

  //     const parsed = Papa.parse(fileContent, {
  //       header: true,
  //       skipEmptyLines: true,
  //     });

  //     if (parsed.data && parsed.data.length > 0) {
  //       await AsyncStorage.setItem('csvData', JSON.stringify(parsed.data));
  //       setCurrentItems(parsed.data);
  //     }
  //   } catch (err) {
  //     if (!DocumentPicker.isCancel(err)) {
  //       console.error('CSV Upload Error:', err);
  //     }
  //   }
  // };
  const handleCSVUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.plainText],
      });

      const originalPath = res.uri.replace('file://', '');

      const destPath = `${RNFS.DocumentDirectoryPath}/uploaded.csv`;

      // 🔁 Remove existing file if it already exists
      const fileExists = await RNFS.exists(destPath);
      if (fileExists) {
        await RNFS.unlink(destPath);
      }

      // ✅ Now copy the new file
      await RNFS.copyFile(originalPath, destPath);

      const fileContent = await RNFS.readFile(destPath, 'utf8');

      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.data && parsed.data.length > 0) {
        await AsyncStorage.setItem('csvData', JSON.stringify(parsed.data));
        setCurrentItems(parsed.data);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('CSV Upload Error:', err);
      }
    }
  };

  useEffect(() => {
    const loadCSVData = async () => {
      const storedData = await AsyncStorage.getItem('csvData');
      if (storedData) {
        setCurrentItems(JSON.parse(storedData));
      }
    };
    loadCSVData();
  }, []);

  // const toggleSelectEmployee = item => {
  //   if (currentItems.length == 0) {
  //     toggleSelectEmployee1(item);
  //     return;
  //   } else {
  //     const exists = selectedEmployeesData.find(
  //       emp => emp['Employee Code'] === item['Employee Code'],
  //     );

  //     let updatedList;
  //     if (exists) {
  //       updatedList = selectedEmployeesData.filter(
  //         emp => emp['Employee Code'] !== item['Employee Code'],
  //       );
  //     } else {
  //       updatedList = [...selectedEmployeesData, item];
  //     }

  //     setSelectedEmployeesData(updatedList);

  //     // Sync "Select All" checkbox state
  //     if (updatedList.length === currentItems.length) {
  //       setSelectAll(true);
  //     } else {
  //       setSelectAll(false);
  //     }
  //   }
  // };

  // const toggleSelectAll = () => {
  //   if (currentItems.length == 0) {
  //     if (selectAll) {
  //       setSelectedEmployeesData([]);
  //       setSelectAll(false);
  //     } else {
  //       setSelectedEmployeesData(currentItems1);
  //       setSelectAll(true);
  //     }
  //   } else {
  //     if (selectAll) {
  //       setSelectedEmployeesData([]);
  //       setSelectAll(false);
  //     } else {
  //       setSelectedEmployeesData(currentItems);
  //       setSelectAll(true);
  //     }
  //   }
  // };

  // const toggleSelectEmployee1 = item => {
  //   console.log('item', item);
  //   const exists = selectedEmployeesData?.find(
  //     emp => emp?.empCode === item?.empCode, // Using empCode which matches your data
  //   );

  //   let updatedList;
  //   if (exists) {
  //     updatedList = selectedEmployeesData?.filter(
  //       emp => emp?.empCode !== item?.empCode, // Fix here: use !== to remove the item
  //     );
  //   } else {
  //     updatedList = [...selectedEmployeesData, item];
  //   }
  //   setSelectedEmployeesData(updatedList);

  //   // Sync "Select All" checkbox state
  //   if (updatedList.length === currentItems1.length) {
  //     setSelectAll(true);
  //   } else {
  //     setSelectAll(false);
  //   }
  // };

  const getEmpCode = item => item.empCode || item['Employee Code'];

  const toggleSelectEmployee = item => {
    const code = getEmpCode(item);
    if (currentItems.length == 0) {
      toggleSelectEmployee1(item);
      return;
    } else {
      const exists = selectedEmployeesData.find(
        emp => getEmpCode(emp) === code,
      );

      let updatedList;
      if (exists) {
        updatedList = selectedEmployeesData.filter(
          emp => getEmpCode(emp) !== code,
        );
      } else {
        updatedList = [...selectedEmployeesData, item];
      }

      setSelectedEmployeesData(updatedList);

      const source = currentItems.length > 0 ? currentItems : currentItems1;
      if (updatedList.length === source.length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
    }
  };

  const toggleSelectEmployee1 = item => {
    const code = getEmpCode(item);

    const exists = selectedEmployeesData.find(emp => getEmpCode(emp) === code);

    let updatedList;
    if (exists) {
      updatedList = selectedEmployeesData.filter(
        emp => getEmpCode(emp) !== code,
      );
    } else {
      updatedList = [...selectedEmployeesData, {...item, empCode: code}];
    }

    setSelectedEmployeesData(updatedList);

    if (updatedList.length === currentItems1.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const toggleSelectAll = () => {
    const source = currentItems.length > 0 ? currentItems : currentItems1;

    if (selectAll) {
      setSelectedEmployeesData([]);
      setSelectAll(false);
    } else {
      setSelectedEmployeesData(source);
      setSelectAll(true);
    }
  };

  const sendEmail = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('tokentoken', token);
    if (selectedEmployeesData?.length == 0) {
      Alert.alert(
        'No Employees Selected',
        'Please select at least one employee to send mail.',
        [{text: 'OK'}],
      );
      return;
    }

    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        selectedEmployees: selectedEmployeesData.map(emp => ({
          employeeId:
            emp.empCode || emp['Employee Code'] || emp.employeeId || '',
          name: emp.empName || emp['Employee Name'] || emp.empName || '',
          fatherName:
            emp.familyMember || emp['F/H Name'] || emp.fatherName || '',
          email: emp.email || emp.Email || '', // Make sure email is present in CSV or data
          dateOfJoining:
            emp.dateOfJoining || emp['Date of Joining'] || emp.chooseDate || '',
          department: emp.department || 'dev',
          designation: emp.designation || 'cdd',
          companyName: emp.companyName || emp['Company Name'] || '',
          grossSalary: Number(emp.grossSalary || emp['Gross Salary'] || 0),
          basics: Number(emp.basics || emp['Basics'] || 0),
          medical: Number(emp.med || emp['Med.'] || 0),
          childEduAllowance: Number(
            emp.childEduAllowance || emp['children education allowance'] || 0,
          ),
          houseRentAllowance: Number(
            emp.houseRentAllowance || emp['House Rent allowance'] || 0,
          ),
          conveyenceAllowance: Number(
            emp.conveyenceAllowance || emp['Conveyence allowance'] || 0,
          ),
          otherEarning: Number(emp.otherEarning || emp['other earning'] || 0),
          arrear: Number(emp.arrear || emp['Arrear'] || 0),
          reimbursement: Number(emp.reimbursement || emp['Reimbusrement'] || 0),
          netSalary: Number(emp.netsalary || emp['Net salary'] || 0),
          totalLeaves: Number(emp.totalLeaves || emp['Total Leaves'] || 0),
          quarterlyLeavesTaken: Number(
            emp.quarterlyLeavesTaken || emp['Quarterly Leaves Taken'] || 0,
          ),
          leavesRemaining: Number(emp.leavesRemaining || 0),
          date: emp.chooseDate || emp.Date || emp['Choose Date'],
        })),
      };
      console.log('payloadpayload', payload);
      const response = await axios.post(
        `${REACT_APP_API_BASE_URL}/api/excel/send-email`,
        payload,
        {headers},
      );

      if (response.data) {
        Alert.alert(
          'success',
          `Successfully sent emails to ${selectedEmployeesData.length} employees.`,
        );
        await AsyncStorage.removeItem('csvData');
        setSelectedEmployeesData([]);
        setRefreshKey(prev => prev + 1);
        navigation.replace('Wages');
      } else {
        Alert.alert('error', 'Failed to send emails.');
      }
    } catch (error) {
      console.error(
        'Error sending mails:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error occurred while sending mails.',
      );
    } finally {
      setLoading(false);
    }
  };
  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={{transform: [{scale: 0.8}], marginBottom:10}}>
        <CheckBox value={selectAll} onValueChange={toggleSelectAll} />
        {/* <Text>Select All</Text> */}
      </View>
      <Text style={[styles.headerText, {paddingLeft: 40}]}>DATE</Text>
      <Text style={[styles.headerText, {paddingLeft: 70}]}>EMP. NAME</Text>
      <Text style={[styles.headerText, {paddingLeft: 40}]}>F/H NAME</Text>
      <Text style={[styles.headerText, {paddingLeft: 50}]}>DEPT.</Text>
      <Text style={[styles.headerText, {paddingLeft: 60}]}>DESIGNATION</Text>
      <Text style={[styles.headerText, {paddingLeft: 30}]}>CODE</Text>
      <Text style={[styles.headerText, {paddingLeft: 60}]}>COMPANY</Text>
      <Text style={[styles.headerText, {paddingLeft: 50}]}>RS</Text>
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
  const resetData = () => {
    setEndDate(null);
    setStartDate(null);
  };
  const handleNavigate = item => {
    navigation.navigate('WagesPdf', {
      wagesPdfId: item._id, // or item._id depending on your data structure
    });
  };

  const renderItem = ({item}) => {
    const isSelected = selectedEmployeesData.some(
      emp => emp['Employee Code'] === item['Employee Code'],
    );
    const isSelected1 = selectedEmployeesData.some(
      emp => emp?.empCode === item?.empCode,
    );
    const chooseDate = item['Choose Date'];
    const employeeName = item['Employee Name'];
    const familyMember = item['F/H Name'];
    const department = item['Department'];
    const designation = item['Designation'];
    const empCode = item['Employee Code'];
    const companyName = item['Company Name'];
    const netsalary = item['Net salary'];
    const _id = `${item['Employee Code']}-${Math.random()}`;
    return (
      <View style={styles.row}>
        <View style={{transform: [{scale: 0.8}]}}>
          <CheckBox
            value={currentItems == 0 ? isSelected1 : isSelected}
            onValueChange={() => toggleSelectEmployee(item)}
          />
        </View>
        <Text style={styles.cell}>
          {chooseDate  || item.chooseDate}
        </Text>
        <Text style={styles.cell}>{employeeName || item.empName}</Text>
        <Text style={styles.cell}>
          {familyMember  || item.familyMember}
        </Text>
        <Text style={styles.cell}>
          {department || item.department}
        </Text>
        <Text style={styles.cell}>
          {designation  || item.designation}
        </Text>
        <Text style={styles.cell}>{empCode || item.empCode}</Text>
        <Text style={styles.cell}>{companyName || item.companyName}</Text>
        <Text style={styles.cell}>{netsalary || item.netsalary}</Text>

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
  };

  return (
    <View style={{marginTop: 20, padding: 16}}>
      <Header title="Wages" navigation={navigation} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.addButton} onPress={sendEmail}>
          <View style={styles.buttonContent}>
            <Text style={styles.addButtonText}> Send Mail </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleCSVUpload}>
          <View style={styles.buttonContent}>
            <Text style={styles.addButtonText}>+ Import csv </Text>
          </View>
        </TouchableOpacity>
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
          style={[styles.addButton, {width: '10%'}]}
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
        data={currentItems?.length == 0 ? currentItems1 : currentItems}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: 'gray'}}>
            Data not found
          </Text>
        }
      />

      {/* {currentItems.length !== 0 && (
        <View style={styles.pagination}>
          {[...Array(totalPages)].map((_, index) => (
            <TouchableOpacity key={index} onPress={() => paginate(index + 1)}>
              <Text style={styles.pageButton}>{index + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} */}

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
        <ItemsPerPageSelector
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'flex-end',
  },
  heading: {fontSize: 24, fontWeight: 'bold', marginBottom: 10},
  headerRow: {flexDirection: 'row', backgroundColor: '#e5e7eb', padding: 10},
  headerText: {fontWeight: 'bold', color: '#111827', fontSize: 12},
  addButton: {
    display: 'flex',
    backgroundColor: 'blue',
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end', // aligns left
    width: '15%',
    marginVertical: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  // pagination: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   marginVertical: 10,
  // },
  // pageButton: {
  //   marginHorizontal: 6,
  //   fontSize: 16,
  //   color: 'blue',
  // },
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

export default WagesScreen;
