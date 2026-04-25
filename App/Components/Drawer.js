// //import liraries
// import React, { Component, useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Share, Alert, Linking, Switch, Modal, ProgressBarAndroid, Platform } from 'react-native';

// import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
// // import { Colors, Images } from '../Styles/Theme';
// import { moderateScale, screenHeight } from '../Constants/PixelRatio';
// import NavigationService from '../Services/Navigation';
// import { FONTS, TextStyles } from '../Constants/Fonts';
// import { logout, setAppSetting } from '../Redux/reducer/User';
// import { useDispatch, useSelector } from 'react-redux';
// import AuthService from '../Services/Auth';
// import { Images } from '../Constants/Images';
// import { Colors } from '../Constants/Colors';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useTheme } from '@react-navigation/native';
// import DeviceInfo from 'react-native-device-info';
// import UseApi from '../ApiConfig';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import RNFS from 'react-native-fs';
// // import { requestStoragePermission } from '../Utils/Permission';

// // const studentMenu = [
// //     { name: 'Dashboard', image: Images.home, onItemPress: () => { NavigationService.navigate('Home') } },
// //     { name: 'Profile', image: Images.profile, onItemPress: () => { NavigationService.navigate('Profile')}},
// //     { name: 'Homework', image: Images.homework, onItemPress: () => NavigationService.navigate('Homework') },
// //     { name: 'Daily Assignment', image: Images.assignment, onItemPress: () => NavigationService.navigate('DailyAssignment') },
// //     { name: 'Lesson Plan', image: Images.lessonPlan3, onItemPress: () => NavigationService.navigate('LessonPlan') },
// //     { name: 'Class Timetable', image: Images.timetable, onItemPress: () => NavigationService.navigate('ClassTimeTable') },
// //     { name: 'Attendance', image: Images.attendance, onItemPress:()=>NavigationService.navigate('Attendance') },
// //     { name: 'Notice Board', image: Images.noticeboard, onItemPress: () => NavigationService.navigate('NoticeBoard') },
// //     { name: 'Fees', image: Images.fees, onItemPress: () => NavigationService.navigate('FeesDetails') },
// //     // { name: 'Transport', image: Images.car, onItemPress: () => NavigationService.navigate('TransportRoutes') },
// //     // { name: 'Download Center', image: Images.downloadCenter },
// //     // { name: 'Teacher Review', image: Images.reviewteacher },
// // ];

// // const driverMenu = [
// //     { name: 'Dashboard', image: Images.home, onItemPress: () => { NavigationService.navigate('Home') } },
// //     { name: 'Profile', image: Images.profile, onItemPress: () => { NavigationService.navigate('Profile') } },
// //     { name: 'Transport', image: Images.car, onItemPress: () => NavigationService.navigate('TransportRoutes') },
// //     { name: 'My Students', image: Images.carStudent, onItemPress: () => NavigationService.navigate('MyStudents') },
// //     // { name: 'Logout', image: Images.logout, onItemPress: () => NavigationService.navigate('AuthStack') },
// // ];

// const DrawerContent = (props) => {

//     const dispatch = useDispatch()
//     const { userData, appSetting, defultSetting } = useSelector(state => state.User);
//     const [userMenu, setUserMenu] = useState([]);
//     const { colors } = useTheme();

//     // Local fallback file (you requested the uploaded file path be used)
//     const LOCAL_FALLBACK_ICON = 'react_native_logo.png';

