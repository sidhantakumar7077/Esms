import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '../../Constants/Colors';
import {Images} from '../../Constants/Images';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {
  maxWidth,
  moderateScale,
  screenHeight,
  screenWidth,
} from '../../Constants/PixelRatio';
import {ScrollView} from 'react-native-gesture-handler';
import Submitted from '../../Components/Homework/Submitted';
import Evaluated from '../../Components/Homework/Evaluated';
import Pending from '../../Components/Homework/Pending';
import {Dropdown} from 'react-native-element-dropdown';
import {useDispatch, useSelector} from 'react-redux';
import UseApi from '../../ApiConfig';
import {useTheme} from '@react-navigation/native';

const Homework = () => {
  const [currTab, setCurrTab] = useState('Pending');
  // const [selectedSub, setSelectedSub] = useState('All');
  const {Request} = UseApi();
  const {colors} = useTheme();
  const {userData, profileData} = useSelector(state => state.User);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [submitedTask, setSubmitTask] = useState([]);
  const [evaluatedTask, setEvaluatedTask] = useState([]);
  const [pendingTask, setPendingTask] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [currSubject, setCurrSubject] = useState(null);

  useEffect(() => {
    getHomeworks('1');
  }, [currSubject]);

  useEffect(() => {
    // getHomeworks('1');
    getHomeworks('3');
  }, []);

  const getHomeworks = async type => {
    setLoading(true);
    console.log('userData----------------------->', userData);

    let params = {
      user_id: userData.id,
      student_session_id: userData.student_session_id,
      sys_type: type,
      class_id: userData?.class_id,
      section_id: userData?.section_id,
      filter_id: currSubject || '',
    };

    console.log('params---------->', params);

    let data;
    try {
      data = await Request('home-work', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }
    console.log(
      'params..,,................................................',
      params,
    );
    console.log('data...', data);
    if (data?.status && data?.data && type == '1') {
      // if(data?.data?.submitted){
      //     setSubmitTask(data?.data?.submitted);
      // }
      // if(data?.data?.evaluated ){
      //     setEvaluatedTask(data?.data?.evaluated);
      // }
      setEvaluatedTask(data?.data?.evaluated);
      setSubmitTask(data?.data?.submitted);
      setPendingTask(data?.data?.pending);
    }
    if (type == '3' && data.status && data?.subject_list?.length > 0) {
      console.log('data...', data);
      setSubjectList(data?.subject_list);
    }
    setLoading(false);
  };

  const onTabPress = tabName => {
    setCurrTab(tabName);
  };

  return (
    <View>
      <BackHeader
        title="Homework"
        onBackIconPress={() => {
          NavigationService.navigate('Home');
        }}
      />
      <ScrollView>
        {/* <PanGestureHandler onGestureEvent={()=>console.log('object')}> */}
        <View style={{...styles.main, backgroundColor: colors.background}}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 15,
              width: '90%',
              alignSelf: 'center',
            }}>
            <View style={{flex: 1}}>
              <Text style={{...styles.homeworkText, color: colors.text}}>
                Your Homework is here!
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Image
                source={Images.homeworkColor}
                style={{
                  height: moderateScale(60),
                  width: moderateScale(80),
                  backgroundColor: colors.background,
                  resizeMode: 'contain',
                  // tintColor:colors.background
                  // marginTop:-15
                }}
              />
            </View>
          </View>
          <View style={styles.tabRow}>
            <View style={styles.tabs}>
              <Pressable
                onPress={() => onTabPress('Pending')}
                style={{
                  ...styles.tab,
                  backgroundColor:
                    currTab == 'Pending' ? Colors.tangerine : Colors.lightGrey,
                }}>
                <Text
                  style={{
                    ...styles.tabText,
                    color: currTab == 'Pending' ? Colors.btnText : Colors.black,
                  }}>
                  Pending
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onTabPress('Submitted')}
                style={{
                  ...styles.tab,
                  backgroundColor:
                    currTab == 'Submitted'
                      ? Colors.tangerine
                      : Colors.lightGrey,
                }}>
                <Text
                  style={{
                    ...styles.tabText,
                    color:
                      currTab == 'Submitted' ? Colors.btnText : Colors.black,
                  }}>
                  Submitted
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onTabPress('Evaluated')}
                style={{
                  ...styles.tab,
                  backgroundColor:
                    currTab == 'Evaluated'
                      ? Colors.tangerine
                      : Colors.lightGrey,
                }}>
                <Text
                  style={{
                    ...styles.tabText,
                    color:
                      currTab == 'Evaluated' ? Colors.btnText : Colors.black,
                  }}>
                  Evaluated
                </Text>
              </Pressable>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                width: '32%',
                borderColor: colors.text,
                borderWidth: 0.5,
              }}>
              {/* <Picker
                                    style={{ width: '98%', height: 30 }}
                                    //  itemStyle={{}}
                                    selectedValue={selectedSub}
                                    onValueChange={(val) => setSelectedSub(val)}
                                >
                                    <Picker.Item label='All' value={'All'} />
                                    <Picker.Item label='Science' value={'Science'} />
                                    <Picker.Item label='Maths' value={'Maths'} />
                                    <Picker.Item label='English' value={'English'} />
                                </Picker> */}
              <Dropdown
                style={{...styles.dropdown}}
                maxHeight={400}
                itemTextStyle={{marginVertical: -8}}
                containerStyle={{
                  width: 'auto',
                  maxWidth: 220,
                  marginLeft: -100,
                }}
                selectedTextStyle={{color: colors.text}}
                selectedTextProps={{numberOfLines: 1}}
                placeholderStyle={{color: colors.text}}
                // itemContainerStyle = {{backgroundColor:colors.background}}
                labelField={'subject'}
                valueField={'subject_id'}
                data={[{subject: 'All', subject_id: ''}, ...subjectList]}
                value={currSubject}
                placeholder="All"
                onChange={item => {
                  console.log('item...', item);
                  setCurrSubject(item.subject_id);
                }}
              />
            </View>
          </View>
          {!loading && (
            <View style={{marginTop: 20}}>
              {currTab == 'Submitted' && (submitedTask || !submitedTask) ? (
                <Submitted data={submitedTask} />
              ) : null}
              {currTab == 'Evaluated' && (evaluatedTask || !evaluatedTask) ? (
                <Evaluated data={evaluatedTask} />
              ) : null}
              {currTab == 'Pending' && (pendingTask || !pendingTask) ? (
                <Pending data={pendingTask} />
              ) : null}
            </View>
          )}
          {loading && (
            <ActivityIndicator
              size={28}
              style={{marginTop: screenHeight / 3}}
            />
          )}
        </View>
        {/* </PanGestureHandler> */}
      </ScrollView>
    </View>
  );
};

export default Homework;

const styles = StyleSheet.create({
  homeworkText: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: Colors.black,
    // marginLeft: 15
  },
  main: {
    backgroundColor: Colors.white2,
    width: '99%',
    alignSelf: 'center',
    maxWidth: maxWidth,
    minHeight: screenHeight,
    marginBottom: 110,
  },
  tabRow: {
    marginTop: 20,
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGrey,
    borderRadius: moderateScale(20),
    // padding:10
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: moderateScale(12),
    color: Colors.black,
    fontWeight: '600',
  },
  dropdown: {
    width: '90%',
  },
});
