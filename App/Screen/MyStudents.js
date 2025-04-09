import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import BackHeader from '../Components/BackHeader';
import { TextStyles, appStyles } from '../Constants/Fonts';
import TitleHeader from '../Components/TitleHeader';
import { Images } from '../Constants/Images';
import { moderateScale, screenHeight } from '../Constants/PixelRatio';
import { Colors } from '../Constants/Colors';
import NavigationService from '../Services/Navigation';
import UseApi from '../ApiConfig';
import { useSelector } from 'react-redux';
import { useTheme } from '@react-navigation/native';

const mystudents = [
    { name: 'Sandip Bera', stopage: 'Itaberriya', class: 'class 3(A)', contact: '9999999999' },
    { name: 'Santanu Das', stopage: 'Itaberriya', class: 'class 4(A)', contact: '9999999899' },
    { name: 'Santanu Das', stopage: 'Itaberriya', class: 'class 4(A)', contact: '9999999899' },
    { name: 'Santanu Das', stopage: 'Itaberriya', class: 'class 4(A)', contact: '9999999899' },
    { name: 'Santanu Das', stopage: 'Itaberriya', class: 'class 4(A)', contact: '9999999899' },
    { name: 'Santanu Das', stopage: 'Itaberriya', class: 'class 4(A)', contact: '9999999899' },
    { name: 'Santanu Das', stopage: 'Itaberriya', class: 'class 4(A)', contact: '9999999899' },
]

const MyStudents = () => {
    const { Request } = UseApi();
    const { userData, profileData } = useSelector(state => state.User);
    // const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [studentList, setStudentList] = useState([]);
    const { colors } = useTheme();

    useEffect(() => {
        getStudentList();
    }, []);

    const getStudentList = async () => {

        setLoading(true);
        let params = {
            driver_id: userData?.id,
        }

        let data;
        try {
            data = await Request('std-list-drive-id', 'POST', params);
        } catch (err) {
            console.log('err2....', err);
        }
        console.log('data...', data);
        if (data?.status && data?.data) {
            setStudentList(data?.data);
        }

        setLoading(false);
    }
    return (
        <View>
            <BackHeader
                title='My Students'
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
                        title={'The Studens on your journey are here!'}
                        image={Images.transportRoutes}
                        imageStyle={{
                            height: moderateScale(70),
                            width: moderateScale(120),
                        }}
                    />
                    <View style={{ marginTop: 20 }}>
                        {studentList.map((item, index) => {
                            return (
                                <View key={index} style={{ ...appStyles.card, backgroundColor: colors.background, borderColor: colors.lightBlck, borderWidth: 0.5 }}>
                                    <View style={{ ...appStyles.titleRow, backgroundColor: colors.lightGreen }}>
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
                                        <View style={{ flex: 3 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500',color:colors.text }}>{item.firstname} {item.lastname}</Text>
                                            <Text style={{ fontSize: 15,color:colors.text }}>{item.pickup_point}</Text>
                                        </View>
                                    </View>
                                    <View style={{ padding: 15, paddingTop: 5 }}>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{...TextStyles.keyText,color:colors.text}}>Class</Text>
                                            <Text style={{...TextStyles.valueText,color:colors.text}}>{item.class_namr}</Text>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{...TextStyles.keyText,color:colors.text}}>Father Name</Text>
                                            <Text style={{...TextStyles.valueText,color:colors.text}}>{item.father_name}</Text>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Name</Text>
                                            <Text style={{...TextStyles.valueText,color:colors.text}}>{item.guardian_name}</Text>
                                        </View>
                                        <View style={appStyles.itmRow}>
                                            <Text style={{...TextStyles.keyText,color:colors.text}}>Contact</Text>
                                            <Text style={{...TextStyles.valueText,color:colors.text}}>{item.guardian_phone}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>

                    {loading && <ActivityIndicator size={28} style={{ marginTop: screenHeight / 3 }} />}

                    {!loading && studentList?.length == 0  && <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
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
                        <Text style={{ fontSize: moderateScale(14), marginTop: 10, color: colors.text, opacity: 0.6 }}>No records found!</Text>
                    </View>}
                </View>
            </ScrollView>
        </View>
    )
}

export default MyStudents

const styles = StyleSheet.create({
    titleRow: {
        backgroundColor: Colors.lightGreen2,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        // borderBottomEndRadius: 0,
        // borderBottomStartRadius: 0,
        flexDirection: 'row',
        // justifyContent: 'space-between'
    }
})