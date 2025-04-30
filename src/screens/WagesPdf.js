// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, Button, Alert,PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import axios from 'axios';
// import numberToWords from 'number-to-words';
// import Pdf from 'react-native-pdf';
// import { REACT_APP_API_BASE_URL } from '../constans/Constants';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNFS from 'react-native-fs';

// const WagesPdf = ({navigation, route}) => {
//   const  id  = route.params.wagesPdfId;
//   const [formData, setFormData] = useState({});
//   const [pdfUri, setPdfUri] = useState(null); // assuming PDF URL comes from API

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const headers = {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         };
//         const apiUrl = `${REACT_APP_API_BASE_URL}/api/wages-get/${id}`;
//         const response = await axios.get(apiUrl, { headers });
//         const invoiceData = response.data.data;
//         console.log("invoiceDatainvoiceData",invoiceData.pdfPath);
//         setFormData(invoiceData);
//         // setPdfUri(`https://invoice-backend.base2brand.com${invoiceData.pdfPath}`); // assuming pdfPath exists
//       } catch (error) {
//         Alert.alert('Error', 'Failed to fetch wage details');
//       }
//     };

//     fetchData();
//   }, [id]);

//   const totalRateAmount =
//     parseInt(formData.basic || "0") +
//     parseInt(formData.med || "0") +
//     parseInt(formData.children || "0") +
//     parseInt(formData.house || "0") +
//     parseInt(formData.conveyance || "0") +
//     parseInt(formData.earning || "0") +
//     parseInt(formData.arrear || "0") +
//     parseInt(formData.reimbursement || "0");

//   const deduction =
//     parseInt(formData.health || "0") +
//     parseInt(formData.epf || "0") +
//     parseInt(formData.tds || "0") +
//     parseInt(formData.proftax || "0");

//   const finalAmount = Math.abs(parseInt(formData.netsalary || "0"));
//   const amountInWords = numberToWords.toWords(finalAmount);
//   const capitalizedAmount = amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1);

//   const downloadPDF = async () => {
//     const pdfUrl = pdfUri;
//     const fileName = `salary-slip-${Date.now()}.pdf`;
//     const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

//     try {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
//         );
//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           Alert.alert('Permission Denied', 'Storage permission is required');
//           return;
//         }
//       }

//       const options = {
//         fromUrl: pdfUrl,
//         toFile: downloadDest,
//       };

//       const result = await RNFS.downloadFile(options).promise;

//       if (result.statusCode === 200) {
//         Alert.alert('Success', 'PDF downloaded successfully!');
//         console.log('File saved to:', downloadDest);
//       } else {
//         Alert.alert('Download Failed', 'Could not download PDF');
//       }
//     } catch (error) {
//       console.log('PDF Download Error:', error);
//       Alert.alert('Error', 'Something went wrong while downloading');
//     }
//   };
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity onPress={downloadPDF} style={{backgroundColor:"blue"}}>   <Text style={styles.title}>Salary Slip</Text></TouchableOpacity>
//       <Text style={styles.title}>Salary Slip</Text>

//       <Text style={styles.label}>Employee Name: {formData.employeeName}</Text>
//       <Text style={styles.label}>Designation: {formData.designation}</Text>
//       <Text style={styles.label}>Gross Salary: ₹{totalRateAmount}</Text>
//       <Text style={styles.label}>Total Deduction: ₹{deduction}</Text>
//       <Text style={styles.label}>Net Salary: ₹{finalAmount}</Text>
//       <Text style={styles.label}>In Words: {capitalizedAmount} only/-</Text>

//       {pdfUri ? (
//         <View style={{ height: 500, width: '100%' }}>
//           <Pdf
//             trustAllCerts={false}
//             source={{ uri: pdfUri, cache: true }}
//             onLoadComplete={(numberOfPages) => {
//               console.log(`PDF loaded with ${numberOfPages} pages`);
//             }}
//             onError={(error) => {
//               console.log(error);
//               Alert.alert("PDF Error", "Failed to load PDF.");
//             }}
//             style={styles.pdf}
//           />
//         </View>
//       ) : (
//         <Text style={{ marginTop: 20 }}>PDF not available</Text>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 6,
//   },
//   pdf: {
//     flex: 1,
//     width: '100%',
//   },
// });

