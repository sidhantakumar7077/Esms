import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import { moderateScale } from '../../Constants/PixelRatio';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import UseApi from '../../ApiConfig';
import FeesDetails from '../../Components/Fees/FeesDetails';

const Fees = () => {
  const { Request } = UseApi();
  const { colors } = useTheme();
  const { userData } = useSelector(state => state.User);
  const [loading, setLoading] = useState(false);
  const [studentDueFees, setStudentDueFees] = useState([]);
  const [transportFees, setTransportFees] = useState([]);
  const [grandTotal, setGrandTotal] = useState(null);

  useEffect(() => {
    getFeesDetails();
  }, []);

  const getFeesDetails = async () => {
    setLoading(true);
    let params = { user_id: userData.id };

    try {
      const data = await Request('feesList', 'POST', params);
      if (data.status && data?.data) {
        setGrandTotal(data.data?.grand_total);
        setStudentDueFees(data.data?.student_due_fee);
        setTransportFees(data.data?.tranport_fee);
      }
    } catch (err) {
      console.log('Error fetching fees:', err);
    }

    setLoading(false);
  };

  return (
    <View 
      // behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1,marginBottom:-100}}
    >
      <View style={{ flex: 1 }}>
        <BackHeader title="Fees" onBackIconPress={() => NavigationService.navigate('Home')} />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={appStyles.main}>
              <View style={styles.headerContainer}>
                <Text style={TextStyles.headerText}>Your Fees Details is here!</Text>
                <Image source={Images.payment} style={styles.paymentImage} />
              </View>

              {grandTotal && (
                <View style={{ ...appStyles.card, backgroundColor: colors.background ,marginBottom:10}}>
                  <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                    <Text style={{ ...TextStyles.title2, color: colors.text }}>
                      Grand Total
                    </Text>
                  </View>
                  <View style={styles.feesRow}>
                    {[
                      { label: 'Amount', value: grandTotal?.total_amount },
                      { label: 'Discount', value: grandTotal?.total_discount_amount },
                      { label: 'Fine', value: grandTotal?.total_fine_amount },
                      { label: 'Paid', value: grandTotal?.total_deposite_amount },
                      { label: 'Balance', value: grandTotal?.total_balance_amount },
                    ].map((item, index) => (
                      <View key={index} style={styles.feesColumn}>
                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                          {item.label}
                        </Text>
                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                          {'\u20B9'}{item.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <FeesDetails />

            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Fees;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    // paddingBottom: 20,
  },
  container: {
    backgroundColor: Colors.white2,
    width: '100%',
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentImage: {
    height: moderateScale(65),
    width: moderateScale(120),
    resizeMode: 'stretch',
  },
  feesRow: {
    padding: 10,
    flexDirection: 'row',
  },
  feesColumn: {
    flex: 1,
    paddingHorizontal: 3.5,
  },
});
