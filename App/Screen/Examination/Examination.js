import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { moderateScale, screenHeight } from '../../Constants/PixelRatio';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors } from '../../Constants/Colors';
import TitleHeader from '../../Components/TitleHeader';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import ExaminationScheduleTab from './ExaminationScheduleTab';
import ExamResult from './ExamResult';

const Tab = createMaterialTopTabNavigator();

const ExamsData = [
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Test April(2023-24)', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Examination-(Chapter Wise) Last Week', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
    { name: 'Monthly Test April(2023-24)', instruction: 'You are allowed to submit only once, make sure that you are correctly attempted all the questions before submission.' },
];

const Examination = () => {
    const { Request } = UseApi();
    const { userData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState([]);
    const { colors } = useTheme();


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
            <BackHeader
                title='Examinations'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <View style={{ backgroundColor: colors.background, width: '100%' }}>
                <View style={{ ...appStyles.main, backgroundColor: colors.background }}>
                    <TitleHeader
                        title={'Your Examinations are here!'}
                        image={Images.examinations}
                    />

                    <View
                        style={{
                            height: '100%',
                            flex: 1,
                            borderRadius: 15,
                            borderWidth: 0.5,
                            borderColor: colors.lightBlck,
                        }}>
                        <Tab.Navigator
                            style={{
                                borderRadius: 20
                            }}
                            screenOptions={{
                                tabBarLabelStyle: {
                                    fontSize: moderateScale(13),
                                    fontWeight: '500',
                                    textTransform: 'none',
                                    borderRadius: 15,
                                },
                                tabBarPressColor: 'transparent',
                                tabBarStyle: {
                                    backgroundColor: colors.lightGreen,
                                    borderTopLeftRadius: 15,
                                    borderTopEndRadius: 15,
                                },
                                tabBarContentContainerStyle: {
                                    borderBottomEndRadius: 15,
                                },
                                tabBarInactiveTintColor: colors.greyText,
                                tabBarIndicatorStyle: { backgroundColor: colors.text },
                            }}>
                            <Tab.Screen name={'EXAM SCHEDULE'} component={ExaminationScheduleTab} />
                            <Tab.Screen name={'EXAM RESULT'} component={ExamResult} />
                        </Tab.Navigator>
                    </View>
                </View>

            </View>
        </View>
    )
}

export default Examination

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