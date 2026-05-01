import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    InteractionManager,
    Linking
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useSelector } from 'react-redux';
import { moderateScale, screenHeight } from "../../Constants/PixelRatio";
import { Colors } from "../../Constants/Colors";
import UseApi from "../../ApiConfig";

// -------- helpers --------
const safeNum = (v) => {
    if (v === null || v === undefined) return 0;
    const s = String(v).replace(/,/g, "").trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
};

const money = (v) => {
    const n = safeNum(v);
    return `₹${n.toFixed(2)}`;
};

const str = (v, fallback = "NA") => {
    const s = (v ?? "").toString().trim();
    return s.length ? s : fallback;
};

const PaymentInvoiceList = ({ active = false, userId: propUserId = null }) => {

    const { userData, defultSetting } = useSelector(state => state.User);
    const userId = propUserId || userData?.student_id;
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [invoices, setInvoices] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const api = UseApi();

    // ✅ Your download confirm logic
    const onDownloadPress = (url) => {
        const link = String(url ?? "").trim();
        if (!link) return;

        Alert.alert("Download", "Do you want to open this invoice in browser?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Download",
                onPress: async () => {
                    try {
                        const can = await Linking.canOpenURL(link);
                        if (!can) {
                            Alert.alert("Cannot open link", "This link cannot be opened on this device.");
                            return;
                        }
                        await Linking.openURL(link); // ✅ opens in browser
                    } catch (e) {
                        console.log("Open invoice error:", e);
                        Alert.alert("Error", "Unable to open invoice link.");
                    }
                },
            },
        ]);
    };
    // const onDownloadPress = (url) => {
    //     if (!url) return;
    //     Alert.alert("Download", "Do you want to download this file?", [
    //         { text: "Cancel", style: "cancel" },
    //         { text: "Download", onPress: () => rndownloadFile(url) },
    //     ]);
    // };

    const fetchInvoices = async () => {
        if (!userId) {
            setInvoices([]);
            return;
        }

        try {
            setLoading(true);
            const baseUrl = await api.getBaseUrl();
            const url = `${baseUrl}get-invoice-list`;
            const formData = new FormData();
            formData.append("user_id", String(userId));

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "X-API-KEY": "123123",
                    Accept: "application/json",
                },
                body: formData,
            });

            const json = await response.json();
            const list = Array.isArray(json?.data) ? json.data : [];
            // console.log("Fetched invoices:", list, url, userId);
            setInvoices(list);
        } catch (e) {
            console.log("Invoice list fetch error:", e);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!active || !userId) return;

        const task = InteractionManager.runAfterInteractions(() => {
            fetchInvoices();
        });

        return () => task?.cancel?.();
    }, [active, userId]);

    const onRefresh = async () => {
        if (!userId) return;

        setRefreshing(true);
        await fetchInvoices();
        setRefreshing(false);
    };

    const openDetails = (item) => {
        setSelected(item);
        setShowModal(true);
    };

    const closeDetails = () => {
        setShowModal(false);
        setTimeout(() => setSelected(null), 160);
    };

    const totals = useMemo(() => {
        return invoices.map((inv) => {
            const paid = safeNum(inv?.paid_amount);
            const fine = safeNum(inv?.fine_amount);
            const disc = safeNum(inv?.discount_amount);
            const net = Math.max(0, paid + fine - disc);
            return { ...inv, _net: net };
        });
    }, [invoices]);

    const selectedInvoiceCode = str(selected?.invoice_code ?? selected?.invocie_code);
    const selectedSchoolName = str(
        selected?.school_name ??
        selected?.school ??
        defultSetting?.school_name ??
        defultSetting?.schoolName ??
        userData?.school_name ??
        userData?.schoolName
    );
    const selectedStudentName = str(
        selected?.student_name ??
        selected?.student ??
        selected?.name ??
        userData?.student_name ??
        userData?.name ??
        `${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`.trim()
    );
    const selectedClass = str(
        selected?.class_name ??
        selected?.class ??
        selected?.section ??
        userData?.class_name ??
        userData?.class ??
        userData?.section
    );
    const selectedAdmissionNo = str(
        selected?.admission_no ?? selected?.admission_number ?? userData?.admission_no ?? userData?.admission_number
    );
    const selectedCollectedDate = str(selected?.collected_date ?? selected?.created_at);
    const selectedStatus = str(selected?.status ?? selected?.payment_status, "Paid");
    const selectedGateway = str(
        selected?.payment_gateway ?? selected?.gateway_name ?? selected?.payment_method
    );
    const selectedTxnId = str(
        selected?.transaction_id ?? selected?.txn_id ?? selected?.payment_id
    );

    const selectedAmount = safeNum(selected?.amount ?? selected?.total_amount ?? selected?.paid_amount);
    const selectedPaid = safeNum(selected?.paid_amount);
    const selectedFine = safeNum(selected?.fine_amount);
    const selectedDiscount = safeNum(selected?.discount_amount);
    const selectedNet = Math.max(0, selectedPaid + selectedFine - selectedDiscount);

    // useEffect(() => {
    //     console.log("Fetched invoices:", invoices);
    // }, [invoices]);

    const renderInvoice = ({ item, index }) => {
        const code = str(item?.invoice_code ?? item?.invocie_code, `INV-${index + 1}`);
        const paid = safeNum(item?.paid_amount);
        const fine = safeNum(item?.fine_amount);
        const disc = safeNum(item?.discount_amount);
        const date = str(item?.collected_date);
        const net = item?._net ?? Math.max(0, paid + fine - disc);

        return (
            <View style={[styles.card, { backgroundColor: colors.card ?? Colors.white2 }]}>
                <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                                Invoice #{code}
                            </Text>

                            {/* <View style={styles.paidPill}>
                                <Ionicons name="checkmark-circle" size={14} color={Colors.Green1} />
                                <Text style={styles.paidPillText}>Paid</Text>
                            </View> */}
                        </View>
                    </View>

                    <Text style={[styles.topDate, { color: colors.text }]} numberOfLines={1}>
                        {date}
                    </Text>
                </View>

                <View style={styles.amountGrid}>
                    <View style={styles.amountCell}>
                        <Text style={styles.amountLabel}>Paid</Text>
                        <Text style={styles.amountValue}>{money(paid)}</Text>
                    </View>

                    <View style={styles.vLine} />

                    <View style={styles.amountCell}>
                        <Text style={styles.amountLabel}>Fine</Text>
                        <Text style={styles.amountValue}>{money(fine)}</Text>
                    </View>

                    <View style={styles.vLine} />

                    <View style={styles.amountCell}>
                        <Text style={styles.amountLabel}>Concession</Text>
                        <Text style={styles.amountValue}>{money(disc)}</Text>
                    </View>
                </View>

                <View style={styles.netRow}>
                    <Text style={styles.netLabel}>Net Amount</Text>
                    <Text style={styles.netValue}>{money(net)}</Text>
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        onPress={() => openDetails(item)}
                        style={[styles.actionBtn, styles.viewBtn]}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="eye-outline" size={18} color={Colors.white2} />
                        <Text style={styles.actionTextWhite}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onDownloadPress(item?.download_invoice)}
                        style={[styles.actionBtn, styles.downloadBtn]}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="download-outline" size={18} color={Colors.Green1} />
                        <Text style={styles.actionTextGreen}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const header = (
        <View style={styles.headerWrap}>
            <View style={styles.headerTitleRow}>
                <Text style={[styles.h1, { color: colors.text }]}>Payment Invoices</Text>
                <View style={styles.countPill}>
                    <Text style={styles.countText}>{invoices.length}</Text>
                </View>
            </View>
            <Text style={styles.h2}>View & download your payment invoices.</Text>
        </View>
    );

    return (
        <View style={[styles.screen, { backgroundColor: Colors.white2 }]}>
            {loading ? (
                <ActivityIndicator size={28} style={{ marginTop: screenHeight / 4 }} />
            ) : (
                <FlatList
                    data={totals}
                    keyExtractor={(it, idx) => String(it?.invoice_code ?? idx)}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderInvoice}
                    contentContainerStyle={{ padding: moderateScale(8), paddingBottom: moderateScale(30) }}
                    ListHeaderComponent={header}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={() => (
                        <View style={{ alignItems: "center", paddingTop: 60 }}>
                            <Ionicons name="document-text-outline" size={46} color="#9CA3AF" />
                            <Text style={{ marginTop: 10, fontWeight: "700", color: "#6B7280" }}>
                                No invoices found
                            </Text>
                        </View>
                    )}
                />
            )}

            <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeDetails}>
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity style={styles.modalBackdropTouch} activeOpacity={1} onPress={closeDetails} />

                    <View style={[styles.modalSheet, { backgroundColor: Colors.white2 }]}>
                        <View style={styles.modalHandleContainer}>
                            <View style={styles.modalHandle} />
                        </View>

                        <View style={styles.modalHeaderRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>Invoice Details</Text>
                                <Text style={styles.modalSubtitle}>
                                    Invoice #{selectedInvoiceCode}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={closeDetails} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.detailCardSoft}>
                            <Text style={styles.sectionTitle}>Invoice Summary</Text>
                            {/* <DetailRow label="School" value={selectedSchoolName} /> */}
                            <DetailRow label="Invoice Number" value={selectedInvoiceCode} />
                            {/* <DetailRow label="Student Name" value={selectedStudentName} />
                            <DetailRow label="Admission No" value={selectedAdmissionNo} />
                            <DetailRow label="Class" value={selectedClass} /> */}
                            <DetailRow label="Collected Date" value={selectedCollectedDate} />
                            <DetailRow label="Amount" value={money(selectedAmount)} />
                            <DetailRow label="Paid Amount" value={money(selectedPaid)} />
                            <DetailRow label="Fine" value={money(selectedFine)} />
                            <DetailRow label="Concession" value={money(selectedDiscount)} />
                            <DetailRow label="Net Amount" value={money(selectedNet)} />
                            {/* <DetailRow label="Payment Gateway" value={selectedGateway} />
                            <DetailRow label="Transaction Id" value={selectedTxnId} /> */}
                            <DetailRow label="Status" value={selectedStatus} />
                        </View>

                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                onPress={() => onDownloadPress(selected?.download_invoice)}
                                activeOpacity={0.9}
                                style={styles.modalPrimaryBtn}
                            >
                                <Ionicons name="download-outline" size={18} color={Colors.white2} />
                                <Text style={styles.modalPrimaryText}>Download Invoice</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={closeDetails}
                                activeOpacity={0.9}
                                style={styles.modalSecondaryBtn}
                            >
                                <Text style={styles.modalSecondaryText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel} numberOfLines={1}>
            {label}
        </Text>
        <Text style={styles.detailValue} numberOfLines={2}>
            {value}
        </Text>
    </View>
);

