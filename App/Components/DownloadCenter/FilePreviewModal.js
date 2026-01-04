import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "../../Constants/PixelRatio";

const FilePreviewModal = ({ visible, onClose, fileType, uri, title }) => {
    
    const insets = useSafeAreaInsets();

    // Keeping fileType for compatibility, but we do NOT support pdf here.
    const normalizedType = useMemo(
        () => String(fileType || "image").toLowerCase(),
        [fileType]
    );

    const isImage = normalizedType === "image";

    const [errorMsg, setErrorMsg] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [loading, setLoading] = useState(false);

    const computedTitle = title || (isImage ? "Image Preview" : "Preview");
    const showEmpty = !uri;
    const showError = !!errorMsg;

    useEffect(() => {
        if (!visible) return;

        setErrorMsg("");
        setReloadKey(0);
        setLoading(false);
    }, [visible, uri]);

    const retry = () => {
        setErrorMsg("");
        setLoading(false);
        setReloadKey((k) => k + 1);
    };

    const MessageState = ({ variant }) => {
        const isErr = variant === "error";

        return (
            <View style={styles.stateWrap}>
                <View style={styles.stateCard}>
                    <View
                        style={[
                            styles.stateIconWrap,
                            isErr ? styles.iconDanger : styles.iconNeutral,
                        ]}
                    >
                        <Ionicons
                            name={isErr ? "alert-circle-outline" : "cloud-offline-outline"}
                            size={46}
                            color={isErr ? "#F87171" : "rgba(255,255,255,0.78)"}
                        />
                    </View>

                    <Text style={styles.stateTitle}>
                        {isErr ? "Unable to open this file" : "File not available"}
                    </Text>

                    <Text style={styles.stateMsg}>
                        {isErr
                            ? errorMsg || "This file could not be loaded. Please try again."
                            : "The file URL is missing or invalid, so preview cannot be opened."}
                    </Text>

                    <View style={styles.stateActions}>
                        {!showEmpty && (
                            <TouchableOpacity
                                onPress={retry}
                                style={[styles.btn, styles.btnGhost]}
                            >
                                <Ionicons name="refresh-outline" size={16} color="#fff" />
                                <Text style={styles.btnText}>Retry</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.btn, styles.btnPrimary]}
                        >
                            <Ionicons name="close-outline" size={18} color="#0B1220" />
                            <Text style={[styles.btnText, { color: "#0B1220" }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderViewer = () => {
        if (showEmpty) return <MessageState variant="empty" />;
        if (showError) return <MessageState variant="error" />;

        // Only image is supported in this component now.
        if (!isImage) {
            return (
                <View style={styles.viewerCard}>
                    <MessageState variant="error" />
                </View>
            );
        }

        return (
            <View style={styles.viewerCard}>
                <Image
                    key={`img-${reloadKey}`}
                    source={{ uri }}
                    style={styles.viewer}
                    resizeMode="contain"
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setErrorMsg("We could not load this image from the provided URL.");
                    }}
                />

                {loading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size={30} color="#fff" />
                        <Text style={styles.loaderText}>Loading image…</Text>
                    </View>
                )}
            </View>
        );
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            statusBarTranslucent
            animationType="fade"
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <View style={styles.titleWrap}>
                            <Text style={styles.topTitle} numberOfLines={1}>
                                {computedTitle}
                            </Text>
                        </View>

                        {/* Close icon only top-right */}
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>{renderViewer()}</View>

                    {/* Bottom safe-area spacer */}
                    <View style={{ height: Math.max(10, insets.bottom) }} />
                </SafeAreaView>
            </View>
        </Modal>
    );
};

export default FilePreviewModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#0B1220",
    },
    safe: {
        flex: 1,
    },

    topBar: {
        paddingTop: 6,
        paddingHorizontal: 14,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.10)",
    },
    titleWrap: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 10,
    },
    topTitle: {
        color: "#fff",
        fontSize: moderateScale(13),
        fontWeight: "900",
        textAlign: "center",
    },
    closeBtn: {
        height: 44,
        width: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
    },

    body: {
        flex: 1,
        paddingHorizontal: 14,
        paddingBottom: 10,
    },

    viewerCard: {
        flex: 1,
        borderRadius: 18,
        overflow: "hidden",
    },
    viewer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

    // Loader
    loaderOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.22)",
    },
    loaderText: {
        marginTop: 10,
        color: "rgba(255,255,255,0.90)",
        fontSize: moderateScale(12),
        fontWeight: "800",
    },

    // Empty / error state
    stateWrap: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
    },
    stateCard: {
        width: "100%",
        maxWidth: 460,
        borderRadius: 18,
        padding: 18,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
    },
    stateIconWrap: {
        height: 78,
        width: 78,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        borderWidth: 1,
    },
    iconNeutral: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.14)",
    },
    iconDanger: {
        backgroundColor: "rgba(248,113,113,0.12)",
        borderColor: "rgba(248,113,113,0.22)",
    },
    stateTitle: {
        color: "#fff",
        fontSize: moderateScale(14),
        fontWeight: "900",
        textAlign: "center",
    },
    stateMsg: {
        marginTop: 8,
        color: "rgba(255,255,255,0.86)",
        fontSize: moderateScale(12),
        fontWeight: "700",
        textAlign: "center",
        lineHeight: moderateScale(18),
    },
    stateActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },

    btn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
    },
    btnGhost: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.14)",
    },
    btnPrimary: {
        backgroundColor: "#F8FAFC",
        borderColor: "rgba(255,255,255,0.10)",
    },
    btnText: {
        marginLeft: 8,
        color: "#fff",
        fontSize: moderateScale(12),
        fontWeight: "900",
    },
});