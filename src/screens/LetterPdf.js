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

const LetterPdf = ({route}) => {
  const id = route?.params?.latterId;
  const viewRef = useRef();
  const [data, setData] = useState({});
  const [companyLogos, setCompanyLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchLetterData = async () => {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (id) {
        const apiUrl = `${REACT_APP_API_BASE_URL}/api/letter-get/${id}`;
        try {
          const response = await axios.get(apiUrl, {headers});
          setData(response.data.data);
        } catch (error) {
          console.error('Error fetching letter data:', error);
        }
      }
    };

    fetchLetterData();
  }, [id]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await fetch(
          `${REACT_APP_API_BASE_URL}/api/get-companyLogo`,
        );
        const json = await res.json();
        if (json.success) {
          setCompanyLogos(json.data);
        }
      } catch (error) {
        console.error('Error fetching logos:', error);
      }
    };

    fetchLogos();
  }, []);

  // const generatePDF = async () => {
  //   const htmlContent = `
  //     <html>
  //       <body>
  //         <div style="text-align: center;">
  //           <img src="https://invoice-backend.base2brand.com${selectedLogo}" width="100" />
  //           <p>Ref No: ${data.refNo || ''}</p>
  //           <p>Date: ${formatDate(data.letterHeadDate)}</p>
  //           <div>${data.letterHeadData}</div>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //   const options = {
  //     html: htmlContent,
  //     fileName: 'Letter',
  //     directory: 'Documents',
  //   };

  //   try {
  //     const file = await RNHTMLtoPDF.convert(options);
  //     Alert.alert('PDF Generated', `Saved to ${file.filePath}`);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };
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
      const pdfPath = `${RNFS.DocumentDirectoryPath}/letter_head.pdf`;
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

  return (
    <View style={{padding: 20}}>
      {/* <TouchableOpacity
        onPress={createPDF}
        style={{
          backgroundColor: '#1D4ED8',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>Download PDF</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.button} onPress={createPDF}>
        <Text style={styles.buttonText}>Pdf Download</Text>
      </TouchableOpacity>

      <TouchableOpacity
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
      </TouchableOpacity>
      <ViewShot ref={viewRef} options={{format: 'png', quality: 0.9}}>
        <ScrollView>
          <Image
            source={{
              uri: `https://invoice-backend.base2brand.com${selectedLogo}`,
            }}
            style={{height: 80, resizeMode: 'contain', marginBottom: 20}}
          />

          <Text style={{fontWeight: 'bold'}}>Ref No: {data.refNo}</Text>
          <Text style={{marginBottom: 10}}>
            Date: {formatDate(data.letterHeadDate)}
          </Text>
          <RenderHTML
            //   contentWidth={width}
            source={{html: data?.letterHeadData}}
          />
          <View style={styles.mainFooter}>
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

            <Image
              source={require('../assests/invoice_banner_appoinment.png')}
              style={styles.banner}
            />
          </View>
        </ScrollView>
      </ViewShot>
      {/* Modal for selecting logo */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000aa',
            justifyContent: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              margin: 20,
              padding: 20,
              borderRadius: 10,
            }}>
            <Text style={{fontWeight: 'bold', marginBottom: 10}}>
              Select Logo
            </Text>
            <ScrollView style={{maxHeight: 300}}>
              {companyLogos?.map(logo => (
                <TouchableOpacity
                  key={logo._id}
                  onPress={() => {
                    setSelectedLogo(logo.companylogo);
                    setModalVisible(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}>
                  <Image
                    source={{
                      uri: `https://invoice-backend.base2brand.com${logo.companylogo}`,
                    }}
                    style={{width: 40, height: 40, marginRight: 10}}
                  />
                  <Text>{logo.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 10,
                backgroundColor: '#E5E7EB',
                padding: 10,
                borderRadius: 6,
              }}>
              <Text style={{textAlign: 'center'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LetterPdf;
const styles = StyleSheet.create({
  mainFooter: {
    padding: 16,
    backgroundColor: '#f4f4f4',
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    gap: 20,
    position: 'absolute',
    top: 100,
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
});
