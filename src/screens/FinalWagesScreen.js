// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import axios from 'axios';
// import Pdf from 'react-native-pdf';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import numberToWords from 'number-to-words';
// import { REACT_APP_API_BASE_URL } from '../constans/Constants';

// const FinalWagesScreen = ({navigation, route}) => {
//   const [formData, setFormData] = useState({});
//   const [pdfUri, setPdfUri] = useState(null);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const  id  = route?.params?.wagesId;

//   const totalRateAmount = parseInt(formData.basic || "0") + parseInt(formData.med || "0") + 
//     parseInt(formData.children || "0") + parseInt(formData.house || "0") + 
//     parseInt(formData.conveyance || "0") + parseInt(formData.earning || "0") +
//     parseInt(formData.arrear || "0") + parseInt(formData.reimbursement || "0");

//   const deduction = parseInt(formData.health || "0") + parseInt(formData.epf || "0") + 
//     parseInt(formData.tds || "0") + parseInt(formData.proftax || "0");

//   const finalAmount = Math.abs(parseInt(formData.netsalary || "0"));
// //   const amountInWords = numberToWords.toWords(finalAmount).charAt(0).toUpperCase() + 
// //     numberToWords.toWords(finalAmount).slice(1);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const headers = {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         };

//         if (id) {
//           const apiUrl = `${REACT_APP_API_BASE_URL}/api/wages-get/${id}`;
//           const response = await axios.get(apiUrl, { headers });
//           const invoiceData = response.data.data;
//           setFormData(invoiceData);
//         }
//       } catch (error) {
//         console.error('Error fetching Wages details:', error);
//       }
//     };

//     fetchData();
//   }, [id]);

//   const formatDate = (inputDate) => {
//     const date = new Date(inputDate);
//     const options = { day: 'numeric', month: 'short', year: 'numeric' };
//     return date.toLocaleDateString('en-GB', options);
//   };

//   const formatChooseDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = date.getUTCDate().toString().padStart(2, '0');
//     const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
//     const year = date.getUTCFullYear().toString();
//     return `${day}-${month}-${year}`;
//   };

//   const formatChoose = (dateString) => {
//     const date = new Date(dateString);
//     const month = date.toLocaleString('default', { month: 'short' });
//     const day = date.getUTCDate().toString().padStart(2, '0');
//     return `${month}-${day}`;
//   };

//   const generatePDF = async () => {
//     try {
//       setIsGenerating(true);
//       const token = await AsyncStorage.getItem('token');
//       const headers = {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       };

//       const apiUrl = `${REACT_APP_API_BASE_URL}/api/wages-pdf/${id}`;
//       const response = await axios.get(apiUrl, { 
//         headers,
//         responseType: 'blob'
//       });

//       // Create a blob URL from the PDF data
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
//       setPdfUri(url);
//       setIsGenerating(false);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       Alert.alert('Error', 'Failed to generate PDF. Please try again.');
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView style={styles.scrollView}>
//         <View style={styles.header}>
//           <Image
//             source={{ uri: `https://invoice-backend.base2brand.com${formData.companylogo}` }}
//             style={styles.companyLogo}
//             resizeMode="contain"
//           />
//           <Text style={styles.headerText}>Salary Slip</Text>
//         </View>

//         <TouchableOpacity 
//           style={styles.generatePdfButton}
//           onPress={generatePDF}
//           disabled={isGenerating}
//         >
//           <Text style={styles.generatePdfButtonText}>
//             {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
//           </Text>
//         </TouchableOpacity>

//         {pdfUri && (
//           <View style={styles.pdfContainer}>
//             <Pdf
//               source={{ uri: pdfUri }}
//               style={styles.pdf}
//               onLoadComplete={(numberOfPages, filePath) => {
//                 console.log(`Number of pages: ${numberOfPages}`);
//               }}
//               onError={(error) => {
//                 console.log(error);
//                 Alert.alert('Error', 'Failed to load PDF');
//               }}
//             />
//           </View>
//         )}

