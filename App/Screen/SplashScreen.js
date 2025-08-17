import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';
import { moderateScale, screenHeight, textSize } from '../Constants/PixelRatio';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import UseApi from '../ApiConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setDefultSetting } from '../Redux/reducer/User';

const SplashScreen = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { Request, BASE_URL } = UseApi();
  const dispatch = useDispatch();
  const { defultSetting } = useSelector(state => state.User);

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true); // Loader state

  const opacity = useSharedValue(0); // Animation state

  useEffect(() => {
    // fetchData();
    hydrateSettings();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await Request('get-settings', 'GET');
      console.log('API Response:', data, BASE_URL);
      if (data?.statusCode === 200 && data?.status) {
        dispatch(setDefultSetting(data));
        setLogoUrl(data?.app_logo);
        startTypingEffect(data?.school_name || 'School Management');
      }
    } catch (err) {
      console.log('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hydrateSettings = async () => {
    try {
      setLoading(true);
      // Prefer the persisted API base URL if present
      const storedApiBase = await AsyncStorage.getItem('api_base_url');
      const baseUrl = storedApiBase || `${defultSetting?.base_url}api/apicontroller/`;
      const resp = await fetch(`${baseUrl}get-settings`, {
        method: 'GET',
        headers: { 'X-API-KEY': '123123', 'Accept': 'application/json' },
      });
      const data = await resp.json();
      console.log('API Response:', data, baseUrl);
      if (data?.statusCode === 200 && data?.status) {
        dispatch(setDefultSetting(data));
        setLogoUrl(data?.app_logo);
        startTypingEffect(data?.school_name || 'School Management');
      }
    } catch (err) {
      console.log('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTypingEffect = (text) => {
    setDisplayedText('');
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index >= text.length) {
        clearInterval(typingInterval);
        opacity.value = withTiming(1, { duration: 2000 }); // Trigger animation after typing
      } else {
        setDisplayedText(prev => prev + text[index]);
        index++;
      }
    }, 80);
  };

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
  }));
  return (
    <ScrollView style={{ flex: 1, marginBottom: 10 }}>
      <StatusBar translucent={true} backgroundColor={Colors.black} barStyle="light-content" />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.deepGreen} />
        </View>
      ) : (
        <>
          <Image
            source={logoUrl ? { uri: logoUrl } : Images.logoImage}
            style={styles.logo}
            resizeMode='contain'
          />

          <View style={styles.textContainer}>
            <Text style={styles.textHead}>{displayedText}</Text>
            <Animated.Text style={animatedStyles}>
              Department of School Education
            </Animated.Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
  },
  logo: {
    width: '80%',  // Ensure it has a width
    height: 120, // Ensure it has a height
    marginTop: screenHeight / 3.5,
    alignSelf: 'center',
    resizeMode: 'contain'
    // borderRadius: 60, // Adjust if needed
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
  textHead: {
    color: Colors.deepGreen,
    fontSize: textSize(25),
    fontWeight: '600',
  },
});