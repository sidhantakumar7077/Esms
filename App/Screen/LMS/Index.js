import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import BackHeader from "../../Components/BackHeader";
import NavigationService from "../../Services/Navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

const ICON_PALETTE = [
    { bg: "#EEF2FF", fg: "#4F46E5", icon: "book-outline" },
    { bg: "#ECFDF5", fg: "#059669", icon: "clipboard-outline" },
    { bg: "#FFF7ED", fg: "#EA580C", icon: "play-circle-outline" },
    { bg: "#FDF2F8", fg: "#DB2777", icon: "document-text-outline" },
    { bg: "#EFF6FF", fg: "#2563EB", icon: "layers-outline" },
    { bg: "#F5F3FF", fg: "#7C3AED", icon: "library-outline" },
    { bg: "#F1F5F9", fg: "#0F172A", icon: "school-outline" },
];

const pickIconStyle = (seed) => {
    const n = ICON_PALETTE.length;
    const idx = Math.abs(Number(seed || 0)) % n;
    return ICON_PALETTE[idx];
};

const Index = () => {
    const { userData } = useSelector((state) => state.User);

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");

    const fetchContentTypes = useCallback(async () => {
        const storedApiBase = await AsyncStorage.getItem("api_base_url");
        const user_id = userData?.id || "";

        if (!storedApiBase) {
            setError("API base URL not found. Please set api_base_url first.");
            setRows([]);
            return;
        }

        const API_URL = `${storedApiBase}get-lms-content-type`;

        try {
            setLoading(true);
            setError("");

            const form = new FormData();
            form.append("user_id", user_id);
            form.append("type", "contenttype");

            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "x-api-key": "123123",
                },
                body: form,
            });

            const json = await res.json();

            if (!json?.status) {
                throw new Error(json?.message || "Failed to load content list.");
            }

            setRows(Array.isArray(json?.data) ? json.data : []);
        } catch (e) {
            setError(e?.message || "Something went wrong.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [userData?.id]);

    useEffect(() => {
        fetchContentTypes();
    }, [fetchContentTypes]);

    const openDetails = (id) => {
        NavigationService.navigate("LMSDetails", { content_id: id });
    };

    const renderItem = ({ item, index }) => {
        const theme = pickIconStyle(item?.id ?? index);

        return (
            <Pressable
                onPress={() => openDetails(item.id)}
                android_ripple={{ color: "#E2E8F0" }}
                style={({ pressed }) => [
                    styles.card,
                    pressed && Platform.OS === "ios" ? styles.cardPressed : null,
                ]}
            >
                {/* Left Icon */}
                <View style={[styles.iconWrap, { backgroundColor: theme.bg }]}>
                    <Ionicons name={theme.icon} size={22} color={theme.fg} />
                    <View style={[styles.iconDot, { backgroundColor: theme.fg }]} />
                </View>

                {/* Text */}
                <View style={styles.textWrap}>
                    <Text style={styles.title} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        Tap to view details
                    </Text>
                </View>

                {/* Right Arrow */}
                <View style={styles.chevWrap}>
                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <BackHeader
                title="LMS"
                onBackIconPress={() => {
                    NavigationService.navigate("Home");
                }}
            />

            {/* Top Section */}
            <View style={styles.headerArea}>
                <Text style={styles.screenTitle}>Learning Content</Text>
                <Text style={styles.screenHint}>
                    Choose a content type to explore available materials.
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.subtle}>Loading…</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.error}>{error}</Text>
                    <Pressable onPress={fetchContentTypes} style={styles.retryBtn}>
                        <Ionicons name="refresh-outline" size={18} color="#fff" />
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={rows}
                    keyExtractor={(it) => String(it.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.sep} />}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="folder-open-outline" size={34} color="#94A3B8" />
                            <Text style={[styles.subtle, { marginTop: 10 }]}>
                                No content found.
                            </Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchContentTypes}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F1F5F9" },

    headerArea: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 6,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#0F172A",
        letterSpacing: 0.2,
    },
    screenHint: {
        marginTop: 6,
        color: "#64748B",
        fontSize: 13,
        lineHeight: 18,
    },

    center: { padding: 24, alignItems: "center" },
    subtle: { marginTop: 8, color: "#64748B" },
    error: { color: "#EF4444", textAlign: "center", lineHeight: 20 },

    retryBtn: {
        marginTop: 14,
        backgroundColor: "#0EA5E9",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: "#0EA5E9",
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            },
            android: { elevation: 3 },
        }),
    },
    retryText: { color: "#fff", fontWeight: "800" },

    listContent: { padding: 16, paddingBottom: 30 },

    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        ...Platform.select({
            ios: {
                shadowColor: "#0F172A",
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
            },
            android: { elevation: 2 },
        }),
    },
    cardPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.96,
    },

    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        position: "relative",
    },
    iconDot: {
        width: 8,
        height: 8,
        borderRadius: 99,
        position: "absolute",
        right: 6,
        bottom: 6,
        opacity: 0.9,
    },

    textWrap: { flex: 1 },
    title: {
        fontSize: 15,
        fontWeight: "900",
        color: "#0F172A",
        letterSpacing: 0.15,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 12,
        color: "#64748B",
    },

    chevWrap: {
        paddingLeft: 10,
        paddingVertical: 6,
    },

    sep: { height: 12 },
});
