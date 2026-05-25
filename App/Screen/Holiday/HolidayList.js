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

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const holidayList = [
    {
        id: '1',
        title: 'New Year Holiday',
        date: `${currentYear}-01-01`,
        type: 'Public Holiday',
        note: 'School will remain closed for New Year celebration.',
    },
    {
        id: '2',
        title: 'Republic Day',
        date: `${currentYear}-01-26`,
        type: 'National Holiday',
        note: 'Holiday on the occasion of Republic Day.',
    },
    {
        id: '3',
        title: 'Saraswati Puja',
        date: `${currentYear}-02-03`,
        type: 'Festival Holiday',
        note: 'Holiday for Saraswati Puja celebration.',
    },
    {
        id: '4',
        title: 'Holi',
        date: `${currentYear}-03-14`,
        type: 'Festival Holiday',
        note: 'Holiday on the occasion of Holi.',
    },
    {
        id: '5',
        title: 'Good Friday',
        date: `${currentYear}-04-18`,
        type: 'Public Holiday',
        note: 'School will remain closed.',
    },
    {
        id: '6',
        title: 'Summer Vacation Starts',
        date: `${currentYear}-05-15`,
        type: 'Vacation',
        note: 'Summer vacation begins from this date.',
    },
    {
        id: '7',
        title: 'Ratha Yatra',
        date: `${currentYear}-06-27`,
        type: 'Festival Holiday',
        note: 'Holiday on the occasion of Ratha Yatra.',
    },
    {
        id: '8',
        title: 'Independence Day',
        date: `${currentYear}-08-15`,
        type: 'National Holiday',
        note: 'Holiday on the occasion of Independence Day.',
    },
    {
        id: '9',
        title: 'Janmashtami',
        date: `${currentYear}-08-16`,
        type: 'Festival Holiday',
        note: 'Holiday on the occasion of Janmashtami.',
    },
    {
        id: '10',
        title: 'Teacher’s Day Celebration',
        date: `${currentYear}-09-05`,
        type: 'School Event',
        note: 'Special celebration in school.',
    },
    {
        id: '11',
        title: 'Gandhi Jayanti',
        date: `${currentYear}-10-02`,
        type: 'National Holiday',
        note: 'Holiday on the occasion of Gandhi Jayanti.',
    },
    {
        id: '12',
        title: 'Dussehra Holiday',
        date: `${currentYear}-10-20`,
        type: 'Festival Holiday',
        note: 'School will remain closed for Dussehra.',
    },
    {
        id: '13',
        title: 'Diwali Holiday',
        date: `${currentYear}-11-12`,
        type: 'Festival Holiday',
        note: 'Holiday on the occasion of Diwali.',
    },
    {
        id: '14',
        title: 'Christmas',
        date: `${currentYear}-12-25`,
        type: 'Public Holiday',
        note: 'Holiday on the occasion of Christmas.',
    },
];