// export default WagesPdf;

// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
// import Print from 'react-native-print';  // Library for PDF generation
// import numberToWords from 'number-to-words';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const WagesPdf = ({navigation, route}) => {
//     const [formData, setFormData] = useState({});
//     const  id  = route.params.wagesPdfId;

//     const totalRateAmount = parseInt(formData.basic || "0") + parseInt(formData.med || "0") + parseInt(formData.children || "0")
//         + parseInt(formData.house || "0") + parseInt(formData.conveyance || "0") + parseInt(formData.earning || "0")
//         + parseInt(formData.arrear || "0") + parseInt(formData.reimbursement || "0");

//     const deduction = parseInt(formData.health || "0") + parseInt(formData.epf || "0") + parseInt(formData.tds || "0") + parseInt(formData.proftax || "0");

//     const finalAmount = Math.abs(parseInt(formData.netsalary || "0"));

//     const amountInWords = numberToWords.toWords(finalAmount).charAt(0).toUpperCase() + numberToWords.toWords(finalAmount).slice(1);

//     useEffect(() => {
//           const fetchData = async () => {
//             try {
//               const token = await AsyncStorage.getItem('token');
//               const headers = {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//               };
//               const apiUrl = `${REACT_APP_API_BASE_URL}/api/wages-get/${id}`;
//               const response = await axios.get(apiUrl, { headers });
//               const invoiceData = response.data.data;
//               console.log("invoiceDatainvoiceData",invoiceData.pdfPath);
//               setFormData(invoiceData);
//               // setPdfUri(`https://invoice-backend.base2brand.com${invoiceData.pdfPath}`); // assuming pdfPath exists
//             } catch (error) {
//               Alert.alert('Error', 'Failed to fetch wage details');
//             }
//           };

//           fetchData();
//         }, [id]);

//     const formatDate = (inputDate) => {
//         const date = new Date(inputDate);
//         const options = { day: 'numeric', month: 'short', year: 'numeric' };
//         return date.toLocaleDateString('en-GB', options);
//     };

//     const formatChooseDate = (dateString) => {
//         const date = new Date(dateString);
//         const day = date.getUTCDate().toString().padStart(2, '0');
//         const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
//         const year = date.getUTCFullYear().toString();
//         return `${day}-${month}-${year}`;
//     };

//     const formatChoose = (dateString) => {
//         const date = new Date(dateString);
//         const month = date.toLocaleString('default', { month: 'short' });
//         const day = date.getUTCDate().toString().padStart(2, '0');
//         return `${month}-${day}`;
//     };

