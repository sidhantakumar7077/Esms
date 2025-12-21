import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Alert
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Images } from '../../Constants/Images';
import { Colors } from '../../Constants/Colors';
import { appStyles, FONTS, TextStyles } from '../../Constants/Fonts';
import { maxWidth, moderateScale, screenWidth, textSize } from '../../Constants/PixelRatio';
import NavigationService from '../../Services/Navigation';
import { useSelector } from 'react-redux';
import UseApi from '../../ApiConfig';
import RenderHtml from 'react-native-render-html';
import { useTheme } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import { requestStoragePermission } from '../../Utils/Permission';
import ChangePasswordModal from '../../Components/ChangePasswordModal';

let Elearnings = [
  {
    name: 'Homework',
    image: Images.homeworkColor,
    onItemPress: () => {
      NavigationService.navigate('Homework');
    },
  },
  {
    name: 'Assignment',
    image: Images.dailyAssignment2,
    onItemPress: () => NavigationService.navigate('DailyAssignment'),
  },
  {
    name: 'Lesson Plan',
    image: Images.lessonPlan2,
    onItemPress: () => NavigationService.navigate('LessonPlan'),
  },

  {
    name: 'Timetable',
    image: Images.classRoutine,
    onItemPress: () => NavigationService.navigate('ClassTimeTable'),
  },
  {
    name: 'Attendance',
    image: Images.attendanceReport,
    onItemPress: () => NavigationService.navigate('Attendance'),
  },

  {
    name: 'Notice Board',
    image: Images.Board,
    onItemPress: () => NavigationService.navigate('NoticeBoard'),
  },

  {
    name: 'Fees',
    image: Images.feesPayment,
    onItemPress: () => NavigationService.navigate('Fees'),
  },
  // { name: 'Library', image: Images.library, onItemPress: () => NavigationService.navigate('IssuedBooks') },
  // { name: '     Online Examination', image: Images.onlineTest },
  {
    name: 'Download Center',
    image: Images.downloadCenter,
    onItemPress: () => NavigationService.navigate('DownloadCenter'),
  },
  {
    name: 'Teacher Review',
    image: Images.reviewteacher,
    onItemPress: () => NavigationService.navigate('TeacherReview'),
  },
  {
    name: 'Examinations',
    image: Images.exam,
    width: '25%',
    onItemPress: () => NavigationService.navigate('Examination'),
  },

  // { name: 'Online Course', image: Images.onlineCourse },
  // { name: 'Zoom Live Classes', image: Images.zoom },
  // { name: 'G-Meet Live Classes', image: Images.gmeet },
];

let driverMenu = [
  {
    name: 'Transport',
    image: Images.transportation,
    onItemPress: () => NavigationService.navigate('TransportRoutes'),
  },
  {
    name: 'My Students',
    image: Images.carStudent,
    onItemPress: () => NavigationService.navigate('MyStudents'),
  },
];

let Academics = [
  // { name: '   Class Timetable', image: Images.timetable, onItemPress: () => NavigationService.navigate('ClassTimeTable') },
  { name: 'Syllabus', image: Images.syllabus },
  // { name: 'Attendance', image: Images.attendance,onItemPress:()=>NavigationService.navigate('Attendance') },
  // { name: 'Examinations', image: Images.examination,onItemPress:()=>NavigationService.navigate('Examination') },
  { name: 'Student Timeline', image: Images.timeline },
  { name: 'My Documents', image: Images.documents },
  { name: 'Behaviour Records', image: Images.behaviour },
  { name: 'CBSE Examination', image: Images.examination },
];

let Communicate = [
  // { name: 'Notice Board', image: Images.noticeboard, onItemPress: () => NavigationService.navigate('NoticeBoard') }
];

let Others = [
  // { name: 'Fees', image: Images.fees,onItemPress:()=>NavigationService.navigate('Fees') },
  { name: 'Apply Leave', image: Images.leave },
  { name: 'Visitor Book', image: Images.visitorbook },
  // { name: 'Transport Routes', image: Images.transport },
  { name: 'Hostel Rooms', image: Images.room },
  { name: 'Calnedar To Do List', image: Images.todolist },
  // { name: 'Library', image: Images.library,onItemPress:()=>NavigationService.navigate('IssuedBooks') },
  { name: 'Teachers Riviews', image: Images.routine },
];

