import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  Platform
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme, useNavigation } from '@react-navigation/native';

import UseApi from '../../ApiConfig';
import { Colors } from '../../Constants/Colors';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { moderateScale, screenHeight } from '../../Constants/PixelRatio';

// ⬇️ make sure this path points to your helper from the NTT repo
import PaymentHelper from '../../payments/PaymentHelper';

const { NdpsAESLibrary } = NativeModules;

const FeesDetails = () => {
  const { Request } = UseApi();
  const navigation = useNavigation();
  const { userData } = useSelector(state => state.User);
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [transportFees, setTransportFees] = useState([]);
  const [studentDueFees, setStudentDueFees] = useState([]);

  useEffect(() => {
    getFeesDetails();
  }, []);

  const getFeesDetails = async () => {
    setLoading(true);
    const params = { user_id: userData?.id };

    try {
      const data = await Request('feesList', 'POST', params);
      if (data?.status && data?.data) {
        setTransportFees(Array.isArray(data.data?.tranport_fee) ? data.data.tranport_fee : []);
        setStudentDueFees(Array.isArray(data.data?.student_due_fee) ? data.data.student_due_fee : []);
      } else {
        setTransportFees([]);
        setStudentDueFees([]);
      }
    } catch (err) {
      console.log('Error fetching fees:', err);
      Alert.alert('Error', 'Unable to fetch fees right now.');
    } finally {
      setLoading(false);
    }
  };

  // ---- NDPS (Atom) Payment: helpers ----
  const formatTxnDate = (d = new Date()) => {
    const pad = n => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`; // "YYYY-MM-DD HH:mm:ss"
  };

  // Base merchant defaults (UAT). Replace with your live keys in production.
  const BASE_MERCHANT = {
    // From your credentials list
    userId: '446442',
    merchantId: '446442', // often same as Login in UAT
    password: 'Test@123',
    productId: 'NSE',

    req_enc_key: 'A4476C2062FFA58980DC8F79EB6A799E', // RequestEncypritonKey
    res_enc_key: '75AEF0FA1B94B3C10D4F5B268F757F11', // ResponseDecryptionKey

    // UAT sample hash keys (confirm with NDPS for your account)
    request_hask_key: 'KEY123657234',
    response_hash_key: 'KEYRESP123657234',

    // Defaults (override if you have student-specific details)
    custFirstName: 'Atom Dev',
    custEmailId: 'atomdev@gmail.com',
    custMobileNumber: '8888888888',

    // Force single mode if you want; remove this key to show all payment options
    // paymentMode: 'NB',

    mode: 'uat',
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      console.log('NativeModules keys:', Object.keys(NativeModules));
      console.log('NdpsAESLibrary =>', NativeModules.NdpsAESLibrary);
    }
  }, []);

  // Start NDPS payment for a fee item
  const makePayment = async (item) => {
    try {
      // Decide what amount to send (due or full)
      const amountRaw = Number(item?.due_amount ?? item?.amount ?? 0);
      const amount = Number.isFinite(amountRaw) ? Number(amountRaw.toFixed(2)) : 0;

      if (!amount || amount <= 0) {
        Alert.alert('No payable amount', 'This fee item has no pending amount.');
        return;
      }

      // Build transaction-scoped merchant details
      const merchantDetails = {
        ...BASE_MERCHANT,

        amount,
        productId: BASE_MERCHANT.productId,
        txnDate: formatTxnDate(new Date()),
        merchTxnId: Math.random().toString(36).slice(2, 12), // or a real id from your server

        // UDFs: send data you want back in the response
        udf1: String(userData?.name ?? 'User'),
        udf2: String(item?.fees_group_name ?? ''),
        udf3: String(item?.fees_code ?? ''),
        udf4: String(item?.id ?? ''),
        udf5: 'rn-app',
      };

      // Ensure native module is available
      if (!NdpsAESLibrary?.ndpsEncrypt || !NdpsAESLibrary?.ndpsDecrypt) {
        Alert.alert('Payment setup issue', 'NdpsAESLibrary is not linked. Please re-install/link the native module.');
        return;
      }

      setLoading(true);

      // 1) Build JSON payload
      const ndps = new PaymentHelper();
      const jsonStr = ndps.getJsonData(merchantDetails);

      // 2) Encrypt with request key
      const encryptedStr = await NdpsAESLibrary.ndpsEncrypt(jsonStr, merchantDetails.req_enc_key);
      if (!encryptedStr) throw new Error('Encryption failed');

      // 3) Get token from NDPS
      const tokenIdRespEnc = await ndps.getAtomTokenId(encryptedStr, merchantDetails);

      // 4) Decrypt token response
      const decryptedStr = await NdpsAESLibrary.ndpsDecrypt(tokenIdRespEnc, merchantDetails.res_enc_key);
      const parsed = JSON.parse(decryptedStr);

      const status = parsed?.responseDetails?.txnStatusCode;
      const atomTokenId = parsed?.atomTokenId;

      if (status === 'OTS0000' && atomTokenId) {
        // 5) Build the HTML and navigate to the WebView page
        const htmlPage = ndps.openAipayPopUp(atomTokenId, merchantDetails);
        navigation.navigate('Payment', {
          htmlPage,
          merchantDetails, // Payment.js uses this for verifying final response
        });
      } else {
        console.log('NDPS auth failed payload:', parsed);
        Alert.alert('Payment initialization failed', 'Please try again.');
      }
    } catch (e) {
      console.log('NDPS makePayment error:', e);
      Alert.alert('Payment error', e?.message ?? 'Something went wrong while starting payment.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ ...appStyles.card, backgroundColor: colors.background }}>
      <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
        <Text style={{ ...TextStyles.title2, color: colors.text }}>
          {item?.fees_group_name}
        </Text>

        {(String(item?.status || '').toLowerCase() === 'unpaid' ||
          String(item?.status || '').toLowerCase() === 'partial') && (
            <TouchableOpacity
              onPress={() => makePayment(item)}
              activeOpacity={0.8}
              style={{ backgroundColor: Colors.Green1, padding: moderateScale(5), borderRadius: moderateScale(5) }}
            >
              <Text style={{ ...TextStyles.title2, color: Colors.white2 }}>Pay Now</Text>
            </TouchableOpacity>
          )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={{ flex: 10 }}>
          {[
            { label: 'Fees Code', value: item?.fees_code },
            { label: 'Due Date', value: item?.due_date || 'NA', color: item?.due_date ? Colors.red1 : colors.text },
            { label: 'Amount', value: `\u20B9${item?.amount ?? 0}` },
            { label: 'Fine', value: `\u20B9${item?.fine_amount ?? 0}` },
            { label: 'Discount', value: `\u20B9${item?.discount_amount ?? 0}` },
            { label: 'Partial', value: `\u20B9${item?.paid_amount ?? 0}` },
            { label: 'Payment Mode', value: item?.payment_mode || 'NA' },
            { label: 'Balance Amt', value: item?.due_amount ? `\u20B9${item?.due_amount}` : 'NA' },
          ].map((row, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={{ ...styles.keyText, color: colors.text }}>{row.label}</Text>
              <Text style={{ ...styles.valueText, color: row.color || colors.text }}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              ...styles.paidType,
              backgroundColor:
                String(item?.status || '').toLowerCase() === 'unpaid'
                  ? Colors.red1
                  : String(item?.status || '').toLowerCase() === 'paid'
                    ? Colors.Green1
                    : String(item?.status || '').toLowerCase() === 'partial'
                      ? Colors.orange
                      : Colors.lightGrey2,
            }}
          >
            <Text style={{ ...TextStyles.title2, color: Colors.white2 }}>
              {item?.status ?? 'NA'}
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
            data={Array.isArray(studentDueFees) ? studentDueFees : []}
            keyExtractor={(_, index) => index.toString()}
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

          {Array.isArray(transportFees) && transportFees.length > 0 && (
            <FlatList
              scrollEnabled={false}
              data={transportFees}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ padding: moderateScale(5) }}
              ListHeaderComponent={() => (
                <Text style={{ ...TextStyles.title2, ...styles.headerText }}>
                  Transport Fees Details
                </Text>
              )}
              ListEmptyComponent={() => (
                <View style={styles.noDataContainer}>
                  <Image source={Images.NoDataFound} style={styles.noDataImage} />
                  <Text style={styles.noDataText}>No records found!</Text>
                </View>
              )}
            />
          )}
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
    alignItems: 'center',
  },
  noDataImage: {
    height: moderateScale(60),
    width: moderateScale(60),
    opacity: 0.5,
    marginTop: 10,
  },
  noDataText: {
    fontSize: moderateScale(14),
    marginTop: 10,
  },
});