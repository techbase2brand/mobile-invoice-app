import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_API_BASE_URL } from "../constans/Constants";

const AddWagesForm = ({navigation, route}) => {
  // State variables
  const [empName, setEmpName] = useState("");
  const [familyMember, setFamilyMember] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logo, setLogo] = useState("");
  const [state, setState] = useState("");
  const [client, setClient] = useState([]);
  const [wages, setWages] = useState(null);
  const [grosssalary, setgrosssalary] = useState("");
  const [netsalary, setnetSalary] = useState("");
  
  const [basic, setBasic] = useState("");
  const [med, setMed] = useState("");
  const [children, setChildren] = useState("");
  const [house, setHouse] = useState("");
  const [conveyance, setConveyance] = useState("");
  const [earning, setEarning] = useState("");
  const [arrear, setArrear] = useState("");
  const [reimbursement, setReimbursement] = useState("");
  const [health, setHealth] = useState("");
  const [proftax, setProfTax] = useState("");
  const [epf, setEPF] = useState("");
  const [tds, setTds] = useState("");
  const [daysMonth, setDaysMonth] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [causelLeave, setCauselLeave] = useState("");
  const [medicalLeave, setmedicalLeave] = useState("");
  const [absent, setAbsent] = useState("");
  const [chooseDate, setChooseDate] = useState(new Date());
  const [sign, setSign] = useState("");
  const id = route?.params?.wagesId;

  console.log("route?.paramsroute?.params",route?.params);
  
  const [img, setImg] = useState(false);
  const [companyLogos, setCompanyLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState("");
  const [basicCut, setBasicCut] = useState(0);
  const [grossSalaryDeduction, setGrossSalaryDeduction] = useState(0);
  const [allTax, setAllTax] = useState(0);

  // Modal states
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isEmployeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [isDepartmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [isDaysModalVisible, setDaysModalVisible] = useState(false);
  const [isLogoModalVisible, setLogoModalVisible] = useState(false);

  // Department options
  const departmentOptions = [
    { id: 1, name: "Web Development & Design", value: "web-development & Design" },
    { id: 2, name: "Graphic Design", value: "graphic-design" },
    { id: 3, name: "Digital Marketing", value: "digital-marketing" },
    { id: 4, name: "Business Development", value: "business-development" },
    { id: 5, name: "HR & Admin", value: "HR & Admin" },
  ];

  // Days options
  const daysOptions = [
    { id: 1, name: "31", value: "31" },
    { id: 2, name: "30", value: "30" },
    { id: 3, name: "28", value: "28" },
    { id: 4, name: "29", value: "29" },
  ];

  useEffect(() => {
    if (id) {
      fetchInvoiceDetail(id);
      setImg(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanyLogos();
  }, []);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchCompanyLogos = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/api/get-companyLogo`);
      const data = await response.json();
        if (data.success) {
          setCompanyLogos(data.data);
        } else {
          console.error("Failed to fetch company logos:", data.message);
        }
    } catch (error) {
      console.error("Error fetching company logos:", error);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/get-empData`,
        { headers }
      );
        setClient(response.data.data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchInvoiceDetail = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/api/wages-get/${id}`,
        { headers }
      );
      const bankDetailData = response.data.data;
      setWages(bankDetailData);
    } catch (error) {
      console.error("Error fetching wages detail:", error);
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

  const handleClientChange = (selectedClient) => {
    if (!selectedClient) {
      setFamilyMember("");
      setJoinDate("");
      setDepartment("");
      setDesignation("");
      setEmpCode("");
      setCompanyName("");
      setLogo("");
    }
    setState(selectedClient._id);
    setEmpName(selectedClient._id);
      setFamilyMember(selectedClient.familyMember);
      setJoinDate(selectedClient.joinDate);
      setDepartment(selectedClient.department);
      setDesignation(selectedClient.designation);
      setEmpCode(selectedClient.empCode);
      setCompanyName(selectedClient.companyName);
      setLogo(selectedClient.companylogo);
    setEmployeeModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
    const selectedEmpName =
      client.find((item) => item._id === empName)?.empName || "";
    const formattedDate = moment(chooseDate).format("YYYY-MM-DD");
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
      chooseDate: formattedDate === "Invalid date" ? null : formattedDate,
      companylogo: selectedLogo,
    };

    if (id) {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/api/update-wages/${id}`,
          formData,
          { headers }
        );
        navigation.navigate("Wages");
    } else {
        await axios.post(
          `${REACT_APP_API_BASE_URL}/api/created-wages`,
          formData,
          { headers }
        );
        navigation.navigate("Wages");
      }
    } catch (error) {
          console.error("Error submitting form data:", error);
      Alert.alert("Error", "Failed to submit form data");
    }
  };

  const handlePaymentStatus = (value) => {
    setDaysMonth(value);
    const selectedDays = parseInt(value);
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
        workingDays = ""; // Handle other cases as needed
    }

    setWorkingDays(workingDays.toString());
    setDaysModalVisible(false);
  };

  const handleDateConfirm = (date) => {
    setDatePickerVisibility(false);
    setChooseDate(date);
  };

  useEffect(() => {
    const newBasicCut =
      parseInt(basic || "0") +
      parseInt(med || "0") +
      parseInt(children || "0") +
      parseInt(house || "0") +
      parseInt(conveyance || "0") +
      parseInt(earning || "0") +
      parseInt(arrear || "0") +
      parseInt(reimbursement || "0");
    setBasicCut(newBasicCut);
  }, [basic, med, children, house, conveyance, earning, arrear, reimbursement]);

  useEffect(() => {
    const newAllTax =
      parseInt(health || "0") +
      parseInt(proftax || "0") +
      parseInt(epf || "0") +
      parseInt(tds || "0");
    setAllTax(newAllTax);
  }, [health, proftax, epf, tds]);

  useEffect(() => {
    const TotalLeave =
      parseInt(causelLeave || "0") +
      parseInt(medicalLeave || "0") +
      parseInt(absent || "0");
    const TotalDays = parseInt(daysMonth || "0");

    if (TotalDays && TotalLeave) {
      const newGrossSalaryDeduction = Math.floor(basicCut / TotalDays) * TotalLeave;
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
  
  const renderInput = (label, value, onChangeText, placeholder, keyboardType = "default", disabled = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.disabledInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={!disabled}
      />
    </View>
  );

  const renderModalItem = (item, onPress) => (
    <TouchableOpacity style={styles.modalItem} onPress={onPress}>
      <Text style={styles.modalItemText}>{item.name || item.empName}</Text>
    </TouchableOpacity>
  );

  // Employee Selection Modal
  const EmployeeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEmployeeModalVisible}
      onRequestClose={() => setEmployeeModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Employee</Text>
          <FlatList
            data={client.sort((a, b) => a.empName.localeCompare(b.empName))}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderModalItem(item, () => handleClientChange(item))}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setEmployeeModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Department Selection Modal
  const DepartmentModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDepartmentModalVisible}
      onRequestClose={() => setDepartmentModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Department</Text>
          <FlatList
            data={departmentOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderModalItem(item, () => {
              setDepartment(item.value);
              setDepartmentModalVisible(false);
            })}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setDepartmentModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Days Selection Modal
  const DaysModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDaysModalVisible}
      onRequestClose={() => setDaysModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Days</Text>
          <FlatList
            data={daysOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => renderModalItem(item, () => handlePaymentStatus(item.value))}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setDaysModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Logo Selection Modal
  const LogoModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLogoModalVisible}
      onRequestClose={() => setLogoModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Company Logo</Text>
          <FlatList
            data={companyLogos}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderModalItem(item, () => {
              setSelectedLogo(item.companylogo);
              setLogoModalVisible(false);
            })}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setLogoModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
        <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
          <Text style={styles.sectionTitle}>Emp. Detail</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Emp. Name</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setEmployeeModalVisible(true)}
            >
              <Text>
                {client.find(item => item._id === state)?.empName || "Select Employee"}
              </Text>
            </TouchableOpacity>
          </View>
          
                {empName && (
                  <>
              {renderInput("F/H Name", familyMember, setFamilyMember, "F/H Name")}
              {renderInput("Date Of Joining", joinDate, setJoinDate, "Date Of Joining")}
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Department</Text>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => setDepartmentModalVisible(true)}
                >
                  <Text>
                    {departmentOptions.find(item => item.value === department)?.name || "Select Department"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {renderInput("Designation", designation, setDesignation, "Designation")}
              {renderInput("Emp. Code", empCode, setEmpCode, "Emp. Code")}
              {renderInput("Company Name", companyName, setCompanyName, "Company Name")}
                  </>
                )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate of Basic/wages</Text>
          {renderInput("Gross Salary", grosssalary, setgrosssalary, "Gross Salary", "numeric")}
          {renderInput("Basic", basic, setBasic, "Basic", "numeric")}
          {renderInput("Med.", med, setMed, "Med.", "numeric")}
          {renderInput("Children Education Allowance", children, setChildren, "Children Education Allowance", "numeric")}
          {renderInput("House Rent Allowance", house, setHouse, "House Rent Allowance", "numeric")}
          {renderInput("Conveyance Allowance", conveyance, setConveyance, "Conveyance Allowance", "numeric")}
          {renderInput("Other Earning", earning, setEarning, "Other Earning", "numeric")}
          {renderInput("Arrear", arrear, setArrear, "Arrear", "numeric")}
          {renderInput("Reimbursement", reimbursement, setReimbursement, "Reimbursement", "numeric")}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deduction</Text>
          {renderInput("Health", health, setHealth, "Health", "numeric")}
          {renderInput("Prof. Tax", proftax, setProfTax, "Professional Tax", "numeric")}
          {renderInput("EPF", epf, setEPF, "EPF", "numeric")}
          {renderInput("TDS", tds, setTds, "TDS", "numeric")}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance/Leave</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Days of this month</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setDaysModalVisible(true)}
            >
              <Text>{daysMonth || "Select Days"}</Text>
            </TouchableOpacity>
          </View>
          
          {renderInput("Working Days", workingDays, setWorkingDays, "Working Days", "numeric", !daysMonth || daysMonth)}
          {renderInput("Casual Leave", causelLeave, setCauselLeave, "Casual Leave", "numeric")}
          {renderInput("Medical Leave", medicalLeave, setmedicalLeave, "Medical Leave", "numeric")}
          {renderInput("Absent", absent, setAbsent, "Absent", "numeric")}
          {renderInput("Total Leave", 
            (parseInt(causelLeave || "0") + parseInt(medicalLeave || "0") + parseInt(absent || "0")).toString(), 
            null, 
            "Total Leave", 
            "numeric", 
            true
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Choose Date</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setDatePickerVisibility(true)}
            >
              <Text>{moment(chooseDate).format("YYYY-MM-DD")}</Text>
            </TouchableOpacity>
          </View>
          
          {renderInput("Net Salary", netsalary, setnetSalary, "Net Salary", "numeric")}
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Company Logo</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setLogoModalVisible(true)}
            >
              <Text>
                {companyLogos.find(item => item.companylogo === selectedLogo)?.name || "Select Company Logo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{id ? "Update" : "Submit"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <EmployeeModal />
      <DepartmentModal />
      <DaysModal />
      <LogoModal />
      
      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        date={chooseDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
  section: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 24, 
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 4,
    padding: 16,
    alignItems: "center",
    margin: 16,
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#4a90e2",
    borderRadius: 4,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddWagesForm;