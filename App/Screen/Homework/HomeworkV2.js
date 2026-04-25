import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    LayoutAnimation,
    Platform,
    UIManager,
    Alert,
    Linking,
    Modal,
    Pressable,
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';

import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {
    maxWidth,
    moderateScale,
    screenHeight,
} from '../../Constants/PixelRatio';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Change this path if your homework file path is different
const DOCUMENT_BASE_PATH = 'uploads/homework/';

const HomeworkV2 = () => {
    const { colors } = useTheme();
    const { userData } = useSelector(state => state.User);

    const [homeworks, setHomeworks] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    const formattedApiDate = useMemo(() => {
        return selectedDate.toISOString().split('T')[0];
    }, [selectedDate]);

    const displayDate = date => {
        if (!date) return '';

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const fetchHomework = async (dateValue = formattedApiDate) => {
        const storedApiBase = await AsyncStorage.getItem('api_base_url');
        const API_URL = `${storedApiBase}homeworkv2`;

        try {
            setError(null);

            if (!storedApiBase) {
                setError('API base URL not found');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const classId = userData?.class_id;

            if (!classId) {
                setError('Class ID not found');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const formData = new FormData();
            formData.append('class_id', String(classId));
            formData.append('date', dateValue);

            const res = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-API-KEY': '123123',
                },
            });

            if (res.data?.status && Array.isArray(res.data.data)) {
                setHomeworks(res.data.data);

                if (res.data.data.length > 0) {
                    setExpandedId(res.data.data[0]?.id);
                } else {
                    setExpandedId(null);
                }
            } else {
                setHomeworks([]);
                setExpandedId(null);
                setError(res.data?.message || 'Failed to load homework');
            }
        } catch (e) {
            console.log('Fetch homework error:', e?.message, e?.response?.data);
            setError('Failed to load homework');
            setHomeworks([]);
            setExpandedId(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHomework(formattedApiDate);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHomework(formattedApiDate);
    }, [formattedApiDate]);

    const onSelectCalendarDate = day => {
        const pickedDate = new Date(day.dateString);

        setCalendarOpen(false);
        setSelectedDate(pickedDate);
        setLoading(true);

        fetchHomework(day.dateString);
    };

    const toggleExpand = id => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(prev => (prev === id ? null : id));
    };

    const stripHtml = html => {
        if (!html) return '';

        return html
            .replace(/<h1[^>]*>/gi, '')
            .replace(/<\/h1>/gi, '\n')
            .replace(/<h2[^>]*>/gi, '')
            .replace(/<\/h2>/gi, '\n')
            .replace(/<h3[^>]*>/gi, '')
            .replace(/<\/h3>/gi, '\n')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<\/p>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<strong[^>]*>/gi, '')
            .replace(/<\/strong>/gi, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/<[^>]+>/g, '')
            .replace(/\r/g, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    };

    const formatPostedDate = dateString => {
        if (!dateString) return displayDate(selectedDate);

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;

        return displayDate(date);
    };

    const getSubjectName = (item, index) => {
        return (
            item?.subject_name ||
            item?.subject ||
            item?.subject_title ||
            item?.name ||
            `Topic ${index + 1}`
        );
    };

    const getFileName = file => {
        if (!file) return '';

        const arr = file.split('!');
        return arr.length > 1 ? arr[1] : file;
    };

    const getFileExtension = file => {
        const fileName = getFileName(file);
        const ext = fileName.split('.').pop();
        return ext ? ext.toUpperCase() : 'FILE';
    };

    const isImageFile = file => {
        const clean = getFileName(file).toLowerCase();
        return /\.(png|jpe?g|gif|webp|bmp)$/i.test(clean);
    };

    const getFileUrl = async file => {
        const storedApiBase = await AsyncStorage.getItem('api_base_url');

        if (!storedApiBase) {
            return '';
        }

        const rootUrl = storedApiBase.replace('/api/apicontroller/', '/');
        return `${rootUrl}${DOCUMENT_BASE_PATH}${file}`;
    };

    const openAttachment = async file => {
        try {
            if (!file) return;

            const fileUrl = await getFileUrl(file);

            if (!fileUrl) {
                Alert.alert('Error', 'File URL not found');
                return;
            }

            if (isImageFile(file)) {
                setSelectedImageUrl(fileUrl);
                setImageModalVisible(true);
                return;
            }

            Linking.openURL(fileUrl).catch(() => {
                Alert.alert('Error', 'Unable to open attachment');
            });
        } catch (e) {
            Alert.alert('Error', 'Unable to open attachment');
        }
    };

    const renderHomeworkCard = ({ item, index }) => {
        const isExpanded = expandedId === item.id;
        const description = stripHtml(item.description);
        const fileName = getFileName(item.document);

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => toggleExpand(item.id)}
                    style={styles.cardHeader}
                >
                    <View style={styles.topicIconBox}>
                        <Icon name="menu-book" size={18} color="#1D4ED8" />
                    </View>

                    <View style={styles.topicInfo}>
                        <Text numberOfLines={1} style={styles.topicTitle}>
                            {getSubjectName(item, index)}
                        </Text>

                        <Text style={styles.postedDate}>
                            Posted {formatPostedDate(item.homework_date)}
                        </Text>
                    </View>

                    <View style={styles.expandBtn}>
                        <Icon
                            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                            size={24}
                            color="#475569"
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded ? (
                    <View style={styles.cardBody}>
                        <Text style={styles.homeworkTitle}>{item.title || 'Homework'}</Text>

                        {description ? (
                            <Text style={styles.descriptionText}>{description}</Text>
                        ) : (
                            <Text style={styles.descriptionText}>
                                No description available.
                            </Text>
                        )}

                        {item.document ? (
                            <View style={styles.attachmentWrap}>
                                <View style={styles.attachmentHead}>
                                    <Icon name="attach-file" size={17} color="#64748B" />
                                    <Text style={styles.attachmentHeading}>Attachments</Text>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => openAttachment(item.document)}
                                    style={styles.attachmentCard}
                                >
                                    <View style={styles.fileIconBox}>
                                        <Icon
                                            name={isImageFile(item.document) ? 'image' : 'description'}
                                            size={20}
                                            color="#0284C7"
                                        />
                                    </View>

                                    <View style={styles.fileTextBox}>
                                        <Text numberOfLines={1} style={styles.fileName}>
                                            {fileName}
                                        </Text>
                                        <Text style={styles.fileMeta}>
                                            {getFileExtension(item.document)} Attachment
                                        </Text>
                                    </View>

                                    <Icon name="chevron-right" size={22} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                ) : null}
            </View>
        );
    };

    const ListHeader = () => {
        return (
            <View>
                <View style={{ ...styles.mainTop, backgroundColor: colors.background }}>
                    <View style={styles.oldTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...styles.homeworkText, color: colors.text }}>
                                Your Homework is here!
                            </Text>
                        </View>

                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Image
                                source={Images.homeworkColor}
                                style={{
                                    height: moderateScale(60),
                                    width: moderateScale(80),
                                    backgroundColor: colors.background,
                                    resizeMode: 'contain',
                                }}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setCalendarOpen(true)}
                    style={styles.dateField}
                >
                    <View style={styles.dateLeft}>
                        <View style={styles.calendarIconBox}>
                            <Icon name="event" size={22} color="#EA580C" />
                        </View>

                        <View>
                            <Text style={styles.dateLabel}>Selected Date</Text>
                            <Text style={styles.dateValue}>{displayDate(selectedDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.changeDateBox}>
                        <Text style={styles.changeDateText}>Change</Text>
                        <Icon name="keyboard-arrow-down" size={20} color="#EA580C" />
                    </View>
                </TouchableOpacity>

                <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Homework List</Text>
                    <Text style={styles.sectionCount}>{homeworks.length} found</Text>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary || '#22C55E'} />
                <Text style={[styles.centerText, { color: colors.text }]}>
                    Loading homework...
                </Text>
            </View>
        );
    }

    if (error && homeworks.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <BackHeader
                    title="Homework"
                    onBackIconPress={() => {
                        NavigationService.navigate('Home');
                    }}
                />

                <View style={[styles.main, { backgroundColor: colors.background }]}>
                    <FlatList
                        data={[]}
                        renderItem={null}
                        ListHeaderComponent={<ListHeader />}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <View style={styles.emptyIconBox}>
                                    <Icon name="error-outline" size={34} color="#EF4444" />
                                </View>

                                <Text style={styles.emptyTitle}>Something went wrong</Text>
                                <Text style={styles.emptyDesc}>{error}</Text>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setLoading(true);
                                        fetchHomework(formattedApiDate);
                                    }}
                                    style={styles.retryBtn}
                                >
                                    <Text style={styles.retryText}>Try again</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <CalendarPickerModal
                    visible={calendarOpen}
                    selectedDate={formattedApiDate}
                    onClose={() => setCalendarOpen(false)}
                    onSelectDate={onSelectCalendarDate}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <BackHeader
                title="Homework"
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />

            <View style={[styles.main, { backgroundColor: colors.background }]}>
                <FlatList
                    data={homeworks}
                    keyExtractor={(item, index) => item.id?.toString() || String(index)}
                    renderItem={renderHomeworkCard}
                    ListHeaderComponent={<ListHeader />}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={[
                        styles.listContent,
                        homeworks.length === 0 && styles.emptyListContent,
                    ]}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyBox}>
                                <View style={styles.emptyIconBox}>
                                    <Icon name="assignment" size={34} color="#94A3B8" />
                                </View>

                                <Text style={styles.emptyTitle}>No Homework Found</Text>
                                <Text style={styles.emptyDesc}>
                                    There is no homework available for selected date.
                                </Text>
                            </View>
                        ) : null
                    }
                />
            </View>

            <CalendarPickerModal
                visible={calendarOpen}
                selectedDate={formattedApiDate}
                onClose={() => setCalendarOpen(false)}
                onSelectDate={onSelectCalendarDate}
            />

            <Modal
                visible={imageModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.imageModalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Attachment Preview</Text>

                            <Pressable
                                onPress={() => setImageModalVisible(false)}
                                style={styles.closeBtn}
                            >
                                <Icon name="close" size={22} color="#111827" />
                            </Pressable>
                        </View>

                        <Image
                            source={{ uri: selectedImageUrl }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => {
                                setImageModalVisible(false);
                                Linking.openURL(selectedImageUrl).catch(() => {
                                    Alert.alert('Error', 'Unable to open image');
                                });
                            }}
                            style={styles.openFullBtn}
                        >
                            <Icon name="open-in-new" size={18} color="#FFFFFF" />
                            <Text style={styles.openFullText}>Open Full Image</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const CalendarPickerModal = ({
    visible,
    selectedDate,
    onClose,
    onSelectDate,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.calendarOverlay}>
                <View style={styles.calendarModalBox}>
                    <View style={styles.calendarHeader}>
                        <View>
                            <Text style={styles.calendarTitle}>Select Homework Date</Text>
                            <Text style={styles.calendarSubTitle}>
                                Choose a date to view homework
                            </Text>
                        </View>

                        <Pressable onPress={onClose} style={styles.calendarCloseBtn}>
                            <Icon name="close" size={22} color="#111827" />
                        </Pressable>
                    </View>

                    <Calendar
                        current={selectedDate}
                        onDayPress={onSelectDate}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: '#EA580C',
                                selectedTextColor: '#FFFFFF',
                            },
                        }}
                        enableSwipeMonths
                        theme={{
                            backgroundColor: '#FFFFFF',
                            calendarBackground: '#FFFFFF',
                            textSectionTitleColor: '#64748B',
                            selectedDayBackgroundColor: '#EA580C',
                            selectedDayTextColor: '#FFFFFF',
                            todayTextColor: '#EA580C',
                            dayTextColor: '#111827',
                            textDisabledColor: '#CBD5E1',
                            arrowColor: '#EA580C',
                            monthTextColor: '#111827',
                            indicatorColor: '#EA580C',
                            textMonthFontWeight: '900',
                            textDayFontWeight: '700',
                            textDayHeaderFontWeight: '800',
                            textMonthFontSize: 17,
                            textDayFontSize: 14,
                            textDayHeaderFontSize: 12,
                        }}
                    />

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={onClose}
                        style={styles.calendarCancelBtn}
                    >
                        <Text style={styles.calendarCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default HomeworkV2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white2,
    },

    main: {
        flex: 1,
        backgroundColor: Colors.white2,
        width: '99%',
        alignSelf: 'center',
        maxWidth: maxWidth,
        minHeight: screenHeight,
    },

    mainTop: {
        backgroundColor: Colors.white2,
        width: '100%',
        alignSelf: 'center',
    },

    oldTopRow: {
        flexDirection: 'row',
        marginTop: moderateScale(15),
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
    },

    homeworkText: {
        fontSize: moderateScale(17),
        fontWeight: '600',
        color: Colors.black,
    },

    dateField: {
        width: '92%',
        alignSelf: 'center',
        marginTop: moderateScale(18),
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(18),
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#FED7AA',
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 3,
    },

    dateLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    calendarIconBox: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(15),
        backgroundColor: '#FFF7ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(11),
    },

    dateLabel: {
        fontSize: moderateScale(11),
        color: '#64748B',
        fontWeight: '700',
    },

    dateValue: {
        marginTop: moderateScale(3),
        fontSize: moderateScale(15),
        color: '#111827',
        fontWeight: '900',
    },

    changeDateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        borderRadius: moderateScale(999),
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(7),
    },

    changeDateText: {
        fontSize: moderateScale(11),
        color: '#EA580C',
        fontWeight: '900',
    },

    sectionTitleRow: {
        width: '92%',
        alignSelf: 'center',
        marginTop: moderateScale(18),
        marginBottom: moderateScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        fontSize: moderateScale(16),
        color: '#0F172A',
        fontWeight: '900',
    },

    sectionCount: {
        fontSize: moderateScale(11),
        color: '#64748B',
        fontWeight: '700',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(5),
        borderRadius: moderateScale(999),
    },

    listContent: {
        paddingBottom: moderateScale(120),
    },

    card: {
        width: '92%',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(18),
        marginBottom: moderateScale(14),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(13),
    },

    topicIconBox: {
        height: moderateScale(36),
        width: moderateScale(36),
        borderRadius: moderateScale(12),
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    topicInfo: {
        flex: 1,
        marginLeft: moderateScale(10),
    },

    topicTitle: {
        fontSize: moderateScale(13.5),
        color: '#0F172A',
        fontWeight: '900',
    },

    postedDate: {
        marginTop: moderateScale(3),
        fontSize: moderateScale(10.5),
        color: '#64748B',
        fontWeight: '500',
    },

    expandBtn: {
        width: moderateScale(31),
        height: moderateScale(31),
        borderRadius: moderateScale(15.5),
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingHorizontal: moderateScale(15),
        paddingTop: moderateScale(14),
        paddingBottom: moderateScale(15),
    },

    homeworkTitle: {
        fontSize: moderateScale(15),
        color: '#111827',
        fontWeight: '900',
        lineHeight: moderateScale(21),
    },

    descriptionText: {
        marginTop: moderateScale(9),
        fontSize: moderateScale(12),
        color: '#475569',
        lineHeight: moderateScale(19),
        fontWeight: '500',
    },

    attachmentWrap: {
        marginTop: moderateScale(16),
    },

    attachmentHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: moderateScale(9),
    },

    attachmentHeading: {
        marginLeft: moderateScale(4),
        fontSize: moderateScale(12.5),
        color: '#334155',
        fontWeight: '900',
    },

    attachmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: moderateScale(15),
        paddingHorizontal: moderateScale(11),
        paddingVertical: moderateScale(11),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    fileIconBox: {
        width: moderateScale(37),
        height: moderateScale(37),
        borderRadius: moderateScale(12),
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },

    fileTextBox: {
        flex: 1,
        marginLeft: moderateScale(10),
    },

    fileName: {
        fontSize: moderateScale(12),
        color: '#0F172A',
        fontWeight: '800',
    },

    fileMeta: {
        marginTop: moderateScale(2),
        fontSize: moderateScale(10.5),
        color: '#64748B',
        fontWeight: '500',
    },

    center: {
        flex: 1,
        backgroundColor: Colors.white2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(24),
    },

    centerText: {
        marginTop: moderateScale(8),
        fontSize: moderateScale(13),
        fontWeight: '600',
    },

    emptyListContent: {
        flexGrow: 1,
    },

    emptyBox: {
        width: '92%',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(20),
        alignItems: 'center',
        paddingVertical: moderateScale(35),
        paddingHorizontal: moderateScale(20),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: moderateScale(15),
    },

    emptyIconBox: {
        width: moderateScale(66),
        height: moderateScale(66),
        borderRadius: moderateScale(33),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        marginTop: moderateScale(14),
        fontSize: moderateScale(16),
        color: '#0F172A',
        fontWeight: '900',
    },

    emptyDesc: {
        marginTop: moderateScale(6),
        fontSize: moderateScale(12),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: moderateScale(18),
    },

    retryBtn: {
        marginTop: moderateScale(14),
        paddingHorizontal: moderateScale(18),
        paddingVertical: moderateScale(9),
        borderRadius: moderateScale(999),
        backgroundColor: '#22C55E',
    },

    retryText: {
        color: '#000',
        fontSize: moderateScale(12),
        fontWeight: '800',
    },

    calendarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(18),
    },

    calendarModalBox: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(24),
        overflow: 'hidden',
        paddingBottom: moderateScale(14),
    },

    calendarHeader: {
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(15),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    calendarTitle: {
        fontSize: moderateScale(16),
        color: '#111827',
        fontWeight: '900',
    },

    calendarSubTitle: {
        marginTop: moderateScale(3),
        fontSize: moderateScale(11.5),
        color: '#64748B',
        fontWeight: '600',
    },

    calendarCloseBtn: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    calendarCancelBtn: {
        width: '90%',
        alignSelf: 'center',
        marginTop: moderateScale(8),
        height: moderateScale(45),
        borderRadius: moderateScale(14),
        backgroundColor: '#FFF7ED',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FED7AA',
    },

    calendarCancelText: {
        fontSize: moderateScale(13),
        color: '#EA580C',
        fontWeight: '900',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(18),
    },

    imageModalBox: {
        width: '100%',
        maxHeight: '82%',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(22),
        overflow: 'hidden',
    },

    modalHeader: {
        paddingHorizontal: moderateScale(15),
        paddingVertical: moderateScale(13),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    modalTitle: {
        fontSize: moderateScale(15),
        color: '#111827',
        fontWeight: '900',
    },

    closeBtn: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(17),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    previewImage: {
        width: '100%',
        height: moderateScale(380),
        backgroundColor: '#F8FAFC',
    },

    openFullBtn: {
        margin: moderateScale(14),
        height: moderateScale(46),
        borderRadius: moderateScale(14),
        backgroundColor: '#16A34A',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    openFullText: {
        marginLeft: moderateScale(7),
        fontSize: moderateScale(13),
        color: '#FFFFFF',
        fontWeight: '900',
    },
});