//     // MASTER list of all possible menu items and the route they map to
//     const allMenuItems = [
//         { name: 'Dashboard', image: Images.home, route: 'Home' },
//         { name: 'Profile', image: Images.profile, route: 'Profile' },
//         { name: 'Homework', image: Images.homework, route: 'Homework' },
//         { name: 'Homework', image: Images.homework, route: 'HomeworkV2' },
//         { name: 'Daily Assignment', image: Images.dailyAssignment, route: 'DailyAssignment' },
//         { name: 'Lesson Plan', image: Images.lessonPlan3, route: 'LessonPlan' },
//         { name: 'Class Timetable', image: Images.timetable, route: 'ClassTimeTable' },
//         { name: 'Attendance', image: Images.attendance, route: 'Attendance' },
//         { name: 'Notice Board', image: Images.noticeboard, route: 'NoticeBoard' },
//         { name: 'Fees', image: Images.fees, route: 'Fees' },
//         { name: 'Transport', image: Images.transport, route: 'TransportRoutes' },
//         { name: 'Download Center', image: Images.directDownload, route: 'DownloadCenter' },
//         { name: 'Teacher Review', image: Images.ratingBlank, route: 'TeacherReview' },
//         { name: 'Examination', image: Images.syllabus, route: 'Examination' },
//         { name: 'Video Tutorial', image: Images.zoom, route: 'VideoTutorial' },
//         { name: 'LMS', image: Images.downloads, route: 'LMS' },
//         // add more mappings here if required
//     ];

//     // Default Menu Show if modules is empty or null
//     const defaultMenu = [
//         { name: 'Dashboard', image: Images.home, route: 'Home' },
//         { name: 'Profile', image: Images.profile, route: 'Profile' },
//         { name: 'Homework', image: Images.homework, route: 'Homework' },
//         { name: 'Homework', image: Images.homework, route: 'HomeworkV2' },
//         { name: 'Daily Assignment', image: Images.dailyAssignment, route: 'DailyAssignment' },
//         { name: 'Lesson Plan', image: Images.lessonPlan3, route: 'LessonPlan' },
//         { name: 'Class Timetable', image: Images.timetable, route: 'ClassTimeTable' },
//         { name: 'Attendance', image: Images.attendance, route: 'Attendance' },
//         { name: 'Notice Board', image: Images.noticeboard, route: 'NoticeBoard' },
//         { name: 'Fees', image: Images.fees, route: 'Fees' },
//         { name: 'Download Center', image: Images.directDownload, route: 'DownloadCenter' },
//         { name: 'Teacher Review', image: Images.ratingBlank, route: 'TeacherReview' },
//         { name: 'Examination', image: Images.syllabus, route: 'Examination' },
//     ];

//     // Build the two base menus (student and driver) from the master list
//     const studentMenuBase = [
//         'Dashboard', 'Profile', 'Homework', 'Homework', 'Daily Assignment', 'Lesson Plan',
//         'Class Timetable', 'Attendance', 'Notice Board', 'Fees', 'Transport',
//         'Download Center', 'Teacher Review', 'Examination', 'Video Tutorial', 'LMS'
//     ];

//     const driverMenuBase = [
//         'Dashboard', 'Profile', 'Transport', 'My Students'
//     ];

//     useEffect(() => {
//         buildMenuForUser();
//     }, [defultSetting, userData]);

//     const buildMenuForUser = () => {
//         const logoutitem = { name: 'Logout', image: Images.logout, onItemPress: onConfirmLogout };

//         // get allowed modules from server
//         // const modules = defultSetting?.app_modules || [];
//         // Show defaultMenu if app_modules is empty or null
//         const modules = defultSetting?.app_modules && defultSetting.app_modules.length > 0
//             ? defultSetting.app_modules
//             : defaultMenu.map(item => ({ menu_name: item.name }));
//         const allowedSet = new Set(modules.map(m => (m?.menu_name || '').toString().trim()));

//         // choose base depending on user type
//         const baseNames = userData?.type === 'driver' ? driverMenuBase : studentMenuBase;

//         // if server didn't provide modules, show the full base menu
//         const filtered = baseNames
//             .filter(name => {
//                 if (!modules || modules.length === 0) return true; // no server restrictions
//                 return allowedSet.has(name); // show only if server allows
//             })
//             .map(name => {
//                 const meta = allMenuItems.find(mi => mi.name === name);
//                 return {
//                     name,
//                     image: meta?.image || { uri: LOCAL_FALLBACK_ICON },
//                     onItemPress: meta?.route ? () => NavigationService.navigate(meta.route) : () => { },
//                 };
//             });

