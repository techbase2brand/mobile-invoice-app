import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage'; // install this for local storage
import axios from 'axios';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import {PDFDocument} from 'pdf-lib';
import {PermissionsAndroid} from 'react-native';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';

const ExperienceLetterPdf = ({navigation, route}) => {
  const viewRef = useRef();

  const id = route?.params?.experienceId;
  const [data, setData] = useState({});

  console.log('dataaaaexperience ', data);
  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (id) {
        const apiUrl = `${REACT_APP_API_BASE_URL}/api/experience-get/${id}`;
        axios
          .get(apiUrl, {headers})
          .then(response => {
            const invoiceData = response.data.data;
            setData(invoiceData);
          })
          .catch(error => {
            console.error('Error fetching experience data:', error);
          });
      }
    };

    fetchData();
  }, [id]);

  const formatDate = dateString => {
    const options = {day: 'numeric', month: 'long', year: 'numeric'};
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const generatePDF = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission required',
          'Storage permission is needed to save the PDF.',
        );
        return;
      }
    }

    const htmlContent = `
      <h1 style="text-align:center;color:#ef7e50;">Experience Letter</h1>
      <p>Ref No: <strong>${data.refNo || ''}</strong></p>
      <p>Date: <strong>${
        data?.experienceDate ? formatDate(data.experienceDate) : ''
      }</strong></p>
      <div>${data.experienceData || ''}</div>
      <br />
      <div>
        <p><strong>Phone:</strong> +91 8360116967, +91 9872084850</p>
        <p><strong>Address:</strong> F-209, Phase 8B, Industrial Area, Sector 74, Sahibzada Ajit Singh Nagar, Punjab 160074</p>
      </div>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: 'experience_letter',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Success', `PDF saved to: ${file.filePath}`);
    } catch (err) {
      console.error('PDF generation error:', err);
      Alert.alert('Error', 'Something went wrong while generating the PDF.');
    }
  };
  const createPDF = async () => {
    try {
      // 1. Capture the view as PNG image file
      const uri = await viewRef.current.capture();
      console.log('Captured URI:', uri);

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
      const maxWidth = pageWidth - 60; // 30 padding on each side
      const maxHeight = pageHeight - 60;

      // Scale down proportionally if needed
      let scale = Math.min(
        maxWidth / pngDims.width,
        maxHeight / pngDims.height,
      );
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

      // 5. Save and write PDF file
      const base64Pdf = await pdfDoc.saveAsBase64({dataUri: false});
      const pdfPath = `${RNFS.DocumentDirectoryPath}/experience_letter.pdf`;
      await RNFS.writeFile(pdfPath, base64Pdf, 'base64');
      console.log('PDF saved to:', pdfPath);
      Alert.alert('PDF Saved Successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('PDF Error', error.message);
    }
  };

  const companyLogo = data?.companylogo;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={createPDF}>
        <Text style={styles.buttonText}>Pdf Download</Text>
      </TouchableOpacity>
      {/* <Button title="Download PDF" onPress={generatePDF} /> */}
      <ViewShot ref={viewRef} options={{format: 'png', quality: 0.9}}>
        <ScrollView>
          <Text style={[styles.title,{color: `${
                companyLogo === '/uploads/SAI LOGO copy [Recovered]-01 2.png'
                  ? '#ef7e50'
                  : companyLogo === '/uploads/ks-01.png'
                  ? '#1F8C97'
                  : companyLogo ===
                    '/uploads/Campus-logo-design-Trademark-1024x334 1.png'
                  ? '#154880'
                  : '#042DA0'
              }`,}]}>Experience Letter</Text>
          <Text>
            Ref No: <Text style={styles.bold}>{data.refNo}</Text>
          </Text>
          <Text>
            Date:{' '}
            <Text style={styles.bold}>
              {data.experienceDate ? formatDate(data.experienceDate) : ''}
            </Text>
          </Text>
          {data?.companylogo && (
            <Image
              source={{
                uri: `https://invoice-backend.base2brand.com${data?.companylogo}`,
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <RenderHTML source={{html: data.experienceData}} />

          <View style={[styles.mainFooter,{backgroundColor:`${
              companyLogo === "/uploads/SAI LOGO copy [Recovered]-01 2.png"
                ? "#ef7e50"
                : companyLogo === "/uploads/ks-01.png"
                ? "#1F8C97"
                : companyLogo ===
                  "/uploads/Campus-logo-design-Trademark-1024x334 1.png"
                ? "#154880"
                : companyLogo == '/uploads/31-31.png'
                    ? '#042DA0'
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
                    <Text style={styles.text}>
                    {companyLogo ===
                    "/uploads/SAI LOGO copy [Recovered]-01 2.png"
                      ? "www.sailegalassociates.com"
                      : companyLogo === "/uploads/ks-01.png"
                      ? "www.ksnetworkingsolutions.com"
                      : companyLogo ===
                        "/uploads/Campus-logo-design-Trademark-1024x334 1.png"
                      ? "www.b2bcampus.com"
                       : companyLogo== "/uploads/31-31.png"
                      ? "https://www.base2brand.com"
                      : "www.Aashuenterprises.com"}
                      </Text>
                    <Text style={styles.text}>
                    {companyLogo ===
                    "/uploads/SAI LOGO copy [Recovered]-01 2.png"
                      ? "hello@sailegalassociates.com"
                      : companyLogo === "/uploads/ks-01.png"
                      ? "hello@ksnetworkingsolutions.com"
                      : companyLogo ===
                        "/uploads/Campus-logo-design-Trademark-1024x334 1.png"
                      ? "hello@base2brand.com"
                        : companyLogo== "/uploads/31-31.png"
                      ? "hello@base2brand.com"
                      : "hello@Aashuenterprises.com"}
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
{/* 
            <Image
              source={require('../assests/invoice_banner_appoinment.png')}
              style={styles.banner}
            /> */}
          </View>
        </ScrollView>
      </ViewShot>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
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
  title: {
    fontSize: 24,
    color: '#ef7e50',
    fontWeight: 'bold',
    marginVertical: 10,
    marginTop: 40,
  },
  bold: {
    fontWeight: '600',
  },
  logo: {
    width: '50%',
    height: 170,
    marginBottom: 10,
    alignSelf:'flex-end'
  },
  experienceText: {
    fontSize: 16,
    marginVertical: 10,
  },
  contact: {
    fontSize: 14,
    marginVertical: 2,
  },
  mainFooter: {
    padding: 16,
    backgroundColor: '#f4f4f4',
    position: 'relative',
    height:100,
    marginTop:40
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
  bottomMargin: {
    marginBottom: 8,
  },
  banner: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
});

export default ExperienceLetterPdf;
