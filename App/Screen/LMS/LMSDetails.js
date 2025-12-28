import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    LayoutAnimation,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
    useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import RenderHTML from "react-native-render-html";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import moment from "moment";
import BackHeader from "../../Components/BackHeader";
import NavigationService from "../../Services/Navigation";
import { useSelector } from "react-redux";

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

const ICON_PALETTE = [
    { bg: "#EEF2FF", fg: "#4F46E5", icon: "layers-outline" }, // indigo
    { bg: "#ECFDF5", fg: "#059669", icon: "leaf-outline" }, // green
    { bg: "#FFF7ED", fg: "#EA580C", icon: "flame-outline" }, // orange
    { bg: "#FDF2F8", fg: "#DB2777", icon: "sparkles-outline" }, // pink
    { bg: "#EFF6FF", fg: "#2563EB", icon: "book-outline" }, // blue
    { bg: "#F5F3FF", fg: "#7C3AED", icon: "bulb-outline" }, // violet
    { bg: "#F1F5F9", fg: "#0F172A", icon: "school-outline" }, // slate
];

const pickTheme = (seed) => {
    const n = ICON_PALETTE.length;
    const idx = Math.abs(Number(seed || 0)) % n;
    return ICON_PALETTE[idx];
};

const fileTheme = (file) => {
    const ext = String(file?.file_extension || "")
        .replace(".", "")
        .toLowerCase();

    if (["pdf"].includes(ext)) return { bg: "#FEE2E2", fg: "#EF4444", icon: "document-text-outline" };
    if (["doc", "docx"].includes(ext)) return { bg: "#DBEAFE", fg: "#2563EB", icon: "document-outline" };
    if (["xls", "xlsx", "csv"].includes(ext)) return { bg: "#DCFCE7", fg: "#16A34A", icon: "grid-outline" };
    if (["ppt", "pptx"].includes(ext)) return { bg: "#FFEDD5", fg: "#F97316", icon: "easel-outline" };
    if (["mp4", "mov", "mkv"].includes(ext)) return { bg: "#E0E7FF", fg: "#4F46E5", icon: "videocam-outline" };
    if (["mp3", "wav"].includes(ext)) return { bg: "#FCE7F3", fg: "#DB2777", icon: "musical-notes-outline" };
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return { bg: "#E0F2FE", fg: "#0284C7", icon: "image-outline" };

    return { bg: "#E2E8F0", fg: "#0F172A", icon: "attach-outline" };
};

