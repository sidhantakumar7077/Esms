import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BackHeader from '../../Components/BackHeader';
import TitleHeader from '../../Components/TitleHeader';
import NavigationService from '../../Services/Navigation';
import { Colors } from '../../Constants/Colors';
import { Images } from '../../Constants/Images';
import { appStyles } from '../../Constants/Fonts';
import { moderateScale, screenHeight, maxWidth } from '../../Constants/PixelRatio';

const API_KEY = '123123';

const defaultMonths = [
    { month_number: 1, title: 'Jan' },
    { month_number: 2, title: 'Feb' },
    { month_number: 3, title: 'Mar' },
    { month_number: 4, title: 'Apr' },
    { month_number: 5, title: 'May' },
    { month_number: 6, title: 'Jun' },
    { month_number: 7, title: 'Jul' },
    { month_number: 8, title: 'Aug' },
    { month_number: 9, title: 'Sep' },
    { month_number: 10, title: 'Oct' },
    { month_number: 11, title: 'Nov' },
    { month_number: 12, title: 'Dec' },
];

const fullMonths = [
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

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const today = new Date();
const currentMonthNumber = today.getMonth() + 1;

const buildApiUrl = (baseUrl, endpoint) => {
    const cleanBase = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const cleanEndpoint = endpoint?.startsWith('/') ? endpoint.substring(1) : endpoint;

    return `${cleanBase}${cleanEndpoint}`;
};

const parseLocalDate = dateString => {
    if (!dateString) {
        return null;
    }

    const parts = String(dateString).split('-');

    if (parts.length < 3) {
        const fallbackDate = new Date(dateString);
        return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

const formatDate = dateString => {
    const date = parseLocalDate(dateString);

    if (!date) {
        return {
            day: '',
            month: '',
            weekDay: '',
            monthFull: '',
            year: '',
            dateText: '',
        };
    }

    return {
        day: date.getDate(),
        month: defaultMonths[date.getMonth()]?.title || '',
        weekDay: weekDays[date.getDay()],
        monthFull: fullMonths[date.getMonth()],
        year: date.getFullYear(),
        dateText: `${weekDays[date.getDay()]}, ${fullMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
    };
};

const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (!startDate) {
        return '';
    }

    if (!endDate || startDate === endDate) {
        return start.dateText;
    }

    return `${start.dateText} - ${end.dateText}`;
};

const normalizeHoliday = item => {
    const startDate =
        item?.start_date ||
        item?.holiday_date ||
        item?.date ||
        '';

    const endDate =
        item?.end_date ||
        item?.start_date ||
        item?.holiday_date ||
        item?.date ||
        '';

    const parsedDate = parseLocalDate(startDate);

    return {
        id: String(item?.id || `${item?.title || 'holiday'}-${startDate}`),
        title: item?.title || item?.holiday_title || 'Holiday',
        start_date: startDate,
        end_date: endDate,
        description: item?.description || item?.note || item?.details || '',
        type: item?.type || item?.holiday_type || 'Holiday',
        month_number: parsedDate ? parsedDate.getMonth() + 1 : '',
        year: parsedDate ? parsedDate.getFullYear() : '',
        raw: item,
    };
};

const sortHolidays = list => {
    return [...list].sort((a, b) => {
        const dateA = parseLocalDate(a.start_date);
        const dateB = parseLocalDate(b.start_date);

        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
    });
};

const uniqueHolidays = list => {
    const map = new Map();

    list.forEach(item => {
        const key = String(item.id || `${item.title}-${item.start_date}`);
        map.set(key, item);
    });

    return Array.from(map.values());
};

const HolidayList = () => {
    const { colors } = useTheme();
    const { userData } = useSelector(state => state.User);

    const [selectedMonth, setSelectedMonth] = useState(currentMonthNumber);
    const [showAllYear, setShowAllYear] = useState(false);

    const [months, setMonths] = useState(defaultMonths);
    const [monthHolidays, setMonthHolidays] = useState([]);
    const [yearHolidays, setYearHolidays] = useState([]);

    const [sessionId, setSessionId] = useState('');
    const [totalYearlyHoliday, setTotalYearlyHoliday] = useState(0);
    const [totalMonthlyHoliday, setTotalMonthlyHoliday] = useState(0);

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const primaryColor = '#178D45';
    const lightGreenColor = colors.lightGreen || '#E8F8EE';
    const cardBorderColor = colors.lightBlck || colors.border || '#E3E8E5';
    const cardBackground = colors.card || Colors.white2;
    const screenBackground = colors.background || Colors.white2;

    const currentChipBg = '#FFF8E6';
    const currentChipBorder = '#F1C36D';
    const currentChipText = '#B7791F';

    const getStudentId = useCallback(async () => {
        const storedStudentId = await AsyncStorage.getItem('student_id');
        const storedUserId = await AsyncStorage.getItem('user_id');

        return (
            userData?.student_id ||
            userData?.studentId ||
            userData?.student?.id ||
            userData?.id ||
            storedStudentId ||
            storedUserId ||
            ''
        );
    }, [userData]);

    const requestHolidayList = useCallback(
        async monthNumber => {
            const storedApiBase = await AsyncStorage.getItem('api_base_url');
            const studentId = await getStudentId();

            if (!storedApiBase) {
                throw new Error('API base URL not found. Please set api_base_url first.');
            }

            if (!studentId) {
                throw new Error('Student ID not found.');
            }

            const API_URL = buildApiUrl(
                storedApiBase,
                'holidayList',
            );

            const form = new FormData();
            form.append('month', String(monthNumber));
            form.append('student_id', String(studentId));

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'X-API-KEY': API_KEY,
                },
                body: form,
            });

            const json = await res.json();

            if (!json?.status) {
                throw new Error(json?.message || 'Failed to load holiday list.');
            }

            return json?.data || {};
        },
        [getStudentId],
    );

    const fetchMonthHolidayList = useCallback(
        async (monthNumber, isRefresh = false) => {
            try {
                if (!isRefresh) {
                    setLoading(true);
                }

                setError('');

                const data = await requestHolidayList(monthNumber);

                const apiMonths =
                    Array.isArray(data?.months) && data.months.length > 0
                        ? data.months
                        : defaultMonths;

                const holidays =
                    Array.isArray(data?.holiday_list)
                        ? data.holiday_list.map(normalizeHoliday)
                        : [];

                setMonths(apiMonths);
                setSessionId(data?.session_id || '');
                setTotalYearlyHoliday(Number(data?.total_yearly_holiday || 0));
                setTotalMonthlyHoliday(Number(data?.total_monthly_holiday || holidays.length || 0));
                setMonthHolidays(sortHolidays(holidays));
            } catch (e) {
                setError(e?.message || 'Something went wrong.');
                setMonthHolidays([]);
                setTotalMonthlyHoliday(0);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [requestHolidayList],
    );

    const fetchAllYearHolidayList = useCallback(
        async (isRefresh = false) => {
            try {
                if (!isRefresh) {
                    setLoading(true);
                }

                setError('');

                const monthNumbers = defaultMonths.map(item => Number(item.month_number));

                const responses = await Promise.all(
                    monthNumbers.map(monthNumber => requestHolidayList(monthNumber)),
                );

                let allHolidays = [];
                let apiMonths = defaultMonths;
                let yearlyTotal = 0;
                let latestSessionId = '';

                responses.forEach(data => {
                    if (Array.isArray(data?.months) && data.months.length > 0) {
                        apiMonths = data.months;
                    }

                    if (data?.session_id) {
                        latestSessionId = data.session_id;
                    }

                    if (data?.total_yearly_holiday) {
                        yearlyTotal = Number(data.total_yearly_holiday);
                    }

                    if (Array.isArray(data?.holiday_list)) {
                        allHolidays = [
                            ...allHolidays,
                            ...data.holiday_list.map(normalizeHoliday),
                        ];
                    }
                });

                const finalHolidayList = sortHolidays(uniqueHolidays(allHolidays));

                setMonths(apiMonths);
                setSessionId(latestSessionId);
                setTotalYearlyHoliday(yearlyTotal || finalHolidayList.length);
                setYearHolidays(finalHolidayList);
            } catch (e) {
                setError(e?.message || 'Something went wrong.');
                setYearHolidays([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [requestHolidayList],
    );

    useEffect(() => {
        fetchMonthHolidayList(currentMonthNumber, false);
    }, [fetchMonthHolidayList]);

    const onRefresh = () => {
        setRefreshing(true);

        if (showAllYear) {
            fetchAllYearHolidayList(true);
        } else {
            fetchMonthHolidayList(selectedMonth, true);
        }
    };

    const onMonthPress = monthNumber => {
        setSelectedMonth(monthNumber);
        setShowAllYear(false);
        fetchMonthHolidayList(monthNumber, false);
    };

    const onAllYearPress = () => {
        setShowAllYear(true);
        fetchAllYearHolidayList(false);
    };

    const filteredHolidays = useMemo(() => {
        return showAllYear ? yearHolidays : monthHolidays;
    }, [showAllYear, yearHolidays, monthHolidays]);

    const listTitle = useMemo(() => {
        if (showAllYear) {
            return 'All Holidays';
        }

        const monthTitle = months.find(
            item => Number(item.month_number) === Number(selectedMonth),
        )?.title;

        const fullMonthName = fullMonths[selectedMonth - 1];

        return `${fullMonthName || monthTitle || 'Month'} Holidays`;
    }, [showAllYear, selectedMonth, months]);

    const renderMonthChip = item => {
        const monthNumber = Number(item.month_number);
        const active = !showAllYear && Number(selectedMonth) === monthNumber;
        const isCurrent = monthNumber === currentMonthNumber;

        return (
            <TouchableOpacity
                key={String(monthNumber)}
                activeOpacity={0.8}
                onPress={() => onMonthPress(monthNumber)}
                style={[
                    styles.monthChip,
                    {
                        backgroundColor: active
                            ? lightGreenColor
                            : isCurrent
                                ? currentChipBg
                                : cardBackground,
                        borderColor: active
                            ? primaryColor
                            : isCurrent
                                ? currentChipBorder
                                : cardBorderColor,
                    },
                ]}>
                <Text
                    style={[
                        styles.monthChipText,
                        {
                            color: active
                                ? primaryColor
                                : isCurrent
                                    ? currentChipText
                                    : colors.text,
                            opacity: active || isCurrent ? 1 : 0.72,
                        },
                    ]}>
                    {item.title}
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
        const formatted = formatDate(item.start_date);
        const dateRangeText = formatDateRange(item.start_date, item.end_date);

        return (
            <View
                key={String(item.id || index)}
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
                                    numberOfLines={2}
                                    style={[
                                        styles.description,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    {dateRangeText}
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

                    {!!item.description && (
                        <Text
                            numberOfLines={3}
                            style={[
                                styles.noteText,
                                {
                                    color: colors.text,
                                },
                            ]}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: screenBackground }]}>
            <BackHeader
                title="Holiday List"
                onBackIconPress={() => {
                    NavigationService.back();
                }}
            />

            <ScrollView
                style={{
                    backgroundColor: screenBackground,
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
                <View style={[styles.main, { backgroundColor: screenBackground }]}>
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
                                    {totalMonthlyHoliday}
                                </Text>

                                <Text
                                    style={[
                                        styles.summaryLabel,
                                        {
                                            color: colors.text,
                                        },
                                    ]}>
                                    Selected Month
                                </Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.summaryCard,
                                {
                                    backgroundColor: cardBackground,
                                    borderColor: cardBorderColor,
                                    marginRight: 0,
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
                                    {totalYearlyHoliday}
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

                    {!!sessionId && (
                        <View
                            style={[
                                styles.sessionBox,
                                {
                                    backgroundColor: lightGreenColor,
                                    borderColor: primaryColor,
                                },
                            ]}>
                            <Icon name="school" size={14} color={primaryColor} />
                            <Text style={[styles.sessionText, { color: primaryColor }]}>
                                Session ID: {sessionId}
                            </Text>
                        </View>
                    )}

                    <View style={styles.filterSection}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.monthScrollContent}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={onAllYearPress}
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

                            {months.map(item => renderMonthChip(item))}
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
                            {listTitle}
                        </Text>

                        <Text
                            style={[
                                styles.listCount,
                                {
                                    color: primaryColor,
                                    backgroundColor: lightGreenColor,
                                },
                            ]}>
                            {filteredHolidays.length} Holiday{filteredHolidays.length === 1 ? '' : 's'}
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
                            <Icon name="error-outline" size={32} color="#EF4444" />

                            <Text style={styles.errorText}>
                                {error}
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => {
                                    if (showAllYear) {
                                        fetchAllYearHolidayList(false);
                                    } else {
                                        fetchMonthHolidayList(selectedMonth, false);
                                    }
                                }}
                                style={[styles.retryButton, { backgroundColor: primaryColor }]}>
                                <Icon name="refresh" size={16} color="#FFFFFF" />
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <View>
                        {!loading && !error && filteredHolidays.map((item, index) =>
                            renderHolidayItem(item, index),
                        )}

                        {loading && (
                            <ActivityIndicator
                                size={28}
                                color={primaryColor}
                                style={{ marginTop: screenHeight / 4 }}
                            />
                        )}

                        {filteredHolidays.length === 0 && !loading && !error && (
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
                                    {showAllYear
                                        ? 'There is no holiday added for this year.'
                                        : `There is no holiday added for ${fullMonths[selectedMonth - 1] || 'this month'}.`}
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
    },
    summaryCard: {
        flex: 1,
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(9),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        marginRight: moderateScale(8),
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
    sessionBox: {
        alignSelf: 'flex-start',
        borderWidth: 0.5,
        borderRadius: moderateScale(15),
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(5),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: moderateScale(2),
        marginBottom: moderateScale(5),
    },
    sessionText: {
        fontSize: moderateScale(10),
        fontWeight: '500',
        marginLeft: moderateScale(5),
    },
    filterSection: {
        marginTop: moderateScale(8),
    },
    monthScrollContent: {
        paddingVertical: moderateScale(3),
        paddingRight: moderateScale(10),
    },
    allYearButton: {
        height: moderateScale(32),
        paddingHorizontal: moderateScale(11),
        borderRadius: moderateScale(16),
        borderWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: moderateScale(7),
    },
    allYearText: {
        fontSize: moderateScale(11),
        fontWeight: '500',
        marginLeft: moderateScale(5),
    },
    monthChip: {
        height: moderateScale(32),
        minWidth: moderateScale(50),
        borderRadius: moderateScale(16),
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(10),
        marginRight: moderateScale(7),
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
        flex: 1,
        fontSize: moderateScale(14),
        fontWeight: '500',
        paddingRight: moderateScale(8),
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
        flex: 1,
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
    errorBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(24),
        paddingHorizontal: moderateScale(18),
        borderRadius: moderateScale(18),
        borderWidth: 0.5,
        marginTop: moderateScale(12),
        marginBottom: moderateScale(12),
    },
    errorText: {
        marginTop: moderateScale(8),
        color: '#EF4444',
        textAlign: 'center',
        fontSize: moderateScale(12),
        lineHeight: moderateScale(18),
    },
    retryButton: {
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