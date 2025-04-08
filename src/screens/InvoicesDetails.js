import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
// import DatePicker from 'react-native-date-picker';
import axios from 'axios';

import DateTimePicker from '@react-native-community/datetimepicker'; // Use any DatePicker lib
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_API_BASE_URL } from '../constans/Constants';
// import { Picker } from '@react-native-picker/picker';

const InvoicesDetails = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedDays, setSelectedDays] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [itemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState('');
  const [duplicateFilter, setDuplicateFilter] = useState("");
  const [openItemId, setOpenItemId] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef(null);
  const handleToggleDropdown = (itemId) => {
      if (openItemId === itemId) {
          setOpenItemId(null);
      } else {
          setOpenItemId(itemId);
      }
  };

  // useEffect(() => {
  //     function handleClickOutside(event) {
  //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //             setIsOpen(false);
  //         }
  //     }
  //     document.addEventListener('click', handleClickOutside);
  //     return () => {
  //         document.removeEventListener('click', handleClickOutside);
  //     };
  // }, []);

  const handleSort = (columnName) => {
      if (sortColumn === columnName) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
          setSortColumn(columnName);
          setSortOrder('asc');
      }
  };

  const sortedItems = currentItems.sort((a, b) => {
      if (sortColumn === 'clientName') {
          return sortOrder === 'asc' ? a.clientName.localeCompare(b.clientName) : b.clientName.localeCompare(a.clientName);
      } else if (sortColumn === 'company') {
          return sortOrder === 'asc' ? a.company.localeCompare(b.company) : b.company.localeCompare(a.company);
      }
      return sortOrder === 'asc' ? a.clientName.localeCompare(b.clientName) : b.clientName.localeCompare(a.clientName);
  });
  console.log("sortedItems", sortedItems)

  const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
  };

  const handleStartDateChange = (date) => {
      setStartDate(date);
  };

  const handleEndDateChange = (date) => {
      setEndDate(date);
  };
  useEffect(() => {
      fetchInvoices();
  }, []);

  const handleDuplicate = (duplicateId) => {
      const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
          'Authorization': `Bearer ${token}`,  // Use the token from localStorage
          'Content-Type': 'application/json',  // Add any other headers if needed
      };
      const invoiceToDuplicate = invoices.find((item) => item._id === duplicateId);
      if (invoiceToDuplicate) {
          const duplicatedInvoice = { ...invoiceToDuplicate };
          delete duplicatedInvoice._id;
          duplicatedInvoice.selectDate = new Date().toISOString();
          duplicatedInvoice.duplicate = "Duplicated";
          axios.post(`${REACT_APP_API_BASE_URL}/api/add-clientBank`, duplicatedInvoice, { headers })
              .then(response => {
                  fetchInvoices();
              })
              .catch(error => {
                  console.error('Error duplicating invoice:', error);
              });
      }
  };

  const fetchInvoices = () => {
      const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
          'Authorization': `Bearer ${token}`,  // Use the token from localStorage
          'Content-Type': 'application/json',  // Add any other headers if needed
      };
      let apiUrl = `${REACT_APP_API_BASE_URL}/api/get-invoices`;
      let fromDate;
      if (selectedDays) {
          fromDate = new Date();
          switch (selectedDays) {
              case "7":
                  fromDate.setDate(fromDate.getDate() - 7);
                  break;
              case "30":
                  fromDate.setMonth(fromDate.getMonth() - 1);
                  break;
              case "90":
                  fromDate.setMonth(fromDate.getMonth() - 3);
                  break;
              case "180":
                  fromDate.setMonth(fromDate.getMonth() - 6);
                  break;
              case "365":
                  fromDate.setFullYear(fromDate.getFullYear() - 1);
                  break;
              default:
                  break;
          }
          const formattedFromDate = `${fromDate.getDate().toString().padStart(2, '0')}/${(fromDate.getMonth() + 1).toString().padStart(2, '0')}/${fromDate.getFullYear()}`;
          apiUrl += `?fromDate=${formattedFromDate}`;
      }
      if (paymentStatus) {
          apiUrl += apiUrl.includes('?') ? `&paymentStatus=${paymentStatus}` : `?paymentStatus=${paymentStatus}`;
      }
      if (startDate && endDate) {
          const formattedStartDate = startDate.toISOString();
          const formattedEndDate = endDate.toISOString();
          apiUrl += apiUrl.includes('?') ? `&startDate=${formattedStartDate}&endDate=${formattedEndDate}` : `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      }
      axios.get(apiUrl, { headers })
          .then((response) => {
              const filteredData = response?.data?.data?.filter(item => {
                  const invoiceDate = new Date(item.selectDate);
                  const selectDate = new Date(item.selectDate);
                  return (!searchTerm || item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.accNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.bankNamed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.accName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.mobileNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.tradeName.toLowerCase().includes(searchTerm.toLowerCase())
                  ) &&
                      (!selectedDays || invoiceDate >= fromDate) &&
                      (!startDate || invoiceDate >= startDate) &&
                      (!endDate || selectDate <= endDate) &&
                      (!duplicateFilter || item.duplicate === duplicateFilter);
              });
              setInvoices(filteredData.reverse());
          })
          .catch((error) => {
              console.error('Error fetching invoices:', error);
          });
  };

  const handleDelete = (deleteId) => {
      const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
          'Authorization': `Bearer ${token}`,  // Use the token from localStorage
          'Content-Type': 'application/json',  // Add any other headers if needed
      };
      const apiUrl = `${REACT_APP_API_BASE_URL}/api/delete-invoice/${deleteId}`;
      axios.delete(apiUrl, { headers });
      setInvoices(invoices.filter((item) => item._id !== deleteId));
  };

  const handleDuplicateFilterChange = (e) => {
      setDuplicateFilter(e.target.value);
  };

  const handleSelectChange = (e) => {
      setSelectedDays(e.target.value);
  };

  const handleSearch = () => {
      fetchInvoices();
  };
  const handlePaymentStatusChange = (e) => {
      setPaymentStatus(e.target.value);
  };
  const paidInvoicesLength = invoices.filter(item => item.paymentStatus === 'paid').length;
  const unpaidInvoicesLength = invoices.filter(item => item.paymentStatus === 'unpaid').length;
  const draftInvoicesLength = invoices.filter(item => item.paymentStatus === 'draft').length;
  const totalAUD = invoices.filter(item => item.currency === 'AUD').length
  const totalCAD = invoices.filter(item => item.currency === 'CAD').length
  const totalINR = invoices.filter(item => item.currency === 'INR').length
  const totalUSD = invoices.filter(item => item.currency === 'USD').length
  const DuplicateData = invoices.filter(item => item.duplicate === 'Duplicated').length;

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

  const getStatusColor = (paymentStatus) => {
      switch (paymentStatus) {
          case 'paid':
              return 'paid-row';
          case 'unpaid':
              return 'unpaid-row';
          default:
              return '';
      }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Invoices: {invoices.length}</Text>

      <View style={styles.row}>
        <Text>
          <Text style={styles.bold}>Paid:</Text> {paidInvoicesLength}
        </Text>
        <Text>
          <Text style={styles.bold}>Unpaid:</Text> {unpaidInvoicesLength}
        </Text>
        <Text>
          <Text style={styles.bold}>Draft:</Text> {draftInvoicesLength}
        </Text>
        <Text>
          <Text style={styles.bold}>AUD:</Text> {totalAUD}
        </Text>
        <Text>
          <Text style={styles.bold}>CAD:</Text> {totalCAD}
        </Text>
        <Text>
          <Text style={styles.bold}>INR:</Text> {totalINR}
        </Text>
        <Text>
          <Text style={styles.bold}>USD:</Text> {totalUSD}
        </Text>
      </View>

      <View style={styles.row}>
        <Text>
          <Text style={styles.bold}>Total Amount</Text>
        </Text>
        <Text>
          <Text style={styles.bold}>AUD:</Text> {totalAUDCr}
        </Text>
        <Text>
          <Text style={styles.bold}>CAD:</Text> {totalCADCr}
        </Text>
        <Text>
          <Text style={styles.bold}>INR:</Text> {totalINRCr}
        </Text>
        <Text>
          <Text style={styles.bold}>USD:</Text> {totalUSDCr}
        </Text>
      </View>

      <Text>
        <Text style={styles.bold}>Duplicated:</Text> {DuplicateData}
      </Text>

      {/* Filters */}
      <View style={styles.filters}>
        <TextInput
          placeholder="Search"
          style={styles.input}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        {/* <Picker
          selectedValue={selectedDays}
          style={styles.picker}
          onValueChange={handleSelectChange}>
          <Picker.Item label="Select date range" value="" />
          <Picker.Item label="Last 1 week" value="7" />
          <Picker.Item label="Last 1 month" value="30" />
          <Picker.Item label="Last 3 months" value="90" />
          <Picker.Item label="Last 6 months" value="180" />
          <Picker.Item label="Last 1 year" value="365" />
        </Picker>

        <Picker
          selectedValue={paymentStatus}
          style={styles.picker}
          onValueChange={handlePaymentStatusChange}>
          <Picker.Item label="Payment status" value="" />
          <Picker.Item label="Paid" value="paid" />
          <Picker.Item label="Unpaid" value="unpaid" />
          <Picker.Item label="Draft" value="draft" />
        </Picker>

        <Picker
          selectedValue={duplicateFilter}
          style={styles.picker}
          onValueChange={handleDuplicateFilterChange}>
          <Picker.Item label="Filter by Duplicate Status" value="" />
          <Picker.Item label="Duplicated" value="Duplicated" />
          <Picker.Item label="Not Duplicated" value="" />
        </Picker> */}

        {/* Replace with custom date picker if needed */}
        <View style={styles.datePickerRow}>
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => handleStartDateChange(date)}
          />
          <Text style={{marginHorizontal: 8}}>to</Text>
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => handleEndDateChange(date)}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* List of invoices */}
      <FlatList
        data={sortedItems}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <View style={[styles.itemRow, getStatusColor(item?.paymentStatus)]}>
            <Text>{item.client || 'N/A'}</Text>
            <Text>{item.company || 'N/A'}</Text>
            <Text>{item.paymentStatus || 'N/A'}</Text>
            <Text>{item.bankNamed || 'N/A'}</Text>
            <Text>{item.accNo || 'N/A'}</Text>
            {item.duplicate && <Text style={styles.tag}>{item.duplicate}</Text>}
            <Text>
              {item.selectDate ? item.selectDate.split('T')[0] : 'N/A'}
            </Text>
            <TouchableOpacity onPress={() => handleToggleDropdown(item._id)}>
              <Text style={{padding: 5, backgroundColor: '#ddd'}}>⋮</Text>
            </TouchableOpacity>
            {openItemId === item._id && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  onPress={() => {
                    /* navigate to /project */
                  }}>
                  <Text>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default InvoicesDetails;

const styles = StyleSheet.create({
  container: {padding: 16},
  header: {fontWeight: '900', fontSize: 20, marginBottom: 10},
  bold: {fontWeight: 'bold'},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10},
  filters: {gap: 10, marginBottom: 20},
  input: {
    borderWidth: 1,
    padding: 8,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {height: 40, marginBottom: 10},
  datePickerRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  button: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {color: 'white'},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#EDE9FE',
    color: '#6B21A8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
});
