import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigationState} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = ({title, navigation}) => {
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;
  const modalStyles = {
    width: isLandscape ? 300 : '80%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Dashboard');

  const menuItems = [
    {
      name: 'home',
      label: 'Dashboard',
      routeName: 'Home',
      action: () => navigation.navigate('Home'),
    },
    {
      name: 'building',
      label: 'Company Detail',
      routeName: 'Details',
      action: () => navigation.navigate('Details'),
    },
    {
      name: 'bank',
      label: 'Bank Detail',
      routeName: 'BankDetails',
      action: () => navigation.navigate('BankDetails'),
    },
    {
      name: 'user',
      label: 'Client Detail',
      action: () => navigation.navigate('ClientDetails'),
    },
    {
      name: 'file-text',
      label: 'Invoice Detail',
      routeName: 'InvoicesDetails',
      action: () => navigation.navigate('InvoicesDetails'),
    },
    {
      name: 'user-plus',
      label: 'Add Employee',
      routeName: 'Employees',
      action: () => navigation.navigate('Employees'),
    },
    {
      name: 'money',
      label: 'Create Wages',
      routeName: 'Wages',
      action: () => navigation.navigate('Wages'),
    },
    {
      name: 'credit-card',
      label: 'Credit Cards',
      routeName: 'CreditCard',
      action: () => navigation.navigate('CreditCard'),
    },
    // {
    //   name: 'history',
    //   label: 'Credit Card History',
    //   action: () => navigation.navigate('CreditCardHistory'),
    // },
    {
      name: 'list-alt',
      label: 'Appointment Letter',
      routeName: 'Appointment',
      action: () => navigation.navigate('Appointment'),
    },
    {
      name: 'leanpub',
      label: 'Experience Letter',
      routeName: 'ExperienceLetter',
      action: () => navigation.navigate('ExperienceLetter'),
    },
    {
      name: 'folder',
      label: 'Miscellaneous',
      routeName: 'Miscellaneous',
      action: () => navigation.navigate('Miscellaneous'),
    },
  ];

  const handleLogout = () => {
    AsyncStorage.removeItem('email');
    AsyncStorage.removeItem('password');
    AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  };

  const handleNavigate = item => {
    setSelectedItem(item.label);
    item.action();
  };

  const currentRoute = useNavigationState(state => {
    const route = state.routes[state.index];
    return route.name;
  });

  console.log('currentRoutecurrentRoute', currentRoute);

  return (
    <View style={styles.header}>
      {/* Left: Hamburger Icon */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Icon name="bars" size={24} color="#000" />
      </TouchableOpacity>
      {/* Center: Screen Title */}
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={handleLogout}>
        <AntDesign name="poweroff" size={24} color="red" />
      </TouchableOpacity>
      {/* <Text style={styles.headerTitle}>{"logout"}</Text> */}
      {/* Empty space for right alignment */}
      {/* <View style={{width: 24}} /> */}

      {/* Modal for Sidebar Menu */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        supportedOrientations={['portrait', 'landscape']}>
        <View
          style={styles.modalOverlay}
          onTouchEnd={() => setModalVisible(false)}>
          <View
            style={{
              backgroundColor: 'white',
              width: isLandscape ? '30%' : '40%',
              height: '100%',
              padding: 20,
              position: 'absolute',
              top: 0,
              left: 0,
            }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.closeButton, {flexDirection: 'row'}]}>
              <Text style={{color: 'blue', fontSize: 20, fontWeight: '700'}}>
                Invoice
              </Text>
              <Icon name="times" size={24} color="#000" />
            </TouchableOpacity>
            {menuItems?.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  item.action();
                }}
                style={styles.menuItem}>
                <Icon
                  name={item?.name}
                  size={20}
                  color={currentRoute == item.routeName ? 'blue' : '#000'}
                />
                <Text
                  style={[
                    styles.menuText,
                    {color: currentRoute == item.routeName ? 'blue' : '#000'},
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    width: 400,
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  closeButton: {
    // alignSelf: 'flex-end',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default Header;