//         // If server contains modules not in base list, append them at the end (fallback)
//         if (modules && modules.length > 0) {
//             modules.forEach(m => {
//                 const name = (m?.menu_name || '').toString().trim();
//                 const already = filtered.find(x => x.name === name);
//                 if (!already) {
//                     // try find metadata; fallback to local file icon and noop
//                     const meta = allMenuItems.find(mi => mi.name === name);
//                     filtered.push({
//                         name,
//                         image: meta?.image || { uri: LOCAL_FALLBACK_ICON },
//                         onItemPress: meta?.route ? () => NavigationService.navigate(meta.route) : () => { },
//                     });
//                 }
//             });
//         }

//         setUserMenu([...filtered, logoutitem]);
//     }

//     const setDarkMode = async () => {
//         let appsetting = { ...appSetting, darkMode: !appSetting.darkMode }
//         dispatch(setAppSetting(appsetting));
//         await AsyncStorage.setItem('appSetting', JSON.stringify(appsetting));
//     }

//     const logOut = async () => {
//         dispatch(logout());
//         // await AsyncStorage.setItem('fcmToken', '');
//         await AsyncStorage.removeItem('fcmToken');
//     }

//     const onConfirmLogout = () => {
//         Alert.alert(
//             "Are you Sure?",
//             "You want to Logout",
//             [
//                 {
//                     text: "No",
//                     onPress: () => console.log("Cancel Pressed"),
//                     style: "cancel"
//                 },
//                 { text: "Yes", onPress: () => logOut() }
//             ]
//         );
//     }

//     const [latestVersion, setLatestVersion] = useState(null);
//     const [downloadUrl, setDownloadUrl] = useState('');
//     const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
//     const [downloadProgress, setDownloadProgress] = useState(0);
//     const [isDownloading, setIsDownloading] = useState(false);

//     const appVersion = DeviceInfo.getVersion(); // Current APK version

//     const checkForVersionUpdate = async () => {
//         const { Request } = UseApi(); // Destructure the Request function from UseApi

//         try {
//             const params = {
//                 user_id: userData.id, // Your user ID
//             };

//             const response = await Request('app-update', 'POST', params); // Use the Request function

//             if (response?.status && response?.version && response?.url) {
//                 setLatestVersion(response.version);
//                 setDownloadUrl(response.url);
//                 if (parseFloat(appVersion) < parseFloat(response.version)) {
//                     setShowUpdatePrompt(true);
//                 }
//             }
//         } catch (error) {
//             console.error("Version check failed:", error);
//         }
//     };

//     useEffect(() => {
//         checkForVersionUpdate();
//         console.log("userData From Drawer.js", defultSetting);
//     }, []);

//     const userImage = userData?.image?.replace('//uploads/student_images', '');

//     return (
//         // <DrawerContentScrollView {...props}>
//         //     <Pressable style={{ flexDirection: 'row', marginBottom: 20 }}>
//         //         <Image
//         //             style={styles.profileImage}
//         //             source={Images.profileImage}
//         //         />
//         //         <View style={{ justifyContent: 'center', marginLeft: 15 }}>
//         //             <Text style={styles.title}>Rahul Sharma</Text>
//         //             <Text>NYCTA-HO-22R-0001</Text>
//         //         </View>
//         //     </Pressable>
//         //     {/* {console.log('state.routes.....')} */}
//         //     <DrawerItem
//         //         icon={() => (
//         //             <Image
//         //                 source={Images.dashboard}
//         //                 style={{
//         //                     height: 20,
//         //                     width: 20,
//         //                     tintColor: Colors.drawerIconColor
//         //                 }}
//         //             />
//         //         )}
//         //         // focused={true}
//         //         // activeTintColor={Colors.tangerine}
//         //         label={({color})=>(<Text style={{...styles.name,color:color}}>Dashboard</Text>)}
//         //     />
//         // </DrawerContentScrollView>

