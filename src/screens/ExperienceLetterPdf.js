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
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage'; // install this for local storage
import axios from 'axios';
import RenderHTML from 'react-native-render-html';
import {PermissionsAndroid} from 'react-native';
import {REACT_APP_API_BASE_URL} from '../constans/Constants';

const ExperienceLetterPdf = ({navigation, route}) => {
  const id = route?.params?.experienceId;
  const [data, setData] = useState({});

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Download PDF" onPress={generatePDF} />
      <Text style={styles.title}>Experience Letter</Text>
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
            uri: `https://invoice-backend.base2brand.com${data.companylogo}`,
          }}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
      <RenderHTML
        //   contentWidth={width}
        source={{html: data.experienceData}}
      />
      {/* <Text style={styles.experienceText}>{data.experienceData}</Text> */}
      <Text style={styles.contact}>Phone: +91 8360116967 / +91 9872084850</Text>
      <Text style={styles.contact}>
        Address: F-209, Phase 8B, Industrial Area, Sector 74, Sahibzada Ajit
        Singh Nagar, Punjab 160074
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    color: '#ef7e50',
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '600',
  },
  logo: {
    width: '100%',
    height: 170,
    marginVertical: 10,
  },
  experienceText: {
    fontSize: 16,
    marginVertical: 10,
  },
  contact: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default ExperienceLetterPdf;
