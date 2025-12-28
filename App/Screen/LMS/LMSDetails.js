import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import RenderHTML from "react-native-render-html";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import moment from "moment";
import BackHeader from "../../Components/BackHeader";
import NavigationService from "../../Services/Navigation";
import { useSelector } from 'react-redux';

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Minimal clean-up; keep HTML for RenderHTML
const sanitizeHtml = (html) => {
    if (!html) return "";
    return String(html).replace(/\sxss="removed"/g, "").replace(/\sxss=removed/g, "");
};

const safeFileName = (name = "file.pdf") =>
    String(name).replace(/[^\w.\-() ]/g, "_").slice(0, 120);

const LMSDetails = ({ route }) => {
    const contentTypeId = route?.params?.content_id; // passed from list screen
    const { userData } = useSelector(state => state.User);
    const [loading, setLoading] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState("");

    // Lesson accordion: lessonId => boolean (true = collapsed)
    const [collapsedLesson, setCollapsedLesson] = useState({});
    // Topic accordion: topicId => boolean (true = expanded)
    const [expandedTopic, setExpandedTopic] = useState({});

    // Per-topic details cache/loading
    const [topicLoading, setTopicLoading] = useState({}); // topicId => boolean
    const [topicDetails, setTopicDetails] = useState({}); // topicId => { description, topicContent[] } or { __error }

    // PDF open state (optional)
    const [openingFileId, setOpeningFileId] = useState(null);

    const fetchLessonTopics = useCallback(async () => {
        const storedApiBase = await AsyncStorage.getItem('api_base_url');
        const API_URL = `${storedApiBase}get-lms-content-type`;
        const user_id = userData?.id || "";
        console.log("URL & ID", API_URL, userData);

        try {
            setLoading(true);
            setError("");

            const form = new FormData();
            form.append("user_id", user_id);
            form.append("type", "lesson_topic");
            form.append("content_type_id", String(contentTypeId));

            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "x-api-key": "123123" },
                body: form,
            });

            const json = await res.json();

            if (!json?.status) throw new Error(json?.message || "Failed to load lesson topics.");

            const data = Array.isArray(json?.data) ? json.data : [];
            setLessons(data);

            // default: lessons expanded (not collapsed)
            const init = {};
            data.forEach((l) => {
                init[String(l.id)] = false;
            });
            setCollapsedLesson(init);

            // default: all topics closed
            setExpandedTopic({});
            setTopicDetails({});
            setTopicLoading({});
        } catch (e) {
            setError(e?.message || "Something went wrong.");
            setLessons([]);
        } finally {
            setLoading(false);
        }
    }, [contentTypeId]);

    const fetchTopicDetails = useCallback(
        async (topicId) => {
            const tid = String(topicId);

            // already loaded or already loading
            if (topicLoading[tid] || topicDetails[tid]) return;

            const storedApiBase = await AsyncStorage.getItem('api_base_url');
            const API_URL = `${storedApiBase}get-lms-content-type`;

            try {
                setTopicLoading((s) => ({ ...s, [tid]: true }));

                const user_id = (await AsyncStorage.getItem("user_id"));

                const form = new FormData();
                form.append("user_id", user_id);
                form.append("type", "topic");
                form.append("content_type_id", String(contentTypeId));
                form.append("topic_id", tid);

                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "x-api-key": "123123" },
                    body: form,
                });

                const json = await res.json();

                if (!json?.status) throw new Error(json?.message || "Failed to load topic details.");

                setTopicDetails((s) => ({ ...s, [tid]: json?.data || {} }));
            } catch (e) {
                setTopicDetails((s) => ({ ...s, [tid]: { __error: e?.message || "Failed to load topic." } }));
            } finally {
                setTopicLoading((s) => ({ ...s, [tid]: false }));
            }
        },
        [contentTypeId, topicDetails, topicLoading]
    );

    useEffect(() => {
        fetchLessonTopics();
    }, [fetchLessonTopics]);

    const toggleLesson = (lessonId) => {
        const lid = String(lessonId);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCollapsedLesson((s) => ({ ...s, [lid]: !s[lid] }));
    };

    const toggleTopic = (topicId) => {
        const tid = String(topicId);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setExpandedTopic((s) => {
            const nextOpen = !s[tid];
            // If opening: fetch topic details
            if (nextOpen && !topicDetails[tid]) fetchTopicDetails(tid);
            return { ...s, [tid]: nextOpen };
        });
    };

    const openPdf = useCallback(async (file) => {
        try {
            const fileId = String(file?.id || "");
            setOpeningFileId(fileId);

            const url = `${file.file_path}`;
            const name = safeFileName(file.original_name || file.file_name || "file.pdf");
            const localPath = `${RNFS.CachesDirectoryPath}/${name}`;

            // Download (overwrite if exists)
            const exists = await RNFS.exists(localPath);
            if (exists) await RNFS.unlink(localPath);

            const dl = RNFS.downloadFile({ fromUrl: url, toFile: localPath });
            const res = await dl.promise;

            if (res.statusCode && res.statusCode >= 400) {
                throw new Error(`Download failed (${res.statusCode})`);
            }

            await FileViewer.open(localPath, { showOpenWithDialog: true });
        } catch (e) {
            Alert.alert("Unable to open file", e?.message || "Please try again.");
        } finally {
            setOpeningFileId(null);
        }
    }, []);

    const normalizedLessons = useMemo(() => {
        return lessons.map((l) => ({
            ...l,
            topics: Array.isArray(l.topics) ? l.topics : [],
        }));
    }, [lessons]);

    return (
        <View style={styles.container}>
            <BackHeader title="LMS Content" onBackIconPress={() => NavigationService.navigate("LMS")} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.subtle}>Loading…</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.error}>{error}</Text>
                    <Pressable onPress={fetchLessonTopics} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : normalizedLessons.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.subtle}>No lessons found.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
                    {normalizedLessons.map((lesson) => {
                        const lid = String(lesson.id);
                        const isLessonCollapsed = !!collapsedLesson[lid];

                        return (
                            <View key={lid} style={styles.lessonCard}>
                                {/* Lesson header (collapsible) */}
                                <Pressable onPress={() => toggleLesson(lid)} style={styles.lessonHeader}>
                                    <Text style={styles.lessonTitle} numberOfLines={2}>
                                        {lesson.name || "Lesson"}
                                    </Text>
                                    <Ionicons
                                        name={isLessonCollapsed ? "chevron-down" : "chevron-up"}
                                        size={20}
                                        color="#64748B"
                                    />
                                </Pressable>

                                {!isLessonCollapsed ? (
                                    lesson.topics.length ? (
                                        lesson.topics.map((topic) => {
                                            const tid = String(topic.id);
                                            const isOpen = !!expandedTopic[tid];
                                            const isTLoading = !!topicLoading[tid];
                                            const details = topicDetails[tid];

                                            return (
                                                <View key={tid} style={styles.topicWrap}>
                                                    {/* Topic header (collapsible) */}
                                                    <Pressable onPress={() => toggleTopic(tid)} style={styles.topicRow}>
                                                        <View style={styles.topicLeft}>
                                                            <View style={styles.topicIcon}>
                                                                <Ionicons name="book-outline" size={18} color="#334155" />
                                                            </View>

                                                            <View style={{ flex: 1 }}>
                                                                <Text style={styles.topicName} numberOfLines={1}>
                                                                    {topic.name || "Topic"}
                                                                </Text>

                                                                <Text style={styles.posted} numberOfLines={1}>
                                                                    {`Posted ${moment(topic.created_at, "YYYY-MM-DD HH:mm:ss").format("MMM D, YYYY")}`}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <Ionicons
                                                            name={isOpen ? "chevron-up" : "chevron-down"}
                                                            size={20}
                                                            color="#64748B"
                                                        />
                                                    </Pressable>

                                                    {isOpen ? (
                                                        <View style={styles.topicDetails}>
                                                            {isTLoading ? (
                                                                <View style={{ paddingVertical: 10, alignItems: "center" }}>
                                                                    <ActivityIndicator size="small" />
                                                                    <Text style={styles.subtle}>Loading details…</Text>
                                                                </View>
                                                            ) : details?.__error ? (
                                                                <Text style={styles.error}>{details.__error}</Text>
                                                            ) : (
                                                                <>
                                                                    {/* HTML description */}
                                                                    <RenderHTML
                                                                        contentWidth={320} // safe default; works fine
                                                                        source={{ html: sanitizeHtml(details?.description || "") }}
                                                                        baseStyle={styles.htmlBase}
                                                                    />

                                                                    {/* Attachments */}
                                                                    <Text style={[styles.detailLabel, { marginTop: 12 }]}>
                                                                        Attachments
                                                                    </Text>

                                                                    {Array.isArray(details?.topicContent) && details.topicContent.length ? (
                                                                        details.topicContent.map((f) => {
                                                                            const fileId = String(f.id);
                                                                            const isOpening = openingFileId === fileId;

                                                                            return (
                                                                                <Pressable
                                                                                    key={fileId}
                                                                                    onPress={() => openPdf(f)}
                                                                                    style={styles.fileCard}
                                                                                >
                                                                                    <View style={styles.fileIcon}>
                                                                                        <Ionicons name="document-text-outline" size={20} color="#EF4444" />
                                                                                    </View>

                                                                                    <View style={{ flex: 1 }}>
                                                                                        <Text style={styles.fileName} numberOfLines={2}>
                                                                                            {f.original_name || f.file_name || "File"}
                                                                                        </Text>
                                                                                        <Text style={styles.fileMeta}>
                                                                                            {(f.file_extension || "").toUpperCase()}
                                                                                            {f.file_size ? ` • ${f.file_size} bytes` : ""}
                                                                                        </Text>
                                                                                    </View>

                                                                                    {isOpening ? (
                                                                                        <ActivityIndicator size="small" />
                                                                                    ) : (
                                                                                        <Ionicons name="chevron-forward" size={18} color="#64748B" />
                                                                                    )}
                                                                                </Pressable>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <Text style={styles.subtle}>No attachments.</Text>
                                                                    )}
                                                                </>
                                                            )}
                                                        </View>
                                                    ) : null}
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <Text style={styles.subtle}>No topics found.</Text>
                                    )
                                ) : null}
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};

export default LMSDetails;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F7FB" },

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
    retryText: { color: "#fff", fontWeight: "800" },

    lessonCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 12,
        ...Platform.select({
            android: { elevation: 2 },
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            },
        }),
    },

    lessonHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },

    lessonTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#0F172A",
        flex: 1,
        paddingRight: 10,
    },

    topicWrap: {
        backgroundColor: "#F8FAFC",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginTop: 12,
        overflow: "hidden",
    },

    topicRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
    },

    topicLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingRight: 10,
        gap: 10,
    },

    topicIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },

    topicName: {
        fontWeight: "900",
        color: "#0F172A",
        fontSize: 15,
    },

    posted: {
        marginTop: 2,
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
    },

    topicDetails: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
    },

    htmlBase: { color: "#0F172A", lineHeight: 20, fontSize: 14 },

    fileCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 14,
        padding: 12,
        marginTop: 10,
        backgroundColor: "#F8FAFC",
    },

    fileIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
    },

    fileName: { color: "#0F172A", fontWeight: "900" },
    fileMeta: { color: "#64748B", marginTop: 2, fontSize: 12, fontWeight: "600" },
});