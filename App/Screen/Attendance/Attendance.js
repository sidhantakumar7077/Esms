import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { Colors } from '../../Constants/Colors';
import { appStyles, TextStyles } from '../../Constants/Fonts';
import { moderateScale } from '../../Constants/PixelRatio';
import { Images } from '../../Constants/Images';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import TitleHeader from '../../Components/TitleHeader';
import { useTheme } from '@react-navigation/native';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';

const Attendance = () => {

    const [currDate, setCurrDate] = useState(new Date());
    const { userData, profileData } = useSelector(state => state.User);
    const [dayState, setDayState] = useState({ year: null, dayName: null, monthName: null, day: null });
    const [selectedDates, setSelectedDates] = useState(null);
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const { Request } = UseApi();
    const [attendanceCount, setAttendanceCount] = useState({ present: null, absent: null });


    useEffect(() => {
        getCurrDate();
    }, []);

    const getCurrDate = () => {
        const year = currDate.getFullYear();
        const month = currDate.getMonth() + 1; // Note: Months are zero-based
        const day = currDate.getDate();
        const monthName = moment(currDate).format('MMMM');
        // const monthName = currDate.toLocaleString('default', { month: 'long' });
        const DayName = moment(currDate).format('dddd')
        setDayState(pre => ({ ...pre, year: year, dayName: DayName, day: day, monthName: monthName }));
        // const endDate = moment().format('YYYY/MM/DD');
        // console.log('formattedDate...',formattedDate);
        // console.log('dayMonthYear...',day,month,year);

        // getAttendance(`${year}/${month}/01`,);
        let currdate = moment();
        console.log('currdate...', currdate);
        // const startOfMonth = currdate.clone().subtract(1, 'months').startOf('month').format('YYYY/MM/DD');
        const startOfMonth = currdate.startOf('month').format('YYYY/MM/DD');
        const endOfMonth = currdate.endOf('month').format('YYYY/MM/DD');
        getAttendance(startOfMonth, endOfMonth);
    }

    const getAttendance = async (startDate, endDate) => {
        setLoading(true);
        let params = {
            student_session_id: userData?.student_session_id,
            // start_date: '2024-07-01',
            // end_date: '2024-08-12'
            start_date: startDate,
            end_date: endDate
        }

        let data;
        try {
            data = await Request('attendance', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
        if (data?.status && data?.data) {
            if (data?.data?.attendance) {
                getSelectedDates(data?.data?.attendance);
            }
            setAttendanceCount({ present: data.data?.present, absent: data?.data?.absent });
            // setAssignments(data?.data);
        }
    }

    const getSelectedDates = (attendanceList) => {
        const yourArray = attendanceList.map((item) => {
            // const date = moment(item.date, 'DD-MM-YY').format('YYYY-MM-DD');
            // console.log('date....',date);
            return {
                key: `${item.start}`, value: {
                    marked: false,
                    customStyles: { container: { backgroundColor: item.backgroundColor, elevation: 2 }, text: { color: 'white' } }
                }
            }
        })
        const yourObject = yourArray.reduce((acc, item) => {
            // let value = { marked: false, customStyles: { container:{backgroundColor:'black',elevation:2},text: { color: 'white' } }
            acc[item.key] = item.value;
            return acc;
        }, {});
        console.log('yourObject...', yourObject)
        setSelectedDates(yourObject);
    }


    return (
        <View>
            <BackHeader
                title='Attendance'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>
                <View style={{ ...appStyles.main, backgroundColor: colors.background }}>

                    <TitleHeader
                        title={'Your Attendance Records are here!'}
                        image={Images.Attendance}
                    // imageStyle={{
                    //     height:moderateScale(90),
                    //     width:moderateScale(140),
                    //     resizeMode:'stretch'
                    // }}
                    />

                    <View style={{ ...styles.currDateWraper }}>
                        <Image
                            source={Images.calendar}
                            style={{
                                height: moderateScale(40),
                                width: moderateScale(40),
                                tintColor: Colors.white,
                                // flex:1
                            }}
                        />
                        <View style={{ flexDirection: 'row', }}>
                            <Text style={styles.currDay}>{dayState.day}</Text>
                            <View style={{ marginLeft: moderateScale(10) }}>
                                <Text style={styles.dayName}>{dayState.dayName}</Text>
                                <Text style={styles.monthYear}>{dayState.monthName} {dayState.year}</Text>
                            </View>
                        </View>

                    </View>
                    <View>
                        <Calendar
                            markedDates={selectedDates}
                            markingType='custom'
                            style={{ marginTop: 20, minHeight: 350, backgroundColor: colors.background }}
                            onMonthChange={(res) => {
                                let currMonth = moment(res.dateString);
                                console.log('currMonth...', currMonth);
                                // const startOfMonth = currMonth.clone().subtract(1, 'months').startOf('month').format('YYYY/MM/DD');
                                const startOfMonth = currMonth.startOf('month').format('YYYY/MM/DD');
                                // const endOfMonth = currMonth.clone().add(1, 'months').endOf('month').format('YYYY/MM/DD');
                                const endOfMonth = currMonth.endOf('month').format('YYYY/MM/DD');
                                console.log('startmonth...', startOfMonth);
                                console.log('endOfMonth...', endOfMonth);
                                getAttendance(startOfMonth, endOfMonth);
                            }}
                            // renderCustomDay={renderCustomDay}
                            // style={{borderColor:'black',borderWidth:1}}
                            // marking={false}
                            // dayComponent={(day) => renderCustomDay(day, selectedDates)}

                            theme={{
                                // backgroundColor: '#ffffff',
                                backgroundColor: colors.background,
                                // calendarBackground: '#ffffff',
                                calendarBackground: colors.background,
                                // textSectionTitleColor: colors.blue,
                                textSectionTitleColor: '#b6c1cd',
                                // selectedDayBackgroundColor: '#00adf5',
                                selectedDayTextColor: colors.green,
                                // todayTextColor: '#00adf5',
                                // dayTextColor: 'black',
                                dayTextColor: colors.text,
                                textDisabledColor: '#d9e',
                                // textDisabledColor: 'red',

                            }}
                        />
                    </View>
                    <View style={styles.staticsticSection}>
                        <View style={styles.singleStat}>
                            {/* <View style={{ ...styles.statName, backgroundColor: '#059aa0' }}> */}
                            <View style={{ ...styles.statName, backgroundColor: '#27ab00' }}>
                                <Text numberOfLines={1} style={styles.statNameText}>Presence</Text>
                            </View>
                            <View style={styles.statValue}>
                                <Text style={styles.statValueText}>{attendanceCount?.present || 'NA'}</Text>
                            </View>
                        </View>
                        <View style={styles.singleStat}>
                            {/* <View style={{ ...styles.statName, backgroundColor: Colors.tangerine }}> */}
                            <View style={{ ...styles.statName, backgroundColor: '#fa2601' }}>
                                <Text numberOfLines={1} style={styles.statNameText}>Absent</Text>
                            </View>
                            <View style={styles.statValue}>
                                <Text style={styles.statValueText}>{attendanceCount?.absent || 'NA'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={{ ...TextStyles.title2, color: colors.text }}>Color Summary</Text>
                        <View style={{ marginTop: 10, marginLeft: 2 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'row', columnGap: 10, flex: 1 }}>
                                    <View style={{ ...styles.circle, backgroundColor: '#27ab00', marginTop: 4 }}></View>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Present</Text>
                                </View>
                                <View style={{ flexDirection: 'row', columnGap: 10, marginTop: 5, flex: 1 }}>
                                    <View style={{ ...styles.circle, backgroundColor: '#ffeb00', marginTop: 4 }}></View>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Late</Text>
                                </View>

                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flexDirection: 'row', columnGap: 10, marginTop: 5, flex: 1 }}>
                                    <View style={{ ...styles.circle, backgroundColor: '#fa2601', marginTop: 4 }}></View>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Absent</Text>
                                </View>
                                <View style={{ flexDirection: 'row', columnGap: 10, marginTop: 5, flex: 1 }}>
                                    <View style={{ ...styles.circle, backgroundColor: '#fa8a00', marginTop: 4 }}></View>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Half Day</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default Attendance

const styles = StyleSheet.create({
    currDateWraper: {
        flexDirection: 'row',
        backgroundColor: Colors.btnBlackBackground,
        padding: 10,
        paddingLeft: moderateScale(25),
        paddingRight: moderateScale(55),
        borderRadius: moderateScale(10),
        marginTop: 40
    },
    currDay: {
        fontSize: moderateScale(30),
        color: Colors.white2,
        marginLeft: moderateScale(10)
    },
    dayName: {
        fontSize: moderateScale(18),
        color: Colors.white2,
    },
    monthYear: {
        fontSize: moderateScale(16),
        color: Colors.white2,
    },
    staticsticSection: {
        flexDirection: 'row',
        height: moderateScale(70),
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#c5d2ca',
        // marginTop: 0,
    },
    singleStat: {
        flex: 1,
        borderRightWidth: 1,
        borderColor: '#c5d2ca',
    },
    statName: {
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f4f4',
    },
    statValueText: {
        color: Colors.text,
        fontSize: moderateScale(13),
    },
    statNameText: {
        color: Colors.btnText,
        marginHorizontal: moderateScale(5),
        fontSize: moderateScale(12),
        fontWeight: '500'
    },
    circle: {
        height: 15,
        width: 15,
        borderRadius: 15,
    }
})