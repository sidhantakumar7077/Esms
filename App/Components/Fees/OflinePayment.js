import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { Colors } from '../../Constants/Colors'
import { Images } from '../../Constants/Images'
import { moderateScale } from '../../Constants/PixelRatio'


const paymentData = [
  {
    paymentDate: '21/12/2023', submitDate: '21/12/2023  05:10 PM', amount: '12000', aprooved: '', paymentId: '',
    transportFeesMonth: 'january', RoutePickUpPoint: 'Brooklyn East (Brooklyn North)', PaymentFrom: 'MUDASiR RASHID',
    reference: 'abcd', PaymentMode: 'Ofline', Comments: '', requestId: '112', status: 'Pending'
  },
  {
    paymentDate: '21/12/2023', submitDate: '21/12/2023  05:10 PM', amount: '12000', aprooved: '', paymentId: '',
    transportFeesMonth: 'january', RoutePickUpPoint: 'Brooklyn East (Brooklyn North)', PaymentFrom: 'MUDASiR RASHID',
    reference: 'abcd', PaymentMode: 'Ofline', Comments: '', requestId: '112', status: 'Pending'
  },
  {
    paymentDate: '21/12/2023', submitDate: '21/12/2023  05:10 PM', amount: '12000', aprooved: '', paymentId: '',
    transportFeesMonth: 'january', RoutePickUpPoint: 'Brooklyn East (Brooklyn North)', PaymentFrom: 'MUDASiR RASHID',
    reference: 'abcd', PaymentMode: 'Ofline', Comments: '', requestId: '112', status: 'Pending'
  },
  {
    paymentDate: '21/12/2023', submitDate: '21/12/2023  05:10 PM', amount: '12000', aprooved: '', paymentId: '',
    transportFeesMonth: 'january', RoutePickUpPoint: 'Brooklyn East (Brooklyn North)', PaymentFrom: 'MUDASiR RASHID',
    reference: 'abcd', PaymentMode: 'Ofline', Comments: '', requestId: '112', status: 'Pending'
  },
  {
    paymentDate: '21/12/2023', submitDate: '21/12/2023  05:10 PM', amount: '12000', aprooved: '', paymentId: '',
    transportFeesMonth: 'january', RoutePickUpPoint: 'Brooklyn East (Brooklyn North)', PaymentFrom: 'MUDASiR RASHID',
    reference: 'abcd', PaymentMode: 'Ofline', Comments: '', requestId: '112', status: 'Pending'
  },
  {
    paymentDate: '21/12/2023', submitDate: '21/12/2023  05:10 PM', amount: '12000', aprooved: '', paymentId: '',
    transportFeesMonth: 'january', RoutePickUpPoint: 'Brooklyn East (Brooklyn North)', PaymentFrom: 'MUDASiR RASHID',
    reference: 'abcd', PaymentMode: 'Ofline', Comments: '', requestId: '112', status: 'Pending'
  },

]
const OflinePayment = () => {
  return (
    <ScrollView style={{
      backgroundColor: Colors.white2,
      width: '100%',
    }}>
      <View style={{...appStyles.main,width:'95%'}}>
        {paymentData && paymentData.map((item, index) => {
          return (
            <View style={appStyles.card}>
              <View style={appStyles.titleRow}>
                <Text style={TextStyles.title2}>Request ID {item.requestId}</Text>
                <View style={{ ...styles.paidType, }}>
                  <Text style={{ ...TextStyles.title2, color: Colors.white2 }}>{item.status}</Text>
                </View>
              </View>
              <View style={{ padding: 15, paddingTop: 5 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Payment Date</Text>
                  <Text style={styles.valueText}>{item.paymentDate}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Submit Date</Text>
                  <Text style={styles.valueText}>{item.submitDate}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Amount</Text>
                  <Text style={styles.valueText}>{item.amount}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Approved/Rejected</Text>
                  <Text style={styles.valueText}>{item.aprooved}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Payment ID</Text>
                  <Text style={styles.valueText}>{item.paymentId}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Transport Fees Month</Text>
                  <Text style={styles.valueText}>{item.transportFeesMonth}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Route Pickup Point</Text>
                  <Text style={styles.valueText}>{item.RoutePickUpPoint}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Payment From</Text>
                  <Text style={styles.valueText}>{item.PaymentFrom}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Reference</Text>
                  <Text style={styles.valueText}>{item.reference}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Payment Mode</Text>
                  <Text style={styles.valueText}>{item.PaymentMode}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.keyText}>Comments</Text>
                  <Text style={styles.valueText}>{item.Comments}</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

    </ScrollView>
  )
}

export default OflinePayment

const styles = StyleSheet.create({
  paidType: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: moderateScale(6),
    backgroundColor: Colors.tangerine5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    ...TextStyles.keyText,
    flex: 1
  },
  valueText: {
    ...TextStyles.valueText,
    flex: 1.5
  },
})