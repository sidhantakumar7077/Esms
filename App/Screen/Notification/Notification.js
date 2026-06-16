import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BackHeader from '../../Components/BackHeader';
import TitleHeader from '../../Components/TitleHeader';
import NavigationService from '../../Services/Navigation';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import { moderateScale, screenHeight, maxWidth } from '../../Constants/PixelRatio';

const NOTIFICATION_ICON = 'notifications-active';
const FILTERS = ['All', 'Unread'];
const API_KEY = '123123';

const buildApiUrl = (baseUrl, endpoint) => {
    const cleanBase = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const cleanEndpoint = endpoint?.startsWith('/') ? endpoint.substring(1) : endpoint;

    return `${cleanBase}${cleanEndpoint}`;
};

const getNotificationId = (item, index = 0) => {
    return (
        item?.id ||
        item?.notification_id ||
        item?.notice_id ||
        item?.app_notification_id ||
        item?.uid ||
        `${item?.title || item?.notification_title || 'notification'}-${index}`
    );
};

const getMarkableNotificationId = item => {
    const id =
        item?.notification_id ||
        item?.id ||
        item?.notice_id ||
        item?.app_notification_id ||
        item?.uid;

    if (id === null || id === undefined || String(id).trim() === '') {
        return null;
    }

    return String(id).trim();
};

const getUniqueIds = ids => {
    return Array.from(
        new Set(
            ids
                .map(id => String(id || '').trim())
                .filter(id => id && id !== '0'),
        ),
    );
};

const formatNotificationTime = value => {
    if (!value) {
        return '';
    }

    if (
        typeof value === 'string' &&
        (
            value.toLowerCase().includes('ago') ||
            value.toLowerCase().includes('today') ||
            value.toLowerCase().includes('yesterday')
        )
    ) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
        return 'Just now';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    return date.toLocaleDateString();
};

const normalizeNotification = (item, index, unreadIds = [], forceUnread = false) => {
    const id = getNotificationId(item, index);

    const isUnreadByStatus =
        item?.is_read === 0 ||
        item?.is_read === '0' ||
        item?.read_status === 0 ||
        item?.read_status === '0' ||
        item?.status === 'unread' ||
        item?.status === 'Unread';

    const unread =
        forceUnread ||
        unreadIds.includes(String(id)) ||
        isUnreadByStatus;

    return {
        id,
        raw: item,
        title:
            item?.title ||
            item?.notification_title ||
            item?.heading ||
            item?.subject ||
            item?.name ||
            'Notification',
        message:
            item?.message ||
            item?.notification_message ||
            item?.notification ||
            item?.description ||
            item?.body ||
            item?.content ||
            item?.details ||
            'New notification received.',
        time: formatNotificationTime(
            item?.time_ago ||
            item?.time ||
            item?.created_at ||
            item?.notification_date ||
            item?.date ||
            item?.updated_at,
        ),
        unread,
    };
};

const mergeUniqueNotifications = (oldRows, newRows) => {
    const map = new Map();

    oldRows.forEach(item => {
        map.set(String(item.id), item);
    });

    newRows.forEach(item => {
        map.set(String(item.id), item);
    });

    return Array.from(map.values());
};

const postNotificationApi = async ({
    apiUrl,
    userId,
    page = 1,
    notificationId = '0',
}) => {
    const form = new FormData();

    form.append('user_id', String(userId || ''));
    form.append('page', String(page || 1));

    /**
     * IMPORTANT:
     * notification_id = 0 means only fetch notification list.
     * notification_id = 9146,9089 means mark those notifications as seen.
     */
    form.append('notification_id', String(notificationId || '0'));

    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY,
        },
        body: form,
    });

    const json = await res.json();

    if (!json?.status) {
        throw new Error(json?.message || 'Failed to load notifications.');
    }

    return json;
};

