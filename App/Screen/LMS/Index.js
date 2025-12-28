import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import BackHeader from "../../Components/BackHeader";
import NavigationService from "../../Services/Navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const Index = () => {

    const { userData } = useSelector(state => state.User);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState("");

    const fetchContentTypes = useCallback(async () => {
        const storedApiBase = await AsyncStorage.getItem('api_base_url');
        const API_URL = `${storedApiBase}get-lms-content-type`;
        const user_id = userData?.id || "";
        // console.log("URL & ID", API_URL, userData);

        try {
            setLoading(true);
            setError("");

            // POST form-data like in Postman
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
    }, []);

    useEffect(() => {
        fetchContentTypes();
    }, [fetchContentTypes]);

    const openDetails = (id) => {
        // Navigate with content id
        NavigationService.navigate("LMSDetails", { content_id: id });
    };

    const renderItem = ({ item }) => {
        return (
            <Pressable onPress={() => openDetails(item.id)} style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={2}>
                        {item.name}
                    </Text>
                </View>

                <Pressable
                    onPress={() => openDetails(item.id)}
                    hitSlop={10}
                    style={styles.arrowBtn}
                >
                    <Ionicons name="chevron-forward" size={22} color="#64748B" />
                </Pressable>
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

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.subtle}>Loading…</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.error}>{error}</Text>
                    <Pressable onPress={fetchContentTypes} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={rows}
                    keyExtractor={(it) => String(it.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
                    ItemSeparatorComponent={() => <View style={styles.sep} />}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.subtle}>No content found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { padding: 24, alignItems: "center" },
    subtle: { marginTop: 8, color: "#64748B" },
    error: { color: "#EF4444", textAlign: "center" },

    retryBtn: {
        marginTop: 12,
        backgroundColor: "#0EA5E9",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    retryText: { color: "#fff", fontWeight: "700" },

    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    name: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
    desc: { marginTop: 4, color: "#475569" },

    arrowBtn: { paddingLeft: 12, paddingVertical: 4 },

    sep: { height: 10 },
});