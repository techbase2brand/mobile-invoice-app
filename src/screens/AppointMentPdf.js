import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RenderHTML from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import {PDFDocument} from 'pdf-lib';

const AppointMentPdf = ({route}) => {
  const id = route?.params?.appointmentId;
  const viewRef = useRef();
  const [data, setData] = useState({});
  const [companyLogos, setCompanyLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  console.log('appiointmentdata', data);
  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from localStorage
      const headers = {
        Authorization: `Bearer ${token}`, // Use the token from localStorage
        'Content-Type': 'application/json', // Add any other headers if needed
      };
      if (id) {
        const apiUrl = `${REACT_APP_API_BASE_URL}/api/appointment-get/${id}`;
        axios
          .get(apiUrl, {headers})
          .then(response => {
            const invoiceData = response.data.data;
            setData(invoiceData);
          })
          .catch(error => {
            console.error('Error fetching Wages details:', error);
          });
      }
    };
    fetchData();
  }, [id]);

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
      // page.drawImage(pngImage, {
      //   x: 30,
      //   y: 841.89 - pngDims.height - 30,
      //   width: pngDims.width,
      //   height: pngDims.height,
      // });

      // 5. Save and write PDF file
      const base64Pdf = await pdfDoc.saveAsBase64({dataUri: false});
      const pdfPath = `${RNFS.DocumentDirectoryPath}/appoint_letter.pdf`;
      await RNFS.writeFile(pdfPath, base64Pdf, 'base64');

      console.log('PDF saved to:', pdfPath);
      Alert.alert('PDF Saved Successfully');
      // 6. Share
      // await Share.open({
      //   url: `file://${pdfPath}`,
      //   type: 'application/pdf',
      // });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('PDF Error', error.message);
    }
  };
  const formatDate = dateStr => {
    if (!dateStr) return '';
    const options = {day: 'numeric', month: 'long', year: 'numeric'};
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };
  const companyLogo = data?.companyLogo;
  return (
    <View style={{padding: 20}}>
      <TouchableOpacity style={styles.button} onPress={createPDF}>
        <Text style={styles.buttonText}>Pdf Download</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: '#374151',
          padding: 10,
          borderRadius: 6,
          marginBottom: 20,
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          {selectedLogo ? 'Change Logo' : 'Select Company Logo'}
        </Text>
      </TouchableOpacity> */}
      <ViewShot ref={viewRef} options={{format: 'png', quality: 0.9}}>
        <ScrollView>
          <View
            style={{
              marginBottom: 20,
              border: 5,
              borderBottomWidth: 2,
              borderBottomColor: 'black',
              paddingVertical: 20,
            }}>
            <Image
              source={{
                uri: `https://invoice-backend.base2brand.com${data?.companyLogo}`,
              }}
              style={{
                width: 240,
                height: 80,
                marginTop: 10,
                alignSelf: 'center',
              }}
            />
          </View>
          <Image
            source={{
              uri: `https://invoice-backend.base2brand.com${data?.companyLogo}`,
            }}
            style={styles.logoInvoiceOverlap}
          />
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 24,
              marginBottom: 10,
              color: `${
                companyLogo === '/uploads/SAI LOGO copy [Recovered]-01 2.png'
                  ? '#ef7e50'
                  : companyLogo === '/uploads/ks-01.png'
                  ? '#1F8C97'
                  : companyLogo ===
                    '/uploads/Campus-logo-design-Trademark-1024x334 1.png'
                  ? '#154880'
                  : companyLogo == '/uploads/31-31.png'
                  ? '#042DA0'
                  : '#042DA0'
              }`,
            }}>
            Appointment Letter
          </Text>
          <Text style={{fontWeight: 'bold'}}>Ref No: {data.refNo}</Text>
          <Text style={{marginBottom: 10}}>
            Date: {formatDate(data.letterHeadDate)}
          </Text>
          <RenderHTML
            //   contentWidth={width}
            source={{html: data?.appointMentData}}
          />
          <View
            style={[
              styles.mainFooter,
              {
                backgroundColor: `${
                  companyLogo === '/uploads/SAI LOGO copy [Recovered]-01 2.png'
                    ? '#ef7e50'
                    : companyLogo === '/uploads/ks-01.png'
                    ? '#1F8C97'
                    : companyLogo ===
                      '/uploads/Campus-logo-design-Trademark-1024x334 1.png'
                    ? '#154880'
                    : companyLogo == '/uploads/31-31.png'
                    ? '#042DA0'
                    : '#042DA0'
                }`,
              },
            ]}>
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

            {/* <Image
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
  mainFooter: {
    padding: 16,
    backgroundColor: '#f4f4f4',
    position: 'relative',
    height: 100,
    marginTop: 40,
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
    height: 400,
    resizeMode: 'contain',
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
  logoInvoiceOverlap: {
    width: 680,
    height: 200,
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    left: '25%',
    transform: [{translateX: -90}, {translateY: -30}],
    opacity: 0.1,
  },
});

export default AppointMentPdf;