//     const handleDownloadPDF = async () => {
//         const htmlContent = `
//             <html>
//                 <head>
//                     <style>
//                         body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
//                         h3 { text-align: center; font-size: 24px; font-weight: bold; }
//                         table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//                         td { padding: 8px; text-align: left; }
//                         .total { font-weight: bold; }
//                         .table-header { font-weight: bold; }
//                         .table-body { border-top: 1px solid #ccc; }
//                     </style>
//                 </head>
//                 <body>
//                     <h3>Salary Slip</h3>
//                     <table>
//                         <tr>
//                             <td>Salary Advice for The Month</td>
//                             <td>${formatChoose(formData.chooseDate)}</td>
//                             <td>${formatChooseDate(formData.chooseDate)}</td>
//                         </tr>
//                         <tr>
//                             <td>Emp. Name</td>
//                             <td>${formData.employeeName}</td>
//                             <td>Dept.</td>
//                             <td>${formData.department}</td>
//                         </tr>
//                         <tr>
//                             <td>F/H Name</td>
//                             <td>${formData.familyMember}</td>
//                             <td>Designation</td>
//                             <td>${formData.designation}</td>
//                         </tr>
//                         <tr>
//                             <td>Date Of Joining</td>
//                             <td>${formatDate(formData.joinDate)}</td>
//                             <td>Employee Code</td>
//                             <td>${formData.empCode}</td>
//                         </tr>
//                         <tr>
//                             <td class="table-header">Rate of salary/Wages</td>
//                             <td class="table-header">Deduction</td>
//                             <td class="table-header">Attendance/Leave</td>
//                         </tr>
//                         <tr>
//                             <td>Basic</td>
//                             <td>${formData.basic}</td>
//                             <td>Health Insurar</td>
//                             <td>${formData.health}</td>
//                             <td>Days of this month</td>
//                             <td>${formData.daysMonth}</td>
//                         </tr>
//                         <tr>
//                             <td>Med.</td>
//                             <td>${formData.med}</td>
//                             <td>EPF</td>
//                             <td>${formData.epf}</td>
//                             <td>Working Days</td>
//                             <td>${formData.workingDays}</td>
//                         </tr>
//                         <tr>
//                             <td>Children education Allowance</td>
//                             <td>${formData.children}</td>
//                             <td>Prof. Tax</td>
//                             <td>${formData.proftax}</td>
//                         </tr>
//                         <tr>
//                             <td>Conveyance Allowance</td>
//                             <td>${formData.conveyance}</td>
//                             <td>TDS</td>
//                             <td>${formData.tds}</td>
//                         </tr>
//                         <tr>
//                             <td>House Rent Allowance</td>
//                             <td>${formData.house}</td>
//                         </tr>
//                         <tr>
//                             <td>Other Earnings</td>
//                             <td>${formData.earning}</td>
//                             <td>Casual Leave</td>
//                             <td>${formData.causelLeave}</td>
//                         </tr>
//                         <tr>
//                             <td>Arrear</td>
//                             <td>${formData.arrear}</td>
//                             <td>Medical Leave</td>
//                             <td>${formData.medicalLeave}</td>
//                         </tr>
//                         <tr>
//                             <td>Reimbursement</td>
//                             <td>${formData.reimbursement}</td>
//                             <td>Absent</td>
//                             <td>${formData.absent}</td>
//                         </tr>
//                         <tr>
//                             <td class="total">Gross Salary</td>
//                             <td>${totalRateAmount}</td>
//                             <td class="total">Total Deduction</td>
//                             <td>${deduction}</td>
//                             <td class="total">Net Salary</td>
//                             <td>${finalAmount}</td>
//                         </tr>
//                         <tr>
//                             <td colspan="2" class="total">Net Salary (in words)</td>
//                             <td>${amountInWords} Only/-</td>
//                         </tr>
//                     </table>
//                 </body>
//             </html>
//         `;

//         const options = {
//             html: htmlContent,
//             fileName: 'salary-slip',
//             directory: 'Documents',
//         };

//         const file = await Print.printToFile(options);
//         console.log('PDF Created:', file);
//     };

//     return (
//       <ScrollView contentContainerStyle={styles.container}>
//       <Button title="Pdf Download" onPress={() => {}} />
//       <View style={styles.slipContainer}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Image source={{ uri: `https://invoice-backend.base2brand.com${formData.companylogo}` }} style={styles.logo} />
//           <Text style={styles.salarySlip}>Salary Slip</Text>
//         </View>

//         {/* Table Header */}
//         <View style={styles.row}>
//           <Text style={styles.cellBold}>Salary Advice for The Month</Text>
//           <Text style={styles.cell}>Invalid Date-NaN</Text>
//           <Text style={styles.cell}>NaN-NaN-NaN</Text>
//         </View>

//         {/* Employee Details */}
//         <View style={styles.row}>
//           <Text style={styles.cellBold}>Emp. Name</Text>
//           <Text style={styles.cellBold}>Dept.</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.cellBold}>F/H Name</Text>
//           <Text style={styles.cellBold}>Designation</Text>
//         </View>
//         <View style={styles.row}>
//           <Text style={styles.cellBold}>Date Of Joining</Text>
//           <Text style={styles.cell}>Invalid Date</Text>
//           <Text style={styles.cell}>Employee Code</Text>
//         </View>