const Notification = () => {
    const { colors } = useTheme();
    const { userData } = useSelector(state => state.User);

    const markingSeenIdsRef = useRef(new Set());

    const [activeFilter, setActiveFilter] = useState('All');

    const [allRows, setAllRows] = useState([]);
    const [unreadRows, setUnreadRows] = useState([]);

    const [allCount, setAllCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const primaryColor = '#178D45';
    const lightGreenColor = colors.lightGreen || '#E8F8EE';
    const cardBorderColor = colors.lightBlck || colors.border || '#E3E8E5';
    const cardBackground = colors.background || colors.card || Colors.white2;

    const filteredNotifications = useMemo(() => {
        return activeFilter === 'Unread' ? unreadRows : allRows;
    }, [activeFilter, allRows, unreadRows]);

    const selectedTotalCount = activeFilter === 'Unread' ? unreadCount : allCount;

    const canLoadMore = filteredNotifications.length < selectedTotalCount;

    const markNotificationsSeen = useCallback(
        async ({
            apiUrl,
            userId,
            targetPage = 1,
            ids = [],
        }) => {
            const uniqueIds = getUniqueIds(ids);

            const idsToSend = uniqueIds.filter(id => !markingSeenIdsRef.current.has(id));

            if (idsToSend.length === 0) {
                return;
            }

            idsToSend.forEach(id => {
                markingSeenIdsRef.current.add(id);
            });

            try {
                const markSeenJson = await postNotificationApi({
                    apiUrl,
                    userId,
                    page: targetPage,
                    notificationId: idsToSend.join(','),
                });

                const markedIdSet = new Set(idsToSend.map(String));

                setAllRows(prev =>
                    prev.map(row =>
                        markedIdSet.has(String(row.id))
                            ? {
                                ...row,
                                unread: false,
                            }
                            : row,
                    ),
                );

                setUnreadRows(prev =>
                    prev.filter(row => !markedIdSet.has(String(row.id))),
                );

                if (markSeenJson?.all_notifications_count !== undefined) {
                    setAllCount(Number(markSeenJson.all_notifications_count || 0));
                }

                if (markSeenJson?.unread_notifications_count !== undefined) {
                    setUnreadCount(Number(markSeenJson.unread_notifications_count || 0));
                } else {
                    setUnreadCount(prev => Math.max(prev - idsToSend.length, 0));
                }
            } catch (e) {
                idsToSend.forEach(id => {
                    markingSeenIdsRef.current.delete(id);
                });

                console.log('Mark notification seen failed:', e?.message || e);
            }
        },
        [],
    );

    const fetchNotifications = useCallback(
        async (targetPage = 1, isRefresh = false) => {
            const storedApiBase = await AsyncStorage.getItem('api_base_url');
            const storedUserId = await AsyncStorage.getItem('user_id');

            const user_id = userData?.id || storedUserId || '';

            if (!storedApiBase) {
                setError('API base URL not found. Please set api_base_url first.');
                setAllRows([]);
                setUnreadRows([]);
                return;
            }

            const API_URL = buildApiUrl(
                storedApiBase,
                'app-notification',
            );

            try {
                if (targetPage === 1 && !isRefresh) {
                    setLoading(true);
                }

                if (targetPage > 1) {
                    setLoadingMore(true);
                }

                setError('');

                /**
                 * First API call:
                 * Send notification_id = 0 because we only want to fetch the list.
                 */
                const json = await postNotificationApi({
                    apiUrl: API_URL,
                    userId: user_id,
                    page: targetPage,
                    notificationId: '0',
                });

                const allNotifications = Array.isArray(json?.all_notifications)
                    ? json.all_notifications
                    : [];

                const unreadNotifications = Array.isArray(json?.unread_notifications_list)
                    ? json.unread_notifications_list
                    : [];

                const unreadIds = unreadNotifications
                    .map(item => getMarkableNotificationId(item))
                    .filter(Boolean);

                const normalizedAll = allNotifications.map((item, index) =>
                    normalizeNotification(item, index, unreadIds, false),
                );

                const normalizedUnread = unreadNotifications.map((item, index) =>
                    normalizeNotification(item, index, unreadIds, true),
                );

                setAllCount(Number(json?.all_notifications_count || normalizedAll.length || 0));
                setUnreadCount(Number(json?.unread_notifications_count || normalizedUnread.length || 0));

                if (targetPage === 1) {
                    setAllRows(normalizedAll);
                    setUnreadRows(normalizedUnread);
                } else {
                    setAllRows(prev => mergeUniqueNotifications(prev, normalizedAll));
                    setUnreadRows(prev => mergeUniqueNotifications(prev, normalizedUnread));
                }

                setPage(targetPage);

                /**
                 * Find all unseen notification IDs from current response.
                 * If unread IDs exist, call same API again in background
                 * using notification_id = 9146,9089.
                 */
                const unreadIdsFromAll = normalizedAll
                    .filter(item => item.unread)
                    .map(item => getMarkableNotificationId(item.raw))
                    .filter(Boolean);

                const unreadIdsFromUnreadList = normalizedUnread
                    .map(item => getMarkableNotificationId(item.raw))
                    .filter(Boolean);

                const idsToMarkSeen = getUniqueIds([
                    ...unreadIdsFromAll,
                    ...unreadIdsFromUnreadList,
                ]);

                if (idsToMarkSeen.length > 0) {
                    markNotificationsSeen({
                        apiUrl: API_URL,
                        userId: user_id,
                        targetPage,
                        ids: idsToMarkSeen,
                    });
                }
            } catch (e) {
                setError(e?.message || 'Something went wrong.');

                if (targetPage === 1) {
                    setAllRows([]);
                    setUnreadRows([]);
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
                setRefreshing(false);
            }
        },
        [markNotificationsSeen, userData?.id],
    );

    useEffect(() => {
        fetchNotifications(1, false);
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications(1, true);
    };

    const onLoadMore = () => {
        if (!loading && !loadingMore && canLoadMore) {
            fetchNotifications(page + 1, false);
        }
    };

    const renderFilter = item => {
        const active = activeFilter === item;

        const count = item === 'Unread' ? unreadCount : allCount;

        return (
            <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => {
                    setActiveFilter(item);
                }}
                style={[
                    styles.filterChip,
                    {
                        backgroundColor: active ? lightGreenColor : cardBackground,
                        borderColor: active ? primaryColor : cardBorderColor,
                    },
                ]}>
                <Text
                    style={[
                        styles.filterText,
                        {
                            color: active ? primaryColor : colors.text,
                            opacity: active ? 1 : 0.7,
                        },
                    ]}>
                    {item} {count > 0 ? `(${count})` : ''}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderNotificationCard = ({ item, index }) => {
        return (
            <Pressable
                key={String(item.id || index)}
                android_ripple={{ color: '#E8F8EE' }}
                style={({ pressed }) => [
                    styles.notificationCard,
                    {
                        backgroundColor: cardBackground,
                        borderColor: item.unread ? primaryColor : cardBorderColor,
                        borderWidth: item.unread ? 0.8 : 0.5,
                    },
                    pressed && Platform.OS === 'ios' ? styles.cardPressed : null,
                ]}>
                <View style={styles.notificationCardInner}>
                    <View style={[styles.iconBox, { backgroundColor: lightGreenColor }]}>
                        <Icon
                            name={NOTIFICATION_ICON}
                            size={moderateScale(17)}
                            color={item.unread ? '#fb483a' : primaryColor}
                        />
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.cardTopRow}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.cardTitle,
                                    {
                                        color: colors.text,
                                    },
                                ]}>
                                {item.title}
                            </Text>

                            {item.unread && (
                                <View style={[styles.unreadDot, { backgroundColor: primaryColor }]} />
                            )}
                        </View>

                        <Text
                            numberOfLines={2}
                            style={[
                                styles.cardMessage,
                                {
                                    color: colors.text,
                                },
                            ]}>
                            {item.message}
                        </Text>

                        {!!item.time && (
                            <View style={styles.timeRow}>
                                <Icon
                                    name="access-time"
                                    size={moderateScale(13)}
                                    color={primaryColor}
                                />

                                <Text
                                    style={[
                                        styles.cardTime,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    {item.time}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderHeader = () => {
        return (
            <View style={styles.main}>
                <TitleHeader
                    title={'Your Notifications are here!'}
                    image={Images.Board || Images.homeworkColor}
                    imageStyle={{
                        height: moderateScale(65),
                        width: moderateScale(90),
                    }}
                />

                <View style={styles.filterSection}>
                    <FlatList
                        horizontal
                        data={FILTERS}
                        keyExtractor={item => item}
                        renderItem={({ item }) => renderFilter(item)}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterList}
                    />
                </View>

                <View style={styles.sectionRow}>
                    <View style={styles.sectionTitleBox}>
                        <Icon
                            name="notifications-none"
                            size={moderateScale(17)}
                            color={primaryColor}
                        />

                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: colors.text,
                                },
                            ]}>
                            Notifications
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.sectionCount,
                            {
                                color: primaryColor,
                                backgroundColor: lightGreenColor,
                            },
                        ]}>
                        {selectedTotalCount || filteredNotifications.length} found
                    </Text>
                </View>

                {error ? (
                    <View
                        style={[
                            styles.errorBox,
                            {
                                backgroundColor: cardBackground,
                                borderColor: cardBorderColor,
                            },
                        ]}>
                        <Icon
                            name="error-outline"
                            size={moderateScale(30)}
                            color="#EF4444"
                        />

                        <Text style={styles.errorText}>{error}</Text>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => fetchNotifications(1, false)}
                            style={[styles.retryBtn, { backgroundColor: primaryColor }]}>
                            <Icon
                                name="refresh"
                                size={moderateScale(16)}
                                color="#FFFFFF"
                            />
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        );
    };

    const renderEmptyComponent = () => {
        if (loading || error) {
            return null;
        }

        return (
            <View
                style={[
                    styles.emptyBox,
                    {
                        backgroundColor: cardBackground,
                        borderColor: cardBorderColor,
                    },
                ]}>
                <View style={[styles.emptyIconBox, { backgroundColor: lightGreenColor }]}>
                    <Icon
                        name="notifications-none"
                        size={moderateScale(32)}
                        color={primaryColor}
                    />
                </View>

                <Text
                    style={[
                        styles.emptyTitle,
                        {
                            color: colors.text,
                        },
                    ]}>
                    No notifications found
                </Text>

                <Text
                    style={[
                        styles.emptyText,
                        {
                            color: colors.text,
                        },
                    ]}>
                    No updates are available in this category.
                </Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) {
            return <View style={{ height: moderateScale(25) }} />;
        }

        return (
            <ActivityIndicator
                size="small"
                color={primaryColor}
                style={{ marginVertical: moderateScale(16) }}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <BackHeader
                title="Notification"
                onBackIconPress={() => {
                    NavigationService.back();
                }}
            />

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={primaryColor} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                        Loading notifications...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={error ? [] : filteredNotifications}
                    keyExtractor={(item, index) => String(item?.id || index)}
                    renderItem={renderNotificationCard}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmptyComponent}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={[
                        styles.listContent,
                        {
                            backgroundColor: colors.background,
                        },
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[primaryColor]}
                            tintColor={primaryColor}
                        />
                    }
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={0.4}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white2,
    },

    listContent: {
        paddingBottom: moderateScale(10),
    },

    main: {
        backgroundColor: Colors.white2,
        width: '92%',
        alignSelf: 'center',
        maxWidth: maxWidth,
    },

    filterSection: {
        marginTop: moderateScale(8),
    },

    filterList: {
        paddingVertical: moderateScale(3),
        columnGap: moderateScale(8),
    },

    filterChip: {
        height: moderateScale(32),
        paddingHorizontal: moderateScale(14),
        borderRadius: moderateScale(16),
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(8),
    },

    filterText: {
        fontSize: moderateScale(11),
        fontWeight: '500',
    },

    sectionRow: {
        marginTop: moderateScale(14),
        marginBottom: moderateScale(7),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitleBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: moderateScale(8),
    },

    sectionTitle: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        marginLeft: moderateScale(6),
    },

    sectionCount: {
        fontSize: moderateScale(10),
        fontWeight: '500',
        paddingHorizontal: moderateScale(9),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(16),
        overflow: 'hidden',
    },

    notificationCard: {
        elevation: 3,
        width: '92%',
        maxWidth: maxWidth,
        borderRadius: 20,
        alignSelf: 'center',
        overflow: 'hidden',
        marginBottom: moderateScale(9),
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
            },
        }),
    },

    cardPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.96,
    },

    notificationCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(9),
    },

    iconBox: {
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(13),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(10),
    },

    cardContent: {
        flex: 1,
    },

    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    cardTitle: {
        flex: 1,
        fontSize: moderateScale(13),
        fontWeight: '500',
        paddingRight: moderateScale(7),
    },

    unreadDot: {
        width: moderateScale(7),
        height: moderateScale(7),
        borderRadius: moderateScale(3.5),
    },

    cardMessage: {
        marginTop: moderateScale(3),
        fontSize: moderateScale(10.8),
        lineHeight: moderateScale(15),
        fontWeight: '400',
        opacity: 0.68,
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: moderateScale(5),
    },

    cardTime: {
        marginLeft: moderateScale(5),
        fontSize: moderateScale(10),
        fontWeight: '400',
        opacity: 0.62,
    },

    loadingBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: screenHeight * 0.12,
    },

    loadingText: {
        marginTop: moderateScale(10),
        fontSize: moderateScale(12),
        fontWeight: '500',
        opacity: 0.7,
    },

    emptyBox: {
        width: '92%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(30),
        paddingHorizontal: moderateScale(22),
        borderRadius: moderateScale(18),
        borderWidth: 0.5,
        marginTop: moderateScale(10),
    },

    emptyIconBox: {
        width: moderateScale(62),
        height: moderateScale(62),
        borderRadius: moderateScale(31),
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        marginTop: moderateScale(12),
        fontSize: moderateScale(15),
        fontWeight: '500',
    },

    emptyText: {
        marginTop: moderateScale(5),
        fontSize: moderateScale(11),
        lineHeight: moderateScale(16),
        textAlign: 'center',
        fontWeight: '400',
        opacity: 0.6,
    },

    errorBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(22),
        paddingHorizontal: moderateScale(18),
        borderRadius: moderateScale(18),
        borderWidth: 0.5,
        marginTop: moderateScale(10),
        marginBottom: moderateScale(12),
    },

    errorText: {
        marginTop: moderateScale(8),
        color: '#EF4444',
        textAlign: 'center',
        fontSize: moderateScale(11.5),
        lineHeight: moderateScale(17),
    },

    retryBtn: {
        marginTop: moderateScale(12),
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(8),
        borderRadius: moderateScale(18),
        flexDirection: 'row',
        alignItems: 'center',
    },

    retryText: {
        color: '#FFFFFF',
        fontSize: moderateScale(11),
        fontWeight: '600',
        marginLeft: moderateScale(5),
    },
});