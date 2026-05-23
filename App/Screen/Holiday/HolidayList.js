import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Colors } from '../../Constants/Colors';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {
    moderateScale,
} from '../../Constants/PixelRatio';

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const shortMonths = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

/**
 * Replace this static list with your API response when backend is ready.
 * Keep date format as YYYY-MM-DD.
 */
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
        const day = date.getDate();
        const month = shortMonths[date.getMonth()];
        const weekDay = weekDays[date.getDay()];

        return {
            day,
            month,
            weekDay,
            monthFull: months[date.getMonth()],
        };
    };

    const getTypeColor = type => {
        if (type === 'National Holiday') {
            return '#FF7043';
        }

        if (type === 'Festival Holiday') {
            return '#7E57C2';
        }

        if (type === 'Vacation') {
            return '#26A69A';
        }

        if (type === 'School Event') {
            return '#42A5F5';
        }

        return '#66BB6A';
    };

    const renderMonthChip = ({ item, index }) => {
        const active = !showAllYear && selectedMonth === index;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    setSelectedMonth(index);
                    setShowAllYear(false);
                }}
                style={[
                    styles.monthChip,
                    {
                        backgroundColor: active ? colors.green : colors.card || '#fff',
                        borderColor: active ? colors.green : '#E3E8E5',
                    },
                ]}
            >
                <Text
                    style={[
                        styles.monthChipText,
                        {
                            color: active ? '#fff' : colors.text,
                        },
                    ]}
                >
                    {item.slice(0, 3)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderHolidayItem = ({ item }) => {
        const formatted = formatDate(item.date);
        const typeColor = getTypeColor(item.type);

        return (
            <View
                style={[
                    styles.holidayCard,
                    {
                        backgroundColor: colors.card || '#fff',
                        borderColor: colors.border || '#EEF2EF',
                    },
                ]}
            >
                <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{formatted.day}</Text>
                    <Text style={styles.dateMonth}>{formatted.month}</Text>
                    <Text style={styles.dateWeek}>{formatted.weekDay}</Text>
                </View>

                <View style={styles.holidayInfo}>
                    <View style={styles.cardTopRow}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.holidayTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {item.title}
                        </Text>

                        <View
                            style={[
                                styles.typeBadge,
                                {
                                    backgroundColor: `${typeColor}20`,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    {
                                        color: typeColor,
                                    },
                                ]}
                            >
                                {item.type}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={[
                            styles.holidayNote,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {item.note}
                    </Text>

                    {showAllYear && (
                        <View style={styles.monthLine}>
                            <Icon name="calendar-month" size={15} color={colors.green} />
                            <Text
                                style={[
                                    styles.monthLineText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {formatted.monthFull} {currentYear}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const ListEmptyComponent = () => {
        return (
            <View style={styles.emptyBox}>
                <View style={styles.emptyIconBox}>
                    <Icon name="event-busy" size={38} color={colors.green} />
                </View>

                <Text
                    style={[
                        styles.emptyTitle,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    No holidays found
                </Text>

                <Text
                    style={[
                        styles.emptySubTitle,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    There is no holiday added for {months[selectedMonth]} {currentYear}.
                </Text>
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

            <View style={styles.headerCardWrapper}>
                <View style={styles.headerCard}>
                    <View>
                        <Text style={styles.headerSmallText}>Academic Year</Text>
                        <Text style={styles.headerTitle}>{currentYear} Holiday List</Text>
                        <Text style={styles.headerSubTitle}>
                            View monthly holidays or complete year list
                        </Text>
                    </View>

                    <View style={styles.headerIconBox}>
                        <Icon name="event-available" size={34} color="#fff" />
                    </View>
                </View>
            </View>

            <View style={styles.summaryWrapper}>
                <View style={[styles.summaryCard, { backgroundColor: colors.card || '#fff' }]}>
                    <Icon name="today" size={22} color={colors.green} />
                    <View style={styles.summaryTextBox}>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {currentMonthHolidayCount}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.text }]}>
                            This Month
                        </Text>
                    </View>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: colors.card || '#fff' }]}>
                    <Icon name="date-range" size={22} color={colors.green} />
                    <View style={styles.summaryTextBox}>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                            {totalHolidayCount}
                        </Text>
                        <Text style={[styles.summaryLabel, { color: colors.text }]}>
                            This Year
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.monthScrollContent}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowAllYear(true)}
                        style={[
                            styles.allYearButton,
                            {
                                backgroundColor: showAllYear ? colors.green : colors.card || '#fff',
                                borderColor: showAllYear ? colors.green : '#E3E8E5',
                            },
                        ]}
                    >
                        <Icon
                            name="calendar-today"
                            size={16}
                            color={showAllYear ? '#fff' : colors.green}
                        />
                        <Text
                            style={[
                                styles.allYearText,
                                {
                                    color: showAllYear ? '#fff' : colors.text,
                                },
                            ]}
                        >
                            All Year
                        </Text>
                    </TouchableOpacity>

                    {months.map((item, index) => (
                        <View key={item}>
                            {renderMonthChip({ item, index })}
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.listHeader}>
                <Text style={[styles.listTitle, { color: colors.text }]}>
                    {showAllYear
                        ? `All Holidays - ${currentYear}`
                        : `${months[selectedMonth]} Holidays`}
                </Text>

                <Text style={styles.listCount}>
                    {filteredHolidays.length} Holiday{filteredHolidays.length > 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={filteredHolidays}
                keyExtractor={item => item.id}
                renderItem={renderHolidayItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={ListEmptyComponent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.green]}
                        tintColor={colors.green}
                    />
                }
            />
        </View>
    );
};

export default HolidayList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white2,
    },

    headerCardWrapper: {
        paddingHorizontal: moderateScale(16),
        paddingTop: moderateScale(14),
    },

    headerCard: {
        minHeight: moderateScale(120),
        borderRadius: moderateScale(22),
        padding: moderateScale(18),
        backgroundColor: '#178D45',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    headerSmallText: {
        color: '#E8FFF0',
        fontSize: moderateScale(12),
        fontWeight: '600',
        marginBottom: moderateScale(5),
    },

    headerTitle: {
        color: '#fff',
        fontSize: moderateScale(20),
        fontWeight: '800',
    },

    headerSubTitle: {
        color: '#E8FFF0',
        fontSize: moderateScale(12),
        marginTop: moderateScale(6),
        maxWidth: moderateScale(210),
        lineHeight: moderateScale(18),
    },

    headerIconBox: {
        width: moderateScale(62),
        height: moderateScale(62),
        borderRadius: moderateScale(20),
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryWrapper: {
        flexDirection: 'row',
        paddingHorizontal: moderateScale(16),
        marginTop: moderateScale(14),
        gap: moderateScale(12),
    },

    summaryCard: {
        flex: 1,
        borderRadius: moderateScale(16),
        padding: moderateScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    summaryTextBox: {
        marginLeft: moderateScale(10),
    },

    summaryValue: {
        fontSize: moderateScale(18),
        fontWeight: '800',
    },

    summaryLabel: {
        fontSize: moderateScale(11),
        opacity: 0.6,
        marginTop: moderateScale(2),
    },

    filterSection: {
        marginTop: moderateScale(16),
    },

    monthScrollContent: {
        paddingHorizontal: moderateScale(16),
        gap: moderateScale(8),
    },

    allYearButton: {
        height: moderateScale(38),
        paddingHorizontal: moderateScale(14),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(6),
    },

    allYearText: {
        fontSize: moderateScale(12),
        fontWeight: '700',
    },

    monthChip: {
        height: moderateScale(38),
        minWidth: moderateScale(58),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(12),
    },

    monthChipText: {
        fontSize: moderateScale(12),
        fontWeight: '700',
    },

    listHeader: {
        marginTop: moderateScale(18),
        paddingHorizontal: moderateScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    listTitle: {
        fontSize: moderateScale(16),
        fontWeight: '800',
    },

    listCount: {
        fontSize: moderateScale(11),
        fontWeight: '700',
        color: '#178D45',
        backgroundColor: '#E8F8EE',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(5),
        borderRadius: moderateScale(20),
    },

    listContent: {
        paddingHorizontal: moderateScale(16),
        paddingTop: moderateScale(12),
        paddingBottom: moderateScale(30),
    },

    holidayCard: {
        borderRadius: moderateScale(18),
        borderWidth: 1,
        padding: moderateScale(12),
        marginBottom: moderateScale(12),
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    dateBox: {
        width: moderateScale(62),
        borderRadius: moderateScale(16),
        backgroundColor: '#F1FFF5',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(8),
        marginRight: moderateScale(12),
    },

    dateDay: {
        fontSize: moderateScale(21),
        fontWeight: '900',
        color: '#178D45',
    },

    dateMonth: {
        fontSize: moderateScale(12),
        fontWeight: '800',
        color: '#178D45',
        marginTop: moderateScale(1),
    },

    dateWeek: {
        fontSize: moderateScale(10),
        fontWeight: '600',
        color: '#6B7C70',
        marginTop: moderateScale(2),
    },

    holidayInfo: {
        flex: 1,
    },

    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: moderateScale(8),
    },

    holidayTitle: {
        flex: 1,
        fontSize: moderateScale(14),
        fontWeight: '800',
    },

    typeBadge: {
        borderRadius: moderateScale(20),
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(4),
    },

    typeText: {
        fontSize: moderateScale(9),
        fontWeight: '800',
    },

    holidayNote: {
        fontSize: moderateScale(12),
        opacity: 0.65,
        lineHeight: moderateScale(18),
        marginTop: moderateScale(7),
    },

    monthLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: moderateScale(8),
        gap: moderateScale(5),
    },

    monthLineText: {
        fontSize: moderateScale(11),
        fontWeight: '600',
        opacity: 0.65,
    },

    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: moderateScale(70),
        paddingHorizontal: moderateScale(30),
    },

    emptyIconBox: {
        width: moderateScale(76),
        height: moderateScale(76),
        borderRadius: moderateScale(38),
        backgroundColor: '#E8F8EE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: moderateScale(16),
    },

    emptyTitle: {
        fontSize: moderateScale(17),
        fontWeight: '800',
    },

    emptySubTitle: {
        fontSize: moderateScale(12),
        opacity: 0.6,
        textAlign: 'center',
        marginTop: moderateScale(8),
        lineHeight: moderateScale(18),
    },
});