//         {/* Rate of Salary / Deductions / Attendance */}
//         <View style={styles.row}>
//           <Text style={styles.linkCell}>Rate of salary/Wages</Text>
//           <Text style={styles.linkCell}>Deduction</Text>
//           <Text style={styles.linkCell}>Attendance/Leave</Text>
//         </View>

//         {/* Earnings and Deductions */}
//         {renderRow('Basic', 'Health Insurar', 'Days of this month')}
//         {renderRow('Med.', 'EPF', 'Working Days')}
//         {renderRow('Children education Allowance', 'Prof. Tax', '')}
//         {renderRow('Conveyance Allowance', 'TDS', '')}
//         {renderRow('House Rent Allowance', '', '')}
//         {renderRow('Other Earnings', '', 'Casual Leave')}
//         {renderRow('Arrear', '', 'Medical Leave')}
//         {renderRow('Reimbursement', '', 'Absent')}

//         {/* Gross Salary */}
//         <View style={styles.totalRow}>
//           <Text style={styles.totalCell}>Gross Salary</Text>
//           <Text style={styles.totalCell}>0</Text>
//           <Text style={styles.totalCell}>Total</Text>
//           <Text style={styles.totalCell}>0</Text>
//           <Text style={styles.totalCell}>Net Salary</Text>
//           <Text style={styles.totalCell}>0</Text>
//         </View>

//         {/* Net Salary */}
//         <View style={styles.row}>
//           <Text style={styles.netSalaryLabel}>Net Salary (in words)</Text>
//           <Text style={styles.netSalary}>Zero Only/-</Text>
//         </View>

//         {/* Footer */}
//         <Text style={styles.footer}>This is a system generated Pdf sign not required.</Text>
//       </View>
//     </ScrollView>
//   );
// };

