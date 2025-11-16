import React from 'react';
// import { Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../Screen/Home/Dashboard';
import { Colors } from '../Constants/Colors';
import { moderateScale } from '../Constants/PixelRatio';
import DrawerContent from '../Components/Drawer';
import Homework from '../Screen/Homework/Homework';
import NoticeBoard from '../Screen/NoticeBoard';
import UploadHomework from '../Screen/Homework/UploadHomework';
import ClassTimeTable from '../Screen/ClassTimeTable';
import DailyAssignment from '../Screen/DailyAssignment/DailyAssignment';
import SubmitAssignment from '../Screen/DailyAssignment/SubmitAssignment';
import LessonPlan from '../Screen/LessonPlan/LessonPlan';
import Profile from '../Screen/Profile/Profile';
import Attendance from '../Screen/Attendance/Attendance';
import Fees from '../Screen/Fees/Fees';
import FeesDetails from '../Components/Fees/FeesDetails';
import ProcessingFees from '../Components/Fees/ProcessingFees';
import OflinePayment from '../Components/Fees/OflinePayment';
import IssuedBooks from '../Screen/Library/IssuedBooks';
import LibraryBooks from '../Screen/Library/LibraryBooks';
import Examination from '../Screen/Examination/Examination';
import ExamResult from '../Screen/Examination/ExamResult';
import ExamSchedule from '../Screen/Examination/ExamSchedule';
import TransportRoutes from '../Screen/TransportRoutes';
import LocationTracking from '../Screen/LocationTracking/Index';
import LocationTrackingByDevice from '../Screen/LocationTracking/LocationTrackingByDevice';
import TransportMap from '../Components/TransportMap';
import MyStudents from '../Screen/MyStudents';
import TeacherReview from '../Screen/TeacherReview';
import DownloadCenter from '../Screen/DownloadCenter';
import VideoTutorial from '../Screen/VideoTutorial/Index';
import VideoPlayer from '../Screen/VideoTutorial/VideoPlayer';

// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { NavigationContainer } from '@react-navigation/native';


const Drawer = createDrawerNavigator();
// const NativeStack = createNativeStackNavigator();


// const DrawerStack = () => {
//     return (
//         <NativeStack.Navigator
//             screenOptions={{
//                 headerShown: false
//             }}
//         >
//             <NativeStack.Screen name='AdmissionList' component={AdmissionList} />
//             <NativeStack.Screen name='StudyMeterial' component={StudyMeterial} />
//         </NativeStack.Navigator>
//     )
// }

const DrawerNav = ({ navigation }) => {

    return (
        <Drawer.Navigator
            // initialRouteName="Home"

            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: Colors.tangerine,
                drawerInactiveTintColor: "#ffffff",
                unmountOnBlur: true,
                // drawerType:'slide'
            }}

            drawerContent={props => <DrawerContent {...props} />}
            drawerStyle={{ width: moderateScale(280) }}
            drawerPosition="left"
        >
            <Drawer.Screen name="Home" component={Dashboard} />
            <Drawer.Screen name="Profile" component={Profile} />
            <Drawer.Screen name="Homework" component={Homework} />
            <Drawer.Screen name="UploadHomework" component={UploadHomework} />
            <Drawer.Screen name="NoticeBoard" component={NoticeBoard} />
            <Drawer.Screen name="ClassTimeTable" component={ClassTimeTable} />
            <Drawer.Screen name="DailyAssignment" component={DailyAssignment} />
            <Drawer.Screen name="SubmitAssignment" component={SubmitAssignment} />
            <Drawer.Screen name="LessonPlan" component={LessonPlan} />
            <Drawer.Screen name="Attendance" component={Attendance} />
            <Drawer.Screen name="Fees" component={Fees} />
            <Drawer.Screen name="FeesDetails" component={FeesDetails} />
            <Drawer.Screen name="ProcessingFees" component={ProcessingFees} />
            <Drawer.Screen name="OflinePayment" component={OflinePayment} />
            <Drawer.Screen name="IssuedBooks" component={IssuedBooks} />
            <Drawer.Screen name="LibraryBooks" component={LibraryBooks} />
            <Drawer.Screen name="Examination" component={Examination} />
            <Drawer.Screen name="ExamResult" component={ExamResult} />
            <Drawer.Screen name="ExamSchedule" component={ExamSchedule} />
            <Drawer.Screen name="TransportRoutes" component={TransportRoutes} />
            <Drawer.Screen name="LocationTracking" component={LocationTracking} />
            <Drawer.Screen name="LocationTrackingByDevice" component={LocationTrackingByDevice} />
            <Drawer.Screen name="TransportMap" component={TransportMap} />
            <Drawer.Screen name="MyStudents" component={MyStudents} />
            <Drawer.Screen name="TeacherReview" component={TeacherReview} />
            <Drawer.Screen name="DownloadCenter" component={DownloadCenter} />
            <Drawer.Screen name="VideoTutorial" component={VideoTutorial} />
            <Drawer.Screen name="VideoPlayer" component={VideoPlayer} />

            {/* <Drawer.Screen options={{swipeEnabled:false}} name="Question" component={Question} /> */}

        </Drawer.Navigator>
    )
}

export default DrawerNav;