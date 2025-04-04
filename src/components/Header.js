import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Header = ({title, navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Dashboard");
  const menuItems = [
    {
      name: 'home',
      label: 'Dashboard',
      action: () => navigation.navigate('Home'),
    },
    {
      name: 'building',
      label: 'Company Detail',
      action: () => navigation.navigate('Details'),
    },
    {
      name: 'bank',
      label: 'Bank Detail',
      action: () => navigation.navigate('BankDetail'),
    },
    {
      name: 'user',
      label: 'Client Detail',
      action: () => navigation.navigate('ClientDetail'),
    },
    {
      name: 'file-text',
      label: 'Invoice Detail',
      action: () => navigation.navigate('InvoiceDetail'),
    },
    {
      name: 'user-plus',
      label: 'Add Employee',
      action: () => navigation.navigate('AddEmployee'),
    },
    {
      name: 'money',
      label: 'Create Wages',
      action: () => navigation.navigate('CreateWages'),
    },
    {
      name: 'credit-card',
      label: 'Credit Cards',
      action: () => navigation.navigate('CreditCards'),
    },
    {
      name: 'history',
      label: 'Credit Card History',
      action: () => navigation.navigate('CreditCardHistory'),
    },
    {
      name: 'list-alt',
      label: 'Appointment Letter',
      action: () => navigation.navigate('AppointmentLetter'),
    },
    {
      name: 'leanpub',
      label: 'Experience Letter',
      action: () => navigation.navigate('ExperienceLetter'),
    },
    {
      name: 'folder',
      label: 'Miscellaneous',
      action: () => navigation.navigate('Miscellaneous'),
    },
  ];
  return (
    <View style={styles.header}>
      {/* Left: Hamburger Icon */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Icon name="bars" size={24} color="#000" />
      </TouchableOpacity>

      {/* Center: Screen Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Empty space for right alignment */}
      <View style={{width: 24}} />

      {/* Modal for Sidebar Menu */}
      <Modal visible={modalVisible} transparent={true} animationType="none">
        <View
          style={styles.modalOverlay}
          onTouchEnd={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.closeButton, {flexDirection:'row' }]}>
                <Text style={{color:'blue', fontSize:20, fontWeight:"700"}}>Invoice</Text>
              <Icon name="times" size={24} color="#000" />
            </TouchableOpacity>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                //    onPress={item.action}
                onPress={() => {
                  setSelectedItem(item.label);
                  item.action();
                }}
                style={styles.menuItem}>
                <Icon
                  name={item.name}
                  size={20}
                  color={selectedItem === item.label ? 'blue' : '#000'}
                />
                <Text
                  style={[
                    styles.menuText,
                    {color: selectedItem === item.label ? 'blue' : '#000'},
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
    justifyContent:"space-between",
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