//         <View style={{ ...styles.container, backgroundColor: colors.background }}>
//             <ScrollView contentContainerStyle={{ flexGrow: 1, marginBottom: 30 }}>
//                 <Pressable style={{ ...styles.profileWrapper, backgroundColor: colors.lightGreen }}>
//                     <View style={{ flex: 1.5 }}>
//                         {userImage ?
//                             <Image
//                                 style={{ ...styles.profileImage }}
//                                 source={{ uri: userImage }}
//                             />
//                             :
//                             <Image
//                                 style={{ ...styles.profileImage }}
//                                 source={Images.fatherImage}
//                             />
//                         }
//                     </View>
//                     <View style={{ flex: 3, justifyContent: 'center', marginLeft: 15 }}>
//                         <Text numberOfLines={2} style={{ ...styles.title, color: colors.text }}>{userData?.name}</Text>
//                         <Text style={{ ...TextStyles.subTitle, color: colors.text }}>{userData?.type == 'student' ? `class. ${userData?.class}(${userData?.section})` : 'Driver'}</Text>
//                     </View>
//                 </Pressable>
//                 <View style={{ paddingLeft: moderateScale(20), paddingVertical: 10, backgroundColor: colors.background }}>
//                     <Pressable
//                         // style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
//                         style={styles.row}
//                     >
//                         <View style={{ flexDirection: 'row', gap: 10 }}>
//                             <Image
//                                 source={Images.darkMode}
//                                 style={{
//                                     height: 23,
//                                     width: 23,
//                                     resizeMode: 'contain',
//                                     tintColor: colors.green,
//                                 }}
//                             />
//                             <Text style={{ color: colors.text, fontSize: moderateScale(13), fontWeight: '500', opacity: 0.7 }}>Dark Mode</Text>
//                         </View>
//                         <View>
//                             <Switch
//                                 style={{}}
//                                 value={appSetting.darkMode}
//                                 onValueChange={setDarkMode}
//                                 thumbColor={appSetting.darkMode ? "#ffffff" : "#f4f3f4"}
//                                 // trackColor={{ false: "#767577", true: "#81b0ff" }}
//                                 trackColor={{ false: "#767577", true: colors.green }}
//                             />
//                         </View>
//                     </Pressable>
//                     {userMenu.map((item, index) => {
//                         return (
//                             <TouchableOpacity
//                                 key={index}
//                                 onPress={item.onItemPress}
//                             >
//                                 <View style={[styles.row]}>
//                                     <View style={styles.icon}>
//                                         <View style={{ flex: 1 }}>
//                                             <Image
//                                                 source={item.image}
//                                                 style={{
//                                                     height: 19,
//                                                     width: 19,
//                                                     resizeMode: 'stretch',
//                                                     tintColor: colors.green,
//                                                 }}
//                                             />
//                                         </View>
//                                         <Text style={{
//                                             ...styles.name,
//                                             opacity: 0.7,
//                                             color: colors.text
//                                             // color: props.state.index == 0 ? Colors.tangerine : '#000000'
//                                         }}>
//                                             {item.name}
//                                         </Text>
//                                     </View>
//                                 </View>
//                             </TouchableOpacity>
//                         )
//                     })}

//                     {/* <View style={{ borderTopWidth: 0.5, borderTopColor: '#a0a0a0', marginTop: 30, marginLeft: -moderateScale(20), paddingLeft: moderateScale(20) }}>
//                         <Text style={{ marginTop: 10, flex: 1, color: colors.text, opacity: 0.6 }}>Current Version {appVersion}</Text>
//                         <View style={{ flex: 6, backgroundColor: colors.background }}></View>
//                         {showUpdatePrompt && (
//                             <Pressable onPress={downloadApk} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
//                                 <Text style={{ color: colors.text, fontSize: moderateScale(13), fontWeight: '500', opacity: 0.7, marginRight: 10 }}>Update Available ({latestVersion})</Text>
//                                 <Icon name="file-download" size={20} color={colors.green} />
//                             </Pressable>
//                         )}
//                         <>
//                             {isDownloading && (
//                                 <Modal transparent animationType="fade">
//                                     <View style={styles.modalContainer}>
//                                         <View style={styles.modalCard}>
//                                             <Text style={styles.downloadTitle}>Downloading APK...</Text>
//                                             <Text style={styles.downloadInfo}>Please wait while we download the latest version...</Text>

