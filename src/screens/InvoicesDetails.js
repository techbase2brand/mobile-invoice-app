import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Button,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProjectList = ({navigation}) => {
  const options = [
    {label: 'Select date range', value: ''},
    {label: 'Last 1 week', value: '7'},
    {label: 'Last 1 month', value: '30'},
    {label: 'Last 3 months', value: '90'},
    {label: 'Last 6 months', value: '180'},
    {label: 'Last 1 year', value: '365'},
  ];

  const paymentOptions = [
    {label: 'Payment status', value: ''},
    {label: 'Paid', value: 'paid'},
    {label: 'Unpaid', value: 'unpaid'},
    {label: 'Draft', value: 'draft'},
  ];

  const duplicateOptions = [
    {label: 'Filter by Duplicate Status', value: ''},
    {label: 'Duplicated', value: 'Duplicated'},
    {label: 'Not Duplicated', value: ''}, // Keeping "" for Not Duplicated as per your original code
  ];
  const [invoices, setInvoices] = useState([]);
  const [selectedDays, setSelectedDays] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState('');
  const [duplicateFilter, setDuplicateFilter] = useState('');
  const [openItemId, setOpenItemId] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'payment' | 'duplicate' | null

  const itemsPerPage = 15;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);

  // Date picker handlers
  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);

  const handleStartDateConfirm = date => {
    setStartDate(date);
    hideStartDatePicker();
  };

  const handleEndDateConfirm = date => {
    setEndDate(date);
    hideEndDatePicker();
  };
  const handleToggleDropdown = itemId => {
    if (openItemId === itemId) {
      setOpenItemId(null);
    } else {
      setOpenItemId(itemId);
    }
  };

  const handleSort = columnName => {
    if (sortColumn === columnName) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortOrder('asc');
    }
  };

  const sortedItems = currentItems.sort((a, b) => {
    if (sortColumn === 'clientName') {
      return sortOrder === 'asc'
        ? a.clientName.localeCompare(b.clientName)
        : b.clientName.localeCompare(a.clientName);
    } else if (sortColumn === 'company') {
      return sortOrder === 'asc'
        ? a.company.localeCompare(b.company)
        : b.company.localeCompare(a.company);
    }
    return sortOrder === 'asc'
      ? a.clientName.localeCompare(b.clientName)
      : b.clientName.localeCompare(a.clientName);
  });

  const paginate = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const handleStartDateChange = date => {
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    setEndDate(date);
  };
  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDuplicate = async duplicateId => {
    console.log('duplicateIdduplicateId', duplicateId);
    const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    const invoiceToDuplicate = invoices.find(item => item._id === duplicateId);
    if (invoiceToDuplicate) {
      const duplicatedInvoice = {...invoiceToDuplicate};
      delete duplicatedInvoice._id;
      duplicatedInvoice.selectDate = new Date().toISOString();
      duplicatedInvoice.duplicate = 'Duplicated';
      axios
        .post(
          `${REACT_APP_API_BASE_URL}/api/add-clientBank`,
          duplicatedInvoice,
          {headers},
        )
        .then(response => {
          fetchInvoices();
        })
        .catch(error => {
          console.error('Error duplicating invoice:', error);
        });
    }
  };
  const resetData = () => {
    setEndDate(null);
    setStartDate(null);
  };
  const fetchInvoices = async () => {
    const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    let apiUrl = `${REACT_APP_API_BASE_URL}/api/get-invoices`;
    let fromDate;
    if (selectedDays) {
      fromDate = new Date();
      switch (selectedDays) {
        case '7':
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case '30':
          fromDate.setMonth(fromDate.getMonth() - 1);
          break;
        case '90':
          fromDate.setMonth(fromDate.getMonth() - 3);
          break;
        case '180':
          fromDate.setMonth(fromDate.getMonth() - 6);
          break;
        case '365':
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
        default:
          break;
      }
      const formattedFromDate = `${fromDate
        .getDate()
        .toString()
        .padStart(2, '0')}/${(fromDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${fromDate.getFullYear()}`;
      apiUrl += `?fromDate=${formattedFromDate}`;
    }
    if (paymentStatus) {
      apiUrl += apiUrl.includes('?')
        ? `&paymentStatus=${paymentStatus}`
        : `?paymentStatus=${paymentStatus}`;
    }

    if (startDate && endDate) {
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      apiUrl += apiUrl.includes('?')
        ? `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        : `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
    }

    axios
      .get(apiUrl, {headers})
      .then(response => {
        const filteredData = response?.data?.data?.filter(item => {
          const invoiceDate = new Date(item.selectDate);
          const selectDate = new Date(item.selectDate);
          return (
            (!searchTerm ||
              item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.accNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.bankNamed.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.mobileNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.tradeName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) &&
            (!selectedDays || invoiceDate >= fromDate) &&
            (!startDate || invoiceDate >= startDate) &&
            (!endDate || selectDate <= endDate) &&
            (!duplicateFilter || item.duplicate === duplicateFilter)
          );
        });
        setInvoices(filteredData.reverse());
      })
      .catch(error => {
        console.error('Error fetching invoices:', error);
      });
  };

  const handleDelete = deleteId => {
    const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    const apiUrl = `${REACT_APP_API_BASE_URL}/api/delete-invoice/${deleteId}`;
    axios.delete(apiUrl, {headers});
    setInvoices(invoices.filter(item => item._id !== deleteId));
  };

  const handleSelectChange = value => {
    setSelectedDays(value);
    setModalVisible(false);
  };

  const handleSelect = (type, value) => {
    if (type === 'payment') {
      setPaymentStatus(value);
    } else if (type == 'duplicate') {
      setDuplicateFilter(value);
    }
    setActiveModal(null);
  };

  const handleSearch = () => {
    fetchInvoices();
  };

  const renderOptions = (type, options) => (
    <FlatList
      data={options}
      keyExtractor={(item, index) => item.label + index}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.option}
          onPress={() => handleSelect(type, item.value)}>
          <Text style={styles.optionText}>{item.label}</Text>
        </TouchableOpacity>
      )}
    />
  );

  const handlePaymentStatusChange = e => {
    setPaymentStatus(e.target.value);
  };
  const paidInvoicesLength = invoices.filter(
    item => item.paymentStatus === 'paid',
  ).length;
  const unpaidInvoicesLength = invoices.filter(
    item => item.paymentStatus === 'unpaid',
  ).length;
  const draftInvoicesLength = invoices.filter(
    item => item.paymentStatus === 'draft',
  ).length;
  const totalAUD = invoices.filter(item => item.currency === 'AUD').length;
  const totalCAD = invoices.filter(item => item.currency === 'CAD').length;
  const totalINR = invoices.filter(item => item.currency === 'INR').length;
  const totalUSD = invoices.filter(item => item.currency === 'USD').length;
  const DuplicateData = invoices.filter(
    item => item.duplicate === 'Duplicated',
  ).length;

  const totalAUDCr = invoices
    .filter(item => item.currency === 'AUD' && item.amount !== '')
    .reduce((total, item) => total + parseFloat(item.amount), 0);

  const totalCADCr = invoices
    .filter(item => item.currency === 'CAD' && item.amount !== '')
    .reduce((total, item) => total + parseFloat(item.amount), 0);

  const totalINRCr = invoices
    .filter(item => item.currency === 'INR' && item.amount !== '')
    .reduce((total, item) => total + parseFloat(item.amount), 0);

  const totalUSDCr = invoices
    .filter(item => item.currency === 'USD' && item.amount !== '')
    .reduce((total, item) => total + parseFloat(item.amount), 0);

  const getStatusColor = paymentStatus => {
    switch (paymentStatus) {
      case 'paid':
        return 'paid-row';
      case 'unpaid':
        return 'unpaid-row';
      default:
        return '';
    }
  };

  console.log('dudfff', duplicateFilter);
  // Rest of your existing logic (fetchInvoices, handleDelete, handleDuplicate, sorting, etc.)
  // Keep 23 the business logic functions same as original, just update the JSX to React Native components

  const renderItem = ({item, index}) => {
    const backgroundColor = index % 2 !== 0 ? '#e9e9e9' : '#fff';
    return (
      <View style={[styles.itemContainer, {backgroundColor}]}>
        <View style={styles.row}>
          <Text style={styles.cell}>{item.client || 'N/A'}</Text>
          <Text style={styles.cell}>{item.company || 'N/A'}</Text>
          <Text style={styles.cell}>{item.paymentStatus || 'N/A'}</Text>
          <Text style={styles.cell}>{item.bankNamed || 'N/A'}</Text>
          <Text style={styles.cell}>{item.accNo || 'N/A'}</Text>
          <Text style={styles.cell}>
            {item?.duplicate && (
              <Text style={styles.duplicateBadge}>{item.duplicate}</Text>
            )}
          </Text>
          <Text style={styles.cell}>
            {item?.selectDate
              ? new Date(item.selectDate).toLocaleDateString()
              : 'N/A'}
          </Text>
          <TouchableOpacity onPress={() => handleToggleDropdown(item._id)}>
            <Text style={styles.actionButton}>...</Text>
          </TouchableOpacity>
        </View>

        {openItemId === item._id && (
          <View style={styles.actionMenu}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CreateInvoice', {invoiceId: item._id})
              }
              style={styles.menuItem}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={styles.menuItem}>
              <Text>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Invoice', {invoiceId: item._id})
              }
              style={styles.menuItem}>
              <Text>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDuplicate(item._id)}
              style={styles.menuItem}>
              <Text>Duplicate</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{marginTop: 20}}>
      <Header title="Invoices Details" navigation={navigation} />
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateInvoice')}>
          <View style={styles.buttonContent}>
            <Icon name="file-text-o" size={16} color="#fff" />
            <Text style={styles.addButtonText}> Create Invoices</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.header}>
          {/* Add your statistics rows here using Text components */}
          <Text style={{fontWeight: 'bold'}}>Invoices: {invoices.length}</Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 14,
              marginTop: 10,
            }}>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Paid:</Text>{' '}
              {paidInvoicesLength}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Unpaid:</Text>{' '}
              {unpaidInvoicesLength}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Draft:</Text>{' '}
              {draftInvoicesLength}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>AUD:</Text> {totalAUD}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>CAD:</Text> {totalCAD}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>INR:</Text> {totalINR}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>USD:</Text> {totalUSD}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 14,
              marginTop: 10,
            }}>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Total Amount:</Text>
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>AUD:</Text> {totalAUDCr}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>CAD:</Text> {totalCADCr}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>INR:</Text> {totalINRCr}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>USD:</Text> {totalUSDCr}
            </Text>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          <TouchableOpacity
            style={styles.selector}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.selectorText}>
              {options.find(opt => opt.value === selectedDays)?.label ||
                'Select date range'}
            </Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setModalVisible(false)}>
              <View style={styles.modalContent}>
                <FlatList
                  data={options}
                  keyExtractor={item => item.value}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => handleSelectChange(item.value)}>
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Payment Status Selector */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setActiveModal('payment')}>
            <Text style={styles.selectorText}>
              {paymentOptions.find(opt => opt.value === paymentStatus)?.label ||
                'Payment status'}
            </Text>
          </TouchableOpacity>

          {/* Duplicate Filter Selector */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setActiveModal('duplicate')}>
            <Text style={styles.selectorText}>
              {duplicateFilter === 'Duplicated'
                ? 'Duplicated'
                : duplicateFilter == 'Not Duplicated'
                ? 'Not Duplicated'
                : 'Filter by Duplicate Status'}
            </Text>
          </TouchableOpacity>

          {/* Shared Modal */}
          <Modal
            transparent
            animationType="fade"
            visible={!!activeModal}
            onRequestClose={() => setActiveModal(null)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setActiveModal(null)}>
              <View style={styles.modalContent}>
                {activeModal === 'payment' &&
                  renderOptions('payment', paymentOptions)}
                {activeModal === 'duplicate' &&
                  renderOptions('duplicate', duplicateOptions)}
              </View>
            </TouchableOpacity>
          </Modal>
          {/* Date Range Picker */}
          <View style={styles.datePickerContainer}>
            <TouchableOpacity
              onPress={showStartDatePicker}
              style={styles.dateButton}>
              <Text>
                {startDate
                  ? startDate.toLocaleDateString()
                  : 'Select Start Date'}
              </Text>
            </TouchableOpacity>
            <Text> to </Text>
            <TouchableOpacity
              onPress={showEndDatePicker}
              style={styles.dateButton}>
              <Text>
                {endDate ? endDate.toLocaleDateString() : 'Select End Date'}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={hideStartDatePicker}
          />

          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={hideEndDatePicker}
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={styles.button}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Go</Text>
          </TouchableOpacity>
          {/* Add other filter components (selects) using TouchableOpacity + Modal */}
        </View>
        <TouchableOpacity
          style={[styles.addButton, {width: '10%'}]}
          onPress={resetData}>
          <View style={styles.buttonContent}>
            <Text style={styles.addButtonText}> Reset</Text>
          </View>
        </TouchableOpacity>

        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text
            style={styles.headerCell}
            onPress={() => handleSort('clientName')}>
            Client Name{' '}
            {sortColumn == 'clientName' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
          <Text style={[styles.headerCell, {paddingLeft: 40}]}>Company </Text>
          <Text style={[styles.headerCell, {paddingLeft: 80}]}>Status</Text>
          <Text style={[styles.headerCell, {paddingLeft: 80}]}>Bank Name</Text>
          <Text style={[styles.headerCell, {paddingLeft: 80}]}>Acc. No</Text>
          <Text style={[styles.headerCell, {paddingLeft: 40}]}>Amount</Text>
          <Text style={[styles.headerCell, {paddingLeft: 40}]}>Original</Text>
          <Text style={[styles.headerCell, {paddingLeft: 40}]}>Date</Text>
          <Text style={[styles.headerCell, {paddingLeft: 60}]}>Action</Text>
        </View>
        {/* List of Items */}
        <FlatList
          data={sortedItems}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}>
            <Text>Previous</Text>
          </TouchableOpacity>
          <Text>
            {currentPage} of {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    width: '10%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  // headerRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   // gap:30,
  //   paddingVertical: 8,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#ccc',
  // },
  // headerCell: {
  //   fontWeight: 'bold',
  //   flex: 1,
  // },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    // justifyContent: 'space-between',
  },
  headerCell: {
    // flex: 1, // adjust width here
    fontWeight: 'bold',
    textAlign: 'center',
    // paddingLeft:40
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  cell: {
    flex: 1,
  },
  actionButton: {
    padding: 8,
  },
  actionMenu: {
    backgroundColor: '#fff',
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 16,
  },
  duplicateBadge: {
    backgroundColor: 'purple',
    color: 'white',
    padding: 4,
    borderRadius: 4,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  selectorText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    elevation: 5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1D4ED8', // blue-700
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
});

export default ProjectList;
