import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../Components/BackHeader';
import NavigationService from '../Services/Navigation';
import { ScrollView } from 'react-native-gesture-handler';
import { Images } from '../Constants/Images';
import { maxWidth, moderateScale, screenHeight } from '../Constants/PixelRatio';
import { Colors } from '../Constants/Colors';
import { TextStyles, appStyles } from '../Constants/Fonts';
import UseApi from '../ApiConfig';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';


// let TimeTable = [
//     {
//         day: 'Monday',
//         table: [
//             { time: '10:00 AM - 10:30 AM', subject: 'English', roomNo: 121 },
//             { time: '10:30 AM - 11:00 AM', subject: 'Mathematics', roomNo: 121 },
//             { time: '11:00 AM - 11:30 AM', subject: 'Life Science', roomNo: 131 },
//             { time: '11:30 AM - 12:00 PM', subject: 'History', roomNo: 121 },
//             { time: '12:30 PM - 1:00 PM', subject: 'Geography', roomNo: 151 },
//         ],
//     },
//     {
//         day: 'Teusday',
//         table: [
//             { time: '10:00 AM - 10:30 AM', subject: 'English', roomNo: 121 },
//             { time: '10:30 AM - 11:00 AM', subject: 'Mathematics', roomNo: 121 },
//             { time: '11:00 AM - 11:30 AM', subject: 'Physical Science', roomNo: 131 },
//             { time: '11:30 AM - 12:00 PM', subject: 'History', roomNo: 121 },
//             { time: '12:30 PM - 1:00 PM', subject: 'Hindi', roomNo: 151 },
//         ],
//     },
//     {
//         day: 'Wednesday',
//         table: [
//             { time: '10:00 AM - 10:30 AM', subject: 'English', roomNo: 121 },
//             { time: '10:30 AM - 11:00 AM', subject: 'Mathematics', roomNo: 121 },
//             { time: '11:00 AM - 11:30 AM', subject: 'Physical Science', roomNo: 131 },
//             { time: '11:30 AM - 12:00 PM', subject: 'Geography', roomNo: 121 },
//             { time: '12:30 PM - 1:00 PM', subject: 'Hindi', roomNo: 151 },
//         ],
//     },
//     {
//         day: 'Thursday',
//         table: [
//             { time: '10:00 AM - 10:30 AM', subject: 'English', roomNo: 121 },
//             { time: '10:30 AM - 11:00 AM', subject: 'Mathematics', roomNo: 121 },
//             { time: '11:00 AM - 11:30 AM', subject: 'Physical Science', roomNo: 131 },
//             { time: '11:30 AM - 12:00 PM', subject: 'History', roomNo: 121 },
//             { time: '12:30 PM - 1:00 PM', subject: 'Life Science', roomNo: 151 },
//         ],
//     },
// ]

const ClassTimeTable = () => {

    const { Request } = UseApi();
    const {colors} = useTheme();
    const { userData, profileData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [timeTable, setTimeTable] = useState([]);


    useEffect(() => {
        getTimetable();
    }, []);

    const getTimetable = async () => {
        setLoading(true);

        let params = {
            class: userData.class_id,
            section:userData.section_id
        }

        let data;
        try {
            data = await Request('class-table', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }

        if (data?.status) {
            setTimeTable(data?.data);
        }
        setLoading(false);
    }

    return (
        <View>
            <BackHeader
                title='Class Timetable'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>
                <View style={{ ...appStyles.main, backgroundColor: colors.background }}>
                    <View style={{ flexDirection: 'row', marginTop: 15, width: '90%', alignSelf: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{...TextStyles.headerText,color:colors.text}}>Your Class Timetable is here!</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Image
                                source={Images.classtimetable}
                                style={{
                                    height: moderateScale(65),
                                    width: moderateScale(65),
                                    marginTop: -5
                                }}
                            />
                        </View>
                    </View>
                    <View>
                        {!loading && timeTable.map((item, index) => {
                            return (
                                <>
                                    { <View key={index} style={{ ...appStyles.card, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                        <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                            <Text style={{ ...TextStyles.title2, color: colors.text }}>{item.day}</Text>
                                        </View>
                                        <View style={{ padding: 15, paddingTop: 5 }}>
                                            <View style={{ ...styles.itmRow, marginVertical: 5 }}>
                                                <Text style={{ ...styles.classHeader, flex: 4.5,color:colors.text }}>Time</Text>
                                                <Text style={{ ...styles.classHeader, flex: 3.5,color:colors.text }}>Subject</Text>
                                                <View style={{ flex: 2.2, alignItems: 'flex-end' }}>
                                                    <Text style={{ ...styles.classHeader,color:colors.text }}>Room No.</Text>
                                                </View>
                                            </View>
                                            {item.table.map((itm, ind) => {
                                                return (
                                                    <View style={styles.itmRow}>
                                                        <Text style={{ ...TextStyles.keyText, flex: 4.5,color:colors.text }}>{itm.time_from}-{itm.time_to}</Text>
                                                        <Text style={{ ...TextStyles.valueText, flex: 3.5,color:colors.text }}>{itm.subject_name}</Text>
                                                        <View style={{ flex: 2.2, alignItems: 'flex-end' }}>
                                                            <Text style={{ ...TextStyles.valueText,color:colors.text }}>{itm.room_no}</Text>
                                                        </View>
                                                    </View>
                                                )
                                            })}
                                            {item.table?.length == 0 && <Text style={{ color: 'red', marginTop: 20, alignSelf: 'center' }}>Not Scheduled</Text>}
                                        </View>
                                    </View>}
                                </>
                            )
                        })}

                        {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />}
                        {console.log('timetable...', timeTable)}
                        {!loading && timeTable.length == 0 && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
                            <Image
                                source={Images.NoDataFound}
                                style={{
                                    height: moderateScale(60),
                                    width: moderateScale(60),
                                    opacity: 0.5,
                                    tintColor:colors.text
                                    // marginTop:-15
                                }}
                            />
                            <Text style={{ fontSize: moderateScale(14), marginTop: 10,color:colors.text }}>No records found!</Text>
                        </View>}

                    </View>

                </View>
            </ScrollView>
        </View>
    )
}

export default ClassTimeTable

const styles = StyleSheet.create({
    itmRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2
    },
    classText: {
        fontSize: moderateScale(11),
        color: Colors.black,
        fontWeight: '500',
        // opacity: 0.6,
        marginTop: 3
    },
    classHeader: {
        fontSize: moderateScale(12),
        color: Colors.black,
        fontWeight: '500',
        opacity: 0.8
    }
})