//                                             <ProgressBarAndroid
//                                                 styleAttr="Horizontal"
//                                                 indeterminate={false}
//                                                 progress={downloadProgress / 100}
//                                                 color="#feae35"
//                                                 style={{ width: '100%', marginTop: 10 }}
//                                             />

//                                             <Text style={styles.progressText}>{downloadProgress.toFixed(0)}%</Text>
//                                         </View>
//                                     </View>
//                                 </Modal>
//                             )}
//                         </>
//                     </View> */}
//                 </View>
//             </ScrollView>
//         </View>
//     );
// };

// // define your styles
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         // marginBottom: 40,
//         // marginTop: 30
//     },
//     row: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingVertical: 10,
//     },
//     profileWrapper: {
//         flexDirection: 'row',
//         backgroundColor: Colors.lightGreen2,
//         paddingVertical: 20,
//         paddingLeft: 20
//     },
//     profileImage: {
//         width: moderateScale(60),
//         height: moderateScale(60),
//         borderRadius: moderateScale(60),
//         borderColor: '#ffaf8d'
//     },
//     icon: {
//         flexDirection: 'row',
//         alignItems: 'center'
//     },

//     name: {
//         color: 'black',
//         fontSize: moderateScale(13),
//         fontWeight: '500',
//         flex: 6
//     },

//     title: {
//         fontSize: moderateScale(15),
//         fontWeight: '500',
//         color: Colors.black
//     },
//     circle: {
//         height: moderateScale(20),
//         width: moderateScale(20),
//         borderRadius: moderateScale(22),
//         backgroundColor: '#474ff1',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginLeft: moderateScale(15)
//     },
//     notiNumber: {
//         fontFamily: FONTS.regular,
//         fontSize: moderateScale(12),
//         color: Colors.btnText
//     },
//     modalContainer: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.4)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modalCard: {
//         width: '85%',
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         padding: 20,
//         alignItems: 'center',
//         elevation: 10,
//     },
//     downloadTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#dd4c2f',
//         marginBottom: 6,
//     },
//     downloadInfo: {
//         fontSize: 14,
//         textAlign: 'center',
//         color: '#444',
//         marginBottom: 12,
//     },
//     progressText: {
//         marginTop: 10,
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#333',
//     },
// });

// //make this component available to the app
// export default DrawerContent;



// import libraries
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
    Modal,
    ProgressBarAndroid,
} from 'react-native';

