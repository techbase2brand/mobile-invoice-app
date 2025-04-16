import React, {useEffect, useRef, useState} from 'react';
import {
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

const Invoice = ({navigation, route}) => {
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
        html:`<html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                /* Base Styles */
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
        
                .invoice-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: white;
                    position: relative;
                }
        
                /* Header Section */
                .header-image {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                }
        
                .company-logo {
                    position: absolute;
                    top: 44px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 180px;
                    height: 60px;
                    z-index: 1;
                }
        
                /* Billing Info Section */
                .billing-section {
                    padding: 20px;
                    margin-top: 20px;
                }
        
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #000;
                    padding-bottom: 8px;
                    margin-bottom: 8px;
                }
        
                .bill-head {
                    font-size: 16px;
                    font-weight: bold;
                    color: #1E3A8A;
                }
        
                .body-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    margin: 15px 0;
                }
        
                /* Table Styles */
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
        
                .invoice-table th {
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid #000;
                }
        
                .invoice-table td {
                    padding: 8px;
                    vertical-align: top;
                }
        
                /* Total Section */
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    border-top: 1px solid #000;
                    padding-top: 8px;
                    margin-top: 20px;
                }
        
                /* Payment Details */
                .payment-section {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    margin: 20px 0;
                }
        
                .payment-column {
                    flex: 1;
                }
        
                /* Footer Styles */
                .footer {
                    position: relative;
                    margin-top: 20px;
                }
        
                .footer-banner {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }
        
                .contact-info {
                    position: absolute;
                    top: 50%;
                    left: 40px;
                    transform: translateY(-50%);
                    color: white;
                    display: flex;
                    gap: 20px;
                }
        
                .contact-section {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    max-width: 300px;
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <!-- Header Images -->
                <img src="../assests/header_invoice.png" class="header-image">
                <img src="https://invoice-backend.base2brand.com${formData.companylogo}" class="company-logo">
        
                <!-- Billing Information -->
                <div class="billing-section">
                    <div class="header-row">
                        <h2 class="bill-head">Bill To</h2>
                        <h2 class="bill-head">Original For Recipient</h2>
                    </div>
        
                    <div class="body-row">
                        <!-- Client Information -->
                        <div class="left-column">
                            <p><strong>{${formData.client}}</strong></p>
                            <p>{${formData.company}}</p>
                            <p>{${formData.clientAddress}}</p>
                            <p>{${formData.clientAddress1}}</p>
                            <p>{${formData.clientAddress2}}</p>
                            <p>{${formData.email}}</p>
                            <p>{${formData.mobileNo}}</p>
                        </div>
        
                        <!-- Invoice Details -->
                        <div class="right-column">
                            <div class="info-row">
                                <span>Invoice No.</span>
                                <span>{${formData.invoiceNo}}</span>
                            </div>
                            <div class="info-row">
                                <span>Invoice Date</span>
                                <span>{${formData.selectDate}}</span>
                            </div>
                            {{#if formData.gstNo}}
                            <div class="info-row">
                                <span>GST Code</span>
                                <span>{${formData.gstNo}}</span>
                            </div>
                            {{/if}}
                        </div>
                    </div>
        
                    <!-- Items Table -->
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>Task</th>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each data}}
                            <tr>
                                <td>{{@index}}</td>
                                <td>{${this.task}}</td>
                                <td>
                                    {{#each this.description}}
                                    <div>{${this}}</div>
                                    {{/each}}
                                </td>
                                <td>
                                    {{#each this.amounts}}
                                    <div>{{this}}</div>
                                    {{/each}}
                                </td>
                            </tr>
                            {{/each}}
                        </tbody>
                    </table>
        
                    <!-- Total Section -->
                    <div class="total-row">
                        <h3>Total Value</h3>
                        <h3>{{formData.currency}} {{totalAmount}}</h3>
                    </div>
                    <p>In Words: {{amountInWords}} Only /-</p>
                </div>
        
                <!-- Payment Details -->
                <div class="payment-section">
                    <div class="payment-column">
                        <h3>{{paymentMethodTitle}}</h3>
                        {{#if formData.bankNamed}}
                        <div class="payment-details">
                            <p>Bank: {{formData.bankNamed}}</p>
                            <p>Branch: {{formData.BranchName}}</p>
                            <p>Account No.: {{formData.accNo}}</p>
                            <!-- Add other bank details -->
                        </div>
                        {{/if}}
                    </div>
        
                    <div class="payment-column">
                        <h3>Company Details</h3>
                        <p>Trade Name: {{formData.trade}}</p>
                        <p>GSTIN: {{formData.CompanygstNo}}</p>
                        <p>Address: {{formData.companyAddress}}</p>
                        {{#if formData.signature}}
                        <img src="{{formData.signature}}" class="signature">
                        {{/if}}
                    </div>
                </div>
        
                <!-- Footer -->
                <div class="footer">
                    <div class="contact-info">
                        <div class="contact-section">
                            <i class="fas fa-phone"></i>
                            <div>
                                <p>+91 98720 84850</p>
                                <p>+91 83601 16967</p>
                            </div>
                        </div>
                        
                        <div class="contact-section">
                            <i class="fas fa-globe"></i>
                            <div>
                                <p>www.base2brand.com</p>
                                <a href="mailto:hello@base2brand.com">hello@base2brand.com</a>
                            </div>
                        </div>
                        
                        <div class="contact-section">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <p>F-209, Phase 8B, Industrial Area, Sector 74,</p>
                                <p>Sahibzada Ajit Singh Nagar, Punjab 160074</p>
                            </div>
                        </div>
                    </div>
                    <img src="../assests/invoice_banner.png" class="footer-banner">
                </div>
            </div>
        </body>
        </html>`,
        fileName: 'file',
        directory: Platform.OS == 'android' ? 'Downloads' : 'Documents',
      };
      let file = await RNHTMLtoPDF.convert(PDFOptions);
      if (!file.filePath) return;
      Alert.alert(file.filePath);
    } catch (error) {
      console.log('Failed to generate pdf', error.message);
    }
  };
  const generatePDF = async () => {
    const htmlContent = `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Base Styles */
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
        }

        .invoice-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            position: relative;
        }

        /* Header Section */
        .header-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }

        .company-logo {
            position: absolute;
            top: 44px;
            left: 50%;
            transform: translateX(-50%);
            width: 180px;
            height: 60px;
            z-index: 1;
        }

        /* Billing Info Section */
        .billing-section {
            padding: 20px;
            margin-top: 20px;
        }

        .header-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
        }

        .bill-head {
            font-size: 16px;
            font-weight: bold;
            color: #1E3A8A;
        }

        .body-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin: 15px 0;
        }

        /* Table Styles */
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .invoice-table th {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #000;
        }

        .invoice-table td {
            padding: 8px;
            vertical-align: top;
        }

        /* Total Section */
        .total-row {
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 20px;
        }

        /* Payment Details */
        .payment-section {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin: 20px 0;
        }

        .payment-column {
            flex: 1;
        }

        /* Footer Styles */
        .footer {
            position: relative;
            margin-top: 20px;
        }

        .footer-banner {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }

        .contact-info {
            position: absolute;
            top: 50%;
            left: 40px;
            transform: translateY(-50%);
            color: white;
            display: flex;
            gap: 20px;
        }

        .contact-section {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            max-width: 300px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header Images -->
        <img src="../assests/header_invoice.png" class="header-image">
        <img src="https://invoice-backend.base2brand.com${formData.companylogo}" class="company-logo">

        <!-- Billing Information -->
        <div class="billing-section">
            <div class="header-row">
                <h2 class="bill-head">Bill To</h2>
                <h2 class="bill-head">Original For Recipient</h2>
            </div>

            <div class="body-row">
                <!-- Client Information -->
                <div class="left-column">
                    <p><strong>{{formData.client}}</strong></p>
                    <p>{{formData.company}}</p>
                    <p>{{formData.clientAddress}}</p>
                    <p>{{formData.clientAddress1}}</p>
                    <p>{{formData.clientAddress2}}</p>
                    <p>{{formData.email}}</p>
                    <p>{{formData.mobileNo}}</p>
                </div>

                <!-- Invoice Details -->
                <div class="right-column">
                    <div class="info-row">
                        <span>Invoice No.</span>
                        <span>{{formData.invoiceNo}}</span>
                    </div>
                    <div class="info-row">
                        <span>Invoice Date</span>
                        <span>{{formData.selectDate}}</span>
                    </div>
                    {{#if formData.gstNo}}
                    <div class="info-row">
                        <span>GST Code</span>
                        <span>{{formData.gstNo}}</span>
                    </div>
                    {{/if}}
                </div>
            </div>

            <!-- Items Table -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Sr. No.</th>
                        <th>Task</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each data}}
                    <tr>
                        <td>{{@index}}</td>
                        <td>{{this.task}}</td>
                        <td>
                            {{#each this.description}}
                            <div>{{this}}</div>
                            {{/each}}
                        </td>
                        <td>
                            {{#each this.amounts}}
                            <div>{{this}}</div>
                            {{/each}}
                        </td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>

            <!-- Total Section -->
            <div class="total-row">
                <h3>Total Value</h3>
                <h3>{{formData.currency}} {{totalAmount}}</h3>
            </div>
            <p>In Words: {{amountInWords}} Only /-</p>
        </div>

        <!-- Payment Details -->
        <div class="payment-section">
            <div class="payment-column">
                <h3>{{paymentMethodTitle}}</h3>
                {{#if formData.bankNamed}}
                <div class="payment-details">
                    <p>Bank: {{formData.bankNamed}}</p>
                    <p>Branch: {{formData.BranchName}}</p>
                    <p>Account No.: {{formData.accNo}}</p>
                    <!-- Add other bank details -->
                </div>
                {{/if}}
            </div>

            <div class="payment-column">
                <h3>Company Details</h3>
                <p>Trade Name: {{formData.trade}}</p>
                <p>GSTIN: {{formData.CompanygstNo}}</p>
                <p>Address: {{formData.companyAddress}}</p>
                {{#if formData.signature}}
                <img src="{{formData.signature}}" class="signature">
                {{/if}}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="contact-info">
                <div class="contact-section">
                    <i class="fas fa-phone"></i>
                    <div>
                        <p>+91 98720 84850</p>
                        <p>+91 83601 16967</p>
                    </div>
                </div>
                
                <div class="contact-section">
                    <i class="fas fa-globe"></i>
                    <div>
                        <p>www.base2brand.com</p>
                        <a href="mailto:hello@base2brand.com">hello@base2brand.com</a>
                    </div>
                </div>
                
                <div class="contact-section">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <p>F-209, Phase 8B, Industrial Area, Sector 74,</p>
                        <p>Sahibzada Ajit Singh Nagar, Punjab 160074</p>
                    </div>
                </div>
            </div>
            <img src="../assests/invoice_banner.png" class="footer-banner">
        </div>
    </div>
</body>
</html>
    `;

    const pdfPath = `${RNFS.DocumentDirectoryPath}/invoice.pdf`;

    // Generate PDF using react-native-pdf or another PDF generation library
    const result = await RNFS.writeFile(pdfPath, htmlContent, 'utf8');
    console.log('PDF file created at:', pdfPath);

    // Share or trigger the download directly
    // share({
    //   title: 'Invoice PDF',
    //   url: `file://${pdfPath}`,
    // });

    setIsDownloaded(true); // Hide the button after download
  };
  return (
    <View style={{marginTop: 40, paddingHorizontal: 16}}>
      <TouchableOpacity style={styles.button} onPress={createPDF}>
        <Text style={styles.buttonText}>Pdf Download</Text>
      </TouchableOpacity>
      <ScrollView style={[styles.invoice, {background: '#fff'}]}>
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
                  {formData.signature && (
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
                  <Item label="" value={formData.trade} />
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
    width: 180,
    height: 60,
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    left: '50%',
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
    top: 44,
    left: '42%',
    width: 180,
    height: 60,
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