export default PaymentInvoiceList;

const styles = StyleSheet.create({
    screen: { flex: 1 },

    headerWrap: { marginBottom: moderateScale(10) },
    headerTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    h1: { fontSize: moderateScale(17), fontWeight: "600" },
    h2: { marginTop: 4, fontSize: moderateScale(12), color: "#6B7280", fontWeight: "600" },

    countPill: {
        minWidth: moderateScale(34),
        paddingHorizontal: moderateScale(10),
        height: moderateScale(26),
        borderRadius: 999,
        backgroundColor: "rgba(16,185,129,0.12)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(16,185,129,0.22)",
    },
    countText: { color: Colors.Green1, fontWeight: "900", fontSize: moderateScale(12) },

    card: {
        borderRadius: moderateScale(16),
        padding: moderateScale(12),
        marginBottom: moderateScale(12),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: moderateScale(10) },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    title: { fontSize: moderateScale(13.5), fontWeight: "500" },
    sub: { marginTop: 3, fontSize: moderateScale(11.5), opacity: 0.7, fontWeight: "500" },
    topDate: { fontSize: moderateScale(10.8), opacity: 0.8, fontWeight: "600" },

    paidPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(4),
        borderRadius: 999,
        backgroundColor: "rgba(16,185,129,0.10)",
        borderWidth: 1,
        borderColor: "rgba(16,185,129,0.18)",
    },
    paidPillText: { fontSize: moderateScale(11), fontWeight: "600", color: Colors.Green1 },

    iconBtn: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(12),
        backgroundColor: "rgba(16,185,129,0.10)",
        borderWidth: 1,
        borderColor: "rgba(16,185,129,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },

    amountGrid: {
        flexDirection: "row",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        borderRadius: moderateScale(14),
        overflow: "hidden",
        marginBottom: moderateScale(10),
        backgroundColor: "rgba(0,0,0,0.03)",
    },
    amountCell: { flex: 1, paddingVertical: moderateScale(10), paddingHorizontal: moderateScale(10) },
    amountLabel: { fontSize: moderateScale(10.5), color: "#6B7280", fontWeight: "500", marginBottom: 4 },
    amountValue: { fontSize: moderateScale(12.5), color: "#111827", fontWeight: "600" },
    vLine: { width: 1, backgroundColor: "rgba(0,0,0,0.06)" },

    netRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: moderateScale(10) },
    netLabel: { fontSize: moderateScale(11.5), color: "#6B7280", fontWeight: "500" },
    netValue: { fontSize: moderateScale(14), color: "#111827", fontWeight: "600" },

    actionsRow: { flexDirection: "row", gap: moderateScale(10) },
    actionBtn: {
        flex: 1,
        borderWidth: 1,
        paddingVertical: moderateScale(7),
        borderRadius: moderateScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    viewBtn: { backgroundColor: Colors.Green1, borderColor: "rgba(16,185,129,0.35)" },
    downloadBtn: { backgroundColor: "rgba(16,185,129,0.10)", borderColor: "rgba(16,185,129,0.25)" },
    actionTextGreen: { color: Colors.Green1, fontWeight: "900", fontSize: moderateScale(12.5), marginLeft: 5 },
    actionTextWhite: { color: Colors.white2, fontWeight: "900", fontSize: moderateScale(12.5), marginLeft: 5 },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalBackdropTouch: { flex: 1 },
    modalSheet: {
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        paddingHorizontal: moderateScale(16),
        paddingTop: moderateScale(10),
        paddingBottom: moderateScale(16),
        elevation: 15,
    },
    modalHandleContainer: { alignItems: "center", marginBottom: moderateScale(8) },
    modalHandle: { width: moderateScale(42), height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" },

    modalHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    modalTitle: { fontSize: moderateScale(16), fontWeight: "900", color: "#111827" },
    modalSubtitle: { marginTop: 2, fontSize: moderateScale(11.5), color: "#6B7280", fontWeight: "800" },
    modalCloseBtn: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(12),
        backgroundColor: "rgba(0,0,0,0.06)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },

    detailCardSoft: {
        marginTop: moderateScale(12),
        borderRadius: moderateScale(16),
        borderWidth: 1,
        borderColor: "rgba(16,185,129,0.18)",
        backgroundColor: "rgba(16,185,129,0.06)",
        padding: moderateScale(12),
    },
    sectionTitle: { fontSize: moderateScale(12.5), fontWeight: "900", color: "#0F172A", marginBottom: moderateScale(8) },

    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingVertical: moderateScale(7),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.06)",
    },
    detailLabel: { width: "45%", fontSize: moderateScale(11.5), color: "#6B7280", fontWeight: "900" },
    detailValue: { width: "55%", textAlign: "right", fontSize: moderateScale(12), color: "#111827", fontWeight: "900" },

    noteText: { marginTop: moderateScale(8), fontSize: moderateScale(10.5), color: "#6B7280", fontWeight: "700" },

    modalActionsRow: { marginTop: moderateScale(12), gap: moderateScale(10) },
    modalPrimaryBtn: {
        height: moderateScale(46),
        borderRadius: moderateScale(14),
        backgroundColor: Colors.Green1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    modalPrimaryText: { color: Colors.white2, fontSize: moderateScale(13), fontWeight: "900" },

    modalSecondaryBtn: {
        height: moderateScale(44),
        borderRadius: moderateScale(14),
        backgroundColor: "rgba(0,0,0,0.05)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    modalSecondaryText: { color: "#374151", fontSize: moderateScale(13), fontWeight: "900" },
});