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
import React, {useState} from 'react';
import {Colors} from '../../Constants/Colors';
import {moderateScale, screenHeight} from '../../Constants/PixelRatio';
import NavigationService from '../../Services/Navigation';
import {Images} from '../../Constants/Images';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';
import {useTheme} from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import rndownloadFile from '../../Utils/rndownload';

let subittedData = [
  {
    subject: 'English (210)',
    homeworkDate: '24/12/23',
    submissionDate: '10/01/2024',
    CreatedBy: '',
    EvalutedBy: '',
    EvalutionDate: '',
    TotalMarks: '',
    MarksObtained: '',
    Note: '',
    Description: 'test',
  },
  {
    subject: 'Hindi (310)',
    homeworkDate: '26/12/23',
    submissionDate: '10/01/2024',
    CreatedBy: '',
    EvalutedBy: '',
    EvalutionDate: '',
    TotalMarks: '',
    MarksObtained: '',
    Note: '',
    Description: 'test',
  },
];

const Submitted = ({data, loading}) => {
  // console.log('loading..',loading);
  const [isDownloading, setIsDownloading] = useState(false);
  const {colors} = useTheme();

  const downloadFile = async item => {
    setIsDownloading(true);
    //  firestore().collection('users').doc(`${userId}`).get().then(documentSnapshot=>console.log('res..........',documentSnapshot.exists));
    // console.log('firestore res......', res);
    let arr = item.url.split('.');
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
      .fetch('GET', item.url, {
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
      {/* <TouchableOpacity
                onPress={() => downloadFile({ext:'pdf',url:'https://morth.nic.in/sites/default/files/dd12-13_0.pdf'})}
                style={{}}>
                <Image
                    source={Images.directDownload}
                    style={{
                        height: moderateScale(30),
                        width: moderateScale(40),
                        marginLeft:10
                        // marginTop:-15
                    }}
                />
            </TouchableOpacity> */}
      {/* {[1] && [1].map((item, index) => { */}
      {data &&
        data.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                ...styles.card,
                backgroundColor: colors.background,
                borderColor: colors.lightBlck,
                borderWidth: 0.5,
              }}>
              <View
                style={{
                  ...styles.titleRow,
                  backgroundColor: colors.lightGreen,
                }}>
                <Text style={{...styles.title, color: colors.text}}>
                  {item.subject_name}
                </Text>
                <View style={{flexDirection: 'row', gap: 20}}>
                  <Pressable
                    style={{
                      ...styles.action,
                      borderColor: Colors.tangerine,
                      backgroundColor: Colors.white2,
                    }}>
                    <Text style={{...styles.tabText, color: Colors.tangerine}}>
                      Submitted
                    </Text>
                  </Pressable>
                  {item.url && !isDownloading && (
                    <TouchableOpacity
                      onPress={() => rndownloadFile(item?.url)}
                      // onPress={() => downloadFile(item)}
                      style={{}}>
                      <Image
                        source={Images.directDownload}
                        style={{
                          height: moderateScale(20),
                          width: moderateScale(20),
                          tintColor: colors.green,
                          marginTop: 5,
                        }}
                      />
                    </TouchableOpacity>
                  )}
                  {isDownloading && <ActivityIndicator size={24} />}

                  {/* <Pressable
                                    onPress={() => NavigationService.navigate('UploadHomework')}
                                    style={{ ...styles.action, borderColor: Colors.Green1, marginLeft: 5 }}>
                                    <Text style={{ ...styles.tabText, color: Colors.btnText }}>Submit</Text>
                                </Pressable> */}
                </View>
              </View>
              <View style={{}}>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text style={{...styles.keyText, color: colors.text}}>
                    Homework Date
                  </Text>
                  <Text style={{...styles.valueText, color: colors.text}}>
                    {item.homework_date}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text style={{...styles.keyText, color: colors.text}}>
                    Submission Date
                  </Text>
                  <Text style={{...styles.valueText, color: colors.text}}>
                    {item.submission_date || 'NA'}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text style={{...styles.keyText, color: colors.text}}>
                    Created By
                  </Text>
                  <Text style={{...styles.valueText, color: colors.text}}>
                    {item.created_by}
                  </Text>
                </View>
                {/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{...styles.keyText,color:colors.text}}>Evaluated By</Text>
                                {console.log('item.evaluated_by...',item.evaluated_by)}
                                <Text style={{...styles.valueText,color:colors.text}}>{item.evaluated_by || 'NA'}</Text>
                            </View> */}
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text style={{...styles.keyText, color: colors.text}}>
                    Evalution Date
                  </Text>
                  <Text style={{...styles.valueText, color: colors.text}}>
                    {item.evaluation_date || 'NA'}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text style={{...styles.keyText, color: colors.text}}>
                    Total Marks
                  </Text>
                  <Text style={{...styles.valueText, color: colors.text}}>
                    {item.total_marks}
                  </Text>
                </View>
                {/* <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{...styles.keyText,color:colors.text}}>Marks Obtained</Text>
                                <Text style={{...styles.valueText,color:colors.text}}>{item.MarksObtained}</Text>
                            </View> */}
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text style={{...styles.keyText, color: colors.text}}>
                    Note
                  </Text>
                  <Text style={{...styles.valueText, color: colors.text}}>
                    {item.note || 'NA'}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  <Text
                    style={{...styles.tabText, fontSize: moderateScale(14)}}>
                    Description
                  </Text>
                  {/* <Text style={{...styles.valueText,color:colors.text}}>{item.description}</Text> */}
                  <RenderHtml source={{html: item.description}} />
                </View>
                <View style={{marginTop: 10,marginBottom:10}}>
                  <Text
                    style={{...styles.tabText, fontSize: moderateScale(14)}}>
                    Message
                  </Text>
                  <Text style={{...styles.valueText,color:colors.text}}>{item.reply?.message}</Text>
                  
                </View>
              </View>
              <Pressable
                                    onPress={() => NavigationService.navigate('UploadHomework',{item,pagename:'submmited'})}
                                    style={{ ...styles.action, borderColor: Colors.Green1, marginLeft: 5}}>
                                    <Text style={{ ...styles.tabText, color: Colors.btnText }}>Modify Details</Text>
                                </Pressable>
                                 {item.reply && (
                                                                         <View style={{flexDirection: 'row', gap: 10,marginTop:10}}>
                                                                           <TouchableOpacity
                                                                             onPress={() =>
                                                                                   Alert.alert(
                                                                                     "Download File",
                                                                                     "Do you want to download this file?",
                                                                                     [
                                                                                       { text: "Cancel", style: "cancel" },
                                                                                       { text: "Download", onPress: () => rndownloadFile(item.reply?.url) }
                                                                                      //  { text: "Download", onPress: () => downloadFile(item.reply) }
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
            </View>
          );
        })}
        

      {!data && (
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
  );
};

export default Submitted;

const styles = StyleSheet.create({
  action: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    // width: moderateScale(80),
    alignItems: 'center',
    backgroundColor: Colors.Green1,
  },
  card: {
    elevation: 10,
    width: '95%',
    borderRadius: 20,
    backgroundColor: Colors.white,
    padding: 10,
    paddingTop: 0,
    alignSelf: 'center',
    marginTop: 15,
  },
  tabText: {
    fontSize: moderateScale(12),
    color: Colors.black,
    fontWeight: '600',
  },
  title: {
    fontSize: moderateScale(14),
    color: Colors.black,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -10,
    backgroundColor: Colors.lightGreen2,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopEndRadius: 15,
    borderTopLeftRadius: 15,
  },
  keyText: {
    fontSize: moderateScale(12),
    // fontWeight:'500',
    color: Colors.black,
    opacity: 0.9,
    flex: 1,
  },
  valueText: {
    fontSize: moderateScale(12),
    color: Colors.black,
    opacity: 0.6,
    flex: 1.5,
  },
});
