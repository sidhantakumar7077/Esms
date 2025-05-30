import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import NavigationService from '../../Services/Navigation';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { moderateScale, screenHeight } from '../../Constants/PixelRatio';
import { Colors } from '../../Constants/Colors';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';

const ExamsData = [
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Test April(2023-24)', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Test April(2023-24)', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
];

const ExaminationScheduleTab = () => {
    const { Request } = UseApi();
    const { userData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState([]);
    const { colors } = useTheme();
    const maxWidth = 750;


    useEffect(() => {
        getExams();
    }, []);

    const getExams = async () => {
        setLoading(true);

        let params = {
            student_session_id: userData?.student_session_id,
            type: '1'
        }

        let data;
        try {
            data = await Request('exam-schedule', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
        if (data?.status && data?.data?.examSchedule) {
            // console.log("Exam Schedule", data);
            setExams(data?.data?.examSchedule);
        }
        setLoading(false);
    }

    return (
        <View>
            <ScrollView showsVerticalScrollIndicator={false} style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>
                <View style={{ backgroundColor: colors.background, width: '94%', alignSelf: 'center', maxWidth: maxWidth, paddingBottom: 5 }}>
                    <View style={{ marginTop: 10 }}>
                        {exams.map((item, index) => {
                            return (
                                <View style={{ ...appStyles.card, backgroundColor: colors.background }}>
                                    <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                        <Text numberOfLines={2} style={{ ...TextStyles.title2, color: colors.text }}>{item.exam}</Text>
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        <Text style={{ ...TextStyles.keyText2, color: colors.text }}>{item.description}</Text>
                                        <View style={styles.btnRow}>
                                            <TouchableOpacity
                                                onPress={() => NavigationService.navigate('ExamSchedule', { examId: item.exam_group_class_batch_exam_id })}
                                                style={{ ...styles.btn, backgroundColor: Colors.btnBlackBackground }}>
                                                <Text style={{ ...appStyles.btnText2 }}>Exam Schedule</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                    {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />}
                    {exams.length == 0 && !loading && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
                        <Image
                            source={Images.NoDataFound}
                            style={{
                                height: moderateScale(60),
                                width: moderateScale(60),
                                opacity: 0.5,
                                tintColor: colors.text
                                // marginTop:-15
                            }}
                        />
                        <Text style={{ fontSize: moderateScale(14), marginTop: 10, color: colors.text }}>No records found!</Text>
                    </View>}
                </View>

            </ScrollView>
        </View>
    )
}

export default ExaminationScheduleTab

const styles = StyleSheet.create({
    btn: {
        ...appStyles.btn,
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(3),
        minWidth: '35%',
        //  flex:0.5
    },
    btnRow: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 15,
        columnGap: 5
    }
})