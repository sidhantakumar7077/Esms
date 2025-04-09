import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {
  maxWidth,
  moderateScale,
  screenHeight,
} from '../../Constants/PixelRatio';
import {TextStyles, appStyles} from '../../Constants/Fonts';

import DocumentPicker from 'react-native-document-picker'; // types, // isInProgress, // isCancel, // DocumentPickerResponse, // DirectoryPickerResponse,
import ImageCropPicker from 'react-native-image-crop-picker';
import {Dropdown} from 'react-native-element-dropdown';
import UseApi from '../../ApiConfig';
import {useSelector} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {useTheme} from '@react-navigation/native';

const SubmitAssignment = props => {
  const [propsData, setPropsData] = useState(props.route.params);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openModel, setOpenModel] = useState(false);

  const [subjectList, setSubjectList] = useState([]);
  const [currSubject, setCurrSubject] = useState(null);
  const [title, setTitle] = useState(propsData?.title || '');
  const [description, setDescription] = useState(propsData?.description || '');
  const {Request} = UseApi();
  const {userData, profileData} = useSelector(state => state.User);
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    subject: '',
    title: '',
    description: '',
    file: '',
  });
  const {colors} = useTheme();

  useEffect(() => {
    getsubjects();
  }, []);

  const getsubjects = async type => {
    // setLoading(true);
    let params = {
      user_id: userData.id,
      sys_type: '3',
      class_id: userData?.class_id,
      section_id: userData?.section_id,
      // filter_id:currSubject || ''
    };

    let data;
    try {
      data = await Request('home-work', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }
    if (data.status && data?.subject_list?.length > 0) {
      console.log('data...', data);
      setSubjectList(data?.subject_list);
      if (propsData?.subject_name) {
        data?.subject_list.forEach((item, index) => {
          if (item.subject == propsData?.subject_name) {
            setCurrSubject(item.subject_group_subjects_id);
          }
        });
      }
    }
    // setLoading(false);
  };

  const submitAssignment = async () => {
    let err = false;

    if (!selectedFile && !propsData.edit) {
      setErrors(pre => ({...pre, file: 'Please choose a file !'}));
      err = true;
    }
    if (!description) {
      setErrors(pre => ({...pre, description: 'Please write a description !'}));
      err = true;
    }
    if (!title) {
      setErrors(pre => ({...pre, title: 'Please write a title !'}));
      err = true;
    }
    if (!currSubject) {
      setErrors(pre => ({...pre, subject: 'Please select a subject !'}));
      err = true;
    }
    if (err) return;

    setLoading(true);
    let params = {
      user_id: userData.id,
      // id: '89',
      type: propsData.edit ? '4' : '2',
      // class_id: userData?.class_id,
      student_session_id: userData?.student_session_id,
      // homework_id: homeworkId,
      description: description,
      title: title,
      subject: currSubject,
      file: selectedFile,
      assignment_id: propsData?.id || '',
    };

    let data;
    try {
      data = await Request('daily-assignment', 'POST', params);
    } catch (err) {
      console.log('err2....', err);
    }

    if (data.status) {
      Toast.show('Uploaded Successfully !');
      NavigationService.navigate('DailyAssignment');
    }
    setLoading(false);
  };

  const takePhoto = () => {
    setOpenModel(false);
    ImageCropPicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        let temp = image.mime.split('/');
        let docType = temp[1];

        let ftype = '';
        if (docType === 'jpeg') {
          ftype = 'jpg';
        } else {
          ftype = docType;
        }

        let photo = {
          uri: image.path,
          type: image.mime,
          name: Math.floor(Math.random() * 100000000 + 1) + '.' + ftype,
        };

        // setState(pre => ({ ...pre, selectedFile: photo }));
        setSelectedFile(photo);
        if (errors.file) {
          setErrors(pre => ({...pre, file: ''}));
        }
      })
      .catch(Err => {
        console.log('Picker Error :', Err);
      });
  };

  const chooseFromDevice = () => {
    // console.log('file uploaded');
    setOpenModel(false);
    DocumentPicker.pickSingle({
      presentationStyle: 'fullScreen',
    }).then(response => {
      console.log('document picked response.........', response);
      let temp = response.type.split('/');
      let docType = temp[1];
      let arr = response.name.split('.');
      let name = arr[arr.length - 2];

      if (
        docType == 'jpeg' ||
        docType == 'jpg' ||
        docType == 'png' ||
        docType == 'pdf' ||
        docType == 'doc' ||
        docType == 'docx'
      ) {
        let ftype = '';
        if (docType === 'jpeg') {
          ftype = 'jpg';
        } else {
          ftype = docType;
        }

        let doc = {
          uri: response.uri,
          type: response.type,
          // name: Math.floor(Math.random() * 100000000 + 1) + '.' + ftype
          name: name + '.' + ftype,
        };

        setSelectedFile(doc);
        if (errors.file) {
          setErrors(pre => ({...pre, file: ''}));
        }
      } else {
        Alert.alert(
          `${docType} file can not be uploaded !`,
          'Please upload a valid file type.',
          [{text: 'Ok', style: 'cancel'}],
        );
      }
    });
  };

  return (
    <View style={{}}>
      <BackHeader
        title={propsData.type + ' Daily Assignment'}
        onBackIconPress={() => {
          NavigationService.navigate('DailyAssignment');
        }}
      />
      <ScrollView
        style={{
          backgroundColor: colors.background,
          width: '100%',
        }}>
        <View style={{...appStyles.main, backgroundColor: colors.background}}>
          <View
            style={{flexDirection: 'row', marginTop: 15, alignSelf: 'center'}}>
            <View style={{flex: 1}}>
              <Text style={{...TextStyles.headerText, color: colors.text}}>
                {propsData.type} Daily Assignment here!
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Image
                source={Images.editAssignment}
                style={{
                  height: moderateScale(70),
                  width: moderateScale(80),
                  // marginTop:-15
                }}
              />
            </View>
          </View>
          <View style={{marginTop: 20}}>
            <Dropdown
              style={{
                ...styles.dropdown,
                borderColor: colors.lightBlck,
                borderWidth: 0.5,
              }}
              maxHeight={screenHeight / 2}
              itemTextStyle={{marginVertical: -8}}
              selectedTextStyle={{color: colors.text}}
              placeholderStyle={{color: colors.text}}
              labelField={'subject'}
              valueField={'subject_group_subjects_id'}
              data={subjectList}
              //   value={}
              value={currSubject}
              placeholder="Select Subject"
              onChange={item => {
                console.log('item...', item);
                setCurrSubject(item.subject_group_subjects_id);
                if (errors.subject) {
                  setErrors(pre => ({...pre, subject: ''}));
                }
              }}
            />
            {errors.subject && (
              <Text style={{color: Colors.red1}}>{errors.subject}</Text>
            )}

            <TextInput
              placeholder="Title"
              style={{
                ...appStyles.intput,
                marginTop: 20,
                borderWidth: 0.5,
                backgroundColor: colors.background,
                borderColor: colors.lightBlck,
                color: colors.text,
              }}
              value={title}
              onChangeText={text => {
                setTitle(text);
                if (errors.title) {
                  setErrors(pre => ({...pre, title: ''}));
                }
              }}
            />
            {errors.title && (
              <Text style={{color: Colors.red1}}>{errors.title}</Text>
            )}

            <TextInput
              placeholder="Description"
              style={{
                ...appStyles.intput,
                marginTop: 20,
                backgroundColor: colors.background,
                borderWidth: 0.5,
                borderColor: colors.lightBlck,
                color: colors.text,
                paddingTop: 0,
                maxHeight: 200,
              }}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={text => {
                setDescription(text);
                if (errors.description) {
                  setErrors(pre => ({...pre, description: ''}));
                }
              }}
            />
            {errors.description && (
              <Text style={{color: Colors.red1}}>{errors.description}</Text>
            )}

            <Text style={{...TextStyles.title, color: colors.text}}>
              Documents
            </Text>
            <Pressable
              style={{
                ...styles.uploadFileBox,
                backgroundColor: colors.background,
                borderColor: colors.text,
                borderWidth: 0.5,
              }}>
              {selectedFile ? (
                <View
                  style={{alignItems: 'center', width: '90%', marginTop: 20}}>
                  {/* <Pressable
                                        onPress={() => setSelectedFile(null)}
                                        style={{ ...styles.tickmarkCircle }}>
                                        <Image
                                            source={Images.close}
                                            style={{
                                                height: 8,
                                                width: 8,
                                                tintColor: 'white'
                                            }}
                                        />
                                    </Pressable> */}

                  {selectedFile.type.split('/')[0] == 'image' && (
                    <Image
                      style={{
                        height: 100,
                        width: 100,
                      }}
                      source={{uri: selectedFile.uri}}
                    />
                  )}

                  {selectedFile.type.split('/')[1] == 'pdf' && (
                    <Image
                      source={Images.pdf}
                      style={{
                        height: 100,
                        width: 100,
                      }}
                    />
                  )}
                  <Text style={{fontWeight: '500'}}>{selectedFile.name} </Text>
                </View>
              ) : (
                <View style={{marginTop: 30, alignItems: 'center'}}>
                  <Image
                    source={Images.uploadfile}
                    style={{
                      height: moderateScale(60),
                      width: moderateScale(65),
                      tintColor: Colors.greyText,
                      // opacity:
                    }}
                  />
                  <Text
                    style={{fontSize: moderateScale(13), color: colors.text}}>
                    Select file to upload
                  </Text>
                </View>
              )}

              {errors.file && (
                <Text style={{color: Colors.red1}}>{errors.file}</Text>
              )}

              <Pressable
                onPress={() => setOpenModel(true)}
                style={{...appStyles.btn, position: 'absolute', bottom: 15}}>
                <Text style={appStyles.btnText}>Choose File</Text>
              </Pressable>
            </Pressable>

            <Modal
              visible={openModel}
              transparent

              // style={{height:300,width:300,backgroundColor:'red',zIndex:10,flex:1}}
            >
              <View style={styles.model}>
                <View style={styles.popup}>
                  <View style={styles.popupHeader}>
                    <Text
                      style={{
                        fontWeight: '500',
                        fontSize: moderateScale(13),
                        color: Colors.white2,
                      }}>
                      Add File
                    </Text>
                    <Pressable onPress={() => setOpenModel(false)}>
                      <Image
                        source={Images.close}
                        style={{
                          height: moderateScale(12),
                          width: moderateScale(12),
                          marginTop: 2,
                          tintColor: Colors.white2,
                        }}
                      />
                    </Pressable>
                  </View>
                  <View style={{padding: 10}}>
                    <TouchableOpacity
                      onPress={() => takePhoto()}
                      style={{flexDirection: 'row', padding: 10}}>
                      <Image
                        source={Images.camera}
                        style={{
                          height: moderateScale(16),
                          width: moderateScale(16),
                          marginTop: 2,
                        }}
                      />
                      <Text
                        style={{
                          ...TextStyles.title,
                          marginLeft: 10,
                          marginTop: 0,
                        }}>
                        Take Photo
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => chooseFromDevice()}
                      style={{flexDirection: 'row', padding: 10}}>
                      <Image
                        source={Images.choose}
                        style={{
                          height: moderateScale(17),
                          width: moderateScale(17),
                          marginTop: 2,
                        }}
                      />
                      <Text
                        style={{
                          ...TextStyles.title,
                          marginLeft: 10,
                          marginTop: 0,
                        }}>
                        Choose form Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              disabled={loading}
              style={{
                ...appStyles.btn,
                width: '100%',
                marginTop: 30,
                height: 50,
              }}
              onPress={submitAssignment}>
              <Text style={appStyles.btnText}>
                {loading ? 'Processing' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubmitAssignment;

const styles = StyleSheet.create({
  // main: {
  //     backgroundColor: Colors.white2,
  //     width: '92%',
  //     alignSelf: 'center',
  //     maxWidth: maxWidth,
  //     minHeight: screenHeight,
  //     marginBottom: 80
  // },
  // headerText: {
  //     fontSize: moderateScale(17),
  //     fontWeight: '600',
  //     color: Colors.black,
  //     // marginLeft: 15
  // },
  uploadFileBox: {
    height: 220,
    borderWidth: 0.4,
    backgroundColor: Colors.lightGrey3,
    marginTop: 15,
    borderRadius: 15,
    alignItems: 'center',
    // justifyContent: 'center',
    elevation: 8,
  },
  model: {
    backgroundColor: Colors.semiTransparent,
    height: screenHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    // height: 200,
    width: moderateScale(250),
    backgroundColor: Colors.white2,
  },
  popupHeader: {
    backgroundColor: Colors.btnBlackBackground,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems:'center'
  },
  dropdown: {
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // width: '32%'
  },
});
