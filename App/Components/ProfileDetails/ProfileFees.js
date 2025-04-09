import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextStyles } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import { moderateScale, scale } from '../../Constants/PixelRatio';

const ProfileFees = ({ data }) => {
  const renderStatus = (status) => {
    return (
      <View style={[styles.statusContainer, status === 'Paid' ? styles.paid : styles.unpaid]}>
        <Icon name={status === 'Paid' ? 'checkmark-circle' : 'close-circle'} size={scale(15)} color="white" />
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  return (
    <ScrollView horizontal>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          {['Fees Group', 'Fees Code', 'Due Date', 'Status', 'Amount (₹)','Payment ID','Date','Discount (₹)','Fine', 'Paid (₹)', 'Balance (₹)'].map((header, index) => (
            <Text key={index} style={{...TextStyles.title2,color:Colors.text,width:100}}>{header}</Text>
          ))}
        </View>
        {data?.tranport_fee.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.fees_group_name}</Text>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.fees_code}</Text>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.due_date}</Text>
            <View style={[TextStyles.keyText2,{width:100}]}>{renderStatus(item.status)}</View>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.amount}</Text>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.payment_id?item.payment_id:'N/A'}</Text>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.mode?item.mode:'N/A'}</Text>
            <Text style={[TextStyles.keyText2,{width:100}]}>{item.paid_amount}</Text>
            <Text style={[TextStyles.keyText2,{width:100}]}>{parseFloat(item.amount) - parseFloat(item.paid_amount)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  statusContainer: {
    width:'80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 5,
  },
  statusText: {
    color: 'white',
    marginLeft: 5,
  },
  paid: {
    backgroundColor: 'green',
  },
  unpaid: {
    backgroundColor: 'red',
  },
});

export default ProfileFees;
