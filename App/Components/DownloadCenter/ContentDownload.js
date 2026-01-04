import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { TextStyles, appStyles } from "../../Constants/Fonts";
import { Images } from "../../Constants/Images";
import { moderateScale, screenHeight } from "../../Constants/PixelRatio";
import UseApi from "../../ApiConfig";
import { useSelector } from "react-redux";
import { useTheme } from "@react-navigation/native";
import rndownloadFile from "../../Utils/rndownload";
import Ionicons from "react-native-vector-icons/Ionicons";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

// NEW: second modal component
import FilePreviewModal from "./FilePreviewModal";

const ContentDownload = () => {
    const { Request } = UseApi();
    const { colors } = useTheme();
    const { userData } = useSelector((state) => state.User);

    const [loading, setLoading] = useState(false);
    const [contents, setContents] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currMeterial, setCurrMeterial] = useState(null);

    // NEW: preview modal state
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);

    useEffect(() => {
        getContents();
    }, []);

    const getContents = async () => {
        setLoading(true);

        const params = {
            user_id: userData?.id,
            role: "student",
            type: "1",
        };

        try {
            const data = await Request("share-list", "POST", params);
            if (data?.status && data?.data) setContents(data.data);
        } catch (err) {
            console.log("err2.", err);
        } finally {
            setLoading(false);
        }
    };

    const openInBrowser = async (url) => {
        if (!url) return;
        try {
            const can = await Linking.canOpenURL(url);
            if (can) await Linking.openURL(url);
            else Alert.alert("Invalid Link", "Unable to open this link.");
        } catch (e) {
            console.log("openInBrowser error:", e);
            Alert.alert("Error", "Unable to open the link.");
        }
    };

    const onDownloadPress = (url) => {
        if (!url) return;
        Alert.alert("Download", "Do you want to download this file?", [
            { text: "Cancel", style: "cancel" },
            { text: "Download", onPress: () => rndownloadFile(url) },
        ]);
    };

    const openPdfWithFileViewer = async (url, displayName = "document.pdf") => {
        try {
            if (!url) {
                Alert.alert("File missing", "This PDF link is not available.");
                return;
            }

            // If it's already a local path, open directly
            if (url.startsWith("file://")) {
                const localPath = url.replace("file://", "");
                await FileViewer.open(localPath, { showOpenWithDialog: true });
                return;
            }

            // Remote URL: download to cache first
            const safeName = String(displayName).replace(/[^\w.\-]/g, "_");
            const fileName = safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
            const localPath = `${RNFS.CachesDirectoryPath}/${Date.now()}_${fileName}`;

            const res = await RNFS.downloadFile({ fromUrl: url, toFile: localPath }).promise;

            if (res.statusCode && res.statusCode >= 400) {
                Alert.alert("Download failed", "Unable to download the PDF file.");
                return;
            }

            await FileViewer.open(localPath, { showOpenWithDialog: true });
        } catch (e) {
            console.log("openPdfWithFileViewer error:", e);
            Alert.alert("Unable to open", "This PDF could not be opened on this device.");
        }
    };

    // NEW: open preview (image/pdf) in second modal
    const openPreview = (doc) => {
        // console.log("Source", doc?.src);
        if (!doc?.src) return;
        setPreviewDoc(doc);
        setPreviewVisible(true);
    };

    /**
     * UPDATED icon themes:
     * - VIDEO: open in browser (your existing behavior)
     * - IMAGE/PDF: open preview modal (new)
     * - fallback: download
     */
    const getAttachmentTheme = (doc) => {
        const type = String(doc?.file_type || "").toLowerCase();

        if (type === "video") {
            return {
                kind: "video",
                bg: "#EEF2FF",
                fg: "#4F46E5",
                dot: "#4F46E5",
                icon: "videocam-outline",
                actionIcon: "play-circle-outline",
                actionBg: colors.primary,
                actionFg: "#fff",
            };
        }

        if (type === "image") {
            return {
                kind: "image",
                bg: "#FFF7ED",
                fg: "#EA580C",
                dot: "#EA580C",
                icon: "image-outline",
                actionIcon: "eye-outline",
                actionBg: colors.background,
                actionFg: colors.text,
            };
        }

        if (type === "pdf") {
            return {
                kind: "pdf",
                bg: "#FEF2F2",
                fg: "#DC2626",
                dot: "#DC2626",
                icon: "document-text-outline",
                actionIcon: "eye-outline",
                actionBg: colors.background,
                actionFg: colors.text,
            };
        }

        // fallback: download behavior (same as your older non-video logic)
        return {
            kind: "file",
            bg: "#ECFDF5",
            fg: "#059669",
            dot: "#059669",
            icon: "document-text-outline",
            actionIcon: "download-outline",
            actionBg: colors.background,
            actionFg: colors.text,
        };
    };

    const onAttachmentAction = async (doc) => {
        const type = String(doc?.file_type || "").toLowerCase();

        if (type === "video") return openInBrowser(doc?.src);

        // PDF => open with FileViewer (native viewer)
        if (type === "pdf") return openPdfWithFileViewer(doc?.src, doc?.real_name || "document.pdf");

        // Image => keep your preview modal
        if (type === "image") return openPreview(doc);

        return onDownloadPress(doc?.src);
    };

    return (
        <View style={{ backgroundColor: colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    backgroundColor: colors.background,
                    minHeight: screenHeight - 155,
                }}
            >
                <View style={{ marginBottom: 100 }}>
                    {contents.map((item, index) => {
                        return (
                            <View
                                key={index}
                                style={{
                                    ...appStyles.card,
                                    width: "92%",
                                    backgroundColor: colors.background,
                                    borderColor: colors.lightBlck,
                                    borderWidth: 0.5,
                                }}
                            >
                                {/* Card header (unchanged) */}
                                <View
                                    style={{
                                        ...appStyles.titleRow,
                                        backgroundColor: colors.lightGreen,
                                    }}
                                >
                                    <Text style={{ ...TextStyles.title2, color: colors.text }}>
                                        {item.title}
                                    </Text>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            marginTop: 2,
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                setOpenModal(true);
                                                setCurrMeterial(item);
                                            }}
                                        >
                                            <Image
                                                source={Images.eye}
                                                style={{
                                                    height: 20,
                                                    width: 20,
                                                    tintColor: colors.text,
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={{ padding: 15, paddingTop: 5 }}>
                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                            Share Date
                                        </Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                            {item.share_date}
                                        </Text>
                                    </View>

                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                            Valid Upto
                                        </Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                            {item.valid_upto || "NA"}
                                        </Text>
                                    </View>

                                    <View style={appStyles.itmRow}>
                                        <Text style={{ ...TextStyles.keyText, color: colors.text }}>
                                            Share By
                                        </Text>
                                        <Text style={{ ...TextStyles.valueText, color: colors.text }}>
                                            {item.share_by || "NA"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* First Modal (existing) */}
                <Modal
                    visible={openModal}
                    transparent
                    statusBarTranslucent
                    animationType="fade"
                    onRequestClose={() => setOpenModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        {/* Tap outside to close */}
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={() => setOpenModal(false)}
                        />

                        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
                            {/* Handle */}
                            <View style={styles.handleWrap}>
                                <View
                                    style={[styles.handle, { backgroundColor: colors.lightBlck }]}
                                />
                            </View>

                            {/* Header */}
                            {/* <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <View
                                        style={[
                                            styles.headerIcon,
                                            {
                                                borderColor: colors.lightBlck,
                                                backgroundColor: colors.lightGreen,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="folder-open-outline"
                                            size={20}
                                            color={colors.text}
                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[styles.headerTitle, { color: colors.text }]}
                                            numberOfLines={2}
                                        >
                                            {currMeterial?.title || "Content"}
                                        </Text>
                                        <Text
                                            style={[styles.headerSub, { color: colors.text }]}
                                            numberOfLines={1}
                                        >
                                            {currMeterial?.share_by
                                                ? `Shared by ${currMeterial.share_by}`
                                                : "—"}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setOpenModal(false)}
                                    style={[styles.closeBtn, { borderColor: colors.lightBlck }]}
                                >
                                    <Image
                                        source={Images.close}
                                        style={{ height: 12, width: 12, tintColor: colors.text }}
                                    />
                                </TouchableOpacity>
                            </View> */}

                            {/* Body */}
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 18 }}
                            >
                                {/* Title */}
                                <View style={styles.header}>
                                    <Text
                                        style={[styles.headerTitle, { color: colors.text }]}
                                        numberOfLines={2}
                                    >
                                        {currMeterial?.title || "Content"}
                                    </Text>
                                </View>
                                {/* Description */}
                                {currMeterial?.description?.trim() ? (
                                    <View
                                        style={[styles.attachCard, { borderColor: colors.lightBlck }]}
                                    >
                                        <View
                                            style={[
                                                styles.attachHeader,
                                                {
                                                    backgroundColor: colors.lightGreen,
                                                    borderColor: colors.lightBlck,
                                                },
                                            ]}
                                        >
                                            <View style={styles.attachHeaderLeft}>
                                                <Ionicons
                                                    name="attach-outline"
                                                    size={16}
                                                    color={colors.text}
                                                />
                                                <Text
                                                    style={[
                                                        styles.attachHeaderTitle,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    Description
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                styles.attachBody,
                                                { backgroundColor: colors.background },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.sectionText,
                                                    { color: colors.text, marginTop: 8 },
                                                ]}
                                            >
                                                {currMeterial.description}
                                            </Text>
                                        </View>
                                    </View>
                                ) : null}

                                {/* Attachments list */}
                                <View style={[styles.attachCard, { borderColor: colors.lightBlck }]}>
                                    <View
                                        style={[
                                            styles.attachHeader,
                                            {
                                                backgroundColor: colors.lightGreen,
                                                borderColor: colors.lightBlck,
                                            },
                                        ]}
                                    >
                                        <View style={styles.attachHeaderLeft}>
                                            <Ionicons
                                                name="attach-outline"
                                                size={16}
                                                color={colors.text}
                                            />
                                            <Text
                                                style={[
                                                    styles.attachHeaderTitle,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                Attachments
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.countBadge,
                                                {
                                                    backgroundColor: colors.background,
                                                    borderColor: colors.lightBlck,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.countBadgeText,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {(currMeterial?.upload_doc || []).length}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.attachBody, { backgroundColor: colors.background }]}>
                                        {(currMeterial?.upload_doc || []).map((doc, idx) => {
                                            const theme = getAttachmentTheme(doc);

                                            return (
                                                <View
                                                    key={`${doc?.id || idx}`}
                                                    style={[
                                                        styles.attachmentRow,
                                                        {
                                                            borderColor: colors.lightBlck,
                                                            backgroundColor: colors.background,
                                                        },
                                                    ]}
                                                >
                                                    {/* LEFT ICON */}
                                                    <View style={styles.attachmentLeft}>
                                                        <View
                                                            style={[
                                                                styles.lmsIcon,
                                                                {
                                                                    backgroundColor: theme.bg,
                                                                    borderColor: colors.lightBlck,
                                                                },
                                                            ]}
                                                        >
                                                            <Ionicons
                                                                name={theme.icon}
                                                                size={20}
                                                                color={theme.fg}
                                                            />
                                                            <View
                                                                style={[
                                                                    styles.lmsDot,
                                                                    { backgroundColor: theme.dot },
                                                                ]}
                                                            />
                                                        </View>

                                                        <View style={{ flex: 1 }}>
                                                            <Text
                                                                style={[
                                                                    styles.fileTitle,
                                                                    { color: colors.text },
                                                                ]}
                                                                numberOfLines={2}
                                                            >
                                                                {doc?.real_name || "Untitled"}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* RIGHT ACTION */}
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.actionPill,
                                                            {
                                                                backgroundColor: theme.actionBg,
                                                                borderColor: colors.lightBlck,
                                                            },
                                                        ]}
                                                        onPress={() => onAttachmentAction(doc)}
                                                    >
                                                        <Ionicons
                                                            name={theme.actionIcon}
                                                            size={20}
                                                            color={theme.actionFg}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}

                                        {(!currMeterial?.upload_doc ||
                                            currMeterial.upload_doc.length === 0) && (
                                                <View style={[styles.emptyState, { borderColor: colors.lightBlck }]}>
                                                    <Text style={[styles.sectionText, { color: colors.text }]}>
                                                        No attachments found.
                                                    </Text>
                                                </View>
                                            )}
                                    </View>
                                </View>
                            </ScrollView>

                            {/* Footer */}
                            <View style={[styles.footer, { borderTopColor: colors.lightBlck }]}>
                                <TouchableOpacity
                                    onPress={() => setOpenModal(false)}
                                    style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                                >
                                    <Text style={styles.primaryBtnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* NEW: Second modal for Image/PDF preview */}
                <FilePreviewModal
                    visible={previewVisible}
                    onClose={() => setPreviewVisible(false)}
                    fileType={previewDoc?.file_type}
                    uri={previewDoc?.src}
                    title={previewDoc?.real_name}
                />

                {loading && (
                    <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />
                )}

                {!loading && contents.length === 0 && (
                    <View style={{ marginTop: screenHeight / 4, alignItems: "center" }}>
                        <Image
                            source={Images.NoDataFound}
                            style={{
                                height: moderateScale(60),
                                width: moderateScale(60),
                                opacity: 0.5,
                            }}
                        />
                        <Text
                            style={{
                                fontSize: moderateScale(14),
                                marginTop: 10,
                                color: colors.text,
                            }}
                        >
                            No records found!
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default ContentDownload;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        justifyContent: "flex-end",
    },

    sheet: {
        width: "100%",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        height: screenHeight * 0.7,
        overflow: "hidden",
        ...Platform.select({
            android: { elevation: 10 },
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.14,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: -8 },
            },
        }),
    },

    handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
    handle: { width: 66, height: 5, borderRadius: 999, opacity: 0.85 },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
        paddingRight: 10,
    },
    headerIcon: {
        height: 44,
        width: 44,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: moderateScale(16),
        fontWeight: "500",
        lineHeight: moderateScale(22),
    },
    headerSub: {
        fontSize: moderateScale(12),
        fontWeight: "700",
        opacity: 0.75,
    },
    closeBtn: {
        height: 40,
        width: 40,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
    },

    sectionText: {
        fontSize: moderateScale(12),
        lineHeight: moderateScale(18),
        fontWeight: "600",
        opacity: 0.9,
    },

    attachCard: {
        marginTop: 12,
        marginHorizontal: 16,
        borderWidth: 0.5,
        borderRadius: 16,
        overflow: "hidden",
    },
    attachHeader: {
        borderBottomWidth: 0.5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    attachHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    attachHeaderTitle: {
        fontSize: moderateScale(13),
        fontWeight: "900",
        marginLeft: 8,
    },
    countBadge: {
        borderWidth: 0.5,
        height: 26,
        minWidth: 34,
        paddingHorizontal: 10,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    countBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: "900",
    },

    attachBody: {
        paddingHorizontal: 14,
        paddingBottom: 14,
    },

    attachmentRow: {
        borderWidth: 0.5,
        borderRadius: 14,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
    attachmentLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 10,
    },

    lmsIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginRight: 10,
    },
    lmsDot: {
        width: 7,
        height: 7,
        borderRadius: 99,
        position: "absolute",
        right: 7,
        bottom: 7,
        opacity: 0.95,
    },

    fileTitle: {
        fontSize: moderateScale(13),
        fontWeight: "900",
        lineHeight: moderateScale(18),
    },

    actionPill: {
        height: 38,
        width: 44,
        borderRadius: 14,
        borderWidth: 0.5,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyState: {
        borderWidth: 0.5,
        borderRadius: 14,
        padding: 12,
        marginTop: 10,
        alignItems: "center",
    },

    footer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 50,
        borderTopWidth: 0.5,
    },
    primaryBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: {
        color: "#fff",
        fontSize: moderateScale(14),
        fontWeight: "900",
    },
});