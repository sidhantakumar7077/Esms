import React, { useState } from 'react';
import { Modal, View, Image, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../Constants/Colors';

const ImageModal = ({ visible,setVisible, imageUrl, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Pressable onPress={()=>{setVisible(true)}} style={styles.modalContent}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={30} color="black" />
          </Pressable>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
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
    backgroundColor:Colors.white,
    position: 'relative',
    width: '90%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
});

export default ImageModal;