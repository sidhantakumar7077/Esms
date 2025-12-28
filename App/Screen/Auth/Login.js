import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
// import { Images } from '../../Constants/Images'
import {
  maxWidth,
  moderateScale,
  screenHeight,
  screenWidth,
  textSize,
} from '../../Constants/PixelRatio';
import { Images } from '../../Constants/Images';
import { Colors } from '../../Constants/Colors';
import { FONTS } from '../../Constants/Fonts';
import NavigationService from '../../Services/Navigation';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { setuser } from '../../Redux/reducer/User';
import Toast from 'react-native-simple-toast';
import UseApi from '../../ApiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';

const items = [
  { name: 'Notice Board', image: Images.Board },
  { name: 'Download Center', image: Images.downloadCenter },
  {
    name: 'Lesson Plan',
    image: Images.lessonPlan2,
    size: { height: 55, width: 55 },
  },
  { name: 'Daily Assignment', image: Images.dailyAssignment2 },
  { name: 'Homework', image: Images.homeworkColor },
  { name: 'Class Timetable', image: Images.classRoutine },
];

const Login = () => {

  const [visiblePass, setVisiblePass] = useState(true);
  const [userName, setUserName] = useState(null);
  const [password, setPassword] = useState(null);
  const dispatch = useDispatch();
  const { Request } = UseApi();
  const [loading, setLoading] = useState(false);
  const { userData, defultSetting } = useSelector(state => state.User);
  // useEffect(()=>{
  //   navigation.setOptions({
  //     headerTransparent: true,
  //     headerStyle: { backgroundColor: 'transparent' },
  //   });
  // },[navigation])

  useEffect(() => {
    getAuthData();
  }, []);

  const getAuthData = async () => {
    let logindata = await AsyncStorage.getItem('authdata');
    if (logindata && logindata != '') {
      let authdata = JSON.parse(logindata);
      console.log('ayuthdata..', authdata);
      setPassword(authdata.password);
      setUserName(authdata.username);
    }
  };

  const login = async () => {
    // setLoading(true);
    // let fcmToken = await AsyncStorage.getItem('fcmToken');
    const token = await messaging().getToken();
    // console.log('Generated fcmToken......', token);
    // return;

    let params = {
      username: userName,
      password: password,
      fcm_token: token,
    };
    // let params = {
    //   username: 'srikrishna.scriptlab@gmail.com',
    //   password: 'w01bdb'
    // }

    try {
      const data = await Request('login', 'POST', params);
      console.log('data======================>', data.statusCode);

      if (data?.status && data?.user_details) {
        dispatch(setuser(data?.user_details));
        let logindata = await AsyncStorage.getItem('authdata');
        let paramsStr = JSON.stringify(params);
        if (logindata != paramsStr) {
          Alert.alert('', 'Want to save username and password ?', [
            { text: 'No', onPress: () => console.log('cancelled'), style: 'No' },
            {
              text: 'Yes',
              onPress: async () => {
                await AsyncStorage.setItem('authdata', paramsStr);
              },
            },
          ]);
        }
        NavigationService.navigate('AppStack');
        Toast.show(data.message);
        await AsyncStorage.setItem('fcmToken', token);
      } else if (data?.message) {
        Toast.show(data?.message);
      }
    } catch (err) {
      console.log('err2....', err);
      if (err.error) {
        Toast.show(err.error);
      }
    }
    // dispatch(setuser({type:'driver',id:'10'}));
    // NavigationService.navigate('AppStack');

    // if (data?.status) {
    //   console.log('------------------login_page', data);
    //   dispatch(setuser(data?.user_details));
    //   let logindata = await AsyncStorage.getItem('authdata');
    //   let paramsStr = JSON.stringify(params);
    //   if (logindata != paramsStr) {
    //     Alert.alert('', 'Want to save username and password ?', [
    //       {text: 'No', onPress: () => console.log('cancelled'), style: 'No'},
    //       {
    //         text: 'Yes',
    //         onPress: async () => {
    //           await AsyncStorage.setItem('authdata', paramsStr);
    //         },
    //       },
    //     ]);
    //   }
    //   // NavigationService.navigate('AppStack');
    //   Toast.show(data.message);
    //   await AsyncStorage.setItem('fcmToken', token);
    // } else if (data?.message) {
    //   Toast.show(data?.message);
    // }

    setLoading(false);
  };

  // const login = async () => {
  //   setLoading(true);

  //   const token = "fB75igUMTIGb1dkroDoFFK:APA91bH4Sy7ocBIWSKck1wPn6UWV33lJDguDoX7of6mzaDGkixB7J4X_WL3sCafBXkDnNGVi5SnzPwGKCW4wF2q2AluvQC-wfhsV79wImBGRxA6tLxP32g4vz0h0laisTX_gDScq9_ZY";

  //   const params = {
  //     username: userName,
  //     password: password,
  //     fcm_token: token,
  //   };

  //   const url = 'https://esmsv2.scriptlab.in/api/apicontroller/login';
  //   const xmlRequest = new XMLHttpRequest();

  //   try {
  //     const response = await new Promise((resolve, reject) => {
  //       xmlRequest.open('POST', url, true);
  //       xmlRequest.setRequestHeader('X-API-Key', '123123');

  //       const formData = new FormData();
  //       for (const key in params) {
  //         formData.append(key, params[key]);
  //       }

  //       xmlRequest.send(formData);

  //       xmlRequest.onreadystatechange = () => {
  //         if (xmlRequest.readyState === XMLHttpRequest.DONE) {
  //           if (xmlRequest.status === 200 && xmlRequest.response) {
  //             try {
  //               const result = JSON.parse(xmlRequest.response);
  //               resolve(result);
  //             } catch (err) {
  //               reject({ error: 'Invalid response format', details: err });
  //             }
  //           } else {
  //             try {
  //               const error = JSON.parse(xmlRequest.response);
  //               reject(error);
  //             } catch (err) {
  //               reject({ error: 'Request failed', status: xmlRequest.status });
  //             }
  //           }
  //         }
  //       };
  //     });

  //     console.log('Login success:', response);

  //     if (response?.status && response?.user_details) {
  //       dispatch(setuser(response.user_details));

  //       const logindata = await AsyncStorage.getItem('authdata');
  //       const paramsStr = JSON.stringify(params);

  //       if (logindata !== paramsStr) {
  //         Alert.alert('', 'Want to save username and password?', [
  //           { text: 'No', onPress: () => console.log('Cancelled'), style: 'cancel' },
  //           {
  //             text: 'Yes',
  //             onPress: async () => {
  //               await AsyncStorage.setItem('authdata', paramsStr);
  //             },
  //           },
  //         ]);
  //       }

  //       NavigationService.navigate('AppStack');
  //       Toast.show(response.message);
  //       await AsyncStorage.setItem('fcmToken', token);
  //     } else {
  //       Toast.show(response.message || 'Login failed');
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     Toast.show(error?.error || 'Something went wrong');
  //   }

  //   setLoading(false);
  // };

  return (
    <ImageBackground
      source={Images.pageBackgound}
      style={{
        // height: screenHeight + 90,
        flex: 1,
        // justifyContent: 'center',
      }}>
      {/* <Text>Login</Text> */}
      <StatusBar
        translucent={true}
        // backgroundColor="transparent"
        backgroundColor={Colors.black}
        barStyle="light-content"
      />
      {/* backgroundColor:'#1e0ffe' */}

      <View style={{ flex: 1 }}>
        {/* <Image
          source={Images.loginBackground}
          style={{
            position: 'absolute',
            width: screenWidth,
            // resizeMode:'stretch'
            height: screenHeight + 90,
            // height: screenHeight + 50,
            // flex:1
            // tintColor:Colors.black
          }}
        /> */}
        <ScrollView
          style={{
            width: '99%',
            maxWidth: maxWidth,
            alignSelf: 'center',
            flex: 1,
          }}>
          <View style={{ alignItems: 'center', marginHorizontal: 2, flex: 1 }}>
            <View style={{ marginTop: 60, alignItems: 'center' }}>
              <Image
                source={defultSetting.app_logo ? { uri: defultSetting.app_logo } : Images.logoImage}
                resizeMode="contain"
                style={{
                  height: 40,
                  width: 200,
                  marginBottom: 10,
                }}
              />
              <Text
                style={{
                  color: 'green',
                  fontSize: textSize(27),
                  fontWeight: '600',
                }}>
                {defultSetting.school_name}
                {/* School Management */}
              </Text>
              {/* <Text style={{ fontSize: textSize(15), fontWeight: '500' }}>
                ESMS - Portal
              </Text>
              <Text style={{ fontSize: textSize(15), fontWeight: '500' }}>
                Department of School Education
              </Text> */}
            </View>

            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={[Colors.deepGreen, Colors.tangerine]}
              style={styles.aiPowered}>
              <Text style={{ color: 'white', fontSize: textSize(9) }}>
                {' '}
                Empowering education through seamless management.
              </Text>
            </LinearGradient>

            {/* {console.log('Math.cos(60)...', Math.cos((2 * Math.PI) / 6))} */}
            <View style={styles.container}>
              {items.map((item, index) => {
                const angle = (index * (2 * Math.PI)) / 6;
                let radius = 150;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                return (
                  <View
                    key={index}
                    style={{
                      position: 'absolute',
                      left: radius + x - 50,
                      top: radius - y - 50,
                      width: 100,
                      alignItems: 'center',
                    }}>
                    <View style={{}}>
                      <Image
                        source={item.image}
                        style={{
                          height: 37,
                          width: 37,
                          resizeMode: 'stretch',
                        }}
                      />
                    </View>
                    <Text style={{ ...styles.name }}>{item.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* <Image
           source={{uri: defultSetting?.app_logo}}
            style={{
              height: moderateScale(20),
              width: moderateScale(100),
              marginTop: 150,
              alignSelf: 'center',
              borderRadius:10,
              // backgroundColor:'gray'
            }}
          /> */}
          <View style={{ marginTop: 20 }}>
            <View style={{ marginTop: 25 }}>
              <TextInput
                placeholder="USERNAME"
                placeholderTextColor={'grey'}
                style={styles.intput}
                value={userName}
                onChangeText={text => setUserName(text)}
              />
              <Image source={Images.username} style={styles.leftIcon} />
            </View>
            <View style={{ marginTop: 25 }}>
              <TextInput
                placeholder="PASSWORD"
                placeholderTextColor={'grey'}
                style={styles.intput}
                value={password}
                onChangeText={text => setPassword(text)}
                secureTextEntry={!visiblePass}
              />
              <Image source={Images.padlock} style={styles.leftIcon} />
              <Pressable
                style={{
                  position: 'absolute',
                  top: 7,
                  right: '7%',
                }}
                onPress={() => setVisiblePass(!visiblePass)}>
                <Image
                  source={visiblePass ? Images.eye : Images.hidden}
                  style={styles.rightIcon}
                />
              </Pressable>
            </View>
          </View>
          <TouchableOpacity
            onPress={login}
            style={styles.loginBtn}
            disabled={loading}>
            <Text style={styles.btnText}>
              {loading ? 'Precessing...' : 'Login'}
            </Text>
            {/* <Image
              source={Images.rightArrow}
              style={{
                height: 16,
                width: 16,
                tintColor: Colors.btnText,
                marginLeft: 5
              }}
            /> */}
          </TouchableOpacity>
          {/* <View style={styles.bottomRow}>
            <TouchableOpacity
              onPress={() => NavigationService.navigate('ForgotPassword')}
              style={{}}>
              <Text style={{ ...styles.btnText, fontWeight: '600' }}>Frgot Password ?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => NavigationService.navigate('AppStack')}
              style={styles.loginBtn}>
              <Text style={styles.btnText}>Login</Text>
              <Image
                source={Images.rightArrow}
                style={{
                  height: 16,
                  width: 16,
                  tintColor: Colors.btnText,
                  marginLeft: 5
                }}
              />
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

// Login.NavigationOptions = {
//   headerTransparent: true,
//   headerStyle: { backgroundColor: 'transparent' },
// }

export default Login;

const styles = StyleSheet.create({
  aiPowered: {
    padding: 2,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.deepGreen,
    // width: '95%',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  container: {
    alignSelf: 'center',
    borderWidth: 0.2,
    borderRadius: 150,
    position: 'relative',
    width: 300,
    height: 300,
    marginTop: 60,
  },
  name: {
    color: Colors.greyText,
    fontSize: textSize(11),
    fontWeight: '500',
    textAlign: 'center',
    // alignSelf:'center'
  },
  intput: {
    height: 50,
    width: '90%',
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderEndColor: 'black',
    // marginTop: 25,
    paddingLeft: 40,
    fontSize: textSize(13),
    color: 'black',
  },
  leftIcon: {
    height: 19,
    width: 19,
    position: 'absolute',
    top: 13,
    left: '7%',
  },
  rightIcon: {
    height: 25,
    width: 25,
  },
  loginBtn: {
    backgroundColor: Colors.tangerine,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderEndColor: 'black',
    marginVertical: 25,
    fontSize: textSize(18),
    color: 'black',
  },
  btnText: {
    color: Colors.btnText,
    fontSize: textSize(16),
    fontFamily: FONTS.bold,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginHorizontal: '6%',
    marginTop: 20,
  },
});
