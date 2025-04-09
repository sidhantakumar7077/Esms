import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { Colors } from '../../Constants/Colors';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import TitleHeader from '../../Components/TitleHeader';
import { Images } from '../../Constants/Images';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';
import { moderateScale, screenHeight } from '../../Constants/PixelRatio';
import { useTheme } from '@react-navigation/native';


const examSchedules = [
    { name: 'Bengali (BEN01)', date: '12/12/2023', roomNo: '121', startTime: '10:30:00', duration: '30 min', maxMarks: '100', minMarks: '30', creditHours: '5.00' },
    { name: 'Bengali (BEN01)', date: '12/12/2023', roomNo: '121', startTime: '10:30:00', duration: '30 min', maxMarks: '100', minMarks: '30', creditHours: '5.00' },
    { name: 'Mathematics (MATH03)', date: '13/12/2023', roomNo: '121', startTime: '10:30:00', duration: '30 min', maxMarks: '100', minMarks: '30', creditHours: '5.00' },
    { name: 'Mathematics (MATH03)', date: '13/12/2023', roomNo: '121', startTime: '10:30:00', duration: '30 min', maxMarks: '100', minMarks: '30', creditHours: '5.00' },
    { name: 'Mathematics (MATH03)', date: '13/12/2023', roomNo: '121', startTime: '10:30:00', duration: '30 min', maxMarks: '100', minMarks: '30', creditHours: '5.00' },
    { name: 'Mathematics (MATH03)', date: '13/12/2023', roomNo: '121', startTime: '10:30:00', duration: '30 min', maxMarks: '100', minMarks: '30', creditHours: '5.00' },
];
const ExamSchedule = ({ route }) => {

    const { Request } = UseApi();
    const { userData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const {colors} = useTheme();


    useEffect(() => {
        getExamSchedule();
    }, []);

    const getExamSchedule = async () => {
        setLoading(true);
        let params = {
            student_session_id: userData?.student_session_id,
            type: '2',
            exam_group_class_batch_exam_id: route?.params?.examId
        }

        let data;
        try {
            data = await Request('exam-schedule', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
        if (data?.status && data?.data.subject_list?.length > 0) {
            setSubjects(data?.data?.subject_list);
        }
        setLoading(false);
    }
    return (
        <View>
            <BackHeader
                title='Exam Schedule'
                onBackIconPress={() => {
                    NavigationService.navigate('Examination');
                }}
            />
            <ScrollView style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>
                <View style={{...appStyles.main,backgroundColor:colors.background}}>
                    <TitleHeader
                        title={'Your Exam Schedule is here!'}
                        image={Images.exams}
                    />
                    <View>
                        {subjects.map((item, index) => {
                            return (
                                <View style={{ ...appStyles.card, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                    <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                        <Text style={{...TextStyles.title2,color:colors.text}}>{item.subject_name} ({item.subject_code}) - {item.subject_type}</Text>
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Date</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.date_from}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Start Time</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.time_from}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Duration</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.duration}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Max Marks</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.max_marks}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Min Marks</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.min_marks}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Room No.</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.room_no}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ ...TextStyles.keyText, flex: 1,color:colors.text }}>Credit Hours</Text>
                                            <Text style={{ ...TextStyles.valueText, flex: 2,color:colors.text }}>{item.credit_hours}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                    {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />}
                    {subjects.length == 0 && !loading && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
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
            </ScrollView>
        </View>
    )
}

export default ExamSchedule

const styles = StyleSheet.create({})