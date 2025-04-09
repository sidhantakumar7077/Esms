import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {Colors} from '../../Constants/Colors';
import {moderateScale, screenHeight} from '../../Constants/PixelRatio';
import {Images} from '../../Constants/Images';
import NavigationService from '../../Services/Navigation';
import {useTheme} from '@react-navigation/native';

// import {WebView} from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import rndownloadFile from '../../Utils/rndownload';

let PendingData = [
  {
    subject: 'Science (220)',
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
    subject: 'Mathematics (310)',
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

const Pending = ({data}) => {
  const {colors} = useTheme();
  return (
    <View>
      {/* {1? [1,2].map((item, index) => { */}
      {data?.length > 0 ? (
        data.map((item, index) => {
          return (
            <View
              style={{
                ...styles.card,
                backgroundColor: colors.background,
                borderColor: colors.lightBlck,
                borderWidth: 0.5,
              }}>
              {/* {console.log('item...',item)} */}
              <View
                style={{
                  ...styles.titleRow,
                  backgroundColor: colors.lightGreen,
                }}>
                <Text style={{...styles.title, color: colors.text}}>
                  {item.subject_name}
                </Text>
                {/* <Text style={styles.title}>ksjslfjlk</Text> */}
                <View style={{flexDirection: 'row'}}>
                  {/* <Pressable style={{ ...styles.action, borderColor: Colors.tangerine, backgroundColor: Colors.white2 }}>
                                    <Text style={{ ...styles.tabText, color: Colors.tangerine }}>Submitted</Text>
                                </Pressable> */}
                  <TouchableOpacity
                    onPress={() =>
                      NavigationService.navigate('UploadHomework', {
                        item,
                        pagename:'pending'
                      })
                    }
                    style={{
                      ...styles.action,
                      borderColor: Colors.Green1,
                      marginLeft: 5,
                    }}>
                    <Text style={{...styles.tabText, color: Colors.btnText}}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                    {item.url  && (
                    <TouchableOpacity
                      onPress={() => rndownloadFile(item?.url)}
                      // onPress={() => downloadFile(item)}
                      style={{marginLeft:10}}>
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
                    {item.submission_date}
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
                                <Text style={{...styles.valueText,color:colors.text}}>{item.EvalutedBy}</Text>
                            </View> */}
                {item.evaluation_date && (
                  <View style={{flexDirection: 'row', marginTop: 10}}>
                    <Text style={{...styles.keyText, color: colors.text}}>
                      Evalution Date
                    </Text>
                    <Text style={{...styles.valueText, color: colors.text}}>
                      {item.evaluation_date}
                    </Text>
                  </View>
                )}
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
                  {/* <Text style={{...styles.valueText, color: colors.text}}>
                    {item.description}
                  </Text> */}
                  <RenderHtml source={{html: item.description}} />
                </View>
              </View>
            </View>
          );
        })
      ) : (
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
      {/* {PendingData.length > 0 ? PendingData.map((item, index) => {
                return (
                    <View style={styles.card}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>{item.subject_name}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <Pressable style={{ ...styles.action, borderColor: Colors.tangerine, backgroundColor: Colors.white2 }}>
                                    <Text style={{ ...styles.tabText, color: Colors.tangerine }}>Submitted</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => NavigationService.navigate('UploadHomework')}
                                    style={{ ...styles.action, borderColor: Colors.Green1, marginLeft: 5 }}>
                                    <Text style={{ ...styles.tabText, color: Colors.btnText }}>Submit</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{}}>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={{...styles.keyText,color:colors.text}}>Homework Date</Text>
                                <Text style={styles.valueText}>{item.homeworkDate}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Submission Date</Text>
                                <Text style={styles.valueText}>{item.submissionDate}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Created By</Text>
                                <Text style={styles.valueText}>{item.CreatedBy}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Evaluated By</Text>
                                <Text style={styles.valueText}>{item.EvalutedBy}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Evalution Date</Text>
                                <Text style={styles.valueText}>{item.EvalutionDate}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Total Marks</Text>
                                <Text style={styles.valueText}>{item.TotalMarks}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Marks Obtained</Text>
                                <Text style={styles.valueText}>{item.MarksObtained}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Text style={styles.keyText}>Note</Text>
                                <Text style={styles.valueText}>{item.Note}</Text>
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ ...styles.tabText, fontSize: moderateScale(14) }}>Description</Text>
                                <Text style={styles.valueText}>{item.Description}</Text>
                            </View>
                        </View>

                    </View>
                )
            }) :
                <View style={{ marginTop: screenHeight / 4, alignItems: 'center' }}>
                    <Image
                        source={Images.NoDataFound}
                        style={{
                            height: moderateScale(60),
                            width: moderateScale(60),
                            opacity: 0.5
                            // marginTop:-15
                        }}
                    />
                    <Text style={{ fontSize: moderateScale(14), marginTop: 10 }}>No records found!</Text>
                </View>
            } */}
    </View>
  );
};

export default Pending;

const styles = StyleSheet.create({
  action: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    width: moderateScale(80),
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
    borderTopRightRadius: 15,
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
