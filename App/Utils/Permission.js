import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";

  export const requestStoragePermission = async (accessType = 'limited') => {
    if (Platform.OS !== 'android') return true;
  
    try {
      if (Platform.Version >= 33) {
        // Android 13+ (API 33+)
        if (accessType === 'limited') {
          // Request access to images, videos, and audio separately
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ]);
  
          console.log('Limited Storage Permissions:', granted);
  
          return (
            granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED ||
            granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED ||
            granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } else if (accessType === 'full') {
          // Request full storage access (Requires Play Store justification)
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
          );
  
          console.log('Full Storage Permission:', granted);
  
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          } else {
            Alert.alert(
              'Permission Required',
              'Full storage access is needed. Please enable it manually in settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ],
              { cancelable: false }
            );
            return false;
          }
        }
      } else if (Platform.Version >= 29) {
        // Android 10-12 (API 29-32)
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
  
        console.log('Storage Permissions:', granted);
  
        return (
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 9 and below (No Scoped Storage)
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
  
        return (
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (error) {
      console.error('Permission Error:', error);
      return false;
    }
  };
  