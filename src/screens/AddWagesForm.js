import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import moment from 'moment';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AddWagesForm = ({navigation, route}) => {
  const id = route.params || {};
  const [empName, setEmpName] = useState('');
  const [familyMember, setFamilyMember] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [state, setState] = useState('');
  const [client, setClient] = useState([]);
  const [wages, setWages] = useState(null);
  const [grosssalary, setgrosssalary] = useState('');
  const [netsalary, setnetSalary] = useState('');
  console.log('wageswages>>>', client);

  const [basic, setBasic] = useState('');
  const [med, setMed] = useState('');
  const [children, setChildren] = useState('');
  const [house, setHouse] = useState('');
  const [conveyance, setConveyance] = useState('');
  const [earning, setEarning] = useState('');
  const [arrear, setArrear] = useState('');
  const [reimbursement, setReimbursement] = useState('');
  const [health, setHealth] = useState('');
  const [proftax, setProfTax] = useState('');
  const [epf, setEPF] = useState('');
  const [tds, setTds] = useState('');
  const [daysMonth, setDaysMonth] = useState('');
  const [workingDays, setWorkingDays] = useState('');
  const [causelLeave, setCauselLeave] = useState('');
  const [medicalLeave, setmedicalLeave] = useState('');
  const [absent, setAbsent] = useState('');
  const [chooseDate, setChooseDate] = useState(null);
  const [sign, setSign] = useState('');
  const [img, setImg] = useState(false);
  const [companyLogos, setCompanyLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [basicCut, setBasicCut] = useState(0);
  const [grossSalaryDeduction, setGrossSalaryDeduction] = useState(0);
  const [allTax, setAllTax] = useState(0);

  // Add new states for modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDaysModal, setShowDaysModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Department options
  const departmentOptions = [
    'web-development & Design',
    'graphic-design',
    'digital-marketing',
    'business-development',
    'HR & Admin',
  ];

  // Days options
  const daysOptions = ['31', '30', '28', '29'];

  useEffect(() => {
    if (id) {
      fetchInvoiceDetail(id);
      setImg(false);
    }
  }, [id]);

  useEffect(() => {
    fetch(`${REACT_APP_API_BASE_URL}/api/get-companyLogo`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setCompanyLogos(data.data);
        } else {
          console.error('Failed to fetch company logos:', data.message);
        }
      })
      .catch(error => console.error('Error fetching company logos:', error));
  }, []);

  useEffect(async () => {
    const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    console.log('usetokentokentoken', token);
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    const apiUrl = `${REACT_APP_API_BASE_URL}/api/get-empData`;
    axios
      .get(apiUrl, {headers})
      .then(response => {
        setClient(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching invoices:', error);
      });
  }, []);

  const fetchInvoiceDetail = async id => {
    const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/wages-get/${id}`,
        {headers},
      );
      const bankDetailData = response.data.data;
      setWages(bankDetailData);
    } catch (error) {
      console.error('Error fetching bank detail:', error);
    }
  };

  useEffect(() => {
    if (wages) {
      setEmpName(wages.empName);
      setFamilyMember(wages.familyMember);
      setJoinDate(wages.joinDate);
      setDepartment(wages.department);
      setDesignation(wages.designation);
      setEmpCode(wages.empCode);
      setCompanyName(wages.companyName);
      setSelectedLogo(wages.companylogo);
      setState(wages.empName);
      setBasic(wages.basic);
      setgrosssalary(wages.grosssalary);
      setnetSalary(wages.netsalary);
      setMed(wages.med);
      setChildren(wages.children);
      setHouse(wages.house);
      setConveyance(wages.conveyance);
      setEarning(wages.earning);
      setArrear(wages.arrear);
      setReimbursement(wages.reimbursement);
      setHealth(wages.health);
      setProfTax(wages.proftax);
      setEPF(wages.epf);
      setTds(wages.tds);
      setDaysMonth(wages.daysMonth);
      setWorkingDays(wages.workingDays);
      setCauselLeave(wages.causelLeave);
      setmedicalLeave(wages.medicalLeave);
      setAbsent(wages.absent);
      setChooseDate(new Date(wages.chooseDate));
      setSign(wages.setSign);
    }
  }, [wages]);

  //   const handleClientChange = (event) => {
  //     if (!event.target.value) {
  //       setFamilyMember("");
  //       setJoinDate("");
  //       setDepartment("");
  //       setDesignation("");
  //       setEmpCode("");
  //       setCompanyName("");
  //       setLogo("");
  //     }
  //     const selectedClientId = event.target.value;
  //     setState(selectedClientId);
  //     setEmpName(selectedClientId);
  //     const selectedClient = client.find(
  //       (client) => client._id === selectedClientId
  //     );
  //     if (selectedClient) {
  //       setFamilyMember(selectedClient.familyMember);
  //       setJoinDate(selectedClient.joinDate);
  //       setDepartment(selectedClient.department);
  //       setDesignation(selectedClient.designation);
  //       setEmpCode(selectedClient.empCode);
  //       setCompanyName(selectedClient.companyName);
  //       setLogo(selectedClient.companylogo);
  //     }
  //   };

  const handleClientSelect = selectedClientId => {
    if (!selectedClientId) {
      setFamilyMember('');
      setJoinDate('');
      setDepartment('');
      setDesignation('');
      setEmpCode('');
      setCompanyName('');
      setLogo('');
      return;
    }

    setState(selectedClientId);

    const selectedClient = client.find(
      client => client._id === selectedClientId,
    );

    if (selectedClient) {
      setEmpName(selectedClient.empName);
      setFamilyMember(selectedClient.familyMember);
      setJoinDate(selectedClient.joinDate);
      setDepartment(selectedClient.department);
      setDesignation(selectedClient.designation);
      setEmpCode(selectedClient.empCode);
      setCompanyName(selectedClient.companyName);
      setLogo(selectedClient.companylogo);
    }
    setShowClientModal(false);
  };

  const handleSubmit = () => {
    const token = AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    const selectedEmpName =
      client.find(item => item._id === empName)?.empName || '';
    const formattedDate = moment(chooseDate).format('YYYY-MM-DD');
    const formData = {
      empName: state,
      familyMember: familyMember,
      joinDate: joinDate,
      department: department,
      designation: designation,
      empCode: empCode,
      companyName: companyName,
      employeeName: selectedEmpName,
      basic: basic,
      grosssalary: grosssalary,
      netsalary: netsalary,
      med: med,
      children: children,
      house: house,
      conveyance: conveyance,
      earning: earning,
      arrear: arrear,
      reimbursement: reimbursement,
      health: health,
      epf: epf,
      tds: tds,
      proftax: proftax || null,
      daysMonth: daysMonth,
      workingDays: workingDays,
      causelLeave: causelLeave,
      medicalLeave: medicalLeave,
      absent: absent,
      chooseDate: formattedDate === 'Invalid date' ? null : formattedDate,
      // signature: signaturePayload[0],
      companylogo: selectedLogo,
      netsalary: netsalary,
    };

    if (id) {
      axios
        .put(`${REACT_APP_API_BASE_URL}/api/update-wages/${id}`, formData, {
          headers,
        })
        .then(response => {
          navigation.navigate('Wages');
        })
        .catch(error => {
          console.error('Error updating form data:', error);
        });
    } else {
      axios
        .post(`${REACT_APP_API_BASE_URL}/api/created-wages`, formData, {
          headers,
        })
        .then(response => {
          navigate('Wages');
        })
        .catch(error => {
          console.error('Error submitting form data:', error);
          toast.error('Error submitting form data', {
            position: 'bottom-center',
            autoClose: 2000,
          });
        });
    }
  };
  const handleSelectChange = event => {
    setSelectedLogo(event.target.value);
  };

  const handlePaymentStatus = event => {
    setDaysMonth(event.target.value);
    const selectedDays = parseInt(event.target.value);
    let workingDays;

    switch (selectedDays) {
      case 31:
        workingDays = 23;
        break;
      case 30:
        workingDays = 22;
        break;
      case 28:
        workingDays = 19;
        break;
      case 29:
        workingDays = 20;
        break;
      default:
        workingDays = ''; // Handle other cases as needed
    }

    setWorkingDays(workingDays.toString());
  };

  const handleDateChange = date => {
    const localDate = moment(date).startOf('day').toDate();
    setChooseDate(localDate);
  };
  useEffect(() => {
    const newBasicCut =
      parseInt(basic || '0') +
      parseInt(med || '0') +
      parseInt(children || '0') +
      parseInt(house || '0') +
      parseInt(conveyance || '0') +
      parseInt(earning || '0') +
      parseInt(arrear || '0') +
      parseInt(reimbursement || '0');
    setBasicCut(newBasicCut);
  }, [basic, med, children, house, conveyance, earning, arrear, reimbursement]);

  useEffect(() => {
    const newAllTax =
      parseInt(health || '0') +
      parseInt(proftax || '0') +
      parseInt(epf || '0') +
      parseInt(tds || '0');
    setAllTax(newAllTax);
  }, [health, proftax, epf, tds]);

  useEffect(() => {
    const TotalLeave =
      parseInt(causelLeave || '0') +
      parseInt(medicalLeave || '0') +
      parseInt(absent || '0');
    const TotalDays = parseInt(daysMonth || '0');

    if (TotalDays && TotalLeave) {
      const newGrossSalaryDeduction =
        Math.floor(basicCut / TotalDays) * TotalLeave;
      setGrossSalaryDeduction(newGrossSalaryDeduction);
    } else {
      setGrossSalaryDeduction(0); // Ensure it's reset if inputs are invalid
    }
  }, [basicCut, daysMonth, causelLeave, medicalLeave, absent]);

  useEffect(() => {
    if (basicCut) {
      const deduct = basicCut - (allTax || 0); // Deduct all taxes from basic cut
      if (grossSalaryDeduction) {
        const total = deduct - grossSalaryDeduction;
        setnetSalary(Math.floor(total)); // Use Math.floor to remove decimals
      } else {
        setnetSalary(Math.floor(deduct)); // No gross salary deduction
      }
    } else {
      setnetSalary(0); // Reset if no basicCut
    }
  }, [basicCut, allTax, grossSalaryDeduction]);

  // Date picker handlers
  const handleDateConfirm = date => {
    const localDate = moment(date).startOf('day').toDate();
    setChooseDate(localDate);
    setShowDatePicker(false);
  };

  // Render methods for modals
  const renderClientItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleClientSelect(item._id)}>
      <Text>{item.empName}</Text>
    </TouchableOpacity>
  );

  const renderDepItem = ({item}) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => setDepartment(item)}>
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.flexRow}>
        <View style={{flex: 1}}>
          <View style={{marginBottom: 16}}>
            <Text style={{fontWeight: 'bold'}}>Emp. Detail</Text>
          </View>

          {/* Client Selection */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowClientModal(true)}>
            <Text>{empName || 'Select Emp. Name'}</Text>
          </TouchableOpacity>

          {empName && (
            <>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                  F/H Name
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="F/H Name"
                  value={familyMember}
                  onChangeText={setFamilyMember}
                />
              </View>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                  Date Of Joining
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Date Of Joining"
                  value={joinDate}
                  onChangeText={setJoinDate}
                />
              </View>
              {/* Department Selection */}
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDepartmentModal(true)}>
                <Text>{department || 'Select Department'}</Text>
              </TouchableOpacity>

              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                  Designation
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Designation"
                  value={designation}
                  onChangeText={setDesignation}
                />
              </View>

              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                  Emp. Code
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Emp. Code"
                  value={empCode}
                  onChangeText={setEmpCode}
                />
              </View>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                  Company Name
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Company Name"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              {/* Add other input fields similarly */}
            </>
          )}
          <View style={{marginBottom: 16}}>
            <Text style={{fontWeight: 'bold'}}>Rate of Baisc/wages</Text>
          </View>

          <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                Gross Salary
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Gross Salary"
                  value={grosssalary}
                  onChangeText={setgrosssalary}
                />
              </View>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                Basic
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Basic"
                  value={basic}
                  onChangeText={setBasic}
                />
              </View>

              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                Med.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Med."
                  value={med}
                  onChangeText={setMed}
                />
              </View>

              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                children education allowance
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="children education allowance"
                  value={children}
                  onChangeText={setChildren}
                />
              </View>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                House Rent allowance
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="House Rent allowance"
                  value={house}
                  onChangeText={setHouse}
                />
              </View>

              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                Conveyance allowance
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Conveyance allowance"
                  value={conveyance}
                  onChangeText={setConveyance}
                />
              </View>

              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                other Earning
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="other Earning"
                  value={earning}
                  onChangeText={setEarning}
                />
              </View>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                Arrear
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Arrear"
                  value={arrear}
                  onChangeText={setArrear}
                />
              </View>
              <View style={{marginBottom: 4}}>
                <Text style={{fontWeight: '600', marginBottom: 6}}>
                Reimbursement
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reimbursement"
                  value={reimbursement}
                  onChangeText={setReimbursement}
                />
              </View>
        </View>

        {/* Date Picker */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}>
          <Text>
            {chooseDate
              ? moment(chooseDate).format('YYYY-MM-DD')
              : 'Choose Date'}
          </Text>
        </TouchableOpacity>

        {/* Company Logo Selection */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowLogoModal(true)}>
          <Text>{selectedLogo || 'Select Company Logo'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal visible={showClientModal} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={client.sort((a, b) => a.empName.localeCompare(b.empName))}
              keyExtractor={item => item._id}
              renderItem={renderClientItem}
            />
            <Text
              style={{fontSize: 18, fontWeight: '800', textAlign: 'center'}}
              onPress={() => setShowClientModal(false)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>

      {/* DeparmentModals */}
      <Modal visible={showDepartmentModal} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={departmentOptions}
              keyExtractor={item => item}
              renderItem={renderDepItem}
            />
            <Text
              style={{fontSize: 18, fontWeight: '800', textAlign: 'center'}}
              onPress={() => setShowDepartmentModal(false)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Other modals for department, days, and logo selection */}
      {/* Add similar modal implementations for other selection fields */}

      <TouchableOpacity
        style={{
          backgroundColor: 'blue',
          padding: 16,
          borderRadius: 4,
          alignItems: 'center',
          marginTop: 16,
        }}
        onPress={handleSubmit}>
        <Text style={{color: 'white'}}>{id ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  container: { flex:1,padding: 16},
  flexRow: {flexDirection: 'row' ,width:"50%"},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 4,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default AddWagesForm;
