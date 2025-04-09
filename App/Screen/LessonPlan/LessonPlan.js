import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import { TextStyles, appStyles } from '../../Constants/Fonts';
import { Images } from '../../Constants/Images';
import { maxWidth, moderateScale, screenHeight, screenWidth, textSize } from '../../Constants/PixelRatio';
import { Colors } from '../../Constants/Colors';
import TitleHeader from '../../Components/TitleHeader';
import UseApi from '../../ApiConfig';
import { useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useTheme } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import SkeletonList from '../../Components/CommonComponent/SkeletonList';
import RenderHTML from 'react-native-render-html';



const Days = [
    { day: 'Monday', date: '25/12/2024' },
    { day: 'Tuesday', date: '26/12/2024' },
    { day: 'Wednesday', date: '27/12/2024' },
    { day: 'Thursday', date: '28/12/2024' },
    { day: 'Friday', date: '29/12/2024' },
    { day: 'Saturday', date: '30/12/2024' },
    { day: 'Sunday', date: '31/12/2024' },
];

const LessonPlan = () => {

    const [MondayDate, setMondayDate] = useState(null);
    const { Request,imageBaseUrl } = UseApi();
    const { colors } = useTheme();
    const { userData, profileData } = useSelector(state => state.User);
    const [loading, setLoading] = useState(false);
    const [skloader, setSkLoader] = useState(false);
    const [lessonPlan, setLessonPlan] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [currDay, setCurrDay] = useState();
    const [planDetails, setPlanDetails] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [currItem, setCurrItem] = useState(null);
    const [days, setDays] = useState([]);

    useEffect(() => {
        setMondayDate(getNextMonday('startdate'));
        // console.log('getNextMonday...', getNextMonday());
        // console.log('getDateAfter7Days...', getDateAfterXDays('25/12/2023',6));
    }, []);

    useEffect(() => {
        if (MondayDate) {
            getLessonPlan();
        }
    }, [MondayDate]);

    const getNextMonday = (type) => {
        const today = new Date();
        const daysUntilNextMonday = ((1 - today.getDay()) + 7) % 7; // Calculate days until next Monday
        const nextMondayDate = new Date(today.setDate(today.getDate() + daysUntilNextMonday));
        const formattedDate = `${nextMondayDate.getDate() < 10 ? 0 : ''}${nextMondayDate.getDate()}/${(nextMondayDate.getMonth() + 1) < 10 ? 0 : ''}${nextMondayDate.getMonth() + 1}/${nextMondayDate.getFullYear()}`;
        if (type == 'startdate') {
            return getDateAfterXDays(formattedDate, -7);
        } else {
            return formattedDate;
        }
    };

    const getDateAfterXDays = (specificDate, X) => {
        const [day, month, year] = specificDate.split('/').map(Number);
        const originalDate = new Date(year, month - 1, day); // Month is zero-based
        const dateAfterXDays = new Date(originalDate.setDate(originalDate.getDate() + X));
        const formattedDate = `${dateAfterXDays.getDate() < 10 ? 0 : ''}${dateAfterXDays.getDate()}/${(dateAfterXDays.getMonth() + 1) < 10 ? 0 : ''}${dateAfterXDays.getMonth() + 1}/${dateAfterXDays.getFullYear()}`;
        return formattedDate;
    };


    const getLessonPlan = async (type, subjectId,fourmId) => {
        // console.log(MondayDate,"MondayDate",formatDate(MondayDate))
        // return
        setLoading(true);
        setSkLoader(true);
        let dateformat = MondayDate;
        let params = {
            date: dateformat,
            type: type || '1',
            session_id: userData?.session_id,
            class_id: userData?.class_id,
            section_id: userData?.section_id,
            student_session_id: userData?.student_session_id,
            syllabus_subject_id: subjectId || currItem?.id,
            message: comment,
            student_id: userData?.student_id,
            fourm_id:fourmId || ''
        }

        let data;
        try {
            data = await Request('lesson-plan', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        };
        if (data?.status && data?.data?.table ) {
            setDays(data?.data?.days)
            setLessonPlan(data?.data?.table?.syllabus);
        } else if (type == '2' && data?.data) {
            // console.log('data?.data?..plandetails...', data?.data);
            setPlanDetails(data?.data);
        } else if (type == '3' && data?.data) {
            // console.log('data.data...commesnta..', data?.data)
            setComments(data?.data);
        } else if (type == '5') {
            // console.log('data add comment...', data);
            setComment('');
            getLessonPlan('3');
        }else if(type == '4'){
            getLessonPlan('3');
            Toast.show('Comment deleted successfully !');
        }
        setLoading(false);
        setSkLoader(false);
    }


    const formatDate = (inputDate) => {
        // Split the input date by '/'
        const parts = inputDate.split('/');

        // Ensure parts are in the correct order (assuming input is DD/MM/YYYY)
        const formattedDate = `${parts[1]}/${parts[0]}/${parts[2]}`;

        return formattedDate;
    };

console.log('lessonPlan...',comments)
    return (
        <View>
            <BackHeader
                title='Lesson Plan'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView style={{
                backgroundColor: colors.background,
                width: '100%',
            }}>
                <View style={{ ...appStyles.main, backgroundColor: colors.background }}>
                    <View style={{ flexDirection: 'row', marginTop: 15, alignSelf: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ ...TextStyles.headerText, color: colors.text }}>Your Lesson Plan is here!</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Image
                                // source={Images.lessonPlan}
                                source={Images.lessonPlan2}
                                style={{
                                    height: moderateScale(75),
                                    width: moderateScale(75),
                                    marginTop: -5,
                                    opacity: 0.6
                                }}
                            />
                        </View>
                    </View>
                    {/* <TitleHeader
                        title={'Your Lesson Plan is here!'}
                        image={Images.lessonPlan}
                    /> */}
                     {skloader ? <ActivityIndicator size={24} />:
                    <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 20 }}>
                        <Pressable
                            onPress={() => setMondayDate(getDateAfterXDays(MondayDate, -7))}
                        >
                            <Image
                                source={Images.leftArrow}
                                style={{
                                    height: moderateScale(17),
                                    width: moderateScale(17),
                                    marginTop: 2,
                                    tintColor: colors.text
                                }}
                            />
                        </Pressable>

                        {MondayDate && <Text style={{ ...TextStyles.title2, marginHorizontal: 10, opacity: 0.7, color: colors.text }}>{MondayDate} - {getDateAfterXDays(MondayDate, 6)}</Text>}
                        <Pressable
                            onPress={() => setMondayDate(getDateAfterXDays(MondayDate, 7))}
                        >
                            <Image
                                source={Images.leftArrow}
                                style={{
                                    height: moderateScale(17),
                                    width: moderateScale(17),
                                    transform: [{ rotate: '180deg' }],
                                    marginTop: 2,
                                    tintColor: colors.text
                                }}
                            />
                        </Pressable>

                    </View>}
                    {skloader?<SkeletonList />:
                    <View style={{ marginTop: 20 }}>
                        {/* {console.log('lesonplan...', lessonPlan)} */}
                        {days.map((item, index) => {
                            return (
                                <View key={index} style={{ ...appStyles.card, backgroundColor: colors.background, borderColor: colors.lightBlck,overflow:'hidden' }}>
                                    <View style={{ ...appStyles.titleRow, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.lightGreen }}>
                                        <Text style={{ ...TextStyles.title2, color: colors.text }}>{item.day} ({MondayDate ? getDateAfterXDays(MondayDate, index) : null})</Text>
                                        {lessonPlan[index]?.id && <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 2 }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setOpenModal(true);
                                                    setCurrItem(lessonPlan[index]);
                                                    getLessonPlan('2', lessonPlan[index]?.id);
                                                    getLessonPlan('3', lessonPlan[index]?.id);
                                                    // setCurrDay({...lessonPlan[index],day:item.day,date:getDateAfterXDays(MondayDate, index)});
                                                }}
                                            >
                                                <Image
                                                    source={Images.eye}
                                                    style={{
                                                        height: 20,
                                                        width: 20,
                                                        tintColor: colors.text
                                                    }}
                                                />
                                            </TouchableOpacity>
                                        </View>}
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        {/* <View style={{ ...styles.itmRow, marginVertical: 5 }}>
                                            <Text style={{ ...styles.classHeader, flex: 4.5 }}>Subject</Text>
                                            <Text style={{ ...styles.classHeader, flex: 3.5 }}>Time</Text>
                                            <View style={{ flex: 2.2, alignItems: 'flex-end' }}>
                                                <Text style={{ ...styles.classHeader }}>Syllabus</Text>
                                            </View>
                                        </View> */}
                                        {/* {item.table.map((itm, ind) => {
                                            return (
                                                <View style={styles.itmRow}>
                                                    <Text style={{ ...styles.classText, flex: 4.5 }}>{itm.time}</Text>
                                                    <Text style={{ ...styles.classText, flex: 3.5 }}>{itm.subject}</Text>
                                                    <View style={{ flex: 2.2, alignItems: 'flex-end' }}>
                                                        <Text style={{ ...styles.classText }}>{itm.roomNo}</Text>
                                                    </View>
                                                </View>
                                            )
                                        })} */}
                                        {/* {console.log('lessonPlan[index]?.id...',lessonPlan[index]?.id)} */}
                                        {lessonPlan[index]?.id && <View>
                                            <View style={appStyles.itmRow}>
                                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Subject</Text>
                                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{lessonPlan[index]?.subject_name}</Text>
                                            </View>
                                            <View style={appStyles.itmRow}>
                                                <Text style={{ ...TextStyles.keyText, color: colors.text }}>Time</Text>
                                                <Text style={{ ...TextStyles.valueText, color: colors.text }}>{lessonPlan[index]?.time_from}-{lessonPlan[index]?.time_to}</Text>
                                            </View>
                                        </View>}
                                        {!lessonPlan[index]?.id && <Text style={{ color: 'red', marginTop: 20, alignSelf: 'center' }}>Not Scheduled</Text>}
                                    </View>
                                </View>
                            )
                        })}
                    </View>}
                </View>
                <Modal
                    visible={openModal}
                    transparent
                >
                    <KeyboardAwareScrollView
                    // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    // style={{ flex: 1 }}
                    >
                        <View style={styles.modal}>
                            <View style={{ ...styles.popup, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                <ScrollView showsVerticalScrollIndicator={false} style={{}}>
                                    <View>
                                        <Text style={{ ...TextStyles.title2, textAlign: 'center', color: colors.text }}>Lesson Plan</Text>
                                        <TouchableOpacity onPress={() => setOpenModal(false)}
                                            style={{ position: 'absolute', right: 0, top: 0, padding: 5 }}
                                        >
                                            <Image
                                                source={Images.close}
                                                style={{
                                                    height: moderateScale(12),
                                                    width: moderateScale(12),
                                                    marginTop: 2,
                                                    tintColor: colors.text,
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ marginTop: 20 }}>
                                        {/* <Text style={TextStyles.title2}></Text> */}
                                        <View style={{ ...appStyles.itmRow, marginTop: 10 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Class</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.cname}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmRow, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Subject</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.subname}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmRow, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Date</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.date} {planDetails?.time_from} To {planDetails?.time_to}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmRow, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Lesson</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.lessonname}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmRow, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Topic</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.topic_name}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmRow, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Sub Topic</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.sub_topic}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmcol, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>General Objective</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.general_objectives}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmcol, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Teaching Method</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.teaching_method}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmcol, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Previous Knowledge</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.previous_knowledge}</Text>
                                        </View>
                                        <View style={{ ...appStyles.itmcol, marginTop: 2,display:planDetails?.comprehensive_questions?'flex':'none' }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Comprehensive Questions</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.comprehensive_questions}</Text>
                                        </View>
                                        {/* <View style={{ ...appStyles.itmRow, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Presentation</Text>
                                            <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.presentation}</Text>
                                        </View> */}
                                    </View>
                                       <View style={{ ...appStyles.itmRow, marginTop: 2,paddingBottom:5}}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Presentation</Text>
                                       </View>
                                         <RenderHTML source={{html: planDetails?.presentation}} />
                                       {/* <Text style={{ ...TextStyles.valueText, color: colors.text }}>{planDetails?.presentation}</Text> */}

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={{ ...TextStyles.title2, color: colors.text }}>Comment</Text>
                                        <TextInput
                                                placeholder="Write your comment here"
                                                placeholderTextColor="grey"
                                                numberOfLines={4}
                                                multiline
                                                value={comment}
                                                onChangeText={(text) => setComment(text)}
                                                style={[
                                                    styles.input,
                                                    {
                                                    backgroundColor: colors.background,
                                                    borderColor: colors.lightBlck,
                                                    color: colors.text,
                                                    },
                                                ]}
                                                />
                                        <TouchableOpacity
                                        disabled={loading?true:false}
                                            style={{ padding: 8, backgroundColor:Colors.green2, minWidth: 100, borderRadius: 10, alignSelf: 'flex-end', marginTop: 25 }}
                                            onPress={() => comment.length?  getLessonPlan('5'):''}
                                        // style={{ ...appStyles.btn, marginTop: 20 }}
                                        >
                                            <Text style={{ ...appStyles.btnText, textAlign: 'center' }}>{loading ? <ActivityIndicator size={24} color={Colors.white} />: 'Send'}</Text>
                                        </TouchableOpacity>
                                        {loading ? <ActivityIndicator size={24} />:null}
                                        {comments?.length > 0 && comments.map((item, index) => {
                                            return (
                                                <View style={{ marginVertical: 5 }}>
                                                    <View style={{ ...styles.messageBox, backgroundColor: colors.background,borderWidth:1,borderColor:Colors.lightBlck, overflow:'hidden' }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 5 }}>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <Image
                                                                    source={item.type == 'student' ? { uri: item.student_profile_image } : { uri:imageBaseUrl+item.staff_profile_image }}
                                                                    style={{
                                                                        height: 30,
                                                                        width: 30,
                                                                        borderRadius: 30,
                                                                        marginRight: 5,
                                                                        // marginTop:5
                                                                    }}
                                                                />
                                                                <View>
                                                                    <Text style={{ ...TextStyles.title2, color: colors.text }}>{item.type == 'student' ? (item?.firstname + ' ' + item.lastname + ' ' + item.admission_no) : item.staff_name}</Text>
                                                                    <Text style={{ ...TextStyles.valueText, color: colors.text }}>{item.message}</Text>
                                                                </View>
                                                            </View>
                                                            <View style={{ marginTop: 2 }}>
                                                                {userData?.student_id == item.student_id && <TouchableOpacity
                                                                   onPress={() => {
                                                                            Alert.alert(
                                                                                "Confirmation",
                                                                                "Are you sure you want to proceed?",
                                                                                [
                                                                                    {
                                                                                        text: "Cancel",
                                                                                        style: "cancel"
                                                                                    },
                                                                                    {
                                                                                        text: "OK",
                                                                                        onPress: () => getLessonPlan('4', '', item.fourm_id)
                                                                                    }
                                                                                ]
                                                                            );
                                                                   }}
                                                                    style={{ alignSelf: 'flex-end' }}
                                                                >
                                                                    <Image
                                                                        source={Images.delete}
                                                                        style={{
                                                                            height: 16,
                                                                            width: 16,
                                                                            tintColor: colors.text
                                                                        }}
                                                                    />
                                                                </TouchableOpacity>}
                                                            </View>
                                                        </View>
                                                        <Text style={{ marginTop: 10, textAlign: 'right', color: colors.text }}>{item.created_date}</Text>
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </Modal>
                {/* {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />} */}

                {/* {!loading && lessonPlan.length == 0 && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
                    <Image
                        source={Images.NoDataFound}
                        style={{
                            height: moderateScale(60),
                            width: moderateScale(60),
                            opacity: 0.5
                            // marginTop:-15
                        }}
                    />
                    <Text style={{ fontSize: moderateScale(14), marginTop: 10 }}>No records found!</Text>
                </View>} */}
            </ScrollView>
        </View>
    )
}

export default LessonPlan

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
        opacity: 0.6,
        marginTop: 3
    },
    classHeader: {
        fontSize: moderateScale(11),
        color: Colors.black,
        fontWeight: '500',
        // opacity: 0.8
    },
    modal: {
        backgroundColor: Colors.semiTransparent,
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    popup: {
        minHeight: screenHeight / 3,
        maxHeight: screenHeight / 1.2,
        width: screenWidth * 0.9,
        maxWidth: maxWidth,
        backgroundColor: Colors.white2,
        padding: 10
    },
    input: {
        marginTop: 10,
        height: 120, 
        width:'100%',
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'black', 
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: textSize(12),
        color: 'black',
        textAlignVertical: 'top',
      },
    messageBox: {
        // marginHorizontal: -10,
        backgroundColor: Colors.lightGrey,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
    },
})