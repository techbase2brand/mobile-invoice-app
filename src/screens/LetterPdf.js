import React, {useEffect, useState} from 'react';
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

const LetterPdf = ({route}) => {
  const id = route?.params?.latterId;
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

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <body>
          <div style="text-align: center;">
            <img src="https://invoice-backend.base2brand.com${selectedLogo}" width="100" />
            <p>Ref No: ${data.refNo || ''}</p>
            <p>Date: ${formatDate(data.letterHeadDate)}</p>
            <div>${data.letterHeadData}</div>
          </div>
        </body>
      </html>
    `;

    const options = {
      html: htmlContent,
      fileName: 'Letter',
      directory: 'Documents',
    };

    try {
      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('PDF Generated', `Saved to ${file.filePath}`);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const options = {day: 'numeric', month: 'long', year: 'numeric'};
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <ScrollView contentContainerStyle={{padding: 20}}>
      <TouchableOpacity
        onPress={generatePDF}
        style={{
          backgroundColor: '#1D4ED8',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>Download PDF</Text>
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

      <Image
        source={{uri: `https://invoice-backend.base2brand.com${selectedLogo}`}}
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
              <Icon name="call" size={20} color="#fff" style={styles.icon} />
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
              <Icon name="globe" size={20} color="#fff" style={styles.icon} />
              <View>
                <Text style={styles.text}>www.sailegalassociates.com</Text>
                <Text style={styles.text}>hello@sailegalassociates.com</Text>
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
                  F-209, Phase 8B, Industrial Area, Sector 74, Sahibzada Ajit
                  Singh Nagar,
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
    </ScrollView>
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
});
