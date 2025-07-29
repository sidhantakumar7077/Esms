//import liraries
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import React, {Component, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Alert,
  PermissionsAndroid,
  Platform
} from 'react-native';
// import { Theme } from 'react-native-basic-elements';

import {useDispatch, useSelector} from 'react-redux';
import AuthStack from './App/Navigation/AuthStack';
import NavigationService from './App/Services/Navigation';
import AuthService from './App/Services/Auth';
import {setuser} from './App/Redux/reducer/User';
import AppStack from './App/Navigation/AppStack';
import SplashScreen from './App/Screen/SplashScreen';
// import { initializeApp } from '@react-native-firebase/app';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UseApi from './App/ApiConfig';
import {LightTheme, CustomDarkTheme} from './App/Components/ThemeContext';

export const GOOGLE_MAPS_APIKEY = "AIzaSyDPTHOYE5ZFGDIYxVsiJmOwMn9sHx0iYQA";

const Stack = createStackNavigator();
// create a component
const App = () => {
  const {login_status, userData, appSetting} = useSelector(state => state.User);
  const colorScheme = useColorScheme();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [loading, setLoading] = useState(true);
  // const [isDark, setIsDark] = useState(colorScheme == 'dark');
  const theme = appSetting.darkMode ? CustomDarkTheme : LightTheme;

  // const apiLevel = Platform.Version;
  const apiLevel = Platform.OS === 'android' ? Platform.constants.Version : 'N/A';
  console.log(`API Level: ${apiLevel}`);

  const dispatch = useDispatch();
  const {Request} = UseApi();

  useEffect(() => {
    // initUser()

    // autoLogin();
    getDeviceToken();
    requestUserPermission();
    createNotificationListeners();
    setTimeout(() => {
      setShowSplashScreen(false);
    }, 4000);
  }, []);

  const requestUserPermission = async () => {
    let status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    console.log('status............', status);
  };

  const createNotificationListeners = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      // NavigationService.navigate('Notification');
    });
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          console.log('remoteMessage?.data?....', remoteMessage?.data);
          // Linking.openURL(`https://www.jobtrigger.in/app/jobdetails/75`);
        }
      });
    messaging().onMessage(async remoteMessage => {
      console.log('remotemessage....', remoteMessage);
      // if (remoteMessage?.data?.post_id) {
      //   // NavigationService.navigate('Notification');
      //   NavigationService.navigate('JobDetails', { backPage: 'Home', id: remoteMessage?.data?.post_id });
      // }
      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
      );
    });
  };

  // useEffect(()=>{
  //   const unsubscribe = messaging().onMessage(async remoteMessage=>{
  //     console.log('remotemessage....',remoteMessage);
  //     Alert.alert(remoteMessage.notification.body);
  //   })

  //   return unsubscribe;
  // },[])

  const autoLogin = async fcmtoken => {
    console.log('fcmtoken....', fcmtoken);

    if (fcmtoken) {
      let params = {
        fcm_token: fcmtoken,
      };
      let data;
      try {
        data = await Request('login', 'POST', params);
      } catch (err) {
        console.log('err2....', err);
        // if(err.error) {
        //   Toast.show(err.error);
        // }
      }
      console.log('autologindata...', data);
      if (data?.status) {
        dispatch(setuser(data?.user_details));
      }
    }
    setLoading(false);
  };

  const getDeviceToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (fcmToken) {
      console.log('available fcmToken...', fcmToken);
      autoLogin(fcmToken);
      // sendFcmToken(fcmToken);
    } else {
      // sendFcmToken(token);
      setLoading(false);
    }
  };

  // const sendFcmToken = async (fcmToken) => {
  //   let data;
  //   try {
  //     data = await Request('fcm-token', 'POST', { token: fcmToken });
  //   } catch (err) {
  //     console.log('err...', err);
  //   }
  //   console.log('data...', data);
  //   if (data?.status) {
  //     console.log('successfully send fcm token..')
  //   }
  // }

  //   const getLocalData = async ()=>{
  //     let settingData = await AsyncStorage.getItem('appSetting');
  //     let userdata = await AsyncStorage.getItem('userData');
  //     if(settingData){
  //         dispatch(setAppSetting(JSON.parse(settingData)));
  //     }
  //     if(userdata){
  //       dispatch(setuser(JSON.parse(userdata)));
  //     }
  //  }
  console.log('-------------------lo', login_status);

  return (
    <View
      style={{
        flex: 1,
      }}>
      {/* <Theme.Provider
        theme={{
          light: {
            primaryThemeColor: '#000000',
            secondaryThemeColor: '#FFFFFF',
            primaryFontColor: '#191A19',
            secondaryFontColor: 'rgba(41, 41, 41, 0.8)',
            cardColor: '#FFFFFF',
            headerColor: '#fff',
            // pageBackgroundColor: '#F3EEF0',
            pageBackgroundColor: '#ffffff',
            tabBarColor: '#F3EEEF',
            shadowColor: '#999',
            statusBarStyle: 'dark-content',
            buttonColor: '#000000',
            borderColor: 'rgba(41, 41, 41, 0.39)'
          },
          dark: {
            primaryThemeColor: '#000000',
            secondaryThemeColor: '#FFFFFF',
            primaryFontColor: '#191A19',
            secondaryFontColor: 'rgba(41, 41, 41, 0.8)',
            cardColor: '#FFFFFF',
            headerColor: '#fff',
            // pageBackgroundColor: '#F3EEF0',
            pageBackgroundColor: '#ffffff',
            tabBarColor: '#F3EEEF',
            shadowColor: '#999',
            statusBarStyle: 'dark-content',
            buttonColor: '#000000',
            borderColor: 'rgba(41, 41, 41, 0.39)',
          },
        }}
        mode={colorScheme=='dark' ? 'dark' : 'light'}
      > */}

      <NavigationContainer
        theme={theme}
        ref={r => NavigationService.setTopLevelNavigator(r)}>
        <Stack.Navigator
          // initialRouteName='AuthStack'
          screenOptions={{
            headerShown: false,
            // gestureEnabled: true,
            // gestureDirection: 'horizontal',
          }}>
          {(showSplashScreen || loading) && (
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
          )}
          {/* <Stack.Screen name="AuthStack" component={AuthStack} /> */}
          {/* <Stack.Screen name="AppStack" component={AppStack} /> */}
          {!login_status ? (
            <Stack.Screen name="AuthStack" component={AuthStack} />
          ) : (
            <Stack.Screen name="AppStack" component={AppStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {/* </Theme.Provider> */}
    </View>
  );
};

export default App;
