import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors } from '../../Constants/Colors';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {
    maxWidth,
    moderateScale,
} from '../../Constants/PixelRatio';

const NOTIFICATION_ICON = 'notifications-active';

const NOTIFICATION_DATA = [
    {
        id: 1,
        title: 'English Homework Added',
        message: 'Class 4 English assignment has been posted for today.',
        time: '2 min ago',
        unread: true,
    },
    {
        id: 2,
        title: 'Attendance Updated',
        message: 'Today attendance has been marked successfully.',
        time: '20 min ago',
        unread: true,
    },
    {
        id: 3,
        title: 'School Notice Published',
        message: 'A new notice has been shared by the school admin.',
        time: '1 hour ago',
        unread: false,
    },
    {
        id: 4,
        title: 'Fee Payment Reminder',
        message: 'Your monthly fee payment is pending. Please pay before due date.',
        time: 'Today, 10:30 AM',
        unread: false,
    },
    {
        id: 5,
        title: 'Exam Schedule Updated',
        message: 'Your upcoming class test schedule has been updated.',
        time: 'Yesterday',
        unread: false,
    },
    {
        id: 6,
        title: 'Bus Timing Changed',
        message: 'School bus timing has been changed for tomorrow morning.',
        time: 'Yesterday',
        unread: false,
    },
];

const FILTERS = ['All', 'Unread'];

