import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {Colors} from '../../Constants/Colors';
import {TextStyles, appStyles} from '../../Constants/Fonts';
import {Images} from '../../Constants/Images';
import {moderateScale, screenHeight} from '../../Constants/PixelRatio';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import PersonalDetails from '../../Components/ProfileDetails/PersonalDetails';
import ParentDetails from '../../Components/ProfileDetails/ParentDetails';
import Others from '../../Components/ProfileDetails/Others';
import UseApi from '../../ApiConfig';
import {useDispatch, useSelector} from 'react-redux';
import {setProfileData} from '../../Redux/reducer/User';
import {useTheme} from '@react-navigation/native';
import ProfileFees from '../../Components/ProfileDetails/ProfileFees';
import ProfileDocuments from '../../Components/ProfileDetails/ProfileDocuments';
const { width, height } = Dimensions.get('screen');


const Tab = createMaterialTopTabNavigator();
const Profile = () => {
  const {Request} = UseApi();
  const {colors} = useTheme();
  const {userData, profileData} = useSelector(state => state.User);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [feeDetails, setFeeDetails] = useState(false);

  useEffect(() => {
    getProfileDetails();
    // getFeesStructure();
  }, []);

  const getProfileDetails = async () => {
    setLoading(true);
    let params = {
      user_id: userData.id,
      type: userData.type,
      // id: '1',
    };

    let data;
    try {
      data = await Request('profile-details', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }
    if (data?.status && data?.data) {
      dispatch(
        setProfileData({
          personal: data.data.personal,
          parents: data.data.parents,
          guardian: data.data.guardian,
          others: data.data.others,
          document:data?.data?.document
        }),
      );
    }
    setLoading(false);
  };
  const getFeesStructure = async () => {
    setLoading(true);
    let params = {
      user_id: userData.id,
    };

    let data;
    try {
      data = await Request('feesList', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    };
    if (data?.status && data?.data) {
      setFeeDetails(data?.data)
    }
    setLoading(false);
  };

  return (
    <View style={{}}>
      <BackHeader
        title="Profile"
        onBackIconPress={() => {
          NavigationService.navigate('Home');
        }}
      />
      <View
        style={{
          backgroundColor: colors.background,
          width: '100%',
        }}>
        <View
          style={{
            ...appStyles.main,
            marginBottom: 0,
            backgroundColor: colors.background,
          }}>
          <View style={styles.profileHead}>
            <View style={{flex: 2}}>
              <Text style={{...TextStyles.headerText, color: colors.text}}>
                {profileData?.personal?.name}
              </Text>
              {userData?.type == 'student' && (
                <>
                  {/* <Text style={styles.detailsText}>class 3(A) 2023-24</Text> */}
                  <Text style={{...styles.detailsText, color: colors.text}}>
                    {profileData?.personal?.class} (
                    {profileData?.personal?.section})
                  </Text>
                  <Text style={{...styles.detailsText, color: colors.text}}>
                    Admission Date: {profileData?.personal?.admission_date}
                  </Text>
                  <Text style={{...styles.detailsText, color: colors.text}}>
                    Roll No. {profileData?.personal?.roll}
                  </Text>
                </>
              )}
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    ...styles.detailsText,
                    justifyContent: 'center',
                    marginTop: moderateScale(15),
                    color: colors.text,
                  }}>
                  Barcode
                </Text>
                <View style={{marginTop: 10}}>
                  <Image
                    source={
                      {uri: profileData?.personal?.barcode} || Images.barcode
                    }
                    style={{
                      height: moderateScale(45),
                      width: moderateScale(75),
                      resizeMode: 'stretch',
                      marginLeft: 10,
                      opacity: 0.7,
                      // tintColor:colors.text
                    }}
                  />
                  {/* <Text style={{ ...styles.detailsText, marginTop: -18, marginLeft: moderateScale(30),color:colors.text }}>{profileData?.personal?.barcode || 'NA'}</Text> */}
                </View>
              </View>
            </View>
            <View
              style={{
                flex: 1.5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {profileData?.personal?.image ? (
                <Image
                  source={{uri: profileData?.personal?.image}}
                  style={{
                    height: moderateScale(75),
                    width: moderateScale(75),
                    borderRadius: moderateScale(75),
                    borderWidth: 1,
                    borderColor: Colors.black,
                  }}
                />
              ) : (
                <Image
                  source={Images.fatherImage}
                  style={{
                    height: moderateScale(75),
                    width: moderateScale(75),
                    borderRadius: moderateScale(75),
                    borderWidth: 1,
                    borderColor: Colors.black,
                  }}
                />
              )}
              {/* {userData?.type == 'student' ? <Text style={{...styles.detailsText,color:colors.text}}>Behaviour Score - 40</Text> :
                                <Text style={{...styles.detailsText,color:colors.text}}>STAFF ID - {profileData?.personal?.staff_id}</Text>
                            } */}
            </View>
          </View>
          {!loading && (
            <View
              style={{
                ...appStyles.card,
                marginBottom: 80,
                backgroundColor: colors.background,
              }}>
              <View
                style={{
                  minHeight: 600,
                  borderRadius: 15,
                  borderWidth: 0.5,
                  borderColor: colors.lightBlck,
                }}>
                <Tab.Navigator
                  // initialRouteName='Personal Info'
                  screenOptions={{
                    // tabBarScrollEnabled: true,

                    tabBarLabelStyle: {
                      fontSize: moderateScale(13),
                      fontWeight: '500',
                      textTransform: 'none',
                      borderRadius: 15,
                    },
                    // tabBarItemStyle: { width: width / 3 },
                    tabBarPressColor: 'transparent',
                    tabBarStyle: {
                      backgroundColor: colors.lightGreen,
                      borderTopLeftRadius: 15,
                      borderTopEndRadius: 15,
                    },
                    tabBarContentContainerStyle: {
                      borderBottomEndRadius: 15,
                    },
                    // tabBarGap: 5,
                    // tabBarActiveTintColor: Colors.tangerine,
                    tabBarInactiveTintColor: colors.greyText,
                    tabBarIndicatorStyle: {backgroundColor: colors.text},
                    // animationEnabled:false,
                    // tabBarScrollEnabled:true
                  }}>
                  <Tab.Screen name={'PERSONAL'} component={PersonalDetails} />
                  <Tab.Screen name={'DOCUMENTS'}  component={ProfileDocuments}   />

                  {/* {feeDetails?<Tab.Screen name={'FEES'} component={() => <ProfileFees data={feeDetails} />} />:null} */}
                  {/* {profileData.parents && (
                    <Tab.Screen name={'PARENT'} component={ParentDetails} />
                  )} */}
                  {profileData.others && (
                    <Tab.Screen name={'OTHERS'} component={Others} />
                  )}
                </Tab.Navigator>
              </View>
            </View>
          )}
          {loading && (
            <ActivityIndicator
              size={28}
              style={{marginTop: screenHeight / 3}}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  profileHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 10,
    // elevation:5,
    // backgroundColor:Colors.white2,
  },
  detailsText: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: Colors.black,
    marginTop: 5,
  },
  titleRow: {
    backgroundColor: Colors.lightGreen2,
    paddingHorizontal: 15,
    // paddingTop: 10,
    borderRadius: 15,
  },
});
