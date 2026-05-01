import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import BackHeader from "../../Components/BackHeader";
import NavigationService from "../../Services/Navigation";
import { TextStyles, appStyles } from "../../Constants/Fonts";
import { Colors } from "../../Constants/Colors";
import { Images } from "../../Constants/Images";
import { moderateScale } from "../../Constants/PixelRatio";
import { useTheme } from "@react-navigation/native";
import { useSelector } from "react-redux";
import UseApi from "../../ApiConfig";
import FeesDetails from "../../Components/Fees/FeesDetails";
import Ionicons from "react-native-vector-icons/Ionicons";

import PaymentInvoiceList from "../../Components/Fees/PaymentInvoiceList";

const TAB_FEES = "fees";
const TAB_INVOICE = "invoice";

const Fees = () => {
  const { Request } = UseApi();
  const { colors } = useTheme();
  const { userData, defultSetting, profileData } = useSelector((state) => state.User);

  const feesDetailsRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [studentDueFees, setStudentDueFees] = useState([]);
  const [transportFees, setTransportFees] = useState([]);
  const [grandTotal, setGrandTotal] = useState(null);

  // cart bar state (from FeesDetails)
  const [selectedFees, setSelectedFees] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // tabs
  const [activeTab, setActiveTab] = useState(TAB_FEES);

  // animated slider
  const sliderX = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  useEffect(() => {
    getFeesDetails();
  }, []);

  useEffect(() => {
    if (!tabWidth) return;
    const idx = activeTab === TAB_FEES ? 0 : 1;
    sliderX.setValue(idx * tabWidth);
  }, [tabWidth, activeTab, sliderX]);

  const getFeesDetails = async () => {
    setLoading(true);
    const params = { user_id: userData?.id };

    try {
      const data = await Request("feesList", "POST", params);
      if (data?.status && data?.data) {
        setGrandTotal(data.data?.grand_total);
        setStudentDueFees(Array.isArray(data.data?.student_due_fee) ? data.data.student_due_fee : []);
        setTransportFees(Array.isArray(data.data?.tranport_fee) ? data.data.tranport_fee : []);
      }
    } catch (err) {
      console.log("Error fetching fees:", err);
    } finally {
      setLoading(false);
    }
  };

  const onCartChange = ({ items, total }) => {
    const safeItems = Array.isArray(items) ? items : [];
    setSelectedFees(safeItems);
    setCartTotal(Number(total ?? 0));
  };

  const cartCount = selectedFees.length;

  const openCartModal = () => {
    if (!cartCount) return;
    feesDetailsRef.current?.openCartModal?.();
  };

  // instant tab switch
  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);

    if (!tabWidth) return;
    const idx = tab === TAB_FEES ? 0 : 1;

    Animated.timing(sliderX, {
      toValue: idx * tabWidth,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  const themePillBg = colors?.lightGreen ?? "rgba(16,185,129,0.12)";

  const feesVisible = activeTab === TAB_FEES;
  const invoiceVisible = activeTab === TAB_INVOICE;

  return (
    <View style={styles.screen}>
      <BackHeader title="Fees" onBackIconPress={() => NavigationService.navigate("Home")} />

      <View style={styles.container}>
        <View style={styles.main}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={TextStyles.headerText}>Your Fees Details are here!</Text>
            <Image source={Images.payment} style={styles.paymentImage} />
          </View>

          {/* Tabs */}
          <View style={styles.tabOuterShadow}>
            <View
              style={[styles.tabOuter, { backgroundColor: themePillBg }]}
              onLayout={(e) => {
                const w = e?.nativeEvent?.layout?.width || 0;
                if (!w) return;
                setTabWidth(w / 2);
              }}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabActivePill,
                  {
                    width: tabWidth || "50%",
                    transform: [{ translateX: sliderX }],
                    backgroundColor: Colors.Green1,
                  },
                ]}
              />

              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={() => switchTab(TAB_FEES)}
                style={styles.tabBtn}
              >
                <Text style={[styles.tabText, feesVisible ? styles.tabTextActive : styles.tabTextInactive]}>
                  Fees List
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={() => switchTab(TAB_INVOICE)}
                style={styles.tabBtn}
              >
                <Text style={[styles.tabText, invoiceVisible ? styles.tabTextActive : styles.tabTextInactive]}>
                  Payment Invoice
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ✅ Keep BOTH mounted (no unmount = no lag) */}
          <View style={styles.tabContentWrap}>
            {/* FEES TAB */}
            <View
              pointerEvents={feesVisible ? "auto" : "none"}
              style={[styles.tabPane, feesVisible ? styles.paneShow : styles.paneHide]}
            >
              <ScrollView
                contentContainerStyle={[
                  styles.scrollContainer,
                  { paddingBottom: cartCount > 0 ? moderateScale(110) : moderateScale(24) },
                ]}
                showsVerticalScrollIndicator={false}
              >
                {/* {grandTotal && (
                  <View style={{ ...appStyles.card, backgroundColor: colors.background, marginBottom: 10 }}>
                    <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                      <Text style={{ ...TextStyles.title2, color: colors.text }}>Grand Total</Text>
                    </View>

                    <View style={styles.feesRow}>
                      {[
                        { label: "Amount", value: grandTotal?.total_amount },
                        { label: "Concession", value: grandTotal?.total_discount_amount },
                        { label: "Fine", value: grandTotal?.total_fine_amount },
                        { label: "Paid", value: grandTotal?.total_deposite_amount },
                        { label: "Balance", value: grandTotal?.total_balance_amount },
                      ].map((item, index) => (
                        <View key={index} style={styles.feesColumn}>
                          <Text style={{ ...TextStyles.keyText, color: colors.text }}>{item.label}</Text>
                          <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                            {"\u20B9"}{item.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )} */}

                <View style={[styles.GTCard, { backgroundColor: colors.background }]}>
                  <View style={[styles.feeProHeader, { backgroundColor: colors?.lightGreen ?? 'rgba(34,197,94,0.10)' }]}>
                    <Text style={[styles.feeProTitle, { color: colors.text }]} numberOfLines={1}>Grand Total to Pay</Text>
                  </View>

                  <View style={styles.feeProGrid}>
                    <View style={styles.feeProGridRow}>
                      <View style={styles.feeProCell}>
                        <Text style={[styles.feeProLabel, { color: colors.text }]}>Amount</Text>
                        <Text style={[styles.feeProValue, { color: colors.text }]} numberOfLines={1}>
                          ₹{grandTotal?.total_amount}
                        </Text>
                      </View>
                      <View style={styles.feeProVLine} />
                      <View style={styles.feeProCell}>
                        <Text style={[styles.feeProLabel, { color: colors.text }]}>Concession</Text>
                        <Text style={[styles.feeProValue, { color: colors.text }]} numberOfLines={1}>
                          ₹{grandTotal?.total_discount_amount}
                        </Text>
                      </View>
                      <View style={styles.feeProVLine} />
                      <View style={styles.feeProCell}>
                        <Text style={[styles.feeProLabel, { color: colors.text }]}>Fine</Text>
                        <Text style={[styles.feeProValue, { color: colors.text }]} numberOfLines={1}>
                          ₹{grandTotal?.total_fine_amount}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.feeProHLine} />

                    <View style={styles.feeProGridRow}>
                      <View style={styles.feeProCell}>
                        <Text style={[styles.feeProLabel, { color: colors.text }]}>Paid</Text>
                        <Text style={[styles.feeProValue, { color: colors.text }]} numberOfLines={1}>
                          ₹{grandTotal?.total_deposite_amount}
                        </Text>
                      </View>
                      <View style={styles.feeProVLine} />
                      <View style={styles.feeProCell}>
                        <Text style={[styles.feeProLabel, { color: colors.text }]}>Balance</Text>
                        <Text style={[styles.feeProValue2, { color: colors.text }]} numberOfLines={1}>
                          ₹{grandTotal?.total_balance_amount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <FeesDetails
                  ref={feesDetailsRef}
                  studentDueFees={studentDueFees}
                  transportFees={transportFees}
                  loading={loading}
                  onCartChange={onCartChange}
                  payment_mode={defultSetting?.payment_mode ?? null}
                  userData={userData}
                  profileData={profileData}
                />
              </ScrollView>
            </View>

            {/* INVOICE TAB */}
            <View
              pointerEvents={invoiceVisible ? "auto" : "none"}
              style={[styles.tabPane, invoiceVisible ? styles.paneShow : styles.paneHide]}
            >
              {/* ✅ IMPORTANT: active should depend on tab */}
              <PaymentInvoiceList active={invoiceVisible} userId={userData?.student_id} />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Cart Bar only for fees tab */}
      {feesVisible && cartCount > 0 && (
        <View style={styles.cartBarWrap} pointerEvents="box-none">
          <TouchableOpacity activeOpacity={0.92} onPress={openCartModal} style={styles.cartBarBtn}>
            <View style={styles.cartLeft}>
              <View style={styles.cartIconBadge}>
                <Ionicons name="cart-outline" size={18} color={Colors.white2} />
                <View style={styles.cartCountBadge}>
                  <Text style={styles.cartCountText}>{cartCount}</Text>
                </View>
              </View>

              <View style={{ marginLeft: moderateScale(10) }}>
                <Text style={styles.cartTitle}>Cart Ready</Text>
                <Text style={styles.cartSubtitle}>Total: ₹{Number(cartTotal).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.cartRight}>
              <Text style={styles.cartBtnText}>View</Text>
              <Ionicons name="chevron-up" size={22} color={Colors.white2} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Fees;

const styles = StyleSheet.create({
  screen: { flex: 1, position: "relative", backgroundColor: Colors.white2 },
  container: { backgroundColor: Colors.white2, width: "100%", flex: 1 },
  main: { backgroundColor: Colors.white2, width: "92%", alignSelf: "center", maxWidth: 600, flex: 1 },

  headerContainer: {
    flexDirection: "row",
    marginTop: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentImage: { height: moderateScale(65), width: moderateScale(120), resizeMode: "stretch" },

  tabOuterShadow: {
    marginTop: moderateScale(12),
    marginBottom: moderateScale(12),
    borderRadius: moderateScale(18),
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    backgroundColor: "transparent",
  },
  tabOuter: {
    borderRadius: moderateScale(18),
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  tabActivePill: { position: "absolute", top: 0, bottom: 0, left: 0, borderRadius: moderateScale(18) },
  tabBtn: { flex: 1, paddingVertical: moderateScale(11), alignItems: "center", justifyContent: "center" },
  tabText: { fontSize: moderateScale(13.5), fontWeight: "900" },
  tabTextActive: { color: Colors.white2 },
  tabTextInactive: { color: "#111827", opacity: 0.75 },

  tabContentWrap: { flex: 1, position: "relative" },
  tabPane: { ...StyleSheet.absoluteFillObject },
  paneShow: { opacity: 1 },
  paneHide: { opacity: 0 },

  scrollContainer: { paddingBottom: moderateScale(24) },
  feesRow: { padding: 10, flexDirection: "row" },
  feesColumn: { flex: 1, paddingHorizontal: 3.5 },

  // New Grand Total card
  GTCard: {
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
  feeProHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(10), gap: 10 },
  feeProTitle: { flex: 1, fontSize: moderateScale(13), color: Colors.black, fontWeight: '500' },
  feeProGrid: { paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(10) },
  feeProGridRow: { flexDirection: 'row', alignItems: 'flex-start' },
  feeProCell: { flex: 1, paddingHorizontal: moderateScale(6), alignItems: 'center' },
  feeProLabel: { fontSize: moderateScale(11), fontWeight: '600', opacity: 0.65, marginBottom: moderateScale(4) },
  feeProValue: { fontSize: moderateScale(13), fontWeight: '500' },
  feeProValue2: { fontSize: moderateScale(12.5), fontWeight: '500' },
  feeProVLine: { width: 1, height: moderateScale(34), backgroundColor: 'rgba(0,0,0,0.08)' },
  feeProHLine: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: moderateScale(10) },

  cartBarWrap: {
    position: "absolute",
    left: moderateScale(10),
    right: moderateScale(10),
    bottom: moderateScale(10),
    zIndex: 9999,
    elevation: 9999,
  },
  cartBarBtn: {
    backgroundColor: Colors.Green1,
    borderRadius: moderateScale(16),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cartLeft: { flexDirection: "row", alignItems: "center" },
  cartIconBadge: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cartCountBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: Colors.white2,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCountText: { fontSize: 11, fontWeight: "900", color: Colors.Green1 },
  cartTitle: { color: Colors.white2, fontSize: moderateScale(13), fontWeight: "900" },
  cartSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: moderateScale(11.5), marginTop: 2, fontWeight: "700" },
  cartRight: { flexDirection: "row", alignItems: "center" },
  cartBtnText: { color: Colors.white2, fontSize: moderateScale(14), fontWeight: "900", marginRight: moderateScale(6) },
});