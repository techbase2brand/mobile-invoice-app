import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
// import generatePDF from "react-to-pdf";
import numberToWords from 'number-to-words';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import ViewShot from 'react-native-view-shot';
import { PDFDocument } from 'pdf-lib';

const Invoice = ({navigation, route}) => {
  const viewRef = useRef();
  console.log("ViewRefViewRef",viewRef);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [formData, setFormData] = useState({});
  console.log('formDataformDataformData>>>', isDownloaded);
  // const totalAmount = parseInt(formData.amount || "0") + parseInt(formData.AdvanceAmount || "0");
  const calculateTotalAmount = () => {
    let total = 0;
    for (const task in formData.amounts) {
      const amounts = formData.amounts[task];
      for (const key in amounts) {
        total += parseFloat(amounts[key]);
      }
    }
    return total;
  };

  const calculateTotalAmountText = () => {
    let total = 0;

    // Sum up all amounts in formData.amounts
    for (const task in formData.amounts) {
      const amounts = formData.amounts[task];
      for (const key in amounts) {
        total += parseInt(amounts[key]) || 0; // Ensure that values are properly parsed and added
      }
    }

    // Add SGST if it exists (only once)
    const sgstValue = parseFloat(formData.sgst) || 0;
    const cgstValue = parseFloat(formData.cgst) || 0;

    total += sgstValue + cgstValue; // Add SGST and CGST once

    return total;
  };
  // Usage:
  const totalAmountText = `${
    !formData.amount ? calculateTotalAmountText() : formData.amount
  }`;
  const totalAmount = `${
    !formData.amount ? calculateTotalAmount() : formData.amount
  }`;
  const id = route?.params?.invoiceId;
  // const downloadPdf = async () => {
  //     const element = pdfContentRef.current;
  //     if (element) {
  //         const canvas = await html2canvas(element, { scale: 2 });
  //         const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  //         pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
  //         pdf.save('invoice.pdf');
  //     }
  // };

  useEffect(() => {
    const fetchInvoice = async () => {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      if (id) {
        const apiUrl = `${REACT_APP_API_BASE_URL}/api/invoice-get/${id}`;
        axios
          .get(apiUrl, {headers})
          .then(response => {
            const invoiceData = response.data.data;
            setFormData(invoiceData);
          })
          .catch(error => {
            console.error('Error fetching invoice details:', error);
          });
      }
    };
    fetchInvoice();
  }, [id]);

  const targetRef = useRef();
  const amountText = totalAmountText || 0;
  const amountInWords =
    numberToWords.toWords(amountText).charAt(0).toUpperCase() +
    numberToWords.toWords(amountText).slice(1);

  // const printPDF = () => {
  //     window.print();
  // };

  // For Hiding Name.............................
  //   const checkboxes = document.querySelectorAll('.hide-checkbox');
  //   checkboxes.forEach(checkbox => {
  //     checkbox.addEventListener('change', e => {
  //       if (e.target.checked) {
  //         e.target.parentNode.parentNode.style.display = 'none';
  //       } else {
  //         e.target.parentNode.parentNode.style.display = 'block';
  //       }
  //     });
  //   });

  const handlePdfDownload = () => {
    // document.getElementById("chatbutton").style.display = "none";
    // generatePDF(targetRef, { filename: "page.pdf" });
  };

  const digitalMarketingAmounts = formData.amounts
    ? formData.amounts['ORM ShabadGuru']
    : undefined;
  // const dataKey = Object.keys(formData.amounts).map((key) => key)
  // console.log("dataKey ::::", dataKey)

  const amounts = formData.amounts;
  let priceValues = [];
  if (amounts) {
    Object.keys(amounts).forEach(key => {
      Object.values(amounts[key]).forEach((value, index) => {
        priceValues.push(value);
        // console.log(`Value ${index}: ${value}`);
      });
    });
  } else {
    console.log('No amounts data available');
  }

  let finalTotalAmount = parseFloat(totalAmount) || 0;

  if (formData.sgst) {
    finalTotalAmount += parseFloat(formData.sgst) || 0;
  }

  if (formData.cgst) {
    finalTotalAmount += parseFloat(formData.cgst) || 0;
  }

  const renderItem = ({item, index}) => (
    <View style={styles.row}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{width: '50%', gap: 250, flexDirection: 'row'}}>
          <Text style={{}}>{index + 1}</Text>
          <View style={styles.taskColumn}>
            <Text style={styles.bold}>{item.task}</Text>
          </View>
        </View>
        <View style={{width: '50%', paddingLeft: 80}}>
          {item?.description.map((desc, i) => (
            <View key={i} style={styles.descriptionBlock}>
              <Text>{desc}</Text>
              <Text style={styles.amount}>{item.amounts[i]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderHeader = () => {
    let methodTitle = '';
    switch (formData.payMethod) {
      case 'bank':
        methodTitle = 'Bank Detail';
        break;
      case 'paytm':
        methodTitle = 'Paytm Detail';
        break;
      case 'paypal':
        methodTitle = 'PayPal Detail';
        break;
      case 'wise':
        methodTitle = 'Wise Detail';
        break;
      case 'payOneer':
        methodTitle = 'Payoneer Detail';
        break;
      default:
        methodTitle = 'Payment Detail';
    }

    return (
      <View style={styles.header1}>
        <Text style={styles.title}>{methodTitle}</Text>
        <Text style={styles.title}>Company Detail</Text>
      </View>
    );
  };

  const data = Object.entries(formData.description || {}).map(
    ([task, descriptions]) => ({
      task,
      description: descriptions,
      amounts: formData.amounts?.[task] || [],
    }),
  );


  const createPDF = async () => {
    try {
      let PDFOptions = {
        html:`<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>BASE2BRAND Invoice</title>
                <link rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
                <style>
           
                body {
                    margin: 0;
                    padding: 0;
                    background-color: white;
                    color: #000000;
                    font-size: 12px;
                    line-height: 1.3;
                }
         
        .invoice-wrapper {
            width: 800px;
            margin: 0 auto;
            position: relative;
            z-index: 111;
        }
        .back_center_img {
            width: 800px;
            margin: 0 auto;
            position: relative;
            z-index: 111;
            opacity: 0.1;
            height: auto;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .back_center_img img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
         
                .header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 5px;
                }
         
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0;
                    color: #2a5ca8;
                    letter-spacing: 0.5px;
                }
         
                .company-subname {
                    font-size: 16px;
                    margin: 3px 0 0;
                    color: #2a5ca8;
                    letter-spacing: 4px;
                }
         
                .section-title {
                    font-weight: bold;
                    color: #2a5ca8;
                    margin-bottom: 8px;
                    padding: 10px 0;
                    border-bottom: 1px solid #000000;
                    font-size: 14px;
                }
         
                .bill-to-container {
                    display: flex;
                    justify-content: space-between;
                }
         
                .bill-to,
                .invoice-info {
                    width: 48%;
                }
         
               
                .info-label {
                    display: inline-block;
                    width: 75px;
                    text-align: left;
                    font-weight: bold;
                }
         
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
         
                .items-table th {
                    text-align: left;
                    padding: 10px 0px;
                    font-size: 14px;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #2a5ca8;
                    border-bottom: 1px solid #000000;
                }
         
                .items-table td {
                    padding: 6px 8px;
                    vertical-align: top;
                }
         
                .amount-in-words {
                    padding: 0;
                    margin: 15px 0 10px;
                    font-weight: 700;
                    font-size: 14px;
                }
         
                .footer-container {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                }
         
                .bank-details,
                .company-details {
                    width: 48%;
                }
         
                .footer-label {
                    display: inline-block;
                    width: 100px;
                    font-weight: bold;
                }
         
                .company-footer {
            font-weight: bold;
            margin-top: 15px;
            color: #000000;
            font-size: 12px;
            padding: 0 0 0 104px;
        }
         
                .contact-info {
                    margin-top: 20px;
                    font-size: 11px;
                    color: #555555;
                    display: flex;
                    align-items: center;
                }
         
                .contact-info .icon-name {
            padding: 4px 0 0 3px;
        }
         
                .contact-section {
                    display: flex;
                    justify-content: space-between;
                }
         
                td.dtfygu {
                    border-bottom: 1px solid #000;
                }
         
                td.value_class {
                    border-top: 1px solid #000;
                }
                .contact-info .icon i.fa-solid.fa-phone {
            font-size: 12px;
            border: 2px solid #ffffff;
            padding: 8px;
            border-radius: 10px;
            color: #ffffff;
            margin: 0 0 0 10px;
        }
         
        .contact-info .icon i.fa-solid.fa-location-dot {
            font-size: 10px;
            border: 2px solid #ffffff;
            padding: 9px 11px;
            border-radius: 10px;
            color: #ffffff;
            margin: 6px 0px 0 0;
        }
         
                .contact-info .icon i.fa-solid.fa-globe {
            font-size: 10px;
            border: 2px solid #ffffff;
            padding: 9px 9px;
            border-radius: 10px;
            color: #ffffff;
            margin: 7px 0 0 0;
        }
        .icon-name p {
            color: #ffffff;
            font-size: 7px;
            padding: 0 45px 0 7px;
            text-wrap-mode: nowrap;
        }
         
        .footer_img {
            position: relative;
        }
        .footer_img img {
            width: 100%;
            height: 100%;
        }
        .mai_footer {
            position: absolute;
            bottom: 14px;
            left: 0;
            display: flex;
            color: #000;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            margin: 0 0px;
        }
        .contact-info {
            margin: 0px;
            padding: 0px 20px;
        }
         
        .invoice_img {
            position: relative;
        }
        .invoice_img img {
            width: 100%;
        }
        .header {
            position: absolute;
            top: 50%;
            left: 47%;
            width: fit-content;
            height: 100%;
            transform: translate(-50px, -50px);
            align-items: center;
            display: flex;
            justify-content: space-around;
            max-width: 157px;
        }
        .invoice-wrapper:after {
            background-position: center;
            background-size: contain;
            height: 100%;
            position: absolute;
            content: "";
            width: 100%;
            top: 0;
            background-position: center;
            background-repeat: no-repeat;
            z-index: -1;
            opacity: 0.2;
        }
        @media print {
           
        }
            </style>
            </head>
            <body>
                <div class="sdev_container">
                    <div class="back_center_img"><img
                            src="../Abhishek-porject/assets/image/logo-header.png"
                            alt="back-logo"></div>
                    <div class="invoice-wrapper img">
                        <div class="invoice_wrap">
                            <div class="invoice_img">
                                <img
                                    src="../Abhishek-porject/assets/image/header_image.png"
                                    alt="hesder_img">
                                <div class="header">
                                    <img src="./assets/image/logo-header.png"
                                        alt="logo">
                                </div>
                            </div>
                            <!-- Header -->
                        </div>
                        <!-- Bill To and Invoice Info -->
                        <div class="secticton_table">
                            <div class="bill-to-container">
                                <div class="bill-to">
                                    <div class="section-title">Bill To</div>
                                    <p><strong>Fadi Algamal □</strong></p>
                                    <p>FA Digital</p>
                                    <p>Mohali</p>
                                    <p>F-209, Industrial Area, Sector 74, Sahibzada Ajit
                                        Singh
                                        Phase 2</p>
                                    <p>Hello@fadigital.com.au</p>
                                    <p>+61481713666</p>
                                </div>
                                <div class="invoice-info">
                                    <div class="section-title">Original For
                                        Recipient</div>
                                    <p>
                                        <span class="info-label">Invoice No.</span>
                                        B*a/2025-04-15/D135519
                                    </p>
                                    <p><span class="info-label">Invoice Date</span>
                                        2025-04-15</p>
                                    <p><span class="info-label">GST Code</span> 4234</p>
                                </div>
                            </div>
                            <!-- Items Table -->
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th class="back_logo">Sr. No.</th>
                                        <th>Task</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Website Development</td>
                                        <td>Crud</td>
                                        <td>10.25</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td>hello</td>
                                        <td>14</td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Digital Marketing</td>
                                        <td class="dtfygu">Design</td>
                                        <td>50.11</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td><strong class="strong_value">Total
                                                Value</strong></td>
                                        <td></td>
                                        <td class="value_class">AUD 74.36</td>
                                    </tr>
                                </tbody>
                            </table>
         
                            <!-- Amount in Words -->
                            <div class="amount-in-words">In Words: AUD Seventy-four Only
                                /-</div>
                            <!-- Footer -->
                            <div class="footer-container">
                                <div class="bank-details">
                                    <div class="section-title">Bank Detail</div>
                                    <p><span class="footer-label">Bank</span> HDFC Bank
                                        Limited</p>
                                    <p><span class="footer-label">Branch</span> Phase 2,
                                        Mohali</p>
                                    <p><span class="footer-label">Account No.</span>
                                        50200077879833</p>
                                    <p>
                                        <span class="footer-label">Account Name</span>
                                        Base2Brand Infotech
                                        Private Limited
                                    </p>
                                    <p><span class="footer-label">Account Type</span>
                                        Current</p>
                                    <p><span class="footer-label">IFSC</span>
                                        HDFC0001834</p>
                                    <p><span class="footer-label">Swift Code</span>
                                        HDFCINBB</p>
                                </div>
                                <div class="company-details">
                                    <div class="section-title">Company Detail</div>
                                    <p><span class="footer-label">Trade Name</span>
                                        BASE2BRAND</p>
                                    <p><span class="footer-label">Ifsc Code</span>
                                        GFTRE6567</p>
                                    <p><span class="footer-label">GSTIN</span>
                                        DER213</p>
                                    <p><span class="footer-label">Address</span> Mohali
                                        8b</p>
                                    <div class="company-footer">BASE2BRAND</div>
                                </div>
                            </div>
         
                            <!-- Contact Info -->
                        </div>
                        <div class="contact-section">
                            <div class="footer_img ">
                                <img
                                    src="../Abhishek-porject/assets/image/invoice_banner.png"
                                    alt="footer_img">
         
                                <div class="mai_footer">
                                    <div class="contact-info">
         
                                        <div class="icon"><i
                                                class="fa-solid fa-phone"></i></div>
                                        <div class="icon-name">
                                            <p>www.base2brand.com</p>
                                            <p>Telfo@base2brand.com</p>
                                        </div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="icon"><i
                                                class="fa-solid fa-globe"></i></div>
                                        <div class="icon-name">
                                            <p>www.base2brand.com</p>
                                            <p>Telfo@base2brand.com</p>
                                        </div>
                                    </div>
                                    <div class="contact-info">
                                        <div class="icon"><i
                                                class="fa-solid fa-location-dot"></i></div>
                                        <div class="icon-name">
                                            <p>
                                                F-209, Phaser 88, Industrial Area,
                                                Sector
                                                74,
                                                Sahibzada Ajit Singh
                                                Nagu, Punjab 18007A
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
         
            </html>
        Digital Marketing & Web & Mobile App Development Agency
        Boost your business with our Digital Marketing, Web, and Mobile App Development services. Discover expert solutions tailored to your needs. Contact us!
         `,
        fileName: 'Ivoice',
        directory: Platform.OS == 'android' ? 'Downloads' : 'Documents',
      };
      let file = await RNHTMLtoPDF.convert(PDFOptions);
      if (!file.filePath) return;
      Alert.alert(file.filePath);
    } catch (error) {
      console.log('Failed to generate pdf', error.message);
    }
  };
  const createPDF1 = async () => {
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
      const pdfPath = `${RNFS.DocumentDirectoryPath}/Invoice.pdf`;
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
  
  
  return (
    <View style={{marginTop: 40, paddingHorizontal: 16}}>
      <TouchableOpacity style={styles.button} onPress={createPDF1}>
        <Text style={styles.buttonText}>Pdf Download</Text>
      </TouchableOpacity>
      <ViewShot ref={viewRef} options={{ format: 'png', quality: 0.9 }}>
      <ScrollView  style={[styles.invoice, {background: '#fff'}]}>
        <Image
          source={{
            uri: `https://invoice-backend.base2brand.com${formData.companylogo}`,
          }}
          style={styles.logoInvoiceOverlap}
        />

        <Image
          source={require('../assests/header_invoice.png')} // Make sure the image is in your assets folder
          style={styles.headerInvoice}
          resizeMode="cover"
        />

        <Image
          source={{
            uri: `https://invoice-backend.base2brand.com${formData.companylogo}`,
          }}
          style={styles.companyLogo}
          resizeMode="contain"
        />

        <View style={[styles.invoice_section_new, {background: '#fff'}]}>
          <View>
            {/* Header Titles */}
            <View style={styles.headerRow}>
              <Text style={styles.billHead}>Bill To</Text>
              <Text style={styles.billHead}>Original For Recipient</Text>
            </View>

            {/* Content Row */}
            <View style={styles.bodyRow}>
              {/* Left Column */}
              <View style={styles.leftColumn}>
                <Text style={styles.boldText}>
                  {formData.client}{' '}
                  {/* <CheckBox value={false} disabled style={styles.checkbox} /> */}
                </Text>
                <Text style={{marginVertical: 5}}>{formData.company}</Text>
                <Text>{formData.clientAddress}</Text>
                <Text style={{marginVertical: 5}}>
                  {formData.clientAddress1}
                </Text>
                <Text>{formData.clientAddress2}</Text>
                <Text style={{marginVertical: 5}}>{formData.email}</Text>
                <Text style={{marginBottom: 5}}>{formData.mobileNo}</Text>
              </View>

              {/* Right Column */}
              <View style={styles.rightColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Invoice No.</Text>
                  <Text style={styles.value}>{formData.invoiceNo}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Invoice Date</Text>
                  <Text style={styles.value}>
                    {formData.selectDate
                      ? formData.selectDate.split('T')[0]
                      : 'N/A'}
                  </Text>
                </View>
                {formData.gstNo && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>GST Code</Text>
                    <Text style={styles.value}>{formData.gstNo}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View>
            <View style={styles.header}>
              <Text style={[styles.bold, {width: '30%'}]}>Sr. No.</Text>
              <Text style={[styles.bold, styles.taskHeader]}>Task</Text>
              <Text style={[styles.bold, styles.descHeader]}>Description</Text>
              <Text style={styles.bold}>Amount</Text>
            </View>

            {/* Table Data */}
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(_, i) => i.toString()}
            />

            {/* Total */}
            <View style={[styles.totalRow, {justifyContent: 'space-between'}]}>
              <Text style={styles.totalLabel}>Total Value</Text>
              <Text style={styles.totalValue}>
                {formData.currency} {finalTotalAmount.toFixed(2)}
              </Text>
            </View>

            {/* In Words */}
            <Text style={styles.words}>
              In Words: {formData.currency} {amountInWords} Only /-
              {/* In Words: AUD {formData} Only /- */}
            </Text>
          </View>

          <View style={{padding: 16}}>
            {renderHeader()}

            <View
              style={[styles.row, {justifyContent: 'space-between', gap: 170}]}>
              <View style={styles.column}>
                {formData.bankNamed && (
                  <View style={styles.block}>
                    <Item label="Bank" value={formData.bankNamed} />
                    <Item label="Branch" value={formData.BranchName} />
                    <Item label="Account No." value={formData.accNo} />
                    <Item label="Account Name" value={formData.accName} />
                    <Item label="Account Type" value={formData.accType} />
                    <Item label="IFSC" value={formData.ifscCode} />
                    <Item label="Swift Code" value={formData.swiftCode} />
                  </View>
                )}

                {(formData.PaytmId ||
                  formData.payPalId ||
                  formData.wiseId ||
                  formData.payoneerId) && (
                  <View style={styles.block}>
                    {formData.PaytmId && (
                      <Item label="Paytm Id" value={formData.PaytmId} />
                    )}
                    {formData.payPalId && (
                      <Item label="Paypal Id" value={formData.payPalId} />
                    )}
                    {formData.wiseId && (
                      <Item label="Wise Id" value={formData.wiseId} />
                    )}
                    {formData.payoneerId && (
                      <Item label="Payoneer Id" value={formData.payoneerId} />
                    )}
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.column,
                  {alignSelf: 'flex-end', paddingLeft: 100},
                ]}>
                <View style={styles.block}>
                  {/* <Text style={styles.subtitle}>Company Detail</Text> */}
                  <Item label="Trade Name" value={formData.trade} />
                  {formData.gstNo && (
                    <Item label="Ifsc Code" value={formData.ifsc} />
                  )}
                  <Item label="GSTIN" value={formData.CompanygstNo} />
                  {!formData.gstNo && (
                    <Item label="PAN" value={formData.panNo} />
                  )}
                  <Item label="Address" value={formData.companyAddress} />
                  {formData?.signature && (
                    <View style={styles.signatureBlock}>
                      <Image
                        source={{
                          uri: `https://invoice-backend.base2brand.com${formData.signature}`,
                        }}
                        style={styles.signature}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  <Item label="" value={formData?.trade} />
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.footerWrapper, {width: '100%'}]}>
            <View
              style={{
                flexDirection: 'row',
                gap: 20,
                position: 'absolute',
                top: 150,
                left: 40,
                zIndex: '9999999',
              }}>
              {/* Phone Section */}
              <View style={styles.section}>
                <Icon name="call" size={20} color="#fff" style={styles.icon} />
                <View>
                  <Text style={[styles.text, {color: '#fff'}]}>
                    +91 98720 84850
                  </Text>
                  <Text style={[styles.text, {color: '#fff'}]}>
                    +91 83601 16967
                  </Text>
                </View>
              </View>

              {/* Website/Email Section */}
              <View style={styles.section}>
                <Icon name="globe" size={20} color="#fff" style={styles.icon} />
                <View>
                  <Text style={[styles.text, {color: '#fff'}]}>
                    www.base2brand.com
                  </Text>
                  <Text
                    style={[styles.text, styles.link, {color: '#fff'}]}
                    onPress={() =>
                      Linking.openURL('mailto:hello@base2brand.com')
                    }>
                    hello@base2brand.com
                  </Text>
                </View>
              </View>

              {/* Address Section */}
              <View style={styles.section}>
                <Icon
                  name="location-sharp"
                  size={20}
                  color="#fff"
                  style={styles.icon}
                />
                <View style={{}}>
                  <Text style={[styles.text, {color: '#fff'}]}>
                    F-209, Phase 8B, Industrial Area, Sector 74, Sahibzada Ajit
                    Singh Nagar,
                  </Text>
                  <Text style={[styles.text, {color: '#fff'}]}>
                    Punjab 160074
                  </Text>
                </View>
              </View>
            </View>

            {/* Banner Image */}
            <Image
              source={require('../assests/invoice_banner.png')} // Update path as needed
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>
      </ViewShot>
    </View>
  );
};

const Item = ({label, value}) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, {fontWeight: 700}]}>{value}</Text>
  </View>
);
const styles = StyleSheet.create({
  button: {
    marginVertical: 16,
    backgroundColor: '#1D4ED8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  invoice: {
    width: '100%',
    margin: '0 auto',
    background: '#fff',
    bordeRadius: 5,
    position: 'relative',
  },
  logoInvoiceOverlap: {
    width: 700,
    height: 200,
    position: 'absolute',
    top: '40%',
    transform: 'translate(-50%, -50%)',
    left: '25%',
    transform: [{ translateX: -90 }, { translateY: -30 }], 
    opacity: 0.1,
  },
  headerInvoice: {
    width: '100%',
    height: 150,
  },
  logoTextInvoice: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyLogo: {
    position: 'absolute',
    top: 40,
    left: '42%',
    width: 200,
    height: 120,
  },

  invoice_section_new: {
    padding: 20,
    marginTop: 16,
    background: '#fff',
    zIndex: 99,
    position: 'relative',
    height: 1000,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  billHead: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A', // Tailwind "text-blue-800"
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    paddingRight: 10,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  boldText: {
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    flexShrink: 1,
  },

  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  serial: {
    width: '45%',
    fontWeight: '600',
  },
  taskHeader: {
    width: '30%',
  },
  descHeader: {
    width: '30%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  taskColumn: {
    // width: '90%',
  },
  descriptionBlock: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  amount: {
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 200,
    // justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  words: {
    marginTop: 12,
    fontWeight: '600',
  },

  header1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {fontSize: 18, fontWeight: 'bold', color: '#1a2d87'},
  row: {flexDirection: 'row'},
  column: {flex: 1, paddingRight: 0},
  block: {marginBottom: 16},
  subtitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 10},
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  label: {fontWeight: '600', width: '40%'},
  value: {width: '60%'},
  signatureBlock: {marginTop: 10},
  signature: {width: 80, height: 45, marginLeft: 100},

  footerWrapper: {
    // padding: 16,
  },
  footer: {
    // backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // elevation: 4,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
    marginTop: 3,
  },
  text: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  link: {
    color: '#007AFF',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});
export default Invoice;
