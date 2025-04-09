import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BackHeader from '../Components/BackHeader';
import {Colors} from '../Constants/Colors';
import {
  maxWidth,
  moderateScale,
  screenHeight,
  screenWidth,
} from '../Constants/PixelRatio';
import NavigationService from '../Services/Navigation';
import {Images} from '../Constants/Images';
import {appStyles} from '../Constants/Fonts';
import TitleHeader from '../Components/TitleHeader';
import UseApi from '../ApiConfig';
import {useSelector} from 'react-redux';
import RenderHtml from 'react-native-render-html';
import {useTheme} from '@react-navigation/native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';
import { downloadFile } from '../Utils/DownloadFile';
import rndownloadFile from '../Utils/rndownload';
// import {basename} from 'react-native-path';

let noticeData = [
  {
    title: 'Raksha Bandhan Holiday',
    description:
      'Raksha Bhandhan is a popular and traditionally Hindu annual rite or cermony that is central to a festival of the same name celebrated in South Asia.',
    publishDate: '23/12/2023',
    noticeDate: '26/12/2023',
  },
  {
    title: 'Parents Teacher Meeting ',
    description:
      'Gradly to inform you that the parents teacher meeting will be held on 16 december, 2023. Kindly attend this meeting online',
    publishDate: '16/12/2023',
    noticeDate: '17/12/2023',
  },
  {
    title: 'Parents Teacher Meeting ',
    description:
      'Gradly to inform you that the parents teacher meeting will be held on 16 december, 2023. Kindly attend this meeting online',
    publishDate: '27/12/2023',
    noticeDate: '28/12/2023',
  },
];

const NoticeBoard = () => {
  const {Request} = UseApi();
  const {userData, profileData} = useSelector(state => state.User);
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const {colors} = useTheme();

  useEffect(() => {
    getNotices();
  }, []);

  const getNotices = async () => {
    setLoading(true);

    let params = {
      user_id: userData?.id,
    };

    let data;
    try {
      data = await Request('notice-board', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }
    if (data?.status) {
      setNotices(data?.data);
    }
    setLoading(false);
  };
  

  return (
    <View>
      <BackHeader
        title="Notice Board"
        onBackIconPress={() => {
          NavigationService.navigate('Home');
        }}
      />
      <ScrollView
        style={{
          backgroundColor: colors.background,
          width: '100%',
        }}>
        <View style={{...appStyles.main, backgroundColor: colors.background}}>
          {/* <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerText}>Your Notice Board is here!</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10, marginTop: 10 }}>
                            <Image
                                source={Images.noticeBoard}
                                style={{
                                    height: moderateScale(65),
                                    width: moderateScale(90),
                                    marginTop: -15
                                }}
                            />
                        </View>
                    </View> */}
          <TitleHeader
            title={'Your Notice Board is here!'}
            // image={Images.noticeBoard}
            image={Images.Board}
            imageStyle={{
              height: moderateScale(65),
              width: moderateScale(90),
            }}
          />
          <View>
            {!loading &&
              notices.map((item, index) => {
                return (
                  <View
                    style={{
                      ...appStyles.card,
                      backgroundColor: colors.background,
                      borderColor: colors.lightBlck,
                      borderWidth: 0.5,
                    }}>
                    <View
                      style={{
                        ...appStyles.titleRow,
                        backgroundColor: colors.lightGreen,
                      }}>
                      <Text style={{...styles.title, color: colors.text}}>
                        {item.day_name}
                      </Text>
                    </View>
                    <View style={{paddingHorizontal: 15, paddingBottom: 15}}>
                      <View style={{marginTop: 10}}>
                        <RenderHtml
                          contentWidth={screenWidth}
                          source={{html: item.message}}
                          tagsStyles={{
                            p: {
                              fontSize: 15,
                              color: colors.text,
                              marginBottom: -10,
                            },
                          }}
                        />
                      </View>
                      <View style={{marginTop: 35}}>
                        {item.attachment && (
                          <View style={{flexDirection: 'row', gap: 10}}>
                            <TouchableOpacity
                              onPress={() =>
                                    Alert.alert(
                                      "Download File",
                                      "Do you want to download this file?",
                                      [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Download", onPress: () => rndownloadFile(item.attachment) }
                                        // { text: "Download", onPress: () => downloadFile(item.attachment) }
                                      ]
                                    )
                              }
                              style={{
                                flexDirection: 'row',
                                flex: 1.1,
                                marginBottom: 5,
                              }}>
                              <Image
                                source={Images.downloads}
                                style={{
                                  height: moderateScale(23),
                                  width: moderateScale(23),
                                  tintColor: colors.primary,
                                }}
                              />
                              <Text
                                style={{
                                  ...styles.description,
                                  marginTop: 5,
                                  marginLeft: 10,
                                  color: colors.primary,
                                }}>
                                Download Attachment
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <View style={{flexDirection: 'row', gap: 10}}>
                          <View style={{flexDirection: 'row', flex: 1.1}}>
                            <Image
                              source={Images.publishdate}
                              style={{
                                height: moderateScale(23),
                                width: moderateScale(23),
                                tintColor: colors.text,
                              }}
                            />
                            <Text
                              style={{
                                ...styles.description,
                                marginTop: 5,
                                marginLeft: 10,
                                color: colors.text,
                              }}>
                              Publish Date
                            </Text>
                          </View>
                          <Text
                            style={{
                              ...styles.valueText,
                              flex: 2,
                              marginTop: 5,
                              color: colors.text,
                            }}>
                            {item.publish_date}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 10,
                            marginTop: 10,
                          }}>
                          <View style={{flexDirection: 'row', flex: 1.1}}>
                            <Image
                              source={Images.calendar}
                              style={{
                                height: moderateScale(20),
                                width: moderateScale(20),
                                tintColor: colors.text,
                              }}
                            />
                            <Text
                              style={{
                                ...styles.description,
                                marginTop: 5,
                                marginLeft: 10,
                                color: colors.text,
                              }}>
                              Notice Date
                            </Text>
                          </View>
                          <Text
                            style={{
                              ...styles.valueText,
                              flex: 2,
                              marginTop: 8,
                              color: colors.text,
                            }}>
                            {item.notice_date}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}

            {loading && (
              <ActivityIndicator
                size={28}
                style={{marginTop: screenHeight / 3}}
              />
            )}

            {notices.length == 0 && !loading && (
              <View style={{marginTop: screenHeight / 4, alignItems: 'center'}}>
                <Image
                  source={Images.NoDataFound}
                  style={{
                    height: moderateScale(60),
                    width: moderateScale(60),
                    opacity: 0.5,
                    // marginTop:-15
                  }}
                />
                <Text style={{fontSize: moderateScale(14), marginTop: 10}}>
                  No records found!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NoticeBoard;

const styles = StyleSheet.create({
  headerText: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: Colors.black,
    marginLeft: 15,
  },
  title: {
    fontSize: moderateScale(15),
    color: Colors.black,
    fontWeight: '600',
  },

  description: {
    fontSize: moderateScale(12),
    color: Colors.black,
    fontWeight: '500',
  },
  valueText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: Colors.black,
    opacity: 0.8,
  },
});
