import React, {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Modal,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  FlatList,
} from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import { moderateScale, screenHeight } from '../../Constants/PixelRatio';

import PaymentHelper from './PaymentHelper';
import UseApi from '../../ApiConfig';

const { NdpsAESLibrary } = NativeModules;

if (Platform.OS === 'android' && UIManager?.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FeesDetails = forwardRef(
  (
    {
      studentDueFees = [],
      transportFees = [],
      loading = false,
      onCartChange,
      payment_mode: paymentModeFromParent = null,
      userData: userDataFromParent = null,
      profileData: profileDataFromParent = null,
    },
    ref
  ) => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { defultSetting, userData: reduxUserData, profileData: reduxProfileData } = useSelector(state => state.User);

    const userData = userDataFromParent ?? reduxUserData;
    const profileData = profileDataFromParent ?? reduxProfileData;

    const [payment_mode, setPayment_mode] = useState(null);
    const [ShowBankDetailsModal, setShowBankDetailsModal] = useState(false);

    const [selectedFees, setSelectedFees] = useState([]);

    const [showCartModal, setShowCartModal] = useState(false);
    const [showBreakup, setShowBreakup] = useState(false);
    const [payLoading, setPayLoading] = useState(false);

    useEffect(() => {
      setPayment_mode(paymentModeFromParent ?? defultSetting?.payment_mode ?? null);
    }, [paymentModeFromParent, defultSetting]);

    useImperativeHandle(
      ref,
      () => ({
        openCartModal: () => {
          if (!selectedFees.length) return;
          setShowCartModal(true);
        },
        closeCartModal: () => setShowCartModal(false),
      }),
      [selectedFees.length]
    );

    const normalizeAmount = v => {
      const n = Number(v ?? 0);
      return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
    };

    const getPayableAmount = item => {
      const dueRaw = item?.due_amount;
      const hasDue = dueRaw !== null && dueRaw !== undefined && dueRaw !== '';
      const due = normalizeAmount(dueRaw);

      if (hasDue) return Math.max(due, 0);

      const amt = normalizeAmount(item?.amount);
      return Math.max(amt, 0);
    };

    const buildRowKey = (item, source, index) => {
      const code = item?.fees_code ?? '';
      const dueDate = item?.due_date ?? '';
      const amount = item?.amount ?? '';
      const paid = item?.paid_amount ?? '';
      const due = item?.due_amount ?? '';
      const group = item?.fees_group_name ?? '';
      return `${source}:${index}:${code}:${dueDate}:${amount}:${paid}:${due}:${group}`;
    };

    const isSelected = key => selectedFees.some(x => x._key === key);

    const toggleSelect = (item, source, index) => {
      const key = buildRowKey(item, source, index);
      const status = String(item?.status ?? '').toLowerCase();
      const payable = getPayableAmount(item);

      const canSelect = (status === 'unpaid' || status === 'partial') && payable > 0;
      if (!canSelect) return;

      setSelectedFees(prev => {
        const exists = prev.some(x => x._key === key);
        if (exists) return prev.filter(x => x._key !== key);

        return [
          ...prev,
          {
            _key: key,
            source,
            payable_amount: payable,
            raw: item,
          },
        ];
      });
    };

    const listTotal = useMemo(() => {
      return selectedFees.reduce((s, x) => s + normalizeAmount(x?.payable_amount), 0);
    }, [selectedFees]);

    useEffect(() => {
      onCartChange?.({ items: selectedFees, total: listTotal });
    }, [selectedFees, listTotal, onCartChange]);

    const getRawFee = x => (x?.raw ? x.raw : x);

    const getFineAmount = x => normalizeAmount(getRawFee(x)?.fine_amount);
    const getDiscountAmount = x => normalizeAmount(getRawFee(x)?.discount_amount);

    const totals = useMemo(() => {
      const fees = selectedFees.reduce((sum, x) => sum + normalizeAmount(x?.payable_amount), 0);
      const fine = selectedFees.reduce((sum, x) => sum + getFineAmount(x), 0);
      const discount = selectedFees.reduce((sum, x) => sum + getDiscountAmount(x), 0);
      const grand = Number((fees + fine - discount).toFixed(2));

      return {
        fees: Number(fees.toFixed(2)),
        fine: Number(fine.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        grand,
      };
    }, [selectedFees]);

    const removeFromCartByKey = key => {
      setSelectedFees(prev => prev.filter(x => String(x?._key) !== String(key)));
    };

    const toggleBreakup = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowBreakup(v => !v);
    };

    const formatTxnDate = (d = new Date()) => {
      const pad = n => (n < 10 ? `0${n}` : `${n}`);
      const yyyy = d.getFullYear();
      const MM = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
    };

    const makeTxnId = () => {
      const r = Math.floor(100000 + Math.random() * 900000);
      const t = String(Date.now()).slice(-4);
      return `${r}${t}`;
    };

    const normalizeEnv = v => {
      const s = String(v ?? '').toLowerCase().trim();
      if (s.includes('uat') || s.includes('test')) return 'uat';
      return 'prod';
    };

    const [paymentCreds, setPaymentCreds] = useState(null);

    useEffect(() => {
      // getPaymentCredential();
    }, []);

    const getPaymentCredential = async () => {
      try {
        const { getBaseUrl } = UseApi();
        const baseUrl = await getBaseUrl();
        const credentialUrl = `${baseUrl.replace('/api/apicontroller/', '')}api/atompaycontroller/credintial`;
        console.log("credentialUrl", credentialUrl);

        const resp = await fetch(credentialUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const txt = await resp.text();
        let data;

        try {
          data = JSON.parse(txt);
        } catch {
          console.log('Credential API returned non-JSON:', txt?.slice(0, 250));
          Alert.alert('Payment setup issue', 'Credential API returned non-JSON response.');
          return;
        }

        if (data?.status && data?.data) {
          setPaymentCreds(data.data);
        } else {
          console.log('Failed to get payment credentials:', data);
          Alert.alert('Payment setup issue', 'Failed to get payment credentials.');
        }
      } catch (e) {
        console.log('Error fetching payment credentials:', e);
        Alert.alert('Payment setup issue', 'Error fetching payment credentials.');
      }
    };

    const BASE_MERCHANT = useMemo(() => {
      const mode = normalizeEnv(paymentCreds?.mode ?? paymentCreds?.Mode ?? 'prod');
      
      // Construct dynamic callback URL
      const baseUrl = defultSetting?.base_url;
      const callbackUrl = `${baseUrl}user/gateway/atompay/callback`;

      return {
        merchantId: paymentCreds?.Login ?? '',
        password: paymentCreds?.Password ?? '',
        productId: paymentCreds?.ProductId ?? 'SCHOOL',

        // from your API screenshot:
        custAccNo: paymentCreds?.CustomerAccount ?? '',

        // Atom AUTH URL from API
        authUrl: paymentCreds?.url ?? null,

        req_enc_key:
          paymentCreds?.RequestEncypritonKey ??
          paymentCreds?.RequestEncryptionKey ??
          '',
        res_enc_key: paymentCreds?.ResponseDecryptionKey ?? '',

        // Your server callback (like web)
        merchantReturnUrl:
          paymentCreds?.Returnurl ??
          paymentCreds?.ReturnUrl ??
          callbackUrl,

        custFirstName: userData?.name ? String(userData.name).split(' ')[0] : 'User',
        custEmailId: defultSetting?.email ?? 'schoolenquiry@example.com',
        custMobileNumber: profileData?.guardian?.guardian_phone ?? '9999999999',

        udf1: paymentCreds?.udf1 ?? '',
        udf2: paymentCreds?.udf2 ?? '',
        udf3: paymentCreds?.udf3 ?? '',
        udf4: paymentCreds?.udf4 ?? '',
        udf5: paymentCreds?.udf5 ?? '',

        mode, // 'uat' | 'prod'
      };
    }, [paymentCreds, userData, profileData, defultSetting]);

    // console.log("profileData", profileData);
    // console.log("userData",userData);
    // console.log("defultSetting", defultSetting);

    const payNowCart = async () => {
      try {
        if (!selectedFees.length) {
          Alert.alert('Cart Empty', 'Please add at least one fees.');
          return;
        }

        if (!paymentCreds) {
          Alert.alert('Payment setup', 'Payment credentials not loaded yet. Please try again.');
          return;
        }

        if (!NdpsAESLibrary?.ndpsEncrypt || !NdpsAESLibrary?.ndpsDecrypt) {
          Alert.alert('Payment setup issue', 'NdpsAESLibrary is not linked properly.');
          return;
        }

        const amountRaw = Number(totals?.grand ?? 0);
        const amount = Number.isFinite(amountRaw) ? Number(amountRaw.toFixed(2)) : 0;

        if (!amount || amount <= 0) {
          Alert.alert('No payable amount', 'Grand total amount is 0.');
          return;
        }

        if (!BASE_MERCHANT.merchantId || !BASE_MERCHANT.password || !BASE_MERCHANT.productId) {
          Alert.alert('Payment setup issue', 'Missing merchant Login/Password/ProductId.');
          return;
        }

        if (!BASE_MERCHANT.req_enc_key || !BASE_MERCHANT.res_enc_key) {
          Alert.alert('Payment setup issue', 'Missing encryption/decryption keys.');
          return;
        }

        if (!BASE_MERCHANT.custAccNo) {
          Alert.alert('Payment setup issue', 'Missing CustomerAccount (custAccNo).');
          return;
        }

        setPayLoading(true);

        const merchantDetails = {
          ...BASE_MERCHANT,
          amount,
          merchTxnId: makeTxnId(),
          txnDate: formatTxnDate(new Date()),
        };

        const ndps = new PaymentHelper();

        // 1) JSON
        const jsonStr = ndps.getJsonData(merchantDetails);

        // 2) Encrypt
        const encryptedStr = await NdpsAESLibrary.ndpsEncrypt(jsonStr, merchantDetails.req_enc_key);
        if (!encryptedStr) throw new Error('Encryption failed');

        // 3) AUTH -> encData response
        const tokenIdRespEnc = await ndps.getAtomTokenId(encryptedStr, merchantDetails);

        // 4) Decrypt response
        const decryptedStr = await NdpsAESLibrary.ndpsDecrypt(tokenIdRespEnc, merchantDetails.res_enc_key);

        let parsed;
        try {
          parsed = JSON.parse(decryptedStr);
        } catch {
          console.log('Decrypted response not JSON:', decryptedStr?.slice(0, 250));
          throw new Error('Decrypted response is not valid JSON');
        }

        // ✅ IMPORTANT FIX: support BOTH possible response formats
        const statusCode =
          parsed?.responseDetails?.txnStatusCode ||
          parsed?.payInstrument?.responseDetails?.statusCode ||
          parsed?.responseDetails?.statusCode ||
          null;

        const atomTokenId =
          parsed?.atomTokenId ||
          parsed?.payInstrument?.payDetails?.atomTokenId ||
          parsed?.payInstrument?.atomTokenId ||
          null;

        if (String(statusCode) === 'OTS0000' && atomTokenId) {
          const htmlPage = ndps.openAipayPopUp(String(atomTokenId), merchantDetails);

          setShowCartModal(false);

          navigation.navigate('Payment', {
            htmlPage,
            merchantDetails: {
              ...merchantDetails,

              // ✅ IMPORTANT for callback detection + returnUrl
              merchantReturnUrl: merchantDetails.merchantReturnUrl,

              // ✅ For grouppay API
              student_session_id: userData?.student_session_id ?? '',
              parent_app_key: userData?.parent_app_key ?? '',
              guardian_phone: merchantDetails.custMobileNumber,
              guardian_email: merchantDetails.custEmailId,

              // ✅ send FULL lines (source + payable + raw)
              cartLines: selectedFees,
            },
          });
        } else {
          console.log('AUTH failed payload:', parsed);
          Alert.alert('Payment initialization failed', `Status: ${statusCode ?? 'NA'}`);
        }
      } catch (e) {
        console.log('NDPS cart payment error:', e);
        Alert.alert('Payment error', e?.message ?? 'Something went wrong while starting payment.');
      } finally {
        setPayLoading(false);
      }
    };

    const renderFeeItem = source => ({ item, index }) => {
      const statusText = String(item?.status ?? 'NA');
      const status = statusText.toLowerCase();

      const statusColor =
        status === 'unpaid'
          ? Colors.red1
          : status === 'paid'
            ? Colors.Green1
            : status === 'partial'
              ? Colors.orange
              : '#9CA3AF';

      const statusIcon =
        status === 'paid'
          ? 'checkmark-circle-outline'
          : status === 'unpaid'
            ? 'alert-circle-outline'
            : status === 'partial'
              ? 'time-outline'
              : 'help-circle-outline';

      const payable = getPayableAmount(item);
      const canshowpaybtm = payment_mode && payment_mode.payment_type === 'atompay';
      const canSelect = (status === 'unpaid' || status === 'partial') && payable > 0;

      const rowKey = buildRowKey(item, source, index);
      const inCart = isSelected(rowKey);

      const dueDateText = item?.due_date || 'NA';
      const dueDateColor = item?.due_date ? Colors.red1 : colors.text;

      const amount = `₹${item?.amount ?? 0}`;
      const balance =
        item?.due_amount !== null && item?.due_amount !== undefined ? `₹${item?.due_amount}` : 'NA';
      const fine = `₹${item?.fine_amount ?? 0}`;
      const discount = `₹${item?.discount_amount ?? 0}`;
      const paid = `₹${item?.paid_amount ?? 0}`;

      return (
        <View style={[inCart ? styles.selectFeeProCard : styles.feeProCard, { backgroundColor: colors.background }]}>
          <View style={[styles.feeProHeader, { backgroundColor: colors?.lightGreen ?? 'rgba(34,197,94,0.10)' }]}>
            <View style={[styles.feeProAccent, { backgroundColor: statusColor }]} />
            <Text style={[styles.feeProTitle, { color: colors.text }]} numberOfLines={1}>
              {item?.fees_group_name ?? 'Fees'}
            </Text>

            {status === 'paid' ? (
              <View style={styles.selectedPill}>
                <Ionicons name="checkmark-circle" size={15} color={Colors.Green1} />
                <Text style={styles.selectedPillText}>Paid</Text>
              </View>
            ) : null}

            {inCart ? (
              <View style={styles.selectedPill}>
                <Ionicons name="checkmark" size={14} color={Colors.Green1} />
                <Text style={styles.selectedPillText}>Selected</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.feeProGrid}>
            <View style={styles.feeProGridRow}>
              <View style={styles.feeProCell}>
                <Text style={[styles.feeProLabel, { color: colors.text }]}>Amount</Text>
                <Text style={[styles.feeProValue, { color: colors.text }]} numberOfLines={1}>
                  {amount}
                </Text>
              </View>

              <View style={styles.feeProVLine} />

              <View style={styles.feeProCell}>
                <Text style={[styles.feeProLabel, { color: colors.text }]}>Balance</Text>
                <Text style={[styles.feeProValue, { color: colors.text }]} numberOfLines={1}>
                  {balance}
                </Text>
              </View>

              <View style={styles.feeProVLine} />

              <View style={styles.feeProCell}>
                <Text style={[styles.feeProLabel, { color: colors.text }]}>Due Date</Text>
                <Text style={[styles.feeProValue, { color: dueDateColor }]} numberOfLines={1}>
                  {dueDateText}
                </Text>
              </View>
            </View>

            <View style={styles.feeProHLine} />

            <View style={styles.feeProGridRow}>
              <View style={styles.feeProCell}>
                <Text style={[styles.feeProLabel, { color: colors.text }]}>Fine</Text>
                <Text style={[styles.feeProValue2, { color: colors.text }]} numberOfLines={1}>
                  {fine}
                </Text>
              </View>

              <View style={styles.feeProVLine} />

              <View style={styles.feeProCell}>
                <Text style={[styles.feeProLabel, { color: colors.text }]}>Concession</Text>
                <Text style={[styles.feeProValue2, { color: colors.text }]} numberOfLines={1}>
                  {discount}
                </Text>
              </View>

              <View style={styles.feeProVLine} />

              <View style={styles.feeProCell}>
                <Text style={[styles.feeProLabel, { color: colors.text }]}>Paid</Text>
                <Text style={[styles.feeProValue2, { color: colors.text }]} numberOfLines={1}>
                  {paid}
                </Text>
              </View>
            </View>
          </View>

          {status !== 'paid' ? (
            <View style={styles.feeBottomRow}>
              <View style={styles.feeBottomHalf}>
                <View style={[styles.feeBottomStatusOutline, { borderColor: statusColor }]}>
                  <Ionicons name={statusIcon} size={18} color={statusColor} />
                  <Text style={[styles.feeBottomStatusTextOutline, { color: statusColor }]} numberOfLines={1}>
                    {statusText}
                  </Text>
                </View>
              </View>

              <View style={styles.feeBottomHalf}>
                {canshowpaybtm &&
                  <>
                    {canSelect ? (
                      <TouchableOpacity
                        onPress={() => toggleSelect(item, source, index)}
                        activeOpacity={0.88}
                        style={[styles.feeBottomPayBtnThin, inCart ? styles.btnRemove : styles.btnAdd]}
                      >
                        <Ionicons
                          name={inCart ? 'remove-circle-outline' : 'add-circle-outline'}
                          size={18}
                          color={inCart ? Colors.red1 : Colors.Green1}
                        />
                        <Text
                          style={[
                            styles.feeBottomPayTextThin,
                            inCart ? { color: Colors.red1 } : { color: Colors.Green1 },
                          ]}
                        >
                          {inCart ? 'Remove' : 'Add for Payment'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.feeBottomPayDisabled}>
                        <Text style={styles.feeBottomPayDisabledText}>
                          {payable <= 0 ? 'No Due' : 'Payment Done'}
                        </Text>
                      </View>
                    )}
                  </>
                }
              </View>
            </View>
          ) : null}
        </View>
      );
    };

    const renderCartItem = ({ item }) => {
      const fee = getRawFee(item);

      const payable = normalizeAmount(item?.payable_amount);
      const fine = getFineAmount(item);
      const discount = getDiscountAmount(item);
      const net = Number((payable + fine - discount).toFixed(2));

      const title = fee?.fees_group_name ?? 'Fees';
      const dueDate = fee?.due_date ?? 'NA';
      const statusText = String(fee?.status ?? 'NA');

      return (
        <View style={[styles.cartCard, { backgroundColor: colors.card ?? colors.background }]}>
          <View style={styles.cartCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cartTitleText, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[styles.cartSubLine, { color: colors.text }]} numberOfLines={1}>
                Due: {dueDate}  •  Status: {statusText}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeFromCartByKey(item?._key)}
              style={styles.removeBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.red1} />
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Fees</Text>
              <Text style={styles.chipValue}>₹{payable.toFixed(2)}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Fine</Text>
              <Text style={styles.chipValue}>₹{fine.toFixed(2)}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Concession</Text>
              <Text style={styles.chipValue}>₹{discount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net Payable</Text>
            <Text style={styles.netValue}>₹{net.toFixed(2)}</Text>
          </View>
        </View>
      );
    };

    return (
      <View>
        {loading ? (
          <ActivityIndicator size={28} style={{ marginTop: screenHeight / 4 }} />
        ) : (
          <>
            <FlatList
              scrollEnabled={false}
              data={Array.isArray(studentDueFees) ? studentDueFees : []}
              keyExtractor={(item, index) => buildRowKey(item, 'student', index)}
              renderItem={renderFeeItem('student')}
              contentContainerStyle={{ padding: moderateScale(5) }}
              ListHeaderComponent={() => (
                <View style={styles.listHeaderRow}>
                  <Text style={styles.headerText}>Student Fees Details</Text>
                  {payment_mode?.payment_type === 'qrcode' ? (
                    <TouchableOpacity style={styles.bankBtn} onPress={() => setShowBankDetailsModal(true)}>
                      <Text style={{ color: Colors.white2 }}>Bank Details</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.noDataContainer}>
                  <Image source={Images.NoDataFound} style={styles.noDataImage} />
                  <Text style={styles.noDataText}>No records found!</Text>
                </View>
              )}
            />

            {Array.isArray(transportFees) && transportFees.length > 0 ? (
              <FlatList
                scrollEnabled={false}
                data={transportFees}
                keyExtractor={(item, index) => buildRowKey(item, 'transport', index)}
                renderItem={renderFeeItem('transport')}
                contentContainerStyle={{ padding: moderateScale(5) }}
                ListHeaderComponent={() => (
                  <Text style={[styles.headerText, { marginTop: 8 }]}>Transport Fees Details</Text>
                )}
              />
            ) : null}

            {/* Bank modal + Cart modal (same as your current UI) */}
            {/* ✅ Keep your modal code unchanged except payNowCart uses fixed logic */}
            {/* --- Your existing modals below (same as you already had) --- */}

            {/* Bank Details Modal */}
            <Modal
              visible={ShowBankDetailsModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowBankDetailsModal(false)}
            >
              <View style={styles.modalBackdrop}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.modalBackdropTouch}
                  onPress={() => setShowBankDetailsModal(false)}
                />

                <View style={styles.modalSheet}>
                  <View style={styles.modalHandleContainer}>
                    <View style={styles.modalHandle} />
                  </View>

                  <View style={styles.modalHeaderRow}>
                    <View style={styles.modalHeaderTextBox}>
                      <Text style={styles.modalHeaderTitle}>Online Payment</Text>
                      <Text style={styles.modalHeaderSubtitle}>
                        {payment_mode?.title ? payment_mode.title : 'Use QR / bank details'}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => setShowBankDetailsModal(false)}>
                      <Text style={styles.modalHeaderClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    {payment_mode?.qr_image ? (
                      <View style={styles.modalQrCard}>
                        <Image
                          source={{ uri: payment_mode.qr_image }}
                          resizeMode="contain"
                          style={styles.modalQrImage}
                        />
                      </View>
                    ) : null}

                    {payment_mode?.bank_acount_details ? (
                      <View style={styles.modalBankCard}>
                        <Text style={styles.modalBankTitle}>Bank Details</Text>

                        {payment_mode.bank_acount_details.split(',').map((line, index) => {
                          const parts = line.split('-');
                          const label = parts[0] ? parts[0].trim() : '';
                          const value = parts.slice(1).join('-').trim();

                          return (
                            <View key={index} style={styles.modalBankRow}>
                              <Text style={styles.modalBankLabel} numberOfLines={2}>
                                {label || 'Detail'}
                              </Text>
                              <Text style={styles.modalBankValue} numberOfLines={2}>
                                {value || line.trim()}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </ScrollView>

                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity
                      onPress={() => setShowBankDetailsModal(false)}
                      activeOpacity={0.85}
                      style={styles.modalBtnSecondary}
                    >
                      <Text style={styles.modalBtnSecondaryText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* CART MODAL */}
            <Modal
              visible={showCartModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCartModal(false)}
            >
              <View style={styles.modalBackdrop}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.modalBackdropTouch}
                  onPress={() => setShowCartModal(false)}
                />

                <View style={styles.cartSheet}>
                  <View style={styles.modalHandleContainer}>
                    <View style={styles.modalHandle} />
                  </View>

                  <View style={styles.cartHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartHeaderTitle}>Fees Checkout</Text>
                      <Text style={styles.cartHeaderSub}>Items: {selectedFees.length}</Text>
                    </View>

                    <TouchableOpacity onPress={() => setShowCartModal(false)} style={styles.cartCloseBtn}>
                      <Text style={styles.modalHeaderClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartBody}>
                    <FlatList
                      data={selectedFees}
                      keyExtractor={it => String(it?._key)}
                      renderItem={renderCartItem}
                      style={styles.cartList}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                      contentContainerStyle={{ paddingBottom: moderateScale(12) }}
                    />
                  </View>

                  {selectedFees.length > 0 && (
                    <View style={[styles.cartFooter, { backgroundColor: colors.card ?? '#fff' }]}>
                      <View style={styles.grandRow}>
                        <Text style={styles.grandLabel}>Grand Total</Text>
                        <Text style={styles.grandAmount}>₹{totals.grand.toFixed(2)}</Text>
                      </View>

                      <TouchableOpacity onPress={toggleBreakup} activeOpacity={0.9} style={styles.breakupToggle}>
                        <Text style={styles.breakupToggleText}>
                          {showBreakup ? 'Hide breakup' : 'View breakup'}
                        </Text>
                        <Ionicons
                          name={showBreakup ? 'chevron-up-outline' : 'chevron-down-outline'}
                          size={18}
                          color="#6B7280"
                        />
                      </TouchableOpacity>

                      {showBreakup ? (
                        <View style={styles.breakupRow}>
                          <View style={styles.breakupItem}>
                            <Text style={styles.breakupLabel}>Fees</Text>
                            <Text style={styles.breakupValue}>₹{totals.fees.toFixed(2)}</Text>
                          </View>

                          <View style={styles.breakupItem}>
                            <Text style={styles.breakupLabel}>Fine</Text>
                            <Text style={styles.breakupValue}>₹{totals.fine.toFixed(2)}</Text>
                          </View>

                          <View style={styles.breakupItem}>
                            <Text style={styles.breakupLabel}>Concession</Text>
                            <Text style={styles.breakupValue}>₹{totals.discount.toFixed(2)}</Text>
                          </View>
                        </View>
                      ) : null}

                      <TouchableOpacity
                        onPress={payNowCart}
                        activeOpacity={0.9}
                        style={styles.payBtnFull}
                        disabled={payLoading}
                      >
                        <Ionicons name="lock-closed-outline" size={18} color={Colors.white2} />
                        <Text style={styles.payText}>{payLoading ? 'Please wait...' : 'Pay Now'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowCartModal(false)}
                        activeOpacity={0.9}
                        style={styles.addMoreInlineBtn}
                      >
                        <Ionicons name="add-circle-outline" size={18} color={Colors.Green1} />
                        <Text style={styles.addMoreText}>Add More Fees</Text>
                      </TouchableOpacity>

                      <Text style={styles.hintText}>Secure payment</Text>
                    </View>
                  )}
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    );
  }
);

export default FeesDetails;

/* ✅ Keep your existing styles (same as you sent) */
const styles = StyleSheet.create({
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bankBtn: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(7),
    backgroundColor: Colors.Green1,
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(10),
  },
  headerText: { fontSize: moderateScale(17), fontWeight: '600', color: Colors.black, marginBottom: 10 },

  noDataContainer: { alignItems: 'center' },
  noDataImage: { height: moderateScale(60), width: moderateScale(60), opacity: 0.5, marginTop: 10 },
  noDataText: { fontSize: moderateScale(14), marginTop: 10 },

  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  selectedPillText: { fontSize: moderateScale(12), fontWeight: '800', color: Colors.Green1 },

  feeProCard: {
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  selectFeeProCard: {
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    marginBottom: moderateScale(10),
    borderWidth: 3,
    borderColor: 'rgba(8, 236, 0, 0.15)',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  feeProHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(10), gap: 10 },
  feeProAccent: { width: moderateScale(4), height: moderateScale(22), borderRadius: moderateScale(6) },
  feeProTitle: { flex: 1, fontSize: moderateScale(13), color: Colors.black, fontWeight: '500' },

  feeProGrid: { paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(10) },
  feeProGridRow: { flexDirection: 'row', alignItems: 'flex-start' },
  feeProCell: { flex: 1, paddingHorizontal: moderateScale(6) },
  feeProLabel: { fontSize: moderateScale(11), fontWeight: '600', opacity: 0.65, marginBottom: moderateScale(4) },
  feeProValue: { fontSize: moderateScale(13), fontWeight: '500' },
  feeProValue2: { fontSize: moderateScale(12.5), fontWeight: '500' },
  feeProVLine: { width: 1, height: moderateScale(34), backgroundColor: 'rgba(0,0,0,0.08)' },
  feeProHLine: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: moderateScale(10) },

  feeBottomRow: { flexDirection: 'row', paddingHorizontal: moderateScale(12), paddingBottom: moderateScale(12), gap: moderateScale(10) },
  feeBottomHalf: { flex: 1 },

  feeBottomStatusOutline: {
    width: '100%',
    borderWidth: 1,
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  feeBottomStatusTextOutline: { fontSize: moderateScale(12), fontWeight: '800', marginLeft: moderateScale(8), textTransform: 'capitalize' },
  feeBottomPayBtnThin: {
    width: '100%',
    borderWidth: 1,
    paddingVertical: moderateScale(7),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnAdd: { borderColor: Colors.Green1 },
  btnRemove: { borderColor: Colors.red1 },

  feeBottomPayTextThin: { fontSize: moderateScale(12), fontWeight: '900', marginLeft: moderateScale(8) },

  feeBottomPayDisabled: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingVertical: moderateScale(7),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  feeBottomPayDisabledText: { fontSize: moderateScale(12), fontWeight: '800', color: '#6B7280' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBackdropTouch: { flex: 1 },

  modalSheet: {
    backgroundColor: Colors.white2,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: moderateScale(18),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(18),
    elevation: 15,
  },

  modalHandleContainer: { alignItems: 'center', marginBottom: moderateScale(8) },
  modalHandle: { width: moderateScale(40), height: moderateScale(4), borderRadius: moderateScale(4), backgroundColor: '#D1D5DB' },

  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(15) },
  modalHeaderTextBox: { flex: 1, paddingRight: moderateScale(12) },
  modalHeaderTitle: { fontSize: moderateScale(18), fontWeight: '700', color: Colors.black },
  modalHeaderSubtitle: { fontSize: moderateScale(12), color: '#6B7280', marginTop: moderateScale(2) },
  modalHeaderClose: { fontSize: moderateScale(20), color: '#9CA3AF' },
  modalScroll: { maxHeight: screenHeight * 0.55 },
  modalQrCard: { backgroundColor: '#F3F4F6', borderRadius: moderateScale(16), padding: moderateScale(12), alignItems: 'center', marginBottom: moderateScale(14) },
  modalQrImage: { width: moderateScale(180), height: moderateScale(180), borderRadius: moderateScale(12) },
  modalBankCard: { borderRadius: moderateScale(16), borderWidth: 1, borderColor: '#E5E7EB', padding: moderateScale(12), backgroundColor: '#FFF' },
  modalBankTitle: { fontSize: moderateScale(13), fontWeight: '600', color: Colors.black, marginBottom: moderateScale(8) },
  modalBankRow: { flexDirection: 'row', marginBottom: moderateScale(6) },
  modalBankLabel: { width: '32%', fontSize: moderateScale(12), color: '#6B7280' },
  modalBankValue: { width: '68%', fontSize: moderateScale(13), color: Colors.black, fontWeight: '500' },
  modalButtonsRow: { marginTop: moderateScale(14) },
  modalBtnSecondary: { paddingVertical: moderateScale(10), borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  modalBtnSecondaryText: { fontSize: moderateScale(14), color: '#374151', fontWeight: '500' },

  cartSheet: {
    backgroundColor: Colors.white2,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: moderateScale(14),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(12),
    height: screenHeight * 0.86,
    elevation: 18,
    overflow: 'hidden',
  },
  cartHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: moderateScale(10) },
  cartHeaderTitle: { fontSize: moderateScale(17), fontWeight: '800', color: Colors.black },
  cartHeaderSub: { marginTop: 2, fontSize: moderateScale(11.5), color: '#6B7280' },
  cartCloseBtn: { width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(12), alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },

  cartBody: { flex: 1 },
  cartList: { flex: 1 },

  cartFooter: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: moderateScale(10), paddingHorizontal: moderateScale(2), paddingBottom: moderateScale(6), borderRadius: moderateScale(18) },

  cartCard: { borderRadius: moderateScale(12), padding: moderateScale(10), marginBottom: moderateScale(8), borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', elevation: 2 },
  cartCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: moderateScale(8), gap: 10 },
  cartTitleText: { fontSize: moderateScale(13), fontWeight: '600' },
  cartSubLine: { marginTop: 2, fontSize: moderateScale(11), fontWeight: '400', opacity: 0.7 },

  removeBtn: { width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(10), alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.20)' },

  chipsRow: { flexDirection: 'row', gap: moderateScale(8), marginBottom: moderateScale(8) },
  chip: { flex: 1, borderRadius: moderateScale(10), paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(10), backgroundColor: 'rgba(0,0,0,0.04)' },
  chipLabel: { fontSize: moderateScale(10.5), fontWeight: '400', opacity: 0.7, marginBottom: 2, color: '#374151' },
  chipValue: { fontSize: moderateScale(12.5), fontWeight: '500', color: '#111827' },

  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: moderateScale(6), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  netLabel: { fontSize: moderateScale(11.5), fontWeight: '400', color: '#6B7280' },
  netValue: { fontSize: moderateScale(13.5), fontWeight: '600', color: '#111827' },

  grandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: moderateScale(4), paddingHorizontal: moderateScale(2) },
  grandLabel: { fontSize: moderateScale(12), fontWeight: '400', color: '#6B7280' },
  grandAmount: { fontSize: moderateScale(18), fontWeight: '600', color: '#111827' },

  breakupToggle: { marginTop: moderateScale(8), marginBottom: moderateScale(10), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: moderateScale(6), borderRadius: moderateScale(12), backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  breakupToggleText: { fontSize: moderateScale(11.5), fontWeight: '400', color: '#6B7280' },

  breakupRow: { flexDirection: 'row', gap: moderateScale(8), marginBottom: moderateScale(12) },
  breakupItem: { flex: 1, borderRadius: moderateScale(12), paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(10), backgroundColor: 'rgba(0,0,0,0.04)' },
  breakupLabel: { fontSize: moderateScale(10.5), fontWeight: '400', color: '#6B7280', marginBottom: 2 },
  breakupValue: { fontSize: moderateScale(12.5), fontWeight: '500', color: '#111827' },

  payBtnFull: { height: moderateScale(46), borderRadius: moderateScale(14), backgroundColor: Colors.Green1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  payText: { color: Colors.white2, fontSize: moderateScale(13), fontWeight: '700' },

  addMoreInlineBtn: { marginTop: moderateScale(10), height: moderateScale(44), borderRadius: moderateScale(14), borderWidth: 1, borderColor: 'rgba(16,185,129,0.35)', backgroundColor: 'rgba(16,185,129,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addMoreText: { fontSize: moderateScale(12), fontWeight: '700', color: Colors.Green1 },

  hintText: { marginTop: moderateScale(8), textAlign: 'center', fontSize: moderateScale(10.5), fontWeight: '400', color: '#6B7280' },
});