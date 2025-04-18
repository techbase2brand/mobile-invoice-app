import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import axios from 'axios';
import CheckBox from '@react-native-community/checkbox';
import moment from 'moment';

const CreateInvoice = ({navigation, route}) => {
  const currencies = ['AUD', 'USD', 'INR', 'CAD', 'GBP'];
  const paymentStatuses = ['paid', 'unpaid', 'draft'];
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [selectBankModal, setSelectBankModal] = useState(false);
  const [isClientModalVisible, setClientModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = date => {
    handleDateChange(date);
    hideDatePicker();
  };
  const [client, setClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [state, setState] = useState('');
  const [selectedProject, setSelectedProject] = useState([]);
  const [projectDescriptions, setProjectDescriptions] = useState({});

  const [companyName, setCompanyName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientAddress1, setClientAddress1] = useState('');
  const [clientAddress2, setClientAddress2] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [data, setData] = useState([]);

  const [selectBank, setSelectBank] = useState('');
  const [bank, setBank] = useState('');
  const [accNo, setAccNo] = useState('');
  const [accType, setAccType] = useState('');
  const [branch, setBranch] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [swift, setSwift] = useState('');
  const [accName, setAccName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const [paytmName, setPaytmName] = useState('');
  const [PaytmId, setPaytmId] = useState('');
  const [payPalName, setPayPalName] = useState('');
  const [payPalId, setPayPalId] = useState('');
  const [gstin, setGstIn] = useState('');
  const [wise, setWise] = useState('');
  const [wiseId, setWiseId] = useState('');
  const [payOneer, setPayOneer] = useState('');
  const [payoneerId, setPayoneerId] = useState('');
  const [amount, setAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [cgst, setCgst] = useState('');
  const [sgst, setSgst] = useState('');
  const [cgstper, setCgstper] = useState('');
  const [sgstper, setSgstper] = useState('');

  const [invoicelist, setInvoiceList] = useState(null);
  const [enableGST, setEnableGST] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [description, setDescription] = useState(['']);
  const [company, setCompanyData] = useState([]);
  const [selectCompany, setSelectCompany] = useState('');
  const [amounts, setAmounts] = useState({});

  const [comGst, setComGst] = useState('');
  const [comIfsc, setComIfsc] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [comPanNo, setComPanNo] = useState('');
  const [signature, setSignature] = useState('');
  const [logo, setLogo] = useState('');
  const [trade, setTrade] = useState('');
  const [companyLogos, setCompanyLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [signatures, setSignatures] = useState([]);
  const signaturePayload = signatures.map(signature => signature.signature);
  const id = route?.params?.invoiceId;
  console.log('companyLogoscompanyLogoscompanyLogos', id);

  const calculateTotalAmount = amounts => {
    let total = 0;
    for (const task in amounts) {
      const values = amounts[task];
      for (const key in values) {
        const value = parseFloat(values[key]);
        if (!isNaN(value)) {
          total += value;
        }
      }
    }
    return total;
  };

  useEffect(() => {
    fetch(`${REACT_APP_API_BASE_URL}/api/get-signature`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSignatures(data.data);
        } else {
          console.error('Failed to fetch signatures:', data.message);
        }
      })
      .catch(error => console.error('Error fetching signatures:', error));
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
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
    };
    fetchLogo();
  }, []);

  const totalAmount = calculateTotalAmount(amounts);
  useEffect(() => {
    const fetchCompanyData = async () => {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      const apiUrl = `${REACT_APP_API_BASE_URL}/api/get-companyData`;
      axios
        .get(apiUrl, {headers})
        .then(response => {
          setCompanyData(response.data.data);
        })
        .catch(error => {
          console.error('Error fetching invoices:', error);
        });
    };
    fetchCompanyData();
  }, []);
  const handleSelectChange = event => {
    setSelectedLogo(event);
  };
  const handleCheckboxChange = event => {
    setEnableGST(event.target.checked);
    if (!event.target.checked) {
      setGstNo('');
      setGstIn('');
    }
  };
  const fetchInvoiceDetail = async id => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/invoice-get/${id}`,
        {headers},
      );
      const bankDetailData = response?.data?.data;
      console.log('bankDetailData', bankDetailData);
      setInvoiceList(bankDetailData);
    } catch (error) {
      console.error('Error fetching bank detail:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoiceDetail(id);
    }
  }, [id]);
  const handleAmountChange = (value, index, projectName) => {
    setAmounts(prevAmounts => ({
      ...prevAmounts,
      [projectName]: {
        ...prevAmounts[projectName],
        [index]: value,
      },
    }));
    console.log('error');
  };

  const handleDateChange = date => {
    const localDate = moment(date).startOf('day').toDate();
    setSelectedDate(localDate);
  };

  useEffect(() => {
    if (invoicelist) {
      setSelectedClient(invoicelist?.clientName);
      setState(invoicelist?.clientName);
      setCompanyName(invoicelist.company);
      setClientAddress(invoicelist?.clientAddress);
      setClientAddress1(invoicelist?.clientAddress1);
      setClientAddress2(invoicelist?.clientAddress2);
      setEmail(invoicelist.email);
      setMobileNo(invoicelist.mobileNo);
      setSelectedProject(invoicelist.project);
      setSelectBank(invoicelist.bankName);
      setBank(invoicelist.bankName);
      setAccNo(invoicelist.accNo);
      setAccType(invoicelist.accType);
      setBranch(invoicelist.BranchName);
      setIfsc(invoicelist.ifscCode);
      setSwift(invoicelist.swiftCode);
      setPaytmName(invoicelist.paytmName);
      setPaytmId(invoicelist.PaytmId);
      setPayPalName(invoicelist.payPalName);
      setPayPalId(invoicelist.payPalId);
      setWise(invoicelist.wise);
      setWiseId(invoicelist.wiseId);
      setPayOneer(invoicelist.payOneer);
      setPayoneerId(invoicelist.payoneerId);
      setGstNo(invoicelist.gstNo);
      setGstIn(invoicelist.gstin);
      setAmount(invoicelist.amount);
      setAdvanceAmount(invoicelist.AdvanceAmount);
      setCgst(invoicelist.cgst);
      setSgst(invoicelist.sgst);
      setCgstper(invoicelist.cgstper);
      setSgstper(invoicelist.sgstper);

      setPayStatus(invoicelist.paymentStatus);
      setCurrency(invoicelist.currency);
      setSelectCompany(invoicelist.trade);
      setComIfsc(invoicelist.ifsc);
      setCompanyAddress(invoicelist.companyAddress);
      setComPanNo(invoicelist.panNo);
      setSignature(invoicelist.signature);
      setLogo(invoicelist.companylogo);
      setComGst(invoicelist.CompanygstNo);
      setPayStatus(invoicelist.paymentStatus);
      setPaymentMethod(invoicelist.payMethod);
      const enableGSTValue = invoicelist.enableGST === 'true';
      setEnableGST(enableGSTValue);
      setAccName(invoicelist.accName);
      setTradeName(invoicelist.tradeName);
      setTrade(invoicelist.tradde);
      setDescription(invoicelist.description);
      setProjectDescriptions(invoicelist.description);
      setAmounts(invoicelist.amounts);
      setSelectedLogo(invoicelist.companylogo);
    }
  }, [invoicelist]);
  useEffect(() => {
    if (invoicelist && invoicelist.selectDate) {
      const date = new Date(invoicelist.selectDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      } else {
        console.error('Invalid date format:', invoicelist.selectDate);
      }
    }
  }, [invoicelist]);

  useEffect(() => {
    const fetchClient = async () => {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      const apiUrl = `${REACT_APP_API_BASE_URL}/api/get-clients`;
      axios
        .get(apiUrl, {headers})
        .then(response => {
          setClient(response.data.data);
        })
        .catch(error => {
          console.error('Error fetching invoices:', error);
        });
    };
    fetchClient();
  }, []);

  useEffect(() => {
    const token = AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    const apiUrl = `${REACT_APP_API_BASE_URL}/api/bank-data`;
    axios
      .get(apiUrl, {headers})
      .then(response => {
        console.log('res', response);

        setData(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching invoices:', error);
      });
  }, []);

  const handleClientChange = event => {
    if (!event.target.value) {
      setCompanyName('');
      setClientAddress('');
      setClientAddress1('');
      setClientAddress2('');
      setEmail('');
      setMobileNo('');
    }
    const selectedClientId = event.target.value;
    setState(selectedClientId);
    setSelectedClient(selectedClientId);
    const selectedClient = client.find(
      client => client._id === selectedClientId,
    );
    if (selectedClient) {
      setCompanyName(selectedClient.company);
      setClientAddress(selectedClient.clientAddress);
      setClientAddress1(selectedClient.clientAddress1);
      setClientAddress2(selectedClient.clientAddress2);
      setEmail(selectedClient.email);
      setMobileNo(selectedClient.mobileNo);
    }
  };
  // const handleProjectChange = event => {

  //   const {value, checked} = event.target;
  //   console.log("valuevalue",value, checked);
  //   if (checked) {
  //     setSelectedProject(prevProjects => [...prevProjects, value]);
  //   } else {
  //     setSelectedProject(prevProjects =>
  //       prevProjects.filter(project => project !== value),
  //     );
  //     setProjectDescriptions(prevDescriptions => {
  //       const updatedDescriptions = {...prevDescriptions};
  //       if (updatedDescriptions[value]) {
  //         delete updatedDescriptions[value];
  //       }
  //       return updatedDescriptions;
  //     });

  //     setAmounts(prevAmounts => {
  //       const updatedAmounts = {...prevAmounts};
  //       if (updatedAmounts[value]) {
  //         delete updatedAmounts[value];
  //       }
  //       return updatedAmounts;
  //     });
  //   }
  // };

  const handleProjectChange = (value, checked) => {
    console.log('valuevalue', value, checked);
    if (checked) {
      setSelectedProject(prevProjects => [...prevProjects, value]);
    } else {
      setSelectedProject(prevProjects =>
        prevProjects.filter(project => project !== value),
      );

      setProjectDescriptions(prevDescriptions => {
        const updatedDescriptions = {...prevDescriptions};
        if (updatedDescriptions[value]) {
          delete updatedDescriptions[value];
        }
        return updatedDescriptions;
      });

      setAmounts(prevAmounts => {
        const updatedAmounts = {...prevAmounts};
        if (updatedAmounts[value]) {
          delete updatedAmounts[value];
        }
        return updatedAmounts;
      });
    }
  };

  const handleBankChange = event => {
    if (!event.target.value) {
      setAccNo('');
      setAccType('');
      setBranch('');
      setIfsc('');
      setSwift('');
      setAccName('');
      setTradeName('');
      setAmount('');
    }
    const selectedBankId = event.target.value;
    setSelectBank(selectedBankId);
    setSelectBankModal(false);
    setBank(selectedBankId);
    const selectedBank = data.find(bank => bank._id === selectedBankId);

    if (selectedBank) {
      setAccNo(selectedBank.accNo);
      setAccType(selectedBank.accType);
      setBranch(selectedBank.BranchName);
      setIfsc(selectedBank.ifscCode);
      setSwift(selectedBank.swiftCode);
      setAccName(selectedBank.accName);
      setTradeName(selectedBank.tradeName);
    }
  };

  const handleCompanyChange = event => {
    const selectedCompanyId = event.target.value;
    setTrade(selectedCompanyId);
    const selectedCompany = company.find(
      item => item._id === selectedCompanyId,
    );
    if (selectedCompany) {
      setComGst(selectedCompany.gstNo);
      setComIfsc(selectedCompany.ifsc);
      setCompanyAddress(selectedCompany.companyAddress);
      setComPanNo(selectedCompany.panNo);
      setSignature(selectedCompany.signature);
      setLogo(selectedCompany.companylogo);
    }
  };
  const handleSubmit = async () => {
    // if (!selectedClient) {
    //   toast.error('Please select a client.', {
    //     position: 'bottom-center',
    //     autoClose: 2000,
    //   });
    //   return;
    // }

    // if (!selectedProject) {
    //   toast.error('Please select a project.', {
    //     position: 'bottom-center',
    //     autoClose: 2000,
    //   });
    //   return;
    // }
    // if (!selectedDate) {
    //   toast.error('Please select a date.', {
    //     position: 'bottom-center',
    //     autoClose: 2000,
    //   });
    //   return;
    // }
    // if (!paymentMethod) {
    //   toast.error('Please select a payment method.', {
    //     position: 'bottom-center',
    //     autoClose: 2000,
    //   });
    //   return;
    // }
    // if (!currency) {
    //   toast.error('Please select currency.', {
    //     position: 'bottom-center',
    //     autoClose: 2000,
    //   });
    //   return;
    // }
    const cleanedAmounts = {};
    Object.keys(amounts).forEach(key => {
      const isNonEmpty = Object.values(amounts[key]).some(
        value => value.trim() !== '',
      );
      if (isNonEmpty) {
        cleanedAmounts[key] = amounts[key];
      }
    });

    const cleanedProjectDescriptions = {};
    Object.keys(projectDescriptions).forEach(key => {
      const descriptions = projectDescriptions[key];
      if (descriptions.some(desc => desc.trim() !== '')) {
        cleanedProjectDescriptions[key] = descriptions;
      }
    });
    const selectedClientName =
      client.find(item => item._id === selectedClient)?.clientName || '';
    const selectedBankName =
      data.find(item => item._id === selectBank)?.bankName || '';
    const selectedTradeName =
      company.find(item => item._id === trade)?.trade || '';
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
    const formData = {
      clientName: state,
      company: companyName,
      email: email,
      mobileNo: mobileNo,
      clientAddress: clientAddress,
      clientAddress1: clientAddress1,
      clientAddress2: clientAddress2,
      project: selectedProject,
      bankName: bank,
      accNo: accNo,
      accType: accType,
      tradeName: tradeName,
      BranchName: branch,
      ifscCode: ifsc,
      swiftCode: swift,
      accName: accName,
      paytmName: paytmName,
      PaytmId: PaytmId,
      payPalName: payPalName,
      payPalId: payPalId,
      wise: wise,
      wiseId: wiseId,
      payOneer: payOneer,
      payoneerId: payoneerId,
      gstNo: gstNo,
      gstin: gstin,
      amount: amount,
      selectDate: formattedDate,
      currency: currency,
      description: cleanedProjectDescriptions,
      trade: selectedTradeName,
      ifsc: comIfsc,
      companyAddress: companyAddress,
      panNo: comPanNo,
      CompanygstNo: comGst,
      signature: signaturePayload[0],
      paymentStatus: payStatus || 'draft',
      payMethod: paymentMethod,
      enableGST: enableGST,
      client: selectedClientName,
      tradde: trade,
      bankNamed: selectedBankName,
      AdvanceAmount: totalAmount,
      amounts: cleanedAmounts,
      companylogo: selectedLogo,
      sgst: sgst,
      cgst: cgst,
      sgstper: sgstper,
      cgstper: cgstper,
    };

    const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
    const headers = {
      Authorization: `Bearer ${token}`, // Use the token from localStorage
      'Content-Type': 'application/json', // Add any other headers if needed
    };
    if (id) {
      axios
        .put(`${REACT_APP_API_BASE_URL}/api/update-invoice/${id}`, formData, {
          headers,
        })
        .then(response => {
          navigation.navigate('InvoicesDetails');
        })
        .catch(error => {
          console.error('Error updating form data:', error);
        });
    } else {
      axios
        .post(`${REACT_APP_API_BASE_URL}/api/add-clientBank`, formData, {
          headers,
        })
        .then(response => {
          navigation.navigate('InvoicesDetails');
        })
        .catch(error => {
          console.error('Error submitting form data:', error);
        });
    }
  };

  const handlePaymentMethodChange = event => {
    console.log('eventevent', event);
    const newPaymentMethod = event;
    setPaymentMethod(newPaymentMethod);
    setModalVisible1(false);

    switch (paymentMethod) {
      case 'bank':
        setSelectBank('');
        setAccNo('');
        setAccType('');
        setBranch('');
        setIfsc('');
        setSwift('');
        setAccName('');
        setTradeName('');
        setGstNo('');
        setGstIn('');
        break;
      case 'paytm':
        setPaytmName('');
        setPaytmId('');
        break;
      case 'paypal':
        setPayPalName('');
        setPayPalId('');
        break;
      case 'wise':
        setWise('');
        setWiseId('');
        break;
      case 'payOneer':
        setPayOneer('');
        setPayoneerId('');
        break;
      default:
        break;
    }
  };

  const handleCurrencyAdd = event => {
    setCurrency(event);
  };
  const handlePaymentStatus = event => {
    setPayStatus(event);
  };

  const handleAddDescription = project => {
    setProjectDescriptions(prevDescriptions => ({
      ...prevDescriptions,
      [project]: [...(prevDescriptions?.[project] || []), ''],
    }));
  };

  const handleRemoveDescription = (index, project) => {
    setProjectDescriptions(prevDescriptions => {
      const updatedDescriptions = {...prevDescriptions};
      updatedDescriptions[project] = updatedDescriptions[project].filter(
        (_, i) => i !== index,
      );

      // Remove the project from the state if it has no descriptions left
      if (updatedDescriptions[project].length === 0) {
        delete updatedDescriptions[project];
      }

      return updatedDescriptions;
    });

    setAmounts(prevAmounts => {
      const updatedAmounts = {...prevAmounts};
      if (updatedAmounts[project]) {
        updatedAmounts[project] = Object.fromEntries(
          Object.entries(updatedAmounts[project]).filter(
            ([key]) => parseInt(key) !== index,
          ),
        );
        if (Object.keys(updatedAmounts[project]).length === 0) {
          delete updatedAmounts[project];
        }
      }

      return updatedAmounts;
    });
  };

  const handleDescriptionChange = (value, index, project) => {
    setProjectDescriptions(prevDescriptions => ({
      ...prevDescriptions,
      [project]: prevDescriptions[project].map((desc, i) =>
        i === index ? value : desc,
      ),
    }));
  };

  const renderModal = (
    visible,
    setVisible,
    data,
    onSelect,
    title,
    getLabel = item => item,
    getValue = item => item,
  ) => {
    return (
      <Modal visible={visible} transparent={true} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              margin: 20,
              borderRadius: 10,
              padding: 20,
            }}>
            <Text style={{fontSize: 18, marginBottom: 10}}>{title}</Text>
            <FlatList
              data={data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(getValue(item));
                    setVisible(false);
                  }}
                  style={{paddingVertical: 10}}>
                  <Text>{getLabel(item)}</Text>
                </TouchableOpacity>
              )}
            />
            {/* <Button title="Close" onPress={() => setVisible(false)} /> */}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{marginTop: 20}}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title1}>Add Invoice</Text>
      </View>
      <ScrollView style={{padding: 10}}>
        <View style={{marginBottom: 10, width: '40%'}}>
          <Text style={{marginBottom: 4}}>Select Client</Text>
          <TouchableOpacity
            onPress={() => setClientModalVisible(true)}
            style={{borderWidth: 1, borderColor: '#ccc', padding: 10}}>
            <Text>
              {state
                ? client.find(c => c._id === state)?.clientName
                : 'Select Client'}
            </Text>
          </TouchableOpacity>
          <Modal visible={isClientModalVisible} transparent>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  margin: 20,
                  padding: 20,
                  borderRadius: 10,
                }}>
                <FlatList
                  data={client.sort((a, b) =>
                    a.clientName.localeCompare(b.clientName),
                  )}
                  keyExtractor={item => item._id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() => {
                        handleClientChange({target: {value: item._id}});
                        setClientModalVisible(false);
                      }}>
                      <Text style={{padding: 10}}>{item.clientName}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setClientModalVisible(false)}>
                  <Text
                    style={{textAlign: 'center', marginTop: 10, color: 'red'}}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {selectedClient && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                placeholder="Company Name"
                value={companyName}
                onChangeText={setCompanyName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="email"
                value={email}
                keyboardType="email-address"
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                placeholder="Address"
                value={clientAddress}
                onChangeText={setClientAddress}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address 1</Text>
              <TextInput
                placeholder="Address 1"
                value={clientAddress1}
                onChangeText={setClientAddress1}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address 2</Text>
              <TextInput
                placeholder="Address 2"
                value={clientAddress2}
                onChangeText={setClientAddress2}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile No</Text>
              <TextInput
                placeholder="mobile no"
                value={mobileNo}
                keyboardType="phone-pad"
                onChangeText={setMobileNo}
                style={styles.input}
              />
            </View>
          </>
        )}

        {client
          .filter(item => item._id === selectedClient)
          .map(item => (
            <View key={item._id} style={styles.inputGroup}>
              <Text style={styles.label}>Select Project</Text>

              {item.project.map((projectName, index) => (
                <View key={index} style={styles.projectContainer}>
                  <View style={styles.checkboxRow}>
                    <CheckBox
                      value={selectedProject.includes(projectName)}
                      onValueChange={newValue =>
                        handleProjectChange(projectName, newValue)
                      }
                      tintColors={{true: '#111827', false: '#D1D5DB'}}
                    />

                    <Text style={styles.checkboxLabel}>{projectName}</Text>
                  </View>

                  {selectedProject?.includes(projectName) && (
                    <>
                      {projectDescriptions?.[projectName] &&
                        projectDescriptions[projectName]?.map(
                          (desc, descIndex) => (
                            <View key={descIndex} style={styles.inputGroup}>
                              <Text style={styles.label}>
                                Description {descIndex + 1}
                              </Text>
                              <TextInput
                                placeholder={`Description ${descIndex + 1}`}
                                value={
                                  (projectDescriptions[projectName] &&
                                    projectDescriptions[projectName][
                                      descIndex
                                    ]) ||
                                  desc
                                }
                                onChangeText={text =>
                                  handleDescriptionChange(
                                    text,
                                    descIndex,
                                    projectName,
                                  )
                                }
                                style={styles.input}
                              />

                              <Text style={styles.label}>Amount</Text>
                              <TextInput
                                placeholder={`Amount ${descIndex + 1}`}
                                value={
                                  (amounts[projectName] &&
                                    amounts[projectName][descIndex]) ||
                                  ''
                                }
                                keyboardType="numeric"
                                onChangeText={text =>
                                  handleAmountChange(
                                    text,
                                    descIndex,
                                    projectName,
                                  )
                                }
                                style={styles.input}
                              />

                              {descIndex !== 0 && (
                                <TouchableOpacity
                                  style={styles.iconRight}
                                  onPress={() =>
                                    handleRemoveDescription(
                                      descIndex,
                                      projectName,
                                    )
                                  }>
                                  <Text style={styles.icon}>➖</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          ),
                        )}

                      <TouchableOpacity
                        style={styles.iconRight}
                        onPress={() => handleAddDescription(projectName)}>
                        <Text style={styles.icon}>➕</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ))}
            </View>
          ))}

        {/* Example for Date Picker */}
        <View style={{marginBottom: 10, width: '40%'}}>
          <Text style={{marginBottom: 4}}>Invoice Date</Text>
          <TouchableOpacity
            onPress={showDatePicker}
            style={{borderWidth: 1, borderColor: '#ccc', padding: 10}}>
            <Text>
              {selectedDate
                ? new Date(selectedDate).toDateString()
                : 'Select Date'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
          />
        </View>

        <>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
            }}>
            ADD GST
          </Text>
          <CheckBox
            value={enableGST}
            onValueChange={newValue =>
              handleCheckboxChange({target: {checked: newValue}})
            }
            tintColors={{true: '#111827', false: '#D1D5DB'}}
          />

          {enableGST && (
            <>
              <View style={{marginBottom: 16}}>
                <Text
                  style={{fontSize: 14, fontWeight: '500', color: '#374151'}}>
                  GST NO.
                </Text>
                <TextInput
                  placeholder="GST No"
                  value={gstNo}
                  onChangeText={text => setGstNo(text)}
                  style={styles.input}
                />
              </View>

              <View style={{marginBottom: 16}}>
                <Text
                  style={{fontSize: 14, fontWeight: '500', color: '#374151'}}>
                  GSTIN
                </Text>
                <TextInput
                  placeholder="GSTIN"
                  value={gstin}
                  onChangeText={text => setGstIn(text)}
                  style={styles.input}
                />
              </View>
            </>
          )}
        </>

        <View style={[styles.fieldContainer, {width: '40%'}]}>
          <Text style={styles.label}>Select Company</Text>

          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setModalVisible(true)}>
            <Text style={{color: trade ? '#000' : '#888'}}>
              {trade
                ? company.find(item => item._id === trade)?.trade
                : 'Select company'}
            </Text>
          </TouchableOpacity>

          <Modal
            transparent
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setModalVisible(false)}>
              <View style={styles.modalContent}>
                <FlatList
                  data={company}
                  keyExtractor={item => item._id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        handleCompanyChange({target: {value: item._id}});
                        setModalVisible(false);
                      }}>
                      <Text>{item.trade}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Company Address</Text>
          <TextInput
            placeholder="Company Address"
            value={companyAddress}
            style={styles.input}
            onChangeText={text => setCompanyAddress(text)}
          />
        </View>

        {trade && (
          <>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Ifsc</Text>
              <TextInput
                placeholder="ifsc"
                value={comIfsc}
                style={styles.input}
                onChangeText={text => setComIfsc(text)}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Pan. No</Text>
              <TextInput
                placeholder="Pan No"
                value={comPanNo}
                style={styles.input}
                onChangeText={text => setComPanNo(text)}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Gst</Text>
              <TextInput
                placeholder="comGst"
                value={comGst}
                style={styles.input}
                onChangeText={text => setComGst(text)}
              />
            </View>
          </>
        )}

        {/* payment method  */}
        <Text style={styles.title}>Please Select Payment Method</Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible1(true)}>
          <Text>{paymentMethod || 'Select Payment Method'}</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible1} transparent animationType="slide">
          <View style={styles.modalWrapper}>
            {['paytm', 'paypal', 'wise', 'payOneer', 'bank'].map(method => (
              <TouchableOpacity
                key={method}
                style={styles.modalOption}
                onPress={() => handlePaymentMethodChange(method)}>
                <Text>{method}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>

        {paymentMethod === 'bank' && (
          <>
            <Text style={styles.title}>Bank Detail</Text>

            <TouchableOpacity
              style={styles.selector}
              onPress={() => setSelectBankModal(true)}>
              <Text>{selectBank || 'Select Bank'}</Text>
            </TouchableOpacity>

            <Modal visible={selectBankModal} transparent animationType="slide">
              <View style={styles.modalWrapper}>
                {data.map(item => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.modalOption}
                    onPress={() => handleBankChange(item._id)}>
                    <Text>{item.bankName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Modal>

            <TextInput
              style={styles.input}
              placeholder="Acc No."
              value={accNo}
              onChangeText={setAccNo}
            />
            <TextInput
              style={styles.input}
              placeholder="Acc. Type"
              value={accType}
              onChangeText={setAccType}
            />
            <TextInput
              style={styles.input}
              placeholder="Branch Name"
              value={branch}
              onChangeText={setBranch}
            />
            <TextInput
              style={styles.input}
              placeholder="Ifsc Code"
              value={ifsc}
              onChangeText={setIfsc}
            />
            <TextInput
              style={styles.input}
              placeholder="Swift Code"
              value={swift}
              onChangeText={setSwift}
            />
            <TextInput
              style={styles.input}
              placeholder="Acc. Name"
              value={accName}
              onChangeText={setAccName}
            />
            <TextInput
              style={styles.input}
              placeholder="Trade Name"
              value={tradeName}
              onChangeText={setTradeName}
            />
          </>
        )}

        {paymentMethod === 'paytm' && (
          <>
            <Text style={styles.title}>Paytm</Text>
            <TextInput
              style={styles.input}
              placeholder="Paytm Name"
              value={paytmName}
              onChangeText={setPaytmName}
            />
            <TextInput
              style={styles.input}
              placeholder="Paytm Id"
              value={PaytmId}
              onChangeText={setPaytmId}
            />
          </>
        )}

        {paymentMethod === 'paypal' && (
          <>
            <Text style={styles.title}>Paypal</Text>
            <TextInput
              style={styles.input}
              placeholder="Paypal Name"
              value={payPalName}
              onChangeText={setPayPalName}
            />
            <TextInput
              style={styles.input}
              placeholder="Paypal Id"
              value={payPalId}
              onChangeText={setPayPalId}
            />
          </>
        )}

        {paymentMethod === 'wise' && (
          <>
            <Text style={styles.title}>Wise</Text>
            <TextInput
              style={styles.input}
              placeholder="Wise Name"
              value={wise}
              onChangeText={setWise}
            />
            <TextInput
              style={styles.input}
              placeholder="Wise Id"
              value={wiseId}
              onChangeText={setWiseId}
            />
          </>
        )}

        {paymentMethod === 'payOneer' && (
          <>
            <Text style={styles.title}>PayOneer</Text>
            <TextInput
              style={styles.input}
              placeholder="PayOneer Name"
              value={payOneer}
              onChangeText={setPayOneer}
            />
            <TextInput
              style={styles.input}
              placeholder="PayOneer Id"
              value={payoneerId}
              onChangeText={setPayoneerId}
            />
          </>
        )}

        {/* Continue converting the rest of the form similarly using View, TextInput, Text, etc. */}
        <View style={{padding: 10}}>
          {/* Currency Picker */}
          <Text style={{fontSize: 14, marginBottom: 4}}>Select Currency</Text>
          <TouchableOpacity
            style={{borderWidth: 1, borderColor: '#ccc', padding: 10}}
            onPress={() => setCurrencyModalVisible(true)}>
            <Text>{currency || 'Select Currency'}</Text>
          </TouchableOpacity>
          {renderModal(
            currencyModalVisible,
            setCurrencyModalVisible,
            currencies,
            handleCurrencyAdd,
            'Select Currency',
          )}

          {/* CGST Fields */}
          <View style={{flexDirection: 'row', gap: 10, marginVertical: 10}}>
            <View style={{flex: 1}}>
              <Text>CGST</Text>
              <TextInput
                placeholder="CGST"
                value={cgst}
                onChangeText={setCgst}
                style={styles.input}
              />
            </View>
            <View style={{flex: 1}}>
              <Text>CGST%</Text>
              <TextInput
                placeholder="CGST%"
                value={cgstper}
                onChangeText={setCgstper}
                style={styles.input}
              />
            </View>
          </View>

          {/* SGST Fields */}
          <View style={{flexDirection: 'row', gap: 10, marginVertical: 10}}>
            <View style={{flex: 1}}>
              <Text>SGST</Text>
              <TextInput
                placeholder="SGST"
                value={sgst}
                onChangeText={setSgst}
                style={styles.input}
              />
            </View>
            <View style={{flex: 1}}>
              <Text>SGST%</Text>
              <TextInput
                placeholder="SGST%"
                value={sgstper}
                onChangeText={setSgstper}
                style={styles.input}
              />
            </View>
          </View>

          {/* Advance Amount */}
          {!amount && (
            <View style={{marginBottom: 10}}>
              <Text>Advance</Text>
              <TextInput
                placeholder="Amount"
                value={totalAmount}
                onChangeText={setAdvanceAmount}
                style={styles.input}
                editable={!advanceAmount || advanceAmount}
              />
            </View>
          )}

          {/* Full Amount */}
          <View style={{marginBottom: 10}}>
            <Text>Full</Text>
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />
          </View>

          {/* Payment Status Picker */}
          <TouchableOpacity
            style={{borderWidth: 1, borderColor: '#ccc', padding: 10}}
            onPress={() => setPaymentModalVisible(true)}>
            <Text>{payStatus || 'Payment status'}</Text>
          </TouchableOpacity>
          {renderModal(
            paymentModalVisible,
            setPaymentModalVisible,
            paymentStatuses,
            handlePaymentStatus,
            'Select Payment Status',
          )}

          {/* Logo Picker */}
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginTop: 10,
            }}
            onPress={() => setLogoModalVisible(true)}>
            <Text>{selectedLogo || 'Select Company Logo'}</Text>
          </TouchableOpacity>
          {renderModal(
            logoModalVisible,
            setLogoModalVisible,
            companyLogos,
            handleSelectChange,
            'Select Company Logo',
            item => item.name, // label shown in modal
            item => item.name,
          )}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {id ? 'Update Client' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateInvoice;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
  title1: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24, // balance for the arrow
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563', // Tailwind's gray-700 equivalent
    marginBottom: 6,
  },
  input: {
    width: '40%',
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind's gray-300
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  projectContainer: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  iconRight: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  icon: {
    fontSize: 22,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    marginHorizontal: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    maxHeight: 300,
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  selector: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  modalWrapper: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 'auto',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 14,
    marginBottom: 100,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
