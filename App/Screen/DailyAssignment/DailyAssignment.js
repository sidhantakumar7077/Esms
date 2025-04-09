import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {TextStyles, appStyles} from '../../Constants/Fonts';
import {Images} from '../../Constants/Images';
import {moderateScale, screenHeight} from '../../Constants/PixelRatio';
import {Colors} from '../../Constants/Colors';
import TitleHeader from '../../Components/TitleHeader';
import UseApi from '../../ApiConfig';
import {useSelector} from 'react-redux';
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'rn-fetch-blob';
import {useTheme} from '@react-navigation/native';
import rndownloadFile from '../../Utils/rndownload';

// const Assignments = [
//     {
//         Subject: 'Mathematics (110)',
//         title: 'Number Series',
//         remark: 'Keep hard working',
//         submissionDate: '29/12/2023',
//         evaluationDate: '29/12/2023',
//         action: false,
//         download: false,
//         Description: 'The number series consists of a series of numbers in which the next term is obtained by adding or substraction the constant term to the pervious term.'
//     },
//     {
//         Subject: 'English (112)',
//         title: 'Essay Writing',
//         remark: 'Keep hard working',
//         submissionDate: '29/12/2023',
//         evaluationDate: '29/12/2023',
//         action: false,
//         download: false,
//         Description: 'The descriptive essay is a genre of essay that asks the student to describe something - object, person, place, experience, emotion, situation etc.'
//     },
//     {
//         Subject: 'Mathematics (110)',
//         title: 'Factors and Multiples',
//         remark: 'Very Good',
//         submissionDate: '02/01/2024',
//         evaluationDate: '02/01/2024',
//         action: false,
//         download: true,
//         Description: 'Arithmetic is the fundamental of mathematics that includes the operation of numbers. These operations are addition, subtration, multiplication and division.'
//     },
//     {
//         Subject: 'Hindi (115)',
//         title: 'भूमंडल परिवर्तन',
//         remark: 'Very Good',
//         submissionDate: '03/01/2024',
//         evaluationDate: '03/01/2024',
//         action: true,
//         download: false,
//         Description: 'भूमंडल परिवर्तन एक ऐसा विषय है जो हमारे पूरे विश्व को सीधे और परियाप्त रूप से प्रभावित कर सकता है। यह एक ऐसी प्रक्रिया है जिसमें भूमंडल (अथवा वायुमंडल) में होने वाले बदलाव का अध्ययन किया जाता है, जो आपके जीवन, मौसम, और आपके चारों ओर के पर्यावरण को प्रभावित कर सकते हैं।'
//     },
//     {
//         Subject: 'Social Studies (120)',
//         title: 'History',
//         remark: 'Keep hard working',
//         submissionDate: '06/01/2024',
//         evaluationDate: '05/01/2024',
//         action: true,
//         download: true,
//         Description: 'Culture was defined earlier as the symbols, language, beliefs, values, and artifacts that are part of any society.'
//     },
// ];

