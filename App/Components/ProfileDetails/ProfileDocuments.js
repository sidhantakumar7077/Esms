import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Alert,PermissionsAndroid, Linking, Platform, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { TextStyles } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import { moderateScale, scale } from '../../Constants/PixelRatio';
import { useSelector } from 'react-redux';
import DocViewer from '../CommonComponent/DocViewer';
import {basename} from 'react-native-path';
import RNFS from 'react-native-fs';
import { useTheme } from '@react-navigation/native';
import { downloadFile } from '../../Utils/DownloadFile';
import rndownloadFile from '../../Utils/rndownload';

const { width, height } = Dimensions.get('window');

const ProfileDocuments = () => {
      const {colors} = useTheme();
  const { profileData } = useSelector(state => state.User);
  const [visible, setVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const confirmDownload = (document) => {
 
    handleDownload(document)
  };
  const handleDownload = (document) => {
    setFileUrl(document);
    setVisible(true);
  };

  
  


  

  const downloadDoc = (document) => (
    <Pressable style={styles.statusContainer} onPress={() => confirmDownload(document)}>
      <AntDesign name={'eyeo'} size={scale(15)} color={colors.text} />
    </Pressable>
  );

  return (
    <ScrollView>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
         
            <Text style={{ ...TextStyles.title2, color: Colors.black, width: '50%',textAlign:'center' }}>
              Title
            </Text>
            <Text style={{ ...TextStyles.title2, color: Colors.black, width: '50%' ,textAlign:'center'}}>
            View File
            </Text>
          
        </View>
        {profileData?.document?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[ { width: 100 },{...TextStyles.keyText2,color:colors.text}]}>{item.title}</Text>
            <View style={[ { width: 100 },{...TextStyles.keyText2,color:colors.text}]}>{downloadDoc(item.document)}</View>
          </View>
        ))}
      </View>
      <DocViewer visible={visible} setVisible={setVisible} fileUrl={fileUrl} onClose={() => setVisible(false)} downloadData={(fileUrl)=>{
        rndownloadFile(fileUrl)
        // downloadFile(fileUrl)
         setVisible(false)
      }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGrey,
    padding: 10,
    borderBottomColor:Colors.lightGrey2,
    borderBottomWidth:0.5
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  statusContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 5,
  },
});

export default ProfileDocuments;
