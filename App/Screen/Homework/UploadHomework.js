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
import React, {useState} from 'react';
import BackHeader from '../../Components/BackHeader';
import NavigationService from '../../Services/Navigation';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {
  maxWidth,
  moderateScale,
  screenHeight,
  textSize,
} from '../../Constants/PixelRatio';
import {TextStyles, appStyles} from '../../Constants/Fonts';
import Toast from 'react-native-simple-toast';

import DocumentPicker from 'react-native-document-picker'; // types, // isInProgress, // isCancel, // DocumentPickerResponse, // DirectoryPickerResponse,
import ImageCropPicker from 'react-native-image-crop-picker';
import {useSelector} from 'react-redux';
import UseApi from '../../ApiConfig';
import { useRoute, useTheme } from '@react-navigation/native';

const UploadHomework = () => {
  const route = useRoute();
   const { colors } = useTheme();
  const {homeworkId} = route?.params || {};
  // console.log(route.params?.item?.reply?.message)
  const [selectedFile, setSelectedFile] = useState(null);
  const [openModel, setOpenModel] = useState(false);
  const [message, setMessage] = useState(route.params?.item?.reply?.message?route.params?.item?.reply?.message:'');
  const {Request} = UseApi();
  const {userData, profileData} = useSelector(state => state.User);
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({message: '', file: ''});

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
        console.log('photo....', photo);
        setSelectedFile(photo);
        if (errors.file) {
          setErrors(pre => ({...pre, file: ''}));
        }
      })
      .catch(Err => {
        console.log('Picker Error :', Err);
      });
  };
  // const chooseFromDevice = () => {
  //   // console.log('file uploaded');
  //   setOpenModel(false);
  //   DocumentPicker.pickSingle({
  //     presentationStyle: 'fullScreen',
  //   }).then(response => {
  //     console.log('document picked response.........', response);
  //     let temp = response.type.split('/');
  //     let docType = temp[1];
  //     let arr = response.name.split('.');
  //     let name = arr[arr.length - 2];

  //     if (
  //       docType == 'jpeg' ||
  //       docType == 'jpg' ||
  //       docType == 'png' ||
  //       docType == 'pdf' ||
  //       docType == 'doc' ||
  //       docType == 'docx'
  //     ) {
  //       let ftype = '';
  //       if (docType === 'jpeg') {
  //         ftype = 'jpg';
  //       } else {
  //         ftype = docType;
  //       }

  //       let doc = {
  //         uri: response.uri,
  //         type: image.mime,
  //         // name: Math.floor(Math.random() * 100000000 + 1) + '.' + ftype
  //         name: Math.floor(Math.random() * 100000000 + 1) + '.' + ftype,
  //       };

  //       setSelectedFile(doc);
  //       if (errors.file) {
  //         setErrors(pre => ({...pre, file: ''}));
  //       }
  //     } else {
  //       Alert.alert(
  //         `${docType} file can not be uploaded !`,
  //         'Please upload a valid file type.',
  //         [{text: 'Ok', style: 'cancel'}],
  //       );
  //     }
  //   });
  // };
  const chooseFromDevice = async () => {
    try {
      setOpenModel(false);
      
      const response = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
      });
  
      console.log('Document picked response:', response);
  
      if (!response.type || !response.name) {
        Alert.alert('Error', 'Invalid file selection.');
        return;
      }
  
      let temp = response.type.split('/');
      let docType = temp.length > 1 ? temp[1] : '';
  
      const allowedTypes = ['jpeg', 'jpg', 'png', 'pdf', 'doc', 'docx'];
      
      if (allowedTypes.includes(docType)) {
        let ftype = docType === 'jpeg' ? 'jpg' : docType;
        
        let doc = {
          uri: response.uri || response.fileCopyUri, // Use fileCopyUri for iOS
          type: response.type,
          name: `${Math.floor(Math.random() * 100000000 + 1)}.${ftype}`,
        };
  
        setSelectedFile(doc);
  
        if (errors?.file) {
          setErrors(pre => ({ ...pre, file: '' }));
        }
      } else {
        Alert.alert(
          `${docType.toUpperCase()} file cannot be uploaded!`,
          'Please upload a valid file type.',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled document picker');
      } else {
        console.error('Document Picker Error:', err);
        Alert.alert('Error', 'Something went wrong while picking the file.');
      }
    }
  };

  const submitHomework = async () => {
    let err = false;
    // if (!selectedFile) {
    //   setErrors(pre => ({...pre, file: 'Please choose a file !'}));
    //   err = true;
    // }
    // if(message===route.params?.item?.reply?.message){
    //   return
    // }
    if (!message) {
      setErrors(pre => ({...pre, message: 'Please write a message !'}));
      err = true;
    }
    if (err) return;

    setLoading(true);
    // console.log('userData----->', userData);
    // console.log("route.params.pagename...", route.params.pagename);

    let params = {
      user_id: userData.id,
      sys_type: route.params?.pagename==="submmited"|| route.params?.pagename ==="pending"?'2':'1',
      class_id: userData?.class_id,
      section_id: userData?.section_id,
      homework_id: route.params.item.homework_id,
      message: message,
      file: selectedFile,
    };
// console.log(params,'params....');
// return
    try {
      let data = await Request('home-work', 'POST', params);
      console.log('data....sangram', data);
      if (data?.status) {
        Toast.show('Uploaded Successfully !');
        NavigationService.navigate('Homework');
      }
    } catch (err) {
      console.log('err2....', err);
    }

    setLoading(false);
  };

  return (
    <View style={{}}>
      <BackHeader
        title="Upload Homework"
        onBackIconPress={() => {
          NavigationService.navigate('Homework');
        }}
      />
      <ScrollView
        style={{
          backgroundColor: Colors.white2,
          width: '100%',
        }}>
        <View style={styles.main}>
          <View
            style={{flexDirection: 'row', marginTop: 15, alignSelf: 'center'}}>
            <View style={{flex: 1}}>
              <Text style={styles.headerText}>Upload Homework from here!</Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Image
                source={Images.homework3}
                style={{
                  height: moderateScale(60),
                  width: moderateScale(80),
                  // marginTop:-15
                }}
              />
            </View>
          </View>
          <View style={{marginTop: 20}}>
            {/* <TextInput
              placeholder="message"
              style={appStyles.intput}
              value={message}
              onChangeText={text => {
                setMessage(text);
                if (errors.message) {
                  setErrors(pre => ({...pre, message: ''}));
                }
              }}
            /> */}
            <TextInput
                placeholder="message"
                placeholderTextColor="grey"
                numberOfLines={4}
                multiline
                value={message}
                onChangeText={text => {
                setMessage(text);
                if (errors.message) {
                  setErrors(pre => ({...pre, message: ''}));
                }
              }}
                style={[
                    styles.input,
                    {
                    backgroundColor: colors.background,
                    borderColor: colors.lightBlck,
                    color: colors.text,
                    },
                ]}
                />
            {errors.message && (
              <Text style={{color: Colors.red1}}>{errors.message}</Text>
            )}
            <Text style={TextStyles.title}>Documents</Text>
            <Pressable style={styles.uploadFileBox}>
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
                  <Text style={{fontSize: moderateScale(13)}}>
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
              style={{
                ...appStyles.btn,
                width: '100%',
                marginTop: 30,
                height: 50,
              }}
              onPress={submitHomework}
              disabled={loading}>
              <Text style={appStyles.btnText}>
                {loading ? 'Processing...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UploadHomework;

const styles = StyleSheet.create({
  input: {
        marginTop: 10,
        height: 120, 
        width:'100%',
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'black', 
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: textSize(12),
        color: 'black',
        textAlignVertical: 'top',
      },
  main: {
    backgroundColor: Colors.white2,
    width: '92%',
    alignSelf: 'center',
    maxWidth: maxWidth,
    minHeight: screenHeight,
    marginBottom: 80,
  },
  headerText: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: Colors.black,
    // marginLeft: 15
  },
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
});