const DailyAssignment = () => {
  const {Request} = UseApi();
  const {userData, profileData} = useSelector(state => state.User);
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const {colors} = useTheme();

  useEffect(() => {
    getAssignments('1');
  }, []);

  const getAssignments = async (type, assignmentId) => {
    if (type == '1') {
      setLoading(true);
    }
    let params = {
      user_id: userData?.id,
      // id: '89',
      type: type,
      // class_id:userData?.class_id,
      student_session_id: userData?.student_session_id,
      assignment_id: assignmentId ? assignmentId : '',
      // filter_id:currSubject || ''
    };

    let data;
    try {
      data = await Request('daily-assignment', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }
    if (data?.status && data?.data && type == '1') {
      setAssignments(data?.data);
    } else if (type == '3') {
      Toast.show('Assignment deleted successfully !');
      getAssignments('1');
    }
    if (type == '1') {
      setLoading(false);
    }
  };

  const downloadFile = async item => {
    setIsDownloading(true);
    //  firestore().collection('users').doc(`${userId}`).get().then(documentSnapshot=>console.log('res..........',documentSnapshot.exists));
    // console.log('firestore res......', res);
    let arr = item.attachment.split('.');
    let ext = arr[arr.length - 1];
    let {config, fs} = RNFetchBlob;
    const date = new Date();
    RNFetchBlob.config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      // fileCache: true,
      // path : dirs.DocumentDir + '/path-to-file.anything'
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        // path: fs.dirs.DownloadDir + "/download_" + Math.floor(date.getDate() + date.getSeconds() / 2) + '.' + item.ext,
        path:
          fs.dirs.DownloadDir +
          '/download_' +
          Math.floor(date.getDate() + date.getSeconds() / 2) +
          '.' +
          ext,
        description: 'file download',
      },
    })
      .fetch('GET', item.attachment, {
        //some headers ..
      })
      .then(res => {
        // the temp file path
        console.log('The file saved to ', res.path());
        //   res.base64()
        setIsDownloading(false);
        Toast.show('Successfully Download !');
      });
  };

  return (
    <View>
      <BackHeader
        title="Daily Assignment"
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
          <TitleHeader
            title={'Your Daily Assignment is here!'}
            image={Images.dailyAssignment2}
            imageStyle={{
              height: moderateScale(65),
              width: moderateScale(65),
            }}
          />
          <View>
            {/* {[1].map((item, index) => { */}
            {!loading &&
              assignments.map((item, index) => {
                return (
                  <View
                    key={index}
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
                      <Text style={{...TextStyles.title2, color: colors.text}}>
                        {item.subject_name}
                      </Text>
                      {item.evaluation_date === null && (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginTop: 2,
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              NavigationService.navigate('SubmitAssignment', {
                                ...item,
                                edit: true,
                                type: 'Edit',
                              })
                            }>
                            <Image
                              source={Images.edit}
                              style={{
                                height: 15,
                                width: 15,
                                tintColor: colors.text,
                              }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              // getAssignments('3', item.id);
                              Alert.alert(
                                '',
                                'Will you delete your assignment ?',
                                [
                                  {
                                    text: 'Yes',
                                    onPress: () => getAssignments('3', item.id),
                                  },
                                  {
                                    text: 'No',
                                    onPress: () => null,
                                    style: 'no',
                                  },
                                ],
                              );
                            }}>
                            <Image
                              source={Images.delete}
                              style={{
                                height: 15,
                                width: 15,
                                marginLeft: 15,
                                tintColor: colors.text,
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <View style={{padding: 15, paddingTop: 5}}>
                      <View style={appStyles.itmRow}>
                        <Text
                          style={{...TextStyles.keyText, color: colors.text}}>
                          Title
                        </Text>
                        <Text
                          style={{...TextStyles.valueText, color: colors.text}}>
                          {item.title}
                        </Text>
                      </View>
                      <View style={appStyles.itmRow}>
                        <Text
                          style={{...TextStyles.keyText, color: colors.text}}>
                          Remark
                        </Text>
                        <Text
                          style={{...TextStyles.valueText, color: colors.text}}>
                          {item.remark || 'NA'}
                        </Text>
                      </View>
                      <View style={appStyles.itmRow}>
                        <Text
                          style={{...TextStyles.keyText, color: colors.text}}>
                          Submission Date
                        </Text>
                        <Text
                          style={{...TextStyles.valueText, color: colors.text}}>
                          {item.submission_date || 'NA'}
                        </Text>
                      </View>
                      <View style={appStyles.itmRow}>
                        <Text
                          style={{...TextStyles.keyText, color: colors.text}}>
                          Evaluation Date
                        </Text>
                        <Text
                          style={{...TextStyles.valueText, color: colors.text}}>
                          {item.evaluation_date || 'NA'}
                        </Text>
                      </View>
                      <View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 20,
                          }}>
                          <Text
                            style={{
                              ...TextStyles.subTitle,
                              marginTop: 10,
                              color: colors.text,
                            }}>
                            Description
                          </Text>
                          {item?.attachment && !isDownloading && (
                            <TouchableOpacity
                              style={{flexDirection: 'row'}}
                              onPress={() => rndownloadFile(item?.attachment)}
                              // onPress={() => downloadFile(item)}
                              >
                              <Image
                                source={Images.directDownload}
                                style={{
                                  height: moderateScale(14),
                                  width: moderateScale(14),
                                  marginTop: 2,
                                  tintColor: colors.green,
                                }}
                              />
                              <Text
                                style={{
                                  ...TextStyles.subTitle,
                                  marginLeft: 5,
                                  color: colors.green,
                                }}>
                                Download
                              </Text>
                            </TouchableOpacity>
                          )}
                          {/* <View style={{paddingHorizontal:5}}> */}
                          {isDownloading && (
                            <ActivityIndicator
                              size={24}
                              style={{marginRight: 25}}
                            />
                          )}
                          {/* </View> */}
                        </View>
                        <Text style={TextStyles.valueText}>
                          {item.description || 'NA'}
                        </Text>
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

            {!loading && assignments.length == 0 && (
              <View style={{marginTop: screenHeight / 4, alignItems: 'center'}}>
                <Image
                  source={Images.NoDataFound}
                  style={{
                    height: moderateScale(60),
                    width: moderateScale(60),
                    opacity: 0.5,
                    tintColor: colors.text,
                    // marginTop:-15
                  }}
                />
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    marginTop: 10,
                    color: colors.text,
                    opacity: 0.6,
                  }}>
                  No records found!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <Pressable
        onPress={() =>
          NavigationService.navigate('SubmitAssignment', {
            edit: false,
            type: 'Add',
          })
        }
        style={styles.add}>
        <Image
          source={Images.add}
          style={{
            height: 60,
            width: 60,
            backgroundColor: Colors.white2,
            borderRadius: 60,
          }}
        />
      </Pressable>
    </View>
  );
};

export default DailyAssignment;

const styles = StyleSheet.create({
  itmRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginVertical: 2,
  },
  keyText: {
    fontSize: moderateScale(11),
    color: Colors.black,
    fontWeight: '500',
    opacity: 0.8,
    marginTop: 3,
    flex: 1,
  },
  valueText: {
    fontSize: moderateScale(11),
    color: Colors.black,
    fontWeight: '500',
    opacity: 0.5,
    marginTop: 3,
    flex: 1.8,
  },
  add: {
    position: 'absolute',
    bottom: 110,
    right: '2%',
  },
});