const upcommingClasses = [
  {
    name: 'Rabin Mondal (103)',
    subject: 'English(ENG02)',
    roomNo: '002',
    time: '10:00 AM-10:45 AM ',
  },
  {
    name: 'Arup Biswas (213)',
    subject: 'English(ENG02)',
    roomNo: '002',
    time: '10:00 AM-10:45 AM ',
  },
  {
    name: 'Rabin Mondal (103)',
    subject: 'English(ENG02)',
    roomNo: '002',
    time: '10:00 AM-10:45 AM ',
  },
  {
    name: 'Santanu Das (103)',
    subject: 'English(ENG02)',
    roomNo: '002',
    time: '10:00 AM-10:45 AM ',
  },
];

const subjectProgress = [
  { name: 'Bengali (BEN01)', prggress: '15%' },
  { name: 'English (ENG02)', prggress: '35%' },
  { name: 'Mathematics (MATH01)', prggress: '40%' },
  { name: 'Science (BEN01)', prggress: '25%' },
];

const Dashboard = () => {

  const { Request } = UseApi();
  const { userData, defultSetting } = useSelector(state => state.User);
  const { colors } = useTheme();
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [userMenu, setUserMenu] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  // const shakeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const rotationAnimation = useRef(new Animated.Value(0)).current;
  const [showBellAnimation, setShowBellAnimation] = useState(false);
  const [dashboardSection, setDashboardSection] = useState({
    subject_list: [],
    teacher_list: [],
    upcomming_classes: [],
  });

  useEffect(() => {
    if (userData?.type == 'driver') {
      setUserMenu(driverMenu);
    } else {
      let transport = {
        name: 'Transport',
        image: Images.transportation,
        onItemPress: () => NavigationService.navigate('TransportRoutes'),
      };
      let studentMenu = userData?.driver_id
        ? [...Elearnings, transport]
        : Elearnings;
      setUserMenu(studentMenu);
    }
    getNotices();
    getSubjectsSections();
    // requestStoragePermission()
    console.log("user Data", userData);
  }, [userData?.type]);

  const shakeBell = () => {
    Animated.loop(
      Animated.sequence([
        // Animated.timing(shakeAnimation, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        // Animated.timing(shakeAnimation, { toValue: -10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        // Animated.timing(shakeAnimation, { toValue: 10, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        // Animated.timing(shakeAnimation, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true })
        Animated.timing(scaleAnimation, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnimation, {
          toValue: 1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnimation, {
          toValue: 0,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnimation, {
          toValue: -1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnimation, {
          toValue: 0,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 },
    ).start();
    console.log('animation stopped...');
  };

  const spin = rotationAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'], // Adjust the angle as per your preference
  });

  const helpDeskDetails = useMemo(() => {
    const arr = defultSetting?.help_desk?.details;
    return Array.isArray(arr) ? arr : [];
  }, [defultSetting]);

  const helpDeskAvailable = defultSetting?.help_desk?.available === "1";

  const openPhone = async (phone) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    const can = await Linking.canOpenURL(url);
    if (!can) return Alert.alert("Error", "Cannot open phone dialer on this device.");
    await Linking.openURL(url);
  };

  const openEmail = async (email) => {
    if (!email) return;
    const url = `mailto:${email}`;
    const can = await Linking.canOpenURL(url);
    if (!can) return Alert.alert("Error", "Cannot open email app on this device.");
    await Linking.openURL(url);
  };

  const onPressItem = (item) => {
    const type = String(item?.type || "").toLowerCase();

    if (type === "phone") return openPhone(item?.value);
    if (type === "email") return openEmail(item?.value);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPressItem(item)}
        style={{
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: '#ccc',
        }}
      >
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
          {item?.label}
        </Text>

        {!!item?.value && (
          <Text style={{ color: colors.text, opacity: 0.8, marginTop: 4 }}>
            {item?.value}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

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

  const getSubjectsSections = async () => {
    setLoading(true);
    let params = {
      // id: userData?.id,
      class_id: userData?.class_id,
      section_id: userData?.section_id,
    };

    let data;
    try {
      data = await Request('dashboard', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }

    if (data?.status && data?.data) {
      // setNotices(data?.data);
      setDashboardSection(data?.data);
    }
    setLoading(false);
  };

  const userImage = userData?.image?.replace('//uploads/student_images', '');

  return (
    <View>
      <StatusBar
        translucent={true}
        // backgroundColor="transparent"
        backgroundColor="black"
      // backgroundColor={Colors.lightGreen2}
      // barStyle="light-content"
      />
      <View style={{ ...styles.header, backgroundColor: colors.lightGreen }}>
        <Pressable onPress={() => NavigationService.openDrawer()}>
          <Image
            source={Images.menu}
            style={{
              height: 22,
              width: 22,
              tintColor: colors.text,
            }}
          />
        </Pressable>
        {/* <Pressable>
          <Image
            source={{ uri: defultSetting?.app_logo }}
            // resizeMode='contain'
            style={{
              height: 20,
              width: 98,
              tintColor: Colors.green2,
              tintColor: colors.text,
            }}
          />
        </Pressable> */}
        <TouchableOpacity
          onPress={() => setShowChangePassword(true)}
        // onPress={shakeBell}
        >
          {/* <Image
                        source={Images.notificationBell}
                        style={{
                            height: 30,
                            width: 30,
                            // tintColor:Colors.white2
                        }}
                    /> */}
          <Animated.View
            // style={{ transform: [{ translateX: shakeAnimation }] }}
            style={{ transform: [{ scale: scaleAnimation }, { rotate: spin }] }}>
            <Image
              source={Images.padlock}
              style={{
                height: 30,
                width: 30,
                tintColor: colors.text,
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ width: '99%', alignSelf: 'center', maxWidth: maxWidth, marginBottom: 50 }} nestedScrollEnabled={true}>
        <View
          style={{
            backgroundColor: colors.lightGreen,
            paddingVertical: 35,
            alignItems: 'center',
            paddingTop: 20,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
          }}>
          {/* <ScrollView > */}
          {userImage ? (
            <Image
              source={{ uri: userImage }}
              style={{
                height: 80,
                width: 80,
                borderRadius: 70,
              }}
            />
          ) : (
            <Image
              // source={userData?.image ? {uri:userData?.image} : Images.fatherImage}
              source={Images.fatherImage}
              style={{
                height: 80,
                width: 80,
                borderRadius: 70,
              }}
            />
          )}
          <Text style={{ ...styles.name, color: colors.text }}>
            {userData?.name}
          </Text>
          {userData?.type == 'student' ? (
            <Text style={{ ...styles.subTitle, color: colors.text }}>
              Admission No. {userData?.admission_no} {'    '} {userData?.class}({userData?.section})
            </Text>
          ) : (
            <Text style={{ ...styles.subTitle, color: colors.text }}>Driver</Text>
          )}
        </View>
        <View style={{ backgroundColor: colors.background, marginBottom: 50 }}>
          {helpDeskAvailable && helpDeskDetails.length > 0 ? (
            <View
              style={{
                width: '95%',
                alignSelf: 'center',
                marginTop: 15,
                borderRadius: 10,
                backgroundColor: colors.background,
                borderColor: colors.lightBlck,
                borderWidth: 0.5,
                borderRadius: 12,
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                padding: 15,
                overflow: "hidden",
              }}
            >
              <Text style={{ ...styles.title, color: colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>
                Help Desk
              </Text>

              <FlatList
                data={helpDeskDetails}
                keyExtractor={(item, index) => String(item?.id ?? index)}
                renderItem={renderItem}
                scrollEnabled={false} // because it's inside a card; enable if needed
              />
            </View>
          ) : null}

          <View
            style={{
              ...styles.card,
              backgroundColor: colors.background,
              borderColor: colors.lightBlck,
              borderWidth: 0.5,
              borderRadius: 12,
              elevation: 3, // Android shadow
              shadowColor: '#000', // iOS shadow
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              padding: 15,
              height: 270,
              overflow: 'hidden',
            }}>

            <Text style={{
              ...styles.title,
              color: colors.text,
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 15,
            }}>
              Notice
            </Text>

            <FlatList
              data={notices}
              style={{ flex: 1 }}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    marginBottom: 12,
                    borderBottomWidth: 0.3,
                    borderBottomColor: colors.lightBlck,
                    paddingBottom: 8,
                  }}
                  onPress={() => NavigationService.navigate('NoticeBoard')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={Images.email}
                      style={{
                        height: 18,
                        width: 18,
                        resizeMode: 'contain',
                        tintColor: colors.text,
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ color: colors.text, fontWeight: '400' }}>
                      {item.publish_date}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: '600',
                      marginLeft: 26,
                      marginTop: 2,
                      fontSize: 14,
                    }}>
                    {item.day_name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            />
            {/*  {notices.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{flexDirection: 'row', columnGap: 10, width: '93%'}}
                    onPress={() => NavigationService.navigate('NoticeBoard')}>
                    <Image
                      source={Images.email}
                      style={{
                        height: 15,
                        width: 15,
                        resizeMode: 'contain',
                        marginTop: 6,
                        tintColor: colors.text,
                      }}
                    />
                    {/* <Text style={styles.subName}>{item.message}</Text> 
                    <RenderHtml
                      // contentWidth={screenWidth}
                      source={{html: item.message}}
                      tagsStyles={{
                        p: {...TextStyles.keyText, color: colors.text},
                      }}
                    />
                  </TouchableOpacity>
                );
              })} */}
          </View>

          {userData?.type == 'student' && (
            <View
              style={{
                ...styles.card,
                backgroundColor: colors.background,
                borderColor: colors.lightBlck,
                borderWidth: 0.5,
              }}>
              <Text style={{ ...styles.title, color: colors.text }}>
                Subject Progress
              </Text>
              <View style={{ marginLeft: 2 }}>

                {dashboardSection?.subject_list &&
                  dashboardSection?.subject_list?.map((item, index) => {
                    return (
                      <Pressable
                        key={index}
                        style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text
                          style={{
                            ...TextStyles.keyText,
                            opacity: 0.8,
                            flex: 1,
                            color: colors.text,
                          }}>
                          {item.lebel}
                        </Text>
                        <View
                          style={{ flex: 1, flexDirection: 'row', columnGap: 5 }}>
                          <Text style={{ width: 30, color: colors.text }}>
                            {item.complete}%
                          </Text>
                          <View
                            style={{
                              width: '80%',
                              backgroundColor: Colors.lightGrey,
                              height: 10,
                              marginTop: 5,
                              borderWidth: 0.2,
                            }}>
                            <View
                              style={{
                                width: `${item.complete}%`,
                                backgroundColor: Colors.Green1,
                                height: 10,
                              }}></View>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
              </View>
            </View>
          )}

          <View
            style={{
              ...styles.card,
              backgroundColor: colors.background,
              borderColor: colors.lightBlck,
              borderWidth: 0.5,
            }}>
            <Text style={{ ...styles.title, color: colors.text }}>
              {userData?.type == 'student' ? 'E-Learning' : 'Dashboard'}
            </Text>
            <View style={styles.elearnings}>
              {userMenu.map((item, index) => {
                return (
                  <Pressable
                    key={index}
                    style={{
                      width: item.width || '24%',
                      alignItems: 'center',
                      marginTop: 5,
                      marginLeft: '1%',
                    }}
                    onPress={item.onItemPress}>
                    <View
                      style={{
                        ...styles.quickStartBox,
                        backgroundColor: colors.catBox,
                      }}>
                      <Image
                        source={item.image}
                        style={{
                          height: 30,
                          width: 30,
                          resizeMode: 'stretch',
                        }}
                      />
                    </View>
                    <Text style={{ ...styles.subName, color: colors.text }}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {userData?.type == 'student' && (
            <ScrollView nestedScrollEnabled={true}>
              <View
                style={{
                  ...styles.card,
                  backgroundColor: colors.background,
                  borderColor: colors.lightBlck,
                  borderWidth: 0.5,
                }}>
                <Text style={{ ...styles.title, color: colors.text }}>
                  Upcomming Classes
                </Text>
                <View style={{ marginLeft: 2 }}>
                  {dashboardSection?.upcomming_classes &&
                    dashboardSection?.upcomming_classes?.map((item, index) => {
                      return (
                        <>
                          {index < 5 && (
                            <Pressable
                              key={index}
                              style={{
                                flexDirection: 'row',
                                marginTop: 10,
                                columnGap: 5,
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  flex: 1,
                                  columnGap: 5,
                                }}>
                                <Image
                                  source={
                                    item.image
                                      ? { uri: item.image }
                                      : Images.fatherImage
                                  }
                                  style={{
                                    height: 35,
                                    width: 35,
                                    resizeMode: 'contain',
                                    marginTop: 3,
                                    borderRadius: 35,
                                    // flex: 0.5
                                  }}
                                />
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={{
                                      ...TextStyles.keyText,
                                      opacity: 0.8,
                                      textAlign: 'left',
                                      color: colors.text,
                                    }}>
                                    {item.full_name}
                                  </Text>
                                  <Text
                                    style={{
                                      ...TextStyles.valueText,
                                      opacity: 0.5,
                                      color: colors.text,
                                    }}>
                                    {item.subject_name}
                                  </Text>
                                </View>
                              </View>
                              <View style={{ flex: 0.8 }}>
                                <Text
                                  style={{
                                    ...TextStyles.keyText,
                                    opacity: 0.8,
                                    textAlign: 'left',
                                    color: colors.text,
                                  }}>
                                  Room No - {item.room_no}
                                </Text>
                                <Text
                                  style={{
                                    ...TextStyles.valueText,
                                    opacity: 0.5,
                                    color: colors.text,
                                  }}>
                                  {item.from_time} - {item.to_time}
                                </Text>
                              </View>
                            </Pressable>
                          )}
                        </>
                      );
                    })}
                </View>
              </View>
              {/* Change Password Modal */}
              <ChangePasswordModal
                visible={showChangePassword}
                onClose={() => setShowChangePassword(false)}
              />
            </ScrollView>
          )}

          {userData?.type == 'student' && (
            <View
              style={{
                ...styles.card,
                backgroundColor: colors.background,
                borderColor: colors.lightBlck,
                borderWidth: 0.5,
              }}>
              <Text style={{ ...styles.title, color: colors.text }}>
                Teacher List
              </Text>
              <View style={{ marginLeft: 2 }}>
                {dashboardSection?.teacher_list &&
                  dashboardSection?.teacher_list.map((item, index) => {
                    return (
                      <Pressable
                        key={index}
                        style={{ flexDirection: 'row', marginTop: 10 }}>
                        <View
                          style={{ flexDirection: 'row', flex: 1, columnGap: 5 }}>
                          <Image
                            source={
                              item.image
                                ? { uri: item.image }
                                : Images.fatherImage
                            }
                            style={{
                              height: 35,
                              width: 35,
                              resizeMode: 'contain',
                              marginTop: 3,
                              borderRadius: 35,
                            }}
                          />
                          <View style={{}}>
                            <Text
                              style={{
                                ...TextStyles.keyText,
                                opacity: 0.8,
                                textAlign: 'left',
                                color: colors.text,
                              }}>
                              {item.name}
                            </Text>
                            {/* <Text style={{ fontWeight: '500', opacity: 0.8 }}>{item.subject}</Text> */}
                            <Text
                              style={{
                                ...TextStyles.valueText,
                                opacity: 0.5,
                                color: colors.text,
                              }}>
                              {item.class_teacher}
                            </Text>
                          </View>
                        </View>
                        {/* <View style={{ flex: 1, marginTop: 2 }}>
                                            <Text style={{ ...TextStyles.valueText, opacity: 0.5, color: colors.text }}>{item.class_teacher}</Text>
                                        </View> */}
                      </Pressable>
                    );
                  })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingTop: 10,
    paddingHorizontal: '3%',
    paddingVertical: 5,
    // alignSelf:'center'
    alignItems: 'center',
    backgroundColor: Colors.lightGreen2,
    // backgroundColor: Colors.black
  },
  name: {
    // fontFamily:FONTS.bold,
    fontWeight: '600',
    fontSize: textSize(20),
    color: Colors.black,
    marginTop: 10,
    opacity: 0.7,
  },
  subTitle: {
    fontFamily: FONTS.medium,
    fontSize: textSize(13),
    color: Colors.black,
  },
  subName: {
    fontSize: textSize(10),
    color: Colors.black,
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'center',
  },
  card: {
    elevation: 10,
    width: '95%',
    borderRadius: 10,
    backgroundColor: Colors.white,
    padding: 10,
    alignSelf: 'center',
    marginTop: 15,
    paddingBottom: 30,
  },
  quickStartBox: {
    elevation: 5,
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
    // width: moderateScale(48),
    width: 60,
    borderRadius: moderateScale(5),
  },
  title: {
    color: Colors.black,
    fontSize: textSize(16),
    fontFamily: FONTS.bold,
  },
  elearnings: {
    marginTop: 20,
    flexWrap: 'wrap',
    flexDirection: 'row',
    rowGap: 15,
    // columnGap: 2
    // alignSelf:'center'
  },
});
