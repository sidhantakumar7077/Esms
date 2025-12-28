import { Platform } from 'react-native';
import Toast from 'react-native-simple-toast';
import ReactNativeBlobUtil from 'react-native-blob-util';

const guessMimeType = (ext = '') => {
  const e = ext.toLowerCase();
  if (e === 'pdf') return 'application/pdf';
  if (e === 'png') return 'image/png';
  if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
  if (e === 'doc') return 'application/msword';
  if (e === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (e === 'xls') return 'application/vnd.ms-excel';
  if (e === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return 'application/octet-stream';
};

const rndownloadFile = async (url) => {
  try {
    if (!url) {
      Toast.show('Invalid URL');
      return;
    }

    const date = Date.now();
    const ext = url.split('.').pop()?.split(/\#|\?/)[0] || 'bin';
    const fileName = `download_${date}.${ext}`;
    const mimeType = guessMimeType(ext);

    // iOS: keep in app sandbox (visible only if you share/export)
    if (Platform.OS === 'ios') {
      const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      await ReactNativeBlobUtil.config({ path, fileCache: true }).fetch('GET', url);
      Toast.show('Downloaded (app storage)');
      return;
    }

    // ANDROID:
    // 1) download into app cache
    const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
    const res = await ReactNativeBlobUtil
      .config({ fileCache: true, path: cachePath })
      .fetch('GET', url);

    // 2) publish into public Downloads via MediaStore (shows in file manager)
    await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      {
        name: fileName,
        parentFolder: 'ESMS', // optional subfolder under Downloads
        mimeType,
      },
      'Download',
      res.path()
    );

    // 3) cleanup cache (optional)
    try { await ReactNativeBlobUtil.fs.unlink(res.path()); } catch (_) {}

    Toast.show('Successfully Downloaded!');
  } catch (e) {
    console.log('Download error:', e);
    Toast.show('Download failed!');
  }
};
  
export default rndownloadFile;




// import { Platform, Alert } from 'react-native';
// import Toast from 'react-native-simple-toast';
// import { requestStoragePermission } from '../Utils/Permission';

// const rndownloadFile = async (url) => {
//   if (!url) {
//     console.error('Invalid URL');
//     Toast.show('Invalid URL');
//     return;
//   }

//   const granted = await requestStoragePermission();
//   if (!granted) {
//     Alert.alert('Permission Denied', 'Storage permission is required to download the file.');
//     return;
//   }

//   const date = new Date();
//   const ext = url.split('.').pop().split(/\#|\?/)[0]; // handles URLs with query params
//   const fileName = `download_${date.getTime()}.${ext}`;

//   // Use safe directory for all Android versions
//   let filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

//   // Optional: For Android 10 and below, try saving to public Downloads folder
//   if (Platform.OS === 'android' && Platform.Version < 30) {
//     filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
//   }

//   const downloadOptions = {
//     fromUrl: url,
//     toFile: filePath,
//     begin: () => {
//       console.log('Download started');
//     },
//     progress: (res) => {
//       const progress = Math.floor((res.bytesWritten / res.contentLength) * 100);
//       console.log(`Downloading: ${progress}%`);
//     },
//   };

//   try {
//     const result = await RNFS.downloadFile(downloadOptions).promise;

//     if (result.statusCode === 200) {
//       console.log('File saved to:', filePath);
//       Toast.show('Successfully Downloaded!');
//     } else {
//       console.warn('Failed with status code', result.statusCode);
//       Toast.show('Download failed!');
//     }
//   } catch (error) {
//     console.error('Download error:', error);
//     Toast.show('Download failed!');
//   }
// };

// export default rndownloadFile;






// import RNFetchBlob from 'rn-fetch-blob';
// import Toast from 'react-native-simple-toast';

// const rndownloadFile = (url) => {
//   if (!url) {
//     console.error('Invalid URL');
//     return;
//   }

//   let arr = url.split('.');
//   let ext = arr[arr.length - 1];
//   let { config, fs } = RNFetchBlob;
//   const date = new Date();
  

//   const filePath =
//     fs.dirs.DownloadDir +
//     '/download_' +
//     Math.floor(date.getDate() + date.getSeconds() / 2) +
//     '.' +
//     ext;

//   config({
//     addAndroidDownloads: {
//       useDownloadManager: true,
//       notification: true,
//       path: filePath,
//       description: 'Downloading file...',
//     },
//   })
//     .fetch('GET', url, {})
//     .then(res => {
//       console.log('The file saved to ', res.path());
//       Toast.show('Successfully Downloaded!');
//     })
//     .catch(error => {
//       console.error('Download error:', error);
//       Toast.show('Download failed!')
//     });
// };

// export default rndownloadFile;
