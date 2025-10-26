import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '../../Constants/Colors';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
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

const ExamResult = ({ route }) => {

    const maxWidth = 750;
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { examId, item } = route?.params || {}
    const { colors } = useTheme();
    const { Request } = UseApi();
    const { userData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [examKeys, setExamKeys] = useState([]);
    const [cresult, setCresult] = useState([]);
    const [consolidate, setConsolidate] = useState('0');
    const [consolidateResult, setConsolidateResult] = useState("");
    const [consolidateDivision, setConsolidateDivision] = useState("");

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

    const getExamSchedule = async () => {
        setLoading(true);

        // payload (send as strings to be safe)
        const payload = {
            student_session_id: String(userData?.student_session_id ?? ''),
            type: String(3),
            exam_group_class_batch_exam_id: String(examId ?? ''),
        };

        try {
            const res = await Request('exam-schedule', 'POST', payload);
            console.log('Exam Schedule Response:', res);

            const ok = res?.status === true || res?.success === true;
            if (ok && res?.data) {
                const d = res.data;

                setExamResults(d?.exam ?? []);
                setCresult(d?.cresult ?? []);
                setConsolidate(d?.consolidate ?? []);
                setConsolidateResult(d?.consolidate_result ?? []);
                setConsolidateDivision(d?.consolidate_division ?? []);

                const keys = (d?.exam ?? []).map(
                    (exam) => `exam_${exam?.exam_group_class_batch_exam_id}`
                );
                setExamKeys(keys);
            } else {
                console.warn('Request failed:', res?.message || 'Unable to fetch exam schedule');
            }
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            getExamSchedule();
            // console.log("Prop", route?.params);
        }
    }, [isFocused]);

    return (
        <View>
            {loading ?
                <ActivityIndicator size={28} style={{ marginTop: '25%' }} />
                :
                <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background, width: '100%' }}>
                    <View style={{ width: '94%', backgroundColor: colors.background, alignSelf: 'center', maxWidth: maxWidth }}>
                        {examResults?.map((examItem, index) => (
                            <View key={index} style={{ ...appStyles.card, backgroundColor: colors.background, marginBottom: 20 }}>
                                {/* Header */}
                                <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                    <Text style={{ ...TextStyles.title3, color: colors.text }}>
                                        {examItem?.exam_name?.toUpperCase()}
                                    </Text>
                                </View>

                                {/* Table Header */}
                                <View style={{ padding: 10 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ flex: 1.2 }}>
                                            <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Subject</Text>
                                        </View>
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Max Marks</Text>
                                        </View>
                                        <View style={{ flex: 0.8, alignItems: 'center' }}>
                                            <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Min Marks</Text>
                                        </View>
                                        <View style={{ flex: 1.2, alignItems: 'center' }}>
                                            <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Marks Obtained</Text>
                                        </View>
                                        <View style={{ flex: 0.8, alignItems: 'center' }}>
                                            <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Grade</Text>
                                        </View>
                                    </View>

                                    {/* Table Rows */}
                                    <View style={{ marginTop: 5 }}>
                                        {examItem?.values?.map((item, subIndex) => (
                                            <View key={subIndex} style={{ flexDirection: 'row', marginTop: 10 }}>
                                                <View style={{ flex: 1.2 }}>
                                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>{item.subject}</Text>
                                                </View>
                                                <View style={{ flex: 1, alignItems: 'center' }}>
                                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>{item.max_marks}</Text>
                                                </View>
                                                <View style={{ flex: 0.8, alignItems: 'center' }}>
                                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>{item.min_marks}</Text>
                                                </View>
                                                <View style={{ flex: 1.2, alignItems: 'center' }}>
                                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>{item.marks_obtained}</Text>
                                                </View>
                                                <View style={{ flex: 0.8, alignItems: 'center' }}>
                                                    <Text style={{ ...TextStyles.keyText, color: item.grade === 'F' ? Colors.red1 : Colors.green2 }}>
                                                        {item.grade}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Footer */}
                                    <View style={{
                                        backgroundColor: '#f1f1f1',
                                        paddingVertical: 12,
                                        paddingHorizontal: 10,
                                        borderRadius: 6,
                                        marginTop: 15,
                                    }}>
                                        {/* Row 3: Grand Total & Total Obtain Marks */}
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ flex: 0.9, fontSize: 14, color: colors.text }}>
                                                <Text style={{ fontWeight: '600' }}>Grand Total:</Text> {examItem?.footer?.['grand_total'] || '-'}
                                            </Text>
                                            <Text style={{ flex: 1.1, fontSize: 14, color: colors.text }}>
                                                <Text style={{ fontWeight: '600' }}>Total Obtain Marks:</Text> {examItem?.footer?.['total_obtain_marks'] || '-'}
                                            </Text>
                                        </View>

                                        {/* Row 1: Percentage & Rank */}
                                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                            <Text style={{ flex: 0.9, fontSize: 14, color: colors.text }}>
                                                <Text style={{ fontWeight: '600' }}>Rank:</Text> {examItem?.footer?.rank || '-'}
                                            </Text>
                                            <Text style={{ flex: 1.1, fontSize: 14, color: colors.text }}>
                                                <Text style={{ fontWeight: '600' }}>Percentage:</Text> {examItem?.footer?.percentage || '-'}
                                            </Text>
                                        </View>

                                        {/* Row 2: Result & Division */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={{ flex: 0.9, fontSize: 14, color: colors.text }}>
                                                <Text style={{ fontWeight: '600' }}>Division:</Text> {examItem?.footer?.division || '-'}
                                            </Text>
                                            <View style={{ flex: 1.1, flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Result:</Text>
                                                <View style={{
                                                    backgroundColor: examItem?.footer?.result === 'Pass' ? Colors.green2 : Colors.red1,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                    marginLeft: 8,
                                                }}>
                                                    <Text style={{ color: '#fff', fontSize: 13 }}>{examItem?.footer?.result || '-'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <View style={{ ...appStyles.card, backgroundColor: colors.background, marginBottom: 20 }}>
                            {/* Header */}
                            <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                <Text style={{ ...TextStyles.title3, color: colors.text }}>CONSOLIDATED RESULT</Text>
                            </View>

                            {/* Table Header */}
                            <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', backgroundColor: '#f1f1f1' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Exam</Text>
                                </View>
                                {examKeys.map((key, idx) => {
                                    const label = cresult.find(e => e.exam_key === key)?.exam_label || '-';
                                    return (
                                        <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                                            <Text style={{ ...TextStyles.subTitle, color: colors.text }}>{label}</Text>
                                        </View>
                                    );
                                })}
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Consolidate</Text>
                                </View>
                            </View>

                            {/* Table Body */}
                            <View style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>Marks Obtained</Text>
                                </View>
                                {examKeys.map((key, idx) => {
                                    const mark = cresult.find(e => e.exam_key === key)?.marks_value || '-';
                                    return (
                                        <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>{mark}</Text>
                                        </View>
                                    );
                                })}
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={{ ...TextStyles.keyText, color: colors.text }}>{consolidate}</Text>
                                </View>
                            </View>

                            {/* Footer */}
                            <View style={{
                                flexDirection: 'row',
                                backgroundColor: '#f1f1f1',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                                marginTop: 2,
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Result:</Text>
                                    <View style={{
                                        backgroundColor: consolidateResult === 'Pass' ? Colors.green2 : Colors.red1,
                                        paddingHorizontal: 8,
                                        paddingVertical: 2,
                                        borderRadius: 4,
                                        marginLeft: 8
                                    }}>
                                        <Text style={{ color: '#fff', fontSize: 13 }}>{consolidateResult}</Text>
                                    </View>
                                </View>
                                <Text style={{ ...TextStyles.subTitle, color: colors.text }}>Division: {consolidateDivision}</Text>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            }
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
        borderRadius: 3
    }

})