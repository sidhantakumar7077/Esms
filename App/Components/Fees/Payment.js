import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Linking,
    Alert,
    Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import UseApi from '../../ApiConfig';

function getIntentFallbackUrl(intentUrl) {
    try {
        const m = intentUrl.match(/S\.browser_fallback_url=([^;]+)/i);
        if (!m?.[1]) return null;
        return decodeURIComponent(m[1]);
    } catch {
        return null;
    }
}

function isHttpUrl(url) {
    return /^https?:\/\//i.test(url) || url === 'about:blank';
}

function safeIncludes(url, needle) {
    if (!url || !needle) return false;
    return String(url).toLowerCase().includes(String(needle).toLowerCase());
}

function buildGroupPayPayload(merchantDetails, paymentResponse) {
    const student_session_id = merchantDetails?.student_session_id ?? '';
    const parent_app_key = merchantDetails?.parent_app_key ?? '';
    const guardian_phone = merchantDetails?.guardian_phone ?? '';
    const guardian_email = merchantDetails?.guardian_email ?? '';

    const cartLines = Array.isArray(merchantDetails?.cartLines) ? merchantDetails.cartLines : [];

    const payload = {
        student_session_id,
        parent_app_key,
        guardian_phone,
        guardian_email,
        full_response: paymentResponse || '',
        row_counter: cartLines.map((_, idx) => idx + 1),
    };

    cartLines.forEach((line, idx) => {
        const i = idx + 1;
        const raw = line?.raw ?? line;

        const source = String(line?.source ?? raw?.fee_category ?? raw?.feeCategory ?? '').toLowerCase();
        const isTransport = source === 'transport';

        payload[`fee_session_group_id_${i}`] = Number(raw?.fee_session_group_id ?? 0);
        payload[`student_fees_master_id_${i}`] = Number(raw?.student_fees_master_id ?? 0);
        payload[`fee_groups_feetype_id_${i}`] = Number(raw?.fee_groups_feetype_id ?? 0);
        payload[`fee_groups_feetype_fine_amount_${i}`] = Number(raw?.fee_groups_feetype_fine_amount ?? 0).toFixed(2);
        payload[`fee_amount_${i}`] = Number(raw?.amount ?? 0).toFixed(2);
        payload[`fee_category_${i}`] = isTransport ? 'transport' : 'fees';
        payload[`trans_fee_id_${i}`] = Number(raw?.trans_fee_id ?? 0);
    });

    return payload;
}