const Notification = () => {
    const { colors } = useTheme();

    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const unreadCount = NOTIFICATION_DATA.filter(item => item.unread).length;

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'Unread') {
            return NOTIFICATION_DATA.filter(item => item.unread);
        }

        return NOTIFICATION_DATA;
    }, [activeFilter]);

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 700);
    };

    const renderFilter = ({ item }) => {
        const isActive = activeFilter === item;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActiveFilter(item)}
                style={[
                    styles.filterChip,
                    isActive && styles.activeFilterChip,
                ]}
            >
                <Text
                    style={[
                        styles.filterText,
                        isActive && styles.activeFilterText,
                    ]}
                >
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderNotificationCard = ({ item }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.88}
                style={[
                    styles.notificationCard,
                    item.unread && styles.unreadCard,
                ]}
            >
                <View style={styles.iconBox}>
                    <Icon
                        name={NOTIFICATION_ICON}
                        size={moderateScale(17)}
                        color={Colors.tangerine}
                    />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Text numberOfLines={1} style={styles.cardTitle}>
                            {item.title}
                        </Text>

                        {item.unread ? <View style={styles.unreadDot} /> : null}
                    </View>

                    <Text numberOfLines={1} style={styles.cardMessage}>
                        {item.message}
                    </Text>

                    <Text style={styles.cardTime}>{item.time}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => {
        return (
            <View>
                <View style={styles.summaryBox}>
                    <View style={styles.summaryIconBox}>
                        <Icon
                            name="notifications"
                            size={moderateScale(20)}
                            color={Colors.tangerine}
                        />
                    </View>

                    <View style={styles.summaryTextBox}>
                        <Text style={styles.summaryTitle}>Latest Updates</Text>
                        <Text style={styles.summarySubTitle}>
                            {unreadCount} unread from {NOTIFICATION_DATA.length} notifications
                        </Text>
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={FILTERS}
                    keyExtractor={item => item}
                    renderItem={renderFilter}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                />

                <View style={styles.sectionRow}>
                    <Text style={styles.sectionTitle}>Notifications</Text>

                    <Text style={styles.sectionCount}>
                        {filteredNotifications.length} found
                    </Text>
                </View>
            </View>
        );
    };

    const EmptyComponent = () => {
        return (
            <View style={styles.emptyBox}>
                <View style={styles.emptyIconBox}>
                    <Icon
                        name="notifications-none"
                        size={moderateScale(32)}
                        color={Colors.greyText}
                    />
                </View>

                <Text style={styles.emptyTitle}>No notifications found</Text>
                <Text style={styles.emptyText}>
                    No updates are available in this category.
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <BackHeader
                title="Notification"
                onBackIconPress={() => {
                    NavigationService.goBack();
                }}
            />

            <View style={[styles.main, { backgroundColor: colors.background }]}>
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderNotificationCard}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={EmptyComponent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.tangerine]}
                            tintColor={Colors.tangerine}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white2,
    },

    main: {
        flex: 1,
        backgroundColor: Colors.white2,
        width: '100%',
        alignSelf: 'center',
        maxWidth: maxWidth,
    },

    listContent: {
        paddingBottom: moderateScale(30),
    },

    summaryBox: {
        width: '92%',
        alignSelf: 'center',
        marginTop: moderateScale(12),
        backgroundColor: Colors.white,
        borderRadius: moderateScale(15),
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightGrey,
        shadowColor: Colors.black,
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 2,
    },

    summaryIconBox: {
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(13),
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(10),
    },

    summaryTextBox: {
        flex: 1,
    },

    summaryTitle: {
        fontSize: moderateScale(14),
        color: Colors.black,
        fontWeight: '900',
    },

    summarySubTitle: {
        marginTop: moderateScale(2),
        fontSize: moderateScale(10.8),
        color: Colors.greyText,
        fontWeight: '700',
    },

    filterList: {
        paddingHorizontal: moderateScale(14),
        paddingTop: moderateScale(12),
        paddingBottom: moderateScale(3),
    },

    filterChip: {
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(6),
        borderRadius: moderateScale(999),
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightGrey,
        marginRight: moderateScale(8),
    },

    activeFilterChip: {
        backgroundColor: Colors.tangerine,
        borderColor: Colors.tangerine,
    },

    filterText: {
        color: Colors.greyText,
        fontSize: moderateScale(10.8),
        fontWeight: '900',
    },

    activeFilterText: {
        color: Colors.white,
    },

    sectionRow: {
        width: '92%',
        alignSelf: 'center',
        marginTop: moderateScale(10),
        marginBottom: moderateScale(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    sectionTitle: {
        color: Colors.black,
        fontSize: moderateScale(15),
        fontWeight: '900',
    },

    sectionCount: {
        color: Colors.greyText,
        fontSize: moderateScale(10),
        fontWeight: '800',
        backgroundColor: Colors.white,
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(3.5),
        borderRadius: moderateScale(999),
        borderWidth: 1,
        borderColor: Colors.lightGrey,
    },

    notificationCard: {
        width: '92%',
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(14),
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(7),
        marginBottom: moderateScale(8),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightGrey,
        shadowColor: Colors.black,
        shadowOpacity: 0.035,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 1,
    },

    unreadCard: {
        borderColor: Colors.tangerine4,
        backgroundColor: Colors.white2,
    },

    iconBox: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(12),
        backgroundColor: Colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(9),
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
        color: Colors.black,
        fontSize: moderateScale(12.4),
        fontWeight: '900',
        paddingRight: moderateScale(7),
    },

    unreadDot: {
        width: moderateScale(7),
        height: moderateScale(7),
        borderRadius: moderateScale(3.5),
        backgroundColor: Colors.tangerine,
    },

    cardMessage: {
        marginTop: moderateScale(2),
        color: Colors.darkGrey,
        fontSize: moderateScale(10.7),
        lineHeight: moderateScale(14),
        fontWeight: '600',
    },

    cardTime: {
        marginTop: moderateScale(4),
        color: Colors.greyText,
        fontSize: moderateScale(9.7),
        fontWeight: '700',
    },

    emptyBox: {
        width: '92%',
        alignSelf: 'center',
        backgroundColor: Colors.white,
        borderRadius: moderateScale(18),
        paddingVertical: moderateScale(30),
        paddingHorizontal: moderateScale(18),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightGrey,
        marginTop: moderateScale(14),
    },

    emptyIconBox: {
        width: moderateScale(62),
        height: moderateScale(62),
        borderRadius: moderateScale(31),
        backgroundColor: Colors.lightGrey2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        marginTop: moderateScale(12),
        color: Colors.black,
        fontSize: moderateScale(14.5),
        fontWeight: '900',
    },

    emptyText: {
        marginTop: moderateScale(5),
        color: Colors.greyText,
        fontSize: moderateScale(11),
        lineHeight: moderateScale(16),
        textAlign: 'center',
        fontWeight: '600',
    },
});