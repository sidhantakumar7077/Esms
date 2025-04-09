import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Colors } from '../../Constants/Colors'
import { moderateScale, screenHeight } from '../../Constants/PixelRatio'
import { TextStyles, appStyles } from '../../Constants/Fonts'
import { useSelector } from 'react-redux'
import { useTheme } from '@react-navigation/native';
import profileStyle from './profilestyles';
import ImageModal from '../CommonComponent/ImageModal'


// const PersonalData = {
//     admissionDate:'05/11/2023',
//     DOB:'03/12/2011',
//     Gender:'Male',
//     Category:'General',
//     MobileNo:'9867687868',
//     Cast:Thomas,
//     Religion:'Christen',
//     Email:'thomasedward123@gmail.com',
//     currentAddress:'56 Main Street, Suite 3, Brooklyn, NY 11210-0000',
//     permanentAddress:'56 Main Street, Suite 3, Brooklyn, NY 11210-0000',

// }


const PersonalDetails = () => {
    const { userData, profileData } = useSelector(state => state.User);
    const {colors} = useTheme();
    const [modalVisibleFather, setModalVisibleFather] = useState(false);
    const [modalVisibleMother, setModalVisibleMother] = useState(false);
    const [modalVisibleParent, setModalVisibleParent] = useState(false);



    // useEffect(()=>{
        // console.log(profileData?.parents,"hey.................");
    // },[]);

    return (
        <ScrollView style={{backgroundColor:colors.background,marginBottom:100}}>
        <View style={{ padding: 15, backgroundColor: colors.background, minHeight: 600 }}>
            {profileData?.personal && <View>
                {userData.type == 'student' && <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Admission Date</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.admission_date}</Text>
                </View>}
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Date Of Birth</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.date_of_birth}</Text>
                </View>
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Gender</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.gender}</Text>
                </View>
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Caste</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.others.cast}</Text>
                </View>
                {/* <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Category</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.category || 'NA'}</Text>
                </View> */}
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Mobile Number</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.phone || 'NA'}</Text>
                </View>
                {/* {userData.type == 'student' && <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Caste</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.cast || 'NA'}</Text>
                </View>} */}
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Religion</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.religion || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Email</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.email || 'NA'}</Text>
                </View>
               
               {/* {userData.type == 'student' && <View>
                    <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Blood Group</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.bloodGroup || 'NA'}</Text>
                    </View>
                    <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Height</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.height || 'NA'}</Text>
                    </View>
                    <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Weight</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.weight || 'NA'}</Text>
                    </View>
                    <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Medical History</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.medicalHistory || 'NA'}</Text>
                    </View>
                </View>} */}
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Note</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.note || 'NA'}</Text>
                    </View>
               {userData.type == 'driver' && <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Driving Experience</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.work_experience || 'NA'}</Text>
                </View>}
            </View>}

           
            {profileData?.personal && profileData?.parents && profileData?.guardian&&
            <>
             {/* ADDRESS DETAILS SECTION START */}
            <View style={profileStyle.headerView}>
                <Text style={profileStyle.addressTextStyle}>Address Details</Text>
            </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Current Address</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.student_address || 'NA'}</Text>
                    </View>
                <View style={appStyles.itmRow}>
                    <Text style={{...TextStyles.keyText,color:colors.text}}>Permanent Address</Text>
                    <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData.personal.student_address || 'NA'}</Text>
                </View>
                {/* ADDRESS DETAILS SECTION END  */}
                <View style={profileStyle.headerView}>
                    <Text style={profileStyle.addressTextStyle}>Parent Guardian Detail</Text>
                </View>

                {/* ---Father details start--- */}
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Father Image</Text>
                        <Pressable onPress={() => setModalVisibleFather(true)}>
                        <Image
                        source={{uri:profileData?.parents.father.father_image}}
                        style={{
                            height: moderateScale(70),
                            width: moderateScale(70),
                            // borderRadius: moderateScale(70),
                            borderWidth: 0.5,
                            borderColor: colors.text
                        }}
                        />
                        </Pressable>
                         <ImageModal
                            visible={modalVisibleFather}
                            setVisible={setModalVisibleFather}
                            imageUrl={profileData?.parents.father.father_image}
                            onClose={() => setModalVisibleFather(false)}
                        />
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Father Name</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.parents.father.father_name || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Father Phone</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.parents.father.father_phone || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Father Occupation</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.parents.father.father_occupation || 'NA'}</Text>
                </View>
                {/* ---Father details end--- */}
                <View style={profileStyle.divider}/>
                {/* ---Mother details start--- */}
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Mother Image</Text>
                        <Pressable onPress={() => setModalVisibleMother(true)}>
                        <Image
                        source={{uri:profileData?.parents.mother.mother_image}}
                        style={{
                            height: moderateScale(70),
                            width: moderateScale(70),
                            // borderRadius: moderateScale(70),
                            borderWidth: 0.5,
                            borderColor: colors.text
                        }}
                        />
                        </Pressable>
                         <ImageModal
                            visible={modalVisibleMother}
                            setVisible={setModalVisibleMother}
                            imageUrl={profileData?.parents.mother.mother_image}
                            onClose={() => setModalVisibleMother(false)}
                        />
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Mother Name</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.parents.mother.mother_name || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Mother Phone</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.parents.mother.mother_phone || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Mother Occupation</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.parents.mother.mother_occupation || 'NA'}</Text>
                </View>
                {/* ---Mother details end--- */}
                <View style={profileStyle.divider}/>
                {/* ---Guardian details start--- */}
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Image</Text>
                        <Pressable onPress={() => setModalVisibleParent(true)}>
                        <Image
                        source={{uri:profileData?.guardian.guardian_image}}
                        style={{
                            height: moderateScale(70),
                            width: moderateScale(70),
                            // borderRadius: moderateScale(70),
                            borderWidth: 0.5,
                            borderColor: colors.text
                        }}
                        />
                        </Pressable>
                         <ImageModal
                            visible={modalVisibleParent}
                            setVisible={setModalVisibleParent}
                            imageUrl={profileData?.guardian.guardian_image}
                            onClose={() => setModalVisibleParent(false)}
                        />
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Name</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_name || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Email</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_email || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Email</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_email || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Relation</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_relation || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Phone</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_phone || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Occupation</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_occupation || 'NA'}</Text>
                </View>
                <View style={appStyles.itmRow}>
                        <Text style={{...TextStyles.keyText,color:colors.text}}>Guardian Address</Text>
                        <Text style={{...TextStyles.valueText,color:colors.text}}>{profileData?.guardian?.guardian_address || 'NA'}</Text>
                </View>
                 {/* ---Guardian details start--- */}

                <View>

                </View>
                </>
                }
            
          
        </View>
        </ScrollView>
    )
}

export default PersonalDetails;