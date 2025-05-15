import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '../../Constants/Colors';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import {
  moderateScale,
  screenHeight,
} from '../../Constants/PixelRatio';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';

const FeesDetails = () => {

  const { Request } = UseApi();
  const { userData } = useSelector(state => state.User);
  const [loading, setLoading] = useState(false);
  const [transportFees, setTransportFees] = useState([]);
  const [studentDueFees, setStudentDueFees] = useState([]);
  const { colors } = useTheme();

  useEffect(() => {
    getFeesDetails();
  }, []);

  const getFeesDetails = async () => {
    setLoading(true);
    let params = { user_id: userData.id };

    try {
      const data = await Request('feesList', 'POST', params);
      if (data.status && data?.data) {
        setTransportFees(data.data?.tranport_fee);
        setStudentDueFees(data.data?.student_due_fee);
      }
    } catch (err) {
      console.log('Error fetching fees:', err);
    }

    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={{ ...appStyles.card, backgroundColor: colors.background }}>
      <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
        <Text style={{ ...TextStyles.title2, color: colors.text }}>
          {item.fees_group_name}
        </Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={{ flex: 10 }}>
          {[
            { label: 'Fees Code', value: item.fees_code },
            { label: 'Due Date', value: item.due_date || 'NA', color: item.due_date ? Colors.red1 : colors.text },
            { label: 'Amount', value: `\u20B9${item.amount}` },
            { label: 'Fine', value: `\u20B9${item.fine_amount}` },
            { label: 'Discount', value: `\u20B9${item.discount_amount}` },
            { label: 'Partial', value: `\u20B9${item.paid_amount}` },
            { label: 'Payment Mode', value: item.payment_mode || 'NA' },
            { label: 'Balance Amt', value: item.due_amount ? `\u20B9${item.due_amount}` : 'NA' },
          ].map((data, index) => (
            <View key={index} style={styles.row}>
              <Text style={{ ...styles.keyText, color: colors.text }}>{data.label}</Text>
              <Text style={{ ...styles.valueText, color: data.color || colors.text }}>{data.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{
            ...styles.paidType,
            backgroundColor:
              item.status.toLowerCase() === 'unpaid'
                ? Colors.red1
                : item.status.toLowerCase() === 'paid'
                  ? Colors.Green1
                  : item.status.toLowerCase() === 'partial'
                    ? Colors.orange
                    : Colors.lightGrey2,
          }}>
            <Text style={{ ...TextStyles.title2, color: Colors.white2 }}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      {loading ? (
        <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />
      ) : (
        <ScrollView>
          <FlatList
            scrollEnabled={false}
            data={studentDueFees}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: moderateScale(5) }}
            ListHeaderComponent={() => (
              <Text style={styles.headerText}>Student Fees Details</Text>
            )}
            ListEmptyComponent={() => (
              <View style={styles.noDataContainer}>
                <Image source={Images.NoDataFound} style={styles.noDataImage} />
                <Text style={styles.noDataText}>No records found!</Text>
              </View>
            )}
          />
          <FlatList
            scrollEnabled={false}
            data={transportFees}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: moderateScale(5) }}
            ListHeaderComponent={() => (
              <Text style={{ ...TextStyles.title2, ...styles.headerText }}>Transport Fees Details</Text>
            )}
            ListEmptyComponent={() => (
              <View style={styles.noDataContainer}>
                <Image source={Images.NoDataFound} style={styles.noDataImage} />
                <Text style={styles.noDataText}>No records found!</Text>
              </View>
            )}
          />

        </ScrollView>
      )}


    </View>
  );
};

export default FeesDetails;

const styles = StyleSheet.create({
  headerText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    // marginVertical: moderateScale(10),
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 5,
  },
  row: {
    flexDirection: 'row',
  },
  keyText: {
    ...TextStyles.keyText,
    flex: 1,
  },
  valueText: {
    ...TextStyles.valueText,
    flex: 1,
  },
  paidType: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    // marginTop: screenHeight / 4,
    alignItems: 'center',
  },
  noDataImage: {
    height: moderateScale(60),
    width: moderateScale(60),
    opacity: 0.5,
    marginTop: 10
  },
  noDataText: {
    fontSize: moderateScale(14),
    marginTop: 10,
  },
});
