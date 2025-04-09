
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../Components/BackHeader';
import { TextStyles, appStyles } from '../Constants/Fonts';
import TitleHeader from '../Components/TitleHeader';
import { Images } from '../Constants/Images';
import { maxWidth, moderateScale, screenHeight, screenWidth } from '../Constants/PixelRatio';
import { Colors } from '../Constants/Colors';
import NavigationService from '../Services/Navigation';
import UseApi from '../ApiConfig';
import { useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import { useTheme } from '@react-navigation/native';

// const subjectList = [
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
//     { subject: 'Bengali theory (BEN01)', time: 'Friday (12:55 AM To 01:35 AM', roomNo: '3' },
// ]
// const myTeachers = [
//     { name: 'Sandip Bera (103)', email: 'example@gmail.com', comment: 'comment...', contact: '9999999999', rating: 4 },
//     { name: 'Santanu Das (104)', email: 'example@gmail.com', comment: 'comment...', contact: '9999999899', rating: 4 },
//     { name: 'Santanu Das (104)', email: 'example@gmail.com', comment: 'comment...', contact: '9999999899', rating: 4 },
//     { name: 'Santanu Das (104)', email: 'example@gmail.com', comment: 'comment...', contact: '9999999899', rating: 4 },
//     { name: 'Santanu Das (104)', email: 'example@gmail.com', comment: 'comment...', contact: '9999999899', rating: 4 },
//     { name: 'Santanu Das (104)', email: 'example@gmail.com', comment: 'comment...', contact: '9999999899', rating: 4 },
//     { name: 'Santanu Das (104)', email: 'example@gmail.com', comment: 'comment....', contact: '9999999899', rating: 4 },

// ]

const TeacherReview = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openRatingModal, setOpenRatingModal] = useState(false);
    const [currRating, setCurrRating] = useState(2);
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState({ rating: '', comment: '' });

    const { Request } = UseApi();
    const {colors} = useTheme();
    const { userData, profileData } = useSelector(state => state.User);
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [currTeacher, setCurrTeacher] = useState(null);
    const [currStaffId,setCurrStaggId] = useState(null);


    useEffect(() => {
        getTeachers();
    }, []);

    const getTeachers = async (hideLoading) => {
        if (!hideLoading) {
            setLoading(true);
        }
        let params = {
            id: userData?.id,
            type: '1'
        }

        let data;
        try {
            data = await Request('teacher-review', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
 
        if (data?.status && data?.data) {
            setTeachers(data?.data);
        }
        if (!hideLoading) {
            setLoading(false);
        }
    }

    const addRating = async () => {
        setLoading(true);
        let params = {
            id: userData?.student_id,
            user_id: userData?.id,
            staff_id:currStaffId,
            type: '2',
            comment: comment,
            rate: currRating,
            role: 'student',
        }

        let data;
        try {
            data = await Request('teacher-review', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
       
        if (data?.status) {
            Toast.show('Rating added successfully !');
            setOpenRatingModal(false);
            getTeachers(true);
        }
        setLoading(false);
    }
     
    return (
        <View>
            <BackHeader
                title='Teacher Reviews'
                onBackIconPress={() => {
                    NavigationService.navigate('Home');
                }}
            />
            <ScrollView
                style={{
                    backgroundColor: colors.background,
                    width: '100%',
                }}
            >
                <View style={{...appStyles.main,backgroundColor:colors.background}}>
                    <TitleHeader
                        title={'Your Teacher Reviews are here!'}
                        image={Images.reviewteacher}
                        imageStyle={{
                            height: moderateScale(40),
                            width: moderateScale(40),
                            marginRight: 10
                        }}
                    />
                    <View style={{ marginTop: 20 }}>
                        {teachers.map((item, index) => {
                            return (
                                <View key={index} style={{...appStyles.card,backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                    <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
                                        <View style={{ flex: 0.7 }}>
                                            <Image
                                                source={Images.fatherImage}
                                                style={{
                                                    height: 55,
                                                    width: 55,
                                                    borderRadius: 55,
                                                }}
                                            />
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500',color:colors.text }}>{item.teacher_name}</Text>
                                            <View style={{ flexDirection: 'row', gap: 5, marginTop: 2 }}>
                                                <Image
                                                    source={Images.email}
                                                    style={{
                                                        height: 12,
                                                        width: 12,
                                                        marginTop: 5,
                                                        tintColor:colors.text
                                                    }}
                                                />
                                                <Text style={{ fontSize: 13,color:colors.text }} numberOfLines={1}>{item.email}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 5 }}>
                                                <Image
                                                    source={Images.phoneCall}
                                                    style={{
                                                        height: 12,
                                                        width: 12,
                                                        marginTop: 5,
                                                        tintColor:colors.text
                                                    }}
                                                />
                                                <Text style={{ fontSize: 13,color:colors.text }}>{item.phone || 'NA'}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1.2 }}>
                                            <View style={{ borderWidth: 1, marginTop: 15, padding: 2, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.Green1 }}>
                                                <Text style={{ fontSize: 13, fontWeight: '500', paddingBottom: 1 }}>Class Teacher</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Commment</Text>
                                            <Text style={{ flex: 1,color:colors.text }} numberOfLines={1}>{item.comment || 'NA'}</Text>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>My Rating</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                                {/* <Image
                                                    source={Images.rating}
                                                    style={{
                                                        height: 15,
                                                        width: 15,
                                                        marginTop: 2,
                                                        // tintColor:Colors.tangerine
                                                    }}
                                                /> */}

                                                {item.rate_value && <View style={{ flexDirection: 'row', gap: 5 }}>
                                                    {[1, 1, 1, 1, 1].map((itm, index) => {
                                                        return (
                                                            <Pressable>
                                                                <Image
                                                                    source={index < item?.rate_value ? Images.rating : Images.ratingBlank}
                                                                    style={{
                                                                        height: moderateScale(12),
                                                                        width: moderateScale(12),
                                                                        tintColor:index < item?.rate_value ?null:colors.text,
                                                                    }}
                                                                />
                                                            </Pressable>
                                                        )
                                                    })}
                                                </View>}
                                                {!item.rate_value && <TouchableOpacity style={{ flexDirection: 'row', columnGap: 10 }}
                                                    onPress={() => {
                                                        setCurrRating(item.rate_value);
                                                        setCurrStaggId(item.staff_id);
                                                        setOpenRatingModal(true);
                                                    }}>
                                                    <Text style={{}}>NA</Text>
                                                    <Image
                                                        source={Images.add}
                                                        style={{
                                                            height: 15,
                                                            width: 15,
                                                            marginTop: 2,
                                                        }}
                                                    />
                                                    {/* <TouchableOpacity style={{ borderRadius: 5, borderWidth: 1, backgroundColor: Colors.Green1, paddingHorizontal: 5 }}>
                                                    </TouchableOpacity> */}
                                                </TouchableOpacity>}

                                            </View>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{ ...TextStyles.keyText, color: colors.text }}>Subjects</Text>
                                            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', gap: 5 }}
                                                onPress={() => {
                                                    setOpenModal(true);
                                                    setCurrTeacher(item);
                                                }}
                                            >
                                                <Image
                                                    source={Images.eye}
                                                    style={{
                                                        height: 18,
                                                        width: 18,
                                                        marginTop: 1,
                                                        tintColor:colors.text
                                                    }}
                                                />
                                                <Text style={{ fontSize: 13, color: Colors.blue }}>View</Text>
                                            </TouchableOpacity>
                                            {/* <Text style={{ flex: 1 }}>{item.comment}</Text> */}
                                        </View>
                                    </View>
                                </View>
                            )
                        })}

                        {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />}

                        {!loading && teachers.length == 0 && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
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

                        {/* {myTeachers.map((item, index) => {
                            return (
                                <View key={index} style={appStyles.card}>
                                    <View style={styles.titleRow}>
                                        <View style={{ flex: 1 }}>
                                            <Image
                                                source={Images.fatherImage}
                                                style={{
                                                    height: 55,
                                                    width: 55,
                                                    borderRadius: 55,
                                                }}
                                            />
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                                            <View style={{ flexDirection: 'row', gap: 5, marginTop: 2 }}>
                                                <Image
                                                    source={Images.email}
                                                    style={{
                                                        height: 12,
                                                        width: 12,
                                                        marginTop: 5
                                                    }}
                                                />
                                                <Text style={{ fontSize: 13 }}>{item.email}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 5 }}>
                                                <Image
                                                    source={Images.phoneCall}
                                                    style={{
                                                        height: 12,
                                                        width: 12,
                                                        marginTop: 5
                                                    }}
                                                />
                                                <Text style={{ fontSize: 13 }}>{item.contact}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 1.2 }}>
                                            <View style={{ borderWidth: 1, marginTop: 15, padding: 2, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.Green1 }}>
                                                <Text style={{ fontSize: 13, color: Colors.white2, fontWeight: '500', paddingBottom: 1 }}>Class Teacher</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        <View style={appStyles.itmRow}>
                                            <Text style={TextStyles.keyText}>Commment</Text>
                                            <Text style={{ flex: 1 }}>{item.comment}</Text>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={TextStyles.keyText}>My Rating</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
                                                <View style={{ flexDirection: 'row', gap: 5 }}>
                                                    {[1, 1, 1, 1, 1].map((item, index) => {
                                                        return (
                                                            <Pressable onPress={() => setCurrRating(index + 1)}>
                                                                <Image
                                                                    source={index < currRating ? Images.rating : Images.ratingBlank}
                                                                    style={{
                                                                        height: moderateScale(12),
                                                                        width: moderateScale(12),
                                                                    }}
                                                                />
                                                            </Pressable>
                                                        )
                                                    })}
                                                </View>
                                                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => setOpenRatingModal(true)}>
                                                    <Image
                                                        source={Images.edit}
                                                        style={{
                                                            height: 13,
                                                            width: 13,
                                                            marginTop: 2,
                                                        }}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={TextStyles.keyText}>Subjects</Text>
                                            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', gap: 5 }}
                                                onPress={() => setOpenModal(true)}
                                            >
                                                <Image
                                                    source={Images.eye}
                                                    style={{
                                                        height: 18,
                                                        width: 18,
                                                        marginTop: 1
                                                    }}
                                                />
                                                <Text style={{ fontSize: 13, color: Colors.blue }}>View</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )
                        })} */}
                    </View>
                </View>
            </ScrollView>
            <Modal
                visible={openModal}
                transparent
            >
                <View style={styles.modal}>
                    <View style={{...styles.popup,backgroundColor:colors.background,borderColor: colors.lightBlck, borderWidth: 0.5}}>
                        <View>
                            <Text style={{ ...TextStyles.title2, textAlign: 'center',color:colors.text }}>Subject List</Text>
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
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <Text style={{ flex: 1, ...TextStyles.title3,color:colors.text }}>Subject</Text>
                            <Text style={{ flex: 1, ...TextStyles.title3, textAlign: 'center',color:colors.text }}>Time</Text>
                            <Text style={{ flex: 1, ...TextStyles.title3, textAlign: 'center',color:colors.text }}>Room No</Text>
                        </View>
                        <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
                            {currTeacher && currTeacher?.subjects.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                            <Text style={{ flex: 1, fontSize: 15,color:colors.text }}>{item}</Text>
                                            <Text style={{ flex: 1, fontSize: 15,color:colors.text }}>{currTeacher?.time[index]}</Text>
                                            <Text style={{ flex: 1, textAlign: 'center', fontSize: 15,color:colors.text }}>{currTeacher?.room_no[index]}</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={openRatingModal}
                transparent
            >
                <View style={styles.modal}>
                    <View style={{ ...styles.popup, height: 250,backgroundColor:colors.background }}>
                        <View>
                            <Text style={{ ...TextStyles.title2, textAlign: 'center',color:colors.text }}>Rate Your Teacher</Text>
                            <TouchableOpacity onPress={() => setOpenRatingModal(false)}
                                style={{ position: 'absolute', right: 0, top: 0, padding: 5 }}
                            >
                                <Image
                                    source={Images.close}
                                    style={{
                                        height: moderateScale(12),
                                        width: moderateScale(12),
                                        marginTop: 2,
                                        tintColor: colors.text
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                <Text style={{...TextStyles.title2,color:colors.text}}>Rating<Text style={{ color: Colors.red1 }}>*</Text></Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    {[1, 1, 1, 1, 1].map((item, index) => {
                                        return (
                                            <Pressable onPress={() => setCurrRating(index + 1)}>
                                                <Image
                                                    source={index < currRating ? Images.rating : Images.ratingBlank}
                                                    style={{
                                                        height: moderateScale(22),
                                                        width: moderateScale(22),
                                                        tintColor:index <currRating ? null : colors.text
                                                    }}
                                                />
                                            </Pressable>
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <View style={{}}>
                                <Text style={{...TextStyles.title2,color:colors.text}}>Commment<Text style={{ color: Colors.red1 }}>*</Text></Text>
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                    <TextInput
                                        placeholder='Write your comment...'
                                        style={appStyles.intput}
                                        value={comment}
                                        onChangeText={text => {
                                            setComment(text)
                                            if (errors.comment) {
                                                setErrors(pre => ({ ...pre, comment: '' }));
                                            }
                                        }}
                                    />
                                    {errors.comment && <Text style={{ color: Colors.red1 }}>{errors.comment}</Text>}
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ padding: 8, backgroundColor: Colors.green2, minWidth: 100, borderRadius: 10, alignSelf: 'flex-end', marginTop: 25 }}
                            onPress={addRating}
                        // style={{ ...appStyles.btn, marginTop: 20 }}
                        >
                            <Text style={{ ...appStyles.btnText, textAlign: 'center', }}>{loading?'Saving...':'Save'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
        </View>
    )
}

export default TeacherReview

const styles = StyleSheet.create({
    titleRow: {
        backgroundColor: Colors.lightGreen2,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        gap: 20,
        // borderBottomEndRadius: 0,
        // borderBottomStartRadius: 0,
        flexDirection: 'row',
        // justifyContent: 'space-between'
    },
    modal: {
        backgroundColor: Colors.semiTransparent,
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    popup: {
        height: screenHeight / 1.3,
        width: screenWidth * 0.9,
        maxWidth: maxWidth,
        backgroundColor: Colors.white2,
        padding: 10
    },
})