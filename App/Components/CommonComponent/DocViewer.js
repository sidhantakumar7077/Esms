import React from 'react';
import { Modal, StyleSheet, Pressable, View, Text, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../Constants/Colors';
import { WebView } from "react-native-webview";

const DocViewer = ({ visible, setVisible, fileUrl, onClose,downloadData }) => {
  const isPdf = fileUrl?.endsWith('.pdf');

  const handleDownload = () => {
    Alert.alert(
      "Download File",
      "Do you want to download this file?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Download", onPress: () => downloadData(fileUrl) }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={()=>setVisible(true)} style={styles.modalContent}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={30} color="black" />
          </Pressable>
          <View style={styles.webViewContainer}>
            {isPdf ? (
              <WebView
                // source={{ uri: fileUrl }}
                source={{
                  uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent("https://esmsv2.scriptlab.in/uploads/student_documents/76/1739071801-156581008867a82139e8903!Order%20Report%20Slip.pdf")}`,
                }}
                style={styles.webView}
                javaScriptEnabled
                // domStorageEnabled
                startInLoadingState
              />
             
            ) : (
              <Image source={{ uri: fileUrl }} style={styles.image} resizeMode="contain" />
            )}
          </View>
          <Pressable style={styles.downloadButton} onPress={handleDownload}>
            <Icon name="download-outline" size={15} color={Colors.white} />
            <Text style={styles.downloadText}>Download</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    width: '90%',
    height: '80%',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    // position: 'absolute',
    // top: 15,
    // right: 15,
    // zIndex: 10,
    width:'100%',
    alignItems:'flex-end',
    marginRight:20
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  downloadText: {
    color: Colors.white,
    marginLeft: 5,
    fontSize:12,
  },
});

export default DocViewer;