//         <View style={styles.content}>
//           <View style={styles.salaryInfo}>
//             <View style={styles.row}>
//               <Text style={styles.label}>Salary Advice for The Month</Text>
//               <Text style={styles.value}>{formatChoose(formData?.chooseDate)}</Text>
//               <Text style={styles.value}>{formatChooseDate(formData?.chooseDate)}</Text>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.column}>
//                 <Text style={styles.label}>Emp. Name</Text>
//                 <Text style={styles.value}>{formData.employeeName}</Text>
//               </View>
//               <View style={styles.column}>
//                 <Text style={styles.label}>Dept.</Text>
//                 <Text style={styles.value}>{formData.department}</Text>
//               </View>
//             </View>

//             <View style={styles.row}>
//               <View style={styles.column}>
//                 <Text style={styles.label}>F/H Name</Text>
//                 <Text style={styles.value}>{formData.familyMember}</Text>
//               </View>
//               <View style={styles.column}>
//                 <Text style={styles.label}>Designation</Text>
//                 <Text style={styles.value}>{formData.designation}</Text>
//               </View>
//             </View>

//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Rate of salary/Wages</Text>
//               <Text style={styles.sectionTitle}>Deduction</Text>
//               <Text style={styles.sectionTitle}>Attendance/Leave</Text>
//             </View>

//             <View style={styles.salaryDetails}>
//               <View style={styles.column}>
//                 <Text style={styles.label}>Basic</Text>
//                 <Text style={styles.value}>{formData.basic}</Text>
//               </View>
//               <View style={styles.column}>
//                 <Text style={styles.label}>Health Insurance</Text>
//                 <Text style={styles.value}>{formData.health}</Text>
//               </View>
//               <View style={styles.column}>
//                 <Text style={styles.label}>Days of this month</Text>
//                 <Text style={styles.value}>{formData.daysMonth}</Text>
//               </View>
//             </View>

//             {/* Add more salary details rows similarly */}

//             <View style={styles.totals}>
//               <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Gross Salary</Text>
//                 <Text style={styles.totalValue}>{totalRateAmount}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Total Deductions</Text>
//                 <Text style={styles.totalValue}>{deduction}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Net Salary</Text>
//                 <Text style={styles.totalValue}>{finalAmount}</Text>
//               </View>
//             </View>

//             <View style={styles.netSalaryWords}>
//               <Text style={styles.netSalaryText}>
//                 Net Salary (in words): {finalAmount} Only/-
//               </Text>
//             </View>
//           </View>

//           <View style={styles.footer}>
//             <Text style={styles.footerText}>
//               This is a system generated PDF sign not required.
//             </Text>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   companyLogo: {
//     width: 100,
//     height: 50,
//     marginRight: 20,
//   },
//   headerText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   content: {
//     padding: 20,
//   },
//   salaryInfo: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 10,
//   },
//   column: {
//     flex: 1,
//   },
//   label: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#f5f5f5',
//     padding: 10,
//     marginVertical: 10,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   salaryDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   totals: {
//     marginTop: 20,
//     borderTopWidth: 2,
//     borderTopColor: '#ddd',
//     paddingTop: 15,
//   },
//   totalRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   totalValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2196F3',
//   },
//   netSalaryWords: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 5,
//   },
//   netSalaryText: {
//     fontSize: 16,
//     fontStyle: 'italic',
//   },
//   footer: {
//     marginTop: 30,
//     padding: 20,
//     alignItems: 'center',
//   },
//   footerText: {
//     fontSize: 14,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   generatePdfButton: {
//     backgroundColor: '#2196F3',
//     padding: 15,
//     borderRadius: 8,
//     margin: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   generatePdfButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   pdfContainer: {
//     flex: 1,
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height * 0.7,
//     marginVertical: 20,
//   },
//   pdf: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
// });

// export default FinalWagesScreen; 