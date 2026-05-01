import React, { useMemo, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    NativeModules,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    UIManager,
    LayoutAnimation,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { Colors } from '../../Constants/Colors';
import { moderateScale } from '../../Constants/PixelRatio';

import AsyncStorage from '@react-native-async-storage/async-storage';

// same helper you used in FeesDetails
import PaymentHelper from '../../payments/PaymentHelper';

const { NdpsAESLibrary } = NativeModules;

if (Platform.OS === 'android' && UIManager?.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FeesCart = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const { userData, defultSetting } = useSelector(state => state.User);

    const params = route?.params ?? {};
    const payment_mode = params?.payment_mode ?? defultSetting?.payment_mode ?? null;

    const [cart, setCart] = useState(Array.isArray(params?.selectedFees) ? params.selectedFees : []);
    const [loading, setLoading] = useState(false);

    const [showBreakup, setShowBreakup] = useState(false);

    // ✅ SAME STORAGE KEY as Fees page
    const STORAGE_KEY = useMemo(() => {
        const uid = userData?.id ? String(userData.id) : 'guest';
        return `fees:last_selected_keys:v2:${uid}`;
    }, [userData?.id]);

    // ✅ Sync storage whenever cart changes (remove/add)
    useEffect(() => {
        const sync = async () => {
            try {
                const keys = Array.isArray(cart)
                    ? cart.map(x => x?.persist_key ?? x?._key).filter(Boolean)
                    : [];

                if (!keys.length) {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                } else {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
                }
            } catch (e) {
                console.log('Cart sync storage error:', e);
            }
        };

        sync();
    }, [cart, STORAGE_KEY]);

    const normalizeNum = (v) => {
        const n = Number(v ?? 0);
        return Number.isFinite(n) ? n : 0;
    };

    const getRawFee = (x) => (x?.raw ? x.raw : x);

    const getPayableAmount = (x) => {
        const raw = getRawFee(x);
        const a = x?.payable_amount ?? raw?.due_amount ?? raw?.amount ?? 0;
        return Number(normalizeNum(a).toFixed(2));
    };

    const getFineAmount = (x) => {
        const raw = getRawFee(x);
        return Number(normalizeNum(raw?.fine_amount).toFixed(2));
    };

    const getDiscountAmount = (x) => {
        const raw = getRawFee(x);
        return Number(normalizeNum(raw?.discount_amount).toFixed(2));
    };

    const totals = useMemo(() => {
        const fees = cart.reduce((sum, x) => sum + getPayableAmount(x), 0);
        const fine = cart.reduce((sum, x) => sum + getFineAmount(x), 0);
        const discount = cart.reduce((sum, x) => sum + getDiscountAmount(x), 0);
        const grand = Number((fees + fine - discount).toFixed(2));

        return {
            fees: Number(fees.toFixed(2)),
            fine: Number(fine.toFixed(2)),
            discount: Number(discount.toFixed(2)),
            grand,
        };
    }, [cart]);

    const removeFromCart = (keyOrIndex) => {
        setCart(prev =>
            prev.filter((x, idx) => {
                if (typeof keyOrIndex === 'string') return String(x?._key) !== keyOrIndex;
                return idx !== keyOrIndex;
            })
        );
    };

    // ---- NDPS (Atom) helpers ----
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

    const BASE_MERCHANT = {
        userId: '446442',
        merchantId: '446442',
        password: 'Test@123',
        productId: 'NSE',

        req_enc_key: 'A4476C2062FFA58980DC8F79EB6A799E',
        res_enc_key: '75AEF0FA1B94B3C10D4F5B268F757F11',

        request_hask_key: 'KEY123657234',
        response_hash_key: 'KEYRESP123657234',

        custFirstName: 'Atom Dev',
        custEmailId: 'atomdev@gmail.com',
        custMobileNumber: '8888888888',

        mode: 'uat',
    };

    const payNowCart = async () => {
        try {
            if (!cart.length) {
                Alert.alert('Cart Empty', 'Please add at least one month fees.');
                return;
            }

            const amountRaw = Number(totals?.grand ?? 0);
            const amount = Number.isFinite(amountRaw) ? Number(amountRaw.toFixed(2)) : 0;

            if (!amount || amount <= 0) {
                Alert.alert('No payable amount', 'Grand total amount is 0.');
                return;
            }

            if (!NdpsAESLibrary?.ndpsEncrypt || !NdpsAESLibrary?.ndpsDecrypt) {
                Alert.alert(
                    'Payment setup issue',
                    'NdpsAESLibrary is not linked. Please re-install/link the native module.'
                );
                return;
            }

            setLoading(true);

            const merchantDetails = {
                ...BASE_MERCHANT,

                amount,
                productId: BASE_MERCHANT.productId,
                txnDate: formatTxnDate(new Date()),
                merchTxnId: `cart_${Math.random().toString(36).slice(2, 12)}`,

                udf1: String(userData?.name ?? 'User'),
                udf2: `fees_cart_${cart.length}`,
                udf3: String(userData?.id ?? ''),
                udf4: String(getRawFee(cart?.[0])?.id ?? ''),
                udf5: 'rn-cart',

                cart_total_fees: totals?.fees,
                cart_total_fine: totals?.fine,
                cart_total_discount: totals?.discount,
            };

            const ndps = new PaymentHelper();
            const jsonStr = ndps.getJsonData(merchantDetails);

            const encryptedStr = await NdpsAESLibrary.ndpsEncrypt(jsonStr, merchantDetails.req_enc_key);
            if (!encryptedStr) throw new Error('Encryption failed');

            const tokenIdRespEnc = await ndps.getAtomTokenId(encryptedStr, merchantDetails);

            const decryptedStr = await NdpsAESLibrary.ndpsDecrypt(tokenIdRespEnc, merchantDetails.res_enc_key);
            const parsed = JSON.parse(decryptedStr);

            const status = parsed?.responseDetails?.txnStatusCode;
            const atomTokenId = parsed?.atomTokenId;

            if (status === 'OTS0000' && atomTokenId) {
                const htmlPage = ndps.openAipayPopUp(atomTokenId, merchantDetails);

                navigation.navigate('Payment', {
                    htmlPage,
                    merchantDetails: {
                        ...merchantDetails,
                        cartItems: cart.map(getRawFee),
                        cartBreakup: { ...totals },
                        payment_mode,
                    },
                });
            } else {
                console.log('NDPS auth failed payload:', parsed);
                Alert.alert('Payment initialization failed', 'Please try again.');
            }
        } catch (e) {
            console.log('NDPS cart payment error:', e);
            Alert.alert('Payment error', e?.message ?? 'Something went wrong while starting payment.');
        } finally {
            setLoading(false);
        }
    };

    const toggleBreakup = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowBreakup(v => !v);
    };

    const renderItem = ({ item, index }) => {
        const fee = getRawFee(item);

        const payable = getPayableAmount(item);
        const fine = getFineAmount(item);
        const discount = getDiscountAmount(item);
        const net = Number((payable + fine - discount).toFixed(2));

        const title = fee?.fees_group_name ?? 'Fees';
        const dueDate = fee?.due_date ?? 'NA';
        const statusText = String(fee?.status ?? 'NA');

        return (
            <View style={[styles.card, { backgroundColor: colors.card ?? colors.background }]}>
                <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={[styles.subLine, { color: colors.text }]} numberOfLines={1}>
                            Due: {dueDate}  •  Status: {statusText}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => removeFromCart(item?._key ? String(item._key) : index)}
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
                        <Text style={styles.chipLabel}>Discount</Text>
                        <Text style={styles.chipValue}>-₹{discount.toFixed(2)}</Text>
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
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
            <BackHeader title="Fees Checkout" onBackIconPress={() => NavigationService.navigate('Fees')} />

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 80 }} />
            ) : (
                <FlatList
                    data={cart}
                    keyExtractor={(it, idx) => String(it?._key ?? it?.persist_key ?? getRawFee(it)?.id ?? idx)}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        padding: moderateScale(12),
                        paddingBottom: moderateScale(220),
                    }}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: 'center', paddingTop: 60 }}>
                            <Ionicons name="cart-outline" size={46} color="#9CA3AF" />
                            <Text style={{ marginTop: 10, fontWeight: '500', color: colors.text }}>
                                Cart is empty
                            </Text>
                        </View>
                    )}
                    ListFooterComponent={() =>
                        cart.length > 0 ? (
                            <View style={styles.footerRow}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => navigation.navigate('Fees')}
                                    style={styles.addMoreBtn}
                                >
                                    <Ionicons name="add-circle-outline" size={18} color={Colors.Green1} />
                                    <Text style={styles.addMoreText}>Add More Fees</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
            )}

            {cart.length > 0 && (
                <View style={[styles.bottomWrap, { backgroundColor: colors.card ?? '#fff' }]}>
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
                                <Text style={styles.breakupLabel}>Discount</Text>
                                <Text style={styles.breakupValue}>-₹{totals.discount.toFixed(2)}</Text>
                            </View>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        onPress={payNowCart}
                        activeOpacity={0.9}
                        style={styles.payBtnFull}
                        disabled={loading}
                    >
                        <Ionicons name="lock-closed-outline" size={18} color={Colors.white2} />
                        <Text style={styles.payText}>Pay Now</Text>
                    </TouchableOpacity>

                    <Text style={styles.hintText}>Items: {cart.length} • Secure payment</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default FeesCart;

const styles = StyleSheet.create({
    screen: { flex: 1 },

    card: {
        borderRadius: moderateScale(12),
        padding: moderateScale(10),
        marginBottom: moderateScale(8),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        elevation: 2,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: moderateScale(8),
        gap: 10,
    },
    title: { fontSize: moderateScale(13), fontWeight: '600' },
    subLine: {
        marginTop: 2,
        fontSize: moderateScale(11),
        fontWeight: '400',
        opacity: 0.7,
    },

    removeBtn: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239,68,68,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.20)',
    },

    chipsRow: { flexDirection: 'row', gap: moderateScale(8), marginBottom: moderateScale(8) },
    chip: {
        flex: 1,
        borderRadius: moderateScale(10),
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(10),
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    chipLabel: {
        fontSize: moderateScale(10.5),
        fontWeight: '400',
        opacity: 0.7,
        marginBottom: 2,
        color: '#374151',
    },
    chipValue: { fontSize: moderateScale(12.5), fontWeight: '500', color: '#111827' },

    netRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: moderateScale(6),
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
    },
    netLabel: { fontSize: moderateScale(11.5), fontWeight: '400', color: '#6B7280' },
    netValue: { fontSize: moderateScale(13.5), fontWeight: '600', color: '#111827' },

    footerRow: { marginTop: moderateScale(4), alignItems: 'flex-end', paddingRight: moderateScale(2) },
    addMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(8),
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(16,185,129,0.35)',
        backgroundColor: 'rgba(16,185,129,0.08)',
    },
    addMoreText: { fontSize: moderateScale(12), fontWeight: '500', color: Colors.Green1 },

    bottomWrap: {
        position: 'absolute',
        left: moderateScale(10),
        right: moderateScale(10),
        bottom: moderateScale(10),
        borderRadius: moderateScale(18),
        padding: moderateScale(12),
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        elevation: 12,
    },

    grandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: moderateScale(4),
        paddingHorizontal: moderateScale(2),
    },
    grandLabel: { fontSize: moderateScale(12), fontWeight: '400', color: '#6B7280' },
    grandAmount: { fontSize: moderateScale(18), fontWeight: '600', color: '#111827' },

    breakupToggle: {
        marginTop: moderateScale(8),
        marginBottom: moderateScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: moderateScale(6),
        borderRadius: moderateScale(12),
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    breakupToggleText: { fontSize: moderateScale(11.5), fontWeight: '400', color: '#6B7280' },

    breakupRow: { flexDirection: 'row', gap: moderateScale(8), marginBottom: moderateScale(12) },
    breakupItem: {
        flex: 1,
        borderRadius: moderateScale(12),
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(10),
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    breakupLabel: { fontSize: moderateScale(10.5), fontWeight: '400', color: '#6B7280', marginBottom: 2 },
    breakupValue: { fontSize: moderateScale(12.5), fontWeight: '500', color: '#111827' },

    payBtnFull: {
        height: moderateScale(46),
        borderRadius: moderateScale(14),
        backgroundColor: Colors.Green1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    payText: { color: Colors.white2, fontSize: moderateScale(13), fontWeight: '500' },
    hintText: {
        marginTop: moderateScale(8),
        textAlign: 'center',
        fontSize: moderateScale(10.5),
        fontWeight: '400',
        color: '#6B7280',
    },
});