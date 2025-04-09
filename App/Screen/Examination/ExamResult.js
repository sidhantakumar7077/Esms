import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import NavigationService from '../../Services/Navigation';
import BackHeader from '../../Components/BackHeader';
import { Colors } from '../../Constants/Colors';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { moderateScale } from '../../Constants/PixelRatio';
import TitleHeader from '../../Components/TitleHeader';
import { useTheme } from '@react-navigation/native';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';

const SubResults = [
    { subject: 'English (210)', minMarks: '30', marksObtained: '78/100', result: 'Pass', note: 'Very Good' },
    { subject: 'History (110)', minMarks: '30', marksObtained: '75/100', result: 'Pass', note: '' },
    { subject: 'Geography (220)', minMarks: '30', marksObtained: '79/100', result: 'Pass', note: '' },
    { subject: 'Life Science (120)', minMarks: '30', marksObtained: '88/100', result: 'Pass', note: '' },
    { subject: 'Physical Science (210)', minMarks: '30', marksObtained: '84/100', result: 'Pass', note: '' },
    { subject: 'Mathematics (213)', minMarks: '30', marksObtained: '92/100', result: 'Pass', note: '' },
];

const ExamResult = ({route}) => {
    const {examId,item} = route?.params || {}
    const {colors} = useTheme();
    const { Request } = UseApi();
    const { userData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);


    // useEffect(() => {
    //     getExamResult();
    // }, []);

    // const getExamResult = async () => {
    //     setLoading(true);
    //     let params = {
    //         student_session_id: userData?.student_session_id,
    //         type: '2',
    //         // exam_group_class_batch_exam_id: route?.params?.examId
    //         exam_group_class_batch_exam_id: examId
    //     }

    //     let data;
    //     try {
    //         data = await Request('exam-schedule', 'POST', params);
    //     } catch (err) {
    //         console.log('err2....', err);
    //     }
    //     if (data?.status && data?.data.subject_list?.length > 0) {
    //         setResults(data?.data?.subject_list);
    //     }
    //     setLoading(false);
    // }

    return (
        <View>
            <BackHeader
                title='Exam Result'
                onBackIconPress={() => {
                    NavigationService.navigate('Examination');
                }}
            />
            <ScrollView style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>

                <View style={{ ...appStyles.main, width: '94%',backgroundColor:colors.background }}>
                    <TitleHeader
                        title={'Your Exam Result is here'}
                        image={Images.examresult}
                    />

                    <View style={{ ...appStyles.card,backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5  }}>
                        <View style={{...appStyles.titleRow, backgroundColor: colors.lightGreen}}>
                            <Text style={{...TextStyles.title3,color:colors.text}}>MONTHLY TEST APRIL(2023-24)</Text>
                        </View>
                        <View style={{ padding: 10 }}>
                            <View style={{ flexDirection: 'row' }}>
                                {/* <Text style={{ ...TextStyles.subTitle, flex: 1.2 }}>Subject</Text>
                                <Text style={{ ...TextStyles.subTitle, flex: 0.8 }}>Min Marks</Text>
                                <Text style={{ ...TextStyles.subTitle, flex: 1.2 }}>Marks Obtained</Text>
                                <Text style={{ ...TextStyles.subTitle, flex: 1 }}>Result</Text>
                                <Text style={{ ...TextStyles.subTitle, flex: 1 }}>Note</Text> */}

                                <View style={{ flex: 1.2 }}>
                                    <Text style={{...TextStyles.subTitle,color:colors.text}}>Subject</Text>
                                </View>
                                <View style={{ flex: 0.8, alignItems: 'center' }}>
                                    <Text style={{...TextStyles.subTitle,color:colors.text}}>  Min Marks</Text>
                                </View>
                                <View style={{ flex: 1.2, alignItems: 'center' }}>
                                    <Text style={{...TextStyles.subTitle,color:colors.text}}>  Marks Obtained</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={{...TextStyles.subTitle,color:colors.text}}>Result</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={{...TextStyles.subTitle,color:colors.text}}>Note</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                {SubResults.map((item, index) => {
                                    return (
                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <View style={{ flex: 1.2 }}>
                                                <Text style={{ ...TextStyles.keyText,color:colors.text }}>{item.subject}</Text>
                                            </View>
                                            <View style={{ flex: 0.8, alignItems: 'center' }}>
                                                <Text style={{ ...TextStyles.keyText,color:colors.text }}>{item.minMarks}</Text>
                                            </View>
                                            <View style={{ flex: 1.2, alignItems: 'center' }}>
                                                <Text style={{ ...TextStyles.keyText,color:colors.text }}>{item.marksObtained}</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                <Text style={{ ...TextStyles.keyText, color: item.result == 'Pass' ? Colors.green2 : Colors.red1 }}>{item.result}</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: 'center' }}>
                                                <Text style={{ ...TextStyles.keyText,color:colors.text }}>{item.note}</Text>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                        <View style={styles.bottomRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={{...TextStyles.keyText,color:colors.text}}>Grand Total  344/400</Text>
                                <Text style={{...TextStyles.keyText,color:colors.text}}>Division  FIRST</Text>
                                <Text style={{...TextStyles.keyText,color:colors.text}}>Rank  3</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{...TextStyles.keyText,flex:null,color:colors.text}}>Percentage  86.00</Text>
                                <View style={{ flexDirection: 'row',marginTop:5 }}>
                                    <Text style={{ ...TextStyles.keyText, flex: null,marginTop:0,color:colors.text }}>Result</Text>
                                    <View style={styles.statusWraper}>
                                        <Text style={{ ...TextStyles.keyText, color: Colors.white2, marginTop: 0 }}>PASS</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    )
}

export default ExamResult

const styles = StyleSheet.create({
    column: {
        flex: 1
    },
    bottomRow: {
        padding: 10,
        backgroundColor: Colors.lightGreen2,
        borderBottomEndRadius: 15,
        borderBottomStartRadius: 15,
        flexDirection: 'row'
    },
    statusWraper: {
        backgroundColor: Colors.Green1,
        marginLeft: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
        justifyContent: 'center',
        borderRadius:3
    }

})