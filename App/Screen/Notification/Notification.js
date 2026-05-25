import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BackHeader from '../../Components/BackHeader';
import TitleHeader from '../../Components/TitleHeader';
import NavigationService from '../../Services/Navigation';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import { appStyles } from '../../Constants/Fonts';
import { moderateScale, screenHeight, maxWidth } from '../../Constants/PixelRatio';

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
    const [loading, setLoading] = useState(false);

    const primaryColor = '#178D45';
    const lightGreenColor = colors.lightGreen || '#E8F8EE';
    const cardBorderColor = colors.lightBlck || colors.border || '#E3E8E5';
    const cardBackground = colors.background || colors.card || Colors.white2;

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

    const renderFilter = item => {
        const active = activeFilter === item;

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
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderNotificationCard = (item, index) => {
        return (
            <TouchableOpacity
                key={item.id || index}
                activeOpacity={0.88}
                style={{
                    elevation: 3,
                    width: '100%',
                    borderRadius: 20,
                    backgroundColor: Colors.white2,
                    alignSelf: 'center',
                    backgroundColor: cardBackground,
                    borderColor: item.unread ? primaryColor : cardBorderColor,
                    borderWidth: item.unread ? 0.8 : 0.5,
                    overflow: 'hidden',
                    marginBottom: moderateScale(9),
                }}>
                <View style={styles.notificationCardInner}>
                    <View style={[styles.iconBox, { backgroundColor: lightGreenColor }]}>
                        <Icon
                            name={NOTIFICATION_ICON}
                            size={moderateScale(17)}
                            color={primaryColor}
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
                    </View>
                </View>
            </TouchableOpacity>
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

            <ScrollView
                style={{
                    backgroundColor: colors.background,
                    width: '100%',
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[primaryColor]}
                        tintColor={primaryColor}
                    />
                }>
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
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterList}>
                            {FILTERS.map(item => renderFilter(item))}
                        </ScrollView>
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
                            {filteredNotifications.length} found
                        </Text>
                    </View>

                    <View>
                        {!loading && filteredNotifications.map((item, index) => renderNotificationCard(item, index))}

                        {loading && (
                            <ActivityIndicator
                                size={28}
                                color={primaryColor}
                                style={{ marginTop: screenHeight / 3 }}
                            />
                        )}

                        {filteredNotifications.length === 0 && !loading && (
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
                        )}
                    </View>
                </View>
            </ScrollView>
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
        backgroundColor: Colors.white2,
        width: '92%',
        alignSelf: 'center',
        maxWidth: maxWidth,
        minHeight: screenHeight - 80,
    },
    summaryBox: {
        borderRadius: moderateScale(15),
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        marginBottom: moderateScale(8),
    },
    summaryIconBox: {
        width: moderateScale(42),
        height: moderateScale(42),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(10),
    },
    summaryTextBox: {
        flex: 1,
    },
    summaryTitle: {
        fontSize: moderateScale(14),
        fontWeight: '500',
    },
    summarySubTitle: {
        marginTop: moderateScale(3),
        fontSize: moderateScale(10.8),
        fontWeight: '400',
        opacity: 0.65,
    },
    filterSection: {
        marginTop: moderateScale(8),
    },
    filterList: {
        paddingVertical: moderateScale(3),
        gap: moderateScale(8),
    },
    filterChip: {
        height: moderateScale(32),
        paddingHorizontal: moderateScale(14),
        borderRadius: moderateScale(16),
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
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
    emptyBox: {
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
});