import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import { moderateScale } from '../Constants/PixelRatio';
import NavigationService from '../Services/Navigation';
import { FONTS, TextStyles } from '../Constants/Fonts';
import { logout, setAppSetting } from '../Redux/reducer/User';
import { useDispatch, useSelector } from 'react-redux';
import { Images } from '../Constants/Images';
import { Colors } from '../Constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import UseApi from '../ApiConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DrawerContent = props => {
    const dispatch = useDispatch();
    const { userData, appSetting, defultSetting } = useSelector(state => state.User);
    const [userMenu, setUserMenu] = useState([]);
    const { colors } = useTheme();

    const LOCAL_FALLBACK_ICON = 'react_native_logo.png';

    /**
     * IMPORTANT:
     * Use unique module id for route mapping.
     * Because "Homework" and "HomeworkV2" can both show as Homework,
     * but route must be different.
     */
    const allMenuItems = [
        { id: '1', name: 'Dashboard', displayName: 'Dashboard', image: Images.home, route: 'Home' },
        { id: '2', name: 'Profile', displayName: 'Profile', image: Images.profile, route: 'Profile' },

        // Old Homework
        { id: '3', name: 'Homework', displayName: 'Homework', image: Images.homework, route: 'Homework' },

        { id: '4', name: 'Daily Assignment', displayName: 'Daily Assignment', image: Images.dailyAssignment, route: 'DailyAssignment' },
        { id: '5', name: 'Lesson Plan', displayName: 'Lesson Plan', image: Images.lessonPlan3, route: 'LessonPlan' },
        { id: '6', name: 'Class Timetable', displayName: 'Class Timetable', image: Images.timetable, route: 'ClassTimeTable' },
        { id: '7', name: 'Attendance', displayName: 'Attendance', image: Images.attendance, route: 'Attendance' },
        { id: '8', name: 'Notice Board', displayName: 'Notice Board', image: Images.noticeboard, route: 'NoticeBoard' },
        { id: '9', name: 'Fees', displayName: 'Fees', image: Images.fees, route: 'Fees' },
        { id: '10', name: 'Transport', displayName: 'Transport', image: Images.transport, route: 'TransportRoutes' },
        { id: '11', name: 'Download Center', displayName: 'Download Center', image: Images.directDownload, route: 'DownloadCenter' },
        { id: '12', name: 'Teacher Review', displayName: 'Teacher Review', image: Images.ratingBlank, route: 'TeacherReview' },
        { id: '13', name: 'Examination', displayName: 'Examination', image: Images.syllabus, route: 'Examination' },
        { id: '14', name: 'Video Tutorial', displayName: 'Video Tutorial', image: Images.zoom, route: 'VideoTutorial' },
        { id: '15', name: 'LMS', displayName: 'LMS', image: Images.downloads, route: 'LMS' },

        // New Homework page
        {
            id: '16',
            name: 'HomeworkV2',
            displayName: 'Homework',
            image: Images.homework,
            route: 'HomeworkV2',
        },

        // Driver optional menu
        {
            id: 'driver_students',
            name: 'My Students',
            displayName: 'My Students',
            image: Images.carStudent,
            route: 'MyStudents',
        },
    ];

    const defaultMenu = [
        { id: '1', menu_name: 'Dashboard' },
        { id: '2', menu_name: 'Profile' },
        { id: '3', menu_name: 'Homework' },
        { id: '16', menu_name: 'HomeworkV2' },
        { id: '4', menu_name: 'Daily Assignment' },
        { id: '5', menu_name: 'Lesson Plan' },
        { id: '6', menu_name: 'Class Timetable' },
        { id: '7', menu_name: 'Attendance' },
        { id: '8', menu_name: 'Notice Board' },
        { id: '9', menu_name: 'Fees' },
        { id: '11', menu_name: 'Download Center' },
        { id: '12', menu_name: 'Teacher Review' },
        { id: '13', menu_name: 'Examination' },
        { id: '14', menu_name: 'Video Tutorial' },
        { id: '15', menu_name: 'LMS' },
    ];

    const studentMenuBase = [
        '1',
        '2',
        '3',
        '16',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
    ];

    const driverMenuBase = [
        '1',
        '2',
        '10',
        'driver_students',
    ];

    useEffect(() => {
        buildMenuForUser();
    }, [defultSetting, userData]);

    const buildMenuForUser = () => {
        const logoutitem = {
            id: 'logout',
            name: 'Logout',
            image: Images.logout,
            onItemPress: onConfirmLogout,
        };

        const serverModules =
            defultSetting?.app_modules && defultSetting.app_modules.length > 0
                ? defultSetting.app_modules
                : defaultMenu;

        const hasServerModules =
            defultSetting?.app_modules && defultSetting.app_modules.length > 0;

        const allowedIdSet = new Set(
            serverModules.map(m => String(m?.id || '').trim()),
        );

        const allowedNameSet = new Set(
            serverModules.map(m => String(m?.menu_name || '').trim()),
        );

        const baseIds = userData?.type === 'driver' ? driverMenuBase : studentMenuBase;

        const filtered = baseIds
            .filter(id => {
                if (!hasServerModules) {
                    return true;
                }

                const meta = allMenuItems.find(mi => String(mi.id) === String(id));

                // Main check by id
                if (allowedIdSet.has(String(id))) {
                    return true;
                }

                // Fallback check by menu_name for old APIs without id
                if (meta?.name && allowedNameSet.has(meta.name)) {
                    return true;
                }

                return false;
            })
            .map(id => {
                const meta = allMenuItems.find(mi => String(mi.id) === String(id));

                return {
                    id,
                    name: meta?.displayName || meta?.name || 'Menu',
                    image: meta?.image || { uri: LOCAL_FALLBACK_ICON },
                    onItemPress: meta?.route
                        ? () => NavigationService.navigate(meta.route)
                        : () => { },
                };
            });

        /**
         * Append modules sent by server that are not in baseIds.
         * This is useful if server adds a new module later.
         */
        if (hasServerModules) {
            serverModules.forEach(m => {
                const id = String(m?.id || '').trim();
                const menuName = String(m?.menu_name || '').trim();

                const already = filtered.find(x => String(x.id) === id);

                if (!already) {
                    let meta = null;

                    if (id) {
                        meta = allMenuItems.find(mi => String(mi.id) === id);
                    }

                    if (!meta && menuName) {
                        meta = allMenuItems.find(mi => mi.name === menuName);
                    }

                    if (meta) {
                        filtered.push({
                            id: meta.id,
                            name: meta?.displayName || meta?.name || menuName,
                            image: meta?.image || { uri: LOCAL_FALLBACK_ICON },
                            onItemPress: meta?.route
                                ? () => NavigationService.navigate(meta.route)
                                : () => { },
                        });
                    }
                }
            });
        }

        setUserMenu([...filtered, logoutitem]);
    };

    const setDarkMode = async () => {
        const appsetting = {
            ...appSetting,
            darkMode: !appSetting.darkMode,
        };

        dispatch(setAppSetting(appsetting));
        await AsyncStorage.setItem('appSetting', JSON.stringify(appsetting));
    };

    const logOut = async () => {
        dispatch(logout());
        await AsyncStorage.removeItem('fcmToken');
    };

    const onConfirmLogout = () => {
        Alert.alert(
            'Are you Sure?',
            'You want to Logout',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => logOut(),
                },
            ],
        );
    };

    const [latestVersion, setLatestVersion] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const appVersion = DeviceInfo.getVersion();

    const checkForVersionUpdate = async () => {
        const { Request } = UseApi();

        try {
            const params = {
                user_id: userData?.id,
            };

            const response = await Request('app-update', 'POST', params);

            if (response?.status && response?.version && response?.url) {
                setLatestVersion(response.version);
                setDownloadUrl(response.url);

                if (parseFloat(appVersion) < parseFloat(response.version)) {
                    setShowUpdatePrompt(true);
                }
            }
        } catch (error) {
            console.error('Version check failed:', error);
        }
    };

    useEffect(() => {
        checkForVersionUpdate();
        console.log('userData From Drawer.js', defultSetting);
    }, []);

    const userImage = userData?.image?.replace('//uploads/student_images', '');

    return (
        <View style={{ ...styles.container, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, marginBottom: 30 }}>
                <Pressable
                    style={{
                        ...styles.profileWrapper,
                        backgroundColor: colors.lightGreen,
                    }}
                >
                    <View style={{ flex: 1.5 }}>
                        {userImage ? (
                            <Image
                                style={styles.profileImage}
                                source={{ uri: userImage }}
                            />
                        ) : (
                            <Image
                                style={styles.profileImage}
                                source={Images.fatherImage}
                            />
                        )}
                    </View>

                    <View
                        style={{
                            flex: 3,
                            justifyContent: 'center',
                            marginLeft: 15,
                        }}
                    >
                        <Text
                            numberOfLines={2}
                            style={{
                                ...styles.title,
                                color: colors.text,
                            }}
                        >
                            {userData?.name}
                        </Text>

                        <Text
                            style={{
                                ...TextStyles.subTitle,
                                color: colors.text,
                            }}
                        >
                            {userData?.type === 'student'
                                ? `class. ${userData?.class}(${userData?.section})`
                                : 'Driver'}
                        </Text>
                    </View>
                </Pressable>

                <View
                    style={{
                        paddingLeft: moderateScale(20),
                        paddingVertical: 10,
                        backgroundColor: colors.background,
                    }}
                >
                    <Pressable style={styles.row}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Image
                                source={Images.darkMode}
                                style={{
                                    height: 23,
                                    width: 23,
                                    resizeMode: 'contain',
                                    tintColor: colors.green,
                                }}
                            />

                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: moderateScale(13),
                                    fontWeight: '500',
                                    opacity: 0.7,
                                }}
                            >
                                Dark Mode
                            </Text>
                        </View>

                        <View>
                            <Switch
                                value={appSetting.darkMode}
                                onValueChange={setDarkMode}
                                thumbColor={appSetting.darkMode ? '#ffffff' : '#f4f3f4'}
                                trackColor={{
                                    false: '#767577',
                                    true: colors.green,
                                }}
                            />
                        </View>
                    </Pressable>

                    {userMenu.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={`${item.name}-${item.id || index}`}
                                onPress={item.onItemPress}
                                activeOpacity={0.75}
                            >
                                <View style={styles.row}>
                                    <View style={styles.icon}>
                                        <View style={{ flex: 1 }}>
                                            <Image
                                                source={item.image}
                                                style={{
                                                    height: 19,
                                                    width: 19,
                                                    resizeMode: 'stretch',
                                                    tintColor: colors.green,
                                                }}
                                            />
                                        </View>

                                        <Text
                                            style={{
                                                ...styles.name,
                                                opacity: 0.7,
                                                color: colors.text,
                                            }}
                                        >
                                            {item.name}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Update section kept from your old code. Enable if needed. */}
                    {/* 
                    <View
                        style={{
                            borderTopWidth: 0.5,
                            borderTopColor: '#a0a0a0',
                            marginTop: 30,
                            marginLeft: -moderateScale(20),
                            paddingLeft: moderateScale(20),
                        }}
                    >
                        <Text
                            style={{
                                marginTop: 10,
                                flex: 1,
                                color: colors.text,
                                opacity: 0.6,
                            }}
                        >
                            Current Version {appVersion}
                        </Text>

                        {showUpdatePrompt && (
                            <Pressable
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: moderateScale(13),
                                        fontWeight: '500',
                                        opacity: 0.7,
                                        marginRight: 10,
                                    }}
                                >
                                    Update Available ({latestVersion})
                                </Text>

                                <Icon name="file-download" size={20} color={colors.green} />
                            </Pressable>
                        )}

                        {isDownloading && (
                            <Modal transparent animationType="fade">
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalCard}>
                                        <Text style={styles.downloadTitle}>
                                            Downloading APK...
                                        </Text>

                                        <Text style={styles.downloadInfo}>
                                            Please wait while we download the latest version...
                                        </Text>

                                        <ProgressBarAndroid
                                            styleAttr="Horizontal"
                                            indeterminate={false}
                                            progress={downloadProgress / 100}
                                            color="#feae35"
                                            style={{ width: '100%', marginTop: 10 }}
                                        />

                                        <Text style={styles.progressText}>
                                            {downloadProgress.toFixed(0)}%
                                        </Text>
                                    </View>
                                </View>
                            </Modal>
                        )}
                    </View> 
                    */}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },

    profileWrapper: {
        flexDirection: 'row',
        backgroundColor: Colors.lightGreen2,
        paddingVertical: 20,
        paddingLeft: 20,
    },

    profileImage: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(60),
        borderColor: '#ffaf8d',
    },

    icon: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    name: {
        color: 'black',
        fontSize: moderateScale(13),
        fontWeight: '500',
        flex: 6,
    },

    title: {
        fontSize: moderateScale(15),
        fontWeight: '500',
        color: Colors.black,
    },

    circle: {
        height: moderateScale(20),
        width: moderateScale(20),
        borderRadius: moderateScale(22),
        backgroundColor: '#474ff1',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: moderateScale(15),
    },

    notiNumber: {
        fontFamily: FONTS.regular,
        fontSize: moderateScale(12),
        color: Colors.btnText,
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalCard: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
    },

    downloadTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#dd4c2f',
        marginBottom: 6,
    },

    downloadInfo: {
        fontSize: 14,
        textAlign: 'center',
        color: '#444',
        marginBottom: 12,
    },

    progressText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});

export default DrawerContent;