const HolidayList = () => {
    const { colors } = useTheme();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [showAllYear, setShowAllYear] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const primaryColor = '#178D45';
    const lightGreenColor = colors.lightGreen || '#E8F8EE';
    const cardBorderColor = colors.lightBlck || colors.border || '#E3E8E5';
    const cardBackground = colors.background || colors.card || Colors.white2;
    const currentChipBg = '#FFF8E6';
    const currentChipBorder = '#F1C36D';
    const currentChipText = '#B7791F';

    const sortedHolidays = useMemo(() => {
        return [...holidayList].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
    }, []);

    const filteredHolidays = useMemo(() => {
        if (showAllYear) {
            return sortedHolidays;
        }

        return sortedHolidays.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === selectedMonth;
        });
    }, [selectedMonth, showAllYear, sortedHolidays]);

    const totalHolidayCount = sortedHolidays.length;

    const currentMonthHolidayCount = useMemo(() => {
        return sortedHolidays.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate.getMonth() === currentMonth;
        }).length;
    }, [sortedHolidays]);

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 700);
    };

    const formatDate = dateString => {
        const date = new Date(dateString);

        return {
            day: date.getDate(),
            month: shortMonths[date.getMonth()],
            weekDay: weekDays[date.getDay()],
            monthFull: months[date.getMonth()],
        };
    };

    const renderMonthChip = (item, index) => {
        const active = !showAllYear && selectedMonth === index;
        const isCurrent = index === currentMonth;

        return (
            <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => {
                    setSelectedMonth(index);
                    setShowAllYear(false);
                }}
                style={[
                    styles.monthChip,
                    {
                        backgroundColor: active ? lightGreenColor : isCurrent ? currentChipBg : cardBackground,
                        borderColor: active ? primaryColor : isCurrent ? currentChipBorder : cardBorderColor,
                    },
                ]}>
                <Text
                    style={[
                        styles.monthChipText,
                        {
                            color: active ? primaryColor : isCurrent ? currentChipText : colors.text,
                            opacity: active || isCurrent ? 1 : 0.72,
                        },
                    ]}>
                    {item.slice(0, 3)}
                </Text>

                {isCurrent && (
                    <View
                        style={[
                            styles.currentDot,
                            {
                                backgroundColor: active ? primaryColor : currentChipText,
                            },
                        ]}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderHolidayItem = (item, index) => {
        const formatted = formatDate(item.date);

        return (
            <View
                key={item.id || index}
                style={{
                    ...appStyles.card,
                    backgroundColor: cardBackground,
                    borderColor: cardBorderColor,
                    borderWidth: 0.5,
                    overflow: 'hidden',
                    marginBottom: moderateScale(10),
                }}>
                <View
                    style={{
                        ...appStyles.titleRow,
                        backgroundColor: lightGreenColor,
                        paddingVertical: moderateScale(7),
                        minHeight: moderateScale(36),
                    }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            ...styles.title,
                            color: colors.text,
                        }}>
                        {item.title}
                    </Text>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.dateRow}>
                        <View
                            style={[
                                styles.dateBox,
                                {
                                    backgroundColor: lightGreenColor,
                                },
                            ]}>
                            <Text
                                style={[
                                    styles.dateDay,
                                    {
                                        color: primaryColor,
                                    },
                                ]}>
                                {formatted.day}
                            </Text>
                            <Text
                                style={[
                                    styles.dateMonth,
                                    {
                                        color: primaryColor,
                                    },
                                ]}>
                                {formatted.month}
                            </Text>
                        </View>

                        <View style={styles.dateInfo}>
                            <View style={styles.infoRow}>
                                <Image
                                    source={Images.calendar}
                                    style={[
                                        styles.rowIcon,
                                        {
                                            tintColor: primaryColor,
                                        },
                                    ]}
                                />

                                <Text
                                    style={[
                                        styles.description,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    {formatted.weekDay}, {formatted.monthFull} {currentYear}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.typeBadge,
                                    {
                                        backgroundColor: lightGreenColor,
                                    },
                                ]}>
                                <Text
                                    style={[
                                        styles.typeText,
                                        {
                                            color: primaryColor,
                                        },
                                    ]}>
                                    {item.type}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text
                        numberOfLines={2}
                        style={[
                            styles.noteText,
                            {
                                color: colors.text,
                            },
                        ]}>
                        {item.note}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <BackHeader
                title="Holiday List"
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
                        title={'Your Holiday List is here!'}
                        image={Images.classRoutine}
                        imageStyle={{
                            height: moderateScale(65),
                            width: moderateScale(90),
                        }}
                    />

                    <View style={styles.summaryWrapper}>
                        <View
                            style={[
                                styles.summaryCard,
                                {
                                    backgroundColor: cardBackground,
                                    borderColor: cardBorderColor,
                                },
                            ]}>
                            <View
                                style={[
                                    styles.summaryIconBox,
                                    {
                                        backgroundColor: lightGreenColor,
                                    },
                                ]}>
                                <Icon name="today" size={18} color={primaryColor} />
                            </View>

                            <View style={styles.summaryTextBox}>
                                <Text
                                    style={[
                                        styles.summaryValue,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    {currentMonthHolidayCount}
                                </Text>
                                <Text
                                    style={[
                                        styles.summaryLabel,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    This Month
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.summaryCard,
                                {
                                    backgroundColor: cardBackground,
                                    borderColor: cardBorderColor,
                                },
                            ]}>
                            <View
                                style={[
                                    styles.summaryIconBox,
                                    {
                                        backgroundColor: lightGreenColor,
                                    },
                                ]}>
                                <Icon name="date-range" size={18} color={primaryColor} />
                            </View>

                            <View style={styles.summaryTextBox}>
                                <Text
                                    style={[
                                        styles.summaryValue,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    {totalHolidayCount}
                                </Text>
                                <Text
                                    style={[
                                        styles.summaryLabel,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    This Year
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.monthScrollContent}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    setShowAllYear(true);
                                }}
                                style={[
                                    styles.allYearButton,
                                    {
                                        backgroundColor: showAllYear ? lightGreenColor : cardBackground,
                                        borderColor: showAllYear ? primaryColor : cardBorderColor,
                                    },
                                ]}>
                                <Icon name="calendar-today" size={14} color={primaryColor} />

                                <Text
                                    style={[
                                        styles.allYearText,
                                        {
                                            color: showAllYear ? primaryColor : colors.text,
                                            opacity: showAllYear ? 1 : 0.72,
                                        },
                                    ]}>
                                    All Year
                                </Text>
                            </TouchableOpacity>

                            {months.map((item, index) => renderMonthChip(item, index))}
                        </ScrollView>
                    </View>

                    <View style={styles.listHeader}>
                        <Text
                            style={[
                                styles.listTitle,
                                {
                                    color: colors.text,
                                },
                            ]}>
                            {showAllYear
                                ? `All Holidays - ${currentYear}`
                                : `${months[selectedMonth]} Holidays`}
                        </Text>

                        <Text
                            style={[
                                styles.listCount,
                                {
                                    color: primaryColor,
                                    backgroundColor: lightGreenColor,
                                },
                            ]}>
                            {filteredHolidays.length} Holiday{filteredHolidays.length > 1 ? 's' : ''}
                        </Text>
                    </View>

                    <View>
                        {!loading && filteredHolidays.map((item, index) => renderHolidayItem(item, index))}

                        {loading && (
                            <ActivityIndicator
                                size={28}
                                color={primaryColor}
                                style={{ marginTop: screenHeight / 3 }}
                            />
                        )}

                        {filteredHolidays.length === 0 && !loading && (
                            <View style={styles.emptyBox}>
                                <Image
                                    source={Images.NoDataFound}
                                    style={styles.emptyImage}
                                />
                                <Text
                                    style={[
                                        styles.emptyTitle,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    No holidays found
                                </Text>
                                <Text
                                    style={[
                                        styles.emptySubTitle,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    There is no holiday added for {months[selectedMonth]} {currentYear}.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default HolidayList;

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
    summaryWrapper: {
        flexDirection: 'row',
        marginTop: moderateScale(6),
        marginBottom: moderateScale(6),
        gap: moderateScale(8),
    },
    summaryCard: {
        flex: 1,
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(9),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
    },
    summaryIconBox: {
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryTextBox: {
        marginLeft: moderateScale(8),
    },
    summaryValue: {
        fontSize: moderateScale(14),
        fontWeight: '500',
    },
    summaryLabel: {
        fontSize: moderateScale(10),
        fontWeight: '400',
        opacity: 0.7,
        marginTop: moderateScale(1),
    },
    filterSection: {
        marginTop: moderateScale(8),
    },
    monthScrollContent: {
        paddingVertical: moderateScale(3),
        gap: moderateScale(7),
    },
    allYearButton: {
        height: moderateScale(32),
        paddingHorizontal: moderateScale(11),
        borderRadius: moderateScale(16),
        borderWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(5),
    },
    allYearText: {
        fontSize: moderateScale(11),
        fontWeight: '500',
    },
    monthChip: {
        height: moderateScale(32),
        minWidth: moderateScale(50),
        borderRadius: moderateScale(16),
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(10),
    },
    monthChipText: {
        fontSize: moderateScale(11),
        fontWeight: '500',
    },
    currentDot: {
        width: moderateScale(4),
        height: moderateScale(4),
        borderRadius: moderateScale(2),
        marginTop: moderateScale(2),
    },
    listHeader: {
        marginTop: moderateScale(14),
        marginBottom: moderateScale(5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    listTitle: {
        fontSize: moderateScale(14),
        fontWeight: '500',
    },
    listCount: {
        fontSize: moderateScale(10),
        fontWeight: '500',
        paddingHorizontal: moderateScale(9),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(16),
        overflow: 'hidden',
    },
    title: {
        flex: 1,
        fontSize: moderateScale(14),
        fontWeight: '500',
        color: Colors.black,
    },
    cardBody: {
        paddingHorizontal: moderateScale(13),
        paddingBottom: moderateScale(11),
        paddingTop: moderateScale(9),
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateBox: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(10),
    },
    dateDay: {
        fontSize: moderateScale(16),
        fontWeight: '500',
    },
    dateMonth: {
        fontSize: moderateScale(10),
        fontWeight: '500',
        marginTop: moderateScale(1),
    },
    dateInfo: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        height: moderateScale(16),
        width: moderateScale(16),
        resizeMode: 'contain',
    },
    description: {
        fontSize: moderateScale(11),
        fontWeight: '500',
        marginLeft: moderateScale(8),
        opacity: 0.78,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        marginTop: moderateScale(6),
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(3),
        borderRadius: moderateScale(14),
    },
    typeText: {
        fontSize: moderateScale(9),
        fontWeight: '500',
    },
    noteText: {
        fontSize: moderateScale(11),
        fontWeight: '400',
        lineHeight: moderateScale(16),
        opacity: 0.72,
        marginTop: moderateScale(8),
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: screenHeight / 5,
        paddingHorizontal: moderateScale(30),
    },
    emptyImage: {
        height: moderateScale(60),
        width: moderateScale(60),
        opacity: 0.5,
        resizeMode: 'contain',
    },
    emptyTitle: {
        fontSize: moderateScale(15),
        fontWeight: '500',
        marginTop: moderateScale(10),
    },
    emptySubTitle: {
        fontSize: moderateScale(12),
        fontWeight: '400',
        opacity: 0.6,
        textAlign: 'center',
        marginTop: moderateScale(7),
        lineHeight: moderateScale(18),
    },
});