const LMSDetails = ({ route }) => {
    const { width } = useWindowDimensions();
    const contentTypeId = route?.params?.content_id; // passed from list screen
    const { userData } = useSelector((state) => state.User);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState("");

    // Lesson accordion: lessonId => boolean (true = collapsed)
    const [collapsedLesson, setCollapsedLesson] = useState({});
    // Topic accordion: topicId => boolean (true = expanded)
    const [expandedTopic, setExpandedTopic] = useState({});

    // Per-topic details cache/loading
    const [topicLoading, setTopicLoading] = useState({}); // topicId => boolean
    const [topicDetails, setTopicDetails] = useState({}); // topicId => { description, topicContent[] } or { __error }

    // File open state
    const [openingFileId, setOpeningFileId] = useState(null);

    const fetchLessonTopics = useCallback(async (isRefresh = false) => {
        const storedApiBase = await AsyncStorage.getItem("api_base_url");
        const user_id = userData?.id || "";

        if (!storedApiBase) {
            setError("API base URL not found. Please set api_base_url first.");
            setLessons([]);
            return;
        }

        const API_URL = `${storedApiBase}get-lms-content-type`;

        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

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

            // reset topics
            setExpandedTopic({});
            setTopicDetails({});
            setTopicLoading({});
        } catch (e) {
            setError(e?.message || "Something went wrong.");
            setLessons([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [contentTypeId, userData?.id]);

    const fetchTopicDetails = useCallback(
        async (topicId) => {
            const tid = String(topicId);

            // already loaded or already loading
            if (topicLoading[tid] || topicDetails[tid]) return;

            const storedApiBase = await AsyncStorage.getItem("api_base_url");
            const user_id = userData?.id || "";

            if (!storedApiBase) {
                setTopicDetails((s) => ({ ...s, [tid]: { __error: "API base URL not found." } }));
                return;
            }

            const API_URL = `${storedApiBase}get-lms-content-type`;

            try {
                setTopicLoading((s) => ({ ...s, [tid]: true }));

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
        [contentTypeId, topicDetails, topicLoading, userData?.id]
    );

    useEffect(() => {
        fetchLessonTopics(false);
    }, [fetchLessonTopics]);

    const onRefresh = useCallback(() => {
        fetchLessonTopics(true);
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
            if (nextOpen && !topicDetails[tid]) fetchTopicDetails(tid);
            return { ...s, [tid]: nextOpen };
        });
    };

    const openFile = useCallback(async (file) => {
        try {
            const fileId = String(file?.id || "");
            setOpeningFileId(fileId);

            const url = `${file.file_path}`;
            const name = safeFileName(file.original_name || file.file_name || "file");
            const localPath = `${RNFS.CachesDirectoryPath}/${name}`;

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
            <BackHeader
                title="LMS Content"
                onBackIconPress={() => NavigationService.navigate("LMS")}
            />

            {/* Top header area (like previous page) */}
            <View style={styles.headerArea}>
                <Text style={styles.screenTitle}>Lessons & Topics</Text>
                <Text style={styles.screenHint}>
                    Expand a lesson to view topics, then open a topic to read details and attachments.
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
                    <Pressable onPress={() => fetchLessonTopics(false)} style={styles.retryBtn}>
                        <Ionicons name="refresh-outline" size={18} color="#fff" />
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : normalizedLessons.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="folder-open-outline" size={34} color="#94A3B8" />
                    <Text style={[styles.subtle, { marginTop: 10 }]}>No lessons found.</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {normalizedLessons.map((lesson, idx) => {
                        const lid = String(lesson.id);
                        const isLessonCollapsed = !!collapsedLesson[lid];
                        const lessonTheme = pickTheme(lesson?.id ?? idx);
                        const topicsCount = Array.isArray(lesson?.topics) ? lesson.topics.length : 0;

                        return (
                            <View key={lid} style={styles.lessonCard}>
                                {/* Lesson header (collapsible) */}
                                <Pressable
                                    onPress={() => toggleLesson(lid)}
                                    android_ripple={{ color: "#E2E8F0" }}
                                    style={({ pressed }) => [
                                        styles.lessonHeader,
                                        pressed && Platform.OS === "ios" ? styles.pressed : null,
                                    ]}
                                >
                                    <View style={styles.lessonHeaderLeft}>
                                        <View style={[styles.leftIcon, { backgroundColor: lessonTheme.bg }]}>
                                            <Ionicons name={lessonTheme.icon} size={22} color={lessonTheme.fg} />
                                            <View style={[styles.iconDot, { backgroundColor: lessonTheme.fg }]} />
                                        </View>

                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.lessonTitle} numberOfLines={2}>
                                                {lesson.name || "Lesson"}
                                            </Text>

                                            <View style={styles.metaRow}>
                                                <View style={styles.badge}>
                                                    <Ionicons name="list-outline" size={14} color="#475569" />
                                                    <Text style={styles.badgeText}>{topicsCount} topics</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <Ionicons
                                        name={isLessonCollapsed ? "chevron-down" : "chevron-up"}
                                        size={20}
                                        color="#64748B"
                                    />
                                </Pressable>

                                {!isLessonCollapsed ? (
                                    topicsCount ? (
                                        <View style={{ marginTop: 12 }}>
                                            {lesson.topics.map((topic, tIndex) => {
                                                const tid = String(topic.id);
                                                const isOpen = !!expandedTopic[tid];
                                                const isTLoading = !!topicLoading[tid];
                                                const details = topicDetails[tid];
                                                const topicTheme = pickTheme(topic?.id ?? tIndex);

                                                return (
                                                    <View key={tid} style={styles.topicWrap}>
                                                        {/* Topic header (collapsible) */}
                                                        <Pressable
                                                            onPress={() => toggleTopic(tid)}
                                                            android_ripple={{ color: "#E2E8F0" }}
                                                            style={({ pressed }) => [
                                                                styles.topicRow,
                                                                pressed && Platform.OS === "ios" ? styles.pressed : null,
                                                            ]}
                                                        >
                                                            <View style={styles.topicLeft}>
                                                                <View style={[styles.leftIconSmall, { backgroundColor: topicTheme.bg }]}>
                                                                    <Ionicons name="book-outline" size={18} color={topicTheme.fg} />
                                                                    <View style={[styles.iconDotSmall, { backgroundColor: topicTheme.fg }]} />
                                                                </View>

                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={styles.topicName} numberOfLines={2}>
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
                                                                    <View style={styles.detailsLoading}>
                                                                        <ActivityIndicator size="small" />
                                                                        <Text style={styles.subtle}>Loading details…</Text>
                                                                    </View>
                                                                ) : details?.__error ? (
                                                                    <Text style={styles.error}>{details.__error}</Text>
                                                                ) : (
                                                                    <>
                                                                        {/* Description */}
                                                                        {details?.description ? (
                                                                            <View style={styles.sectionBlock}>
                                                                                <View style={styles.sectionTitleRow}>
                                                                                    <Ionicons name="reader-outline" size={16} color="#475569" />
                                                                                    <Text style={styles.sectionTitle}>Description</Text>
                                                                                </View>

                                                                                <RenderHTML
                                                                                    contentWidth={Math.max(280, width - 32 - 24)} // screen padding + card padding
                                                                                    source={{ html: sanitizeHtml(details?.description || "") }}
                                                                                    baseStyle={styles.htmlBase}
                                                                                />
                                                                            </View>
                                                                        ) : null}

                                                                        {/* Attachments */}
                                                                        <View style={[styles.sectionBlock, { marginTop: 12 }]}>
                                                                            <View style={styles.sectionTitleRow}>
                                                                                <Ionicons name="attach-outline" size={16} color="#475569" />
                                                                                <Text style={styles.sectionTitle}>Attachments</Text>
                                                                            </View>

                                                                            {Array.isArray(details?.topicContent) && details.topicContent.length ? (
                                                                                details.topicContent.map((f) => {
                                                                                    const fileId = String(f.id);
                                                                                    const isOpening = openingFileId === fileId;
                                                                                    const ft = fileTheme(f);

                                                                                    return (
                                                                                        <Pressable
                                                                                            key={fileId}
                                                                                            onPress={() => openFile(f)}
                                                                                            android_ripple={{ color: "#E2E8F0" }}
                                                                                            style={({ pressed }) => [
                                                                                                styles.fileCard,
                                                                                                pressed && Platform.OS === "ios" ? styles.pressed : null,
                                                                                            ]}
                                                                                        >
                                                                                            <View style={[styles.fileIcon, { backgroundColor: ft.bg }]}>
                                                                                                <Ionicons name={ft.icon} size={20} color={ft.fg} />
                                                                                            </View>

                                                                                            <View style={{ flex: 1 }}>
                                                                                                <Text style={styles.fileName} numberOfLines={2}>
                                                                                                    {f.original_name || f.file_name || "File"}
                                                                                                </Text>
                                                                                                <Text style={styles.fileMeta} numberOfLines={1}>
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
                                                                        </View>
                                                                    </>
                                                                )}
                                                            </View>
                                                        ) : null}
                                                    </View>
                                                );
                                            })}
                                        </View>
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
    container: { flex: 1, backgroundColor: "#F1F5F9" },

    headerArea: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
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

    scrollContent: { padding: 16, paddingBottom: 28 },

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

    pressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.96,
    },

    lessonCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 12,
        ...Platform.select({
            android: { elevation: 2 },
            ios: {
                shadowColor: "#0F172A",
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
            },
        }),
    },

    lessonHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    lessonHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        paddingRight: 10,
    },

    leftIcon: {
        width: 46,
        height: 46,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    iconDot: {
        width: 8,
        height: 8,
        borderRadius: 99,
        position: "absolute",
        right: 7,
        bottom: 7,
        opacity: 0.9,
    },

    lessonTitle: {
        fontSize: 15,
        fontWeight: "900",
        color: "#0F172A",
        letterSpacing: 0.15,
    },

    metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: { color: "#475569", fontSize: 12, fontWeight: "800" },

    topicWrap: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        overflow: "hidden",
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
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

    leftIconSmall: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    iconDotSmall: {
        width: 7,
        height: 7,
        borderRadius: 99,
        position: "absolute",
        right: 6,
        bottom: 6,
        opacity: 0.9,
    },

    topicName: {
        fontWeight: "900",
        color: "#0F172A",
        fontSize: 14,
        letterSpacing: 0.1,
    },

    posted: {
        marginTop: 3,
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
    },

    topicDetails: {
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#F8FAFC",
    },

    detailsLoading: { paddingVertical: 10, alignItems: "center" },

    sectionBlock: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        padding: 12,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "900",
        color: "#0F172A",
        letterSpacing: 0.1,
    },

    htmlBase: { color: "#0F172A", lineHeight: 20, fontSize: 14 },

    fileCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        padding: 12,
        marginTop: 10,
        backgroundColor: "#FFFFFF",
    },

    fileIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    fileName: { color: "#0F172A", fontWeight: "900", letterSpacing: 0.1 },
    fileMeta: { color: "#64748B", marginTop: 2, fontSize: 12, fontWeight: "600" },
});