export default function Payment() {
    const navigation = useNavigation();
    const route = useRoute();
    const webRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [paymentResponse, setPaymentResponse] = useState('');

    const [finalizing, setFinalizing] = useState(false);
    const finalizedRef = useRef(false);
    const callbackSeenRef = useRef(false);

    const [resultModal, setResultModal] = useState({
        visible: false,
        success: false,
        title: '',
        message: '',
    });

    const htmlPage = route?.params?.htmlPage ?? '';
    const merchantDetails = route?.params?.merchantDetails ?? {};
    const merchantReturnUrl = merchantDetails?.merchantReturnUrl ?? '';

    const close = () => navigation.navigate('Fees');

    const openExternal = useCallback((url) => {
        if (!url) return false;

        if (url.startsWith('intent://')) {
            const fallback = getIntentFallbackUrl(url);
            if (fallback && isHttpUrl(fallback)) {
                webRef.current?.stopLoading?.();
                webRef.current?.injectJavaScript?.(`window.location.href = "${fallback}"; true;`);
                return false;
            }

            setTimeout(() => {
                Linking.canOpenURL(url)
                    .then((ok) => (ok ? Linking.openURL(url) : null))
                    .catch(() => { });
            }, 0);

            return false;
        }

        if (!isHttpUrl(url)) {
            setTimeout(() => {
                Linking.canOpenURL(url)
                    .then((ok) => {
                        if (!ok) {
                            Alert.alert('UPI App not found', 'No app available to handle this payment link.');
                            return;
                        }
                        return Linking.openURL(url);
                    })
                    .catch(() => { });
            }, 0);

            return false;
        }

        return true;
    }, []);

    const captureWebResponse = useCallback(() => {
        webRef.current?.injectJavaScript(`
            (function() {
                try {
                    var text = '';
                    if (document && document.body) {
                        text =
                            document.body.innerText ||
                            document.body.textContent ||
                            document.documentElement.outerHTML ||
                            '';
                    }
                    window.ReactNativeWebView.postMessage(text);
                } catch (e) {
                    window.ReactNativeWebView.postMessage('CAPTURE_ERROR:' + String(e));
                }
            })();
            true;
        `);
    }, []);

    const submitGroupPay = useCallback(async (responseValue = '') => {
        if (finalizedRef.current) return;
        finalizedRef.current = true;

        try {
            setFinalizing(true);

            const payload = buildGroupPayPayload(
                merchantDetails,
                responseValue || paymentResponse || ''
            );

            if (!payload.student_session_id) {
                throw new Error('student_session_id missing. Please pass it from FeesDetails to Payment screen.');
            }
            if (!payload.guardian_phone) {
                throw new Error('guardian_phone missing.');
            }
            if (!Array.isArray(payload.row_counter) || payload.row_counter.length === 0) {
                throw new Error('No fee items found to submit.');
            }

            const { getBaseUrl } = UseApi();
            const baseUrl = await getBaseUrl();
            const grouppayUrl = `${baseUrl.replace('/api/apicontroller/', '')}api/atompaycontroller/grouppay`;

            const resp = await fetch(grouppayUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),
            });

            const txt = await resp.text();
            let data = null;

            try {
                data = JSON.parse(txt);
            } catch {
                data = { raw: txt };
            }

            const isSuccess =
                data?.status === true ||
                data?.status === 1 ||
                data?.status === '1';

            if (isSuccess) {
                setResultModal({
                    visible: true,
                    success: true,
                    title: 'Payment Successful',
                    message:
                        data?.message ||
                        (data?.invoice_no ? `Invoice No: ${data.invoice_no}` : 'Fees updated successfully.'),
                });
            } else {
                setResultModal({
                    visible: true,
                    success: false,
                    title: 'Payment Failed',
                    message:
                        data?.message ||
                        data?.error ||
                        (typeof data?.raw === 'string' ? data.raw.slice(0, 200) : 'Unable to update fees.'),
                });
            }
        } catch (e) {
            setResultModal({
                visible: true,
                success: false,
                title: 'Error',
                message: e?.message ?? 'Something went wrong while submitting fees.',
            });
        } finally {
            setFinalizing(false);
        }
    }, [merchantDetails, paymentResponse]);

    const handleRequest = useCallback(
        (req) => {
            const url = req?.url || '';

            if (merchantReturnUrl && safeIncludes(url, merchantReturnUrl)) {
                callbackSeenRef.current = true;
                setPaymentResponse(url);
                return true;
            }

            if (safeIncludes(url, '/user/gateway/atompay/callback')) {
                callbackSeenRef.current = true;
                setPaymentResponse(url);
                return true;
            }

            return openExternal(url);
        },
        [merchantReturnUrl, openExternal]
    );

    useEffect(() => {
    }, []);

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <TouchableOpacity onPress={close} style={styles.btn}>
                    <Text style={styles.btnTxt}>Close</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Payment</Text>

                <View style={{ width: 60 }} />
            </View>

            <WebView
                ref={webRef}
                originWhitelist={['*']}
                source={{ html: htmlPage }}
                javaScriptEnabled
                domStorageEnabled
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                mixedContentMode="always"
                cacheEnabled={false}
                setSupportMultipleWindows={false}
                javaScriptCanOpenWindowsAutomatically={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => {
                    setLoading(false);

                    if (callbackSeenRef.current && !finalizedRef.current) {
                        captureWebResponse();

                        setTimeout(() => {
                            submitGroupPay(paymentResponse);
                        }, 800);
                    }
                }}
                onShouldStartLoadWithRequest={handleRequest}
                onNavigationStateChange={(navState) => {
                    const url = navState?.url || '';
                    if (!url) return;

                    if (merchantReturnUrl && safeIncludes(url, merchantReturnUrl)) {
                        callbackSeenRef.current = true;
                        setPaymentResponse(url);
                    }

                    if (safeIncludes(url, '/user/gateway/atompay/callback')) {
                        callbackSeenRef.current = true;
                        setPaymentResponse(url);
                    }

                    if (!isHttpUrl(url) || url.startsWith('intent://')) {
                        webRef.current?.stopLoading?.();
                        openExternal(url);
                    }
                }}
                onMessage={(event) => {
                    let raw = event?.nativeEvent?.data || '';

                    console.log("Raw Payment Response:", raw);

                    try {
                        // Convert PHP-style array string → JSON
                        let jsonString = raw
                            .replace(/Array\s*\(/g, '{')
                            .replace(/\)/g, '}')
                            .replace(/\[([^\]]+)\]\s*=>/g, '"$1":')
                            .replace(/=>/g, ':')
                            .replace(/'/g, '"');

                        // Fix missing commas (basic fix)
                        jsonString = jsonString.replace(/}\s*{/g, '},{');

                        const parsed = JSON.parse(jsonString);

                        console.log("Converted JSON:", parsed);

                        setPaymentResponse(JSON.stringify(parsed)); // ✅ send as JSON string

                        // trigger API if callback already detected
                        if (callbackSeenRef.current && !finalizedRef.current) {
                            setTimeout(() => {
                                submitGroupPay(JSON.stringify(parsed));
                            }, 300);
                        }

                    } catch (e) {
                        console.log("JSON Convert Error:", e);

                        // fallback → send raw string
                        setPaymentResponse(raw);

                        if (callbackSeenRef.current && !finalizedRef.current) {
                            setTimeout(() => {
                                submitGroupPay(raw);
                            }, 300);
                        }
                    }
                }}
                onError={(e) => console.log('WebView error:', e?.nativeEvent)}
                onHttpError={(e) => console.log('WebView http error:', e?.nativeEvent)}
                onRenderProcessGone={(e) => {
                    console.log('WebView renderer gone:', e?.nativeEvent);
                    Alert.alert('Payment interrupted', 'The payment page was closed by the system. Please try again.');
                }}
            />

            {(loading || finalizing) ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 8 }}>
                        {finalizing ? 'Finalizing payment…' : 'Loading checkout…'}
                    </Text>
                </View>
            ) : null}

            <Modal visible={resultModal.visible} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <TouchableOpacity
                            onPress={() => {
                                setResultModal(v => ({ ...v, visible: false }));
                                close();
                            }}
                            style={styles.modalClose}
                        >
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>

                        <Ionicons
                            name={resultModal.success ? 'checkmark-circle' : 'close-circle'}
                            size={56}
                            color={resultModal.success ? '#16a34a' : '#dc2626'}
                            style={{ marginBottom: 10 }}
                        />

                        <Text style={styles.modalTitle}>{resultModal.title}</Text>
                        <Text style={styles.modalMsg}>{resultModal.message}</Text>

                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: resultModal.success ? '#16a34a' : '#dc2626' }]}
                            onPress={() => {
                                setResultModal(v => ({ ...v, visible: false }));
                                close();
                            }}
                        >
                            <Text style={styles.modalBtnText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    header: {
        height: 54,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    title: { fontSize: 16, fontWeight: '700' },
    btn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    btnTxt: { fontSize: 13, fontWeight: '600' },
    loader: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 54,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.75)',
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    modalCard: {
        width: '100%',
        borderRadius: 16,
        backgroundColor: '#fff',
        padding: 18,
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        right: 10,
        top: 10,
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseText: { fontSize: 18, fontWeight: '700', color: '#374151' },
    modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6, marginTop: 4 },
    modalMsg: { fontSize: 13, color: '#374151', textAlign: 'center', marginBottom: 14 },
    modalBtn: {
        width: '100%',
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});