// const renderRow = (col1, col2, col3) => (
//   <View style={styles.row}>
//     <Text style={styles.cell}>{col1}</Text>
//     <Text style={styles.cell}>{col2}</Text>
//     <Text style={styles.cell}>{col3}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//   },
//   slipContainer: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//     marginTop: 10,
//     padding: 10,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   logo: {
//     width: 60,
//     height: 60,
//   },
//   salarySlip: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'orangered',
//   },
//   row: {
//     flexDirection: 'row',
//     borderTopWidth: 0.5,
//     borderColor: '#ccc',
//     paddingVertical: 6,
//   },
//   cell: {
//     flex: 1,
//     fontSize: 12,
//     paddingHorizontal: 4,
//   },
//   cellBold: {
//     flex: 1,
//     fontWeight: 'bold',
//     fontSize: 12,
//     paddingHorizontal: 4,
//   },
//   linkCell: {
//     flex: 1,
//     fontSize: 12,
//     paddingHorizontal: 4,
//     color: 'blue',
//     textDecorationLine: 'underline',
//   },
//   totalRow: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     marginTop: 10,
//     paddingVertical: 6,
//   },
//   totalCell: {
//     flex: 1,
//     fontWeight: 'bold',
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   netSalaryLabel: {
//     flex: 1,
//     fontWeight: 'bold',
//   },
//   netSalary: {
//     flex: 2,
//     fontWeight: 'bold',
//     color: 'black',
//     fontSize: 13,
//   },
//   footer: {
//     textAlign: 'center',
//     fontSize: 10,
//     marginTop: 20,
//     color: '#555',
//   },
// });

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import numberToWords from 'number-to-words';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import { PDFDocument } from 'pdf-lib';
import Icon from 'react-native-vector-icons/Ionicons';


const WagesPdf = ({navigation, route}) => {
  const viewRef = useRef();
  const [formData, setFormData] = useState({});
  const [pdfUri, setPdfUri] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const id = route?.params?.wagesPdfId;

  const totalRateAmount =
    parseInt(formData.basic || '0') +
    parseInt(formData.med || '0') +
    parseInt(formData.children || '0') +
    parseInt(formData.house || '0') +
    parseInt(formData.conveyance || '0') +
    parseInt(formData.earning || '0') +
    parseInt(formData.arrear || '0') +
    parseInt(formData.reimbursement || '0');

  const deduction =
    parseInt(formData.health || '0') +
    parseInt(formData.epf || '0') +
    parseInt(formData.tds || '0') +
    parseInt(formData.proftax || '0');

  const finalAmount = Math.abs(parseInt(formData.netsalary || '0'));
  const amountInWords =
    numberToWords.toWords(finalAmount).charAt(0).toUpperCase() +
    numberToWords.toWords(finalAmount).slice(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        if (id) {
          const apiUrl = `${REACT_APP_API_BASE_URL}/api/wages-get/${id}`;
          const response = await axios.get(apiUrl, {headers});
          const invoiceData = response.data.data;
          setFormData(invoiceData);
        }
      } catch (error) {
        console.error('Error fetching Wages details:', error);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = inputDate => {
    const date = new Date(inputDate);
    const options = {day: 'numeric', month: 'short', year: 'numeric'};
    return date.toLocaleDateString('en-GB', options);
  };

  const formatChooseDate = dateString => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString();
    return `${day}-${month}-${year}`;
  };

  const formatChoose = dateString => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', {month: 'short'});
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  };

  // const createPDF = async () => {
  //   try {
  //     let PDFOptions = {
  //       html: '<h1>Generate PDF!</h1>',
  //       fileName: 'file',
  //       directory: Platform.OS == 'android' ? 'Downloads' : 'Documents',
  //     };
  //     let file = await RNHTMLtoPDF.convert(PDFOptions);
  //     if (!file.filePath) return;
  //     Alert.alert(file.filePath);
  //   } catch (error) {
  //     console.log('Failed to generate pdf', error.message);
  //   }
  // };
  const createPDF = async () => {
    try {
      // 1. Capture the view as PNG image file
      const uri = await viewRef.current.capture();
      console.log("Captured URI:", uri);
  
      // 2. Fetch binary data from local file URI
      const imageBuffer = await fetch(uri).then(res => res.arrayBuffer());
  
      // 3. Create a PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
  
      // 4. Embed image
      const pngImage = await pdfDoc.embedPng(imageBuffer);
      const pngDims = pngImage.scale(1);
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      
      // Original image size
      // Max image size with padding
      const maxWidth = pageWidth - 60;  // 30 padding on each side
      const maxHeight = pageHeight - 60;
      
      // Scale down proportionally if needed
      let scale = Math.min(maxWidth / pngDims.width, maxHeight / pngDims.height);
      const scaledWidth = pngDims.width * scale;
      const scaledHeight = pngDims.height * scale;
      
      // Center the image
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;
      
      page.drawImage(pngImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
      // page.drawImage(pngImage, {
      //   x: 30,
      //   y: 841.89 - pngDims.height - 30,
      //   width: pngDims.width,
      //   height: pngDims.height,
      // });
  
      // 5. Save and write PDF file
      const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: false });
      const pdfPath = `${RNFS.DocumentDirectoryPath}/Salary_slip.pdf`;
      await RNFS.writeFile(pdfPath, base64Pdf, 'base64');
  
      console.log("PDF saved to:", pdfPath);
      Alert.alert("PDF Saved Successfully", );
      // 6. Share
      // await Share.open({
      //   url: `file://${pdfPath}`,
      //   type: 'application/pdf',
      // });
  
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("PDF Error", error.message);
    }
  };

  const companyLogo = formData?.companylogo;

  return (
    <SafeAreaView style={styles.container}>
       <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      <TouchableOpacity
        style={styles.generatePdfButton}
        onPress={createPDF}
        disabled={isGenerating}>
        <Text style={styles.generatePdfButtonText}>
          {isGenerating ? 'Pdf Download' : 'Pdf Download'}
        </Text>
      </TouchableOpacity>
      <ViewShot ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
      <ScrollView style={styles.scrollView}>
      <Image
          source={{
            uri: `https://invoice-backend.base2brand.com${formData.companylogo}`,
          }}
          style={styles.logoInvoiceOverlap}
        />
        <View style={styles.header}>
          <Image
            source={{
              uri: `https://invoice-backend.base2brand.com${formData.companylogo}`,
            }}
            style={styles.companyLogo}
            resizeMode="contain"
          />
          

          <Text style={[styles.headerText,{color:`${
              companyLogo === "/uploads/SAI LOGO copy [Recovered]-01 2.png"
                ? "#ef7e50"
                : companyLogo === "/uploads/ks-01.png"
                ? "#1F8C97"
                : companyLogo ===
                  "/uploads/Campus-logo-design-Trademark-1024x334 1.png"
                ? "#154880"
                : "#042DA0"
            }`,}]}>Salary Slip</Text>
        </View>
       
        <View style={styles.content}>
       
          <View style={styles.salaryInfo}>
            <View style={styles.row}>
              <Text style={styles.label}>Salary Advice for The Month</Text>
              <Text style={styles.value}>
                {formatChoose(formData?.chooseDate)}
              </Text>
              <Text style={styles.value}>
                {formatChooseDate(formData?.chooseDate)}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Emp. Name</Text>
                <Text style={styles.value}>{formData.employeeName}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Dept.</Text>
                <Text style={styles.value}>{formData.department}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>F/H Name</Text>
                <Text style={styles.value}>{formData.familyMember}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Designation</Text>
                <Text style={styles.value}>{formData.designation}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Date Of Joining</Text>
                <Text style={styles.value}>{formData.joinDate}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Employee Code</Text>
                <Text style={styles.value}>{formData.empCode}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rate of salary/Wages</Text>
              <Text style={styles.sectionTitle}>Deduction</Text>
              <Text style={styles.sectionTitle}>Attendance/Leave</Text>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Basic</Text>
                <Text style={styles.value}>{formData.basic}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Health Insurance</Text>
                <Text style={styles.value}>{formData.health}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Days of this month</Text>
                <Text style={styles.value}>{formData.daysMonth}</Text>
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Medical</Text>
                <Text style={styles.value}>{formData.med}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>EPF</Text>
                <Text style={styles.value}>{formData.epf}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Working Days</Text>
                <Text style={styles.value}>{formData.workingDays}</Text>
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Children</Text>
                <Text style={styles.value}>{formData.children}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>TDS</Text>
                <Text style={styles.value}>{formData.tds}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Casual Leave</Text>
                <Text style={styles.value}>{formData.causelLeave}</Text>
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>House Rent</Text>
                <Text style={styles.value}>{formData.house}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Prof Tax</Text>
                <Text style={styles.value}>{formData.proftax}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Medical Leave</Text>
                <Text style={styles.value}>{formData.medicalLeave}</Text>
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Conveyance</Text>
                <Text style={styles.value}>{formData.conveyance}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Other Deductions</Text>
                <Text style={styles.value}>{formData.otherDeduction}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Absent</Text>
                <Text style={styles.value}>{formData.absent}</Text>
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Earning</Text>
                <Text style={styles.value}>{formData.earning}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Total Deductions</Text>
                <Text style={styles.value}>{deduction}</Text>
              </View>
              <View style={styles.column}>
                {/* <Text style={styles.label}>Days Week Off</Text> */}
                {/* <Text style={styles.value}>{formData.daysWeekOff}</Text> */}
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Arrear</Text>
                <Text style={styles.value}>{formData.arrear}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Net Salary</Text>
                <Text style={styles.value}>{finalAmount}</Text>
              </View>
              <View style={styles.column}>
                {/* <Text style={styles.label}>Days LWP</Text>
                <Text style={styles.value}>{formData.daysLWP}</Text> */}
              </View>
            </View>

            <View style={styles.salaryDetails}>
              <View style={styles.column}>
                <Text style={styles.label}>Reimbursement</Text>
                <Text style={styles.value}>{formData.reimbursement}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Total Rate Amount</Text>
                <Text style={styles.value}>{totalRateAmount}</Text>
              </View>
              <View style={styles.column}>
                {/* <Text style={styles.label}>Days Payable</Text>
                <Text style={styles.value}>{formData.daysPayable}</Text> */}
              </View>
            </View>

            <View style={styles.netSalaryWords}>
              <Text style={styles.netSalaryText}>
                Net Salary (in words): {amountInWords} Only/-
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {/* This is a system generated PDF sign not required. */}
            </Text>
          </View>
          <View style={[styles.mainFooter,{backgroundColor:`${
              companyLogo === "/uploads/SAI LOGO copy [Recovered]-01 2.png"
                ? "#ef7e50"
                : companyLogo === "/uploads/ks-01.png"
                ? "#1F8C97"
                : companyLogo ===
                  "/uploads/Campus-logo-design-Trademark-1024x334 1.png"
                ? "#154880"
                : "#042DA0"
            }`,}]}>
            <View style={styles.footer}>
              <View style={styles.middle}>
                <View style={styles.iconText}>
                  <Icon
                    name="call"
                    size={20}
                    color="#fff"
                    style={styles.icon}
                  />
                  <View>
                    <Text style={styles.text}>+919872084850</Text>
                    <Text style={[styles.text, styles.bottomMargin]}>
                      +918360116967
                    </Text>
                  </View>
                </View>
              </View>
              x
              <View style={styles.middle}>
                <View style={styles.iconText}>
                  <Icon
                    name="globe"
                    size={20}
                    color="#fff"
                    style={styles.icon}
                  />
                  <View>
                    <Text style={styles.text}>www.sailegalassociates.com</Text>
                    <Text style={styles.text}>
                      hello@sailegalassociates.com
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.address}>
                <View style={styles.iconText}>
                  <Icon
                    name="location-sharp"
                    size={20}
                    color="#fff"
                    style={styles.icon}
                  />
                  <View>
                    <Text style={styles.text}>
                      F-209, Phase 8B, Industrial Area, Sector 74, Sahibzada
                      Ajit Singh Nagar,
                    </Text>
                    <Text style={styles.text}>Punjab 160074</Text>
                  </View>
                </View>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
      </ViewShot>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    // flex: 1,
  },
  backArrow: {
    fontSize: 24,
    marginLeft:16,
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ebf0f5',
    borderBottomWidth: 5,
    borderBottomColor: '#004681',
  },
  companyLogo: {
    width: 250,
    height: 80,
    marginRight: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fd7c50',
  },
  generatePdfButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    width: '20%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  generatePdfButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdfContainer: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.7,
    marginVertical: 20,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  salaryInfo: {
    // backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  column: {
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    backgroundColor: '#ebf0f5',
    padding: 10,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    color: '#004681',
    textAlign: 'left',
  },
  salaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  totals: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  netSalaryWords: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  netSalaryText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 30,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  logoInvoiceOverlap: {
    width: 700,
    height: 220,
    position: 'absolute',
    top: '40%',
    transform: 'translate(-50%, -50%)',
    left: '25%',
    transform: [{ translateX: -90 }, { translateY: -30 }], 
    opacity: 0.1,
  },

  mainFooter: {
    padding: 16,
    backgroundColor: '#f4f4f4',
    position: 'relative',
    height:100,
    marginTop:10
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    gap: 20,
    position: 'absolute',
    top: 30,
    zIndex: 999999,
  },
  middle: {
    marginBottom: 12,
  },
  address: {
    marginBottom: 12,
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    marginRight: 8,
    marginTop: 3,
  },
  text: {
    fontSize: 14,
    color: '#FFF',
  },
});

export default WagesPdf;
